// src/lib/sanity.ts
//
// WHY: One client instance shared by all queries. `useCdn: true` is
// safe because the site is statically built — content freshness comes
// from rebuild webhooks, not live API reads. The typed `sanityFetch`
// wrapper keeps query call sites terse and consistently typed.
//
// `previewClient`/`previewFetch` are the draft-reading counterparts,
// used only by the SSR preview routes under src/pages/preview/ (see
// src/pages/api/preview.ts for the auth-gated entry point). `useCdn:
// false` + `perspective: 'drafts'` + an authenticated token means
// these calls return the *draft* version of a document when one
// exists (falling back to published otherwise) instead of the public,
// CDN-cached, published-only view every other query in this codebase
// uses. Never call previewFetch from a statically-prerendered page —
// it needs a real per-request token/perspective, so it only makes
// sense inside `export const prerender = false` routes.

import { createClient } from '@sanity/client'
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'staging',
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
  useCdn: true,
})

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return sanityClient.fetch<T>(query, params)
}

export const previewClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'staging',
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
  useCdn: false,
  token: import.meta.env.SANITY_API_TOKEN,
  perspective: 'drafts',
})

export async function previewFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return previewClient.fetch<T>(query, params)
}

const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
