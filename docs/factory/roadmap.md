# Roadmap

<!-- Prioritized backlog. One line per item: - [priority] <item-id> <title> (stage) -->

DSC1 **Phase 2** — multi-tenant, self-service exam-revision app. Candidates
extracted from the PRD (docs/factory/prd/dsc1-phase-2.md) and filed as Linear
issues in team **Q&A** on 2026-07-09. Linear is the record of work; the ids
below link there. Priority = Linear priority; stage = Linear status.

- [High] DSC-1 · Django backend foundation (project, settings, JSON API scaffold) (done)
- [High] DSC-2 · Registration & auth (django-allauth: email/password, verification, reset) (done)
- [High] DSC-3 · Data model: Course → Exam → Topic → Question (done)
- [High] DSC-4 · CSV ingestion pipeline (two-phase import, merge on Code) (done)
- [Medium] DSC-5 · CSV validation (four options, Correct resolves, Code unique) (done)
- [Medium] DSC-6 · Course management UI (create with name + rubric; view/manage own) (done)
- [Medium] DSC-7 · Generalise study modes (Practice / Flashcard / Mock) over any course (done)
- [Medium] DSC-8 · Per-Exam mock configuration (exam_size, pass_mark) (done)
- [Medium] DSC-9 · SPA ↔ JSON API integration + single-origin Render deploy (done)
- [Low] DSC-10 · Answer provenance (optional Source column → in-app badge) (done)
- [Low] DSC-11 · Email-provider wiring (Backlog)

## Recommended build order

Foundation → ingestion → UI → integration → deferred:
DSC-1 → DSC-3 → DSC-2 → DSC-4 → DSC-5 → DSC-9 → DSC-6 → DSC-7 → DSC-8 → DSC-10 → DSC-11.

## Notes

- No candidate was rejected — scope was owner-approved in full.
- Owner-flagged confirmations (provenance for a generic tool, deploy shape, CSV
  column names, provenance depth, existing-content migration) are logged in
  docs/factory/brain/open-questions.md and surfaced on DSC-10.
