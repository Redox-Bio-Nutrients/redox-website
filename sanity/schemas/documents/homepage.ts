// sanity/schemas/documents/homepage.ts
//
// WHY: Site-level singleton (like backgroundPool) — one Homepage
// document holds the modular section array. Editors compose the page
// from a hero plus any number of reorderable 1-3 column sections.

import { defineField, defineType } from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
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
        { type: 'chartSection' },
      ],
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage' }
    },
  },
})
