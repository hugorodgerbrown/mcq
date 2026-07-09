from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course, Exam, Question, Topic


class ReadApiTests(APITestCase):
    def setUp(self):
        U = get_user_model()
        self.owner = U.objects.create_user("o", email="o@x.com", password="pw12345678")
        self.other = U.objects.create_user("e", email="e@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="DSC1")
        exam = Exam.objects.create(course=self.course, name="Written", exam_size=50, pass_mark=80)
        topic = Topic.objects.create(exam=exam, name="Law")
        Question.objects.create(
            topic=topic,
            course=self.course,
            code="Q1",
            text="?",
            option_a="a",
            option_b="b",
            option_c="c",
            option_d="d",
            correct="A",
            source="ref",
        )

    def test_course_list_owner_only(self):
        self.assertEqual(self.client.get("/api/v1/courses/").status_code, 403)  # anon
        self.client.force_login(self.other)
        self.assertEqual(self.client.get("/api/v1/courses/").json(), [])  # sees none
        self.client.force_login(self.owner)
        data = self.client.get("/api/v1/courses/").json()
        self.assertEqual([c["name"] for c in data], ["DSC1"])

    def test_content_nested_and_owner_scoped(self):
        self.assertEqual(
            self.client.get(f"/api/v1/courses/{self.course.pk}/content/").status_code, 403
        )
        self.client.force_login(self.other)
        self.assertEqual(
            self.client.get(f"/api/v1/courses/{self.course.pk}/content/").status_code, 403
        )
        self.client.force_login(self.owner)
        data = self.client.get(f"/api/v1/courses/{self.course.pk}/content/").json()
        self.assertEqual(
            data["exams"][0]["topics"][0]["questions"][0]["options"],
            {"A": "a", "B": "b", "C": "c", "D": "d"},
        )
        self.assertEqual(data["exams"][0]["pass_mark"], 80)
