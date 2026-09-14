// src/lib/texture.ts
//
// WHY: The "textured gradient surface" look — fine grain + a few
// hue-shifted radial light/shadow blooms + a diagonal sweep, all
// randomized per-instance but stable across rebuilds — started as
// CalloutSection.astro's own background recipe. Reused now by the
// site's full-bleed hero headers (HeroSection/HeroCarouselSection/
// [slug].astro) too, so the seeded-position math that used to live
// inline in CalloutSection's frontmatter is factored out here —
// anything that wants the same "brand color, richly lit" surface
// calls buildTextureVars() and adds the .texture-fill/.texture-wash
// class from src/styles/texture-surface.css, rather than
// reimplementing the random bloom placement per component.

import { deriveCalloutPalette } from './color'
import { randomBetween, randomChoice, seededRandom } from './seededRandom'

/** Seeded on `seedKey` (a section's `_key`, a page slug, anything
 * stable) — not Math.random() — so a given instance gets a genuinely
 * different bloom layout from its neighbors, but the *same* layout on
 * every rebuild rather than reshuffling on redeploy. bright/deep stay
 * in their own "upper"/"lower" position bands (a handful of
 * candidates each) so the light-from-above, shadow-below logic never
 * breaks; only which corner within that band varies. Returns a ready-
 * to-use inline `style` string of `--texture-*` custom properties —
 * drop it straight into a `style={...}` attribute alongside
 * `.texture-fill`/`.texture-wash` (see texture-surface.css). */
export function buildTextureVars(seedKey: string, color: string, accentColor?: string): string {
  const palette = deriveCalloutPalette(color, accentColor)
  const rng = seededRandom(seedKey)
  const sweepAngle = Math.round(randomBetween(rng, 100, 160))
  const brightPos = randomChoice(rng, ['92% -10%', '8% -10%', '50% -18%', '75% -15%'])
  const deepPos = randomChoice(rng, ['0% 115%', '100% 115%', '50% 122%', '25% 118%'])
  const complementPos = randomChoice(rng, ['78% 96%', '15% 92%', '85% 12%', '10% 8%', '95% 55%', '4% 55%'])
  const complementSizeX = Math.round(randomBetween(rng, 55, 92))
  const complementSizeY = Math.round(randomBetween(rng, 70, 105))
  const complementMix = Math.round(randomBetween(rng, 34, 52))

  return [
    `--texture-color: ${color}`,
    `--texture-bright: ${palette.bright}`,
    `--texture-deep: ${palette.deep}`,
    `--texture-complement: ${palette.complement}`,
    `--texture-sweep: ${sweepAngle}deg`,
    `--texture-bright-pos: ${brightPos}`,
    `--texture-deep-pos: ${deepPos}`,
    `--texture-complement-pos: ${complementPos}`,
    `--texture-complement-size: ${complementSizeX}% ${complementSizeY}%`,
    `--texture-complement-mix: ${complementMix}%`,
  ].join('; ')
}
