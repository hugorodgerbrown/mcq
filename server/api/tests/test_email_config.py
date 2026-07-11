import config.settings as loaded_settings
from django.test import SimpleTestCase

from config.settings import _resolve_email_backend

CONSOLE = "django.core.mail.backends.console.EmailBackend"
SMTP = "django.core.mail.backends.smtp.EmailBackend"
RESEND = "config.email_backends.ResendEmailBackend"


def _resolve(debug, env, *, resend_key="", email_host=""):
    return _resolve_email_backend(debug, env, resend_key=resend_key, email_host=email_host)


class EmailBackendResolveTests(SimpleTestCase):
    def test_console_in_debug(self):
        self.assertEqual(_resolve(True, {}), CONSOLE)

    def test_smtp_in_production_with_host(self):
        self.assertEqual(_resolve(False, {}, email_host="smtp.example.com"), SMTP)

    def test_console_in_production_without_host(self):
        # No SMTP host configured → degrade to console instead of crashing on a
        # dead socket when allauth tries to send a verification email.
        self.assertEqual(_resolve(False, {}), CONSOLE)

    def test_resend_api_when_key_present(self):
        # A Resend key routes to the HTTPS API backend (Render blocks SMTP).
        self.assertEqual(
            _resolve(False, {}, resend_key="re_x", email_host="smtp.resend.com"), RESEND
        )
        self.assertEqual(_resolve(True, {}, resend_key="re_x"), RESEND)

    def test_explicit_override_wins(self):
        self.assertEqual(_resolve(False, {"EMAIL_BACKEND": SMTP}, resend_key="re_x"), SMTP)
        self.assertEqual(_resolve(True, {"EMAIL_BACKEND": SMTP}), SMTP)

    def test_loaded_settings_use_console_under_test_debug(self):
        # tests run with DEBUG defaulting to "1" → console backend loaded.
        # Read the config.settings module directly: Django's test runner
        # rebinds django.conf.settings.EMAIL_BACKEND to the locmem backend,
        # but the module attribute keeps the value resolved at load time.
        self.assertEqual(loaded_settings.EMAIL_BACKEND, CONSOLE)
        self.assertEqual(loaded_settings.EMAIL_PORT, 587)
