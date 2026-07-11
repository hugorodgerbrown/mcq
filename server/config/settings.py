import os
from collections.abc import Mapping
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = (
    os.environ["SECRET_KEY"]
    if not os.environ.get("DEBUG", "1") == "1"
    else os.environ.get("SECRET_KEY", "dev-insecure-key")
)
DEBUG = os.environ.get("DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
# Render provides the service's public hostname here; trust it automatically so a
# fresh deploy works without a manual ALLOWED_HOSTS value.
_render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if _render_host:
    ALLOWED_HOSTS.append(_render_host)

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.sites",
    "django.contrib.staticfiles",
    "allauth",
    "allauth.account",
    "rest_framework",
    "api",
    "courses",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

# Clickjacking protection (was an X-Frame-Options header on the old static site;
# Render only allows response headers on static services, so it lives here now).
X_FRAME_OPTIONS = "SAMEORIGIN"

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# django-allauth account configuration (email-as-identifier, no username).
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
# "mandatory" (verify before first login), "optional", or "none" (skip). Set
# ACCOUNT_EMAIL_VERIFICATION=none to bypass verification in a test environment.
ACCOUNT_EMAIL_VERIFICATION = os.environ.get("ACCOUNT_EMAIL_VERIFICATION", "mandatory")
ACCOUNT_UNIQUE_EMAIL = True
LOGIN_REDIRECT_URL = "/"
ACCOUNT_LOGOUT_REDIRECT_URL = "/"


EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "1") == "1"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@dsc1.local")

# Resend is sent over its HTTPS API rather than SMTP, because Render blocks
# outbound SMTP ports (the SMTP backend hangs until the worker times out).
# Detected from an explicit RESEND_API_KEY, or from the SMTP vars when they
# point at Resend (EMAIL_HOST=smtp.resend.com, EMAIL_HOST_PASSWORD=the re_… key).
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "") or (
    EMAIL_HOST_PASSWORD if "resend" in EMAIL_HOST.lower() else ""
)


def _resolve_email_backend(
    debug: bool, env: Mapping[str, str], *, resend_key: str, email_host: str
) -> str:
    # An explicit EMAIL_BACKEND always wins. Resend goes over its HTTPS API.
    # Otherwise use SMTP only when an EMAIL_HOST is configured — without one the
    # SMTP backend blocks on a dead socket and crashes signup/login, so fall
    # back to console (verification link printed to the logs) instead of 500ing.
    if "EMAIL_BACKEND" in env:
        return env["EMAIL_BACKEND"]
    if resend_key:
        return "config.email_backends.ResendEmailBackend"
    if debug or not email_host:
        return "django.core.mail.backends.console.EmailBackend"
    return "django.core.mail.backends.smtp.EmailBackend"


EMAIL_BACKEND = _resolve_email_backend(
    DEBUG, os.environ, resend_key=RESEND_API_KEY, email_host=EMAIL_HOST
)

# Anthropic API key for the PDF-to-questions importer. Unset in dev/CI (the
# importer only calls out when a PDF is actually submitted, and tests mock the
# client), provided in production via the environment.
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
# Model + limits for the PDF importer, overridable via the environment.
PDF_IMPORT_MODEL = os.environ.get("PDF_IMPORT_MODEL", "claude-opus-4-8")
PDF_IMPORT_MAX_BYTES = int(os.environ.get("PDF_IMPORT_MAX_BYTES", str(20 * 1024 * 1024)))

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# Single-origin static serving of the built SPA bundle (spa_dist/).
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "spa_dist"] if (BASE_DIR / "spa_dist").exists() else []
STORAGES = {
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
}

REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "api.exceptions.json_exception_handler",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
