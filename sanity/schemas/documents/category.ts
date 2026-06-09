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
  ],
})
