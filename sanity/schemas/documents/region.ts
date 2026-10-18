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
// region level was the wrong granularity for team cards.
//
// The "Location Imagery" fieldset below is a different thing: the
// region's geographic footprint (`states`) plus its own background
// image pool (`images`), administered here once — like the Ag/Turf
// Background Imagery singletons — and opted into per product
// (product.ts → regionalHeadersEnabled + regionalImageRegions). A
// visitor IP-located in one of the states sees these images in every
// random image picker tied to that product: its page header, its
// page's callouts, its catalog/embed cards, and the homepage Featured
// Product card (see src/lib/regionalPool.ts). Never shown as text.

import { defineField, defineType } from 'sanity'
import { US_STATES } from '../../lib/usStates'
import { BulkImageInput } from '../../components/BulkImageInput'

export const region = defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  fieldsets: [
    {
      name: 'locationImagery',
      title: 'Location Imagery',
      description: 'Regional background images for products that opt in. Not shown on Contact Us.',
    },
  ],
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
      title: 'States',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: US_STATES, layout: 'grid' },
      fieldset: 'locationImagery',
      description:
        'Visitors whose internet connection locates them in one of these states count as being in this region. Leave empty for a region that isn\'t a place (e.g. Turf).',
    }),
    defineField({
      name: 'images',
      title: 'Regional Background Imagery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      fieldset: 'locationImagery',
      description:
        'Pool shown to visitors in the States above, in place of the normal background imagery, on any product that has Regional Imagery turned on and this region picked. One image is picked at random on every page load.',
      components: { input: BulkImageInput },
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
