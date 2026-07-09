# Design choice — Answer provenance badge (item 0010)

Delegated to the builder (owner). Reuses design-system.md tokens; no new palette.

## Badge
A subtle inline pill/line reading `Source: <value>` (value verbatim from the CSV
`Source`). Muted treatment — small (~12px), `#8ea1c0` text on a faint translucent
`rgba(255,255,255,0.05)` chip with a hairline border — so it informs without
competing with the answer. It appears only next to a revealed/correct answer, not
on the question front (so it never hints the answer early).

## Placement
- Practice: below the options once answered (in the resolved question card).
- Flashcard: under the "ANSWER …" text on the revealed side.
- Mock review: on each reviewed row, after "CORRECT …".

Renders only when `question.source` is non-empty (`q.source && …`). No empty pill.

## Acceptance mapping
Backs spec criteria 1–3 (browser).
