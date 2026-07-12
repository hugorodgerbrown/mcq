from django.contrib.auth import get_user_model
from django.test import TestCase

from courses import importer
from courses.importer import validate_rows
from courses.models import Course, Question

H = ["Section", "Category", "Code", "Question", "A", "B", "C", "D", "Correct"]


def rows(*specs: dict) -> list[dict]:
    base = {k: "x" for k in H}
    base["Correct"] = "A"
    return [{**base, **s} for s in specs]


class ValidateRowsUnitTests(TestCase):
    def test_empty_option_flagged(self):
        errs = validate_rows(rows({"Code": "Q1", "C": ""}))
        self.assertTrue(any("option C is empty" in e.message for e in errs))

    def test_correct_must_resolve(self):
        self.assertTrue(
            any(
                "not one of A, B, C, D" in e.message
                for e in validate_rows(rows({"Code": "Q1", "Correct": "Z"}))
            )
        )
        self.assertTrue(
            any(
                "not one of A, B, C, D" in e.message
                for e in validate_rows(rows({"Code": "Q1", "Correct": ""}))
            )
        )

    def test_duplicate_code_flagged_on_each_repeat(self):
        errs = validate_rows(rows({"Code": "Q1"}, {"Code": "Q1"}, {"Code": "Q1"}))
        dupes = [e for e in errs if "duplicate Code 'Q1'" in e.message]
        self.assertEqual(len(dupes), 2)  # rows 3 and 4, first occurrence (row 2) not flagged
        self.assertEqual({e.row for e in dupes}, {3, 4})

    def test_valid_rows_have_no_errors(self):
        self.assertEqual(validate_rows(rows({"Code": "Q1"}, {"Code": "Q2"})), [])


class ValidationBlocksCommitTests(TestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            "o", email="o@x.com", password="pw12345678"
        )
        self.course = Course.objects.create(owner=self.owner, name="C")

    def test_invalid_correct_blocks_commit(self):
        with self.assertRaises(importer.ImportValidationError):
            importer.commit_rows(self.course, rows({"Code": "Q1", "Correct": "Z"}))
        self.assertEqual(Question.objects.count(), 0)

    def test_errors_listed_in_preview(self):
        summary = importer.preview_rows(self.course, rows({"Code": "Q1", "B": ""}))
        self.assertTrue(any("option B is empty" in e["message"] for e in summary["errors"]))

    def test_preview_reports_valid_and_invalid_counts(self):
        summary = importer.preview_rows(
            self.course, rows({"Code": "Q1"}, {"Code": "Q2", "Correct": "Z"})
        )
        self.assertEqual(summary["totals"]["rows"], 2)
        self.assertEqual(summary["totals"]["valid"], 1)
        self.assertEqual(summary["totals"]["invalid"], 1)

    def test_skip_invalid_imports_only_valid_rows(self):
        result = importer.commit_rows(
            self.course,
            rows({"Code": "Q1"}, {"Code": "Q2", "Correct": "Z"}),
            skip_invalid=True,
        )
        self.assertEqual(result["questions_created"], 1)
        self.assertEqual(result["questions_skipped"], 1)
        self.assertEqual(Question.objects.get(course=self.course).code, "Q1")

    def test_invalid_still_blocks_without_skip_flag(self):
        with self.assertRaises(importer.ImportValidationError):
            importer.commit_rows(self.course, rows({"Code": "Q1"}, {"Code": "Q2", "Correct": "Z"}))
        self.assertEqual(Question.objects.count(), 0)
