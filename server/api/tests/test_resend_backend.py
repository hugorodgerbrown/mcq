import io
import json
import urllib.error
from unittest.mock import patch

from django.core.mail import EmailMessage
from django.test import SimpleTestCase, override_settings

from config.email_backends import ResendEmailBackend


class _FakeResp:
    def __init__(self, body=b"{}"):
        self._body = body

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    def read(self):
        return self._body


@override_settings(RESEND_API_KEY="re_test", DEFAULT_FROM_EMAIL="from@x.com")
class ResendBackendTests(SimpleTestCase):
    def test_sends_over_https_api(self):
        backend = ResendEmailBackend()
        msg = EmailMessage("Verify", "Click here", "from@x.com", ["to@x.com"])
        captured = {}

        def fake_urlopen(request, timeout=None):
            captured["url"] = request.full_url
            captured["auth"] = request.get_header("Authorization")
            captured["payload"] = json.loads(request.data)
            return _FakeResp()

        with patch("config.email_backends.urllib.request.urlopen", side_effect=fake_urlopen):
            sent = backend.send_messages([msg])

        self.assertEqual(sent, 1)
        self.assertEqual(captured["url"], "https://api.resend.com/emails")
        self.assertEqual(captured["auth"], "Bearer re_test")
        self.assertEqual(captured["payload"]["to"], ["to@x.com"])
        self.assertEqual(captured["payload"]["subject"], "Verify")
        self.assertEqual(captured["payload"]["text"], "Click here")

    def test_api_error_logs_readable_message_then_reraises(self):
        backend = ResendEmailBackend()
        msg = EmailMessage("Verify", "Body", "from@x.com", ["to@x.com"])
        err = urllib.error.HTTPError(
            "https://api.resend.com/emails",
            403,
            "Forbidden",
            {},
            io.BytesIO(b'{"message":"domain is not verified"}'),
        )
        with patch("config.email_backends.urllib.request.urlopen", side_effect=err):
            with self.assertLogs("config.email_backends", level="ERROR") as logs:
                with self.assertRaises(urllib.error.HTTPError):
                    backend.send_messages([msg])
        joined = "\n".join(logs.output)
        self.assertIn("Failed to send email via Resend", joined)
        self.assertIn("domain is not verified", joined)


@override_settings(RESEND_API_KEY="")
class ResendMissingKeyTests(SimpleTestCase):
    def test_missing_key_logs_and_raises(self):
        backend = ResendEmailBackend()
        msg = EmailMessage("s", "b", "from@x.com", ["to@x.com"])
        with self.assertLogs("config.email_backends", level="ERROR") as logs:
            with self.assertRaises(ValueError):
                backend.send_messages([msg])
        self.assertIn("Missing EMAIL configuration", "\n".join(logs.output))
