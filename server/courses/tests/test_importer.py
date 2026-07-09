from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, Question

HEADER = "Section,Category,Code,Question,A,B,C,D,Correct,Explanation,Source\n"
ROW = "Written,Law,Q1,What?,a,b,c,d,A,,\n"
ROW2 = "Written,Law,Q2,Why?,a,b,c,d,B,,\n"


def csv_file(body: str, name: str = "c.csv") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, body.encode("utf-8"), content_type="text/csv")


class ImportApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.owner = User.objects.create_user("owner", email="o@x.com", password="pw12345678")
        self.other = User.objects.create_user("other", email="e@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="DSC1")

    def _url(self, phase):
        return f"/api/v1/courses/{self.course.pk}/import/{phase}/"

    def test_preview_does_not_write(self):
        self.client.force_login(self.owner)
        resp = self.client.post(self._url("preview"), {"file": csv_file(HEADER + ROW + ROW2)})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["totals"], {"rows": 2, "new": 2, "updated": 0})
        self.assertEqual(Question.objects.count(), 0)  # nothing written

    def test_commit_creates(self):
        self.client.force_login(self.owner)
        resp = self.client.post(self._url("commit"), {"file": csv_file(HEADER + ROW + ROW2)})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["questions_created"], 2)
        self.assertEqual(Question.objects.filter(course=self.course).count(), 2)

    def test_reupload_merges_on_code(self):
        self.client.force_login(self.owner)
        self.client.post(self._url("commit"), {"file": csv_file(HEADER + ROW + ROW2)})
        # change Q1 answer to C, add Q3; Q2 omitted (must stay, no wipe)
        changed = HEADER + "Written,Law,Q1,What?,a,b,c,d,C,,\n" + "Written,Law,Q3,New?,a,b,c,d,D,,\n"
        resp = self.client.post(self._url("commit"), {"file": csv_file(changed)})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Question.objects.filter(course=self.course).count(), 3)  # Q1,Q2,Q3
        self.assertEqual(Question.objects.get(course=self.course, code="Q1").correct, "C")

    def test_missing_header_blocks_commit(self):
        self.client.force_login(self.owner)
        bad = "Section,Category,Code,Question,A,B,C,D\n" + "Written,Law,Q1,What?,a,b,c,d\n"
        resp = self.client.post(self._url("commit"), {"file": csv_file(bad)})
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.json()["errors"])
        self.assertEqual(Question.objects.count(), 0)

    def test_requires_auth_and_ownership(self):
        # anonymous
        self.assertEqual(
            self.client.post(self._url("preview"), {"file": csv_file(HEADER + ROW)}).status_code,
            status.HTTP_403_FORBIDDEN,
        )
        # non-owner
        self.client.force_login(self.other)
        self.assertEqual(
            self.client.post(self._url("preview"), {"file": csv_file(HEADER + ROW)}).status_code,
            status.HTTP_403_FORBIDDEN,
        )
