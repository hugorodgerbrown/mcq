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
    # Structural validation only; item 0005 hardens (options non-empty,
    # Correct resolves, Code unique in file). Row numbers: header=1, first data=2.
    errors: list[RowError] = []
    for i, row in enumerate(rows, start=2):
        if not (row.get("Code") or "").strip():
            errors.append(RowError(i, "Code is required"))
        if not (row.get("Question") or "").strip():
            errors.append(RowError(i, "Question text is required"))
    return errors


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


def parse_preview(course, file) -> dict:
    rows, errors = _read_rows(file)
    errors = errors + validate_rows(rows)
    summary = _summarize(course, rows)
    summary["errors"] = [{"row": e.row, "message": e.message} for e in errors]
    return summary


@transaction.atomic
def commit_import(course, file) -> dict:
    rows, errors = _read_rows(file)
    errors = errors + validate_rows(rows)
    if errors:
        raise ImportValidationError(errors)
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
    }
