import json
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from courses.models import Course, Exam, PdfImportJob, Question, Topic

User = get_user_model()

CSV = (
    "Section,Category,Code,Question,A,B,C,D,Correct\n"
    "Written,Law,Q1,What is the law?,a,b,c,d,A\n"
    "Written,Hygiene,Q2,What is hygiene?,a,b,c,d,B\n"
)


def _course_with_questions(owner):
    course = Course.objects.create(owner=owner, name="DSC1")
    exam = Exam.objects.create(course=course, name="Written", exam_size=2, pass_mark=80)
    topic = Topic.objects.create(exam=exam, name="Law")
    Question.objects.create(
        topic=topic,
        course=course,
        code="Q1",
        text="What is the law?",
        option_a="a",
        option_b="b",
        option_c="c",
        option_d="d",
        correct="A",
        explanation="Because.",
        source="s.1",
    )
    return course


class CourseManagementTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user("o@x.com", email="o@x.com", password="pw12345678")
        self.other = User.objects.create_user("e@x.com", email="e@x.com", password="pw12345678")

    def test_course_list_requires_login(self):
        self.assertEqual(self.client.get("/courses/").status_code, 302)

    def test_create_course_redirects_to_import(self):
        self.client.force_login(self.owner)
        resp = self.client.post("/courses/new/", {"name": "My Course", "rubric": ""})
        course = Course.objects.get(name="My Course")
        self.assertRedirects(resp, f"/courses/{course.pk}/import/")
        self.assertEqual(course.owner, self.owner)

    def test_detail_shows_share_link_and_is_owner_scoped(self):
        course = _course_with_questions(self.owner)
        self.client.force_login(self.owner)
        resp = self.client.get(f"/courses/{course.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, str(course.share_token))
        # a different user cannot see it
        self.client.force_login(self.other)
        self.assertEqual(self.client.get(f"/courses/{course.pk}/").status_code, 404)

    def test_exam_settings_update(self):
        course = _course_with_questions(self.owner)
        exam = course.exams.get()
        self.client.force_login(self.owner)
        resp = self.client.post(
            f"/courses/{course.pk}/settings/{exam.pk}/", {"exam_size": 25, "pass_mark": 70}
        )
        self.assertRedirects(resp, f"/courses/{course.pk}/")
        exam.refresh_from_db()
        self.assertEqual((exam.exam_size, exam.pass_mark), (25, 70))


class CsvImportViewTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user("o@x.com", email="o@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="DSC1")
        self.client.force_login(self.owner)

    def _csv(self):
        return SimpleUploadedFile("q.csv", CSV.encode(), content_type="text/csv")

    def test_preview_returns_summary_partial(self):
        resp = self.client.post(
            f"/courses/{self.course.pk}/import/csv/preview/", {"file": self._csv()}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "2 valid")

    def test_commit_creates_questions(self):
        resp = self.client.post(
            f"/courses/{self.course.pk}/import/csv/commit/", {"file": self._csv()}
        )
        self.assertRedirects(resp, f"/courses/{self.course.pk}/")
        self.assertEqual(Question.objects.filter(course=self.course).count(), 2)


class StudyViewTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user("o@x.com", email="o@x.com", password="pw12345678")
        self.other = User.objects.create_user("e@x.com", email="e@x.com", password="pw12345678")
        self.course = _course_with_questions(self.owner)

    def test_study_embeds_question_data(self):
        self.client.force_login(self.owner)
        resp = self.client.get(f"/courses/{self.course.pk}/study/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'id="study-data"')
        self.assertContains(resp, "What is the law?")

    def test_study_is_owner_scoped(self):
        self.client.force_login(self.other)
        self.assertEqual(self.client.get(f"/courses/{self.course.pk}/study/").status_code, 404)

    def test_shared_study_is_public(self):
        resp = self.client.get(f"/shared/{self.course.share_token}/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "What is the law?")
        # anonymous view offers a signup CTA, not an account menu
        self.assertContains(resp, "Get started")

    def test_shared_study_unknown_token_404(self):
        resp = self.client.get("/shared/d5c10000-0000-4000-8000-000000000099/")
        self.assertEqual(resp.status_code, 404)


# ── PDF import (Claude Batch mocked) ──────────────────────────────────────
OUTLINE = {
    "exam_name": "DSC1",
    "topics": [{"name": "Law", "summary": "Law", "start_page": 1, "end_page": 3}],
}
EXTRACTION = {
    "t0": {
        "questions": [
            {
                "code": "Q1",
                "text": "A law question?",
                "option_a": "a",
                "option_b": "b",
                "option_c": "c",
                "option_d": "d",
                "correct": "A",
                "answer_source": "stated",
                "confidence": "high",
                "explanation": "Because.",
                "page": 1,
            }
        ]
    }
}


def _entry(custom_id, obj):
    msg = SimpleNamespace(content=[SimpleNamespace(type="text", text=json.dumps(obj))])
    return SimpleNamespace(
        custom_id=custom_id, result=SimpleNamespace(type="succeeded", message=msg)
    )


class _FakeBatches:
    def __init__(self):
        self._n = 0
        self._results = {}

    def create(self, requests):
        self._n += 1
        if self._n == 1:
            bid = "batch_outline"
            self._results[bid] = [_entry("outline", OUTLINE)]
        else:
            bid = "batch_extract"
            self._results[bid] = [
                _entry(r["custom_id"], EXTRACTION.get(r["custom_id"], {"questions": []}))
                for r in requests
            ]
        return SimpleNamespace(id=bid)

    def retrieve(self, batch_id):
        return SimpleNamespace(processing_status="ended")

    def results(self, batch_id):
        return list(self._results.get(batch_id, []))


def _fake_client():
    return SimpleNamespace(messages=SimpleNamespace(batches=_FakeBatches()))


class PdfImportViewTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user("o@x.com", email="o@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="DSC1")

    def _pdf(self):
        return SimpleUploadedFile("exam.pdf", b"%PDF-1.4 fake", content_type="application/pdf")

    @override_settings(ANTHROPIC_API_KEY="test-key")
    def test_full_flow_through_partials(self):
        with patch("courses.pdf_importer._client", return_value=_fake_client()):
            self.client.force_login(self.owner)
            start = self.client.post(
                f"/courses/{self.course.pk}/import/pdf/start/", {"file": self._pdf()}
            )
            self.assertEqual(start.status_code, 200)
            self.assertContains(start, "Outlining")  # polling partial
            job = PdfImportJob.objects.get(course=self.course)
            url = f"/courses/{self.course.pk}/import/pdf/{job.pk}/"
            # poll 1 → extracting
            self.assertContains(self.client.get(url), "Extracting")
            # poll 2 → ready with a commit button
            ready = self.client.get(url)
            self.assertContains(ready, "Import these questions")
            # commit writes the question
            commit = self.client.post(f"{url}commit/")
            self.assertRedirects(commit, f"/courses/{self.course.pk}/")
            self.assertEqual(Question.objects.filter(course=self.course).count(), 1)

    @override_settings(ANTHROPIC_API_KEY="")
    def test_unconfigured_shows_error_partial(self):
        self.client.force_login(self.owner)
        resp = self.client.post(
            f"/courses/{self.course.pk}/import/pdf/start/", {"file": self._pdf()}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "not configured")
