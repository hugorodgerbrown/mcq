from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from courses.models import Course, Exam, Question, Topic

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

    def test_import_page_offers_prompt_and_paste(self):
        resp = self.client.get(f"/courses/{self.course.pk}/import/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Copy prompt")
        self.assertContains(resp, 'name="pasted"')
        self.assertContains(resp, "claude.ai/new")

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

    def test_preview_accepts_pasted_text(self):
        resp = self.client.post(f"/courses/{self.course.pk}/import/csv/preview/", {"pasted": CSV})
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "2 valid")

    def test_commit_accepts_pasted_text(self):
        resp = self.client.post(f"/courses/{self.course.pk}/import/csv/commit/", {"pasted": CSV})
        self.assertRedirects(resp, f"/courses/{self.course.pk}/")
        self.assertEqual(Question.objects.filter(course=self.course).count(), 2)

    def test_empty_submission_is_reported(self):
        resp = self.client.post(f"/courses/{self.course.pk}/import/csv/preview/", {})
        self.assertContains(resp, "Upload a CSV or paste one first.")


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
