# Review synthesis — Phase 2 · 05 · CSV validation

**Verdict: APPROVED (clean).** No blocking findings.

## Scope reviewed
Branch `factory/0005-…`. Only `courses/importer.py` (`validate_rows` body) and
`courses/tests/test_validation.py`. `_read_rows`/`_summarize`/`parse_preview`/
`commit_import` untouched.

## Acceptance-criteria trace
1. Empty option flagged + blocks — `test_empty_option_flagged`, `test_errors_listed_in_preview`. ✓
2. Correct must resolve — `test_correct_must_resolve`, `test_invalid_correct_blocks_commit`. ✓
3. Duplicate Code within file (each repeat) — `test_duplicate_code_flagged_on_each_repeat` (rows 3,4 flagged, row 2 not). ✓
4. Valid CSV → no errors, imports — `test_valid_rows_have_no_errors`; 0004 commit tests still green. ✓
5. Errors in preview / commit 400 — `ValidationBlocksCommitTests`. ✓
6. tox green (23 tests); scope = importer + tests only. ✓

## End-to-end walk (executed, inline)
`validate_rows` → block-commit seam:
- `commit_import` calls `validate_rows(rows)`; non-empty → raises
  `ImportValidationError`; the API view returns 400 with the `{row,message}` list,
  and `@transaction.atomic` guarantees no write.
- exercised: `test_invalid_correct_blocks_commit` posts a `Correct=Z` row → 400,
  `Question.count()==0`; `test_errors_listed_in_preview` posts an empty option B →
  preview 200 with `option B is empty`. tox `tests` green ⇒ real DRF + importer path.
- **Regression guard:** the item-0004 importer tests pass unchanged under the
  stricter rules (their fixtures use full valid rows), confirming the tightened
  validation didn't break the happy path.

## Notes
- Duplicate-Code reports each repeat after the first (references first-seen row) —
  matches the spec assumption. First occurrence intentionally not flagged.
- Type-env scope unchanged (bid-0007); new code correctly hinted.
