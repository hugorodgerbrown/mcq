# Plan — Phase 2 · 02 · Registration & auth (django-allauth)

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Builds on the server (0001) + data model (0002). Toolchain unchanged (uv + tox,
Python 3.12); run via `uv run …` / `.venv/bin/…` from `server/`, `SECRET_KEY=test`
in env for manage.py. Design per `design/choice.md`.

**allauth version note:** allauth's setting names shift between majors. Pin a
current `django-allauth` in `pyproject.toml`, check the installed version, and use
that version's canonical settings. The code below targets allauth ≥ 65 (the
`ACCOUNT_LOGIN_METHODS` / `ACCOUNT_SIGNUP_FIELDS` API). If the pinned version
differs, adapt setting names to match — the gate is: the behaviors in the spec
work and `tox` is green, not verbatim transcription.

---

- [x] **Task 1 — Install + configure allauth** _(covers acceptance criteria 1, 2, 3)_

  In `server/pyproject.toml` add `"django-allauth>=65,<66"` to `dependencies`,
  then `uv pip install -e '.[dev]'` and `uv lock`.

  In `server/config/settings.py`:
  - Add to `INSTALLED_APPS` (allauth needs sessions, messages, sites):
    `"django.contrib.sessions"`, `"django.contrib.messages"`,
    `"django.contrib.sites"`, `"allauth"`, `"allauth.account"`.
  - Add to `MIDDLEWARE` (order matters): `SessionMiddleware` (after security),
    `AuthenticationMiddleware`, `MessageMiddleware`, and
    `"allauth.account.middleware.AccountMiddleware"` last.
  - `SITE_ID = 1`.
  - `AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend"]`.
  - Account config:
    ```python
    ACCOUNT_LOGIN_METHODS = {"email"}
    ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
    ACCOUNT_EMAIL_VERIFICATION = "mandatory"
    ACCOUNT_UNIQUE_EMAIL = True
    LOGIN_REDIRECT_URL = "/"
    ACCOUNT_LOGOUT_REDIRECT_URL = "/accounts/login/"
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    DEFAULT_FROM_EMAIL = "no-reply@dsc1.local"
    ```
  - Extend `TEMPLATES[0]["OPTIONS"]["context_processors"]` with
    `django.template.context_processors.request`,
    `django.contrib.auth.context_processors.auth`,
    `django.contrib.messages.context_processors.messages`.
  - In `REST_FRAMEWORK`, add
    `"DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"]`.

  Then `SECRET_KEY=test uv run python manage.py migrate`.

  **Test:** `SECRET_KEY=test uv run python manage.py check` exits 0; `migrate`
  creates allauth `account_*` and `django_site` tables (acceptance 1).

- [x] **Task 2 — URLs + `/api/v1/me/` endpoint** _(covers acceptance criteria 5)_

  In `server/config/urls.py` add `path("accounts/", include("allauth.urls"))`.

  In `server/api/views.py` add:
  ```python
  from rest_framework.permissions import IsAuthenticated

  @api_view(["GET"])
  @permission_classes([IsAuthenticated])
  def me(request: Request) -> Response:
      return Response({"id": request.user.id, "email": request.user.email})
  ```
  (add `from rest_framework.decorators import api_view, permission_classes`).
  In `server/api/urls.py` add `path("me/", views.me, name="me")`.

  **Test:** covered by Task 4's `MeEndpointTests`.

- [x] **Task 3 — Themed auth templates** _(covers acceptance criteria 6)_

  Create `server/templates/` and register it:
  `TEMPLATES[0]["DIRS"] = [BASE_DIR / "templates"]` in settings.

  Create `server/templates/account/base.html` — a standalone dark-theme base per
  `design/choice.md` (inline `<style>` with the tokens; a centered `max-width:420px`
  card; `data-auth-base="dsc1"` on `<body>` as the inspectable marker). It should
  provide `{% block content %}` and render `{% if messages %}`.

  Override the allauth templates that the flows use so they extend this base and
  render their form inside the themed card:
  `account/login.html`, `account/signup.html`, `account/logout.html`,
  `account/password_reset.html`, `account/password_reset_from_key.html`,
  `account/email.html`, `account/verification_sent.html`. Keep each minimal:
  `{% extends "account/base.html" %}`, a heading, the allauth form
  (`{{ form.as_p }}` or allauth's field rendering), and a submit button with the
  primary-button style.

  **Test:** covered by Task 4's `AuthPageThemeTests`.

- [x] **Task 4 — Tests** _(covers acceptance criteria 2, 3, 4, 5, 6)_

  Create `server/api/tests/test_auth.py` (uses Django test client + allauth):
  ```python
  from django.contrib.auth import get_user_model
  from django.core import mail
  from django.test import TestCase
  from django.urls import reverse
  from rest_framework import status
  from rest_framework.test import APITestCase


  class SignupVerificationTests(TestCase):
      def test_signup_creates_user_and_sends_verification(self):
          resp = self.client.post(
              reverse("account_signup"),
              {"email": "a@b.com", "password1": "sTrongPass123", "password2": "sTrongPass123"},
          )
          self.assertIn(resp.status_code, (200, 302))
          User = get_user_model()
          self.assertTrue(User.objects.filter(email="a@b.com").exists())
          self.assertEqual(len(mail.outbox), 1)  # verification email (console backend captured)

      def test_email_unverified_until_key_confirmed(self):
          from allauth.account.models import EmailAddress
          self.client.post(
              reverse("account_signup"),
              {"email": "c@d.com", "password1": "sTrongPass123", "password2": "sTrongPass123"},
          )
          ea = EmailAddress.objects.get(email="c@d.com")
          self.assertFalse(ea.verified)
          ea.verified = True
          ea.save()
          self.assertTrue(EmailAddress.objects.get(email="c@d.com").verified)


  class PasswordResetTests(TestCase):
      def test_reset_email_sent_for_existing_user(self):
          get_user_model().objects.create_user("u", email="u@e.com", password="oldPass123")
          resp = self.client.post(reverse("account_reset_password"), {"email": "u@e.com"})
          self.assertIn(resp.status_code, (200, 302))
          self.assertEqual(len(mail.outbox), 1)


  class MeEndpointTests(APITestCase):
      def test_me_requires_auth(self):
          self.assertEqual(self.client.get("/api/v1/me/").status_code, status.HTTP_403_FORBIDDEN)

      def test_me_returns_user_when_authenticated(self):
          get_user_model().objects.create_user("me", email="me@x.com", password="pw12345678")
          self.client.force_login(get_user_model().objects.get(username="me"))
          resp = self.client.get("/api/v1/me/")
          self.assertEqual(resp.status_code, status.HTTP_200_OK)
          self.assertEqual(resp.json()["email"], "me@x.com")


  class AuthPageThemeTests(TestCase):
      def test_login_page_uses_themed_base(self):
          resp = self.client.get(reverse("account_login"))
          self.assertEqual(resp.status_code, 200)
          self.assertContains(resp, 'data-auth-base="dsc1"')
  ```

  **Test:** `SECRET_KEY=test uv run python manage.py test api -v 2` → all auth
  tests pass (plus the existing health test). If a reverse name or POST field
  differs for the pinned allauth version, adjust to that version's names (keep the
  asserted behavior).

- [x] **Task 5 — Full tox green + SPA untouched** _(covers acceptance criteria 7)_

  `uv run ruff format .`, `uv run ruff check --fix .`, fix any mypy issues (type
  env). Confirm `uv.lock` is committed.

  **Test:** `.venv/bin/tox` → format/lint/type/tests all OK (acceptance 7).
  `git diff --name-only main...HEAD -- src index.html vite.config.js package.json`
  → 0 files (SPA untouched).

---

## Self-review — acceptance-criteria coverage
1. allauth installed/configured, check+migrate → Task 1.
2. Signup creates user + verification email → Task 1 config, Task 4 `SignupVerificationTests`.
3. Verification mandatory / flips on confirm → Task 1 config, Task 4 `test_email_unverified_until_key_confirmed`.
4. Password reset → Task 1/2, Task 4 `PasswordResetTests`.
5. `/api/v1/me/` 200 auth / 403 anon → Task 2, Task 4 `MeEndpointTests`.
6. Themed server-rendered auth pages → Task 3, Task 4 `AuthPageThemeTests`.
7. tox green; SPA untouched → Task 5.
