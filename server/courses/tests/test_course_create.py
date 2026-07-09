from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course


class CourseCreateTests(APITestCase):
    def setUp(self):
        self.u = get_user_model().objects.create_user(
            "o", email="o@x.com", password="pw12345678"
        )

    def test_anonymous_cannot_create(self):
        self.assertEqual(self.client.post("/api/v1/courses/", {"name": "X"}).status_code, 403)

    def test_create_owned_by_caller(self):
        self.client.force_login(self.u)
        resp = self.client.post("/api/v1/courses/", {"name": "My Course", "rubric": "r"})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["name"], "My Course")
        self.assertEqual(Course.objects.get(name="My Course").owner, self.u)

    def test_name_required(self):
        self.client.force_login(self.u)
        self.assertEqual(self.client.post("/api/v1/courses/", {"name": ""}).status_code, 400)
