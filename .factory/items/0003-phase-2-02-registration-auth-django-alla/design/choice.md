# Design choice — Auth pages (item 0003)

**Delegated to the builder by the owner (2026-07-09), bounded by the shipped
app's visual language** (source: brain/decisions.md Phase 2 design delegation;
brain/design-system.md).

## Approach chosen: server-rendered allauth pages, themed to the app

Auth (signup, login, logout, email verification, password reset) uses
`django-allauth`'s server-rendered templates, overridden to match the SPA's dark
look. Auth works without JS (progressive-enhancement baseline); the study app
stays the JS-first SPA. Rejected alternatives: React auth screens embedded in the
SPA (more surface, needs token/JSON auth, no PE) and unstyled allauth defaults
(off-brand).

## Visual spec (reuse Phase-1 tokens)

- **Page**: full-height background radial-gradient `#12203a → #0a1424 → #060c17`;
  text `#f2f5fa`; font stack `ui-sans-serif, system-ui, -apple-system, 'Segoe
  UI', Roboto, sans-serif` (source: design-system.md).
- **Card**: centered single column, `max-width: 420px`, translucent surface
  `rgba(255,255,255,0.05)` with `1px solid rgba(255,255,255,0.1)`, radius 12,
  padding 24; one card per auth page.
- **Heading**: 24–28px, weight 800; small muted sub-copy `#8ea1c0`.
- **Inputs**: full-width, dark field `rgba(255,255,255,0.06)`, 1px border
  `rgba(255,255,255,0.12)`, radius 10, padding 12, text `#f2f5fa`.
- **Primary button**: lime `#CCFF66` background, dark text `#0a1424`, weight 700,
  full-width, radius 10. **Secondary/links**: muted `#8ea1c0`, lime on hover.
- **Errors**: `#FF6699` text; **success/notice**: `#CCFF66`.
- **Mobile-first**: single column, comfortable tap targets, page never scrolls
  horizontally.

## Implementation shape

- A shared base template `templates/account/base.html` carrying the page
  background + a small inline `<style>` block with the tokens above (no external
  CSS dependency, consistent with the app's inline-style approach).
- allauth's `login`, `signup`, `password_reset`, `password_reset_from_key`,
  `email`, `verification_sent`, and `logout` templates extend that base; each
  wraps allauth's form in the themed card. Keep markup minimal — reuse allauth's
  form fields, restyle via the base.
- A test asserts the login page returns 200 and contains a base-template marker
  (e.g. the themed background color / a `data-auth-base` attribute) so the theme
  can't silently regress.

## Acceptance mapping
Satisfies spec acceptance criterion 6 (server-rendered, dark-theme base,
inspectable marker). All other criteria are behavioral (allauth flows + `/me/`).
