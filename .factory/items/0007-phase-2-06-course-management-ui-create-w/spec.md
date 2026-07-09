# Spec — Phase 2 · 06 · Course management UI (create + CSV upload)

## Purpose

Give the author the screens to create a course and load its questions by CSV —
turning the "no courses yet / coming soon" placeholder from item 0006 into a real
create-and-import flow, driving the import API from item 0004/0005. Builds on
0006 (SPA shell + API client) (source: docs/factory/prd/dsc1-phase-2.md#Appendix
req 3,6; #Ingestion).

## Behavior

### Backend
- `POST /api/v1/courses/` — create a course for the authenticated user:
  body `{"name", "rubric"}` → 201 with `{"id","name","rubric"}`; `owner` is the
  caller. `name` required. 403 for anonymous.

### SPA (new themed screens, reusing design-system tokens)
- **Create course**: a themed form (name + optional rubric) reachable from the
  empty state ("No courses yet → Create your first course") and from the course
  picker / top bar ("New course"). Submitting POSTs and then lands on the course's
  **upload** screen.
- **CSV upload / import** (two-phase, per item 0004's contract):
  1. A file picker; on file select, POST to `…/import/preview/` (multipart).
  2. Show the returned **summary**: per-Exam → Topics → question counts, totals
     (new/updated), and any **row errors** (row + message) in a themed list.
  3. If there are no errors, an "Import" button POSTs the same file to
     `…/import/commit/`; on success show the counts and offer "Study now"
     (loads the course content). If there are errors, "Import" is disabled and the
     errors are shown so the author fixes the CSV and re-picks it.
- After a successful import, the app can load the course and study it (the 0006
  study flow).
- CSRF: uploads send `X-CSRFToken` (the api client from 0006 already does this for
  non-GET).

## Non-goals

- No question-editing UI — re-import is the correction path (#Out-of-scope).
- No per-Exam mock-config editing — item 0009.
- No course delete/rename (create + import only for this item); revisit later.
- No provenance badges — item 0010.
- No changes to the study screens themselves — item 0006 owns those.

## Assumptions (brain gaps)

- **Create returns to the upload screen** (a new course is empty and needs a CSV),
  rather than to the empty study home. Most direct path to a usable course.
  Reversible.
- **The client holds the file for the preview→commit sequence** (re-sends on
  commit), matching item 0004's stateless design. Reversible.
- **Minimal management for now** (create + import); rename/delete deferred. The
  PRD lists "view and manage their own courses" without enumerating operations
  (#In-scope). Reversible.

## Acceptance criteria

1. `POST /api/v1/courses/` creates a course owned by the caller and returns it
   (201); anonymous → 403; missing `name` → 400.
2. In a browser, from the empty state an author creates a course (name + rubric)
   and is taken to its upload screen.
3. In a browser, uploading a valid CSV shows the preview summary (exams, topics,
   counts) and, on confirm, imports the questions; the course is then studyable.
4. In a browser, uploading a CSV with a validation error (e.g. bad `Correct`)
   shows the row error(s) and blocks import until fixed.
5. `tox` green (backend create-course tests); `npm run build` succeeds; the
   browser walk (2–4) passes with no console errors.
6. Scope: backend change is the create endpoint (+ serializer/test); frontend adds
   the create + upload screens without altering the study screens.
