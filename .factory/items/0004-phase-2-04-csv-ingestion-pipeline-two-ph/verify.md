# Verify — Phase 2 · 04 · CSV ingestion pipeline

**Result: GREEN — 7/7 criteria pass, full suite green.** Fresh evidence, branch
`factory/0004-…`.

## Full suite
`.venv/bin/tox` → format/lint/type/tests OK (17 tests).
`manage.py test courses.tests.test_importer` → Ran 5 tests, OK.

## Live importer round-trip (real DB, executed this session)
- `parse_preview` → `totals {'rows':2,'new':2,'updated':0}`, `Question.count()==0`
  → **no write** (criterion 1). ✓
- `commit_import` (2 rows) → `{'exams':1,'topics':1,'questions_created':2,
  'questions_updated':0}` (criterion 2). ✓
- re-`commit_import` (Q1 answer→C, add Q3, omit Q2) → `{'questions_created':1,
  'questions_updated':1}`; final: **3 questions** (Q1,Q2,Q3), `Q1.correct=='C'`
  (updated in place), **Q2 still present** (no wipe), `Q2.source=='src-ref'`
  (optional Source imported) (criterion 3). ✓

## Acceptance criteria
1. Preview returns structure, no write — live + `test_preview_does_not_write`. ✓
2. Commit creates — live + `test_commit_creates`. ✓
3. Re-upload merges on Code, no wipe — live (above) + `test_reupload_merges_on_code`. ✓
4. Missing header blocks commit 400 — `test_missing_header_blocks_commit`. ✓
5. Auth + ownership 403 (anon + non-owner) — `test_requires_auth_and_ownership`. ✓
6. tox green (17 tests). ✓
7. Scope guard — only `courses/*` + one `include` line; 0 SPA files. ✓
