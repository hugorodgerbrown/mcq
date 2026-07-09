# Spec — Phase 2 · 09 · SPA ↔ JSON API integration + single-origin deploy

## Purpose

Turn the hard-coded study SPA into one that runs over API data for a logged-in
author's course, served single-origin by Django. This is the integration
backbone the remaining frontend items (0007 upload UI, 0008 study-mode polish,
0009 mock config, 0010 provenance) build on. Refactor `App.jsx` in place — keep
the existing study screens and dark design (owner decision) — swapping the
bundled `QUESTIONS`/`MEAT_QUESTIONS`/`TRACKS` for fetched data, wrapped in an
auth + course-selection shell (source: docs/factory/prd/dsc1-phase-2.md#In-scope;
brain/decisions.md Phase 2 frontend approach).

## Behavior

### Backend (read API + serving)
- `GET /api/v1/courses/` — the authenticated user's own courses:
  `[{"id","name","rubric"}]`. 403 for anonymous.
- `GET /api/v1/courses/<id>/content/` — owner-scoped nested content:
  `{"id","name","exams":[{"id","name","exam_size","pass_mark","topics":[{"id","name",
  "questions":[{"id","code","text","options":{"A","B","C","D"},"correct",
  "explanation","source"}]}]}]}`. 403 for anonymous/non-owner.
- **Single origin**: Django serves the built SPA. The SPA `index.html` is
  returned for `/` and any non-API, non-`/accounts/`, non-`/static/` path
  (client-side view state); built JS/CSS served as static via WhiteNoise. The
  Vite build is wired so `render.yaml`'s build produces the bundle Django serves.

### SPA (refactor in place)
- An `api` client module: `fetch` with `credentials: "include"` (session cookie);
  for unsafe methods, send `X-CSRFToken` from the `csrftoken` cookie.
- **Auth gate**: on load, `GET /api/v1/me/`. If 401/403 → a themed screen
  prompting login with a link to `/accounts/login/`. If authed → proceed.
- **Course selection**: `GET /api/v1/courses/`. If the user has one course, load
  it; if several, a themed picker; if none, a themed empty state pointing at
  course creation (item 0007). Selecting a course fetches its content.
- **Data mapping**: course content is mapped into the shape the existing study UI
  already consumes — each **Exam** becomes a track
  (`{title, questions, decks, speciesCats, examSize, examPass}`), each **Topic** a
  deck (`{cat, short, color}`), each **Question** `{id, cat, q, A, B, C, D,
  correct}` (plus `explanation`, `source` carried for later items). The existing
  home/MCQ/flashcard/exam/results components render unchanged over this data.
- The bundled `QUESTIONS`/`MEAT_QUESTIONS`/`WRITTEN_DECKS`/`MEAT_DECKS`/`TRACKS`
  constants are removed from the app's runtime path (the app no longer ships
  question data).

## Non-goals

- No course creation / CSV upload UI — item 0007 (this item shows an empty state
  linking to it).
- No new study-mode behavior — the existing MCQ/Flashcard/Exam screens are reused
  as-is; generalisation/edge-cases are item 0008.
- No per-Exam mock-config editing — item 0009 (values are read-only here from the
  API).
- No provenance badge rendering — item 0010 (the `source` field is fetched and
  passed through, not yet displayed).
- No real email — item 0011.

## Assumptions (brain gaps)

- **Each Exam is a "track".** The existing two-track UI (written/meat) generalises
  to "the selected course's Exams"; the top segmented control becomes an Exam
  switch. Reversible.
- **Deck accent colors** are assigned deterministically from a fixed palette by
  topic order (the API has no color); reuses the `design-system.md` palette.
  Reversible.
- **View state stays client-side** (no URL routing) — matches the current app and
  the single-origin catch-all. Reversible (a router can be added later).

## Acceptance criteria

1. `GET /api/v1/courses/` returns only the caller's courses; 403 anonymous.
2. `GET /api/v1/courses/<id>/content/` returns the nested exams→topics→questions
   for the owner; 403 for anonymous and non-owner.
3. Django serves the built SPA at `/` (200, returns the SPA HTML) and a deep
   non-API path (e.g. `/study`) also returns the SPA HTML (catch-all), while
   `/api/v1/health/` and `/accounts/login/` still return their own responses.
4. In a browser, an unauthenticated visit to `/` shows the themed login prompt
   linking to `/accounts/login/`.
5. In a browser, after logging in, a seeded course's questions load and the
   existing MCQ / Flashcard / Exam modes work over that API data (verified by
   driving the flow).
6. The app ships no bundled question data (the `QUESTIONS`/`MEAT_QUESTIONS`
   constants are gone from the runtime path).
7. `tox` green (backend API tests for criteria 1–2); `npm run build` succeeds;
   SPA loads without console errors in the browser check.
