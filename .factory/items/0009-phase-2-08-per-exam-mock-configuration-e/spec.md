# Spec — Phase 2 · 08 · Per-Exam mock configuration

## Purpose

Let an author set each Exam's mock size and pass mark, rather than living with the
import defaults — the PRD's "author-set per Exam" requirement (source:
docs/factory/prd/dsc1-phase-2.md#Mock-configuration). Builds on the data model
(0002), the read/serve stack (0006), and the study modes that consume these values
(0008).

## Behavior

### Backend
- `PATCH /api/v1/courses/<course_pk>/exams/<exam_pk>/` — update an Exam's
  `exam_size` and/or `pass_mark`; owner-scoped (the course's owner). Returns the
  updated `{"id","name","exam_size","pass_mark"}`.
- Validation: `exam_size` a positive integer (≥ 1); `pass_mark` an integer
  `1..100` (percentage). Invalid → 400 with a field message. Anonymous or
  non-owner → 403; exam not under that course → 404.

### SPA
- A themed **Exam settings** screen listing the current course's Exams, each with
  editable `exam_size` (number) and `pass_mark` (%) inputs and a "Save" action
  that PATCHes and reflects the saved values.
- Reachable from the study top bar (a "Settings" link next to Change course / Log
  out). "Back" returns to study.
- After saving, the study flow uses the new values (the content reloads), e.g. the
  mock intro/results show the updated pass mark and draw size.

## Non-goals

- No creation/deletion of Exams (they are created by import) — editing only.
- No editing of Topics/Questions or course name/rubric here.
- No new study-mode behavior — 0008 owns how the values are used.
- No per-question config.

## Assumptions (brain gaps)

- **Config lives on an Exam-settings screen reached from the study top bar** (the
  most discoverable place once a course is loaded), rather than a separate
  course-setup area. Reversible.
- **`pass_mark` is a percentage 1..100** (consistent with item 0002's model and
  0008's mock scaling). Reversible.
- **`exam_size` may exceed the current question pool** — the mock already draws
  `min(exam_size, pool)` (item 0008), so a large `exam_size` is allowed and simply
  capped at study time. Reversible.

## Acceptance criteria

1. `PATCH …/exams/<id>/` updates `exam_size`/`pass_mark` for the owner and returns
   the new values; anonymous/non-owner → 403; exam not in that course → 404.
2. Invalid values (`exam_size` < 1, `pass_mark` outside 1..100) → 400, unchanged.
3. In a browser, an author opens Exam settings, changes an Exam's `pass_mark`
   (e.g. 80 → 60) and `exam_size`, saves, and the values persist (reload shows
   them).
4. After changing `pass_mark`, the mock intro/results for that Exam reflect the new
   percentage (integration with item 0008).
5. `tox` green (backend PATCH tests); `npm run build` succeeds; the browser walk
   (3–4) passes with no console errors.
6. Scope: backend adds the exam-update endpoint (+ serializer/test); frontend adds
   the settings screen + a top-bar link, without changing the study screens.
