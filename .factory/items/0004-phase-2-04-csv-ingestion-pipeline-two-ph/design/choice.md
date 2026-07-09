# Design choice — CSV import contract (item 0004)

Delegated to the builder (owner, 2026-07-09). This item has no visual UI (the
upload screen is items 0006/0007); the "design" here is the **API + interaction
contract** the SPA will drive. Kept minimal and JSON-first.

## Two-phase interaction
1. **Preview** — client POSTs the CSV (multipart) to
   `/api/v1/courses/<id>/import/preview/`. Server parses + validates, returns a
   summary. Nothing is written. The SPA shows the summary for the author to
   confirm.
2. **Commit** — client POSTs the *same* file to
   `/api/v1/courses/<id>/import/commit/`. Server re-parses, validates, and imports
   in a transaction (merge on `Code`). Returns counts. On validation failure →
   400 with the error list; the SPA shows errors and the author re-uploads.

Stateless between phases (no pending-import token) — the client holds the file
and re-sends on commit. Keeps server sessions ephemeral (#In-scope).

## Response shapes (contract for the SPA)
Preview 200:
```json
{
  "totals": {"rows": 120, "new": 118, "updated": 2},
  "exams": [
    {"name": "Written", "topics": [{"name": "Law", "questions": 34}, ...]}
  ],
  "errors": [{"row": 12, "message": "Correct 'Z' is not one of A–D"}]
}
```
Commit 200:
```json
{"exams": 2, "topics": 11, "questions_created": 118, "questions_updated": 2}
```
Commit 400 (validation failed): `{"errors": [{"row": 12, "message": "..."}]}` — no
writes.

## Errors
Row-level, `{row, message}` (1-based row number matching the CSV, header = row 1).
Preview lists them; commit refuses (400) if any exist.

## Acceptance mapping
Backs spec criteria 1–5. No visual tokens needed (no rendered UI in this item);
the SPA that renders this summary (0006/0007) reuses `design-system.md`.
