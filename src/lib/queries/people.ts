// src/lib/queries/people.ts
//
// Queries against the shared Team Member pool (author.ts) that aren't
// specific to blog authorship (blog.ts) or a region roster
// (regions.ts) — today just the About Us office staff grid.

import { sanityFetch } from '../sanity'
import type { Author } from '../types/sanity'
import { AUTHOR_FRAGMENT } from './fragments'

export async function getOfficeStaff(): Promise<Author[]> {
  return sanityFetch(
    /* groq */ `*[_type == "author" && isOfficeStaff == true] | order(officeOrderRank asc, name asc) ${AUTHOR_FRAGMENT}`,
  )
}
