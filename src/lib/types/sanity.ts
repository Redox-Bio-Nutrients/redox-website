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
  /** per-instance crop (fractions trimmed from each edge, 0-1) — see IMAGE_FRAGMENT's own comment in fragments.ts */
  crop?: { top: number; bottom: number; left: number; right: number }
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
  eyebrow?: string
  heading?: string
  body: PortableTextBlock[]
  cta?: Cta
  /** Homepage/Technology page-builder only — see the schema field's own comment. */
  backgroundImage?: SanityImage
  tone: 'solid' | 'tint'
  color?: string
  accentColor?: string
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
  /** optional stylized wordmark shown instead of the plain text product name — hero and cards alike */
  logo?: SanityImage
  primaryColor?: string
  /** optional second brand color — see deriveCalloutPalette() in src/lib/color.ts */
  accentColor?: string
  /** heroImage + backgrounds pool — pick one at random per load */
  backgrounds?: SanityImage[]
  collections?: Collection[]
}

export interface Product extends ProductCard {
  heroImage?: SanityImage
  /** optional dedicated pool for callout sections; falls back to backgrounds */
  calloutBackgrounds?: SanityImage[]
  sections?: ProductSection[]
  crops?: string[]
  /** TFI Certified Biostimulant Program — shows the badge in the sidebar */
  tfiCertified?: boolean
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
  icon?: SanityImage
}

export interface Technology extends TechnologyCard {
  /** modular page-builder sections — same shapes as Homepage */
  sections?: HomeSection[]
  seo?: Seo
}

// ── Regions ────────────────────────────────────────────────────────

export interface RegionCard {
  _id: string
  title: string
  slug: string
  image?: SanityImage
}

export interface Region extends RegionCard {
  description?: PortableTextBlock[]
  /** agronomists/contacts assigned to this region — any Author whose
   * own `region` field references this document, see regions.ts */
  team?: Author[]
  seo?: Seo
}

// ── Editorial ──────────────────────────────────────────────────────

/** One shared "person" document — a blog byline, a region's
 * agronomist/contact card, or both (see author.ts's WHY comment for
 * the 2026-09 consolidation from a separate Rep type). */
export interface Author {
  _id: string
  name: string
  slug: string
  role?: string
  photo?: SanityImage
  bio?: string
  email?: string
  phone?: string
  /** exact states this person covers — shown on their team card, see
   * author.ts. Purely a display field; the Product Information
   * Request form always goes to one gatekeeper address regardless of
   * state (see resource-request.ts). */
  coverageAreas?: string[]
  /** optional short display label shown on the team card instead of
   * listing every state in coverageAreas — cosmetic only, see
   * author.ts's coverageLabel */
  coverageLabel?: string
  zipPrefixes?: string[]
  region?: { title: string; slug: string }
}

/** A customer/partner quote — a shared pool reused across whichever
 * pages want a testimonials section (see testimonial.ts's WHY). */
export interface Testimonial {
  _id: string
  quote: string
  name: string
  role?: string
  company?: string
  avatar?: SanityImage
  markets: Market[]
}

export interface BlogPostCard {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  coverImage?: SanityImage
  /** shared site-wide Background Imagery pool, only fetched when this
   * post has no coverImage of its own — see BlogPostDetail.astro and
   * BlogMasonry.astro, which both pick a deterministic photo from it */
  fallbackPool?: SanityImage[]
  /** optional, unset on every WordPress-migrated post — see blogPost.ts.
   * Drives which Background Imagery pool `fallbackPool` above draws
   * from when set; not yet surfaced as filterable UI. */
  markets?: Market[]
  /** color is optional — editor-set in Studio (category.ts) overrides
   * the automatic groundedAccent(slug) pick when present */
  categories?: { title: string; slug: string; color?: string }[]
  /** just enough for a card byline (avatar + name) — the full bio/role/slug live on `Author`, used by the detail page */
  author?: { name: string; photo?: SanityImage }
}

export interface BlogPost extends BlogPostCard {
  author?: Author
  body: PortableTextBlock[]
  relatedProducts?: ProductCard[]
  /** chronological neighbors (by publishedAt) for BlogPostNav.astro's
   * prev/next widget -- null at either end of the timeline */
  previousPost?: { title: string; slug: string } | null
  nextPost?: { title: string; slug: string } | null
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
  /** Optional page-builder modules — same shapes as Homepage. */
  sections?: HomeSection[]
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
  /** optional standalone statement shown under the subheading, same
   * italic serif treatment as a blockContent Pull Quote */
  quote?: string
  quoteAttribution?: string
  backgroundImage?: SanityImage
  /** resolved file URL — takes priority over backgroundImage when present */
  backgroundVideoUrl?: string
  cta?: Cta
  textAlign?: 'left' | 'center'
  useBackgroundPool?: boolean
  /** only populated when useBackgroundPool is true — see HOME_SECTIONS_FRAGMENT */
  pool?: SanityImage[]
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

export type SectionBackgroundType = 'none' | 'color' | 'image' | 'pool'

export interface HomeColumnSection {
  _type: 'homeColumnSection'
  _key: string
  eyebrow?: string
  heading?: string
  /** 'split' ignores `columns` and uses only `items[0]` — its image
   * full-bleed to one edge (see `imagePosition`), its heading/body/cta
   * in the other column. 'overlap' also ignores `columns` and
   * `items[0]`'s image — a text-only white card (heading/body/cta)
   * pulled up to overlap the bottom-right of the previous section.
   * 'duo' also ignores `columns`, uses `items[0]`/`items[1]` — each
   * becomes its own full-bleed photo panel (one per viewport edge)
   * with its own heading/body/cta overlaid on the photo.
   * See homeSections.ts's homeColumnSection `layout` field. */
  layout?: 'grid' | 'split' | 'overlap' | 'duo'
  /** Split layout only. Which edge the full-bleed image sits against;
   * defaults to 'left' when unset. */
  imagePosition?: 'left' | 'right'
  columns: 1 | 2 | 3
  items: ColumnItem[]
  backgroundType?: SectionBackgroundType
  backgroundColor?: string
  backgroundImage?: SanityImage
  /** only populated when backgroundType is 'pool' — see HOME_SECTIONS_FRAGMENT */
  pool?: SanityImage[]
}

export interface StatItem {
  _key: string
  heading: string
  body?: string
}

export interface HomeStatsSection {
  _type: 'homeStatsSection'
  _key: string
  heading?: string
  body?: string
  items: StatItem[]
}

export interface HomeCtaSection {
  _type: 'homeCtaSection'
  _key: string
  heading: string
  body?: string
  buttons: Cta[]
}

/** A single product, referenced (not copied in) — see the schema
 * field's own comment in homeSections.ts for why. Deliberately a
 * standalone shape, not a reuse of ProductCard — this only needs a
 * handful of fields and none of ProductCard's own required `_id`. */
export interface HomeFeaturedProductSection {
  _type: 'homeFeaturedProductSection'
  _key: string
  eyebrow?: string
  product: {
    title: string
    slug: string
    tagline?: string
    markets: Market[]
    image?: SanityImage
    logo?: SanityImage
    primaryColor?: string
    accentColor?: string
    /** priority-chain pool (own gallery -> hero -> shared market pool) — see BG_POOL_FRAGMENT's own comment in fragments.ts */
    backgrounds?: SanityImage[]
    /** plain-text excerpt from the product's own page content — see the query's own comment in fragments.ts */
    excerpt?: string
  }
}

/** Latest N blog posts, live — same "reference/query, not copied-in
 * content" reasoning as HomeFeaturedProductSection: editors pick a
 * heading/intro/count, the posts themselves always come from
 * whatever's actually been published (see homeSections.ts's schema
 * field comment and HOME_SECTIONS_FRAGMENT's "posts" select branch). */
export interface HomeBlogShowcaseSection {
  _type: 'homeBlogShowcaseSection'
  _key: string
  eyebrow?: string
  heading?: string
  body?: string
  postCount: number
  cta?: Cta
  posts: BlogPostCard[]
}

export type HomeSection =
  | HomeHeroSection
  | HomeHeroCarouselSection
  | HomeColumnSection
  | HomeStatsSection
  | HomeCtaSection
  | HomeFeaturedProductSection
  | HomeBlogShowcaseSection
  | ChartSection
  | CalloutSection
  | BulletSection

export interface Homepage {
  _id: string
  sections?: HomeSection[]
  seo?: Seo
}

// ── Podcast pages (singletons, same page-builder shape as Homepage) ──

export interface TechnicalPodcastEpisode {
  _key: string
  title: string
  youtubeId: string
  episodeNumber?: number
}

export interface PodcastPage {
  _id: string
  sections?: HomeSection[]
  seo?: Seo
}

export interface TechnicalPodcastPage {
  _id: string
  sections?: HomeSection[]
  episodes?: TechnicalPodcastEpisode[]
  seo?: Seo
}
