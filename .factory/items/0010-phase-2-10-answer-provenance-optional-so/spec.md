# Spec — Phase 2 · 10 · Answer provenance (Source badge)

## Purpose

Surface the optional `Source` behind an answer as an in-app provenance badge —
the product's trust differentiator carried into the multi-tenant app (source:
docs/factory/prd/dsc1-phase-2.md#Answer-provenance; brain/market.md). The `Source`
column is already imported (item 0004) and delivered by the content API + carried
through the `contentToTracks` mapper as `question.source` (item 0006); this item
only displays it. Frontend-only.

## Behavior

- Wherever a question's answer is shown and the question has a non-empty `source`,
  render a subtle **provenance badge** displaying it (e.g. "Source: DMQ"):
  - **Practice (MCQ)** — after the correct answer is revealed, below the options.
  - **Flashcard** — on the revealed answer side.
  - **Mock review** — per reviewed question, next to its correct answer.
- A question with an empty `source` shows **no badge** (no empty pill).
- The badge is styled to the design system (muted/subtle, not competing with the
  answer); reuses `styles` tokens.

## Non-goals

- No backend change (the `source` field already flows end-to-end).
- No structured confidence scale (High/Medium/"unverified") — dropped per owner
  (brain/decisions.md); this is a free-text `Source` badge only.
- No editing of `source` (re-import is the correction path).
- No change to answer grading or mode mechanics.

## Assumptions (brain gaps)

- **Badge label is "Source: <value>"** shown verbatim from the CSV `Source`
  column (free text, e.g. "DMQ", "FSA", a URL). Reversible.
- **Shown only alongside a revealed/correct answer**, not on the question front
  (so it can't hint the answer prematurely in Practice/Flashcard). Reversible.

## Acceptance criteria

1. In a browser, answering a Practice question that has a `source` shows a
   provenance badge with that source; a question without a `source` shows none.
2. In a browser, a Flashcard's revealed answer shows the source badge when present.
3. In a browser, the Mock review shows the source badge per question that has one.
4. `npm run build` succeeds; no console errors in the walk.
5. Scope: `src/App.jsx` only (a `sourceBadge` style + badge render in the three
   answer contexts); no backend or other files.
