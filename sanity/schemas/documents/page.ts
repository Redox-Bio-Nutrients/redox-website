// sanity/schemas/documents/page.ts
//
// WHY: Catch-all for marketing/landing pages (About, Contact intro
// copy, market landing pages) that don't fit a structured type.
// Keeps editors out of the codebase for copy changes.

import { defineField, defineType } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'heroCta',
      title: 'Hero CTA',
      type: 'cta',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'sections',
      title: 'Additional Sections',
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
        'Optional page-builder modules rendered after the Body copy above — same building blocks as the Homepage. A brand new page can use these instead of (or alongside) Hero/Body.',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
