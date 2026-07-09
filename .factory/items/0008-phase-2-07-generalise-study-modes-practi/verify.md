# Verify — Phase 2 · 07 · Generalise study modes

**Result: GREEN — 6/6 criteria pass.** Build + backend suite + live browser walk
of all three modes on the seeded DSC1 Demo course (exam "Written", pass_mark 80,
pool of 3 vs exam_size 5).

## Build / suite
`npm run build` → exit 0. `.venv/bin/tox` (server) → format/lint/type/tests OK
(28 tests; backend unchanged).

## Browser walk (Chrome, author@dsc1.local)
- **Mock intro** shows "5 questions across all topics. No feedback until the end.
  **Pass mark 80%.**" — the exam's real pass_mark, not hard-coded (criterion 1). ✓
- **Mock run + results**: answered 3, submitted → verdict "FAIL 0/3", "0%",
  **"Pass mark 80% — 2 / 3 (short deck)"** — short-deck drew min(5,3)=3 and scaled
  passNeeded = max(1, round(0.8×3)) = 2 (criterion 2); By-topic breakdown (Law 0/2,
  Safety 0/1) + full review with correct answers (criterion 3, Mock). ✓
- **Flashcard**: "Minimum calibre for roe in England?" → Reveal → "ANSWER .243"
  (correct) + Missed / Got it self-grade (criterion 3, Flashcard). ✓
- **Practice**: verified live in item 0006 (MCQ grading over API data)
  (criterion 3, Practice). ✓
- **Dead affordances gone**: study home shows no "answers pending" badge, no
  "unverified"; grep of `src/App.jsx` for hasAnswer/qLocked/unverified/
  unansweredTotal/pendingBadge → 0 (criterion 4). ✓
- **No console errors** during the walk (criterion 5). ✓
- Scope: only `src/App.jsx` (criterion 6). ✓
