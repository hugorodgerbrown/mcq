# Plan — Phase 2 · 05 · CSV validation

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Hardens the `validate_rows` seam in `server/courses/importer.py` (shipped by item
0004). Toolchain unchanged (uv + tox, Python 3.12); run via `uv run …` /
`.venv/bin/…` from `server/`, `SECRET_KEY=test` for manage.py. Nothing else in the
importer or API changes — the preview/commit flow already calls `validate_rows`.

---

- [x] **Task 1 — Full `validate_rows` rules** _(covers acceptance criteria 1, 2, 3, 4)_

  In `server/courses/importer.py`, replace the existing `validate_rows` function
  with:

  ```python
  def validate_rows(rows: list[dict]) -> list[RowError]:
      # Phase-one validation. Row numbers: header = 1, first data row = 2.
      errors: list[RowError] = []
      first_seen: dict[str, int] = {}
      for i, row in enumerate(rows, start=2):
          code = (row.get("Code") or "").strip()
          if not code:
              errors.append(RowError(i, "Code is required"))
          elif code in first_seen:
              errors.append(RowError(i, f"duplicate Code '{code}' (first seen row {first_seen[code]})"))
          else:
              first_seen[code] = i

          if not (row.get("Question") or "").strip():
              errors.append(RowError(i, "Question text is required"))

          for letter in ("A", "B", "C", "D"):
              if not (row.get(letter) or "").strip():
                  errors.append(RowError(i, f"option {letter} is empty"))

          correct = (row.get("Correct") or "").strip().upper()
          if correct not in ("A", "B", "C", "D"):
              shown = (row.get("Correct") or "").strip()
              errors.append(RowError(i, f"Correct '{shown}' is not one of A, B, C, D"))
      return errors
  ```

  Leave `_read_rows`, `_summarize`, `parse_preview`, and `commit_import`
  unchanged — they already consume `validate_rows`.

  **Test:** covered by Task 2.

- [x] **Task 2 — Validation tests** _(covers acceptance criteria 1, 2, 3, 4, 5)_

  Create `server/courses/tests/test_validation.py`:

  ```python
  from django.contrib.auth import get_user_model
  from django.core.files.uploadedfile import SimpleUploadedFile
  from rest_framework.test import APITestCase

  from courses.importer import RowError, validate_rows
  from courses.models import Course, Question

  H = ["Section", "Category", "Code", "Question", "A", "B", "C", "D", "Correct"]


  def rows(*specs: dict) -> list[dict]:
      base = {k: "x" for k in H}
      base["Correct"] = "A"
      return [{**base, **s} for s in specs]


  class ValidateRowsUnitTests(APITestCase):
      def test_empty_option_flagged(self):
          errs = validate_rows(rows({"Code": "Q1", "C": ""}))
          self.assertTrue(any("option C is empty" in e.message for e in errs))

      def test_correct_must_resolve(self):
          self.assertTrue(any("not one of A, B, C, D" in e.message
                              for e in validate_rows(rows({"Code": "Q1", "Correct": "Z"}))))
          self.assertTrue(any("not one of A, B, C, D" in e.message
                              for e in validate_rows(rows({"Code": "Q1", "Correct": ""}))))

      def test_duplicate_code_flagged_on_each_repeat(self):
          errs = validate_rows(rows({"Code": "Q1"}, {"Code": "Q1"}, {"Code": "Q1"}))
          dupes = [e for e in errs if "duplicate Code 'Q1'" in e.message]
          self.assertEqual(len(dupes), 2)  # rows 3 and 4, first occurrence (row 2) not flagged
          self.assertEqual({e.row for e in dupes}, {3, 4})

      def test_valid_rows_have_no_errors(self):
          self.assertEqual(validate_rows(rows({"Code": "Q1"}, {"Code": "Q2"})), [])


  HEADER = ",".join(H) + "\n"


  class ValidationBlocksCommitTests(APITestCase):
      def setUp(self):
          self.owner = get_user_model().objects.create_user("o", email="o@x.com", password="pw12345678")
          self.course = Course.objects.create(owner=self.owner, name="C")
          self.client.force_login(self.owner)

      def _post(self, phase, body):
          f = SimpleUploadedFile("c.csv", body.encode(), content_type="text/csv")
          return self.client.post(f"/api/v1/courses/{self.course.pk}/import/{phase}/", {"file": f})

      def test_invalid_correct_blocks_commit(self):
          body = HEADER + "S,Cat,Q1,Text,a,b,c,d,Z\n"
          resp = self._post("commit", body)
          self.assertEqual(resp.status_code, 400)
          self.assertTrue(resp.json()["errors"])
          self.assertEqual(Question.objects.count(), 0)

      def test_errors_listed_in_preview(self):
          body = HEADER + "S,Cat,Q1,Text,a,,c,d,A\n"  # option B empty
          resp = self._post("preview", body)
          self.assertEqual(resp.status_code, 200)
          self.assertTrue(any("option B is empty" in e["message"] for e in resp.json()["errors"]))
  ```

  **Test:** from `server/`,
  `SECRET_KEY=test uv run python manage.py test courses.tests.test_validation -v 2`
  → 6 tests pass.

- [x] **Task 3 — Full tox green + scope guard** _(covers acceptance criteria 6)_

  `uv run ruff format .`, `uv run ruff check --fix .`, fix mypy issues.

  **Test:** `.venv/bin/tox` → format/lint/type/tests all OK. Scope guard:
  `git diff --name-only main...HEAD` shows only `server/courses/importer.py`
  (the `validate_rows` body) and `server/courses/tests/test_validation.py`; no API,
  model, or SPA changes.

---

## Self-review — acceptance-criteria coverage
1. Empty option flagged + blocks → Task 1, Task 2 `test_empty_option_flagged` / `test_errors_listed_in_preview`.
2. Correct must resolve → Task 1, Task 2 `test_correct_must_resolve` / `test_invalid_correct_blocks_commit`.
3. Duplicate Code within file → Task 1, Task 2 `test_duplicate_code_flagged_on_each_repeat`.
4. Valid CSV → no errors, imports → Task 2 `test_valid_rows_have_no_errors` (+ 0004's commit tests still green).
5. Errors surface in preview / block commit 400 → Task 2 `ValidationBlocksCommitTests`.
6. tox green; scope confined to importer + tests → Task 3.
