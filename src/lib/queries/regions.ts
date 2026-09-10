// src/lib/queries/regions.ts
//
// The standalone /regions listing + /regions/[slug] pages were
// retired 2026-09 (per Curtis's nav change order) — the region/team
// roster now lives in the About Us company directory instead. Region
// documents and the author→region relationship are unchanged (still
// how West/Midwest/Turf group their agronomists); only the two
// per-region page queries (getAllRegions for getStaticPaths, getRegion
// for the individual page) went away with those pages.
// getAllRegionsWithTeams stays — it's what the About Us directory
// pulls from.

import { sanityFetch } from '../sanity'
import type { Region } from '../types/sanity'
import { AUTHOR_FRAGMENT, IMAGE_FRAGMENT, blockContentField } from './fragments'

// Every region with its full team roster — powers the About Us
// company directory (same "grouped, same-page anchors" pattern as
// GroupedProductCatalog.astro on the catalog pages).
export async function getAllRegionsWithTeams(): Promise<Region[]> {
  return sanityFetch(
    /* groq */ `*[_type == "region"] | order(orderRank asc, title asc){
      _id,
      title,
      "slug": slug.current,
      "image": image ${IMAGE_FRAGMENT},
      ${blockContentField('description')},
      "team": *[_type == "author" && region._ref == ^._id] | order(orderRank asc, name asc) ${AUTHOR_FRAGMENT}
    }`,
  )
}
