// src/lib/color.ts
//
// WHY: `--product-color` is one hex value per product — great for
// consistent branding, but a single flat hue reads as monochromatic on
// a large solid surface (the callout background). Rather than hardcode
// a second palette per product in Sanity, derive a couple of
// hue-shifted variants at render time so every product automatically
// gets a richer, multi-tone background that's still clearly "that
// product's color," not an arbitrary rainbow.

import { randomBetween, randomChoice, seededRandom } from './seededRandom'

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s * 100, l * 100]
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  const sN = s / 100
  const lN = l / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lN - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export interface CalloutPalette {
  /** the product color, unchanged */
  base: string
  /** hue-shifted brighter/lighter — the side "catching light" */
  bright: string
  /** hue-shifted deeper/darker — the side falling into shadow */
  deep: string
  /** true complementary hue (+180°), clamped to a vivid mid-tone — a
   * deliberate contrast accent, not another step in the bright→deep
   * sweep */
  complement: string
}

/** Derives a small set from one brand hex: the color as given, a
 * lifted variant, a deepened variant, and a complementary accent — so
 * a gradient built from these reads as "the same color, richly lit,
 * with a spark of contrast" rather than a flat tint. Direction
 * matters, not just magnitude: hue always rotates `bright` toward
 * yellow/gold (+hue, a highlight catching warm light) and `deep`
 * toward red/magenta (-hue, a shadow sinking into a rich red rather
 * than fading to grey/black). Rotating symmetrically in both
 * directions instead — the first version of this — pushes one side
 * toward green/cyan for warm base colors (e.g. deep orange's "shadow"
 * landing on yellow-green), which reads as an unrelated hue bleeding
 * in rather than the same color deepened. `complement` is the
 * intentional exception to "stay in the same family" — a true +180°
 * opposite, clamped to a mid lightness so it reads as a genuine
 * contrast pop (matching the reference art's rainbow accent arcs)
 * rather than another shade of the brand color. Falls back to
 * returning `hex` for every field on non-hex input (e.g. a CSS var
 * fallback string).
 *
 * `accentHex` (from a product's optional Accent Color field) opts out
 * of the computed complement for products with two real brand colors
 * instead of one — the accent renders as-given rather than derived,
 * since it's an actual second brand color, not something to hue-shift.
 * Invalid/missing accentHex falls through to the computed complement,
 * same as before this param existed. */
export function deriveCalloutPalette(hex: string, accentHex?: string): CalloutPalette {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { base: hex, bright: hex, deep: hex, complement: hex }
  }
  const [h, s, l] = hexToHsl(hex)
  const hasAccent = accentHex && /^#[0-9a-fA-F]{6}$/.test(accentHex)
  return {
    base: hex,
    bright: hslToHex(h + 18, Math.max(s - 5, 40), Math.min(l + 20, 80)),
    deep: hslToHex(h - 38, Math.min(s + 15, 92), Math.max(l - 18, 10)),
    complement: hasAccent
      ? (accentHex as string)
      : hslToHex(h + 180, Math.min(s + 8, 88), Math.min(Math.max(l, 45), 62)),
  }
}

/** Lifts a hex color to a minimum lightness — only ever brightens,
 * never darkens a color that's already light enough. For the Turf
 * livery system's headings/borders/icons, which sit on a fixed
 * near-black slab (--color-text-primary) and get their color from
 * `deriveCalloutPalette(...).complement`: when a product HAS an
 * explicit accentColor, `complement` renders it exactly as given
 * (see above) with no lightness floor — an accent picked to be the
 * dark "shadow" side of a hero gradient (a legitimate, common choice)
 * becomes illegible as foreground text on an already-dark card.
 * Backgrounds/gradients (hero wash, card wash, button fills behind
 * white text) don't have this problem and should keep using the raw
 * value — only wrap this around uses where the color IS the
 * foreground/text/border against a dark surface. */
export function ensureReadableOnDark(hex: string, minLightness = 58): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  const [h, s, l] = hexToHsl(hex)
  if (l >= minLightness) return hex
  return hslToHex(h, Math.max(s, 45), minLightness)
}

// Fixed, deliberate colors for the two Markets — unlike a category's
// pill (deriveCalloutPalette(groundedAccent(slug)), an arbitrary but
// consistent random pick since categories are an open taxonomy),
// there are only ever two possible Markets, so their color should mean
// something rather than being seeded randomly: Agriculture gets the
// site's actual brand green, Turf gets --chart-2 (already vetted for
// contrast on both themes elsewhere) so the two read as clearly
// distinct at a glance without introducing a brand-new hue.
const MARKET_BASE_COLOR: Record<'agriculture' | 'turf', string> = {
  agriculture: '#3A7D50',
  turf: '#4A86C2',
}

export function marketPalette(market: 'agriculture' | 'turf'): CalloutPalette {
  return deriveCalloutPalette(MARKET_BASE_COLOR[market])
}

// ── Grounded accent palette ──────────────────────────────────────
//
// WHY: revives the curated hue/saturation/lightness bands from an
// earlier (reverted) callout drop-shadow experiment — greens, blues,
// browns, burnt orange, and amber only, each tuned so it stays
// "grounded" rather than sliding into neon at the saturated end.
// Brown isn't really its own hue, just a low-saturation, low-
// lightness orange — hence sharing burnt-orange/amber's hue range but
// with much tamer s/l. Used to give content without its own brand
// color (blog posts have no `primaryColor` field) a bit of the same
// richly-lit, multi-tone character the product callout boxes have.
const GROUNDED_ACCENT_FAMILIES: { h: [number, number]; s: [number, number]; l: [number, number] }[] = [
  { h: [95, 140], s: [30, 50], l: [24, 38] }, // green — moss to forest
  { h: [195, 225], s: [35, 55], l: [28, 42] }, // blue — denim to deep ocean
  { h: [20, 34], s: [22, 38], l: [16, 28] }, // brown — espresso to walnut
  { h: [14, 24], s: [55, 72], l: [30, 42] }, // burnt orange / rust
  { h: [36, 46], s: [55, 72], l: [38, 50] }, // amber / gold
]

/** Deterministic grounded-palette accent color for a piece of content
 * with no brand color of its own — seeded from a stable id (e.g. a
 * blog post's `_id`) so the same post always gets the same accent
 * across rebuilds, but different posts land on different families/
 * shades instead of repeating one formula. */
export function groundedAccent(seed: string): string {
  const rng = seededRandom(seed)
  const family = randomChoice(rng, GROUNDED_ACCENT_FAMILIES)
  const h = randomBetween(rng, family.h[0], family.h[1])
  const s = randomBetween(rng, family.s[0], family.s[1])
  const l = randomBetween(rng, family.l[0], family.l[1])
  return hslToHex(h, s, l)
}
