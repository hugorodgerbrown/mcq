# Plan — Phase 2 · 09 · SPA ↔ JSON API integration + single-origin deploy

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Backend under `server/` (uv+tox, Python 3.12; `SECRET_KEY=test` for manage.py).
Frontend at repo root (`src/`, Node 18+, `npm`). Design per `design/choice.md`.
Refactor `src/App.jsx` **in place** — keep the study UI, swap the data source.

---

- [x] **Task 1 — Read API: serializers + views + urls** _(covers acceptance criteria 1, 2)_

  Create `server/courses/serializers.py`:

  ```python
  from rest_framework import serializers

  from .models import Course, Exam, Question, Topic


  class CourseListSerializer(serializers.ModelSerializer):
      class Meta:
          model = Course
          fields = ["id", "name", "rubric"]


  class QuestionSerializer(serializers.ModelSerializer):
      options = serializers.SerializerMethodField()

      class Meta:
          model = Question
          fields = ["id", "code", "text", "options", "correct", "explanation", "source"]

      def get_options(self, obj: Question) -> dict:
          return {"A": obj.option_a, "B": obj.option_b, "C": obj.option_c, "D": obj.option_d}


  class TopicSerializer(serializers.ModelSerializer):
      questions = QuestionSerializer(many=True, read_only=True)

      class Meta:
          model = Topic
          fields = ["id", "name", "questions"]


  class ExamSerializer(serializers.ModelSerializer):
      topics = TopicSerializer(many=True, read_only=True)

      class Meta:
          model = Exam
          fields = ["id", "name", "exam_size", "pass_mark", "topics"]


  class CourseContentSerializer(serializers.ModelSerializer):
      exams = ExamSerializer(many=True, read_only=True)

      class Meta:
          model = Course
          fields = ["id", "name", "exams"]
  ```

  In `server/courses/api_views.py` add (keep existing imports/views):

  ```python
  from .serializers import CourseContentSerializer, CourseListSerializer


  @api_view(["GET"])
  @permission_classes([IsAuthenticated])
  def course_list(request: Request) -> Response:
      courses = Course.objects.filter(owner=request.user).order_by("name")
      return Response(CourseListSerializer(courses, many=True).data)


  @api_view(["GET"])
  @permission_classes([IsAuthenticated])
  def course_content(request: Request, pk: int) -> Response:
      course = _owned_course(request, pk)
      if course is None:
          return Response(status=status.HTTP_403_FORBIDDEN)
      return Response(CourseContentSerializer(course).data)
  ```

  In `server/courses/urls.py` add to `urlpatterns` (keep the import routes):

  ```python
  path("", api_views.course_list, name="list"),
  path("<int:pk>/content/", api_views.course_content, name="content"),
  ```

  Add `server/courses/tests/test_api_read.py`:

  ```python
  from django.contrib.auth import get_user_model
  from rest_framework.test import APITestCase

  from courses.models import Course, Exam, Question, Topic


  class ReadApiTests(APITestCase):
      def setUp(self):
          U = get_user_model()
          self.owner = U.objects.create_user("o", email="o@x.com", password="pw12345678")
          self.other = U.objects.create_user("e", email="e@x.com", password="pw12345678")
          self.course = Course.objects.create(owner=self.owner, name="DSC1")
          exam = Exam.objects.create(course=self.course, name="Written", exam_size=50, pass_mark=80)
          topic = Topic.objects.create(exam=exam, name="Law")
          Question.objects.create(
              topic=topic, course=self.course, code="Q1", text="?",
              option_a="a", option_b="b", option_c="c", option_d="d", correct="A", source="ref",
          )

      def test_course_list_owner_only(self):
          self.assertEqual(self.client.get("/api/v1/courses/").status_code, 403)  # anon
          self.client.force_login(self.other)
          self.assertEqual(self.client.get("/api/v1/courses/").json(), [])  # sees none
          self.client.force_login(self.owner)
          data = self.client.get("/api/v1/courses/").json()
          self.assertEqual([c["name"] for c in data], ["DSC1"])

      def test_content_nested_and_owner_scoped(self):
          self.assertEqual(self.client.get(f"/api/v1/courses/{self.course.pk}/content/").status_code, 403)
          self.client.force_login(self.other)
          self.assertEqual(self.client.get(f"/api/v1/courses/{self.course.pk}/content/").status_code, 403)
          self.client.force_login(self.owner)
          data = self.client.get(f"/api/v1/courses/{self.course.pk}/content/").json()
          self.assertEqual(data["exams"][0]["topics"][0]["questions"][0]["options"],
                           {"A": "a", "B": "b", "C": "c", "D": "d"})
          self.assertEqual(data["exams"][0]["pass_mark"], 80)
  ```

  **Test:** `SECRET_KEY=test uv run python manage.py test courses.tests.test_api_read -v 2` → 2 tests pass.

- [x] **Task 2 — Single-origin serving** _(covers acceptance criteria 3)_

  Edit repo-root `vite.config.js` so the build targets Django and assets resolve
  under `/static/`:

  ```js
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    base: "/static/",
    plugins: [react()],
    build: { outDir: "server/spa_dist", emptyOutDir: true },
  });
  ```

  In `server/config/settings.py`: add the built SPA dir to staticfiles so its
  hashed assets are collected and served by WhiteNoise —
  `STATICFILES_DIRS = [BASE_DIR / "spa_dist"]` (create the setting; guard for the
  dir not existing yet is unnecessary — Django tolerates a missing dir with a
  warning, but prefer adding it only when present: use
  `STATICFILES_DIRS = [BASE_DIR / "spa_dist"] if (BASE_DIR / "spa_dist").exists() else []`).

  Add the SPA catch-all in `server/config/urls.py` (keep `api/v1/`, `accounts/`):

  ```python
  import re
  from django.conf import settings
  from django.http import HttpResponse
  from django.urls import include, path, re_path
  from django.views.decorators.csrf import ensure_csrf_cookie


  @ensure_csrf_cookie
  def spa_index(request):
      index = settings.BASE_DIR / "spa_dist" / "index.html"
      if not index.exists():
          return HttpResponse("SPA not built. Run `npm run build`.", content_type="text/plain")
      return HttpResponse(index.read_text(), content_type="text/html")


  urlpatterns = [
      path("api/v1/", include("api.urls")),
      path("api/v1/courses/", include("courses.urls")),
      path("accounts/", include("allauth.urls")),
      path("", spa_index),
      re_path(r"^(?!api/|accounts/|static/).*$", spa_index),
  ]
  ```

  Update repo-root `render.yaml` buildCommand to build the SPA before
  collectstatic: `npm install && npm run build && pip install -e . && python
  manage.py collectstatic --noinput && python manage.py migrate` (note the SPA
  build runs from repo root; keep `rootDir: server` for the Python service but the
  build must `cd` to repo root for npm — set buildCommand to
  `cd .. && npm install && npm run build && cd server && pip install -e . && python manage.py collectstatic --noinput && python manage.py migrate`).

  **Test:** from repo root `npm install && npm run build` → `server/spa_dist/index.html`
  exists and references `/static/assets/…`. Then from `server/`:
  `SECRET_KEY=test DEBUG=1 uv run python manage.py collectstatic --noinput` and a
  Django check pass. (Browser serving verified in the verify stage.)

- [x] **Task 3 — SPA api client + auth/course shell** _(covers acceptance criteria 4, 5, 6)_

  Create `src/api.js`:

  ```js
  function getCookie(name) {
    const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return m ? m.pop() : "";
  }

  async function req(path, options = {}) {
    const opts = { credentials: "include", headers: {}, ...options };
    if (opts.method && opts.method !== "GET") {
      opts.headers["X-CSRFToken"] = getCookie("csrftoken");
    }
    const res = await fetch(path, opts);
    return res;
  }

  export async function getMe() {
    const res = await req("/api/v1/me/");
    return res.ok ? res.json() : null;
  }
  export async function listCourses() {
    const res = await req("/api/v1/courses/");
    return res.ok ? res.json() : [];
  }
  export async function getCourseContent(id) {
    const res = await req(`/api/v1/courses/${id}/content/`);
    return res.ok ? res.json() : null;
  }
  ```

  Refactor `src/App.jsx` in place:
  - **Remove** the bundled data constants `QUESTIONS`, `MEAT_QUESTIONS`,
    `WRITTEN_DECKS`, `MEAT_DECKS`, `TRACKS`, `TRACK_LIST` (the app no longer ships
    question data — acceptance 6). Keep `styles`, `shuffle`, `LETTERS`,
    `hasAnswer`, and all the study-UI render code.
  - Rename the current `export default function App()` to
    `function StudyApp({ tracks, trackKeys, courseName, onChangeCourse })` and make
    it read `tracks`/`trackKeys` (the mapped data) instead of the removed
    `TRACKS`/`TRACK_LIST`. Its `track` state initialises to `trackKeys[0]`.
  - Add a **deck palette** constant reused for topic colors:
    `const DECK_PALETTE = ["#CCFF66","#FFCC33","#66CCFF","#FF6699","#FF9900","#B8E986","#E8B96A","#E8896A","#9A8CE8","#6AD5E8","#E86AB8"];`
  - Add a mapper `contentToTracks(content)` returning
    `{ tracks: { [examId]: {id, label: exam.name, title: exam.name, questions:
    [...], decks: [...], speciesCats: new Set(), examSize: exam.exam_size,
    examPass: Math.round(exam.pass_mark/100*exam.exam_size)} }, trackKeys: [examId…] }`
    where each question maps to `{id, cat: topic.name, q: text, A: options.A,
    B: options.B, C: options.C, D: options.D, correct, explanation, source}` and
    each deck to `{cat: topic.name, short: topic.name, color: DECK_PALETTE[i % …]}`.
  - Add the new top-level `export default function App()` implementing the shell:
    `useEffect` on mount → `getMe()`; states `auth` (null=loading, false=anon,
    user), `courses`, `course`, `content`. Render:
    - loading → a themed spinner/"Loading…" card;
    - `auth === false` → **login screen** (themed card, heading, one line, lime
      button linking to `/accounts/login/`);
    - authed, no course selected → fetch `listCourses()`; 0 → themed empty state
      linking to `/accounts/` or a note that course creation is coming (item 0007);
      1 → auto-select; 2+ → themed picker (deck-row style);
    - course selected → `getCourseContent(id)` → `StudyApp` with
      `contentToTracks(content)`, `courseName`, and `onChangeCourse` (clears
      selection). A minimal top bar shows the course name, a "change course" link
      (if >1), and a logout link to `/accounts/logout/`.
  - Reuse `styles` tokens for every new screen (no new palette).

  Keep all study-mode components/behavior byte-for-byte where possible — only the
  data source and the outer shell change.

  **Test:** `npm run build` succeeds (no unresolved refs to the removed
  constants). Browser verification in the verify stage.

- [x] **Task 4 — tox green + build + scope** _(covers acceptance criteria 7)_

  Backend: `uv run ruff format .`, `uv run ruff check --fix .`, fix mypy;
  `.venv/bin/tox` green. Frontend: `npm run build` succeeds.

  **Test:** `.venv/bin/tox` → all OK; `npm run build` exits 0 and writes
  `server/spa_dist/`. Add `server/spa_dist/` to `.gitignore` (build artifact — do
  not commit it). Confirm `git status` shows no `spa_dist/` tracked.

---

## Self-review — acceptance-criteria coverage
1. courses list owner-scoped, 403 anon → Task 1 `test_course_list_owner_only`.
2. content nested, owner-scoped 403 → Task 1 `test_content_nested_and_owner_scoped`.
3. Django serves SPA at `/` + catch-all, API/accounts unaffected → Task 2 (browser-confirmed in verify).
4. anon `/` → themed login prompt → Task 3 (browser, verify).
5. after login, seeded course questions load + MCQ/Flashcard/Exam work → Task 3 (browser, verify).
6. no bundled question data → Task 3 (constants removed).
7. tox green + `npm run build` + no console errors → Task 4 + verify.
