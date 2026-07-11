import csv
import io
from dataclasses import dataclass

from django.db import transaction

from .models import Exam, Question, Topic

REQUIRED_HEADERS = ["Section", "Category", "Code", "Question", "A", "B", "C", "D", "Correct"]


@dataclass
class RowError:
    row: int
    message: str


class ImportValidationError(Exception):
    def __init__(self, errors: list["RowError"]) -> None:
        self.errors = errors
        super().__init__(f"{len(errors)} row error(s)")


def _read_rows(file) -> tuple[list[dict], list[RowError]]:
    data = file.read()
    if isinstance(data, bytes):
        data = data.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(data))
    headers = reader.fieldnames or []
    missing = [h for h in REQUIRED_HEADERS if h not in headers]
    if missing:
        return [], [RowError(1, f"Missing required column(s): {', '.join(missing)}")]
    return list(reader), []


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

        correct = (row.get("Correct") or "").strip().upper()
        if correct not in ("A", "B", "C", "D"):
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
    # upload path and the PDF extraction path — both normalise to the same row
    # shape (Section, Category, Code, Question, A–D, Correct, Source).
    structural = structural or []
    row_errors = validate_rows(rows)
    summary = _summarize(course, rows)
    _, invalid = _partition_rows(rows, row_errors)
    summary["totals"]["valid"] = len(rows) - invalid
    summary["totals"]["invalid"] = invalid
    summary["errors"] = [{"row": e.row, "message": e.message} for e in structural + row_errors]
    return summary


def parse_preview(course, file) -> dict:
    rows, structural = _read_rows(file)
    return preview_rows(course, rows, structural)


@transaction.atomic
def commit_rows(course, rows: list[dict], *, skip_invalid: bool = False) -> dict:
    # Validate and upsert already-parsed rows into Exam/Topic/Question. Shared
    # commit path for CSV and PDF imports.
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
        exam, _ = Exam.objects.get_or_create(course=course, name=row["Section"].strip())
        exams_seen.add(exam.pk)
        topic, _ = Topic.objects.get_or_create(exam=exam, name=row["Category"].strip())
        topics_seen.add(topic.pk)
        _, was_created = Question.objects.update_or_create(
            course=course,
            code=row["Code"].strip(),
            defaults={
                "topic": topic,
                "text": row["Question"].strip(),
                "option_a": row["A"],
                "option_b": row["B"],
                "option_c": row["C"],
                "option_d": row["D"],
                "correct": (row["Correct"] or "").strip().upper(),
                "explanation": (row.get("Explanation") or "").strip(),
                "source": (row.get("Source") or "").strip(),
            },
        )
        created += was_created
        updated += not was_created
    return {
        "exams": len(exams_seen),
        "topics": len(topics_seen),
        "questions_created": created,
        "questions_updated": updated,
        "questions_skipped": skipped,
    }


def commit_import(course, file, *, skip_invalid: bool = False) -> dict:
    rows, structural = _read_rows(file)
    # Structural errors (e.g. missing headers) always block — nothing to salvage.
    if structural:
        raise ImportValidationError(structural)
    return commit_rows(course, rows, skip_invalid=skip_invalid)
