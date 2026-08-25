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
  /** base64 blurred placeholder for blur-up loading */
  lqip?: string
  /** native asset pixel size — lets layouts reserve aspect-ratio space before the image loads (e.g. masonry grids) without a CLS jump */
  dimensions?: { width: number; height: number }
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

export interface FaqSection {
  _type: 'faqSection'
  _key: string
  heading?: string
  items: { question: string; answer: PortableTextBlock[] }[]
}

export interface TestimonialSection {
  _type: 'testimonialSection'
  _key: string
  quote: string
  name: string
  role?: string
  avatar?: SanityImage
}

export interface VideoSection {
  _type: 'videoSection'
  _key: string
  heading?: string
  url: string
  caption?: string
}

export interface WarningSection {
  _type: 'warningSection'
  _key: string
  heading?: string
  message: PortableTextBlock[]
  /** optional numbered steps, e.g. mixing/handling instructions */
  steps?: string[]
}

export type ProductSection =
  | TextSection
  | CalloutSection
  | BulletSection
  | AnalysisSection
  | ChartSection
  | FaqSection
  | TestimonialSection
  | VideoSection
  | WarningSection

// ── Catalog ────────────────────────────────────────────────────────

export interface ProductCard {
  _id: string
  title: string
  slug: string
  tagline?: string
  markets: Market[]
  image?: SanityImage
  /** heroImage + backgrounds pool — pick one at random per load */
  backgrounds?: SanityImage[]
  collections?: Collection[]
}

export interface Product extends ProductCard {
  primaryColor?: string
  /** optional second brand color — see deriveCalloutPalette() in src/lib/color.ts */
  accentColor?: string
  heroImage?: SanityImage
  /** optional dedicated pool for callout sections; falls back to backgrounds */
  calloutBackgrounds?: SanityImage[]
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

// ── Collections ───────────────────────────────────────────────────
// Freeform grouping — see sanity/schemas/documents/collection.ts.

export interface Collection {
  _id: string
  title: string
  slug: string
  description?: string
  color?: string
  kind?: string
}

export interface Technology extends TechnologyCard {
  /** modular page-builder sections — same shapes as Homepage */
  sections?: HomeSection[]
  /** reverse reference: products whose `technologies` field points here */
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
  /** just enough for a card byline (avatar + name) — the full bio/role/slug live on `Author`, used by the detail page */
  author?: { name: string; photo?: SanityImage }
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

// ── Site settings (singletons) ──────────────────────────────────────

export interface FormSettings {
  resourceRequestRecipient: string
}

export interface SiteWallpaper {
  lightImage?: SanityImage
  darkImage?: SanityImage
  opacity: number
}

// ── Homepage (modular page-builder sections) ───────────────────────

export interface HomeHeroSection {
  _type: 'homeHeroSection'
  _key: string
  heading: string
  subheading?: string
  backgroundImage?: SanityImage
  /** resolved file URL — takes priority over backgroundImage when present */
  backgroundVideoUrl?: string
  cta?: Cta
}

/** A single slide of a Hero Carousel — same shape as HomeHeroSection
 * minus the discriminant, since a slide is just "a hero" repeated. */
export interface HeroSlide {
  _key: string
  heading: string
  subheading?: string
  backgroundImage?: SanityImage
  backgroundVideoUrl?: string
  cta?: Cta
}

export interface HomeHeroCarouselSection {
  _type: 'homeHeroCarouselSection'
  _key: string
  slides: HeroSlide[]
  autoplay?: boolean
  interval?: number
}

export interface ColumnItem {
  _key: string
  image?: SanityImage
  heading?: string
  body?: PortableTextBlock[]
  cta?: Cta
}

export type SectionBackgroundType = 'none' | 'color' | 'image'

export interface HomeColumnSection {
  _type: 'homeColumnSection'
  _key: string
  heading?: string
  columns: 1 | 2 | 3
  items: ColumnItem[]
  backgroundType?: SectionBackgroundType
  backgroundColor?: string
  backgroundImage?: SanityImage
}

export type HomeSection = HomeHeroSection | HomeHeroCarouselSection | HomeColumnSection | ChartSection

export interface Homepage {
  _id: string
  sections?: HomeSection[]
  seo?: Seo
}
