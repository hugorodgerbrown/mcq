import json
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

from courses.models import Course, PdfImportJob, Question

OUTLINE = {
    "exam_name": "DSC1",
    "topics": [
        {"name": "Law", "summary": "Law questions", "start_page": 1, "end_page": 3},
        {"name": "Hygiene", "summary": "Hygiene questions", "start_page": 4, "end_page": 6},
    ],
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
    },
    "t1": {
        "questions": [
            {
                "code": "",  # missing code — importer path must still get a unique one
                "text": "A hygiene question?",
                "option_a": "a",
                "option_b": "b",
                "option_c": "c",
                "option_d": "d",
                "correct": "B",
                "answer_source": "inferred",  # not stated in the doc → flagged for review
                "confidence": "low",
                "explanation": "Best guess.",
                "page": 4,
            }
        ]
    },
}


def _entry(custom_id, obj):
    msg = SimpleNamespace(content=[SimpleNamespace(type="text", text=json.dumps(obj))])
    return SimpleNamespace(
        custom_id=custom_id, result=SimpleNamespace(type="succeeded", message=msg)
    )


class _FakeBatches:
    """In-memory stand-in for client.messages.batches, always 'ended'."""

    def __init__(self, outline, extraction):
        self.outline = outline
        self.extraction = extraction
        self._n = 0
        self._results = {}

    def create(self, requests):
        self._n += 1
        if self._n == 1:
            bid = "batch_outline"
            self._results[bid] = [_entry("outline", self.outline)]
        else:
            bid = "batch_extract"
            self._results[bid] = [
                _entry(r["custom_id"], self.extraction.get(r["custom_id"], {"questions": []}))
                for r in requests
            ]
        return SimpleNamespace(id=bid)

    def retrieve(self, batch_id):
        return SimpleNamespace(processing_status="ended")

    def results(self, batch_id):
        return list(self._results.get(batch_id, []))


def _fake_client(outline=OUTLINE, extraction=EXTRACTION):
    return SimpleNamespace(messages=SimpleNamespace(batches=_FakeBatches(outline, extraction)))


class PdfImportTests(APITestCase):
    def setUp(self):
        U = get_user_model()
        self.owner = U.objects.create_user("o", email="o@x.com", password="pw12345678")
        self.other = U.objects.create_user("e", email="e@x.com", password="pw12345678")
        self.course = Course.objects.create(owner=self.owner, name="DSC1")

    def _upload(self):
        return SimpleUploadedFile("exam.pdf", b"%PDF-1.4 fake", content_type="application/pdf")

    @override_settings(ANTHROPIC_API_KEY="test-key")
    def test_full_flow(self):
        fake = _fake_client()
        with patch("courses.pdf_importer._client", return_value=fake):
            self.client.force_login(self.owner)
            # Start → outlining
            res = self.client.post(
                f"/api/v1/courses/{self.course.pk}/import/pdf/", {"file": self._upload()}
            )
            self.assertEqual(res.status_code, 201)
            job_id = res.json()["id"]
            self.assertEqual(res.json()["status"], "outlining")

            url = f"/api/v1/courses/{self.course.pk}/import/pdf/{job_id}/"
            # Poll 1 → outline batch ended → extract batch submitted → extracting
            self.assertEqual(self.client.get(url).json()["status"], "extracting")
            # Poll 2 → extract batch ended → ready, with preview + review
            ready = self.client.get(url).json()
            self.assertEqual(ready["status"], "ready")
            summary = ready["summary"]
            self.assertEqual(summary["totals"]["rows"], 2)
            self.assertEqual(summary["totals"]["invalid"], 0)
            names = sorted(e["name"] for e in summary["exams"])
            self.assertEqual(names, ["DSC1"])
            # One answer was inferred / low-confidence → surfaced for review
            self.assertEqual(len(summary["review"]), 1)
            self.assertEqual(summary["review"][0]["answer_source"], "inferred")

            # The PDF blob is cleared once extraction is done
            self.assertEqual(PdfImportJob.objects.get(pk=job_id).pdf_b64, "")

            # Commit → questions written through the shared importer path
            commit = self.client.post(f"{url}commit/")
            self.assertEqual(commit.status_code, 200)
            self.assertEqual(commit.json()["questions_created"], 2)
            self.assertEqual(Question.objects.filter(course=self.course).count(), 2)
            self.assertEqual(PdfImportJob.objects.get(pk=job_id).status, "committed")

    @override_settings(ANTHROPIC_API_KEY="test-key")
    def test_owner_scoped(self):
        with patch("courses.pdf_importer._client", return_value=_fake_client()):
            self.client.force_login(self.other)
            res = self.client.post(
                f"/api/v1/courses/{self.course.pk}/import/pdf/", {"file": self._upload()}
            )
            self.assertEqual(res.status_code, 403)

    @override_settings(ANTHROPIC_API_KEY="test-key")
    def test_empty_outline_errors(self):
        fake = _fake_client(outline={"exam_name": "X", "topics": []})
        with patch("courses.pdf_importer._client", return_value=fake):
            self.client.force_login(self.owner)
            job_id = self.client.post(
                f"/api/v1/courses/{self.course.pk}/import/pdf/", {"file": self._upload()}
            ).json()["id"]
            url = f"/api/v1/courses/{self.course.pk}/import/pdf/{job_id}/"
            data = self.client.get(url).json()
            self.assertEqual(data["status"], "error")
            self.assertIn("No multiple-choice questions", data["error"])

    @override_settings(ANTHROPIC_API_KEY="")
    def test_unconfigured_returns_400(self):
        # No key and no mock — start_job raises PdfImportError, surfaced as 400.
        self.client.force_login(self.owner)
        res = self.client.post(
            f"/api/v1/courses/{self.course.pk}/import/pdf/", {"file": self._upload()}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("not configured", res.json()["errors"][0]["message"])
