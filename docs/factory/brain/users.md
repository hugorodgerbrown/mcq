# Users

<!-- Who uses this product, their needs and workflows, what they're trying
     to accomplish. Every claim should cite a source: (source: <path-or-url>) -->

## Who

The app addresses DSC1 candidates — people preparing for the Deer Stalking
Certificate Level 1 written assessment (source: README.md; src/App.jsx:774
eyebrow "DSC1 · DEER STALKING CERTIFICATE 1"). A worked example question
references a 14-year-old sitting the DSC1 written assessment, indicating the
audience spans youth cadets through adult stalkers (source: src/App.jsx:112
Q109).

Detailed persona work (experience level, motivation, study context) is not
derivable from the repo — see personas.md (seeded by factory-research) and
open-questions.md.

## What they do (workflow surface)

The app is a single flow rooted at a **home screen** that exposes, in order
(source: src/App.jsx:768-863):

1. **Track switch** — Written Assessment vs Large Game Meat Hygiene (source:
   src/App.jsx:576 `track`; src/App.jsx:562 `TRACK_LIST`).
2. **Test mode** — MCQ, Flashcard, or Exam (source: src/App.jsx:793 "TEST
   MODE"; src/App.jsx:579).
3. **Question banks** — "All" (whole track), an optional "All species (mixed)"
   deck, then individual topic decks (source: src/App.jsx:826-861).

### Study modes

- **MCQ**: pick an answer; wrong letters are tracked and the question resolves
  when answered correctly (source: src/App.jsx:676 `choose`, :582 `wrong`).
- **Flashcard**: reveal then self-grade; a grade counts as one attempt and
  advances (source: src/App.jsx:694 `grade`).
- **Exam**: answers are editable and revisitable until submit, with no
  per-question feedback until the end; then a scored result with pass/fail
  verdict and per-deck breakdown is shown (source: src/App.jsx:704-758,
  867-923).

## Topic decks

Written track — 11 decks: General biology & behaviour; The shot & after;
Safety & fieldcraft; Law & firearms; Zeroing & ballistics; and species decks
for Roe, Fallow, Red, Sika, Muntjac, Chinese Water Deer (source:
src/App.jsx:289 `WRITTEN_DECKS`).

Meat & Hygiene track — 3 decks: Hygiene, Deer, Wild boar (source:
src/App.jsx:521 `MEAT_DECKS`).

## Phase 2 — a second user type: the course author

Phase 2 adds a **registered author** who supplies content, distinct from the
candidate who revises it (source: docs/factory/prd/dsc1-phase-2.md#Goal;
#Appendix).

- **Registers** with email/password, verifies email, can self-serve a password
  reset (source: docs/factory/prd/dsc1-phase-2.md#In-scope Auth).
- **Creates a course** with a name and rubric/description (source:
  docs/factory/prd/dsc1-phase-2.md#Appendix req 3).
- **Bulk-loads Q&A by CSV**, one file per course, in a two-phase flow: upload
  and parse → review a summary (topics per exam, questions per topic) → accept →
  import; re-uploads merge on `Code` (source:
  docs/factory/prd/dsc1-phase-2.md#Ingestion).
- **Sets mock configuration** (`exam_size`, `pass_mark`) per Exam in the
  course-setup UI (source: docs/factory/prd/dsc1-phase-2.md#Mock-configuration).
- **Views and manages only their own courses**; courses are private to their
  owner (source: docs/factory/prd/dsc1-phase-2.md#In-scope; #Out-of-scope).

The candidate/revising user (the primary persona) is unchanged; Phase 2 keeps
Practice, Flashcard, and Mock modes, generalised to run over any author course.
Sessions stay ephemeral — results show on submit, nothing persists server-side
(source: docs/factory/prd/dsc1-phase-2.md#In-scope Study modes, Sessions).
