// sanity/schemas/documents/backgroundPool.ts
//
// WHY: Site-level singleton holding the shared background imagery pool
// (crops, fields, abstract textures). Product pages whose documents
// have no imagery of their own draw a random background from this pool
// on every load — so all 29 products get rotating imagery from day one
// and per-product galleries refine it over time.

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
        'Site-wide pool — crops, fields, abstract imagery. Products without their own Background Imagery draw a random image from here on every page load.',
      components: { input: BulkImageInput },
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { images: 'images' },
    prepare({ images }) {
      return {
        title: 'Background Imagery',
        subtitle: `Shared pool — ${images?.length ?? 0} image${images?.length === 1 ? '' : 's'}`,
      }
    },
  },
})
