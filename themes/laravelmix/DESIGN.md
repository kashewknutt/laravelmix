# ACME by Valnee — Design System

## Direction: Soft Editorial

Warm paper backgrounds, generous whitespace, and magazine-like hierarchy. One committed aesthetic — not a blend. White and sand surfaces with solid pastel accents. Depth comes from layered offset cards, blurred solid-color blobs, parallax, and soft single-direction shadows. **No CSS gradients anywhere.**

## Palette and type

- **Paper** `#FDFBF7` page background · **Clay** `#C2614A` dominant accent (used sharply, not timidly)
- **Pastels** (solid fills only): blush, sage, sky, butter, lilac — support, never compete with clay
- **Display**: Fraunces upright for headings (hero is upright, not oversized italic — italic reserved for small accents)
- **Body**: Hanken Grotesk — never Inter, Roboto, Poppins, or Space Grotesk

## Motion budget

1. Page load: staggered reveal (eyebrow → headline → subtext → CTA)
2. Parallax: hero and proof-section pastel blobs only
3. Primary CTA: lift + optional soft audio click (opt-in toggle, off by default)
4. Everything else static. Respect `prefers-reduced-motion`.
