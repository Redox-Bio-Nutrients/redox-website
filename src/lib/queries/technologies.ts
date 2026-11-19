// src/lib/queries/technologies.ts

import { previewFetch, sanityFetch } from '../sanity'
import type { Technology, TechnologyCard } from '../types/sanity'
import { HOME_SECTIONS_FRAGMENT, SEO_FRAGMENT, TECHNOLOGY_CARD_FRAGMENT } from './fragments'

export async function getAllTechnologies(): Promise<TechnologyCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "technology"] | order(orderRank asc, title asc) ${TECHNOLOGY_CARD_FRAGMENT}`,
  )
}

// Shared by getTechnology/getTechnologyPreview — one projection, two
// clients (public CDN-cached vs. draft-aware), same as products.
const TECHNOLOGY_QUERY = /* groq */ `*[_type == "technology" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  tagline,
  "icon": icon { asset, alt, hotspot },
  ${HOME_SECTIONS_FRAGMENT},
  ${SEO_FRAGMENT}
}`

export async function getTechnology(slug: string): Promise<Technology | null> {
  return sanityFetch(TECHNOLOGY_QUERY, { slug })
}

// Draft-aware — only for src/pages/preview/technologies/[slug].astro.
export async function getTechnologyPreview(slug: string): Promise<Technology | null> {
  return previewFetch(TECHNOLOGY_QUERY, { slug })
}
