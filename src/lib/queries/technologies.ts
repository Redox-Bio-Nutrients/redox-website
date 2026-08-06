// src/lib/queries/technologies.ts

import { sanityFetch } from '../sanity'
import type { Technology, TechnologyCard } from '../types/sanity'
import { HOME_SECTIONS_FRAGMENT, PRODUCT_CARD_FRAGMENT, SEO_FRAGMENT, TECHNOLOGY_CARD_FRAGMENT } from './fragments'

export async function getAllTechnologies(): Promise<TechnologyCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "technology"] | order(orderRank asc, title asc) ${TECHNOLOGY_CARD_FRAGMENT}`,
  )
}

export async function getTechnology(slug: string): Promise<Technology | null> {
  return sanityFetch(
    /* groq */ `*[_type == "technology" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      tagline,
      "icon": icon { asset, alt, hotspot },
      ${HOME_SECTIONS_FRAGMENT},
      // reverse reference: products built on this technology
      "products": *[_type == "product" && references(^._id)]
        | order(orderRank asc, title asc) ${PRODUCT_CARD_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
