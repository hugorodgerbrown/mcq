# Review synthesis — Phase 2 · 07 · Generalise study modes

**Verdict: APPROVED (clean).** No blocking findings. Browser confirms modes 3/4.

## Scope
Branch `factory/0008-…`. Only `src/App.jsx`. Backend untouched (tox still 28 green).

## Acceptance trace
1. Real pass-mark % shown — mock intro `Pass mark {PASS_PCT}%` (line 331), results
   `Pass mark {PASS_PCT}% — {passNeeded} / {total}` (406). ✓
2. Short-deck scaled pass — `passNeeded = Math.max(1, Math.round((PASS_PCT/100)*total))`
   (252), `passed: score >= passNeeded` (253). ✓
3. Practice/Flashcard/Mock over API data — verify (browser).
4. Dead affordances removed — grep for hasAnswer/qLocked/unverified/unansweredTotal/
   pendingBadge → 0 matches. ✓
5. build exit 0 + tox green + no console errors — build/tox ✓; browser (verify).
6. scope = App.jsx only. ✓

## Walk (static) — mock pass on a short pool
`examResult`: draws `order` (exam builder now uses all questions, min(exam_size,pool)
via the existing slice), `total = order.length`, `score` = correct answers,
`passNeeded = max(1, round(PASS_PCT/100 * total))`. For the seeded DSC1 Demo
(pass_mark 80, pool 3): passNeeded = max(1, round(2.4)) = 2 → need 2/3. The
verify-stage browser run drives a real mock to confirm the verdict + percentage
display.

## Non-blocking
- `examPass` (nominal) still computed in the mapper though `EXAM_PASS` local was
  dropped; harmless (unused). Could prune later.
- Deviations (removed `answeredCounts` + 6 orphaned styles) verified reference-free.
