# Review synthesis — Phase 2 · 11 · Email-provider wiring

**Verdict: APPROVED (clean).** No blocking findings.

## Scope
Branch `factory/0011-…`. `server/config/settings.py` (helper + env-driven email),
`server/api/tests/test_email_config.py`, `render.yaml` (6 email env vars). No other
files.

## Acceptance trace
1. console in DEBUG — `_resolve_email_backend(True, {})` → console; `test_console_in_debug`. ✓
2. smtp in prod + env SMTP — `_resolve_email_backend(False, {})` → smtp; EMAIL_HOST/
   PORT/USER/PASSWORD/USE_TLS/FROM read from env; `test_smtp_in_production`. ✓
3. explicit override — env `EMAIL_BACKEND` wins in both modes; `test_explicit_override_wins`. ✓
4. no credential committed; render.yaml email vars `sync:false` — confirmed (only key
   lines, no values). ✓
5. item-0003 auth email tests still pass — full suite 35 green incl. signup-verify +
   reset (locmem backend captures outbox). ✓
6. tox green; scope = settings + test + render.yaml. ✓

## Walk (static)
`EMAIL_BACKEND = _resolve_email_backend(DEBUG, os.environ)`: pure helper, no import
side-effects; prod path selects the smtp backend and the smtp settings come from env
with safe defaults (587/TLS-on). Credentials never touch the repo. The verify stage
exercises the helper live across the three modes.

## Note (accepted deviation)
`test_loaded_settings_use_console_under_test_debug` reads the `config.settings`
module attribute rather than `django.conf.settings` — the test runner rebinds
`django.conf.settings.EMAIL_BACKEND` to locmem during tests, so the module attr is
the correct, stable place to assert the load-time resolution. Correct.
