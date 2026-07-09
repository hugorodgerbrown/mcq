# Plan — Phase 2 · 03 · Data model: Course → Exam → Topic → Question

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Builds on the server shipped in item 0001. New Django app `courses` under
`server/courses/`. Toolchain unchanged (uv + tox, Python 3.12); run commands via
`uv run …` or `.venv/bin/…` from `server/`. `pass_mark` is modelled as a
**percentage** (0–100, default 80) — the PRD default is written "80%"; the mock
stage (item 0009) derives the required correct count from it. This is the
reversible reading of the #Mock-configuration open question.

---

- [x] **Task 1 — `courses` app + models** _(covers acceptance criteria 2, 3, 4, 5)_

  Create `server/courses/__init__.py` (empty), `server/courses/apps.py`:

  ```python
  from django.apps import AppConfig


  class CoursesConfig(AppConfig):
      default_auto_field = "django.db.models.BigAutoField"
      name = "courses"
  ```

  Create `server/courses/models.py`:

  ```python
  from django.conf import settings
  from django.db import models


  class Course(models.Model):
      owner = models.ForeignKey(
          settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="courses"
      )
      name = models.CharField(max_length=200)
      rubric = models.TextField(blank=True)
      created_at = models.DateTimeField(auto_now_add=True)
      updated_at = models.DateTimeField(auto_now=True)

      def __str__(self) -> str:
          return self.name


  class Exam(models.Model):
      course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="exams")
      name = models.CharField(max_length=200)
      exam_size = models.PositiveIntegerField(default=50)
      pass_mark = models.PositiveIntegerField(default=80)  # percentage, 0–100

      class Meta:
          constraints = [
              models.CheckConstraint(
                  check=models.Q(pass_mark__lte=100), name="pass_mark_pct_max_100"
              ),
          ]

      def __str__(self) -> str:
          return f"{self.course.name} · {self.name}"


  class Topic(models.Model):
      exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="topics")
      name = models.CharField(max_length=200)

      def __str__(self) -> str:
          return self.name


  class Question(models.Model):
      class Correct(models.TextChoices):
          A = "A", "A"
          B = "B", "B"
          C = "C", "C"
          D = "D", "D"

      topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="questions")
      course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="questions")
      code = models.CharField(max_length=50)
      text = models.TextField()
      option_a = models.CharField(max_length=500)
      option_b = models.CharField(max_length=500)
      option_c = models.CharField(max_length=500)
      option_d = models.CharField(max_length=500)
      correct = models.CharField(max_length=1, choices=Correct.choices)
      explanation = models.TextField(blank=True)
      source = models.CharField(max_length=300, blank=True)

      class Meta:
          constraints = [
              models.UniqueConstraint(fields=["course", "code"], name="unique_course_code"),
              models.CheckConstraint(
                  check=models.Q(correct__in=["A", "B", "C", "D"]), name="correct_in_abcd"
              ),
          ]

      def __str__(self) -> str:
          return f"{self.code}: {self.text[:50]}"
  ```

  **Test:** none yet (models need registration + migration first — Task 2).

- [x] **Task 2 — Register app + migrations** _(covers acceptance criteria 1)_

  In `server/config/settings.py`, add `"courses"` to `INSTALLED_APPS` (after
  `"api"`).

  From `server/`: `SECRET_KEY=test uv run python manage.py makemigrations courses`
  then `SECRET_KEY=test uv run python manage.py migrate`.

  **Test:** `SECRET_KEY=test uv run python manage.py makemigrations --check --dry-run`
  exits 0 (no missing migrations); `migrate` applies cleanly (acceptance 1).

- [x] **Task 3 — Model tests** _(covers acceptance criteria 2, 3, 4, 5)_

  Create `server/courses/tests/__init__.py` (empty) and
  `server/courses/tests/test_models.py`:

  ```python
  from django.contrib.auth import get_user_model
  from django.db import IntegrityError, transaction
  from django.test import TestCase

  from courses.models import Course, Exam, Question, Topic


  class DataModelTests(TestCase):
      @classmethod
      def setUpTestData(cls):
          cls.user = get_user_model().objects.create_user("author", password="x")
          cls.course = Course.objects.create(owner=cls.user, name="DSC1")
          cls.exam = Exam.objects.create(course=cls.course, name="Written", exam_size=50)
          cls.topic = Topic.objects.create(exam=cls.exam, name="Law")

      def _question(self, course, code, correct="A"):
          return Question.objects.create(
              topic=self.topic, course=course, code=code, text="Q?",
              option_a="a", option_b="b", option_c="c", option_d="d", correct=correct,
          )

      def test_reverse_accessors_resolve(self):
          self._question(self.course, "Q1")
          self.assertEqual(self.course.exams.count(), 1)
          self.assertEqual(self.exam.topics.count(), 1)
          self.assertEqual(self.topic.questions.count(), 1)
          self.assertEqual(self.course.questions.count(), 1)

      def test_code_unique_within_course(self):
          self._question(self.course, "Q1")
          with self.assertRaises(IntegrityError), transaction.atomic():
              self._question(self.course, "Q1")

      def test_same_code_allowed_across_courses(self):
          other = Course.objects.create(owner=self.user, name="Other")
          self._question(self.course, "Q1")
          # different course, same code — allowed
          self._question(other, "Q1")
          self.assertEqual(Question.objects.filter(code="Q1").count(), 2)

      def test_correct_must_be_abcd(self):
          with self.assertRaises(IntegrityError), transaction.atomic():
              self._question(self.course, "QX", correct="Z")

      def test_pass_mark_defaults_to_80(self):
          exam = Exam.objects.create(course=self.course, name="Hygiene")
          self.assertEqual(exam.pass_mark, 80)
          self.assertEqual(exam.exam_size, 50)
  ```

  **Test:** from `server/`,
  `SECRET_KEY=test uv run python manage.py test courses -v 2` → all 5 tests pass.

- [x] **Task 4 — Full tox green + scope guard** _(covers acceptance criteria 6, 7)_

  Run `uv run ruff format .` and `uv run ruff check --fix .`. Ensure mypy (type
  env) passes for the new module.

  **Test:** from `server/`, `.venv/bin/tox` → format/lint/type/tests all OK
  (acceptance 6). Scope guard (acceptance 7):
  `git status --porcelain` shows changes only under `server/courses/` and the one
  `INSTALLED_APPS` line in `server/config/settings.py` — no serializer/view/API or
  import code, and no SPA files.

---

## Self-review — acceptance-criteria coverage

1. makemigrations clean + migrate → Task 2.
2. Models + reverse accessors → Task 1, Task 3 (`test_reverse_accessors_resolve`).
3. Per-course code uniqueness → Task 1 constraint, Task 3 (`test_code_unique_within_course`, `test_same_code_allowed_across_courses`).
4. `correct` ∈ {A,B,C,D} → Task 1 CheckConstraint, Task 3 (`test_correct_must_be_abcd`).
5. `exam_size`/`pass_mark` stored, `pass_mark` default 80 → Task 1, Task 3 (`test_pass_mark_defaults_to_80`).
6. `check` passes, tox green incl. model tests → Task 4.
7. Scope guard — only the `courses` app + one settings line → Task 4.
