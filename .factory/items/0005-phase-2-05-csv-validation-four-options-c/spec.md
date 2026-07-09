# Spec — Phase 2 · 05 · CSV validation (four options, Correct resolves, Code unique)

## Purpose

Harden the import so a bad CSV is caught with clear, row-level errors before any
data is written — the trust guarantee behind the product. Fills in the
`validate_rows` seam left by item 0004 with the full phase-one rules from the CSV
contract (source: docs/factory/prd/dsc1-phase-2.md#CSV-contract; builds on
0004's `courses.importer`).

## Behavior

- `validate_rows(rows)` enforces, per data row (row numbers: header = 1, first
  data row = 2), in addition to the existing "Code required" / "Question
  required":
  1. **All four options present** — `A`, `B`, `C`, `D` each non-empty after
     strip; a missing/empty option yields an error naming the row and which
     option letter(s) are empty.
  2. **`Correct` resolves** — after strip/upper, `Correct` must be exactly one of
     `A`/`B`/`C`/`D`; anything else (empty, `Z`, `AB`) is an error.
  3. **`Code` unique within the file** — a `Code` value appearing on more than one
     row is an error on each duplicate occurrence, naming the row and the code.
- Errors keep the `{row, message}` shape and flow through unchanged: the preview
  lists them; `commit_import` refuses (400) if any exist and writes nothing.
- Messages are specific and human-readable (e.g. `Row 4: option C is empty`,
  `Row 7: Correct 'Z' is not one of A, B, C, D`, `Row 9: duplicate Code 'Q1'`).

## Non-goals

- No new API endpoints or model changes — uses 0004's endpoints and 0002's
  models. (`Code` uniqueness *within the file* is validated here; uniqueness in
  the DB across imports is the model constraint from 0002.)
- No UI error rendering — the SPA (0006/0007) displays the error list.
- No semantic checks beyond structure (e.g. it does not verify the answer is
  *correct*, only that `Correct` names a present option).

## Assumptions (brain gaps)

- **Duplicate-Code is reported on each duplicate occurrence** (not only the
  second), so the author sees every offending row. Reversible presentation choice.
- **Whitespace-only option/field counts as empty.** Matches "present" meaning
  "has content". Reversible.

## Acceptance criteria

1. A row with an empty option (any of A–D) produces a row-level error naming the
   row and the empty option; the import is blocked.
2. A row whose `Correct` is empty or not one of A/B/C/D produces a row-level
   error; blocked.
3. A `Code` value repeated across two rows produces a duplicate error referencing
   the offending row(s); blocked.
4. A fully valid CSV yields zero errors and `commit_import` writes it.
5. Errors surface in `parse_preview` output and cause `commit_import` to return
   400 (via the existing API), writing nothing.
6. `tox` green (format, lint, type, tests) with new validation tests; scope
   confined to `courses/importer.py` and `courses/tests/` (no API, model, or SPA
   changes).
