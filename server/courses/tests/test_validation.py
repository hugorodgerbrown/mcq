from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from courses.importer import validate_rows
from courses.models import Course, Question

H = ["Section", "Category", "Code", "Question", "A", "B", "C", "D", "Correct"]


def rows(*specs: dict) -> list[dict]:
    base = {k: "x" for k in H}
    base["Correct"] = "A"
    return [{**base, **s} for s in specs]


class ValidateRowsUnitTests(APITestCase):
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


HEADER = ",".join(H) + "\n"


class ValidationBlocksCommitTests(APITestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            "o", email="o@x.com", password="pw12345678"
        )
        self.course = Course.objects.create(owner=self.owner, name="C")
        self.client.force_login(self.owner)

    def _post(self, phase, body):
        f = SimpleUploadedFile("c.csv", body.encode(), content_type="text/csv")
        return self.client.post(f"/api/v1/courses/{self.course.pk}/import/{phase}/", {"file": f})

    def test_invalid_correct_blocks_commit(self):
        body = HEADER + "S,Cat,Q1,Text,a,b,c,d,Z\n"
        resp = self._post("commit", body)
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.json()["errors"])
        self.assertEqual(Question.objects.count(), 0)

    def test_errors_listed_in_preview(self):
        body = HEADER + "S,Cat,Q1,Text,a,,c,d,A\n"  # option B empty
        resp = self._post("preview", body)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(any("option B is empty" in e["message"] for e in resp.json()["errors"]))

    def test_preview_reports_valid_and_invalid_counts(self):
        body = HEADER + "S,Cat,Q1,Ok,a,b,c,d,A\n" + "S,Cat,Q2,Bad,a,b,c,d,Z\n"
        totals = self._post("preview", body).json()["totals"]
        self.assertEqual(totals["rows"], 2)
        self.assertEqual(totals["valid"], 1)
        self.assertEqual(totals["invalid"], 1)

    def _skip_body(self):
        return HEADER + "S,Cat,Q1,Ok,a,b,c,d,A\n" + "S,Cat,Q2,Bad,a,b,c,d,Z\n"

    def test_skip_invalid_imports_only_valid_rows(self):
        resp = self.client.post(
            f"/api/v1/courses/{self.course.pk}/import/commit/",
            {
                "file": SimpleUploadedFile(
                    "c.csv", self._skip_body().encode(), content_type="text/csv"
                ),
                "skip_invalid": "true",
            },
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["questions_created"], 1)
        self.assertEqual(resp.json()["questions_skipped"], 1)
        self.assertEqual(Question.objects.filter(course=self.course).count(), 1)
        self.assertEqual(Question.objects.get(course=self.course).code, "Q1")

    def test_invalid_still_blocks_without_skip_flag(self):
        resp = self._post("commit", self._skip_body())
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(Question.objects.count(), 0)
