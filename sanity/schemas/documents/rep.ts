// sanity/schemas/documents/rep.ts
//
// WHY: Powers the rep locator. Reps are matched to a searched zip code
// via zipPrefixes (3-digit prefixes cover an area without storing every
// zip), and grouped on region pages via the region reference.

import { defineField, defineType } from 'sanity'

export const rep = defineType({
  name: 'rep',
  title: 'Sales Rep',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'reference',
      to: [{ type: 'region' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'zipPrefixes',
      title: 'Zip Code Prefixes',
      type: 'array',
      of: [{ type: 'string' }],
      description: '3-digit zip prefixes this rep covers, e.g. "836" covers 83601–83699.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'title', media: 'photo' },
  },
})
