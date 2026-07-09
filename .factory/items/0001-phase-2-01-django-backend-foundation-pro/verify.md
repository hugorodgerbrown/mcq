# Verify — Phase 2 · 01 · Django backend foundation

**Result: GREEN — 7/7 acceptance criteria pass, full suite green.** Evidence
below is from commands run fresh in this verify session.

## Full test suite
`.venv/bin/tox` (from `server/`) → **format: OK, lint: OK, type: OK, tests: OK —
"congratulations :)"**. Test suite: `Ran 1 test … OK` (1 passed, 0 failed).

## Acceptance criteria

1. **`manage.py check` passes** — `SECRET_KEY=test uv run python manage.py check`
   → `System check identified no issues (0 silenced).` ✓
2. **Env-driven settings; no committed secret** —
   `git grep 'SECRET_KEY = "…"'` over the branch's `server/` returns nothing
   hardcoded (only `os.environ` reads). Settings pull
   `SECRET_KEY`/`DEBUG`/`ALLOWED_HOSTS`/`DATABASE_URL` from env. ✓
3. **SQLite default / Postgres via `DATABASE_URL`; migrate succeeds** — no env →
   `settings.DATABASES['default']['ENGINE']` = `django.db.backends.sqlite3`; with
   `DATABASE_URL=postgres://…` → `django.db.backends.postgresql`.
   `manage.py migrate` on SQLite → applies auth/contenttypes migrations, exits 0. ✓
4. **`GET /api/v1/health/` → 200 JSON** — live server (`runserver 127.0.0.1:8811`),
   `curl http://127.0.0.1:8811/api/v1/health/` → body `{"status":"ok"}`, `HTTP 200`.
   Negative control: `curl …/api/v1/nope/` → `HTTP 404`. ✓
5. **`tox` green incl. health test; format/lint/type envs** — see Full test suite
   above; all four environments pass. ✓
6. **SPA files unchanged** —
   `git diff --name-only main...branch -- src index.html vite.config.js package.json package-lock.json`
   → 0 files. ✓
7. **Render service definition (single-origin Django)** —
   `render.yaml` branch version: `type: web`, `runtime: python`,
   `rootDir: server`, build `pip install -e . && collectstatic && migrate`,
   `startCommand: gunicorn config.wsgi:application`. ✓

## Note
The `runserver` "No directory at: …/staticfiles/" warning is benign (STATIC_ROOT
unpopulated until `collectstatic`); it does not affect any criterion.
