# Plan — Phase 2 · 04 · CSV ingestion pipeline

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Builds on 0002 (models) + 0003 (auth). New code in the `courses` app. Toolchain
unchanged (uv + tox, Python 3.12); run via `uv run …` / `.venv/bin/…` from
`server/`, `SECRET_KEY=test` for manage.py. API + response shapes per
`design/choice.md`.

---

- [x] **Task 1 — `courses/importer.py`** _(covers acceptance criteria 1, 2, 3, 4)_

  Create `server/courses/importer.py`:

  ```python
  import csv
  import io
  from dataclasses import dataclass

  from django.db import transaction

  from .models import Exam, Question, Topic

  REQUIRED_HEADERS = ["Section", "Category", "Code", "Question", "A", "B", "C", "D", "Correct"]


  @dataclass
  class RowError:
      row: int
      message: str


  class ImportValidationError(Exception):
      def __init__(self, errors: list["RowError"]) -> None:
          self.errors = errors
          super().__init__(f"{len(errors)} row error(s)")


  def _read_rows(file) -> tuple[list[dict], list[RowError]]:
      data = file.read()
      if isinstance(data, bytes):
          data = data.decode("utf-8-sig")
      reader = csv.DictReader(io.StringIO(data))
      headers = reader.fieldnames or []
      missing = [h for h in REQUIRED_HEADERS if h not in headers]
      if missing:
          return [], [RowError(1, f"Missing required column(s): {', '.join(missing)}")]
      return list(reader), []


  def validate_rows(rows: list[dict]) -> list[RowError]:
      # Structural validation only; item 0005 hardens (options non-empty,
      # Correct resolves, Code unique in file). Row numbers: header=1, first data=2.
      errors: list[RowError] = []
      for i, row in enumerate(rows, start=2):
          if not (row.get("Code") or "").strip():
              errors.append(RowError(i, "Code is required"))
          if not (row.get("Question") or "").strip():
              errors.append(RowError(i, "Question text is required"))
      return errors


  def _summarize(course, rows: list[dict]) -> dict:
      existing = set(Question.objects.filter(course=course).values_list("code", flat=True))
      exams: dict[str, dict[str, int]] = {}
      new = updated = 0
      for row in rows:
          section = (row.get("Section") or "").strip()
          category = (row.get("Category") or "").strip()
          exams.setdefault(section, {}).setdefault(category, 0)
          exams[section][category] += 1
          if (row.get("Code") or "").strip() in existing:
              updated += 1
          else:
              new += 1
      exams_list = [
          {"name": s, "topics": [{"name": t, "questions": c} for t, c in topics.items()]}
          for s, topics in exams.items()
      ]
      return {"totals": {"rows": len(rows), "new": new, "updated": updated}, "exams": exams_list}


  def parse_preview(course, file) -> dict:
      rows, errors = _read_rows(file)
      errors = errors + validate_rows(rows)
      summary = _summarize(course, rows)
      summary["errors"] = [{"row": e.row, "message": e.message} for e in errors]
      return summary


  @transaction.atomic
  def commit_import(course, file) -> dict:
      rows, errors = _read_rows(file)
      errors = errors + validate_rows(rows)
      if errors:
          raise ImportValidationError(errors)
      exams_seen: set[int] = set()
      topics_seen: set[int] = set()
      created = updated = 0
      for row in rows:
          exam, _ = Exam.objects.get_or_create(course=course, name=row["Section"].strip())
          exams_seen.add(exam.pk)
          topic, _ = Topic.objects.get_or_create(exam=exam, name=row["Category"].strip())
          topics_seen.add(topic.pk)
          _, was_created = Question.objects.update_or_create(
              course=course,
              code=row["Code"].strip(),
              defaults={
                  "topic": topic,
                  "text": row["Question"].strip(),
                  "option_a": row["A"],
                  "option_b": row["B"],
                  "option_c": row["C"],
                  "option_d": row["D"],
                  "correct": (row["Correct"] or "").strip().upper(),
                  "explanation": (row.get("Explanation") or "").strip(),
                  "source": (row.get("Source") or "").strip(),
              },
          )
          created += was_created
          updated += not was_created
      return {
          "exams": len(exams_seen),
          "topics": len(topics_seen),
          "questions_created": created,
          "questions_updated": updated,
      }
  ```

  **Test:** covered by Task 3.

- [x] **Task 2 — API views + URLs** _(covers acceptance criteria 5)_

  Create `server/courses/api_views.py`:

  ```python
  from django.shortcuts import get_object_or_404
  from rest_framework import status
  from rest_framework.decorators import api_view, parser_classes, permission_classes
  from rest_framework.parsers import FormParser, MultiPartParser
  from rest_framework.permissions import IsAuthenticated
  from rest_framework.request import Request
  from rest_framework.response import Response

  from . import importer
  from .models import Course


  def _owned_course(request: Request, pk: int) -> Course | None:
      course = get_object_or_404(Course, pk=pk)
      return course if course.owner_id == request.user.id else None


  @api_view(["POST"])
  @permission_classes([IsAuthenticated])
  @parser_classes([MultiPartParser, FormParser])
  def import_preview(request: Request, pk: int) -> Response:
      course = _owned_course(request, pk)
      if course is None:
          return Response(status=status.HTTP_403_FORBIDDEN)
      upload = request.FILES.get("file")
      if not upload:
          return Response({"errors": [{"row": 0, "message": "No file uploaded"}]}, status=400)
      return Response(importer.parse_preview(course, upload))


  @api_view(["POST"])
  @permission_classes([IsAuthenticated])
  @parser_classes([MultiPartParser, FormParser])
  def import_commit(request: Request, pk: int) -> Response:
      course = _owned_course(request, pk)
      if course is None:
          return Response(status=status.HTTP_403_FORBIDDEN)
      upload = request.FILES.get("file")
      if not upload:
          return Response({"errors": [{"row": 0, "message": "No file uploaded"}]}, status=400)
      try:
          result = importer.commit_import(course, upload)
      except importer.ImportValidationError as exc:
          return Response(
              {"errors": [{"row": e.row, "message": e.message} for e in exc.errors]}, status=400
          )
      return Response(result)
  ```

  Create `server/courses/urls.py`:

  ```python
  from django.urls import path

  from . import api_views

  app_name = "courses"
  urlpatterns = [
      path("<int:pk>/import/preview/", api_views.import_preview, name="import-preview"),
      path("<int:pk>/import/commit/", api_views.import_commit, name="import-commit"),
  ]
  ```

  In `server/config/urls.py` add
  `path("api/v1/courses/", include("courses.urls"))` (keep the existing
  `include`s).

  **Test:** covered by Task 3.

- [x] **Task 3 — Tests** _(covers acceptance criteria 1, 2, 3, 4, 5)_

  Create `server/courses/tests/test_importer.py`:

  ```python
  from django.contrib.auth import get_user_model
  from django.core.files.uploadedfile import SimpleUploadedFile
  from rest_framework import status
  from rest_framework.test import APITestCase

  from courses.models import Course, Question

  HEADER = "Section,Category,Code,Question,A,B,C,D,Correct,Explanation,Source\n"
  ROW = "Written,Law,Q1,What?,a,b,c,d,A,,\n"
  ROW2 = "Written,Law,Q2,Why?,a,b,c,d,B,,\n"


  def csv_file(body: str, name: str = "c.csv") -> SimpleUploadedFile:
      return SimpleUploadedFile(name, body.encode("utf-8"), content_type="text/csv")


  class ImportApiTests(APITestCase):
      def setUp(self):
          User = get_user_model()
          self.owner = User.objects.create_user("owner", email="o@x.com", password="pw12345678")
          self.other = User.objects.create_user("other", email="e@x.com", password="pw12345678")
          self.course = Course.objects.create(owner=self.owner, name="DSC1")

      def _url(self, phase):
          return f"/api/v1/courses/{self.course.pk}/import/{phase}/"

      def test_preview_does_not_write(self):
          self.client.force_login(self.owner)
          resp = self.client.post(self._url("preview"), {"file": csv_file(HEADER + ROW + ROW2)})
          self.assertEqual(resp.status_code, 200)
          self.assertEqual(resp.json()["totals"], {"rows": 2, "new": 2, "updated": 0})
          self.assertEqual(Question.objects.count(), 0)  # nothing written

      def test_commit_creates(self):
          self.client.force_login(self.owner)
          resp = self.client.post(self._url("commit"), {"file": csv_file(HEADER + ROW + ROW2)})
          self.assertEqual(resp.status_code, 200)
          self.assertEqual(resp.json()["questions_created"], 2)
          self.assertEqual(Question.objects.filter(course=self.course).count(), 2)

      def test_reupload_merges_on_code(self):
          self.client.force_login(self.owner)
          self.client.post(self._url("commit"), {"file": csv_file(HEADER + ROW + ROW2)})
          # change Q1 answer to C, add Q3; Q2 omitted (must stay, no wipe)
          changed = HEADER + "Written,Law,Q1,What?,a,b,c,d,C,,\n" + "Written,Law,Q3,New?,a,b,c,d,D,,\n"
          resp = self.client.post(self._url("commit"), {"file": csv_file(changed)})
          self.assertEqual(resp.status_code, 200)
          self.assertEqual(Question.objects.filter(course=self.course).count(), 3)  # Q1,Q2,Q3
          self.assertEqual(Question.objects.get(course=self.course, code="Q1").correct, "C")

      def test_missing_header_blocks_commit(self):
          self.client.force_login(self.owner)
          bad = "Section,Category,Code,Question,A,B,C,D\n" + "Written,Law,Q1,What?,a,b,c,d\n"
          resp = self.client.post(self._url("commit"), {"file": csv_file(bad)})
          self.assertEqual(resp.status_code, 400)
          self.assertTrue(resp.json()["errors"])
          self.assertEqual(Question.objects.count(), 0)

      def test_requires_auth_and_ownership(self):
          # anonymous
          self.assertEqual(
              self.client.post(self._url("preview"), {"file": csv_file(HEADER + ROW)}).status_code,
              status.HTTP_403_FORBIDDEN,
          )
          # non-owner
          self.client.force_login(self.other)
          self.assertEqual(
              self.client.post(self._url("preview"), {"file": csv_file(HEADER + ROW)}).status_code,
              status.HTTP_403_FORBIDDEN,
          )
  ```

  **Test:** from `server/`,
  `SECRET_KEY=test uv run python manage.py test courses.tests.test_importer -v 2`
  → 5 tests pass.

- [x] **Task 4 — Full tox green + scope guard** _(covers acceptance criteria 6, 7)_

  `uv run ruff format .`, `uv run ruff check --fix .`, fix mypy issues (type env).

  **Test:** `.venv/bin/tox` → format/lint/type/tests all OK (acceptance 6).
  Scope guard (acceptance 7): `git diff --name-only main...HEAD` shows only
  `server/courses/*` (importer, api_views, urls, tests) and one `include` line in
  `server/config/urls.py`; 0 SPA files.

---

## Self-review — acceptance-criteria coverage
1. preview returns structure + no write → Task 1, Task 3 `test_preview_does_not_write`.
2. commit creates → Task 1, Task 3 `test_commit_creates`.
3. re-upload merges on Code, no wipe → Task 1 `update_or_create`, Task 3 `test_reupload_merges_on_code`.
4. missing header / bad row blocks commit (400) → Task 1 `_read_rows`/`validate_rows`, Task 3 `test_missing_header_blocks_commit`.
5. auth + ownership 403 → Task 2 `_owned_course`, Task 3 `test_requires_auth_and_ownership`.
6. tox green → Task 4.
7. scope guard → Task 4.
