// src/lib/color.ts
//
// WHY: `--product-color` is one hex value per product — great for
// consistent branding, but a single flat hue reads as monochromatic on
// a large solid surface (the callout background). Rather than hardcode
// a second palette per product in Sanity, derive a couple of
// hue-shifted variants at render time so every product automatically
// gets a richer, multi-tone background that's still clearly "that
// product's color," not an arbitrary rainbow.

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

/** Exported for CalloutSection's drop-shadow — it picks its own
 * curated (h, s, l) triples for a grounded, non-neon palette rather
 * than deriving from the product color, so it needs the raw
 * converter rather than deriveCalloutPalette's brand-tied output. */
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
 * fallback string). */
export function deriveCalloutPalette(hex: string): CalloutPalette {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { base: hex, bright: hex, deep: hex, complement: hex }
  }
  const [h, s, l] = hexToHsl(hex)
  return {
    base: hex,
    bright: hslToHex(h + 18, Math.max(s - 5, 40), Math.min(l + 20, 80)),
    deep: hslToHex(h - 38, Math.min(s + 15, 92), Math.max(l - 18, 10)),
    complement: hslToHex(h + 180, Math.min(s + 8, 88), Math.min(Math.max(l, 45), 62)),
  }
}
