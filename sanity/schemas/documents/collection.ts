// sanity/schemas/documents/collection.ts
//
// WHY: A general-purpose, freeform grouping for products (and
// potentially other document types later) — deliberately NOT a fixed
// enum baked into the product schema. Marketing positioning on these
// products shifts with market conditions; a document type means new
// groupings (a seasonal campaign, a re-cut of the benefit taxonomy,
// whatever comes up) can be created and products re-tagged entirely in
// Studio, no code change or redeploy required. Same pattern as blog's
// `category` document, generalized past one fixed taxonomy dimension.

import { defineField, defineType } from 'sanity'

export const collection = defineType({
  name: 'collection',
  title: 'Collection',
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
      name: 'description',
      title: 'Description',
      type: 'string',
      description: 'One-line framing, e.g. "Create the environment for plant success."',
    }),
    defineField({
      name: 'color',
      title: 'Accent Color',
      type: 'string',
      description: 'Optional hex color for a badge/accent when this collection is displayed. e.g. #2E6B3E',
      validation: (rule) =>
        rule
          .regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex color', invert: false })
          .error('Must be a 6-digit hex color like #2E6B3E'),
    }),
    defineField({
      name: 'kind',
      title: 'Taxonomy Type',
      type: 'string',
      description:
        'Freeform label for what dimension this collection belongs to, e.g. "Benefit Category" or "Seasonal Campaign" — purely organizational, not enforced. Helps keep the Collection list legible if multiple taxonomies end up in use at once.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'kind' },
  },
})
