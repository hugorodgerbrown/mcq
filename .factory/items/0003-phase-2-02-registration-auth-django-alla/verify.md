# Verify — Phase 2 · 02 · Registration & auth

**Result: GREEN — 7/7 criteria pass, full suite green.** Fresh evidence, branch
`factory/0003-…`.

## Full suite
`.venv/bin/tox` → format/lint/type/tests all OK. `manage.py test api.tests.test_auth`
→ Ran 6 tests, OK. `makemigrations --check` → "No changes detected".

## Acceptance criteria
1. **allauth configured; check+migrate** — tox `check` clean; migrations up to
   date (allauth 65.18.0). ✓
2. **Signup creates user + verification email** — `test_signup_creates_user_and_sends_verification` (user exists, 1 outbox mail). ✓
3. **Verification mandatory / flips** — `test_email_unverified_until_key_confirmed`. ✓
4. **Password reset email** — `test_reset_email_sent_for_existing_user`. ✓
5. **`/api/v1/me/`** — live: anonymous `curl` → `HTTP 403` with body
   `{"error":{"status":403,"detail":{"detail":"Authentication credentials were not provided."}}}`;
   authenticated path asserted by `test_me_returns_user_when_authenticated`
   (200, email echoed). ✓
6. **Themed auth pages** — live: `curl /accounts/login/` → `HTTP 200`, body
   contains `data-auth-base="dsc1"`; `test_login_page_uses_themed_base`. ✓
7. **tox green (12 tests); SPA untouched** — tox green; `git diff --name-only
   main...HEAD -- src index.html vite.config.js package.json` = 0 files. ✓

## Regression check
`curl /api/v1/health/` → `HTTP 200` (item 0001 endpoint intact). The 403 body also
confirms item 0001's JSON error envelope wraps DRF auth failures.
