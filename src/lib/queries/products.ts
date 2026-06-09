// src/lib/queries/products.ts

import { sanityFetch } from '../sanity'
import type { Market, Product, ProductCard } from '../types/sanity'
import { IMAGE_FRAGMENT, PRODUCT_CARD_FRAGMENT, SEO_FRAGMENT, TECHNOLOGY_CARD_FRAGMENT } from './fragments'

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

export async function getProduct(slug: string): Promise<Product | null> {
  return sanityFetch(
    /* groq */ `*[_type == "product" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      tagline,
      markets,
      "image": image ${IMAGE_FRAGMENT},
      primaryColor,
      // sections is a discriminated union — spread everything and let
      // the per-_type frontend renderers pick their fields
      sections[]{ ... },
      "documents": documents[]{ title, "url": asset->url },
      "technologies": technologies[]-> ${TECHNOLOGY_CARD_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
