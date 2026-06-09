// sanity/schemas/documents/region.ts
//
// WHY: Regions group reps geographically and get their own landing
// pages under /regions. The rep locator queries reps by region and
// by the zip prefixes stored here.

import { defineField, defineType } from 'sanity'

export const region = defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Region Name',
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
      type: 'blockContent',
    }),
    defineField({
      name: 'image',
      title: 'Region Image / Map',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'states',
      title: 'States / Areas Covered',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Idaho", "Eastern Washington". Shown on the region page.',
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
    select: { title: 'title', media: 'image' },
  },
})
