// src/lib/queries/blog.ts

import { sanityFetch } from '../sanity'
import type { BlogPost, BlogPostCard } from '../types/sanity'
import { BLOG_CARD_FRAGMENT, IMAGE_FRAGMENT, PRODUCT_CARD_FRAGMENT, SEO_FRAGMENT } from './fragments'

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
  return sanityFetch(
    /* groq */ `*[_type == "blogPost" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      "coverImage": coverImage ${IMAGE_FRAGMENT},
      "categories": categories[]->{ title, "slug": slug.current },
      "author": author->{
        name,
        "slug": slug.current,
        role,
        "photo": photo ${IMAGE_FRAGMENT},
        bio
      },
      body,
      "relatedProducts": relatedProducts[]-> ${PRODUCT_CARD_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
