// sanity/schemas/documents/category.ts
//
// WHY: Blog filtering. A document (not a string list) so categories
// can be renamed without touching every post.

import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Blog Category',
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
      name: 'color',
      title: 'Pill Color',
      type: 'string',
      description:
        'Hex color for this category\'s pill on blog cards, e.g. #4A86C2. Leave empty to let the site pick one automatically (deterministic per category, but not curated — two categories can end up close in hue).',
      validation: (rule) =>
        rule
          .regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex color', invert: false })
          .error('Must be a 6-digit hex color like #4A86C2'),
    }),
  ],
})
