# Plan — Phase 2 · 01 · Django backend foundation

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Stack (from spec Assumptions): Django 5.2 LTS, Python 3.12, Django REST
Framework, `dj-database-url` (SQLite dev / Postgres prod), WhiteNoise for
single-origin static serving, Gunicorn for prod, tox as the CI/local entrypoint.
Server lives in `server/` at the repo root; the SPA (`src/`, `index.html`,
`vite.config.js`, `package.json`) is untouched.

**Toolchain — uv.** System `python3` is 3.9; this project uses **uv** to
provision Python 3.12 and manage the venv (uv is installed; matches the
uv+tox standard). tox runs under the **`tox-uv`** plugin so tox provisions its
environments with uv. All `python`/`manage.py`/`tox` commands below run inside
the uv venv — invoke them as `uv run <cmd>` (e.g. `uv run python manage.py
check`) or via `.venv/bin/<cmd>` after `uv venv`. A `.python-version` pinning
`3.12` is written into `server/`.

Layout produced:

```
server/
  manage.py
  pyproject.toml
  tox.ini
  config/            # Django project package
    __init__.py
    settings.py
    urls.py
    wsgi.py
    asgi.py
  api/               # base JSON API app
    __init__.py
    apps.py
    urls.py
    views.py
    exceptions.py
    tests/
      __init__.py
      test_health.py
render.yaml          # updated at repo root
```

All commands run from `server/` unless stated. Bootstrap once with uv:
`uv venv --python 3.12 .venv` then `uv pip install -e '.[dev]'`. Run project
commands via the venv — `uv run python manage.py …`, `.venv/bin/tox`. `tox`
(with `tox-uv`) provisions each env with uv.

---

- [x] **Task 1 — Project scaffold, dependencies, tox** _(covers acceptance criteria 1, 5)_

  Create `server/pyproject.toml`:

  ```toml
  [project]
  name = "dsc1-server"
  version = "0.1.0"
  requires-python = ">=3.12"
  dependencies = [
      "Django>=5.2,<5.3",
      "djangorestframework>=3.15",
      "dj-database-url>=2.2",
      "whitenoise>=6.7",
      "gunicorn>=23.0",
      "psycopg[binary]>=3.2",
  ]

  [project.optional-dependencies]
  dev = ["ruff>=0.6", "mypy>=1.11", "django-stubs>=5.0", "tox>=4.18", "tox-uv>=1.11"]

  [tool.ruff]
  line-length = 100
  target-version = "py312"

  [tool.mypy]
  python_version = "3.12"
  ignore_missing_imports = true
  ```

  Create `server/tox.ini` (one env per check, per the tox-for-CI standard):

  ```ini
  [tox]
  envlist = format, lint, type, tests
  skipsdist = false

  [testenv]
  runner = uv-venv-lock-runner
  extras = dev
  setenv =
      DJANGO_SETTINGS_MODULE = config.settings
      SECRET_KEY = test-secret-not-for-production

  [testenv:format]
  commands = ruff format --check .

  [testenv:lint]
  commands = ruff check .

  [testenv:type]
  commands = mypy config api

  [testenv:tests]
  commands = python manage.py test -v 2
  ```

  Create `server/manage.py` (standard Django manage.py with
  `DJANGO_SETTINGS_MODULE = "config.settings"`), and empty `config/__init__.py`.

  **Test:** from `server/`, `python -c "import tomllib,pathlib; tomllib.loads(pathlib.Path('pyproject.toml').read_text())"` exits 0 (valid TOML). Full check deferred to Task 6's `tox`.

- [ ] **Task 2 — Environment-driven settings + database resolution** _(covers acceptance criteria 2, 3)_

  Create `server/config/settings.py`:

  ```python
  import os
  from pathlib import Path

  import dj_database_url

  BASE_DIR = Path(__file__).resolve().parent.parent

  SECRET_KEY = os.environ["SECRET_KEY"] if not os.environ.get("DEBUG", "1") == "1" \
      else os.environ.get("SECRET_KEY", "dev-insecure-key")
  DEBUG = os.environ.get("DEBUG", "1") == "1"
  ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

  INSTALLED_APPS = [
      "django.contrib.contenttypes",
      "django.contrib.auth",
      "django.contrib.staticfiles",
      "rest_framework",
      "api",
  ]

  MIDDLEWARE = [
      "django.middleware.security.SecurityMiddleware",
      "whitenoise.middleware.WhiteNoiseMiddleware",
      "django.middleware.common.CommonMiddleware",
  ]

  ROOT_URLCONF = "config.urls"
  WSGI_APPLICATION = "config.wsgi.application"

  TEMPLATES = [{
      "BACKEND": "django.template.backends.django.DjangoTemplates",
      "DIRS": [],
      "APP_DIRS": True,
      "OPTIONS": {"context_processors": []},
  }]

  DATABASES = {
      "default": dj_database_url.config(
          default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
          conn_max_age=600,
      )
  }

  # Single-origin static serving of the built SPA bundle (dist/).
  STATIC_URL = "static/"
  STATIC_ROOT = BASE_DIR / "staticfiles"
  STORAGES = {
      "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
      "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
  }

  REST_FRAMEWORK = {
      "EXCEPTION_HANDLER": "api.exceptions.json_exception_handler",
  }

  DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
  ```

  **Test:** create `server/config/wsgi.py` and `asgi.py` (standard Django
  `get_wsgi_application` / `get_asgi_application` using `config.settings`), then
  from `server/` with `SECRET_KEY=test DEBUG=1`, run
  `python manage.py check` — must exit 0 (acceptance 1). Command:
  `SECRET_KEY=test python manage.py check`.

- [ ] **Task 3 — API app, health endpoint, JSON error shape** _(covers acceptance criteria 4)_

  Create `server/api/__init__.py` (empty), `server/api/apps.py`:

  ```python
  from django.apps import AppConfig

  class ApiConfig(AppConfig):
      default_auto_field = "django.db.models.BigAutoField"
      name = "api"
  ```

  Create `server/api/exceptions.py`:

  ```python
  from rest_framework.views import exception_handler

  def json_exception_handler(exc, context):
      response = exception_handler(exc, context)
      if response is not None:
          response.data = {"error": {"status": response.status_code, "detail": response.data}}
      return response
  ```

  Create `server/api/views.py`:

  ```python
  from rest_framework.decorators import api_view
  from rest_framework.request import Request
  from rest_framework.response import Response

  @api_view(["GET"])
  def health(_request: Request) -> Response:
      return Response({"status": "ok"})
  ```

  Create `server/api/urls.py`:

  ```python
  from django.urls import path

  from . import views

  app_name = "api"
  urlpatterns = [path("health/", views.health, name="health")]
  ```

  **Test:** deferred to Task 5 (full URL wiring) and Task 6 (`tox`).

- [ ] **Task 4 — Root URLconf: versioned API + SPA fallback** _(covers acceptance criteria 4, criteria 6 by not touching SPA)_

  Create `server/config/urls.py`:

  ```python
  from django.urls import include, path

  urlpatterns = [
      path("api/v1/", include("api.urls")),
  ]
  ```

  (SPA fallback view is wired in item 0006/DSC-9 once the build is served; the
  single-origin static hook — WhiteNoise + STATIC_ROOT — is already configured
  in Task 2. Do not modify any file under `src/` or repo-root SPA files.)

  **Test:** `SECRET_KEY=test python manage.py check` still exits 0.

- [ ] **Task 5 — Health-endpoint test** _(covers acceptance criteria 4, 5)_

  Create `server/api/tests/__init__.py` (empty) and `server/api/tests/test_health.py`:

  ```python
  from rest_framework import status
  from rest_framework.test import APITestCase

  class HealthEndpointTests(APITestCase):
      def test_health_returns_200_ok(self):
          response = self.client.get("/api/v1/health/")
          self.assertEqual(response.status_code, status.HTTP_200_OK)
          self.assertEqual(response.json(), {"status": "ok"})
  ```

  **Test:** from `server/`, run
  `SECRET_KEY=test python manage.py test api -v 2` — the test passes (1 test, OK).

- [ ] **Task 6 — Full tox pass + Render service definition** _(covers acceptance criteria 5, 7)_

  Run `ruff format .` then `ruff check --fix .` so the format/lint envs pass.

  Update repo-root `render.yaml` to build and serve the Django app single-origin
  (replaces the current static-site block):

  ```yaml
  services:
    - type: web
      name: dsc1-server
      runtime: python
      rootDir: server
      buildCommand: "pip install -e . && python manage.py collectstatic --noinput && python manage.py migrate"
      startCommand: "gunicorn config.wsgi:application"
      envVars:
        - key: DEBUG
          value: "0"
        - key: SECRET_KEY
          generateValue: true
        - key: ALLOWED_HOSTS
          sync: false
        - key: DATABASE_URL
          sync: false
      headers:
        - path: /*
          name: X-Frame-Options
          value: SAMEORIGIN
  ```

  **Test:** from `server/`, run `tox` — all four environments
  (`format`, `lint`, `type`, `tests`) report success. Command: `tox`.
  Then confirm the SPA files are unchanged: `git status --porcelain src index.html vite.config.js package.json` prints nothing (acceptance 6).

---

## Self-review — acceptance-criteria coverage

1. `manage.py check` passes → Task 2 test, Task 4 test.
2. Env-driven settings, no committed secret → Task 2.
3. SQLite default / Postgres via `DATABASE_URL`, `migrate` succeeds → Task 2 (`dj_database_url.config`), Task 6 build (`migrate`).
4. `GET /api/v1/health/` → 200 JSON → Tasks 3, 4, 5.
5. `tox` passes incl. health test; format/lint/type envs defined → Tasks 1, 5, 6.
6. SPA files unchanged → Tasks 4, 6 (explicit git check).
7. Render service definition builds/serves Django single-origin → Task 6.
