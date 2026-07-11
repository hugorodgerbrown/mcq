"""Regenerate the DSC1 demo fixture from the source CSV.

The fixture (courses/fixtures/dsc1_demo.json) seeds a public, read-only demo
course that the marketing homepage links to via its fixed share token. It is
loaded on every deploy with `manage.py loaddata dsc1_demo`; deterministic
primary keys make that an idempotent upsert rather than a duplicate insert.

Run this only when the source CSV changes:

    python manage.py build_dsc1_fixture

Rows whose answer key (the Correct column) is missing or not one of A–D are
skipped and reported — the "Large Game" section of the source CSV currently
has no answers, so it is intentionally left out of the demo.
"""

import csv
import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

# Fixed identifiers so re-loading the fixture upserts the same rows every deploy.
# The PKs sit in a high, reserved range that real (auto-incrementing) users and
# courses will not reach, so loading the demo never clobbers real data.
DEMO_USER_PK = 900_000_000
DEMO_COURSE_PK = 900_000_000
EXAM_PK_BASE = 900_000_000
TOPIC_PK_BASE = 900_010_000
QUESTION_PK_BASE = 900_100_000

# Fixed share token — the homepage demo link (/shared/<token>) depends on this
# staying constant. Keep it in sync with DEMO_SHARE_TOKEN in src/App.jsx.
DEMO_SHARE_TOKEN = "d5c10000-0000-4000-8000-000000000001"

DEMO_COURSE_NAME = "DSC1 · Deer Stalking Certificate (Demo)"
DEMO_COURSE_RUBRIC = (
    "A public demo of the Deer Stalking Certificate (Level 1) revision question "
    "bank. Anyone can study it — practice, flashcards, and mock exams — without "
    "an account."
)
# Fixed timestamps: auto_now/auto_now_add do not fire on loaddata, so the
# fixture must carry explicit values, and they must be constant to stay idempotent.
FIXED_TS = "2024-01-01T00:00:00Z"

CSV_PATH = settings.BASE_DIR.parent / "docs" / "dsc1-all-questions-and-answers.csv"
FIXTURE_PATH = settings.BASE_DIR / "courses" / "fixtures" / "dsc1_demo.json"

VALID_ANSWERS = {"A", "B", "C", "D"}


class Command(BaseCommand):
    help = "Regenerate courses/fixtures/dsc1_demo.json from the source DSC1 CSV."

    def handle(self, *args, **options):
        if not CSV_PATH.exists():
            raise CommandError(f"Source CSV not found: {CSV_PATH}")

        with CSV_PATH.open(encoding="utf-8-sig") as fh:
            rows = list(csv.DictReader(fh))

        objects = [
            {
                "model": "auth.user",
                "pk": DEMO_USER_PK,
                "fields": {
                    "username": "dsc1-demo",
                    "email": "demo@dsc1.local",
                    # Unusable password — the demo account is never logged into.
                    "password": "!",
                    "is_active": True,
                    "is_staff": False,
                    "is_superuser": False,
                    "first_name": "",
                    "last_name": "",
                    "date_joined": FIXED_TS,
                },
            },
            {
                "model": "courses.course",
                "pk": DEMO_COURSE_PK,
                "fields": {
                    "owner": DEMO_USER_PK,
                    "name": DEMO_COURSE_NAME,
                    "rubric": DEMO_COURSE_RUBRIC,
                    "share_token": DEMO_SHARE_TOKEN,
                    "created_at": FIXED_TS,
                    "updated_at": FIXED_TS,
                },
            },
        ]

        # Assign stable PKs by first appearance so regeneration is deterministic.
        exam_pks: dict[str, int] = {}
        topic_pks: dict[tuple[str, str], int] = {}
        skipped = 0
        kept = 0

        for i, row in enumerate(rows, start=2):  # row 1 is the header
            section = (row.get("Section") or "").strip()
            category = (row.get("Category") or "").strip()
            code = (row.get("Code") or "").strip()
            correct = (row.get("Correct") or "").strip().upper()

            if correct not in VALID_ANSWERS:
                skipped += 1
                continue

            if section not in exam_pks:
                exam_pks[section] = EXAM_PK_BASE + len(exam_pks)
                objects.append(
                    {
                        "model": "courses.exam",
                        "pk": exam_pks[section],
                        "fields": {
                            "course": DEMO_COURSE_PK,
                            "name": section,
                            "exam_size": 50,
                            "pass_mark": 80,
                        },
                    }
                )

            topic_key = (section, category)
            if topic_key not in topic_pks:
                topic_pks[topic_key] = TOPIC_PK_BASE + len(topic_pks)
                objects.append(
                    {
                        "model": "courses.topic",
                        "pk": topic_pks[topic_key],
                        "fields": {"exam": exam_pks[section], "name": category},
                    }
                )

            objects.append(
                {
                    "model": "courses.question",
                    "pk": QUESTION_PK_BASE + i,
                    "fields": {
                        "topic": topic_pks[topic_key],
                        "course": DEMO_COURSE_PK,
                        "code": code,
                        "text": (row.get("Question") or "").strip(),
                        "option_a": (row.get("A") or "").strip(),
                        "option_b": (row.get("B") or "").strip(),
                        "option_c": (row.get("C") or "").strip(),
                        "option_d": (row.get("D") or "").strip(),
                        "correct": correct,
                        "explanation": (row.get("Explanation") or "").strip(),
                        "source": (row.get("Source") or "").strip(),
                    },
                }
            )
            kept += 1

        FIXTURE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with FIXTURE_PATH.open("w", encoding="utf-8") as fh:
            json.dump(objects, fh, indent=2, ensure_ascii=False)
            fh.write("\n")

        self.stdout.write(
            self.style.SUCCESS(
                f"Wrote {FIXTURE_PATH.relative_to(settings.BASE_DIR)}: "
                f"{kept} questions across {len(exam_pks)} exams / {len(topic_pks)} topics "
                f"({skipped} rows skipped for missing/invalid answers)."
            )
        )
