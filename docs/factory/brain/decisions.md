# Decisions

<!-- Record of decisions made and why, so later work doesn't relitigate them.
     Every claim should cite a source: (source: <path-or-url>) -->

Reconstructed from git history and code comments; no ADRs exist in the repo.

> Decisions below are **Phase 1 (shipped)**. Phase 2 supersedes the
> backendless one — see "Phase 2 decisions (planned)".

- **Static, backendless SPA on Render.** Chosen so the app is free to host and
  has no data/env surface; scores stay in-memory rather than pulling in a
  backend or `localStorage` (source: README.md "Notes"; render.yaml; commit
  da756cb "Initial commit"). **Superseded by Phase 2**, which adds a Django
  backend, database, and auth (source: docs/factory/prd/dsc1-phase-2.md#In-scope).
- **Ship as a single `App.jsx` with inline styles.** Data and UI co-located;
  no CSS files, router, or component library (source: src/App.jsx; package.json).
- **Exam mode added after the initial MCQ/Flashcard build** (source: commit
  1402468 "Add exam mode").
- **Second track — Large Game Meat Hygiene — added, and mock-exam UX reworked**
  around a generalized `TRACKS` structure so each track is a self-contained
  exam with its own questions, decks, and exam size/pass mark (source: commit
  a2b7c90 "Add Meat & Hygiene exam track and rework mock-exam UX";
  src/App.jsx:533-560).
- **Per-question answerability instead of per-deck.** Unanswered questions
  (`correct: "?"`) are shown but locked, so partially-keyed decks can ship
  (source: src/App.jsx:527-528, 658; :304-305 comment).
- **Answer-confidence model for Meat & Hygiene.** Deer/Wild boar answers were
  supplied by the owner with High/Medium confidence and Medium ones show an
  "unverified" badge; FSA Hygiene answers (highlighted key in the source paper)
  are treated as verified (source: src/App.jsx:303-312 comment).
- **Exam answers are editable until submit, with no per-question feedback**
  during the exam — mirroring a real sit-down paper (source: src/App.jsx:704
  comment).
- **Homepage copy revised** post-launch (source: commit c1941a5 "Change
  homepage copy").
- **Large-game question content updated** (source: commit 9b9e056 "Update large
  game questions").

## Phase 2 decisions (planned)

Chosen during Phase 2 scoping (source: docs/factory/prd/dsc1-phase-2.md).

- **Keep the React/Vite SPA; add a Django backend** — retain the client app
  rather than rebuild server-side, a deliberate exception to the usual
  JS-progressive-enhancement rule because rich interaction is the product
  (source: #In-scope; #Decisions-surfaced).
- **Auth via `django-allauth`** — email/password, email verification,
  self-service password reset; email-provider wiring deferred to a later ticket
  (source: #In-scope Auth).
- **Course → Exam → Topic → Question, one CSV per course**, imported in two
  phases (parse → summary → accept → import); re-upload merges on a stable
  per-course `Code` (update matched, insert new, no wipe) (source: #Ingestion;
  #CSV-contract).
- **Mock size and pass mark are author-set per Exam** — not fixed constants, not
  carried in the CSV (source: #Mock-configuration).
- **Answer provenance retained as an optional `Source` column**, not dropped;
  structured multi-level confidence scale deferred (source: #Answer-provenance).
  This carries forward the Phase 1 answer-confidence model above into the
  multi-tenant product.
- **Sessions stay ephemeral** — nothing persists server-side; saved history /
  progress tracking / spaced repetition deferred to Phase 3 (source: #In-scope
  Sessions; #Out-of-scope).
- **Courses are private to their owner** — no sharing or public library in
  Phase 2 (source: #Out-of-scope).

## Phase 2 design delegation

- **2026-07-09 — design gate removed; design delegated to the builder within the
  existing style.** The owner entrusted design decisions to the factory, bounded
  by the shipped app's visual language (dark, mobile-first, single-column, the
  lime/amber/pink status palette and per-topic accents in
  `design-system.md`), noting the product isn't live so tweaks later are fine.
  `.factory/config.json` `gates` changed `["design"] → []`. UI/mixed items still
  produce a `design/choice.md` recording the chosen approach, but no longer pause
  for a human. New UI reuses the Phase-1 tokens; server-rendered auth
  (django-allauth) is styled to the same dark theme (this keeps auth working
  without JS, while the study app stays the deliberately JS-first SPA per
  #Decisions-surfaced).

## Phase 2 ship log

- **2026-07-09 — item 0001 / DSC-1 (Django backend foundation) shipped to `main`**
  via `auto` merge (merge commit `c858244`). Django 5.2 + DRF server skeleton
  under `server/`, uv+tox toolchain (Python 3.12), env-driven settings
  (`DATABASE_URL`: SQLite dev / Postgres prod), `GET /api/v1/health/`, WhiteNoise
  single-origin static hook, and a Render web service in `render.yaml` (replaces
  the Phase 1 static-site block). 7/7 acceptance criteria verified green.
- **2026-07-09 — item 0002 / DSC-3 (data model) shipped to `main`** via `auto`
  merge (merge commit `c9f2417`). `courses` app: Course→Exam→Topic→Question, owner
  = `AUTH_USER_MODEL`, options as `option_a`–`option_d`, per-course `code`
  uniqueness via a denormalized `Question.course` FK, `correct`∈{A,B,C,D} and
  `pass_mark`≤100 check constraints; `pass_mark` modelled as a percentage
  (default 80). Answer-confidence scale dropped (owner) — only free-text `source`
  retained. Follow-up (bid-0007): tox `type` env doesn't yet cover model modules.
- **2026-07-09 — item 0003 / DSC-2 (registration & auth) shipped to `main`** via
  `auto` merge (merge commit `57da967`). django-allauth 65.18.0: email/password
  signup, mandatory email verification (console backend until 0011), password
  reset, session-based API auth (`SessionAuthentication` + `/api/v1/me/`), and
  server-rendered auth pages themed to the app (`data-auth-base` marker). Default
  `User` + email login (no custom user — bid-0009). `LOGIN_REDIRECT_URL="/"`
  awaits the SPA root (item 0006).
