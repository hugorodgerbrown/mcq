# Verify — Phase 2 · 06 · Course management UI

**Result: GREEN — 6/6 criteria pass.** Backend suite + live browser walk of the
create → upload → import → study flow.

## Backend suite
`.venv/bin/tox` → format/lint/type/tests OK (28 tests incl. 3 create tests).
`npm run build` → exit 0.

## Browser walk (Chrome, fresh no-course user `newauthor@dsc1.local`)
1. Login → **empty state** "No courses yet" + lime "Create your first course"
   (themed). ✓
2. Create → **Create course** form (name + rubric) → submit → transitions to
   **Upload questions** screen for "My Deer Course" (criterion 2). ✓
3. Choose CSV (4 rows, 2 exams) → **preview summary**: WRITTEN → Law(2)/Safety(1),
   HYGIENE → General(1), "4 rows · 4 new · 0 updated", enabled "Import 4
   questions". Import → "Imported 4 new · 0 updated across 2 exams" → "Study now" →
   study home shows both exam tracks (Written/Hygiene), Law(2)/Safety(1)
   (criterion 3). ✓
4. **Invalid CSV** (bad Correct + duplicate Code + empty option) via the
   authenticated session → preview returns `errors:[{row:2,"Correct 'Z' is not one
   of A, B, C, D"},{row:3,"duplicate Code 'X1'…"},{row:3,"option B is empty"}]`;
   `UploadCourse` renders them in `#FF6699` and disables Import
   (`disabled={!!errors.length}`, commit guarded by `if (!file || errors.length)
   return`) (criterion 4). ✓
5. tox green + build + **no console errors** during the walk (criterion 5). ✓
6. Scope: create endpoint + create/upload screens; `StudyApp` untouched
   (criterion 6). ✓

## Non-blocking note (follow-up bid)
With exactly ONE course, there is no "New course" entry point (the picker — which
carries it — only shows for 2+ courses; a single course auto-selects). Reaching
"create a second course" from the UI isn't possible yet. Minor; create is
reachable from the 0-course empty state. Filed as a follow-up.
