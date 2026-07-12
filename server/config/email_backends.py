"""Email backend that sends via Resend's HTTPS API instead of SMTP.

Render blocks outbound SMTP ports (25/465/587), so Django's SMTP backend hangs
on connect until the gunicorn worker times out — surfacing as a 500 on signup /
login. Resend's REST API runs over HTTPS (443), which is not blocked.

On any failure we log a human-readable ERROR before re-raising, so the cause
(missing key, unverified sender domain, API rejection) is obvious in the logs.
"""

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class ResendEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages) -> int:
        if not email_messages:
            return 0
        api_key = settings.RESEND_API_KEY
        if not api_key:
            logger.error(
                "Missing EMAIL configuration: RESEND_API_KEY is not set. "
                "Please check the Resend settings (RESEND_API_KEY, or "
                "EMAIL_HOST_PASSWORD when EMAIL_HOST is smtp.resend.com)."
            )
            if not self.fail_silently:
                raise ValueError("RESEND_API_KEY is not configured")
            return 0

        sent = 0
        for message in email_messages:
            try:
                self._send_one(message, api_key)
                sent += 1
            except Exception as exc:
                sender = message.from_email or settings.DEFAULT_FROM_EMAIL
                logger.error(
                    "Failed to send email via Resend (to=%s, subject=%r): %s. "
                    "Check the Resend API key and that the sender domain for %s "
                    "is verified in Resend.",
                    ", ".join(message.to),
                    message.subject,
                    self._describe(exc),
                    sender,
                )
                if not self.fail_silently:
                    raise
        return sent

    def _send_one(self, message, api_key: str) -> None:
        payload: dict = {
            "from": message.from_email or settings.DEFAULT_FROM_EMAIL,
            "to": list(message.to),
            "subject": message.subject,
            "text": message.body,
        }
        if message.cc:
            payload["cc"] = list(message.cc)
        if message.bcc:
            payload["bcc"] = list(message.bcc)
        if message.reply_to:
            payload["reply_to"] = list(message.reply_to)
        # Include an HTML alternative if one is attached.
        for content, mimetype in getattr(message, "alternatives", None) or []:
            if mimetype == "text/html":
                payload["html"] = content
        if getattr(message, "content_subtype", "plain") == "html":
            payload["html"] = message.body
            payload.pop("text", None)

        request = urllib.request.Request(
            RESEND_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        # timeout well under the gunicorn worker timeout so a slow API fails
        # fast with a logged error rather than aborting the worker.
        with urllib.request.urlopen(request, timeout=15) as response:
            response.read()

    @staticmethod
    def _describe(exc: Exception) -> str:
        if isinstance(exc, urllib.error.HTTPError):
            try:
                body = exc.read().decode("utf-8", "replace")
            except Exception:
                body = ""
            return f"HTTP {exc.code} {body}".strip()
        return str(exc)
