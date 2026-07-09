# Taste Packet — for the human

This is a short questionnaire. **Answer inline, directly under each question** —
your answers get edited into this file, and the next intake or roadmap run
folds them into the brain with `(source: docs/factory/packets/taste.md)`
citations. Leaving it blank blocks nothing; it just means the council reasons
from the code alone.

Context the factory already inferred from the repo: a dark-themed, mobile-first,
single-column DSC1 revision SPA with lime/amber/pink status colors and per-topic
accent dots (source: docs/factory/brain/design-system.md).

> **Draft pre-fill (2026-07-09).** Answers below are drafted from the shipped
> app and the Phase 2 scope (Linear doc "DSC1 Phase 2 — Scope"), not yet
> confirmed by the owner. Edit, replace, or delete freely — nothing here is
> load-bearing until you sign off.

---

## 1. Three products whose UI you admire — and why

Name up to three (apps, sites, tools). One line each on what specifically you'd
want to borrow (feel, density, motion, typography, restraint…).

- _(draft, from current app) restraint — one column, no chrome, nothing on
  screen that isn't the question or the choice._
-
-

## 2. Hard non-negotiables

What must always be true here? (e.g. "stays free/static", "works one-handed on a
phone", "answer must never display without a verified key", "no signup ever".)

- _(draft) Works one-handed on a phone — mobile-first, single column, no
  horizontal scroll (source: brain/design-system.md)._
- _(draft) An answer must never display without a known key; unverified answers
  are badged, not hidden silently (source: brain/constraints.md answer
  provenance; App.jsx:303-312, 528)._
- _(draft) Rich interaction is core — JS-first is a deliberate exception to the
  usual progressive-enhancement rule for this app (source: Linear "DSC1 Phase 2
  — Scope")._

## 3. What "done" / "quality" means for this app

When is a feature finished to your standard? What would make you reject a change
even if it "works"?

- _(draft) A change is rejected if it can surface a wrong or unkeyed answer as
  correct, or if it breaks one-handed mobile use._

## 4. Voice & tone

How should copy read to a DSC1 candidate — plain and exam-serious, warm and
encouraging, terse? Any words/phrases to always or never use?

- _(draft) Plain and exam-serious; terse over chatty. No gamified streak
  language._

## 5. Anti-references — what to avoid

Products, patterns, or styles you do NOT want this to resemble. (e.g. "not a
gamified streak app", "no ads", "not cluttered like a typical quiz site".)

- _(draft) Not a gamified streak app; no ads._
- _(draft) Not the cluttered, key-untrustworthy quiz sites the research names as
  the category's main pain (source: brain/market.md)._
