from django.test import TestCase

DEMO_TOKEN = "d5c10000-0000-4000-8000-000000000001"


class DemoFixtureTests(TestCase):
    # Loads courses/fixtures/dsc1_demo.json exactly as the deploy does.
    fixtures = ["dsc1_demo"]

    def test_demo_course_public_via_share_token(self):
        data = self.client.get(f"/api/v1/courses/shared/{DEMO_TOKEN}/").json()
        self.assertEqual(data["name"], "DSC1 · Deer Stalking Certificate (Demo)")
        self.assertEqual(sorted(e["name"] for e in data["exams"]), ["Hygiene", "Written"])
        total = sum(len(t["questions"]) for e in data["exams"] for t in e["topics"])
        self.assertEqual(total, 402)

    def test_demo_questions_all_have_valid_answers(self):
        data = self.client.get(f"/api/v1/courses/shared/{DEMO_TOKEN}/").json()
        for exam in data["exams"]:
            for topic in exam["topics"]:
                for q in topic["questions"]:
                    self.assertIn(q["correct"], {"A", "B", "C", "D"})
