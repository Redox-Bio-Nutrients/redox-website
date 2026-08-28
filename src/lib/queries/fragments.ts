// src/lib/queries/fragments.ts
//
// WHY: GROQ has no native fragment system, so shared projections live
// here as template strings. Every query that returns an image, seo
// block, or card shape composes these — change a projection once and
// every query stays in sync with src/lib/types.
//
// Declaration order matters here in a way it wouldn't in most modules:
// these are top-level `const`s built from template literals that
// reference each other, evaluated in file order at module load. A
// fragment that calls another (e.g. HOME_SECTIONS_FRAGMENT calling
// blockContentField(), which itself closes over PRODUCT_CARD_FRAGMENT)
// must be declared *after* everything it depends on, or it's a
// "Cannot access '...' before initialization" TDZ error — one that
// `astro check` won't catch (it's a runtime evaluation-order issue,
// not a type error) but a production build will, immediately, on
// every single page. Confirmed the hard way once already; keep
// dependency order in mind when adding to this file.

export const IMAGE_FRAGMENT = /* groq */ `{
  asset,
  alt,
  hotspot,
  // tiny blurred placeholder (base64) — painted instantly while the
  // full image loads (blur-up)
  "lqip": asset->metadata.lqip,
  // native pixel size — lets layouts reserve the right aspect-ratio
  // box before the image loads (e.g. the blog masonry grid) instead
  // of shifting once it arrives
  "dimensions": asset->metadata.dimensions { width, height }
}`

export const SEO_FRAGMENT = /* groq */ `seo {
  metaTitle,
  metaDescription,
  "ogImage": ogImage ${IMAGE_FRAGMENT},
  noIndex
}`

// Picks the right Background Imagery pool for whatever document is in
// scope, based on its own `markets` field (product.ts's is required;
// blogPost.ts's is optional — this reads safely either way, since
// `"x" in markets` on an undefined `markets` is just falsy, not an
// error, falling through to the Ag default). Turf-only → Turf pool;
// tagged both → the union of both pools (Curtis's call: a dual-market
// item should draw from either, not just one); anything else
// (Agriculture-only, or no `markets` at all — every WordPress-migrated
// blog post) → Ag, matching the pool's own pre-split, all-agriculture
// content. See redox-ag-turf-background-split memory.
const MARKET_POOL_SELECT = /* groq */ `select(
  "turf" in markets && !("agriculture" in markets) =>
    *[_id == "turfBackgroundPool"][0].images[] ${IMAGE_FRAGMENT},
  "agriculture" in markets && "turf" in markets =>
    array::compact(
      *[_id == "agBackgroundPool"][0].images[] ${IMAGE_FRAGMENT} +
      *[_id == "turfBackgroundPool"][0].images[] ${IMAGE_FRAGMENT}
    ),
  *[_id == "agBackgroundPool"][0].images[] ${IMAGE_FRAGMENT}
)`

// Background pool, in priority order: the product's own backgrounds
// gallery (plus its hero) → its dedicated hero image (a set hero wins
// over the shared pool — no rotation) → the market-matched shared pool
// (MARKET_POOL_SELECT above). Cards and heroes pick one at random
// client-side on each load.
export const BG_POOL_FRAGMENT = /* groq */ `select(
  count(coalesce(backgrounds, [])) > 0 =>
    array::compact([heroImage ${IMAGE_FRAGMENT}] + backgrounds[] ${IMAGE_FRAGMENT}),
  defined(heroImage) => [heroImage ${IMAGE_FRAGMENT}],
  ${MARKET_POOL_SELECT}
)`

export const COLLECTION_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  description,
  color,
  kind,
  "icon": icon ${IMAGE_FRAGMENT}
}`

export const PRODUCT_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  tagline,
  markets,
  "image": image ${IMAGE_FRAGMENT},
  "backgrounds": ${BG_POOL_FRAGMENT},
  "collections": collections[]-> ${COLLECTION_FRAGMENT}
}`

// Every blockContent-typed field (sanity/schemas/objects/
// blockContent.ts) site-wide needs this same projection, not just
// `body,`/`message,`/`answer,` passed straight through -- of its
// custom block types, only "productEmbed" holds a *reference* to
// another document (a product) rather than something urlFor() can
// resolve on its own from a bare ref (an image block) or that's
// already plain scalars (a chartSection block). The conditional
// overlay only touches productEmbed items; every other block type in
// the array passes through the "..." spread completely untouched.
// Usage: `${blockContentField('body')}` in place of a bare `body,`.
export function blockContentField(fieldName: string): string {
  return /* groq */ `"${fieldName}": ${fieldName}[]{
    ...,
    _type == "productEmbed" => {
      "products": products[]-> ${PRODUCT_CARD_FRAGMENT}
    }
  }`
}

// Shared page-builder sections projection — used by any document type
// with a `sections` array of homeHeroSection / homeHeroCarouselSection
// / homeColumnSection / chartSection (Homepage, Technology, ...). One
// polymorphic projection covers every section _type; fields that don't
// apply to a given _type just resolve to null and are ignored by the
// HomeSections dispatcher, which switches on _type.
export const HOME_SECTIONS_FRAGMENT = /* groq */ `sections[]{
  _type,
  _key,
  heading,
  subheading,
  "backgroundImage": backgroundImage ${IMAGE_FRAGMENT},
  "backgroundVideoUrl": backgroundVideo.asset->url,
  cta,
  "slides": slides[]{
    _key,
    heading,
    subheading,
    "backgroundImage": backgroundImage ${IMAGE_FRAGMENT},
    "backgroundVideoUrl": backgroundVideo.asset->url,
    cta
  },
  autoplay,
  interval,
  columns,
  "items": items[]{
    _key,
    "image": image ${IMAGE_FRAGMENT},
    heading,
    ${blockContentField('body')},
    cta
  },
  backgroundType,
  backgroundColor,
  // chartSection fields
  source,
  unit,
  rows,
  footnote
}`

export const TECHNOLOGY_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  tagline,
  "icon": icon ${IMAGE_FRAGMENT}
}`

// Only fetched when the post has no cover image of its own — a
// deterministic pick from it (seeded on _id) stands in instead, both
// on the detail page hero and the masonry grid card. See
// BlogPostDetail.astro / BlogMasonry.astro. Market-matched via
// MARKET_POOL_SELECT, same as products — a post's own optional
// `markets` field (blogPost.ts) drives it; every WordPress-migrated
// post has it unset, which resolves to the Ag default.
export const BLOG_FALLBACK_POOL_FRAGMENT = /* groq */ `select(
  !defined(coverImage) => ${MARKET_POOL_SELECT}
)`

export const BLOG_CARD_FRAGMENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  "coverImage": coverImage ${IMAGE_FRAGMENT},
  "fallbackPool": ${BLOG_FALLBACK_POOL_FRAGMENT},
  markets,
  "categories": categories[]->{ title, "slug": slug.current, color },
  "author": author->{ name, "photo": photo ${IMAGE_FRAGMENT} }
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
