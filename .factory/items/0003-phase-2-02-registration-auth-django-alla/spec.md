# Spec — Phase 2 · 02 · Registration & auth (django-allauth)

## Purpose

Self-service accounts so authors can own private courses: email/password
registration, email verification, and password reset via `django-allauth`, plus
session-based auth for the JSON API the SPA calls. Builds on the server (0001)
and data model (0002); unblocks course ownership (0006/0007) and email wiring
(0011) (source: docs/factory/prd/dsc1-phase-2.md#In-scope Auth; brain/constraints.md
Phase 2).

## Behavior

- `django-allauth` added and configured for **email-as-identifier** (no separate
  username), email/password only (no social providers).
- **Registration**: a visitor signs up with email + password; an account is
  created.
- **Email verification mandatory**: `ACCOUNT_EMAIL_VERIFICATION = "mandatory"`.
  A verification email is generated on signup. In dev/test the email backend is
  the console backend (emails printed, not sent); a real provider is item 0011.
- **Password reset**: standard allauth reset flow — request generates a reset
  email with a tokenised link; the link sets a new password.
- **Login / logout**: session established on login, cleared on logout.
- **API session auth**: DRF configured with `SessionAuthentication`. A new
  protected endpoint `GET /api/v1/me/` returns the authenticated user's id and
  email; anonymous requests get 403. This is the wiring that proves the SPA
  (same origin) can make authenticated API calls with the session cookie.
- **Auth pages are server-rendered** allauth templates, styled to the app's dark
  theme (see design/choice.md) — this keeps auth usable without JS; the study
  app remains the JS-first SPA.
- URLs: allauth mounted at `/accounts/`; `/api/v1/me/` under the existing API.

## Non-goals

- No real email provider / SMTP — item 0011 (console backend until then).
- No social/OAuth login, no MFA.
- No custom user model (default `django.contrib.auth.User`, email login via
  allauth settings) — the `Course.owner` FK already targets `AUTH_USER_MODEL`.
- No SPA-embedded auth forms or React auth screens — auth is server-rendered.
- No course-ownership enforcement in API views yet (course endpoints are 0006).

## Assumptions (brain gaps)

- **Session auth, not tokens.** The single-origin deploy (Django serves the SPA)
  makes the session cookie the simplest, CSRF-protected mechanism (source:
  #In-scope; #Open-questions Deploy shape). Reversible: DRF can add
  TokenAuthentication later without removing sessions.
- **Default `User` with email login (no custom user model).** The PRD doesn't
  require a custom user, and 0002 already shipped `AUTH_USER_MODEL`-based FKs.
  Reversible only at cost — flagged; acceptable while nothing is live.
- **`/api/v1/me/` added as the auth-wiring probe.** A minimal authenticated
  endpoint is the smallest thing that proves session auth end-to-end. Reversible.

## Acceptance criteria

1. `django-allauth` is installed and in `INSTALLED_APPS`; `manage.py check` and
   `migrate` succeed (allauth + account tables).
2. A POST to the signup flow with email + password creates a `User`; a
   verification email is produced (assert via console backend / `django.core.mail`
   outbox in tests).
3. Email verification is mandatory: a freshly-signed-up, unverified user is not
   treated as verified (allauth `EmailAddress.verified is False`); verifying the
   emailed key flips it to True.
4. Password reset: requesting a reset for an existing email produces a reset
   email; following the token sets a new password the user can log in with.
5. `GET /api/v1/me/` returns 200 with `{"id", "email"}` for an authenticated
   session and 403 for an anonymous request.
6. Auth pages render server-side and extend a dark-theme base matching
   `design-system.md` tokens (inspection + a test asserting the login page
   returns 200 and contains the themed base marker).
7. `tox` green (format, lint, type, tests) including new auth tests; SPA files
   (`src/`, `index.html`, `vite.config.js`, `package.json`) unchanged.
