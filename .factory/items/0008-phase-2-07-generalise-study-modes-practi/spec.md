# Spec — Phase 2 · 07 · Generalise study modes over any course

## Purpose

Make Practice, Flashcard, and Mock modes correct for *any* author course, not
just the old fixed DSC1 tracks. Item 0006 already routes all three modes over API
data (the study UI was preserved); this item closes the generalisation gaps that
the fixed-course version hid: the hard-coded pass mark, short-deck pass scaling,
and dead affordances for the old "unanswered/unverified" question states (source:
docs/factory/prd/dsc1-phase-2.md#In-scope Study modes; brain/decisions.md Phase 2
frontend approach).

## Behavior

- **Mock pass mark uses the exam's real percentage.** The mock intro and results
  must show the Exam's actual `pass_mark` percentage, not a hard-coded "80%". The
  mapper carries the percentage through so the UI can display it.
- **Short-deck pass scales by percentage.** When the answered-question pool for an
  exam is smaller than `exam_size`, the mock draws `min(exam_size, available)`
  questions and the pass threshold is `round(pass_mark% / 100 × drawn)` (at least
  1), rather than the nominal count capped at the pool size. So an 80% exam on a
  10-question pool needs 8, not all 10.
- **Practice, Flashcard, Mock all work over API data** for any course/exam,
  including courses with multiple exams (the exam switch) and small pools.
- **Remove the dead "unanswered/unverified" affordances.** API questions always
  carry a real A–D answer and no `conf` field, so `hasAnswer` is always true and
  `conf === "Medium"` never holds. Remove the now-unreachable UI: the "N
  unanswered" badge, the "answers pending" deck badge, the `qLocked` disabled
  state, and the "unverified" badges — and the styles that only they used. Keep
  the mode/deck/exam logic otherwise unchanged.

## Non-goals

- No new study-mode mechanics — Practice (retry until right), Flashcard (reveal +
  self-grade), Mock (no feedback until submit, review at end) keep their existing
  behavior.
- No editing of `exam_size`/`pass_mark` — that UI is item 0009 (this item only
  *reads* and displays them correctly).
- No provenance badge — item 0010.
- No backend changes (this is a frontend-only item).

## Assumptions (brain gaps)

- **Short-deck pass = `max(1, round(pass_mark%/100 × drawn))`.** A percentage
  scales more fairly than the old `min(nominalPass, total)` cap; `max(1,…)` avoids
  a 0-threshold pass. Reversible.
- **Removing the dead affordances is safe** because the API content contract
  (item 0006) guarantees real answers and no `conf`. If a future item reintroduces
  provenance/confidence (0010), it adds its own display. Reversible.

## Acceptance criteria

1. For an exam with `pass_mark` = 80, the mock intro and results show "80%" (not a
   hard-coded value); for an exam with a different `pass_mark`, they show that
   value.
2. A mock over a pool smaller than `exam_size` draws `min(exam_size, pool)`
   questions and requires `max(1, round(pass_mark%/100 × drawn))` correct to pass
   (verified by the results verdict on a small seeded course).
3. In a browser: Practice, Flashcard, and Mock each run to completion over an
   imported course's data (answer/reveal/submit), with correct scoring/verdict.
4. The "N unanswered", "answers pending", `qLocked`, and "unverified" affordances
   are gone from the code and never render.
5. `npm run build` succeeds; backend `tox` still green (unchanged); no console
   errors in the browser walk.
6. Scope: changes confined to `src/App.jsx` (mapper + mock pass logic + dead-code
   removal) — no backend, no other files.
