// sanity/schemas/documents/technology.ts
//
// WHY: Technologies (the science behind the products) get their own
// pages under /technologies and are referenced by products, so they
// are documents rather than embedded objects. The detail page is
// modular — same page-builder sections as the Homepage (Hero, Hero
// Carousel, Columns) — rather than a fixed template. Title/slug/icon/
// tagline stay as document-level fields since they're used by the
// catalog card and cross-references, independent of page content.

import { defineField, defineType } from 'sanity'

export const technology = defineType({
  name: 'technology',
  title: 'Technology',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Technology Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Shown on the Technologies listing card.',
    }),
    defineField({
      name: 'icon',
      title: 'Icon / Logo',
      type: 'image',
      description: 'Shown on the Technologies listing card.',
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        { type: 'homeHeroSection' },
        { type: 'homeHeroCarouselSection' },
        { type: 'homeColumnSection' },
        { type: 'chartSection' },
      ],
      description:
        'Compose the technology detail page — same modular sections as the Homepage. A "Built Into These Products" list renders automatically below, based on which products reference this technology.',
    }),
    defineField({
      name: 'orderRank',
      title: 'Sort Order',
      type: 'number',
      initialValue: 100,
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'tagline', media: 'icon' },
  },
})
