# Design choice — Per-Exam mock config (item 0009)

Delegated to the builder (owner), reusing the shell/study tokens (design-system.md).

## Screen: Exam settings (themed card list)
Reached from a "Settings" link in the study top bar (next to Change course / Log
out). Renders one row per Exam of the current course, each a `ShellCard`-style
block with the Exam name, an `exam_size` number input and a `pass_mark` (%) number
input (dark fields, lime focus), and a lime "Save" button; inline validation error
in `#FF6699`. A muted "Back to study" link returns to the study home.

## Behavior
On Save → `PATCH /api/v1/courses/<cid>/exams/<eid>/` with the two values → on
success reflect saved values (and the study content reloads so the mock uses them).
Invalid input → the field message shows, nothing saved.

## Visual
No new palette: dark card, translucent number fields, lime primary, `#FF6699`
errors, `#8ea1c0` muted. Consistent with the create/upload screens (0007).

## Acceptance mapping
Backs spec criteria 3–4 (browser). 1–2 are the backend endpoint.
