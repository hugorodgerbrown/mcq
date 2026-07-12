from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from courses import importer
from courses.models import Course, Question

HEADER = "Section,Category,Code,Question,A,B,C,D,Correct,Explanation,Source\n"
ROW = "Written,Law,Q1,What?,a,b,c,d,A,,\n"
ROW2 = "Written,Law,Q2,Why?,a,b,c,d,B,,\n"


def csv_file(body: str, name: str = "c.csv") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, body.encode("utf-8"), content_type="text/csv")


class ImporterTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.owner = User.objects.create_user("owner", email="o@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="DSC1")

    def test_preview_does_not_write(self):
        summary = importer.parse_preview(self.course, csv_file(HEADER + ROW + ROW2))
        self.assertEqual(
            summary["totals"],
            {"rows": 2, "new": 2, "updated": 0, "valid": 2, "invalid": 0},
        )
        self.assertEqual(Question.objects.count(), 0)

    def test_commit_creates(self):
        result = importer.commit_import(self.course, csv_file(HEADER + ROW + ROW2))
        self.assertEqual(result["questions_created"], 2)
        self.assertEqual(Question.objects.filter(course=self.course).count(), 2)

    def test_reupload_merges_on_code(self):
        importer.commit_import(self.course, csv_file(HEADER + ROW + ROW2))
        # change Q1 answer to C, add Q3; Q2 omitted (must stay, no wipe)
        changed = (
            HEADER + "Written,Law,Q1,What?,a,b,c,d,C,,\n" + "Written,Law,Q3,New?,a,b,c,d,D,,\n"
        )
        importer.commit_import(self.course, csv_file(changed))
        self.assertEqual(Question.objects.filter(course=self.course).count(), 3)  # Q1,Q2,Q3
        self.assertEqual(Question.objects.get(course=self.course, code="Q1").correct, "C")

    def test_missing_header_blocks_commit(self):
        bad = "Section,Category,Code,Question,A,B,C,D\n" + "Written,Law,Q1,What?,a,b,c,d\n"
        with self.assertRaises(importer.ImportValidationError):
            importer.commit_import(self.course, csv_file(bad))
        self.assertEqual(Question.objects.count(), 0)
