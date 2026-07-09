# Autopilot run summary — 2026-07-09

One drain run of `/factory:autopilot` (no budget hint → run until drained/gated).
Merge policy `auto`; gates `[design]`.

## Preflight
`factory doctor`: `tree_valid: true`, 11 open items, 0 pending-human. Passed.

## Items advanced this run — 2 shipped to `main`

| Item | Ticket | Kind | Result | Merge |
|---|---|---|---|---|
| 0001 Django backend foundation | DSC-1 | backend | **done** — 7/7 criteria green | `c858244` |
| 0002 Data model (Course→Exam→Topic→Question) | DSC-3 | backend | **done** — 7/7 criteria green | `c9f2417` |

Both went spec → plan → implement (subagent, TDD) → review (council synthesis +
end-to-end walk) → verify (fresh full evidence) → ship (auto-merge, merged-tree
suite green, branch deleted). Shipped reports:
`docs/factory/packets/reports/0001-…-shipped.md`, `…/0002-…-shipped.md`.

Net result on `main`: a Django 5.2 + DRF server under `server/` (uv+tox, Python
3.12, health endpoint, env settings, Render web service) with the full
`courses` data model and constraints.

## Items parked / not started — 9, all gated

**Blocked on the `design` human gate (7).** Each is `ui`/`mixed`; its spec exits
to `design`, which requires a human `design/choice.md`. Autopilot does not answer
its own gates, so these were not advanced:

- 0003 / DSC-2 — Registration & auth (mixed)
- 0004 / DSC-4 — CSV ingestion pipeline (mixed)
- 0006 / DSC-9 — SPA ↔ JSON API integration + deploy (mixed)
- 0007 / DSC-6 — Course management UI (ui)
- 0008 / DSC-7 — Generalise study modes (ui)
- 0009 / DSC-8 — Per-Exam mock configuration (mixed)
- 0010 / DSC-10 — Answer provenance (mixed)

**Backend, but dependency-blocked on the above (2).** Buildable only after their
prerequisites ship; building now would be code against a non-existent layer:

- 0005 / DSC-5 — CSV validation — needs 0004 (ingestion).
- 0011 / DSC-11 — Email-provider wiring — needs 0003 (auth).

## Bids filed (durable memory)
- bid-0001..0004 (item 0001): API framework (DRF), runtime versions, repo layout,
  DB engine — all `low`, surface `brain/open-questions.md`.
- bid-0005..0006 (item 0002): question-options shape, per-course code uniqueness
  via denormalized FK — `low`.
- bid-0007 (item 0002): tox `type` env doesn't cover model modules; wire
  django-stubs plugin + extend mypy targets — `medium`.

## What unblocks the rest
The pipeline needs human design decisions to proceed. To continue: run
`/factory:run` on a specific item to reach its design options, record a choice
with `factory choice <item>` (or the design skill's flow), then re-run
`/factory:autopilot` — the loop resumes parked items whose `design/choice.md`
now exists. Backend items 0005 and 0011 will become buildable once 0004 and 0003
ship, respectively.

## Note on config
`.factory/config.json` `merge` was corrected from an invalid `manual` to `auto`
(owner-selected) before the run so `validate` passes.
