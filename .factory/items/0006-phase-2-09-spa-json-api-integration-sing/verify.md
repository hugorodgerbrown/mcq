# Verify — Phase 2 · 09 · SPA ↔ API integration

**Result: GREEN — 7/7 criteria pass** (after a verify-caught fix). Evidence from
this session: backend suite + a live browser walk of the real login → study flow.

## Verify-caught defect (fixed on branch, commit `e293fdd`)
The first browser check found an **anonymous visit stuck on "Loading…"**:
`getMe()` returns `null` for anon (403), which collided with the `null` loading
sentinel, so the login screen never rendered (criteria 4/5 failing). Fixed by
coercing `getMe()`'s result: `setAuth(user || false)`. Re-verified green below.

## Backend suite
`.venv/bin/tox` → format/lint/type/tests OK (25 tests incl. the 2 read-API tests).
`npm run build` → exit 0, `server/spa_dist/` written.

## Serving (criterion 3) — live curl (Django on :8820, DEBUG)
- `/` → 200, HTML with `id="root"` and `/static/assets/…js`.
- `/study` (deep path) → 200, SPA HTML (catch-all).
- `/api/v1/health/` → 200 `{"status":"ok"}`; `/api/v1/courses/` anon → 403;
  `/accounts/login/` → 200; the hashed JS asset → 200.

## Browser walk (criteria 1,2,4,5,6) — Chrome, seeded course "DSC1 Demo"
(user `author@dsc1.local`, verified; 1 exam "Written", topics Law/Safety, 3 Qs)
- **anon `/`** → themed "Sign in to study" card with lime "Log in" → `/accounts/login/`
  (criterion 4). ✓
- **login** via the themed allauth page → redirect to `/`; the study home renders
  over API data: top bar "DSC1 Demo" + Change course/Log out, exam "Written" as the
  track, topics **Law (2)** / **Safety (1)** with palette dots, "Everything (3)"
  (criteria 1,2,5 — courses list + nested content consumed). ✓
- **Practice / MCQ** on Law: question "Who issues Firearms Certificates in
  Scotland?", four seeded options (shuffled); clicking "Police Scotland" (seeded
  `correct="B"`) → highlights green ✓, score → 1 attempt / ✓1 / 100% (criterion 5,
  answer-grading over API data). ✓
- **no bundled data** (criterion 6): grep confirms QUESTIONS/MEAT_QUESTIONS/TRACKS
  removed; bundle 310→170 kB. ✓
- **no console errors** during the flow (criterion 7). ✓

## Acceptance criteria: 1 ✓ 2 ✓ 3 ✓ 4 ✓ 5 ✓ 6 ✓ 7 ✓
