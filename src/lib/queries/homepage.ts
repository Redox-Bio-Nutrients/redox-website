// src/lib/queries/homepage.ts
//
// WHY: The homepage is a singleton document (fixed _id "homepage", set
// by the Studio structure) holding a reorderable, polymorphic sections
// array. See HOME_SECTIONS_FRAGMENT for the shared projection — the
// same one Technology pages use.

import { previewFetch, sanityFetch } from '../sanity'
import type { Homepage } from '../types/sanity'
import { HOME_SECTIONS_FRAGMENT, SEO_FRAGMENT } from './fragments'

const HOMEPAGE_QUERY = /* groq */ `*[_type == "homepage"][0]{
  _id,
  ${HOME_SECTIONS_FRAGMENT},
  ${SEO_FRAGMENT}
}`

export async function getHomepage(): Promise<Homepage | null> {
  return sanityFetch(HOMEPAGE_QUERY)
}

// Draft-aware variant for the SSR preview route (src/pages/preview/
// home.astro) — same projection, see getProductPreview for the pattern.
export async function getHomepagePreview(): Promise<Homepage | null> {
  return previewFetch(HOMEPAGE_QUERY)
}
