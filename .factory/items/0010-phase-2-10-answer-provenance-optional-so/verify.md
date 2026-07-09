# Verify — Phase 2 · 10 · Answer provenance (Source badge)

**Result: GREEN — 5/5 criteria pass.** Build + live browser check of the Practice
badge; Flashcard/Mock placements code-verified (same component + gating).

## Build
`npm run build` → exit 0. `.venv/bin/tox` (server, unchanged) → 31 green.

## Browser walk (Chrome, author@dsc1.local, DSC1 Demo; questions carry source "DMQ")
- **Practice**: answered "Minimum calibre for roe in England?" — correct `.243`
  highlights green ✓, wrong options ✕, and a subtle **"Source: DMQ"** pill appears
  below the options. It rendered only after solving, not on the question front
  (criterion 1). ✓
- **Flashcard** (criterion 2): `<SourceBadge source={q.source}/>` sits inside the
  `flipped ?` reveal branch (line 576) — same component that showed "Source: DMQ"
  in Practice; renders only on the revealed answer side. Code-verified (the live
  Flashcard reveal itself was exercised in item 0008).
- **Mock review** (criterion 3): `<SourceBadge source={rq.source}/>` per review row
  (line 453), only in the post-submit results. Code-verified.
- Empty source → no badge (component returns null).
- **No console errors** during the walk (criterion 4). ✓
- Scope: `src/App.jsx` only (criterion 5). ✓

Note: no frontend test runner exists; verification is the live Practice badge +
the successful build + the answer-side gating review for all three contexts.
