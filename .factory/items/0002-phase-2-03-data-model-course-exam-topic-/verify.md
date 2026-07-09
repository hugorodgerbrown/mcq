# Verify — Phase 2 · 03 · Data model

**Result: GREEN — 7/7 acceptance criteria pass, full suite green.** Fresh
evidence from this verify session (branch `factory/0002-…`).

## Full suite
`.venv/bin/tox` → format: OK, lint: OK, type: OK, tests: OK — "congratulations :)".
`manage.py test courses` → Ran 5 tests, OK.

## Acceptance criteria
1. **Migrations** — `makemigrations --check --dry-run` → "No changes detected";
   `migrate` runs clean (courses.0001_initial already applied). ✓
2. **Models + reverse accessors** — `test_reverse_accessors_resolve` passes
   (`course.exams`, `exam.topics`, `topic.questions`, `course.questions`). ✓
3. **Per-course `code` uniqueness** — `test_code_unique_within_course` (dup →
   IntegrityError) and `test_same_code_allowed_across_courses` (same code, other
   course → both persist) pass; DB `UniqueConstraint(course, code)` in migration. ✓
4. **`correct` ∈ {A,B,C,D}** — `test_correct_must_be_abcd` (correct="Z" →
   IntegrityError) passes; `CheckConstraint correct_in_abcd` in migration. ✓
5. **`exam_size`/`pass_mark`; default 80** — `test_pass_mark_defaults_to_80`
   passes (pass_mark 80, exam_size 50). ✓
6. **tox green incl. model tests** — see Full suite (6 tests total). ✓
7. **Scope guard** — non-`courses` code changes vs main = only
   `server/config/settings.py` (the one `INSTALLED_APPS` line); 0 SPA files
   changed. No serializer/view/API/import code. ✓

## Note
Type-env model-coverage gap recorded as a non-blocking follow-up bid (bid-0007);
does not affect any criterion here.
