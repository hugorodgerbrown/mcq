# Design System

<!-- Design tokens, component conventions, and visual language.
     Tokens here are the headless fallback when DesignSync is unavailable. -->

All tokens below are observed from the inline `styles` object and markup, not a
declared design system (source: src/App.jsx:1241 `const styles`; index.html).

## Theme & surface

- **Dark theme only.** Page background is a radial gradient
  `#12203a → #0a1424 → #060c17`; body/root fallback `#060c17`; theme-color
  `#0a1424` (source: src/App.jsx:1244; index.html).
- **Layout**: centered single column, `maxWidth: 560px`, padding `24px 16px
  40px` — mobile-first, non-zoomable viewport (source: src/App.jsx:1252, 1249;
  index.html viewport meta).

## Color tokens

- **Primary text**: `#f2f5fa`; **muted / secondary text**: `#8ea1c0` (source:
  src/App.jsx:1245, 1257).
- **Translucent surfaces**: `rgba(255,255,255,0.05)` fill, `rgba(255,255,255,
  0.1)` border (source: src/App.jsx:1261-1262 segment).
- **Semantic status**: pass/positive `#CCFF66` (lime), warn/mid `#FFCC33`,
  fail/negative `#FF6699`; breakdown thresholds ≥80% lime, ≥50% amber, else
  pink (source: src/App.jsx:894, 923).
- **Deck accent palette** (per-topic dot / left-border color), Written track:
  Biology `#CCFF66`, The shot `#FFCC33`, Safety `#66CCFF`, Law `#FF6699`,
  Zeroing `#FF9900`, Roe `#B8E986`, Fallow `#E8B96A`, Red `#E8896A`, Sika
  `#9A8CE8`, Muntjac `#6AD5E8`, CWD `#E86AB8` (source: src/App.jsx:289-301).
  Meat track: Hygiene `#CCFF66`, Deer `#FFCC33`, Wild boar `#FF9900` (source:
  src/App.jsx:521-525).

## Typography

- **Font stack**: `ui-sans-serif, system-ui, -apple-system, 'Segoe UI',
  Roboto, sans-serif` (source: src/App.jsx:1246).
- **Home title**: 34px / weight 800 / letter-spacing -0.01em; eyebrow is a
  small uppercase label; sub-copy 14.5px muted (source: src/App.jsx:1256, 1257,
  774).

## Component conventions

- **Segmented control** for track and mode selection — pill group, radius 12,
  4px gap/padding (source: src/App.jsx:1258-1265 `segment`).
- **Deck rows** — full-width buttons with a colored dot / 4px left border
  accent and a count on the right (source: src/App.jsx:846-861, 849).
- **Section dividers** — short uppercase labels ("TEST MODE", "QUESTION
  BANKS", "TOPICS") (source: src/App.jsx:793, 826, 844).
- **Cards** — top border in the active deck color, 3px (source:
  src/App.jsx:987, 1064).
- **"answers pending" / "unverified" badges** surface answer-provenance state
  in the UI (source: src/App.jsx:856 `pendingBadge`; :308-309 conf/unverified).

DesignSync note: no external design source is wired; these tokens are the
headless fallback.
