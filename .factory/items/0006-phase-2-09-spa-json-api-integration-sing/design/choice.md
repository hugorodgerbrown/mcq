# Design choice — SPA integration (item 0006)

Delegated to the builder (owner, 2026-07-09), bounded by the shipped app's dark
study UI, which is **kept and refactored in place** (source: brain/decisions.md
Phase 2 frontend approach; design-system.md).

## Single-origin serving
Django serves the Vite-built SPA. Vite builds to a directory Django exposes;
WhiteNoise serves the hashed JS/CSS. A catch-all Django view returns the built
`index.html` for `/` and any path that isn't `/api/…`, `/accounts/…`, or a static
asset — so client-side view state (course/mode/deck) survives a refresh without a
router. `render.yaml` build: `npm install && npm run build` (SPA) then
`collectstatic` (Django).

## Auth gate (new shell, themed)
On load the SPA calls `GET /api/v1/me/`. On 401/403 it shows a **login screen**
reusing the auth-page look (dark radial background, centered `max-width:420px`
card, lime primary action): a short heading, one sentence, and a lime
"Log in / Register" button linking to `/accounts/login/`. On success the app
proceeds. Logout link (to `/accounts/logout/`) sits in a minimal top bar.

## Course selection (new shell, themed)
After auth, `GET /api/v1/courses/`:
- 0 courses → themed empty state: "No courses yet" + a link to create one
  (item 0007 provides the create screen; here it's a pointer).
- 1 course → load it directly.
- 2+ → a themed list (deck-row style from design-system.md: full-width rows,
  translucent surface, course name + rubric) to pick one.
The picked course's name shows in the top bar with a "change course" affordance.

## Data mapping (keep the study UI)
Course content → the shape `App.jsx` already renders:
- **Exam** → a track: `{title: exam.name, questions, decks, speciesCats,
  examSize: exam.exam_size, examPass: derived from pass_mark%}`. The top
  segmented control (was written/meat) becomes the Exam switch.
- **Topic** → a deck: `{cat: topic.name, short: topic.name, color}` where `color`
  is assigned by topic index from the `design-system.md` deck palette
  (`#CCFF66,#FFCC33,#66CCFF,#FF6699,#FF9900,#B8E986,…`).
- **Question** → `{id, cat: topic.name, q: text, A,B,C,D from options, correct}`,
  carrying `explanation` and `source` through for items 0008/0010.
`pass_mark` is a percentage (item 0002); the exam's pass count = `round(pass_mark
/100 * examSize)` for the results verdict.

## Visual language
No new tokens — reuse `design-system.md`. New shell screens (login prompt, course
picker, top bar, empty/loading states) use the same background, card, and
lime/amber/pink palette as the existing study screens and the auth pages.

## Acceptance mapping
Backs spec criteria 1–7; the browser checks (4,5) drive the real login → course →
study flow.
