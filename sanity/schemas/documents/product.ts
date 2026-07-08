// sanity/schemas/documents/product.ts
//
// WHY: Products are the core catalog. A product can serve Agriculture,
// Turf, or both — `markets` is a multi-select so the same product
// appears under both nav sections without duplication. Technologies
// are references so the relationship stays queryable in both directions.

import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Name',
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
      name: 'markets',
      title: 'Markets',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Agriculture', value: 'agriculture' },
          { title: 'Turf', value: 'turf' },
        ],
        layout: 'grid',
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'technology' }] }],
      description: 'The Redox technologies this product is built on.',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'One-line summary shown on cards and listings.',
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description: 'The packaging/product shot — cards and the product page sidebar.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description:
        'Wide lifestyle/field imagery for the product page hero. Falls back to a gradient of the primary color when empty.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      description: 'Hex color for this product\'s brand accents — callout sections render in this color. e.g. #2E6B3E',
      validation: (rule) =>
        rule
          .regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex color', invert: false })
          .error('Must be a 6-digit hex color like #2E6B3E'),
    }),
    defineField({
      name: 'sections',
      title: 'Content Sections',
      type: 'array',
      description: 'Compose the product page — drag to reorder.',
      of: [
        { type: 'textSection' },
        { type: 'calloutSection' },
        { type: 'bulletSection' },
        { type: 'analysisSection' },
        { type: 'chartSection' },
      ],
    }),
    defineField({
      name: 'crops',
      title: 'Crops / Use Cases',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Tree Fruit", "Almonds", "Vegetables" — shown in the product page sidebar.',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      description: '"Pairs well with" — shown in the product page sidebar.',
      validation: (rule) => rule.max(3).warning('Sidebar fits 3 related products best.'),
    }),
    defineField({
      name: 'documents',
      title: 'Documents',
      type: 'array',
      description: 'Labels, SDS sheets, spec sheets.',
      of: [
        {
          type: 'file',
          fields: [{ name: 'title', type: 'string', title: 'Document Title' }],
        },
      ],
    }),
    defineField({
      name: 'orderRank',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first in listings.',
      initialValue: 100,
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'tagline', media: 'image' },
  },
})
