# Spec — Phase 2 · 01 · Django backend foundation

## Purpose

Phase 2 turns the single-course, hard-coded revision SPA into a multi-tenant,
self-service app backed by a Django server that owns auth, persistence, and a
JSON API the React/Vite SPA consumes (source: brain/vision.md Phase 2;
brain/constraints.md Phase 2; docs/factory/prd/dsc1-phase-2.md#In-scope). This
item builds only the server skeleton every later ticket depends on: project
layout, environment-driven settings, a base JSON API app with a health
endpoint, a test/lint entrypoint, and the single-origin static-serving hook.
Domain models (item 0002), auth (0003), and CSV import (0004) are out of scope
here.

## Behavior

- A Django project exists in a dedicated server directory at the repo root, kept
  separate from the existing SPA (`src/`, `index.html`, `vite.config.js`), which
  is left untouched.
- Settings are environment-driven (twelve-factor): `SECRET_KEY`, `DEBUG`,
  `ALLOWED_HOSTS`, and `DATABASE_URL` read from the environment, with
  development defaults so `runserver` works with no configuration. No secret is
  committed (source: brain/constraints.md; global practice: env/secret handling).
- Database is resolved from `DATABASE_URL`: SQLite by default for local/dev and
  tests, Postgres in production on Render (source:
  docs/factory/prd/dsc1-phase-2.md#Goal Render hosting).
- A JSON API app is mounted under a versioned base path (`/api/v1/`) with a
  consistent JSON error shape for non-2xx responses.
- A health-check endpoint (`GET /api/v1/health/`) returns HTTP 200 and a small
  JSON body (e.g. `{"status": "ok"}`).
- Single-origin deploy hook: the server is configured to serve the built SPA
  bundle (static files + SPA fallback) so the app runs from one origin and
  avoids CORS; wiring the SPA to real data is item 0006/DSC-9 (source:
  brain/constraints.md Phase 2 deploy; docs/factory/prd/dsc1-phase-2.md#Open-questions).
- `tox` is the single entrypoint for CI and local checks, with separate
  environments for format, lint, type, and tests (global standard:
  tox-for-CI). A minimal test asserts the health endpoint returns 200.
- A Render service definition builds and runs the server (build installs deps
  and collects static; start runs the WSGI/ASGI app), extending or replacing the
  current static-site `render.yaml` (source: render.yaml;
  docs/factory/prd/dsc1-phase-2.md#Goal).

## Non-goals

- No domain models (Course/Exam/Topic/Question) — item 0002.
- No authentication or accounts — item 0003.
- No CSV upload/parse/import — items 0004/0005.
- No real data endpoints beyond health; no SPA↔API data wiring — item 0006.
- No per-Exam mock config, provenance, or study-mode changes — later items.

## Assumptions (brain gaps)

- **API framework — use Django REST Framework.** The brain specifies a "JSON
  API" but not the framework (source: brain/constraints.md Phase 2). DRF is the
  conventional choice and the downstream auth/data/API items build on it.
  Reversible: DRF viewsets/serializers can be swapped for plain Django JSON
  views per-endpoint without changing the project shape.
- **Python and Django versions — latest stable Django LTS on a current Python.**
  The brain pins no versions. Reversible: version bumps are routine maintenance
  and touch only config/deps.
- **Project directory layout — Django project in a dedicated server directory,
  SPA stays at repo root.** The brain doesn't state where the server lives.
  Reversible: relocating a fresh skeleton is cheap and touches no product code.
- **Database engine — SQLite for dev/tests, Postgres in production via
  `DATABASE_URL`.** The brain requires persistence on Render but doesn't name an
  engine. Reversible: the engine is a single settings/env change.

## Acceptance criteria

1. `django-admin`/`manage.py` project runs: `manage.py check` passes with no
   configuration beyond development defaults.
2. Settings read `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, and `DATABASE_URL` from
   the environment; no secret value is committed to the repo.
3. With no `DATABASE_URL` set, the app uses SQLite and `manage.py migrate`
   succeeds; when `DATABASE_URL` points at Postgres, the same command targets
   Postgres.
4. `GET /api/v1/health/` returns HTTP 200 with a JSON body indicating healthy
   status.
5. `tox` runs and its test environment passes, including a test asserting the
   health endpoint returns 200; format, lint, and type environments are defined.
6. The existing SPA files (`src/`, `index.html`, `vite.config.js`,
   `package.json`) are unchanged by this item.
7. A Render service definition exists that builds and serves the Django app
   (single origin), replacing or extending the current static-site `render.yaml`.
