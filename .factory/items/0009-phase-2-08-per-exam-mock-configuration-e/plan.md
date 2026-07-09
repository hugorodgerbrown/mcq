# Plan — Phase 2 · 08 · Per-Exam mock configuration

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Backend `server/` (uv+tox; `SECRET_KEY=test`). Frontend `src/App.jsx`/`src/api.js`
(`npm run build`). Design per `design/choice.md`. Builds on 0006 (shell/api) +
0007 (create/upload screens) + 0008 (mock uses these values).

---

- [x] **Task 1 — Exam-update endpoint** _(covers acceptance criteria 1, 2)_

  In `server/courses/api_views.py` add (`Exam` is already importable via
  `from .models import Course`; add `Exam` to that import):

  ```python
  @api_view(["PATCH"])
  @permission_classes([IsAuthenticated])
  def exam_update(request: Request, course_pk: int, exam_pk: int) -> Response:
      course = _owned_course(request, course_pk)
      if course is None:
          return Response(status=status.HTTP_403_FORBIDDEN)
      exam = get_object_or_404(Exam, pk=exam_pk, course=course)
      try:
          size = int(request.data.get("exam_size", exam.exam_size))
          mark = int(request.data.get("pass_mark", exam.pass_mark))
      except (TypeError, ValueError):
          return Response({"errors": {"detail": "Numbers required"}}, status=400)
      if size < 1:
          return Response({"errors": {"exam_size": "Must be at least 1"}}, status=400)
      if not (1 <= mark <= 100):
          return Response({"errors": {"pass_mark": "Must be 1–100"}}, status=400)
      exam.exam_size = size
      exam.pass_mark = mark
      exam.save(update_fields=["exam_size", "pass_mark"])
      return Response(
          {"id": exam.id, "name": exam.name, "exam_size": exam.exam_size, "pass_mark": exam.pass_mark}
      )
  ```

  In `server/courses/urls.py` add (keep existing routes):
  `path("<int:course_pk>/exams/<int:exam_pk>/", api_views.exam_update, name="exam-update")`.

  Add `server/courses/tests/test_exam_config.py`:

  ```python
  from django.contrib.auth import get_user_model
  from rest_framework.test import APITestCase

  from courses.models import Course, Exam


  class ExamConfigTests(APITestCase):
      def setUp(self):
          U = get_user_model()
          self.owner = U.objects.create_user("o", email="o@x.com", password="pw12345678")
          self.other = U.objects.create_user("e", email="e@x.com", password="pw12345678")
          self.course = Course.objects.create(owner=self.owner, name="C")
          self.exam = Exam.objects.create(course=self.course, name="Written", exam_size=50, pass_mark=80)

      def _url(self, cid=None, eid=None):
          return f"/api/v1/courses/{cid or self.course.pk}/exams/{eid or self.exam.pk}/"

      def test_owner_updates(self):
          self.client.force_login(self.owner)
          resp = self.client.patch(self._url(), {"exam_size": 30, "pass_mark": 60}, format="json")
          self.assertEqual(resp.status_code, 200)
          self.assertEqual(resp.json()["pass_mark"], 60)
          self.exam.refresh_from_db()
          self.assertEqual(self.exam.exam_size, 30)
          self.assertEqual(self.exam.pass_mark, 60)

      def test_anon_and_non_owner_forbidden(self):
          self.assertEqual(self.client.patch(self._url(), {"pass_mark": 50}, format="json").status_code, 403)
          self.client.force_login(self.other)
          self.assertEqual(self.client.patch(self._url(), {"pass_mark": 50}, format="json").status_code, 403)

      def test_invalid_values(self):
          self.client.force_login(self.owner)
          self.assertEqual(self.client.patch(self._url(), {"exam_size": 0}, format="json").status_code, 400)
          self.assertEqual(self.client.patch(self._url(), {"pass_mark": 150}, format="json").status_code, 400)
          self.exam.refresh_from_db()
          self.assertEqual(self.exam.pass_mark, 80)  # unchanged
  ```

  **Test:** `SECRET_KEY=test uv run python manage.py test courses.tests.test_exam_config -v 2` → 3 pass.

- [x] **Task 2 — api client + settings screen** _(covers acceptance criteria 3, 4)_

  In `src/api.js` add:
  ```js
  export async function updateExam(courseId, examId, exam_size, pass_mark) {
    const res = await req(`/api/v1/courses/${courseId}/exams/${examId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam_size, pass_mark }),
    });
    return { ok: res.ok, data: await res.json() };
  }
  ```

  In `src/App.jsx`:
  - Add an `ExamSettings({ course, exams, onSaved, onBack })` component (themed,
    `styles`/`ShellCard` tokens): one row per exam with `exam_size` and `pass_mark`
    number inputs and a lime "Save" button; on Save call `updateExam(course.id,
    exam.id, size, mark)`; on `ok` update the row and call `onSaved()`; on error
    show the field message in `#FF6699`. A muted "Back to study" calls `onBack()`.
  - In the outer `App` shell, add `"settings"` to the `view` state. When
    `view === "settings"` and `content` is loaded → render `ExamSettings` with
    `exams={content.exams}`, `onBack={() => setView(null)}`, and `onSaved` that
    re-fetches content (`getCourseContent(course.id).then(setContent)`) so the
    study modes pick up the new values.
  - Pass an `onSettings={() => setView("settings")}` prop into `StudyApp` and, in
    `StudyApp`'s top bar (next to "Change course"/"Log out"), render a "Settings"
    link calling it. This is the ONLY change to `StudyApp` — a single link in the
    top bar; do not touch the study-mode screens.

  Import `updateExam` (and keep the existing imports) at the top of `App.jsx`.

  **Test:** `npm run build`; browser walk in verify.

- [x] **Task 3 — tox + build + scope** _(covers acceptance criteria 5, 6)_

  Backend `uv run ruff format .`, `ruff check --fix .`, fix mypy; `.venv/bin/tox`
  green. Frontend `npm run build` exit 0.

  **Test:** `.venv/bin/tox` all OK; `npm run build` writes `server/spa_dist/`.
  Scope: backend diff = `api_views.py` + `urls.py` + the exam-config test; frontend
  = `src/api.js` + `src/App.jsx` (ExamSettings + shell + one top-bar link).

---

## Self-review — acceptance-criteria coverage
1. PATCH updates / 403 / 404 → Task 1 tests.
2. invalid → 400 unchanged → Task 1 `test_invalid_values`.
3. edit + persist in browser → Task 2 (verify).
4. mock reflects new pass mark → Task 2 + 0008 (verify).
5. tox + build + no console errors → Task 3 + verify.
6. scope → Task 3.
