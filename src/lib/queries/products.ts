// src/lib/queries/products.ts

import { previewFetch, sanityFetch } from '../sanity'
import type { Market, Product, ProductCard } from '../types/sanity'
import { BG_POOL_FRAGMENT, IMAGE_FRAGMENT, PRODUCT_CARD_FRAGMENT, SEO_FRAGMENT, TECHNOLOGY_CARD_FRAGMENT } from './fragments'

export async function getProductsByMarket(market: Market): Promise<ProductCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "product" && $market in markets]
      | order(orderRank asc, title asc) ${PRODUCT_CARD_FRAGMENT}`,
    { market },
  )
}

export async function getAllProducts(): Promise<ProductCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "product"] | order(orderRank asc, title asc) ${PRODUCT_CARD_FRAGMENT}`,
  )
}

// Shared by getProduct/getProductPreview — one projection, two clients
// (public CDN-cached vs. draft-aware), so the two never drift apart.
const PRODUCT_QUERY = /* groq */ `*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  tagline,
  markets,
  "image": image ${IMAGE_FRAGMENT},
  "heroImage": heroImage ${IMAGE_FRAGMENT},
  "backgrounds": ${BG_POOL_FRAGMENT},
  "calloutBackgrounds": calloutBackgrounds[] ${IMAGE_FRAGMENT},
  primaryColor,
  accentColor,
  // sections is a discriminated union — spread everything and let
  // the per-_type frontend renderers pick their fields
  sections[]{ ... },
  crops,
  "relatedProducts": relatedProducts[]-> ${PRODUCT_CARD_FRAGMENT},
  // url resolves to whichever source the editor used; isUpload
  // lets the frontend build a forced-download variant for Sanity
  // CDN assets (?dl=)
  "documents": documents[]{
    title,
    "url": coalesce(externalUrl, file.asset->url),
    "isUpload": defined(file.asset),
    "filename": file.asset->originalFilename
  },
  "technologies": technologies[]-> ${TECHNOLOGY_CARD_FRAGMENT},
  ${SEO_FRAGMENT}
}`

export async function getProduct(slug: string): Promise<Product | null> {
  return sanityFetch(PRODUCT_QUERY, { slug })
}

// Draft-aware variant for the SSR preview route (src/pages/preview/
// products/[slug].astro) — same projection, but resolves to the
// unpublished draft when one exists. See src/lib/sanity.ts for why
// this must never be called from a statically-prerendered page.
export async function getProductPreview(slug: string): Promise<Product | null> {
  return previewFetch(PRODUCT_QUERY, { slug })
}
