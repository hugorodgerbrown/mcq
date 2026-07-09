from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course, Exam


class ExamConfigTests(APITestCase):
    def setUp(self):
        U = get_user_model()
        self.owner = U.objects.create_user("o", email="o@x.com", password="pw12345678")
        self.other = U.objects.create_user("e", email="e@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="C")
        self.exam = Exam.objects.create(
            course=self.course, name="Written", exam_size=50, pass_mark=80
        )

    def _url(self, cid=None, eid=None):
        return f"/api/v1/courses/{cid or self.course.pk}/exams/{eid or self.exam.pk}/"

    def test_owner_updates(self):
        self.client.force_login(self.owner)
        resp = self.client.patch(self._url(), {"exam_size": 30, "pass_mark": 60}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pass_mark"], 60)
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.exam_size, 30)
        self.assertEqual(self.exam.pass_mark, 60)

    def test_anon_and_non_owner_forbidden(self):
        self.assertEqual(
            self.client.patch(self._url(), {"pass_mark": 50}, format="json").status_code,
            403,
        )
        self.client.force_login(self.other)
        self.assertEqual(
            self.client.patch(self._url(), {"pass_mark": 50}, format="json").status_code,
            403,
        )

    def test_invalid_values(self):
        self.client.force_login(self.owner)
        self.assertEqual(
            self.client.patch(self._url(), {"exam_size": 0}, format="json").status_code,
            400,
        )
        self.assertEqual(
            self.client.patch(self._url(), {"pass_mark": 150}, format="json").status_code,
            400,
        )
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.pass_mark, 80)  # unchanged
