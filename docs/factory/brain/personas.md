# Personas

_Seeded by `factory-research`. Every claim is cited `(source: …)` or marked `(assumption)`; unsourced traits belong in `open-questions.md`, not here._

Depth: `web` → one primary persona. Segment notes live in market.md.

## Primary persona

- **Label:** First-time DSC1 candidate revising the theory solo before an
  assessment day.
- **Summary:** An adult preparing for the DMQ Deer Stalking Certificate Level 1.
  Has (or is arranging) a course/manual and needs to drill the fixed theory
  question bank until they can reliably pass the 50-question written paper
  (40/50) and the meat-hygiene paper (32/40) (source:
  https://dmq.org.uk/qualifications/deer-stalking-qualification-1/;
  https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/;
  src/App.jsx:543-558).
- **Context:** Spans beginners and experienced stalkers across a wide age
  range; the theory is commonly described as passable first-time with a few
  weeks' prep — "a tick exercise" (source:
  https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/;
  https://dsctraining.org/). BASC advises starting ~8 weeks out (source:
  https://basc.org.uk/deer/courses/dsc-1/). Likely revises in short sessions on
  a phone (assumption, from the mobile-first single-column UI — source:
  brain/design-system.md).
- **Goals:** Pass all theory papers first time (source: shootinguk.co.uk
  above); convert the ~300-question bank into confident recall efficiently.
- **Jobs-to-be-done:** "Drill the whole bank by topic until answers are
  automatic"; "Sit realistic mock exams and see if I'd pass, by topic" (source:
  src/App.jsx:704-923; mock tests cited as the valued feature —
  https://www.thestalkingdirectory.co.uk/threads/dsc1-revision-guides.80857/);
  "Trust that the answer I'm memorizing is correct."
- **Pains:** Untrustworthy answer keys in existing tools — the dominant,
  repeated complaint: "Some of the answers are incorrect…"; "Wasn't [a]ware
  some [of] the answers are incorrect. That is a bu[t] scarry" (source:
  https://www.thestalkingdirectory.co.uk/threads/dsc1-revision-guides.80857/).
  Recurring subscription cost for a bank needed ~1 month (source: same thread).
  ID practice that doesn't match the real test (source: same thread).
- **Behaviors / drivers:** Value-conscious, exam-deadline-driven, prioritizes
  correctness over polish.
- **Voice:** "you can do mock tests"; "at £10 for the month I think you'd
  struggle to find another revision aid that is such good value"; "Some of the
  answers are incorrect but on the whole I found it a great revision aid"
  (source:
  https://www.thestalkingdirectory.co.uk/threads/dsc1-revision-guides.80857/).
- **Not for:** Someone needing visual deer-ID practice — this app is text-only,
  no species slides (source: repo has no image assets; contrast
  https://dsctraining.org/ 100+ slides; logged in open-questions.md). Not for
  practical fieldcraft / shooting-test prep — out of scope (source:
  https://dsctraining.org/ "cannot teach practical fieldcraft").
- **Confidence & assumptions:** Medium on pains and jobs (multiple cited forum
  voices + matching app behavior). Low on demographics, device, and session
  habits — inferred, not measured (assumption). No first-party analytics exist
  (source: package.json; no backend).
