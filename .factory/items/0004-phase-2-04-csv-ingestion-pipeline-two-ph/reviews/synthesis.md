# Review synthesis — Phase 2 · 04 · CSV ingestion pipeline

**Verdict: APPROVED (clean).** No blocking findings.

## Scope reviewed
Branch `factory/0004-…`. `courses/importer.py` (parse_preview, commit_import,
validate_rows, RowError/ImportValidationError), `courses/api_views.py`,
`courses/urls.py`, one `include` line in `config/urls.py`,
`courses/tests/test_importer.py`. No SPA / api-app / study-mode changes.

## Acceptance-criteria trace
1. Preview returns structure, no write — `test_preview_does_not_write` (totals
   `{rows:2,new:2,updated:0}`, `Question.objects.count()==0`). ✓
2. Commit creates — `test_commit_creates` (`questions_created==2`). ✓
3. Re-upload merges on Code, no wipe — see walk; `test_reupload_merges_on_code`. ✓
4. Missing header blocks commit (400) — `test_missing_header_blocks_commit`. ✓
5. Auth + ownership 403 — `test_requires_auth_and_ownership` (anon + non-owner). ✓
6. tox green (17 tests). ✓
7. Scope guard — only `courses/*` + one `include` line; 0 SPA files. ✓

## End-to-end walk (executed, inline) — the merge-on-Code seam (criterion 3)
The behavior most likely to hide a bug (idempotent re-import, no wipe):
- `commit_import` iterates rows; per row `Question.objects.update_or_create(
  course=course, code=row["Code"], defaults={...})`.
- match key = `(course, code)` — exactly the `unique_course_code` constraint from
  item 0002. Matched → fields updated in place (returns `created=False`); absent →
  inserted (`created=True`). Rows *not present* in the new file are never queried,
  so they are left untouched — no wipe.
- exercised: `test_reupload_merges_on_code` commits {Q1,Q2}, then commits
  {Q1(answer C), Q3}; asserts total == 3 (Q1,Q2,Q3 — Q2 survived omission) and
  `Question.get(code="Q1").correct == "C"` (Q1 updated). tox `tests` green ⇒ ran
  against the real migrated schema + DRF stack. The `@transaction.atomic` wrapper
  means a mid-file validation failure writes nothing (criterion 4 path).

## Non-blocking notes
- Non-owner of a *non-existent* course gets 404 (get_object_or_404) rather than
  403; non-owner of an existing course gets 403 as specified. Acceptable — 404 on
  a missing id leaks nothing.
- `validate_rows` is intentionally structural only; item 0005 hardens it (four
  options non-empty, Correct resolves, Code unique in file) via the same seam.
- Type-env still scopes `mypy config api` (bid-0007); new code is correctly hinted.
