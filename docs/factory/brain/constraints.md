# Constraints

<!-- Technical, business, and regulatory constraints that bound what can be
     built. Every claim should cite a source: (source: <path-or-url>) -->

> The section below describes **Phase 1 (shipped)**. Phase 2 deliberately
> supersedes several of these (adds a backend, persistence, auth) — see
> "Phase 2 constraints".

## Technical / architectural

- **Static SPA only.** No backend, no database, no environment variables; all
  283 questions are bundled into the JS (source: README.md "Notes"). Any
  feature must work entirely client-side.
- **Stack**: React 18 + Vite 5, ES modules (source: package.json). Build =
  `vite build` → `dist/`, published as a Render static site (source:
  render.yaml; README.md).
- **State is in-memory only** — progress and score reset on reload.
  Persistence would require `localStorage`, deliberately not yet added (source:
  README.md "Notes"; src/App.jsx:576-589 all state is `useState`).
- **Single-file app.** The entire application — data and UI — lives in one
  1,638-line `src/App.jsx`; styling is an inline JS `styles` object, not CSS
  files (source: src/App.jsx:1241 `const styles`). No component library, no
  router, no test suite present in the repo (source: package.json has no test
  script; `src/` contains only `main.jsx` and `App.jsx`).
- **SPA routing via rewrite.** Client-side state is not URL-backed; Render
  rewrites `/*` → `/index.html` so refreshes don't 404 (source: render.yaml;
  README.md).
- **Mobile-first framing.** Viewport is locked to non-zoomable, `maxWidth: 560`
  content column, dark theme (source: index.html viewport meta;
  src/App.jsx:1252, 1244).

## Content correctness (regulatory-adjacent)

- **Answer provenance is tracked per question.** A question is answerable only
  when its `correct` field is a real letter; `"?"` marks an unanswered question
  that is shown but locked (source: src/App.jsx:528 `hasAnswer`, :658 `qLocked`).
- **Confidence badges.** Meat & Hygiene Deer/Wild boar answers carry a `conf`
  field ("High" from course material, "Medium" <100% shown as "unverified");
  FSA Hygiene answers are treated as verified (source: src/App.jsx:303-312
  header comment). Answer sources are recorded in the CSV "Answer source" column
  (source: docs/dsc1-all-questions-and-answers.csv).
- **Mock exams only draw from answered questions** (source: src/App.jsx:554-556
  comment).
- Question content concerns UK firearms and deer law across England, Wales,
  Scotland, and Northern Ireland — jurisdiction-specific and subject to change;
  source PDFs are retained in `docs/` (source: docs/DSC1-Info-2022-v2.pdf,
  docs/DSC1-Safety-Questions-and-Answers-January-2023.pdf,
  docs/Industry-Common-hygiene-questions-May-2022-Formatted.pdf).

## Exam parameters (fixed by the certificate scheme)

- Written mock exam: 50 questions, pass 40/50 (80%) (source: src/App.jsx:543-545).
- Meat & Hygiene mock exam: 40 questions, pass 32/40 (source: src/App.jsx:556-558).

## Phase 2 constraints (planned)

- **Keep the React/Vite SPA; add a Django backend.** The client-side SPA is
  retained, not rebuilt server-side — a deliberate exception to the usual
  JS-progressive-enhancement rule, because rich interaction is the product
  (source: docs/factory/prd/dsc1-phase-2.md#In-scope; #Decisions-surfaced).
- **New Django app** owns auth, persistence, and a **JSON API** the SPA
  consumes (source: docs/factory/prd/dsc1-phase-2.md#In-scope).
- **Auth via `django-allauth`** — email/password, email verification,
  self-service password reset; email-provider wiring is a later ticket (source:
  docs/factory/prd/dsc1-phase-2.md#In-scope Auth).
- **Data model**: Course → Exam → Topic → Question. Each Exam carries
  `exam_size` + `pass_mark`; each question has 4 options (A–D), one `Correct`
  letter, optional `Explanation`, optional `Source`, and a stable per-course
  `Code` (source: docs/factory/prd/dsc1-phase-2.md#In-scope Data model).
- **Multi-tenant, private courses**: users see and manage only their own; no
  sharing or public library in Phase 2 (source:
  docs/factory/prd/dsc1-phase-2.md#In-scope; #Out-of-scope).
- **Sessions stay ephemeral** — results on submit, nothing persists
  server-side; no saved history / progress tracking / spaced repetition
  (deferred to Phase 3) (source: docs/factory/prd/dsc1-phase-2.md#In-scope
  Sessions; #Out-of-scope).
- **CSV ingestion contract** (one file per course): columns `Section`(→Exam),
  `Category`(→Topic), `Code`, `Question`, `A`–`D`, `Correct`, optional
  `Explanation`, optional `Source`. Validation must enforce four options,
  `Correct` resolving to one of them, and `Code` present and unique in the file.
  Re-upload merges on `Code` (update matched, insert new, no wipe) (source:
  docs/factory/prd/dsc1-phase-2.md#CSV-contract; #Ingestion).
- **Mock size / pass mark are author-set per Exam** (defaults `exam_size =
  min(50, questions in exam)`, `pass_mark = 80%`), not fixed constants and not
  carried in the CSV; mock draws only from answered (keyed) questions (source:
  docs/factory/prd/dsc1-phase-2.md#Mock-configuration).
- **Answer provenance retained as an optional `Source` column** → provenance
  badge in-app; structured multi-level confidence scale deferred (source:
  docs/factory/prd/dsc1-phase-2.md#Answer-provenance).
- **Deploy (default)**: single origin — Django serves the built SPA bundle to
  avoid CORS; two-service split is the flagged alternative (source:
  docs/factory/prd/dsc1-phase-2.md#Open-questions Deploy shape).
- **Out of scope for Phase 2**: question-editing UI (re-import is the correction
  path), >4 answer options, sharing/publishing/public library (source:
  docs/factory/prd/dsc1-phase-2.md#Out-of-scope).
