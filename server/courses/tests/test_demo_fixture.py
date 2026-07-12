from django.test import TestCase

from courses.models import Course, Question

DEMO_TOKEN = "d5c10000-0000-4000-8000-000000000001"


class DemoFixtureTests(TestCase):
    # Loads courses/fixtures/dsc1_demo.json exactly as the deploy does.
    fixtures = ["dsc1_demo"]

    def setUp(self):
        self.course = Course.objects.get(share_token=DEMO_TOKEN)

    def test_demo_course_shape(self):
        self.assertEqual(self.course.name, "DSC1 · Deer Stalking Certificate (Demo)")
        self.assertEqual(sorted(e.name for e in self.course.exams.all()), ["Hygiene", "Written"])
        self.assertEqual(Question.objects.filter(course=self.course).count(), 402)

    def test_demo_questions_all_have_valid_answers(self):
        answers = Question.objects.filter(course=self.course).values_list("correct", flat=True)
        self.assertTrue(all(a in {"A", "B", "C", "D"} for a in answers))

    def test_demo_public_via_share_link(self):
        resp = self.client.get(f"/shared/{DEMO_TOKEN}/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Deer Stalking Certificate")
