// src/lib/regionalPool.ts
//
// WHY: Every random image picker tied to a product — its page header
// (ProductDetail.astro), its page's callouts (CalloutSection.astro via
// PoolBackground), its cards (ProductCard.astro), and the homepage
// Featured Product card (FeaturedProductSection.astro via
// PoolBackground) — swaps its normal pool for a region's imagery when
// the product has Regional Imagery on and the visitor's state is in a
// picked region. The state comes from the `rdx_geo_state` cookie set by
// the edge middleware in src/integrations/geoStateCookie.mjs (US
// visitors only). Server render is unchanged; the swap is client-side,
// the same moment the normal random pick already happens.
//
// ProductDetail.astro's hero keeps an inline copy of chooseRegionalPool
// — it must run during parse, before first paint, so it can't import.

import type { RegionalImagePool, SanityImage } from './types/sanity'

export interface PoolEntry {
  url: string
  lqip: string | null
}

export interface RegionalPoolEntries {
  states: string[]
  pool: PoolEntry[]
}

/** Server side: map each region's images with the caller's own crop/size. */
export function buildRegionalPools(
  regionalPools: RegionalImagePool[] | null | undefined,
  toEntry: (img: SanityImage) => PoolEntry,
): RegionalPoolEntries[] {
  return (regionalPools ?? []).map((r) => ({ states: r.states, pool: r.images.map(toEntry) }))
}

/** Value for a `data-regional-pools` attribute — omitted when there's nothing to match. */
export function regionalPoolsAttr(pools: RegionalPoolEntries[]): string | undefined {
  return pools.length ? JSON.stringify(pools) : undefined
}

function geoState(): string | null {
  return (document.cookie.match(/(?:^|; )rdx_geo_state=([A-Z]{2})/) || [])[1] ?? null
}

/** Client side: the matching region's pool, or null to keep the normal one. */
export function chooseRegionalPool(json: string | undefined): PoolEntry[] | null {
  if (!json) return null
  const state = geoState()
  if (!state) return null
  const match = (JSON.parse(json) as RegionalPoolEntries[]).find((r) => r.states.includes(state))
  return match?.pool ?? null
}

/**
 * Client side: the entry a picker should show, or null to leave the
 * server-rendered first image alone. A regional pool always swaps,
 * even with one image — the server-rendered one isn't from it.
 */
export function pickPoolEntry(pool: PoolEntry[], regionalJson: string | undefined): PoolEntry | null {
  const regional = chooseRegionalPool(regionalJson)
  const from = regional ?? pool
  if (!regional && from.length < 2) return null
  return from[Math.floor(Math.random() * from.length)] ?? null
}
