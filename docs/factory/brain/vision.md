# Vision

<!-- What this product is, who it serves, what winning looks like.
     Every claim should cite a source: (source: <path-or-url>) -->

## What it is

A revision web app for the UK **Deer Stalking Certificate Level 1 (DSC1)**
written question bank — topic decks with Multiple-Choice and Flashcard study
modes (source: README.md).

The product has grown beyond a single question bank into **two self-contained
exam tracks** (source: src/App.jsx:535 `TRACKS`):

- **Written Assessment** — the core DSC1 written module: 283 questions across
  11 topic decks (source: src/App.jsx:3 `QUESTIONS`; README.md).
- **Large Game Meat Hygiene** — DSC1 "Large Game" questions plus FSA "Common
  hygiene" questions (source: src/App.jsx:313 `MEAT_QUESTIONS`; commit a2b7c90
  "Add Meat & Hygiene exam track and rework mock-exam UX").

Each track offers three test modes — MCQ, Flashcard, and a **Mock Exam** — that
persist across decks (source: src/App.jsx:579 `mode`; commit 1402468 "Add exam
mode").

## What winning looks like

A candidate can rehearse every DSC1 topic, self-test with mock exams scored
against the real pass marks (Written 40/50; Meat & Hygiene 32/40) (source:
src/App.jsx:543-558), and spot weak topics from a per-deck results breakdown
(source: src/App.jsx:918-923).

## Deployment posture (Phase 1, shipped)

Static single-page app: no backend, no database, no environment variables — all
questions bundled into the JS, served free over Render's CDN (source:
README.md "Notes"; render.yaml).

## Phase 2 direction (planned)

Turn the single-course, hard-coded revision SPA into a **multi-tenant,
self-service web app**: a registered user creates a course, bulk-loads their own
Q&A by CSV, and runs the existing three revision modes (Practice, Flashcard,
Mock) over it — hosted on Render (source:
docs/factory/prd/dsc1-phase-2.md#Goal; #Problem).

- The React/Vite SPA is **kept**, not rebuilt server-side; a new **Django**
  backend adds auth, persistence, and a JSON API the SPA consumes (source:
  docs/factory/prd/dsc1-phase-2.md#In-scope; #Decisions-surfaced).
- Winning for Phase 2: any author can stand up their own exam course from a
  single CSV and revise it in minutes, with **answer provenance** carried
  forward as the trust differentiator (source:
  docs/factory/prd/dsc1-phase-2.md#Answer-provenance; brain/market.md).
- The existing DSC1 content becomes a normal author-owned course imported
  through the same CSV path — not special-cased (source:
  docs/factory/prd/dsc1-phase-2.md#Open-questions).
