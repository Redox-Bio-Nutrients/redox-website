// src/lib/queries/people.ts
//
// Queries against the shared Team Member pool (author.ts) that aren't
// specific to blog authorship (blog.ts) or a region roster
// (regions.ts) — today the About Us office staff grid, plus the
// state-coverage lookup the Product Information Request email uses to
// route to the right rep (src/pages/api/resource-request.ts).

import { sanityFetch } from '../sanity'
import type { Author, CoverageRep } from '../types/sanity'
import { AUTHOR_FRAGMENT } from './fragments'

export async function getOfficeStaff(): Promise<Author[]> {
  return sanityFetch(
    /* groq */ `*[_type == "author" && isOfficeStaff == true] | order(officeOrderRank asc, name asc) ${AUTHOR_FRAGMENT}`,
  )
}

// Every rep with both an email and at least one coverage area — the
// small candidate pool resource-request.ts matches the submitted
// "State" dropdown value against. Matching happens in JS, not GROQ
// (see that file), so this returns plain state-name strings, already
// ordered same as the region roster (orderRank asc, name asc — same
// "regional manager first" tie-break as getAllRegionsWithTeams()) so
// the first JS match found is the right person to pick when two reps'
// coverage happens to overlap.
export async function getStateCoverageReps(): Promise<CoverageRep[]> {
  return sanityFetch(
    /* groq */ `*[_type == "author" && defined(email) && count(coverageAreas) > 0] | order(orderRank asc, name asc) {
      name,
      email,
      coverageAreas
    }`,
  )
}
