// src/lib/productVariant.ts
//
// WHY: Product section renderers need to know which visual system to
// use — the existing Agriculture look, or the Turf "diagonal-cut
// livery" system. One shared rule so every section component (and any
// future one) applies the exact same boundary, rather than each
// re-deriving its own condition from `markets`.
//
// Turf-only gets the turf treatment; everything else (Agriculture-only
// *or* dual-market) gets the existing Agriculture look. This mirrors
// the "turf-only" branch of MARKET_POOL_SELECT (fragments.ts) — the
// same boundary already governs which background pool a product
// draws from — but deliberately does NOT mirror its dual-market
// branch (which unions both pools for imagery): a visual *system* is
// binary in a way an image pool isn't, so a dual-market product falls
// back to the established Agriculture look rather than some
// undefined blend of the two. Revisit this default once a real
// dual-market product (e.g. RDX-N, sold under both catalogs) needs a
// real answer — see redox-turf-product-pages-prep memory.

import type { Market } from './types/sanity'

export type ProductVariant = 'agriculture' | 'turf'

export function getProductVariant(markets: Market[] | undefined): ProductVariant {
  const list = markets ?? []
  return list.includes('turf') && !list.includes('agriculture') ? 'turf' : 'agriculture'
}
