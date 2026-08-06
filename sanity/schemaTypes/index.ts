// sanity/schemaTypes/index.ts
//
// Registration order doesn't matter to Sanity, but keep objects first
// and documents grouped by site section for readability.

// Objects (shared shapes)
import { seo } from '../schemas/objects/seo'
import { blockContent } from '../schemas/objects/blockContent'
import { cta } from '../schemas/objects/cta'
import {
  analysisSection,
  bulletSection,
  calloutSection,
  chartSection,
  faqSection,
  testimonialSection,
  textSection,
  videoSection,
} from '../schemas/objects/productSections'
import {
  homeHeroSection,
  homeHeroCarouselSection,
  homeColumnSection,
} from '../schemas/objects/homeSections'

// Documents
import { product } from '../schemas/documents/product'
import { technology } from '../schemas/documents/technology'
import { region } from '../schemas/documents/region'
import { rep } from '../schemas/documents/rep'
import { blogPost } from '../schemas/documents/blogPost'
import { category } from '../schemas/documents/category'
import { author } from '../schemas/documents/author'
import { podcastEpisode } from '../schemas/documents/podcastEpisode'
import { universityResource } from '../schemas/documents/universityResource'
import { page } from '../schemas/documents/page'
import { backgroundPool } from '../schemas/documents/backgroundPool'
import { homepage } from '../schemas/documents/homepage'

export const schemaTypes = [
  // objects
  seo,
  blockContent,
  cta,
  textSection,
  calloutSection,
  bulletSection,
  analysisSection,
  chartSection,
  faqSection,
  testimonialSection,
  videoSection,
  homeHeroSection,
  homeHeroCarouselSection,
  homeColumnSection,
  // catalog
  product,
  technology,
  // regions & reps
  region,
  rep,
  // editorial
  blogPost,
  category,
  author,
  podcastEpisode,
  // university
  universityResource,
  // generic pages
  page,
  // site-level
  backgroundPool,
  homepage,
]
