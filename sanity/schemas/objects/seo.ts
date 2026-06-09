// sanity/schemas/objects/seo.ts
//
// WHY: Every routable document embeds this object so editors control
// titles/descriptions/og images per page without developer involvement.
// Frontend falls back to the document's own title/excerpt when empty.

import { defineField, defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Overrides the page title in search results. ~60 characters max.',
      validation: (rule) => rule.max(70).warning('Titles over 60–70 characters get truncated in search results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Descriptions over 160 characters get truncated in search results.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      type: 'image',
      description: '1200×630 recommended. Falls back to the site default when empty.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
