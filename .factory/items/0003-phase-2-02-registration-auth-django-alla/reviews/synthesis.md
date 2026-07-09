# Review synthesis — Phase 2 · 02 · Registration & auth

**Verdict: APPROVED (clean).** No blocking findings. Two non-blocking notes.

## Scope reviewed
Branch `factory/0003-…`. django-allauth 65.18.0: settings (INSTALLED_APPS,
middleware incl. AccountMiddleware, SITE_ID, backends, email-login account
settings, console email backend, TEMPLATES DIRS + context processors, DRF
SessionAuthentication), `accounts/` URLs, `/api/v1/me/`, 8 themed templates, auth
tests. SPA untouched.

## Acceptance-criteria trace
1. allauth installed/configured; check + migrate — settings verified; tox green. ✓
2. Signup creates user + verification email — `test_signup_creates_user_and_sends_verification`. ✓
3. Verification mandatory / flips on confirm — `ACCOUNT_EMAIL_VERIFICATION="mandatory"`, `test_email_unverified_until_key_confirmed`. ✓
4. Password reset email — `test_reset_email_sent_for_existing_user`. ✓
5. `/api/v1/me/` 200 auth / 403 anon — see walk. ✓
6. Themed server-rendered auth pages — `base.html` carries design-system tokens
   (`#060c17`/`#0a1424` bg, `#CCFF66` accent, max-width 420) + `data-auth-base="dsc1"`;
   `test_login_page_uses_themed_base`. ✓
7. tox green (12 tests); SPA files unchanged (0 in diff). ✓

## End-to-end walk (executed, inline) — session auth seam
`GET /api/v1/me/`:
- `config/urls.py` `api/v1/` → `api/urls.py` `me/` → `views.me`
- `views.me` is `@permission_classes([IsAuthenticated])`; DRF
  `DEFAULT_AUTHENTICATION_CLASSES = [SessionAuthentication]`
- anonymous → IsAuthenticated denies → 403 (`test_me_requires_auth`, asserted 403)
- `force_login` establishes a session → `request.user` resolved → returns
  `{"id","email"}` (`test_me_returns_user_when_authenticated`, asserts 200 +
  `email == me@x.com`)
- tox `tests` env green ⇒ ran against the real DRF auth stack + URLconf, not a
  static read. This is the exact seam the SPA (item 0006) will call.

## Non-blocking notes
- **`LOGIN_REDIRECT_URL = "/"`** targets a root not yet served (SPA integration is
  item 0006); post-login redirect will 404 until then. Expected given build order;
  0006 wires the root. No action now.
- **allauth 65 template system:** the implementer created a self-contained themed
  `account/base.html` and overrode flow templates to extend it (allauth 65 ships no
  stock `account/base.html`, so nothing is shadowed). Consistent with the design
  choice; correct.

## Notes
- Default `User` + email login retained (no custom user), per spec assumption and
  bid-0009 (medium) — flagged as costly-to-reverse but acceptable pre-launch.
