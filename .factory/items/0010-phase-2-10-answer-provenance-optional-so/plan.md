# Plan — Phase 2 · 10 · Answer provenance (Source badge)

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Frontend-only, all in `src/App.jsx`. Build with `npm run build` from repo root.
Read `src/App.jsx` first. `question.source` is already carried through
`contentToTracks` onto each question object (`q.source`), and the review items in
the mock results carry the question too. This item only displays it.

---

- [x] **Task 1 — `SourceBadge` component + style** _(covers acceptance criteria 1, 2, 3)_

  Add a small helper component near the other components in `src/App.jsx`:

  ```jsx
  function SourceBadge({ source }) {
    if (!source) return null;
    return <span style={styles.sourceBadge}>Source: {source}</span>;
  }
  ```

  Add the style to the `styles` object (muted, subtle, per design/choice.md):

  ```js
  sourceBadge: {
    display: "inline-block",
    marginTop: 10,
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 12,
    color: "#8ea1c0",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  ```

  **Test:** covered by placement in Task 2.

- [x] **Task 2 — Render the badge in the three answer contexts** _(covers acceptance criteria 1, 2, 3)_

  In `StudyApp`, render `<SourceBadge source={…} />` in each place an answer is
  shown (locate by the existing render code):

  - **Practice (MCQ)**: in the resolved question card, after the options are shown
    and the question is answered (where `solved` / the correct option is
    revealed). Use the current question object's source, e.g.
    `{solved && <SourceBadge source={q.source} />}` inside the card, below the
    options list.
  - **Flashcard**: on the revealed answer side (where the answer text / "ANSWER …"
    is rendered when `flipped`). Add `<SourceBadge source={q.source} />` under the
    answer.
  - **Mock review**: in the review list (each item renders the question, your
    answer, and the correct answer), add `<SourceBadge source={rq.source} />` (or
    whatever the review item's question field is named — inspect: the review items
    are built in `examResult`; ensure the source is available on each review row,
    adding it to the row object there if needed) after the CORRECT line.

  If the mock review row objects don't already include `source`, add `source:
  q.source` (or the equivalent) where the review array is constructed in
  `examResult`, so the badge can render there.

  Only render when the source is non-empty (the component already guards
  `if (!source) return null`).

  **Test:** `npm run build` succeeds; browser walk in verify (Practice answer →
  badge; Flashcard reveal → badge; Mock review → badge).

- [x] **Task 3 — Build + scope** _(covers acceptance criteria 4, 5)_

  `npm run build` exit 0. Backend unchanged (optionally run `.venv/bin/tox` to
  confirm still green — no backend change expected). Scope: `git diff --name-only
  main...HEAD` shows only `src/App.jsx`.

  **Test:** `npm run build` exit 0; `git diff` = only `src/App.jsx`.

---

## Self-review — acceptance-criteria coverage
1. Practice source badge (and none when empty) → Task 1 guard + Task 2 (verify).
2. Flashcard source badge → Task 2 (verify).
3. Mock review source badge → Task 2 (+ review-row source wiring) (verify).
4. build + no console errors → Task 3 + verify.
5. scope = App.jsx only → Task 3.
