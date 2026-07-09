# Design choice — Course management UI (item 0007)

Delegated to the builder (owner), bounded by the shipped dark study UI and the
0003/0006 shell styling (source: brain/decisions.md Phase 2; design-system.md).

## Screens (all reuse the `ShellCard`/`styles` tokens from 0006)
1. **Create course** — a centered themed card: heading "New course", a `name`
   text input and a `rubric` textarea (both dark fields, lime focus), a lime
   primary "Create" button, and a muted "Cancel/back" link. Reached from the empty
   state ("Create your first course") and a "New course" link in the picker/top
   bar.
2. **Upload / import** — a themed card for the chosen course:
   - a file input (styled button "Choose CSV") ;
   - on select → preview: a **summary block** listing each Exam with its Topics
     and question counts (deck-row style), a totals line ("118 new, 2 updated"),
     and — if any — a **row-error list** (`#FF6699` text, one line per
     `{row, message}`);
   - a lime "Import N questions" button, **disabled while errors exist**;
   - on commit success → a confirmation ("Imported 118 questions") + a lime "Study
     now" action that loads the course content.

## Palette / components
Reuse the auth/shell tokens: dark radial background, `max-width` card, translucent
fields, lime `#CCFF66` primary, `#FF6699` errors, `#8ea1c0` muted, `#CCFF66`
success. Deck-row style (from design-system.md) for the per-Exam/Topic summary
rows. No new palette.

## Flow
empty state → Create → (POST) → Upload screen for the new course → pick CSV →
preview (with errors surfaced) → Import → Study now. Re-import uses the same Upload
screen from an existing course.

## Acceptance mapping
Backs spec criteria 2–4 (browser). Criterion 1 is the backend create endpoint.
