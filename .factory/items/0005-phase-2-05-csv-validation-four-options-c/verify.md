# Verify — Phase 2 · 05 · CSV validation

**Result: GREEN — 6/6 criteria pass, full suite green.** Fresh evidence, branch
`factory/0005-…`.

## Full suite
`.venv/bin/tox` → format/lint/type/tests OK (23 tests).
`manage.py test courses.tests.test_validation` → Ran 6 tests, OK.

## Live `validate_rows` exercise (executed this session)
Input rows: `[Q1 with empty option C, Q1 with Correct=Z, Q1]` →
```
row 2: option C is empty
row 3: duplicate Code 'Q1' (first seen row 2)
row 3: Correct 'Z' is not one of A, B, C, D
row 4: duplicate Code 'Q1' (first seen row 2)
```
Valid rows `[Q1, Q2]` → `[]`.

## Acceptance criteria
1. Empty option flagged + blocks — live (`option C is empty`); `test_empty_option_flagged`. ✓
2. Correct must resolve — live (`Correct 'Z' is not one of A, B, C, D`);
   `test_correct_must_resolve`, `test_invalid_correct_blocks_commit` (400, 0 written). ✓
3. Duplicate Code within file (each repeat, references first-seen) — live (rows 3,4);
   `test_duplicate_code_flagged_on_each_repeat`. ✓
4. Valid CSV → no errors, imports — live (`[]`); 0004 commit tests still green. ✓
5. Errors in preview / commit 400 — `ValidationBlocksCommitTests`. ✓
6. tox green (23 tests); scope = `importer.py` + `test_validation.py` only. ✓

## Regression
Item 0004 importer tests (5) pass unchanged under the stricter rules.
