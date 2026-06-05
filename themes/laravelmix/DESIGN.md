# ACME by Valnee — Design System

Dark-first editorial aesthetic. One committed direction — no gradient blending, no generic AI slop.

## Palette (CSS variables)

| Token | Dark (default) | Light |
|-------|----------------|-------|
| `--bg` | `#0A0A0B` | `#F7F6F2` |
| `--surface` | `#141416` | `#FFFFFF` |
| `--surface-2` | `#1C1C20` | `#EFEEE8` |
| `--fg` | `#F5F5F2` | `#14140F` |
| `--muted` | `#8A8A82` | `#5C5C54` |
| `--border` | `#26262B` | `#E2E1DA` |
| `--accent` | `#C6F24E` (lime) | `#5B43F0` (purple) |
| `--accent-fg` | `#0A0A0B` | `#FFFFFF` |

Toggle: `data-theme="light"` on `<html>`, persisted via `localStorage.theme`. Pre-paint script in `partials/site/meta.htm` prevents flash.

## Typography

- **Display / headings:** Bricolage Grotesque (600–800), uppercase for heroes and section titles
- **Body / UI:** Hanken Grotesk (400–700)
- Self-hosted via `@fontsource/*` in `assets/src/css/app.css`

## Depth (no gradients)

- 1px borders (`border-border`)
- Offset panels (`.offset-panel` — flat stacked shadow via `::after`)
- Grid lines (`.hero-grid`)
- Fine noise (`.noise` on `<body>`)
- Accent used sparingly: CTAs, key numbers, active states

**Forbidden:** `bg-gradient-*`, radial glow orbs, purple/teal gradient heroes, glassmorphism stacks.

## Motion budget

Per view:
1. One orchestrated entrance (hero stagger via `.reveal` + delays)
2. Restrained scroll reveals (`IntersectionObserver` in `app.js`)
3. Optional parallax on `[data-parallax]` layers

Also: testimonial marquees, magnetic CTA hover (transform + border shadow).

All gated behind `prefers-reduced-motion: reduce` in `extra.css` and `app.js`.

## Audio

- Looping ambient: procedural A-minor pad + slow pentatonic arpeggio (Web Audio), or `assets/src/audio/ambient.mp3` if provided
- Fades in over ~3s, fades out over ~2s on mute; master volume ~0.032
- Arms on first user interaction (`click`, `scroll`, `pointermove`, `keydown`)
- Mute toggle in header; state in `localStorage.acme-audio` (`on` / `off`)

## Sections (homepage)

Hero → Numbered problem (01–03) → Speed / Clarity / Certainty → VS table → Journey → Work grid → Testimonial marquees → Guarantee → FAQ → Final CTA

## Footer

Always: **Made with love by Valnee Solutions**

## Build

```bash
cd themes/laravelmix && npm install && npm run prod
```

Audit: `rg -i 'gradient|glow-orb|blob|from-|to-' pages partials assets/src/css`
