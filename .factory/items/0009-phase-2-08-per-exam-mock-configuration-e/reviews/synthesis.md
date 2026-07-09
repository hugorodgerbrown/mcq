# Review synthesis — Phase 2 · 08 · Per-Exam mock configuration

**Verdict: APPROVED (clean).** No blocking findings. Browser confirms 3–4.

## Scope
Branch `factory/0009-…`. Backend: `exam_update` PATCH view + nested url + 3 tests.
Frontend: `updateExam` client + `ExamSettings`/`ExamSettingsRow` components + shell
`view="settings"` + a single Settings link in `StudyApp`'s top bar (the only
StudyApp change; study screens untouched).

## Acceptance trace
1. PATCH updates / 403 anon+non-owner / 404 exam-not-in-course — `ExamConfigTests`
   (`test_owner_updates`, `test_anon_and_non_owner_forbidden`). ✓
2. invalid (size<1, pass_mark>100) → 400 unchanged — `test_invalid_values`. ✓
3. edit + persist in browser — verify.
4. mock reflects new pass mark — verify (integration with 0008).
5. tox green (31) + `npm run build` exit 0. ✓
6. scope (endpoint + settings screen + one top-bar link). ✓

## Walk (static) — config → mock
`exam_update` validates + saves `exam_size`/`pass_mark` (owner-scoped, exam bound to
the course). `ExamSettings` PATCHes then `onSaved` re-fetches `getCourseContent`, so
`contentToTracks` recomputes `examSize`/`passMarkPct` and the 0008 mock reads the new
values. Verify drives: change pass_mark 80→60, confirm the mock intro shows 60%.
