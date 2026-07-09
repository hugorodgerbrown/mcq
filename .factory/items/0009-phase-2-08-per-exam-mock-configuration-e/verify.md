# Verify — Phase 2 · 08 · Per-Exam mock configuration

**Result: GREEN — 6/6 criteria pass.** Backend suite + live browser walk (edit
config → mock reflects it).

## Backend suite
`.venv/bin/tox` → format/lint/type/tests OK (31 tests incl. 3 exam-config tests:
owner-updates, anon+non-owner 403, invalid 400 unchanged).
`npm run build` → exit 0.

## Browser walk (Chrome, author@dsc1.local, DSC1 Demo)
- Top bar now has **Settings** (next to Change course / Log out). ✓
- Settings → **Exam settings** screen: "Written" row with Mock size 5 / Pass mark
  80 (themed). ✓
- Change to Mock size **4**, Pass mark **60** → Save → button shows **"Saved ✓"**
  and the row reflects 4 / 60 (criterion 3, persist). ✓
- Back to study → Mock exam mode → intro now reads **"4 questions across all
  topics. No feedback until the end. Pass mark 60%."** — the saved config flows
  into the mock (criterion 4, integration with item 0008). ✓
- Backend tests cover PATCH 200 / 403 anon+non-owner / 400 invalid (criteria 1,2). ✓
- **No console errors** during the walk (criterion 5). ✓
- Scope: endpoint + settings screen + one top-bar link; study screens untouched
  (criterion 6). ✓
