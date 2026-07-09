# Open Questions

<!-- Unresolved questions that block confident work; each should name what
     would resolve it. Every claim should cite a source: (source: <path-or-url>) -->

Surfaces the repo cannot answer. Each names what would resolve it.

- **Who exactly are the users, and how do they study?** The repo confirms only
  that the audience is DSC1 candidates (source: README.md; src/App.jsx:774) and
  can include cadets (source: src/App.jsx:112 Q109). Experience level, whether
  they study on mobile vs desktop, solo vs course-led, and their biggest
  failure points are unknown. *Resolves via:* factory-research personas.md, or
  owner input / analytics.

- **Is score persistence actually wanted?** README flags `localStorage` as a
  deliberate non-feature ("if you ever want scores to persist") (source:
  README.md "Notes"). *Resolves via:* owner decision on whether cross-session
  progress tracking is in scope.

- **What is the authoritative answer key, and how are updates governed?** Some
  Meat & Hygiene answers are owner-supplied at Medium confidence / "unverified"
  (source: src/App.jsx:303-312), and deer/firearms law changes over time
  (source: docs/DSC1-Info-2022-v2.pdf, dated 2022). *Resolves via:* a named
  source of truth (e.g. BDS/BASC/DMQ course material) and a review cadence.

- **Is this a personal tool or a distributed product?** No analytics, auth,
  pricing, or licensing exist in the repo (source: package.json; render.yaml;
  no backend). *Resolves via:* factory-research market.md and owner intent.

- **Accessibility and offline expectations.** Viewport is locked non-zoomable
  (source: index.html) and the app is dark-only (source:
  design-system.md). Whether WCAG conformance, larger text, or true offline/PWA
  behavior are required is unstated. *Resolves via:* owner / taste packet
  (docs/factory/packets/taste.md).

- **Testing and content-integrity strategy.** No test suite exists (source:
  package.json). For an exam app, incorrect keys are the core risk. *Resolves
  via:* owner decision on whether to add answer-key validation / tests.

- **Is visual deer ID in scope?** (surfaced by factory-research) The DSC1 has a
  distinct visual identification component, and competitors ship 100+ species
  ID slides; this app is text-only with no image assets (source:
  https://dsctraining.org/;
  https://www.shootinguk.co.uk/shooting/deer-stalking/pass-dsc1-40649/).
  *Resolves via:* owner decision on whether ID practice belongs here or is
  deliberately left to other tools.

- **Is the answer key demonstrably more correct than competitors'?** (surfaced
  by factory-research) The product's core differentiator is answer
  trustworthiness (source: brain/market.md), a response to the category's most
  repeated pain — competitor keys being wrong (source:
  https://www.thestalkingdirectory.co.uk/threads/dsc1-revision-guides.80857/).
  This is currently asserted by design (confidence badges), not independently
  verified. *Resolves via:* a validation pass of the keys against the
  authoritative DMQ source.

## Phase 2 — flagged for owner confirmation (defaults chosen)

The PRD chose defaults but flagged these to change (source:
docs/factory/prd/dsc1-phase-2.md#Open-questions; #Decisions-surfaced):

- **Keep answer provenance for a generic multi-course tool, or drop it?** The
  PRD default keeps the optional `Source` column; but provenance was a
  DSC1-specific trust play and its value for arbitrary user courses is unproven
  (source: docs/factory/prd/dsc1-phase-2.md#Decisions-surfaced;
  #Answer-provenance). *Resolves via:* owner decision.
- **Deploy shape** — default single-origin (Django serves the SPA bundle) vs two
  Render services (source: #Open-questions). *Resolves via:* owner decision.
- **CSV column names** — default is the PRD's header; confirm before authors
  build against it (source: #Open-questions; #CSV-contract).
- **Provenance depth** — free-text `Source` only vs a structured
  High/Medium/"unverified" scale like the current Meat track (source:
  #Open-questions; #Answer-provenance). *Resolves via:* whether authors need it.
- **Existing DSC1 content migration** — default treats it as a normal
  author-owned course imported via the same CSV path, not special-cased (source:
  #Open-questions). *Resolves via:* owner confirmation.
