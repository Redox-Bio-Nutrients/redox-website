// src/lib/queries/homepage.ts
//
// WHY: The homepage is a singleton document (fixed _id "homepage", set
// by the Studio structure) holding a reorderable, polymorphic sections
// array. See HOME_SECTIONS_FRAGMENT for the shared projection — the
// same one Technology pages use.

import { sanityFetch } from '../sanity'
import type { Homepage } from '../types/sanity'
import { HOME_SECTIONS_FRAGMENT, SEO_FRAGMENT } from './fragments'

export async function getHomepage(): Promise<Homepage | null> {
  return sanityFetch(
    /* groq */ `*[_type == "homepage"][0]{
      _id,
      ${HOME_SECTIONS_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
  )
}
