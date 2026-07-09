# Spec — Phase 2 · 11 · Email-provider wiring

## Purpose

Make django-allauth's verification and password-reset emails actually send in
production, replacing the dev console backend deferred in item 0003 (source:
docs/factory/prd/dsc1-phase-2.md#In-scope Auth — "Email-provider wiring is a later
implementation ticket"). Backend-only.

## Behavior

- **Environment-driven email backend.** `EMAIL_BACKEND` resolves from the
  environment:
  - default in development (`DEBUG=1`): `django.core.mail.backends.console.EmailBackend`
    (emails printed, none sent) — the current dev behavior is preserved;
  - default in production (`DEBUG=0`): `django.core.mail.backends.smtp.EmailBackend`;
  - an explicit `EMAIL_BACKEND` env var overrides both (e.g. to force console, or a
    provider-specific backend).
- **SMTP settings from env** (used by the smtp backend): `EMAIL_HOST`,
  `EMAIL_PORT` (int, default 587), `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`,
  `EMAIL_USE_TLS` (bool, default true). No credential is committed.
- **`DEFAULT_FROM_EMAIL`** read from env (fallback to the current
  `no-reply@dsc1.local`).
- **Render config**: `render.yaml` declares the email env vars
  (`EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD`/`EMAIL_USE_TLS`/
  `DEFAULT_FROM_EMAIL`) with `sync: false` (operator-provided), so a production
  deploy can send mail once they're set.

## Non-goals

- No specific ESP SDK/integration (SendGrid/Mailgun/etc.) — standard SMTP so any
  provider works; a provider backend can be dropped in via `EMAIL_BACKEND` later.
- No email template redesign — allauth's default emails are fine for now.
- No change to the auth flows themselves (item 0003 owns those).
- No queue/async sending.

## Assumptions (brain gaps)

- **SMTP over TLS on 587 by default** — the common submission setup; overridable by
  env. Reversible.
- **Console backend stays the dev default** so local/test runs never attempt real
  sends (and the existing 0003 tests that assert `mail.outbox` still pass — the
  test runner uses the in-memory backend regardless). Reversible.

## Acceptance criteria

1. With `DEBUG=1` and no `EMAIL_BACKEND` set, `settings.EMAIL_BACKEND` is the
   console backend (dev behavior unchanged).
2. With `DEBUG=0` and no `EMAIL_BACKEND` set, `settings.EMAIL_BACKEND` is the smtp
   backend, and `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD`/
   `EMAIL_USE_TLS` reflect the environment values.
3. An explicit `EMAIL_BACKEND` env var overrides the default in both modes.
4. No email credential is committed; `render.yaml` declares the email env vars with
   `sync: false`.
5. The existing auth email tests (item 0003 — signup verification, password reset)
   still pass (the test runner's in-memory backend captures `mail.outbox`).
6. `tox` green (format, lint, type, tests) with new settings tests; scope confined
   to `server/config/settings.py`, a settings test, and `render.yaml`.
