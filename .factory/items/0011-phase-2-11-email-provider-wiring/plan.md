# Plan — Phase 2 · 11 · Email-provider wiring

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Backend-only, `server/` (uv+tox, Python 3.12; `SECRET_KEY=test` for manage.py).
Read `server/config/settings.py` first — it already has `DEBUG`,
`EMAIL_BACKEND = "…console…"`, and `DEFAULT_FROM_EMAIL = "no-reply@dsc1.local"`
(from item 0003). This makes them environment-driven.

---

- [x] **Task 1 — Env-driven email settings** _(covers acceptance criteria 1, 2, 3)_

  In `server/config/settings.py`, replace the fixed `EMAIL_BACKEND` /
  `DEFAULT_FROM_EMAIL` lines with a testable helper + env reads. Place this after
  `DEBUG` is defined:

  ```python
  def _resolve_email_backend(debug: bool, env: "os._Environ[str]") -> str:
      if "EMAIL_BACKEND" in env:
          return env["EMAIL_BACKEND"]
      return (
          "django.core.mail.backends.console.EmailBackend"
          if debug
          else "django.core.mail.backends.smtp.EmailBackend"
      )


  EMAIL_BACKEND = _resolve_email_backend(DEBUG, os.environ)
  EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
  EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
  EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
  EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
  EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "1") == "1"
  DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@dsc1.local")
  ```

  Keep the rest of the allauth/account config unchanged. (If the type annotation
  `"os._Environ[str]"` trips mypy, use `-> str` with `env: dict` typing or
  `os.environ` typing that mypy accepts; the gate is tox green.)

  **Test:** covered by Task 2.

- [x] **Task 2 — Settings tests** _(covers acceptance criteria 1, 2, 3, 5)_

  Add `server/api/tests/test_email_config.py` (unit-tests the pure helper — no
  settings reload needed):

  ```python
  from django.conf import settings
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
          # tests run with DEBUG defaulting to "1" → console backend loaded
          self.assertEqual(settings.EMAIL_BACKEND, CONSOLE)
          self.assertEqual(settings.EMAIL_PORT, 587)
  ```

  The existing item-0003 auth email tests (signup verification, password reset)
  continue to pass because Django's test runner forces the in-memory
  `locmem` backend that captures `mail.outbox` regardless of `EMAIL_BACKEND`
  (criterion 5) — confirm they're green in the full run.

  **Test:** `SECRET_KEY=test uv run python manage.py test api.tests.test_email_config -v 2`
  → 4 pass; and the full suite stays green.

- [x] **Task 3 — Render env vars + tox + scope** _(covers acceptance criteria 4, 6)_

  In repo-root `render.yaml`, add the email env vars to the service's `envVars`
  (all `sync: false` so the operator provides them; no value committed):

  ```yaml
      - key: EMAIL_HOST
        sync: false
      - key: EMAIL_PORT
        sync: false
      - key: EMAIL_HOST_USER
        sync: false
      - key: EMAIL_HOST_PASSWORD
        sync: false
      - key: EMAIL_USE_TLS
        sync: false
      - key: DEFAULT_FROM_EMAIL
        sync: false
  ```

  Backend `uv run ruff format .`, `ruff check --fix .`, fix mypy; `.venv/bin/tox`
  green. Scope: `git diff --name-only main...HEAD` = `server/config/settings.py`,
  `server/api/tests/test_email_config.py`, `render.yaml` (+ plan.md).

  **Test:** `.venv/bin/tox` all OK; grep confirms no email password value is
  committed (only `sync: false` placeholders + env reads).

---

## Self-review — acceptance-criteria coverage
1. console in DEBUG → Task 1 helper, Task 2 `test_console_in_debug` / loaded-settings test.
2. smtp in prod + env SMTP settings → Task 1, Task 2 `test_smtp_in_production`.
3. explicit override → Task 1, Task 2 `test_explicit_override_wins`.
4. no committed credential; render.yaml env vars → Task 3.
5. existing auth email tests still pass → Task 2 (full suite green).
6. tox green; scope settings + test + render.yaml → Task 3.
