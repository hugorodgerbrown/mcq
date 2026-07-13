from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from courses import importer
from courses.models import Course, Exam, Question, Topic

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

    def test_recategorising_prunes_emptied_topic(self):
        # Q1 starts in Law; re-import moves it to Ethics. The now-empty Law
        # topic should be deleted rather than linger with 0 questions.
        importer.commit_import(self.course, csv_file(HEADER + ROW))
        self.assertTrue(Topic.objects.filter(name="Law").exists())
        moved = HEADER + "Written,Ethics,Q1,What?,a,b,c,d,A,,\n"
        result = importer.commit_import(self.course, csv_file(moved))
        self.assertFalse(Topic.objects.filter(name="Law").exists())
        self.assertTrue(Topic.objects.filter(name="Ethics").exists())
        self.assertEqual(result["topics_deleted"], 1)

    def test_re_sectioning_prunes_emptied_exam(self):
        # Moving the only question out of the "Written" section leaves that exam
        # with no topics/questions — prune the exam too.
        importer.commit_import(self.course, csv_file(HEADER + ROW))
        moved = HEADER + "Oral,Law,Q1,What?,a,b,c,d,A,,\n"
        result = importer.commit_import(self.course, csv_file(moved))
        self.assertFalse(Exam.objects.filter(name="Written").exists())
        self.assertTrue(Exam.objects.filter(name="Oral").exists())
        self.assertEqual(result["exams_deleted"], 1)

    def test_populated_topics_are_kept(self):
        result = importer.commit_import(self.course, csv_file(HEADER + ROW + ROW2))
        self.assertEqual(result["topics_deleted"], 0)
        self.assertEqual(result["exams_deleted"], 0)
        self.assertEqual(Topic.objects.filter(exam__course=self.course).count(), 1)

    def test_missing_header_blocks_commit(self):
        bad = "Section,Category,Code,Question,A,B,C,D\n" + "Written,Law,Q1,What?,a,b,c,d\n"
        with self.assertRaises(importer.ImportValidationError):
            importer.commit_import(self.course, csv_file(bad))
        self.assertEqual(Question.objects.count(), 0)

    # ── Hardened parsing: the CSV Claude produces rarely matches the contract
    #    exactly, so tolerate the common deviations instead of rejecting the file.
    def test_header_aliases_are_accepted(self):
        # "Topic"→Category, "Answer"→Correct, "Option A"→A, "Q"→Question, etc.
        aliased = (
            "Exam,Topic,ID,Q,Option A,Option B,Option C,Option D,Answer\n"
            "Written,Law,Q1,What?,a,b,c,d,A\n"
        )
        result = importer.commit_import(self.course, csv_file(aliased))
        self.assertEqual(result["questions_created"], 1)
        q = Question.objects.get(course=self.course, code="Q1")
        self.assertEqual((q.topic.name, q.topic.exam.name, q.correct), ("Law", "Written", "A"))

    def test_pasted_string_and_code_fence(self):
        # commit_import accepts a raw string (paste path), Markdown fence and all.
        fenced = "```csv\n" + HEADER + ROW + "```"
        result = importer.commit_import(self.course, fenced)
        self.assertEqual(result["questions_created"], 1)

    def test_correct_answer_variants_normalise(self):
        rows = (
            HEADER
            + "Written,Law,Q1,What?,alpha,beta,gamma,delta,B)\n"  # "B)" → B
            + "Written,Law,Q2,What?,alpha,beta,gamma,delta,Option C\n"  # "Option C" → C
            + "Written,Law,Q3,What?,alpha,beta,gamma,delta,delta\n"  # option text → D
        )
        importer.commit_import(self.course, csv_file(rows))
        got = {q.code: q.correct for q in Question.objects.filter(course=self.course)}
        self.assertEqual(got, {"Q1": "B", "Q2": "C", "Q3": "D"})

    def test_blank_rows_are_ignored(self):
        padded = HEADER + ROW + ",,,,,,,,,,\n" + "\n" + ROW2
        result = importer.commit_import(self.course, csv_file(padded))
        self.assertEqual(result["questions_created"], 2)
