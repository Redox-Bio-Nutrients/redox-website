// src/lib/queries/university.ts

import { sanityFetch } from '../sanity'
import type { UniversityResource, UniversityResourceCard } from '../types/sanity'
import { IMAGE_FRAGMENT, SEO_FRAGMENT, blockContentField } from './fragments'

const RESOURCE_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  resourceType,
  gated,
  excerpt,
  "coverImage": coverImage ${IMAGE_FRAGMENT}
}`

export async function getAllUniversityResources(): Promise<UniversityResourceCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "universityResource"] | order(title asc) ${RESOURCE_CARD_FRAGMENT}`,
  )
}

export async function getUniversityResource(slug: string): Promise<UniversityResource | null> {
  return sanityFetch(
    /* groq */ `*[_type == "universityResource" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      resourceType,
      gated,
      excerpt,
      "coverImage": coverImage ${IMAGE_FRAGMENT},
      videoUrl,
      "fileUrl": file.asset->url,
      ${blockContentField('body')},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
