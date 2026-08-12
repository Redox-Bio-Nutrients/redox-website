// src/lib/queries/pages.ts

import { sanityFetch } from '../sanity'
import type { Page } from '../types/sanity'
import { IMAGE_FRAGMENT, SEO_FRAGMENT } from './fragments'

export async function getAllPageSlugs(): Promise<string[]> {
  return sanityFetch(/* groq */ `*[_type == "page" && defined(slug.current)].slug.current`)
}

export async function getPage(slug: string): Promise<Page | null> {
  return sanityFetch(
    /* groq */ `*[_type == "page" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      heroHeading,
      heroSubheading,
      "heroImage": heroImage ${IMAGE_FRAGMENT},
      heroCta,
      body,
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
