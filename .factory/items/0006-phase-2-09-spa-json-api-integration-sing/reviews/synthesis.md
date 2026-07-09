# Review synthesis — Phase 2 · 09 · SPA ↔ API integration

**Verdict: APPROVED (clean).** No blocking findings. Browser confirmation of
criteria 3–5 happens in verify.

## Scope reviewed
Branch `factory/0006-…`. Backend: `courses/serializers.py`, `course_list`/
`course_content` views + urls, read-API tests. Serving: `vite.config.js`
(base `/static/`, outDir `server/spa_dist`), `STATICFILES_DIRS`, `spa_index`
catch-all with `@ensure_csrf_cookie`, `render.yaml`. SPA: `src/api.js`,
`src/App.jsx` refactor. `.gitignore` for build artifacts.

## Acceptance-criteria trace
1. `courses/` owner-scoped, 403 anon — `test_course_list_owner_only`. ✓
2. `content/` nested, owner-scoped 403 — `test_content_nested_and_owner_scoped`
   (asserts `options` map + `pass_mark`). ✓
3. Django serves SPA at `/` + catch-all; API/accounts unaffected — structural
   (routes ordered api/accounts before catch-all with negative-lookahead regex);
   **browser-confirmed in verify**. ✓ (pending live)
4. anon `/` → themed login prompt — **browser (verify)**.
5. after login, course questions load + MCQ/Flashcard/Exam — **browser (verify)**.
6. no bundled question data — grep confirms QUESTIONS/MEAT_QUESTIONS/TRACKS gone;
   bundle 310→170 kB. ✓
7. tox green (25 tests) + `npm run build` exit 0. ✓

## Structural walk (static) — data path
- `App` (shell): `getMe()` → auth gate; `listCourses()` → picker/auto-select;
  `getCourseContent(id)` → `contentToTracks(content)` → `StudyApp`.
- `contentToTracks`: Exam→track `{examSize: exam.exam_size, examPass:
  round(pass_mark/100*exam_size)}`, Topic→deck (palette color by index),
  Question→`{id, cat, q, A,B,C,D, correct, explanation, source}`.
- `StudyApp` is the former `App` body with `activeTrack = tracks[track]`,
  `track` init `trackKeys[0]`, exam segment over `trackKeys`. The MCQ/Flashcard/
  Exam/results components are unchanged — they already consume
  `activeTrack.{questions,decks,examSize,examPass}`.
The seam that only a running system exercises (session cookie → `/me/` →
content render → mode interaction) is the verify-stage browser walk.

## Non-blocking notes
- Old `correct:"?"` / `conf` "unverified" affordances are now inert (API answers
  always A–D). Harmless dead branches; a later cleanup could remove them.
- `pass_mark` percentage → pass-count conversion lives in the mapper
  (`round(pass_mark/100*exam_size)`); item 0009 owns editing these.
- Type-env still `mypy config api` (bid-0007); new courses code ruff-clean.
