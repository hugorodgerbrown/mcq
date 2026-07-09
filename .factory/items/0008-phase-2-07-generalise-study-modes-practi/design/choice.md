# Design choice — Generalise study modes (item 0008)

Delegated to the builder (owner). **No new visuals** — this item is correctness
and cleanup within the existing study UI (design-system.md). The mock intro and
results reuse their current layout, only showing the exam's real pass-mark
percentage instead of a hard-coded "80%". Removing the dead unanswered/unverified
badges makes the UI match reality (API questions always have a real answer). The
three study screens keep their exact look and interactions.
