// sanity/schemas/documents/product.ts
//
// WHY: Products are the core catalog. A product can serve Agriculture,
// Turf, or both — `markets` is a multi-select so the same product
// appears under both nav sections without duplication. Technologies
// are references so the relationship stays queryable in both directions.

import { defineField, defineType } from 'sanity'
import { BulkImageInput } from '../../components/BulkImageInput'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Name',
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
      name: 'markets',
      title: 'Markets',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Agriculture', value: 'agriculture' },
          { title: 'Turf', value: 'turf' },
        ],
        layout: 'grid',
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'technology' }] }],
      description: 'The Redox technologies this product is built on.',
    }),
    defineField({
      name: 'collections',
      title: 'Collections',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'collection' }] }],
      description:
        'Freeform groupings — a product can belong to any number of Collections, and Collections themselves can be created/renamed/regrouped at any time in Studio. Use this instead of hardcoding a taxonomy in the schema, since marketing positioning on these products can shift with market conditions.',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'One-line summary shown on cards and listings.',
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description: 'The packaging/product shot — cards and the product page sidebar.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'logo',
      title: 'Product Logo',
      type: 'image',
      description:
        'Optional stylized product wordmark/logotype (e.g. a designed "OxyCal" logo graphic), shown in place of the plain text product name on the page hero when set. Works for both Agriculture and Turf products — falls back to plain text when empty. Prefer a transparent-background file.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'backgrounds',
      title: 'Background Imagery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      description:
        'Crop/field photography pool — one image is shown at random behind the product hero and its catalog card on every page load. The Hero Image is included in the pool automatically.',
      components: { input: BulkImageInput },
    }),
    defineField({
      name: 'calloutBackgrounds',
      title: 'Callout Imagery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      description:
        "Optional pool used ONLY behind this product's callout sections — for highlighting specific crops (or avoiding others). When empty, callouts draw from Background Imagery / the shared pool.",
      components: { input: BulkImageInput },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description:
        'Wide lifestyle/field imagery for the product page hero. Falls back to a gradient of the primary color when empty.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      description: 'Hex color for this product\'s brand accents — callout sections render in this color. e.g. #2E6B3E',
      validation: (rule) =>
        rule
          .regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex color', invert: false })
          .error('Must be a 6-digit hex color like #2E6B3E'),
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      description:
        'Optional second brand color, for products with two distinct focus colors (e.g. a two-tone brochure). Replaces the automatically-computed accent shade in callout sections with this color instead. Leave empty to let the site derive one from Primary Color automatically.',
      validation: (rule) =>
        rule
          .regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex color', invert: false })
          .error('Must be a 6-digit hex color like #2E6B3E')
          .custom((value, context) => {
            if (!value) return true
            const doc = context.document as { primaryColor?: string } | undefined
            if (doc?.primaryColor && value.toLowerCase() === doc.primaryColor.toLowerCase()) {
              return 'Accent Color should differ from Primary Color, or just leave it empty.'
            }
            return true
          }),
    }),
    defineField({
      name: 'sections',
      title: 'Content Sections',
      type: 'array',
      description: 'Compose the product page — drag to reorder.',
      of: [
        { type: 'textSection' },
        { type: 'calloutSection' },
        { type: 'bulletSection' },
        { type: 'analysisSection' },
        { type: 'chartSection' },
        { type: 'faqSection' },
        { type: 'testimonialSection' },
        { type: 'videoSection' },
        { type: 'warningSection' },
      ],
    }),
    defineField({
      name: 'crops',
      title: 'Crops / Use Cases',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Tree Fruit", "Almonds", "Vegetables" — shown in the product page sidebar.',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      description: '"Pairs well with" — shown in the product page sidebar.',
      validation: (rule) => rule.max(3).warning('Sidebar fits 3 related products best.'),
    }),
    defineField({
      name: 'documents',
      title: 'Documents',
      type: 'array',
      description:
        'Supporting and supplemental materials that are not Labels, Brochures, or SDS — those are requested through the Product Information Request form instead. Upload a file OR paste a CDN link.',
      of: [
        {
          type: 'object',
          name: 'productDocument',
          title: 'Document',
          fields: [
            defineField({
              name: 'title',
              title: 'Document Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'file',
              title: 'File Upload',
              type: 'file',
              description: 'Upload to Sanity — use this OR the external link below.',
            }),
            defineField({
              name: 'externalUrl',
              title: 'External Link',
              type: 'url',
              description: 'Full URL to a file hosted elsewhere (CDN, Dropbox, etc.).',
              validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
            }),
          ],
          validation: (rule) =>
            rule.custom((doc: { file?: { asset?: unknown }; externalUrl?: string }) => {
              const hasFile = Boolean(doc?.file?.asset)
              const hasUrl = Boolean(doc?.externalUrl)
              if (!hasFile && !hasUrl) return 'Add a file upload or an external link.'
              if (hasFile && hasUrl) return 'Use either a file upload or an external link, not both.'
              return true
            }),
          preview: {
            select: { title: 'title', url: 'externalUrl', file: 'file.asset' },
            prepare({ title, url, file }) {
              return {
                title: title || 'Document',
                subtitle: file ? 'Uploaded file' : url ? 'External link' : 'Empty',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'orderRank',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first in listings.',
      initialValue: 100,
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'tagline', media: 'image' },
  },
})
