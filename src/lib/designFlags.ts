// src/lib/designFlags.ts
//
// EXPLORATION (2026-11-17) — one switch for the "bio-stimulant /
// technology" direction: generated topographic backgrounds
// (TopoBackground.astro) instead of random crop photography.
//
// When true, every place that drew a crop photo from a background pool
// draws a topo map instead:
//   - product page heroes (ProductDetail.astro)
//   - homepage/page-builder heroes (HeroSection.astro — not videos)
//   - callout boxes and "Pool" column sections (through
//     PoolBackground.astro)
//   - the homepage Featured Product box drops its photo for a charcoal
//     ground with a glow in the product's label colour (no topo map)
// Accent line colour = the product's label colour where there is a
// product; the section's own colour (or brand amber) otherwise.
//
// Flip to false to get the photo site back exactly as it was.
export const TOPO_BACKGROUNDS = true
