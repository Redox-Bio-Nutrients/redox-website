// src/lib/queries/regions.ts

import { sanityFetch } from '../sanity'
import type { Region, RegionCard } from '../types/sanity'
import { AUTHOR_FRAGMENT, IMAGE_FRAGMENT, SEO_FRAGMENT, blockContentField } from './fragments'

// Lightweight — just enough for getStaticPaths (see [slug].astro).
export async function getAllRegions(): Promise<RegionCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "region"] | order(orderRank asc, title asc){
      _id,
      title,
      "slug": slug.current,
      "image": image ${IMAGE_FRAGMENT}
    }`,
  )
}

// Every region with its full team roster — powers /regions, which
// lists every region and every agronomist on one page (same "grouped
// catalog, same-page anchors" pattern as GroupedProductCatalog.astro
// on /agriculture and /turf), rather than linking out to each
// region's own page for its roster.
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

export async function getRegion(slug: string): Promise<Region | null> {
  return sanityFetch(
    /* groq */ `*[_type == "region" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      "image": image ${IMAGE_FRAGMENT},
      ${blockContentField('description')},
      "team": *[_type == "author" && region._ref == ^._id] | order(orderRank asc, name asc) ${AUTHOR_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
