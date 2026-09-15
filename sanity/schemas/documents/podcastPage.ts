// sanity/schemas/documents/podcastPage.ts
//
// WHY: Site-level singleton (like homepage.ts) holding the Podcast
// page's modular section array — same page-builder pattern as
// Homepage/Technology, so the hero and any surrounding content are
// fully editable in Studio instead of fixed in code. The episode grid
// itself (src/pages/podcast/index.astro) is a fixed block rendered
// between the first section and the rest — live/RSS-driven off
// Buzzsprout, not something this document models.

import { defineField, defineType } from 'sanity'

export const podcastPage = defineType({
  name: 'podcastPage',
  title: 'Podcast Page',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        { type: 'homeHeroSection' },
        { type: 'homeHeroCarouselSection' },
        { type: 'homeColumnSection' },
        { type: 'homeStatsSection' },
        { type: 'homeCtaSection' },
        { type: 'chartSection' },
        { type: 'calloutSection' },
        { type: 'bulletSection' },
      ],
      description:
        'Compose the page around the episode grid — put a Hero first for the page header. The episode grid itself always renders after the first section, followed by anything else you add here.',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    prepare() {
      return { title: 'Podcast Page' }
    },
  },
})
