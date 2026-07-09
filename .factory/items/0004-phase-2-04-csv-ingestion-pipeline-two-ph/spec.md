# Spec — Phase 2 · 04 · CSV ingestion pipeline (two-phase import, merge on Code)

## Purpose

Let an author populate a course from a single CSV: upload → parse → review a
summary → accept → import, with re-uploads merging on `Code` (no wipe). This is
the machinery that turns the shipped data model (0002) into usable content and
that the SPA upload UI (0006/0007) will drive. Builds on 0002 (models) and 0003
(auth/ownership) (source: docs/factory/prd/dsc1-phase-2.md#Ingestion;
#CSV-contract).

## Behavior

- A `courses.importer` module provides two operations over a CSV and a target
  `Course`:
  - **`parse_preview(course, file)`** — reads the CSV, runs validation, and
    returns a **summary** without persisting: per-Exam (`Section`) → list of
    Topics (`Category`) → question counts, total rows, count of new vs updated
    (matched on existing `(course, code)`), and a list of row-level errors. No DB
    writes.
  - **`commit_import(course, file)`** — re-runs parse+validate; if valid, imports
    inside a transaction: get-or-create each `Exam` by (`course`, `Section`),
    each `Topic` by (`exam`, `Category`); upsert each `Question` by
    (`course`, `Code`) — matched rows updated in place, new rows inserted, nothing
    deleted. Returns counts (exams/topics touched, questions created/updated).
- **CSV contract** (header, one file per course): `Section`→Exam,
  `Category`→Topic, `Code`, `Question`, `A`,`B`,`C`,`D`, `Correct`, optional
  `Explanation`, optional `Source` (source: #CSV-contract).
- **Validation seam**: this item enforces *structural* validation — required
  headers present, and each row maps to the model fields. It exposes a
  `validate_rows(rows)` function returning a list of `(row_number, message)`
  errors; item 0005 hardens this with the full rules (four options non-empty,
  `Correct` resolves to one of A–D, `Code` unique within the file). Rows with
  errors are reported in the preview and block commit.
- **API endpoints** (auth required, owner-scoped, multipart upload):
  - `POST /api/v1/courses/<id>/import/preview/` → the summary JSON (no writes).
  - `POST /api/v1/courses/<id>/import/commit/` → performs the import, returns
    counts; 400 with the error list if validation fails.
  - Both 403 for anonymous and for a non-owner of the course.
- Import is **idempotent on re-upload**: importing the same file twice updates
  the same rows and creates no duplicates (the `(course, code)` uniqueness from
  0002 backs this).

## Non-goals

- No upload UI / SPA screens — items 0006/0007 (this item is the service + API).
- No full validation-rule hardening or rich per-row error UX — item 0005 (this
  item ships the seam + structural checks only).
- No per-Exam mock-config editing — item 0009 (Exams are created here with model
  defaults `exam_size=50`, `pass_mark=80`).
- No provenance badge rendering — item 0010 (the `Source` column is imported and
  stored; display is later).
- No CSV export, no question-editing UI (re-import is the correction path).

## Assumptions (brain gaps)

- **Exams/Topics are created by the importer from the `Section`/`Category`
  columns**, not pre-built (source: #Decisions-surfaced). New Exams get model
  defaults for `exam_size`/`pass_mark` (0009 lets authors edit them). Reversible.
- **`commit_import` re-parses rather than trusting a preview token.** Statelessly
  re-reading the uploaded file on commit avoids server-side session state for a
  pending import (sessions are ephemeral — #In-scope). Reversible: a staged-upload
  token could be added later. The client re-sends the file on commit.
- **Owner scoping**: only the course's `owner` may preview/commit; enforced in the
  API view. Reversible.

## Acceptance criteria

1. `parse_preview` on a valid CSV returns a summary with the correct Exam→Topic
   structure and question counts, and writes nothing to the DB.
2. `commit_import` on a valid CSV creates the Exams/Topics/Questions; counts match
   the file.
3. Re-uploading a CSV with a changed answer for an existing `Code` updates that
   Question in place and does not create a duplicate; a new `Code` is inserted;
   removed rows are left untouched (no wipe).
4. A CSV missing a required header, or a row that can't map to fields, is reported
   as a row/structural error in the preview and blocks commit (400).
5. `POST /api/v1/courses/<id>/import/preview/` and `…/commit/` require auth and
   course ownership: 403 for anonymous and for a non-owner; 200/400 for the owner.
6. `tox` green (format, lint, type, tests) with importer + API tests covering
   1–5; SPA files unchanged.
7. Scope guard: changes confined to the `courses` app (importer, API views/urls,
   tests) and API URL wiring — no SPA, no study-mode, no provenance-render code.
