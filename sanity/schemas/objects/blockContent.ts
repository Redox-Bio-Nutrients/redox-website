// sanity/schemas/objects/blockContent.ts
//
// WHY: One shared rich-text definition keeps editorial formatting
// consistent across blog posts, product descriptions, and pages.
// Add custom block types (callouts, embeds) here and every document
// that uses blockContent gets them automatically.

import { defineArrayMember, defineType } from 'sanity'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule: any) =>
                  rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
              },
              { name: 'blank', type: 'boolean', title: 'Open in new tab', initialValue: false },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text', validation: (rule: any) => rule.required() },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'gallery',
      title: 'Photo Gallery',
      description: 'A grid of photos, not one-per-row -- pick this instead of adding several images in a row.',
      fields: [
        {
          name: 'images',
          title: 'Images',
          type: 'array',
          of: [
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                { name: 'alt', type: 'string', title: 'Alt text', validation: (rule: any) => rule.required() },
              ],
            },
          ],
          validation: (rule: any) => rule.min(2),
        },
      ],
      preview: {
        select: { images: 'images' },
        prepare({ images }: { images?: unknown[] }) {
          const count = images?.length ?? 0
          return { title: `Photo Gallery (${count} image${count === 1 ? '' : 's'})`, media: images?.[0] as any }
        },
      },
    }),
    // Referenced by registered type name only -- chartSection is
    // already a complete, standalone object type (productSections.ts),
    // registered schema-wide in schemaTypes/index.ts. No need to import
    // or redeclare its fields here, same as referencing the built-in
    // "block"/"image" types works by name.
    defineArrayMember({ type: 'chartSection' }),
    defineArrayMember({
      type: 'object',
      name: 'productEmbed',
      title: 'Product Card(s)',
      description: 'Feature one or more products inline, e.g. right where the post is talking about them.',
      fields: [
        {
          name: 'products',
          title: 'Products',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'product' }] }],
          validation: (rule: any) => rule.min(1).max(4),
        },
      ],
      preview: {
        select: { products: 'products', firstTitle: 'products.0.title' },
        prepare({ products, firstTitle }: { products?: unknown[]; firstTitle?: string }) {
          const count = products?.length ?? 0
          const title =
            count === 1 ? (firstTitle ?? 'Product Card') : `Product Cards (${count})`
          return { title }
        },
      },
    }),
  ],
})
