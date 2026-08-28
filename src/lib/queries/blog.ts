// src/lib/queries/blog.ts

import { previewFetch, sanityFetch } from '../sanity'
import type { BlogPost, BlogPostCard } from '../types/sanity'
import {
  BLOG_CARD_FRAGMENT,
  BLOG_FALLBACK_POOL_FRAGMENT,
  IMAGE_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
  SEO_FRAGMENT,
  blockContentField,
} from './fragments'

// Shared by getBlogPost/getBlogPostPreview — one projection, two
// clients (public CDN-cached vs. draft-aware), same pattern as
// PRODUCT_QUERY in products.ts.
const BLOG_POST_QUERY = /* groq */ `*[_type == "blogPost" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  "coverImage": coverImage ${IMAGE_FRAGMENT},
  "fallbackPool": ${BLOG_FALLBACK_POOL_FRAGMENT},
  markets,
  "categories": categories[]->{ title, "slug": slug.current, color },
  "author": author->{
    name,
    "slug": slug.current,
    role,
    "photo": photo ${IMAGE_FRAGMENT},
    bio
  },
  ${blockContentField('body')},
  "relatedProducts": relatedProducts[]-> ${PRODUCT_CARD_FRAGMENT},
  // Chronological neighbors for the prev/next nav on the detail page
  // (BlogPostNav.astro) -- "previous" is the post published just
  // before this one (older), "next" is published just after (newer),
  // independent of how /blog's own listing happens to sort. ^ escapes
  // back to this outer document from inside each nested filter, which
  // otherwise iterates its own "blogPost" scope.
  "previousPost": *[_type == "blogPost" && publishedAt < ^.publishedAt] | order(publishedAt desc) [0]{ title, "slug": slug.current },
  "nextPost": *[_type == "blogPost" && publishedAt > ^.publishedAt] | order(publishedAt asc) [0]{ title, "slug": slug.current },
  ${SEO_FRAGMENT}
}`

export async function getAllBlogPosts(): Promise<BlogPostCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "blogPost"] | order(publishedAt desc) ${BLOG_CARD_FRAGMENT}`,
  )
}

export async function getBlogPostsByCategory(categorySlug: string): Promise<BlogPostCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "blogPost" && $categorySlug in categories[]->slug.current]
      | order(publishedAt desc) ${BLOG_CARD_FRAGMENT}`,
    { categorySlug },
  )
}

export async function getAllCategories(): Promise<{ title: string; slug: string }[]> {
  return sanityFetch(
    /* groq */ `*[_type == "category"] | order(title asc){ title, "slug": slug.current }`,
  )
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return sanityFetch(BLOG_POST_QUERY, { slug })
}

export async function getBlogPostPreview(slug: string): Promise<BlogPost | null> {
  return previewFetch(BLOG_POST_QUERY, { slug })
}
