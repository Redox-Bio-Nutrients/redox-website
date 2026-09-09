// sanity/schemas/documents/region.ts
//
// WHY: Regions group agronomists/contacts geographically and get
// their own landing pages under /regions. A person (author.ts —
// doubles as a blog byline and/or a regional contact) is assigned to
// a region via a reference on their own document, not an array here —
// see getRegion() in src/lib/queries/regions.ts for the team roster
// query. The specific states/counties someone actually covers live on
// that person (author.ts's coverageAreas), not here — two agronomists
// in the same region typically split it, so a states list at the
// region level was the wrong granularity.

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
