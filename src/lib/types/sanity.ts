// src/lib/types/sanity.ts
//
// WHY: Hand-maintained types mirroring the GROQ projections in
// src/lib/queries — NOT the full Sanity documents. Each type matches
// what its query actually returns, so a projection change and its type
// change happen in the same PR. If schema/type drift becomes a problem,
// switch to sanity-typegen.

import type { PortableTextBlock } from '@portabletext/types'

// ── Shared shapes ──────────────────────────────────────────────────

export interface SanityImage {
  asset: { _ref: string; _type: 'reference' }
  alt?: string
  hotspot?: { x: number; y: number; height: number; width: number }
}

export interface Seo {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
  noIndex?: boolean
}

export interface Cta {
  label: string
  href: string
  external?: boolean
}

export type Market = 'agriculture' | 'turf'

// ── Product content sections ───────────────────────────────────────
// Discriminated union on _type — matches the section objects in
// sanity/schemas/objects/productSections.ts. The frontend switches on
// _type to pick a renderer component.

export interface TextSection {
  _type: 'textSection'
  _key: string
  heading?: string
  body: PortableTextBlock[]
}

export interface CalloutSection {
  _type: 'calloutSection'
  _key: string
  heading?: string
  body: PortableTextBlock[]
  tone: 'solid' | 'tint'
}

export interface BulletSection {
  _type: 'bulletSection'
  _key: string
  heading?: string
  items: string[]
  columns: 1 | 2 | 3
}

export interface AnalysisSection {
  _type: 'analysisSection'
  _key: string
  heading?: string
  rows: { label: string; value: string }[]
}

export interface ChartSection {
  _type: 'chartSection'
  _key: string
  heading: string
  source?: string
  unit?: string
  rows: { label: string; value: number; highlight?: boolean }[]
  footnote?: string
}

export type ProductSection =
  | TextSection
  | CalloutSection
  | BulletSection
  | AnalysisSection
  | ChartSection

// ── Catalog ────────────────────────────────────────────────────────

export interface ProductCard {
  _id: string
  title: string
  slug: string
  tagline?: string
  markets: Market[]
  image?: SanityImage
}

export interface Product extends ProductCard {
  primaryColor?: string
  heroImage?: SanityImage
  sections?: ProductSection[]
  crops?: string[]
  relatedProducts?: ProductCard[]
  documents?: { title?: string; url: string; isUpload?: boolean; filename?: string }[]
  technologies?: TechnologyCard[]
  seo?: Seo
}

export interface TechnologyCard {
  _id: string
  title: string
  slug: string
  tagline?: string
  icon?: SanityImage
}

export interface Technology extends TechnologyCard {
  description?: PortableTextBlock[]
  products?: ProductCard[]
  seo?: Seo
}

// ── Regions & reps ─────────────────────────────────────────────────

export interface RegionCard {
  _id: string
  title: string
  slug: string
  image?: SanityImage
  states?: string[]
}

export interface Region extends RegionCard {
  description?: PortableTextBlock[]
  reps?: Rep[]
  seo?: Seo
}

export interface Rep {
  _id: string
  name: string
  title?: string
  photo?: SanityImage
  email?: string
  phone?: string
  zipPrefixes?: string[]
  region?: { title: string; slug: string }
}

// ── Editorial ──────────────────────────────────────────────────────

export interface Author {
  name: string
  slug: string
  role?: string
  photo?: SanityImage
  bio?: string
}

export interface BlogPostCard {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  coverImage?: SanityImage
  categories?: { title: string; slug: string }[]
}

export interface BlogPost extends BlogPostCard {
  author?: Author
  body: PortableTextBlock[]
  relatedProducts?: ProductCard[]
  seo?: Seo
}

export interface PodcastEpisodeCard {
  _id: string
  title: string
  slug: string
  episodeNumber?: number
  publishedAt: string
  excerpt?: string
  coverImage?: SanityImage
}

export interface PodcastEpisode extends PodcastEpisodeCard {
  buzzsproutEpisodeId?: string
  guests?: string[]
  showNotes?: PortableTextBlock[]
  seo?: Seo
}

// ── University ─────────────────────────────────────────────────────

export type UniversityResourceType = 'video' | 'article' | 'course' | 'download'

export interface UniversityResourceCard {
  _id: string
  title: string
  slug: string
  resourceType: UniversityResourceType
  gated: boolean
  excerpt?: string
  coverImage?: SanityImage
}

export interface UniversityResource extends UniversityResourceCard {
  videoUrl?: string
  fileUrl?: string
  body?: PortableTextBlock[]
  seo?: Seo
}

// ── Generic pages ──────────────────────────────────────────────────

export interface Page {
  _id: string
  title: string
  slug: string
  heroHeading?: string
  heroSubheading?: string
  heroImage?: SanityImage
  heroCta?: Cta
  body?: PortableTextBlock[]
  seo?: Seo
}
