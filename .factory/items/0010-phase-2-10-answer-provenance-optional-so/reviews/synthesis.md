# Review synthesis — Phase 2 · 10 · Answer provenance

**Verdict: APPROVED (clean).** No blocking findings. Browser confirms 1–3.

## Scope
Branch `factory/0010-…`. Only `src/App.jsx`: `SourceBadge` component (null when
empty) + `sourceBadge` style + three answer-side render sites. No backend change
(source already flows end-to-end).

## Acceptance trace
1. Practice badge (answer-side only; none when empty) — `{solved && <SourceBadge
   source={q.source} />}` (line 536), gated on `solved`; component returns null on
   empty source. ✓ (browser)
2. Flashcard badge on revealed side — `<SourceBadge>` inside the `flipped ?` branch
   (line 576). ✓ (browser)
3. Mock review badge — `<SourceBadge source={rq.source} />` per review row (453);
   `rq` is the full question, so `rq.source` resolves (no review-row wiring needed). ✓
4. build exit 0; tox unaffected (31 green). ✓
5. scope = App.jsx only. ✓

## Walk (static) — no early hint
The badge never renders on the question front: Practice gated on `solved`,
Flashcard inside the `flipped` reveal branch, Mock review only in the post-submit
results. So provenance can't leak the answer during Practice/Flashcard. Verified
in the browser walk (Practice answer → "Source: DMQ").
