"""PDF → questions extraction using Claude, driven by the Batch API.

Flow (all Django-request steps are quick control-plane calls; the minutes-long
inference happens on Anthropic's batch infrastructure):

    start_job()            upload → submit stage-1 "outline" batch (1 request)
    advance()  [poll]      outline ended → submit stage-2 "extract" batch (N reqs)
    advance()  [poll]      extract ended → normalise rows + flag inferred answers
    commit                 reviewed rows go through the shared CSV importer path

The extractor emits the exact row shape the CSV importer consumes, so the
preview/commit code and UI are reused. Answers the document does not state are
marked ``answer_source="inferred"`` with a confidence and surfaced for human
review before anything is written.
"""

import base64
import json

from django.conf import settings

from .models import PdfImportJob

# ── Structured-output schemas ───────────────────────────────────────────────
# json_schema constraints: objects need additionalProperties:false + required;
# no min/max/length keywords (unsupported by structured outputs).

OUTLINE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "exam_name": {"type": "string"},
        "topics": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {"type": "string"},
                    "summary": {"type": "string"},
                    "start_page": {"type": "integer"},
                    "end_page": {"type": "integer"},
                },
                "required": ["name", "summary", "start_page", "end_page"],
            },
        },
    },
    "required": ["exam_name", "topics"],
}

QUESTIONS_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "code": {"type": "string"},
                    "text": {"type": "string"},
                    "option_a": {"type": "string"},
                    "option_b": {"type": "string"},
                    "option_c": {"type": "string"},
                    "option_d": {"type": "string"},
                    "correct": {"type": "string", "enum": ["A", "B", "C", "D"]},
                    "answer_source": {"type": "string", "enum": ["stated", "inferred"]},
                    "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                    "explanation": {"type": "string"},
                    "page": {"type": "integer"},
                },
                "required": [
                    "code",
                    "text",
                    "option_a",
                    "option_b",
                    "option_c",
                    "option_d",
                    "correct",
                    "answer_source",
                    "confidence",
                    "explanation",
                    "page",
                ],
            },
        },
    },
    "required": ["questions"],
}

_OUTLINE_PROMPT = (
    "You are given an exam study PDF. Identify the exam's name and split its "
    "multiple-choice questions into topics (sections). Return the exam name and "
    "a list of topics, each with a short summary and the page range where that "
    "topic's questions appear. Only include topics that actually contain "
    "multiple-choice questions; do not invent topics."
)


def _extract_prompt(exam_name: str, topic: dict) -> str:
    return (
        f"This PDF is the exam '{exam_name}'. Extract every multiple-choice "
        f"question that belongs to the topic '{topic.get('name', '')}' "
        f"(around pages {topic.get('start_page')}-{topic.get('end_page')}). "
        "Each question must have exactly four options A-D. Only extract "
        "questions actually present in the document — never invent a question, "
        "an option, or a topic. If the document explicitly states the correct "
        "answer (an answer key, a marked/bold option, etc.), use it and set "
        "answer_source='stated'. If the correct answer is NOT stated in the "
        "document, choose the best answer from expert knowledge, set "
        "answer_source='inferred', and set confidence honestly (high/medium/low). "
        "Give a brief explanation and the source page number for each question."
    )


class PdfImportError(Exception):
    """Raised when PDF import cannot proceed (misconfiguration, empty result)."""


# ── Anthropic client (lazy; mockable in tests) ──────────────────────────────


def _client():
    key = settings.ANTHROPIC_API_KEY
    if not key:
        raise PdfImportError("PDF import is not configured (ANTHROPIC_API_KEY is unset).")
    from anthropic import Anthropic

    return Anthropic(api_key=key)


def _message_params(pdf_b64: str, prompt: str, schema: dict) -> dict:
    # A single structured-output request with the PDF inlined as base64 (no beta
    # header needed) and the answer constrained to `schema`.
    return {
        "model": settings.PDF_IMPORT_MODEL,
        "max_tokens": 16000,
        "thinking": {"type": "adaptive"},
        "output_config": {
            "effort": "high",
            "format": {"type": "json_schema", "schema": schema},
        },
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    }


def _json_from_message(message) -> dict | None:
    # Structured output arrives as JSON in the (last) text block; adaptive
    # thinking may prepend thinking blocks, which we skip.
    for block in getattr(message, "content", []) or []:
        if getattr(block, "type", None) == "text":
            try:
                return json.loads(block.text)
            except (ValueError, TypeError):
                return None
    return None


# ── Job lifecycle ───────────────────────────────────────────────────────────


def start_job(course, filename: str, pdf_bytes: bytes) -> PdfImportJob:
    max_bytes = settings.PDF_IMPORT_MAX_BYTES
    if len(pdf_bytes) > max_bytes:
        raise PdfImportError(
            f"PDF is too large ({len(pdf_bytes) // (1024 * 1024)} MB). "
            f"Maximum is {max_bytes // (1024 * 1024)} MB."
        )
    pdf_b64 = base64.b64encode(pdf_bytes).decode("ascii")
    job = PdfImportJob.objects.create(
        course=course,
        filename=filename,
        pdf_b64=pdf_b64,
        status=PdfImportJob.Status.OUTLINING,
    )
    batch = _client().messages.batches.create(
        requests=[
            {
                "custom_id": "outline",
                "params": _message_params(pdf_b64, _OUTLINE_PROMPT, OUTLINE_SCHEMA),
            }
        ]
    )
    job.outline_batch_id = batch.id
    job.save(update_fields=["outline_batch_id", "updated_at"])
    return job


def _batch_ended(batch_id: str) -> bool:
    batch = _client().messages.batches.retrieve(batch_id)
    return getattr(batch, "processing_status", None) == "ended"


def _submit_extract_batch(job: PdfImportJob, outline: dict) -> str:
    exam_name = outline.get("exam_name") or "Imported exam"
    requests = [
        {
            "custom_id": f"t{i}",
            "params": _message_params(
                job.pdf_b64, _extract_prompt(exam_name, topic), QUESTIONS_SCHEMA
            ),
        }
        for i, topic in enumerate(outline.get("topics") or [])
    ]
    batch = _client().messages.batches.create(requests=requests)
    return batch.id


def _unique_code(raw: str, topic_idx: int, q_idx: int, used: set[str]) -> str:
    code = (raw or "").strip() or f"PDF-{topic_idx + 1}-{q_idx + 1}"
    base, n = code, 2
    while code in used:
        code = f"{base}-{n}"
        n += 1
    used.add(code)
    return code


def _collect_extraction(job: PdfImportJob) -> tuple[list[dict], list[dict]]:
    exam_name = job.outline.get("exam_name") or "Imported exam"
    topics = job.outline.get("topics") or []
    by_id = {
        entry.custom_id: entry for entry in _client().messages.batches.results(job.extract_batch_id)
    }
    rows: list[dict] = []
    review: list[dict] = []
    used: set[str] = set()
    for i, topic in enumerate(topics):
        entry = by_id.get(f"t{i}")
        if entry is None or entry.result.type != "succeeded":
            continue
        data = _json_from_message(entry.result.message) or {}
        topic_name = topic.get("name") or "General"
        for j, q in enumerate(data.get("questions") or []):
            code = _unique_code(q.get("code"), i, j, used)
            inferred = q.get("answer_source") == "inferred"
            page = q.get("page")
            source = f"PDF p.{page}" if page else "PDF"
            if inferred:
                source += " · answer inferred"
            rows.append(
                {
                    "Section": exam_name,
                    "Category": topic_name,
                    "Code": code,
                    "Question": q.get("text", ""),
                    "A": q.get("option_a", ""),
                    "B": q.get("option_b", ""),
                    "C": q.get("option_c", ""),
                    "D": q.get("option_d", ""),
                    "Correct": q.get("correct", ""),
                    "Explanation": q.get("explanation", ""),
                    "Source": source,
                }
            )
            if inferred or q.get("confidence") == "low":
                review.append(
                    {
                        "code": code,
                        "topic": topic_name,
                        "text": q.get("text", ""),
                        "correct": q.get("correct", ""),
                        "answer_source": q.get("answer_source", ""),
                        "confidence": q.get("confidence", ""),
                        "page": page,
                    }
                )
    return rows, review


def advance(job: PdfImportJob) -> PdfImportJob:
    """Advance the job's state machine by one quick step. Safe to call on every poll."""
    try:
        if job.status == PdfImportJob.Status.OUTLINING:
            if not _batch_ended(job.outline_batch_id):
                return job
            results = list(_client().messages.batches.results(job.outline_batch_id))
            entry = results[0] if results else None
            outline = (
                _json_from_message(entry.result.message)
                if entry is not None and entry.result.type == "succeeded"
                else None
            )
            if not outline or not (outline.get("topics") or []):
                return _fail(job, "No multiple-choice questions were found in the PDF.")
            job.outline = outline
            job.extract_batch_id = _submit_extract_batch(job, outline)
            job.status = PdfImportJob.Status.EXTRACTING
            job.save(update_fields=["outline", "extract_batch_id", "status", "updated_at"])
            return job

        if job.status == PdfImportJob.Status.EXTRACTING:
            if not _batch_ended(job.extract_batch_id):
                return job
            rows, review = _collect_extraction(job)
            if not rows:
                return _fail(job, "No questions could be extracted from the PDF.")
            job.rows = rows
            job.review = review
            job.pdf_b64 = ""  # reclaim the blob; both batches are done
            job.status = PdfImportJob.Status.READY
            job.save(update_fields=["rows", "review", "pdf_b64", "status", "updated_at"])
            return job
    except PdfImportError as exc:
        return _fail(job, str(exc))

    return job


def _fail(job: PdfImportJob, message: str) -> PdfImportJob:
    job.status = PdfImportJob.Status.ERROR
    job.error = message
    job.pdf_b64 = ""
    job.save(update_fields=["status", "error", "pdf_b64", "updated_at"])
    return job
