# Plan — Phase 2 · 07 · Generalise study modes

> **For agentic workers:** Executed by the factory-implement skill — one fresh
> subagent per task. Steps use checkbox (- [ ]) syntax for tracking.

Frontend-only, all in `src/App.jsx`. Build with `npm run build` from repo root.
Read the current `src/App.jsx` first — this refactors existing code, does not add
screens. Line numbers below are approximate (from pre-edit inspection); locate by
the quoted code.

---

- [x] **Task 1 — Carry pass-mark % through the mapper + real pass display** _(covers acceptance criteria 1, 2)_

  In `contentToTracks` (the exam→track mapping, ~line 70), add `passMarkPct` to
  each track alongside `examSize`/`examPass`:
  ```js
  examSize: exam.exam_size,
  examPass: Math.round((exam.pass_mark / 100) * exam.exam_size),
  passMarkPct: exam.pass_mark,
  ```

  In `StudyApp`, next to `EXAM_SIZE`/`EXAM_PASS` (~line 109), add:
  `const PASS_PCT = activeTrack.passMarkPct;`

  In `examResult` (~line 268), replace the crude cap
  `const passNeeded = Math.min(EXAM_PASS, total);` with a percentage scale:
  ```js
  const passNeeded = Math.max(1, Math.round((PASS_PCT / 100) * total));
  ```
  (add `PASS_PCT` to that `useMemo`'s dependency array.)

  In the mock intro (~line 347) replace the hard-coded
  `Pass mark 80% ({EXAM_PASS}/{EXAM_SIZE}).` with the exam's real value, e.g.
  `Pass mark {PASS_PCT}%.` (drop the hard-coded 80 and the nominal count — the
  actual threshold depends on how many questions the pool yields; the results
  screen shows `passNeeded/total`).

  In the mock results (~line 433), ensure the verdict line shows `passNeeded` and
  `total` (it already computes them) and the pass-mark percentage `{PASS_PCT}%`.
  Keep the "(short deck)" note when `total < EXAM_SIZE`.

  **Test:** `npm run build`; behavior verified in the browser (verify stage).

- [ ] **Task 2 — Remove dead unanswered/unverified affordances** _(covers acceptance criteria 4)_

  API questions always have a real A–D `correct` and no `conf`, so these never
  render. Remove them from `src/App.jsx`:
  - the `hasAnswer` helper (~line 28) and its uses: the `answeredCounts` filter,
    `unansweredTotal` (~line 119), the `qs.filter(hasAnswer)` in the exam builder
    (~line 152 — the exam simply uses all questions now), `qLocked` (~line 171,
    192) and the whole `if (qLocked) { … }` render branch (~line 497);
  - the JSX badges: `{unansweredTotal > 0 && …"unanswered"}` (~line 360), the
    "answers pending" deck badge (~line 385), and both `conf === "Medium"` /
    "unverified" badges (~line 468, 597);
  - the now-unused styles `pendingBadge` and `unverifiedBadge` (~line 829, 841).

  After removal, `grep -nE "hasAnswer|qLocked|unverified|unansweredTotal|pendingBadge|answers pending"`
  over `src/App.jsx` returns nothing. `answeredCounts` becomes a plain per-category
  count over all questions (rename/simplify as needed).

  **Test:** `npm run build` succeeds with no unresolved references / unused-var
  errors.

- [ ] **Task 3 — Build + scope** _(covers acceptance criteria 5, 6)_

  `npm run build` exit 0. Backend untouched — but run `.venv/bin/tox` from
  `server/` to confirm still green (no backend change expected). Scope: `git diff
  --name-only main...HEAD` shows only `src/App.jsx` (plus the item's plan.md).

  **Test:** `npm run build` exit 0; `.venv/bin/tox` green; `git diff` = only
  `src/App.jsx`.

---

## Self-review — acceptance-criteria coverage
1. real pass-mark % shown → Task 1 (mapper + intro/results).
2. short-deck draws min + scaled pass → Task 1 (`passNeeded` percentage).
3. all three modes over API data → verify (browser).
4. dead affordances removed → Task 2 (grep-clean).
5. build + tox green + no console errors → Task 3 + verify.
6. scope = App.jsx only → Task 3.
