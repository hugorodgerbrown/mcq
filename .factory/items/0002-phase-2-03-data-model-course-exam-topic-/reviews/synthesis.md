# Review synthesis — Phase 2 · 03 · Data model

**Verdict: APPROVED (clean).** No blocking findings. One non-blocking follow-up.

## Scope reviewed
Branch `factory/0002-…`, 4 commits. New `courses` app (models, migration, tests)
+ one `INSTALLED_APPS` line. No SPA, api, or config code beyond that line.

## Acceptance-criteria trace
1. `makemigrations --check` clean; `migrate` applies `courses.0001_initial` on
   SQLite. ✓
2. Course/Exam/Topic/Question with reverse accessors — `test_reverse_accessors_resolve`. ✓
3. Per-course `code` uniqueness — migration `UniqueConstraint(course, code)`;
   `test_code_unique_within_course` + `test_same_code_allowed_across_courses`. ✓
4. `correct` ∈ {A,B,C,D} — migration `CheckConstraint correct_in_abcd`;
   `test_correct_must_be_abcd`. ✓
5. `exam_size`/`pass_mark` stored, `pass_mark` default 80 — `test_pass_mark_defaults_to_80`. ✓
6. `tox` green (format/lint/type/tests, 6 tests). ✓
7. Scope guard — diff only `courses/` + one settings line. ✓

## End-to-end walk (executed, inline)
Flow = criterion 3 (per-course Code uniqueness), the constraint the CSV
re-import (item 0004) will depend on:
- model `Question.Meta.constraints` → `UniqueConstraint(fields=["course","code"])`
- serialized into `0001_initial.py` `AddConstraint … unique_course_code` (verified
  in the migration file)
- exercised: `test_code_unique_within_course` inserts a duplicate (course,code) and
  asserts `IntegrityError`; `test_same_code_allowed_across_courses` inserts the same
  code under a second course and asserts both persist. tox `tests` env passed, so
  the constraint ran against a real migrated SQLite schema, not a static read.
The denormalized `Question.course` FK (the reversible choice from the spec) is what
makes this DB-level constraint expressible; the walk confirms it holds.

## Non-blocking follow-up (filed as a bid)
- **`type` env does not cover model modules.** tox runs `mypy config api`; the new
  `courses` app is not in the mypy targets, and the `django-stubs` mypy plugin is
  installed but not enabled in `pyproject.toml`. So model modules are not actually
  type-checked, and enabling proper checking would surface django-stubs findings on
  `CheckConstraint`/`var-annotated`. Not blocking: criterion 6 ("tox green") is met
  and `models.py` carries correct hints (`__str__ -> str`). Recommend a follow-up
  item to wire the django-stubs plugin and extend the `type` env to the app modules.

## Notes
- Migration serializes `CheckConstraint(check=…)` as `condition=…` (Django 5.1+
  rename); valid on the pinned Django 5.2. No action.
