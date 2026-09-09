// src/lib/queries/regions.ts

import { sanityFetch } from '../sanity'
import type { Region, RegionCard } from '../types/sanity'
import { AUTHOR_FRAGMENT, IMAGE_FRAGMENT, SEO_FRAGMENT, blockContentField } from './fragments'

export async function getAllRegions(): Promise<RegionCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "region"] | order(orderRank asc, title asc){
      _id,
      title,
      "slug": slug.current,
      "image": image ${IMAGE_FRAGMENT},
      states,
      // team size for the listing card — full roster only fetched on
      // the region's own detail page (getRegion below)
      "teamCount": count(*[_type == "author" && region._ref == ^._id])
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
      states,
      ${blockContentField('description')},
      "team": *[_type == "author" && region._ref == ^._id] | order(name asc) ${AUTHOR_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
