# Autopilot run summary — Phase 2 complete (2026-07-09)

Full `/factory:autopilot` drain of the DSC1 Phase 2 backlog. **11/11 items shipped
to `main`; backlog drained.** Merge policy `auto`; design gate delegated to the
builder (owner) mid-run and removed.

## Shipped (in build order)

| Item | Ticket | Kind | What landed | Merge |
|---|---|---|---|---|
| 0001 | DSC-1 | backend | Django 5.2 + DRF server, uv/tox, health, Render service | c858244 |
| 0002 | DSC-3 | backend | `courses` data model + constraints, migrations | c9f2417 |
| 0003 | DSC-2 | mixed | django-allauth signup/verify/reset, session API auth, themed pages | 57da967 |
| 0004 | DSC-4 | mixed | Two-phase CSV import, merge-on-Code (no wipe), owner-scoped API | 030e941 |
| 0005 | DSC-5 | backend | Full CSV validation rules, row errors block commit | 94f810a |
| 0006 | DSC-9 | mixed | SPA↔API integration, single-origin serving, App.jsx refactor | 08df8cb |
| 0007 | DSC-6 | ui | Course create + CSV upload/import screens | 82395a2 |
| 0008 | DSC-7 | ui | Study modes over API data; real pass-mark %, short-deck scaling | (shipped) |
| 0009 | DSC-8 | mixed | Per-Exam mock config (exam_size/pass_mark) endpoint + settings UI | (shipped) |
| 0010 | DSC-10 | mixed | Answer provenance "Source" badge | (shipped) |
| 0011 | DSC-11 | backend | Env-driven email backend (console dev / SMTP prod), render env vars | (shipped) |

Every item ran the full pipeline: spec → design (UI/mixed) → plan →
implement (subagent, TDD) → review (council synthesis + end-to-end walk) →
verify (fresh evidence; **browser walks for all UI items**) → auto-merge with the
merged-tree suite green. All 11 marked **Done** in Linear.

## Verification highlights (browser)
- Login → course → **MCQ grading** over API data (0006); a **verify-caught bug**
  (anon stuck on "Loading…") was found and fixed before merge.
- **Create course → upload CSV → preview summary → import → study**; invalid CSV
  shows row errors and blocks import (0007).
- **Mock** with real pass-mark % and short-deck scaling ("Pass mark 80% — 2/3");
  **Flashcard** reveal + grade (0008).
- **Exam settings**: 80%→60% / size 5→4 saved and reflected in the mock (0009).
- **"Source: DMQ"** provenance badge on a revealed answer (0010).

## Final state
`main` has a working multi-tenant DSC1 revision app: Django backend (auth, courses,
CSV import + validation, per-exam config, email) serving a refactored React SPA
single-origin. Backend suite: **35 tests, tox green** (format/lint/type/tests).

## Open follow-ups (bids filed to brain/open-questions.md)
- bid-0007: tox `type` env doesn't cover model modules (wire django-stubs plugin).
- bid-0009: default `User` + email login (no custom user) — costly to change later.
- bid-0012: no "New course" entry point at exactly one course.

## Not done (out of scope / deferred)
- Nothing to run — backlog empty. Deferred by scope: question-editing UI (re-import
  is the correction path), course delete/rename, structured confidence scale, a
  specific ESP integration (standard SMTP is wired).
- The commits are on the local `main` and **not pushed** — push when ready to deploy.
