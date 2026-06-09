// src/lib/queries/regions.ts

import { sanityFetch } from '../sanity'
import type { Region, RegionCard, Rep } from '../types/sanity'
import { IMAGE_FRAGMENT, REP_FRAGMENT, SEO_FRAGMENT } from './fragments'

export async function getAllRegions(): Promise<RegionCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "region"] | order(orderRank asc, title asc){
      _id,
      title,
      "slug": slug.current,
      "image": image ${IMAGE_FRAGMENT},
      states
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
      description,
      "reps": *[_type == "rep" && region._ref == ^._id] | order(name asc) ${REP_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}

// WHY: All reps are fetched at build time and zip matching happens
// client-side in the rep locator — the dataset is small (dozens of
// reps) and this avoids needing a runtime API endpoint.
export async function getAllReps(): Promise<Rep[]> {
  return sanityFetch(
    /* groq */ `*[_type == "rep"] | order(name asc) ${REP_FRAGMENT}`,
  )
}
