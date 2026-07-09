# Spec — Phase 2 · 03 · Data model: Course → Exam → Topic → Question

## Purpose

The persistence layer for author content: the models every later Phase 2 item
reads or writes — CSV import (0004/DSC-4), course management (0007/DSC-6), study
modes (0008/DSC-7), mock config (0009/DSC-8), provenance (0010/DSC-10). Builds
on the Django server shipped in item 0001 (source: brain/constraints.md Phase 2;
docs/factory/prd/dsc1-phase-2.md#In-scope Data model, #CSV-contract).

## Behavior

- A new Django app `courses` holds four models, all multi-tenant (scoped to an
  owning user):
  - **Course** — `owner` (FK to `settings.AUTH_USER_MODEL`), `name`, `rubric`
    (text, may be blank), timestamps.
  - **Exam** — `course` (FK, related_name `exams`), `name`; mock config
    `exam_size` (positive int) and `pass_mark` (positive int).
  - **Topic** — `exam` (FK, related_name `topics`), `name`.
  - **Question** — `topic` (FK, related_name `questions`); a denormalized
    `course` FK (so the per-course `Code` uniqueness can be enforced by the DB);
    `code`, `text`, four option fields `option_a`/`option_b`/`option_c`/
    `option_d`, `correct` (single letter A–D), `explanation` (blank ok), `source`
    (blank ok).
- **Constraints:**
  - `Question` unique on (`course`, `code`) — `Code` is unique within a course
    (source: #CSV-contract, #Decisions-surfaced).
  - `correct` restricted to `A`/`B`/`C`/`D` (choices + a CharField max_length 1;
    a CheckConstraint enforces membership at the DB level).
  - `exam_size` and `pass_mark` positive.
- Migrations are generated and apply cleanly on SQLite and Postgres.
- `__str__` on each model returns a human-readable label (used by admin/debug).
- Model-level defaults only; the import/creation logic that computes
  `exam_size = min(50, questions in exam)` and `pass_mark = 80%` lives in the
  importer (0004) and setup UI (0009) — this item just stores the values, with
  `pass_mark` defaulting to 80.

## Non-goals

- No DRF serializers, viewsets, or API endpoints — API integration is item 0006.
- No CSV parsing/import — item 0004; no validation rules — item 0005.
- No auth/registration — item 0003 (this item references `AUTH_USER_MODEL`, which
  the default `django.contrib.auth.User` already satisfies).
- No admin registration, no course-management UI, no study-mode changes.
- No answer-confidence scale (the Phase-1 Meat-track `conf` field is dropped;
  only free-text `source` is carried — owner direction).

## Assumptions (brain gaps)

- **Options stored as four fixed CharFields (`option_a`–`option_d`).** The brain
  fixes "exactly four options A–D" and lists >4 options out of scope (source:
  #Out-of-scope). Reversible: migrating to a related OptionModel later is a
  contained migration if >4 is ever wanted.
- **`Code` uniqueness enforced via a denormalized `course` FK on `Question`.**
  Django unique constraints can't span the Topic→Exam→Course relation, so the
  course is denormalized onto Question for a DB-level `UniqueConstraint(course,
  code)`. Reversible: the FK can be dropped if the constraint moves to import
  logic.
- **`owner` targets `settings.AUTH_USER_MODEL`.** Auth (0003) may introduce a
  custom user; referencing the setting avoids a later migration. Reversible by
  definition (it's the documented Django indirection).
- **`correct` stored as a single-letter CharField with choices + CheckConstraint.**
  Matches the CSV's single-letter `Correct` (source: #CSV-contract). Reversible.

## Acceptance criteria

1. `manage.py makemigrations courses` produces migrations with no changes left,
   and `manage.py migrate` applies them cleanly on SQLite.
2. The four models exist with the relationships above; `Course.exams`,
   `Exam.topics`, `Topic.questions` reverse accessors resolve.
3. Creating two `Question`s with the same `code` under the same course raises an
   IntegrityError; the same `code` under a different course is allowed.
4. A `Question` with `correct` not in {A,B,C,D} is rejected (CheckConstraint /
   full_clean validation error).
5. `Exam` stores `exam_size` and `pass_mark`; `pass_mark` defaults to 80 when
   unspecified.
6. `manage.py check` passes and `tox` is green (format, lint, type, tests),
   including new model tests covering criteria 2–5.
7. No API/serializer/import code is added (scope guard): the diff touches only
   the new `courses` app (models, migrations, tests) and its `INSTALLED_APPS`
   registration.
