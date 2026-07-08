// sanity/schemas/objects/productSections.ts
//
// WHY: Product detail content is a reorderable array of typed sections
// instead of one rich-text blob. Editors compose and reorder sections
// per product; the frontend renders each _type with a dedicated
// component. Adding a new section kind = add an object here, add it to
// the product's sections array, add a renderer component.

import { defineField, defineType } from 'sanity'

// ── Header + paragraph ─────────────────────────────────────────────

export const textSection = defineType({
  name: 'textSection',
  title: 'Text Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Paragraph',
      type: 'blockContent',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || 'Text Section', subtitle: 'Text' }
    },
  },
})

// ── Colored callout ────────────────────────────────────────────────
// Renders on the product's primary color (set on the product document)
// so callouts stay on-brand automatically when a color changes.

export const calloutSection = defineType({
  name: 'calloutSection',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      description: 'Solid uses the product color as background; tint uses a light wash of it.',
      options: {
        list: [
          { title: 'Solid', value: 'solid' },
          { title: 'Tint', value: 'tint' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'solid',
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'tone' },
    prepare({ title, subtitle }) {
      return { title: title || 'Callout', subtitle: `Callout — ${subtitle ?? 'solid'}` }
    },
  },
})

// ── Bulleted points in 1–3 columns ─────────────────────────────────

export const bulletSection = defineType({
  name: 'bulletSection',
  title: 'Bullet Points',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Points',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
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
      initialValue: 1,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items', columns: 'columns' },
    prepare({ title, items, columns }) {
      const count = items?.length ?? 0
      return {
        title: title || 'Bullet Points',
        subtitle: `Bullets — ${count} item${count === 1 ? '' : 's'}, ${columns ?? 1} col`,
      }
    },
  },
})

// ── Guaranteed analysis (name … dotted leader … value) ─────────────

export const analysisSection = defineType({
  name: 'analysisSection',
  title: 'Analysis Table',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Guaranteed Analysis',
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'analysisRow',
          fields: [
            defineField({
              name: 'label',
              title: 'Chemical / Nutrient',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Analysis',
              type: 'string',
              description: 'e.g. "20%" — rendered after a dotted leader.',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'heading', rows: 'rows' },
    prepare({ title, rows }) {
      return {
        title: title || 'Analysis Table',
        subtitle: `Analysis — ${rows?.length ?? 0} rows`,
      }
    },
  },
})

// ── Trial chart (bar) ──────────────────────────────────────────────
// Editors enter rows; the frontend renders a native, theme-aware bar
// chart. `highlight: true` rows render in the product color (the
// treated result); others render as neutral controls.

export const chartSection = defineType({
  name: 'chartSection',
  title: 'Trial Chart',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Trial / Source',
      type: 'string',
      description: 'e.g. "Trial 23-N31" — shown small under the heading.',
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
      description: 'e.g. "bu/acre", "kg" — appended to each value.',
    }),
    defineField({
      name: 'rows',
      title: 'Bars',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'chartRow',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'number',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'highlight',
              title: 'Highlight (product-color bar)',
              type: 'boolean',
              initialValue: false,
              description: 'On for the treated/RDX result; off for controls.',
            }),
          ],
          preview: {
            select: { title: 'label', value: 'value', highlight: 'highlight' },
            prepare({ title, value, highlight }) {
              return { title, subtitle: `${value}${highlight ? ' ★' : ''}` }
            },
          },
        },
      ],
      validation: (rule) => rule.required().min(2).max(6),
    }),
    defineField({
      name: 'footnote',
      title: 'Footnote',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'heading', rows: 'rows' },
    prepare({ title, rows }) {
      return {
        title: title || 'Trial Chart',
        subtitle: `Chart — ${rows?.length ?? 0} bars`,
      }
    },
  },
})
