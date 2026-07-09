# Market

_Seeded by `factory-research`. Every claim is cited `(source: …)` or marked `(assumption)`; unsourced findings belong in `open-questions.md`._

- **Category:** Self-study revision tools for the UK **Deer Stalking
  Certificate Level 1 (DSC1)** theory papers. The certificate is awarded by
  **Deer Management Qualifications (DMQ)**; the written paper is 50 MCQs (40 to
  pass) computer-drawn from a ~300-question bank, and meat hygiene needs 32+
  correct (source:
  https://dmq.org.uk/qualifications/deer-stalking-qualification-1/;
  https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/). These
  match the app's exam parameters (source: src/App.jsx:543-558).

- **Segments:** two overlapping buyer types — **beginners** entering stalking
  and **experienced stalkers** formalizing a qualification (source:
  https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/;
  https://dsctraining.org/). Both do the same theory drill.

- **Competitors:**
  - **DSCtraining.org** — question bank in "bite-sized lessons", 100+ ID
    slides, mock tests, videos. £10 first month, £8/mo after (source:
    https://dsctraining.org/).
  - **BDS Ultimate Deer Guide / Ultimate Deer Data** — DSC1-approved; 21
    modules with video + quizzes, mock tests, ID/recognition slides; ~£20/mo
    (source: https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/;
    https://bds.org.uk/courses-training/courses/dsc1-online-training-course-with-assessment-day/).
  - **BASC** — free revision test questions on its website (source:
    https://basc.org.uk/deer/courses/dsc-1/).
  - **DMQ** — the raw question bank as free downloads (source:
    https://dmq.org.uk/qualifications/deer-stalking-qualification-1/;
    https://www.thestalkingdirectory.co.uk/threads/dmq-general-questions-bank-for-dsc1.302339/).
  - **Training Manual for Deer Stalkers** — printed manual containing the bank
    and mock papers (source:
    https://www.thestalkingdirectory.co.uk/threads/dsc1-revision-guides.80857/).
  - **YouTube Q&A playlists** — free video walk-throughs (source:
    https://www.youtube.com/playlist?list=PLTvksdxjyxzrGpnri7N0U6gLPAVrmn7ZU).

- **Table-stakes / conventions:** the full topic-segmented question bank;
  self-test with immediate right/wrong; **mock exams matched to the real
  format** (50/40 written); species/ID practice; typically delivered as a paid
  monthly subscription (source: https://dsctraining.org/;
  https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/;
  https://basc.org.uk/deer/courses/dsc-1/).

- **Gaps & differentiation:**
  1. **Free, no subscription, no signup** — a static CDN SPA against £8–20/mo
     paid tools (source: brain/constraints.md; render.yaml).
  2. **Answer provenance surfaced in-product** (confidence / "unverified"
     badges, per-question answerability) directly addresses the category's most
     repeated pain: untrustworthy keys (source: src/App.jsx:303-312, 528, 856;
     pain cited at
     https://www.thestalkingdirectory.co.uk/threads/dsc1-revision-guides.80857/).
  3. **Two theory tracks in one** — Written + Large Game Meat Hygiene (source:
     src/App.jsx:535).
  4. **Weakness / gap:** no deer-ID slides or species photos, which most
     competitors provide and which map to a real DSC1 assessment component
     (source: https://dsctraining.org/;
     https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/; repo
     has no image assets). Logged in open-questions.md.

- **Positioning notes (draft):** "The free, trustworthy DSC1 theory drill — the
  full question bank and real mock exams for both Written and Meat Hygiene, with
  answer provenance shown, no subscription and no signup."

- **Assumptions:** app's key is more trustworthy than competitors' — asserted
  by design, not independently verified (assumption); users accept text-only
  drill and get ID practice elsewhere (assumption); primary study happens on
  mobile (assumption from UI, not usage data).
