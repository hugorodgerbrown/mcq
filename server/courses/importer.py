import csv
import io
import re
from dataclasses import dataclass

from django.db import transaction

from .models import Exam, Question, Topic

REQUIRED_HEADERS = ["Section", "Category", "Code", "Question", "A", "B", "C", "D", "Correct"]

# Claude (and humans) rarely name the columns exactly. Map common variants onto
# the canonical headers so a stray "Answer" or "Topic" doesn't reject the whole
# file. Keys are headers reduced to lowercase alphanumerics (see _canon_key).
HEADER_ALIASES = {
    "section": "Section",
    "exam": "Section",
    "paper": "Section",
    "module": "Section",
    "category": "Category",
    "topic": "Category",
    "subtopic": "Category",
    "subject": "Category",
    "code": "Code",
    "id": "Code",
    "ref": "Code",
    "reference": "Code",
    "questioncode": "Code",
    "questionid": "Code",
    "number": "Code",
    "no": "Code",
    "questionnumber": "Code",
    "question": "Question",
    "q": "Question",
    "questiontext": "Question",
    "stem": "Question",
    "prompt": "Question",
    "a": "A",
    "optiona": "A",
    "answera": "A",
    "choicea": "A",
    "b": "B",
    "optionb": "B",
    "answerb": "B",
    "choiceb": "B",
    "c": "C",
    "optionc": "C",
    "answerc": "C",
    "choicec": "C",
    "d": "D",
    "optiond": "D",
    "answerd": "D",
    "choiced": "D",
    "correct": "Correct",
    "answer": "Correct",
    "correctanswer": "Correct",
    "key": "Correct",
    "answerkey": "Correct",
    "correctoption": "Correct",
    "solution": "Correct",
    "explanation": "Explanation",
    "rationale": "Explanation",
    "reason": "Explanation",
    "notes": "Explanation",
    "note": "Explanation",
    "source": "Source",
    "sources": "Source",
    "page": "Source",
    "referencepage": "Source",
}


@dataclass
class RowError:
    row: int
    message: str


class ImportValidationError(Exception):
    def __init__(self, errors: list["RowError"]) -> None:
        self.errors = errors
        super().__init__(f"{len(errors)} row error(s)")


def _canon_key(name: str) -> str:
    # Reduce a header to lowercase alphanumerics for alias lookup:
    # "Correct Answer" → "correctanswer", "Option A" → "optiona".
    return re.sub(r"[^a-z0-9]", "", (name or "").lower())


def _canonical_header(name: str) -> str:
    return HEADER_ALIASES.get(_canon_key(name), (name or "").strip())


def _strip_code_fence(text: str) -> str:
    # Claude often wraps CSV in a Markdown ```csv … ``` block when it can't
    # attach a file. Peel the fence off so the raw CSV underneath parses.
    stripped = text.strip()
    if not stripped.startswith("```"):
        return text
    lines = stripped.splitlines()[1:]  # drop the opening ``` / ```csv line
    if lines and lines[-1].strip().startswith("```"):
        lines = lines[:-1]  # drop the closing fence
    return "\n".join(lines)


def _parse_text(text: str) -> tuple[list[dict], list[RowError]]:
    reader = csv.DictReader(io.StringIO(_strip_code_fence(text)))
    fieldmap = {h: _canonical_header(h) for h in (reader.fieldnames or [])}
    present = set(fieldmap.values())
    missing = [h for h in REQUIRED_HEADERS if h not in present]
    if missing:
        return [], [RowError(1, f"Missing required column(s): {', '.join(missing)}")]
    rows: list[dict] = []
    for raw in reader:
        # None keys collect overflow cells (rows longer than the header) — drop them.
        remapped = {fieldmap.get(k, k): v for k, v in raw.items() if k is not None}
        if any((v or "").strip() for v in remapped.values()):  # skip blank rows
            rows.append(remapped)
    return rows, []


def _read_rows(source) -> tuple[list[dict], list[RowError]]:
    # Accepts an uploaded file (bytes/str .read()) or a pasted CSV string.
    data = source.read() if hasattr(source, "read") else source
    if isinstance(data, bytes):
        data = data.decode("utf-8-sig")
    else:
        data = data.lstrip("\ufeff")  # strip a BOM a paste may carry
    return _parse_text(data)


_CORRECT_BARE_RE = re.compile(r"^\(?([ABCD])\)?[.):]?$")
_CORRECT_LABELLED_RE = re.compile(r"^(?:OPTION|ANSWER|CORRECT)\s*[:.\-]?\s*\(?([ABCD])\)?$")


def _resolve_correct(row: dict) -> str:
    # Normalise whatever went in the Correct column to a bare A–D letter.
    # Handles "B", "b)", "(C)", "Option D", "Answer: A", or the full text of one
    # of the four options. Returns "" when it can't be resolved.
    raw = (row.get("Correct") or "").strip()
    if not raw:
        return ""
    up = raw.upper()
    if up in ("A", "B", "C", "D"):
        return up
    m = _CORRECT_BARE_RE.match(up) or _CORRECT_LABELLED_RE.match(up)
    if m:
        return m.group(1)
    for letter in ("A", "B", "C", "D"):
        option = (row.get(letter) or "").strip()
        if option and option.casefold() == raw.casefold():
            return letter
    return ""


def validate_rows(rows: list[dict]) -> list[RowError]:
    # Phase-one validation. Row numbers: header = 1, first data row = 2.
    errors: list[RowError] = []
    first_seen: dict[str, int] = {}
    for i, row in enumerate(rows, start=2):
        code = (row.get("Code") or "").strip()
        if not code:
            errors.append(RowError(i, "Code is required"))
        elif code in first_seen:
            errors.append(
                RowError(i, f"duplicate Code '{code}' (first seen row {first_seen[code]})")
            )
        else:
            first_seen[code] = i

        if not (row.get("Question") or "").strip():
            errors.append(RowError(i, "Question text is required"))

        for letter in ("A", "B", "C", "D"):
            if not (row.get(letter) or "").strip():
                errors.append(RowError(i, f"option {letter} is empty"))

        if _resolve_correct(row) == "":
            shown = (row.get("Correct") or "").strip()
            errors.append(RowError(i, f"Correct '{shown}' is not one of A, B, C, D"))
    return errors


def _partition_rows(rows: list[dict], errors: list[RowError]) -> tuple[list[dict], int]:
    # Split rows into (valid, skipped_count) using row-level validation errors.
    # Row numbering matches validate_rows: first data row = 2.
    bad = {e.row for e in errors}
    valid = [row for i, row in enumerate(rows, start=2) if i not in bad]
    return valid, len(rows) - len(valid)


def _summarize(course, rows: list[dict]) -> dict:
    existing = set(Question.objects.filter(course=course).values_list("code", flat=True))
    exams: dict[str, dict[str, int]] = {}
    new = updated = 0
    for row in rows:
        section = (row.get("Section") or "").strip()
        category = (row.get("Category") or "").strip()
        exams.setdefault(section, {}).setdefault(category, 0)
        exams[section][category] += 1
        if (row.get("Code") or "").strip() in existing:
            updated += 1
        else:
            new += 1
    exams_list = [
        {"name": s, "topics": [{"name": t, "questions": c} for t, c in topics.items()]}
        for s, topics in exams.items()
    ]
    return {"totals": {"rows": len(rows), "new": new, "updated": updated}, "exams": exams_list}


def preview_rows(course, rows: list[dict], structural: list[RowError] | None = None) -> dict:
    # Build the preview summary from already-parsed rows. Shared by the CSV
    # upload path and the paste path — both normalise to the same row shape
    # (Section, Category, Code, Question, A–D, Correct, Explanation, Source).
    structural = structural or []
    row_errors = validate_rows(rows)
    summary = _summarize(course, rows)
    _, invalid = _partition_rows(rows, row_errors)
    summary["totals"]["valid"] = len(rows) - invalid
    summary["totals"]["invalid"] = invalid
    summary["errors"] = [{"row": e.row, "message": e.message} for e in structural + row_errors]
    return summary


def parse_preview(course, source) -> dict:
    rows, structural = _read_rows(source)
    return preview_rows(course, rows, structural)


@transaction.atomic
def commit_rows(course, rows: list[dict], *, skip_invalid: bool = False) -> dict:
    # Validate and upsert already-parsed rows into Exam/Topic/Question. Shared
    # commit path for the CSV upload and paste flows.
    row_errors = validate_rows(rows)
    skipped = 0
    if row_errors:
        if not skip_invalid:
            raise ImportValidationError(row_errors)
        rows, skipped = _partition_rows(rows, row_errors)
    exams_seen: set[int] = set()
    topics_seen: set[int] = set()
    created = updated = 0
    for row in rows:
        exam, _ = Exam.objects.get_or_create(course=course, name=(row.get("Section") or "").strip())
        exams_seen.add(exam.pk)
        topic, _ = Topic.objects.get_or_create(exam=exam, name=(row.get("Category") or "").strip())
        topics_seen.add(topic.pk)
        _, was_created = Question.objects.update_or_create(
            course=course,
            code=row["Code"].strip(),
            defaults={
                "topic": topic,
                "text": (row.get("Question") or "").strip(),
                "option_a": (row.get("A") or "").strip(),
                "option_b": (row.get("B") or "").strip(),
                "option_c": (row.get("C") or "").strip(),
                "option_d": (row.get("D") or "").strip(),
                "correct": _resolve_correct(row),
                "explanation": (row.get("Explanation") or "").strip(),
                "source": (row.get("Source") or "").strip(),
            },
        )
        created += was_created
        updated += not was_created
    topics_deleted, exams_deleted = _prune_empty(course)
    return {
        "exams": len(exams_seen),
        "topics": len(topics_seen),
        "questions_created": created,
        "questions_updated": updated,
        "questions_skipped": skipped,
        "topics_deleted": topics_deleted,
        "exams_deleted": exams_deleted,
    }


def _prune_empty(course) -> tuple[int, int]:
    # Re-importing upserts questions by (course, code); when a question's
    # Section/Category changes it moves to a new Exam/Topic, which can leave the
    # old ones holding no questions. A Topic (or an Exam) exists only to group
    # questions, so once empty it's dead weight cluttering the dashboard — drop
    # it. Prune topics first, then exams left with no topics.
    topics_deleted, _ = Topic.objects.filter(exam__course=course, questions__isnull=True).delete()
    exams_deleted, _ = Exam.objects.filter(course=course, topics__isnull=True).delete()
    return topics_deleted, exams_deleted


def commit_import(course, source, *, skip_invalid: bool = False) -> dict:
    rows, structural = _read_rows(source)
    # Structural errors (e.g. missing headers) always block — nothing to salvage.
    if structural:
        raise ImportValidationError(structural)
    return commit_rows(course, rows, skip_invalid=skip_invalid)
