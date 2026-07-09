# Verify — Phase 2 · 11 · Email-provider wiring

**Result: GREEN — 6/6 criteria pass.** Backend suite + live settings-resolution
checks (dev, prod, override).

## Suite
`.venv/bin/tox` → format/lint/type/tests OK (35 tests). Item-0003 auth email tests
(`api.tests.test_auth`) pass in the full run.

## Live checks (this session)
- `_resolve_email_backend(True, {})` → console; `(False, {})` → smtp;
  `(False, {"EMAIL_BACKEND": console})` → console (criteria 1, 2, 3). ✓
- Prod-simulated full load (`DEBUG=0 EMAIL_HOST=smtp.example.com EMAIL_PORT=2525
  EMAIL_USE_TLS=1 DEFAULT_FROM_EMAIL=hi@example.com`) →
  `EMAIL_BACKEND = smtp.EmailBackend`, `EMAIL_HOST=smtp.example.com`, `PORT=2525`,
  `TLS=True`, `DEFAULT_FROM_EMAIL=hi@example.com` — all from env (criterion 2). ✓

## Acceptance criteria
1. console in DEBUG — live + `test_console_in_debug`. ✓
2. smtp in prod + env SMTP settings — live prod load + `test_smtp_in_production`. ✓
3. explicit override — live + `test_explicit_override_wins`. ✓
4. no credential committed; render.yaml 6 email vars `sync:false`. ✓
5. item-0003 auth email tests still pass (35 green). ✓
6. tox green; scope = settings + test + render.yaml. ✓
