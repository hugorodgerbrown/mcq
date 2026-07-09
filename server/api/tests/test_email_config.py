import config.settings as loaded_settings
from django.test import SimpleTestCase

from config.settings import _resolve_email_backend

CONSOLE = "django.core.mail.backends.console.EmailBackend"
SMTP = "django.core.mail.backends.smtp.EmailBackend"


class EmailBackendResolveTests(SimpleTestCase):
    def test_console_in_debug(self):
        self.assertEqual(_resolve_email_backend(True, {}), CONSOLE)

    def test_smtp_in_production(self):
        self.assertEqual(_resolve_email_backend(False, {}), SMTP)

    def test_explicit_override_wins(self):
        self.assertEqual(_resolve_email_backend(False, {"EMAIL_BACKEND": CONSOLE}), CONSOLE)
        self.assertEqual(_resolve_email_backend(True, {"EMAIL_BACKEND": SMTP}), SMTP)

    def test_loaded_settings_use_console_under_test_debug(self):
        # tests run with DEBUG defaulting to "1" → console backend loaded.
        # Read the config.settings module directly: Django's test runner
        # rebinds django.conf.settings.EMAIL_BACKEND to the locmem backend,
        # but the module attribute keeps the value resolved at load time.
        self.assertEqual(loaded_settings.EMAIL_BACKEND, CONSOLE)
        self.assertEqual(loaded_settings.EMAIL_PORT, 587)
