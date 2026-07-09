# Plan — Phase 2 · 06 · Course management UI (create + CSV upload)

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Backend under `server/` (uv+tox; `SECRET_KEY=test`). Frontend at repo root
(`src/App.jsx`, `src/api.js`; `npm run build`). Design per `design/choice.md`.
Builds on 0006 (SPA shell + api client). Do NOT alter `StudyApp`.

---

- [x] **Task 1 — Create-course endpoint** _(covers acceptance criteria 1)_

  In `server/courses/api_views.py`, change `course_list` to accept POST too:

  ```python
  @api_view(["GET", "POST"])
  @permission_classes([IsAuthenticated])
  def course_list(request: Request) -> Response:
      if request.method == "POST":
          name = (request.data.get("name") or "").strip()
          if not name:
              return Response({"errors": {"name": "Name is required"}}, status=400)
          course = Course.objects.create(
              owner=request.user, name=name, rubric=(request.data.get("rubric") or "").strip()
          )
          return Response(CourseListSerializer(course).data, status=status.HTTP_201_CREATED)
      courses = Course.objects.filter(owner=request.user).order_by("name")
      return Response(CourseListSerializer(courses, many=True).data)
  ```

  Add to `server/courses/tests/test_api_read.py` (or a new `test_course_create.py`):

  ```python
  class CourseCreateTests(APITestCase):
      def setUp(self):
          self.u = get_user_model().objects.create_user("o", email="o@x.com", password="pw12345678")

      def test_anonymous_cannot_create(self):
          self.assertEqual(self.client.post("/api/v1/courses/", {"name": "X"}).status_code, 403)

      def test_create_owned_by_caller(self):
          self.client.force_login(self.u)
          resp = self.client.post("/api/v1/courses/", {"name": "My Course", "rubric": "r"})
          self.assertEqual(resp.status_code, 201)
          self.assertEqual(resp.json()["name"], "My Course")
          from courses.models import Course
          self.assertEqual(Course.objects.get(name="My Course").owner, self.u)

      def test_name_required(self):
          self.client.force_login(self.u)
          self.assertEqual(self.client.post("/api/v1/courses/", {"name": ""}).status_code, 400)
  ```
  (add `from django.contrib.auth import get_user_model` / `APITestCase` imports if
  using a new file.)

  **Test:** `SECRET_KEY=test uv run python manage.py test courses -v 2` → all pass
  (existing + 3 new).

- [x] **Task 2 — API client additions** _(covers acceptance criteria 2, 3, 4)_

  In `src/api.js` add:

  ```js
  export async function createCourse(name, rubric) {
    const res = await req("/api/v1/courses/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rubric }),
    });
    return res.ok ? res.json() : null;
  }
  export async function importPreview(courseId, file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await req(`/api/v1/courses/${courseId}/import/preview/`, { method: "POST", body: fd });
    return res.json();
  }
  export async function importCommit(courseId, file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await req(`/api/v1/courses/${courseId}/import/commit/`, { method: "POST", body: fd });
    return { ok: res.ok, data: await res.json() };
  }
  ```
  (`req` already attaches `X-CSRFToken` for non-GET and `credentials: include`; do
  NOT set `Content-Type` on the FormData calls — the browser sets the multipart
  boundary.)

  **Test:** `npm run build` succeeds (Task 4).

- [ ] **Task 3 — Create + Upload screens in the shell** _(covers acceptance criteria 2, 3, 4)_

  In `src/App.jsx`, extend the outer `App` shell (NOT `StudyApp`). Add a `view`
  state (`null | "create" | "upload"`) and two themed components using the existing
  `styles`/`ShellCard` tokens and `design/choice.md`:

  - **`CreateCourse({ onCreated, onCancel })`**: name input + rubric textarea +
    lime "Create" button. On submit calls `createCourse(name, rubric)`; on success
    calls `onCreated(course)`.
  - **`UploadCourse({ course, onDone })`**: a file input; on file chosen, call
    `importPreview(course.id, file)` and render the summary — per-Exam→Topic rows
    with counts, a totals line, and an error list (`{row,message}`) in `#FF6699`.
    An "Import N questions" button (disabled if `summary.errors.length`) calls
    `importCommit`; on `ok` show "Imported …" + a lime "Study now" that calls
    `onDone(course)`.

  Wire them into the shell's render gates:
  - empty state (`courses.length === 0`) → primary action "Create your first
    course" sets `view = "create"`.
  - course picker → add a "New course" link setting `view = "create"`.
  - when `view === "create"` → render `CreateCourse` with `onCreated` = (course) =>
    setCourse(course), setView("upload"); refresh `courses`.
  - when `view === "upload"` and a `course` is set → render `UploadCourse` with
    `onDone` = (course) => { setView(null); setCourse(course) } (which triggers the
    existing content load → study).
  - Keep the auth gate and `StudyApp` render path unchanged; `view` only applies
    when authed and not mid-study.

  Import the three new api functions at the top:
  `import { createCourse, importPreview, importCommit, ... } from "./api.js";`

  **Test:** `npm run build` succeeds with no unresolved references (Task 4);
  browser walk in verify.

- [ ] **Task 4 — tox green + build + scope** _(covers acceptance criteria 5, 6)_

  Backend: `uv run ruff format .`, `uv run ruff check --fix .`, fix mypy;
  `.venv/bin/tox` green. Frontend: `npm run build` exit 0.

  **Test:** `.venv/bin/tox` all OK; `npm run build` writes `server/spa_dist/`.
  Scope: backend diff = `api_views.py` (course_list POST) + the create test;
  frontend diff = `src/api.js` + `src/App.jsx` shell additions (no `StudyApp`
  changes). `git diff` confirms no other files.

---

## Self-review — acceptance-criteria coverage
1. create endpoint (201/403/400) → Task 1 tests.
2. create course in browser → Task 3 (verify).
3. upload valid CSV → preview → import → study → Task 2/3 (verify).
4. invalid CSV → errors block import → Task 2/3 (verify).
5. tox green + build + browser no console errors → Task 4 + verify.
6. scope (create endpoint + create/upload screens, StudyApp untouched) → Task 4.
