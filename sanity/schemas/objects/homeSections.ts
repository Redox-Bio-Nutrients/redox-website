// sanity/schemas/objects/homeSections.ts
//
// WHY: The homepage is a reorderable array of modular sections, same
// pattern as product pages. Editors compose it from one big hero plus
// any number of 1-3 column sections. Column sections can opt into a
// full-viewport-width background (color or image) while their content
// stays constrained to the site's standard content width — the two
// concerns (background bleed vs. content width) are separate fields
// so editors can't accidentally break the layout grid.

import { defineField, defineType } from 'sanity'

// Shared by the single Hero and each slide of the Hero Carousel — same
// content shape either way (heading/subheading/media/CTA), so a slide
// is just "a hero" repeated. Factored out to avoid maintaining two
// copies of these field definitions.
function heroContentFields() {
  return [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
      description:
        'Full-bleed image. Falls back to a brand-green gradient when empty. Also used as the video poster frame if a Background Video is set.',
    }),
    defineField({
      name: 'backgroundVideo',
      title: 'Background Video',
      type: 'file',
      options: { accept: 'video/*' },
      description:
        'Optional — takes priority over Background Image when set. Use a short, looped, silent-friendly clip (mp4).',
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'cta',
    }),
  ]
}

// ── Hero — big image-led header, same visual language as product pages ──

export const homeHeroSection = defineType({
  name: 'homeHeroSection',
  title: 'Hero',
  type: 'object',
  fields: heroContentFields(),
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || 'Hero', subtitle: 'Hero' }
    },
  },
})

// ── Hero Carousel — same visual treatment, cycles through slides ────

export const homeHeroCarouselSection = defineType({
  name: 'homeHeroCarouselSection',
  title: 'Hero Carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroSlide',
          title: 'Slide',
          fields: heroContentFields(),
          preview: {
            select: { title: 'heading', media: 'backgroundImage' },
          },
        },
      ],
      description: 'Use the single Hero instead if you only need one slide.',
      validation: (rule) => rule.required().min(2).max(6),
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'interval',
      title: 'Autoplay Interval (seconds)',
      type: 'number',
      initialValue: 6,
      hidden: ({ parent }) => !parent?.autoplay,
      validation: (rule) => rule.min(3).max(30),
    }),
  ],
  preview: {
    select: { slides: 'slides' },
    prepare({ slides }) {
      const count = slides?.length ?? 0
      return {
        title: 'Hero Carousel',
        subtitle: `${count} slide${count === 1 ? '' : 's'}`,
      }
    },
  },
})

// ── 1-3 column section ──────────────────────────────────────────────

export const homeColumnSection = defineType({
  name: 'homeColumnSection',
  title: 'Columns Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading shown above the columns.',
    }),
    defineField({
      name: 'columns',
      title: 'Column Count',
      type: 'number',
      options: {
        list: [
          { title: '1 column', value: 1 },
          { title: '2 columns', value: 2 },
          { title: '3 columns', value: 3 },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Columns',
      type: 'array',
      description: 'One entry per column — keep this in sync with Column Count.',
      of: [
        {
          type: 'object',
          name: 'columnItem',
          title: 'Column',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'blockContent',
            }),
            defineField({
              name: 'cta',
              title: 'Call to Action',
              type: 'cta',
            }),
          ],
          preview: {
            select: { title: 'heading', media: 'image' },
            prepare({ title, media }) {
              return { title: title || 'Column', media }
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).max(3),
    }),
    defineField({
      name: 'backgroundType',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'None (page background)', value: 'none' },
          { title: 'Color', value: 'color' },
          { title: 'Image', value: 'image' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
      description:
        'Color/Image backgrounds span the full viewport width; the columns inside still align to the standard content width.',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex color, e.g. #2E6B3E',
      hidden: ({ parent }) => parent?.backgroundType !== 'color',
      validation: (rule) =>
        rule.custom((val, ctx) => {
          const parent = ctx.parent as { backgroundType?: string } | undefined
          if (parent?.backgroundType === 'color' && !val) return 'Required when background is Color'
          if (val && !/^#([0-9a-fA-F]{6})$/.test(val as string)) {
            return 'Must be a 6-digit hex color like #2E6B3E'
          }
          return true
        }),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.backgroundType !== 'image',
    }),
  ],
  preview: {
    select: { title: 'heading', columns: 'columns', items: 'items' },
    prepare({ title, columns, items }) {
      const count = items?.length ?? 0
      return {
        title: title || 'Columns Section',
        subtitle: `${columns ?? 1} col — ${count} item${count === 1 ? '' : 's'}`,
      }
    },
  },
})
