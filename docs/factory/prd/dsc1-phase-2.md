# DSC1 Phase 2 — PRD (working spec)

> Materialized from Linear team **Q&A** for the factory-roadmap flow.
> Primary spec: "DSC1 Phase 2 — Scope"
> (https://linear.app/hugorodgerbrown/document/dsc1-phase-2-scope-53bd663d78c4).
> Source narrative: "PRD"
> (https://linear.app/hugorodgerbrown/document/prd-a442cad805bd).
> The Scope supersedes the PRD as the working spec; the PRD remains narrative.

## Problem

DSC1 is a single-course, hard-coded revision SPA. Its content model and three
study modes work well, but nobody except the author can use their own material
in it.

## Goal

A multi-tenant, self-service web app where a registered user creates a course,
bulk-loads their own Q&A by CSV, and runs the existing three revision modes over
it — hosted on Render.

## In scope

- **Frontend:** keep the React/Vite SPA. Rich interaction is the product;
  JS-as-first-class is a deliberate, documented exception to the usual
  progressive-enhancement rule for this app.
- **Backend:** new Django app for auth, persistence, and a JSON API the SPA
  consumes.
- **Auth:** `django-allauth`, email/password, email verification and
  self-service password reset. Email-provider wiring is a later implementation
  ticket.
- **Data model:** Course → Exam → Topic → Question. Each **Exam** carries a mock
  configuration (`exam_size`, `pass_mark`). Each **question** has 4 options
  (A–D), one `Correct` letter, an optional `Explanation`, an optional `Source`,
  and a stable per-course `Code`.
- **Ingestion:** one CSV per course. Two-phase — upload and parse → summary
  (topics per exam, questions per topic) → user accepts → import. Re-upload
  merges on `Code`: matched rows update, new rows insert, no wipe.
- **Study modes:** Practice, Flashcard, Mock — carried over unchanged,
  generalised to run over any user course.
- **Sessions:** ephemeral. Results show on submit; nothing persists
  server-side.
- **Users** see and manage their own courses.

## Mock configuration

Exam size and pass mark are properties of each **Exam**, set in the course-setup
UI — not carried in the per-question CSV. The current app fixes these per track
(Written 50/40; Meat & Hygiene 40/32 — source: `src/App.jsx:543-558`); Phase 2
makes them author-defined per Exam. Suggested defaults on Exam creation:
`exam_size = min(50, questions in exam)`, `pass_mark = 80%`. Mock draws only from
answered (keyed) questions.

## Answer provenance

The shipped app's main differentiator, per research
(`docs/factory/brain/market.md`), is answer trust — confidence / "unverified"
badges answering the category's most-cited pain, untrustworthy keys. Phase 2
carries this forward as an **optional** `Source` column: absent → no badge;
present → a provenance badge shows in-app. A structured confidence scale
(High/Medium/"unverified", as the current Meat track uses) is deferred unless
authors need it.

## Out of scope

Considered and set aside for Phase 2:

- Question-editing UI — re-import is the correction path.
- Saved session history, progress tracking, spaced repetition — schema stays
  stateless past import; revisit as Phase 3.
- Sharing, publishing, or a public course library — courses are private to their
  owner.
- More than 4 answer options.
- Structured multi-level confidence scale on answers (see Answer provenance).

## Decisions surfaced

- Client-side SPA is retained, not rebuilt server-side — chosen against the
  standing JS-progressive-enhancement principle, on purpose, because interaction
  is core to this product.
- Exams and Topics are created by the importer from CSV columns, not pre-built in
  the UI.
- `Code` becomes a required, unique, stable per-course key (it is incidental
  today).
- **Mock size and pass mark are per-Exam, author-set** — not fixed constants,
  and not carried in the question CSV.
- **Answer provenance is retained as an optional** `Source` **column**, not
  dropped. (Confirm: keep for all courses, or drop for a purely generic tool.)

## CSV contract

One file per course. Header formalises the current export, renames
`Answer source` → `Source`, adds `Explanation`:

| Column | Maps to | Notes |
| -- | -- | -- |
| `Section` | Exam | Created on import |
| `Category` | Topic | Created on import, nested under Exam |
| `Code` | Question key | Required, unique within course, stable across re-imports |
| `Question` | Question text |  |
| `A` `B` `C` `D` | Options | Exactly four |
| `Correct` | Correct option | Single letter A–D |
| `Explanation` | Correct-answer rationale | Optional |
| `Source` | Answer provenance | Optional; when present, surfaces a provenance badge |

Phase-one validation must enforce: four options present, `Correct` resolves to
one of them, `Code` present and unique within the file.

## Open questions — defaults chosen, flag to change

- **Deploy shape:** default = single origin, Django serves the built SPA bundle
  (avoids CORS). Alternative = two Render services.
- **Existing DSC1 content:** default = becomes a normal course owned by the
  author, imported through the same CSV path; not special-cased.
- **CSV column names:** default = the header above.
- **Provenance depth:** default = a free-text `Source` column only; structured
  confidence scale deferred.

---

## Appendix — source narrative (PRD)

The current DSC1 application is a multiple-choice question exam revision tool.
The questions cover two exams, and within each exam there are multiple topics for
revision. The tool allows the user to select one of three modes — Practice,
Flashcard, and Mock.

Practice mode presents the questions as multiple-choice, allowing the user to
select one answer from a bank of possible answers. If they select the correct
answer they can move to the next question. If not they can try again — they can
select all of the answers until they click on the correct one. This is useful
for exam practice.

In Flashcard mode the questions are presented as flashcards — with the question
on one side and the answer on the other. The user clicks on the card to reveal
the answer, and then self-selects whether they knew the answer or not. This is
useful for revision.

In Mock mode the user answers a series of questions under exam conditions — no
feedback until the user selects Submit. The user can navigate backwards and
forwards through the questions and update / amend their answer up until they
submit. On submission they see their result, along with the list of questions
they got wrong, with the correct answer displayed.

At the moment the entire app is hard-coded to a specific course — the DSC1
certification. This PRD describes Phase 2: a self-service web-hosted application
that allows users to register, upload their own Q&A and run their own revision
sessions.

Requirements:

1. App is hosted on Render.
2. Users register on the site with email / password.
3. Users create a new Course, which has a name and some rubric (description).
4. A Course can contain multiple Exams, each of which includes one or more
   Topics.
5. Users upload questions and answers as a CSV:
   1. Each question has one correct answer and multiple incorrect answers.
   2. Each correct answer has an optional explanation (why it's correct).
6. Users can view their own Courses.
