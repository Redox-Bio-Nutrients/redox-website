// src/lib/queries/fragments.ts
//
// WHY: GROQ has no native fragment system, so shared projections live
// here as template strings. Every query that returns an image, seo
// block, or card shape composes these — change a projection once and
// every query stays in sync with src/lib/types.

export const IMAGE_FRAGMENT = /* groq */ `{
  asset,
  alt,
  hotspot,
  // tiny blurred placeholder (base64) — painted instantly while the
  // full image loads (blur-up)
  "lqip": asset->metadata.lqip
}`

export const SEO_FRAGMENT = /* groq */ `seo {
  metaTitle,
  metaDescription,
  "ogImage": ogImage ${IMAGE_FRAGMENT},
  noIndex
}`

// Background pool, in priority order: the product's own backgrounds
// gallery (plus its hero) → its dedicated hero image (a set hero wins
// over the shared pool — no rotation) → the site-wide shared pool
// (backgroundPool singleton). Cards and heroes pick one at random
// client-side on each load.
export const BG_POOL_FRAGMENT = /* groq */ `select(
  count(coalesce(backgrounds, [])) > 0 =>
    array::compact([heroImage ${IMAGE_FRAGMENT}] + backgrounds[] ${IMAGE_FRAGMENT}),
  defined(heroImage) => [heroImage ${IMAGE_FRAGMENT}],
  *[_type == "backgroundPool"][0].images[] ${IMAGE_FRAGMENT}
)`

export const PRODUCT_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  tagline,
  markets,
  "image": image ${IMAGE_FRAGMENT},
  "backgrounds": ${BG_POOL_FRAGMENT}
}`

export const TECHNOLOGY_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  tagline,
  "icon": icon ${IMAGE_FRAGMENT}
}`

export const BLOG_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  "coverImage": coverImage ${IMAGE_FRAGMENT},
  "categories": categories[]->{ title, "slug": slug.current }
}`

export const EPISODE_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  episodeNumber,
  publishedAt,
  excerpt,
  "coverImage": coverImage ${IMAGE_FRAGMENT}
}`

export const REP_FRAGMENT = /* groq */ `{
  _id,
  name,
  title,
  "photo": photo ${IMAGE_FRAGMENT},
  email,
  phone,
  zipPrefixes,
  "region": region->{ title, "slug": slug.current }
}`
