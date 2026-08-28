// sanity/schemas/documents/backgroundPool.ts
//
// WHY: Two market-specific singletons share this one document type —
// "Ag Background Imagery" (_id: agBackgroundPool) and "Turf Background
// Imagery" (_id: turfBackgroundPool), each a fixed-ID singleton edited
// via its own entry in structure.ts (same pattern as every other
// site-level singleton here, just two instances of one type instead of
// one). Product pages whose own documents have no imagery of their own
// draw a random background from whichever pool matches their market —
// see BG_POOL_FRAGMENT / BLOG_FALLBACK_POOL_FRAGMENT in
// src/lib/queries/fragments.ts. Split 2026-08-27 from a single
// site-wide pool (previously _id: backgroundPool, all-agriculture
// imagery in practice) now that Ag and Turf need to stop sharing one
// image library — see redox-ag-turf-background-split memory for the
// migration.

import { defineField, defineType } from 'sanity'
import { BulkImageInput } from '../../components/BulkImageInput'

export const backgroundPool = defineType({
  name: 'backgroundPool',
  title: 'Background Imagery',
  type: 'document',
  fields: [
    defineField({
      name: 'images',
      title: 'Shared Pool',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      description:
        'Pool for this market — crops/fields for Ag, turf/fairways for Turf. Products and posts in this market without their own Background Imagery draw a random image from here on every page load.',
      components: { input: BulkImageInput },
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { images: 'images', id: '_id' },
    prepare({ images, id }) {
      const label = id === 'turfBackgroundPool' ? 'Turf' : 'Ag'
      return {
        title: `${label} Background Imagery`,
        subtitle: `${images?.length ?? 0} image${images?.length === 1 ? '' : 's'}`,
      }
    },
  },
})
