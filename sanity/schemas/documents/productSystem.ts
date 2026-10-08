// sanity/schemas/documents/productSystem.ts
//
// WHY: A "system" explainer that compares two or more products side by
// side (first use: the RDX Nitrogen System — RDX-N vs. RDX-Flex) and
// has to read identically on every member product's page. Kept as its
// own document, referenced from each product's `productSystemSection`,
// so the copy is edited once instead of drifting between pages. Each
// card pulls its name, color, image, and link live from the referenced
// product; only the comparison copy lives here.

import { defineArrayMember, defineField, defineType } from 'sanity'

export const productSystem = defineType({
  name: 'productSystem',
  title: 'Product System',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'System Name',
      type: 'string',
      description: 'Shown as the small label above the heading, e.g. "The RDX Nitrogen System".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'anchor',
      title: 'Link Anchor',
      type: 'slug',
      options: { source: 'title' },
      description:
        'Lets other pages link straight to this section, e.g. /products/rdx-flex#nitrogen-system. Changing it breaks existing links.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'e.g. "Help plants get more from nitrogen."',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'blockContent',
      description: 'What the system does — shown under the heading.',
    }),
    defineField({
      name: 'compareHeading',
      title: 'Comparison Heading',
      type: 'string',
      description: 'e.g. "RDX-N vs. RDX-Flex"',
    }),
    defineField({
      name: 'compareIntro',
      title: 'Comparison Intro',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'members',
      title: 'Products',
      type: 'array',
      description: 'One card per product, in order (the first is the starting point).',
      validation: (rule) => rule.required().min(2),
      of: [
        defineArrayMember({
          name: 'systemMember',
          title: 'Product Card',
          type: 'object',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'analysis',
              title: 'Analysis',
              type: 'string',
              description: 'Guaranteed analysis shown beside the name, e.g. "0-0-3".',
            }),
            defineField({
              name: 'headline',
              title: 'Headline',
              type: 'string',
              description: 'e.g. "The preferred starting point."',
            }),
            defineField({
              name: 'specs',
              title: 'Quick Facts',
              type: 'array',
              description: 'Short label/value rows — Rate, Application, Best timing, etc.',
              of: [
                defineArrayMember({
                  name: 'systemSpec',
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
                    defineField({ name: 'value', title: 'Value', type: 'string', validation: (r) => r.required() }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'value' } },
                }),
              ],
            }),
            defineField({
              name: 'summary',
              title: 'Summary',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'notes',
              title: 'Notes',
              type: 'array',
              description: 'Optional labeled paragraphs below the summary, e.g. "Nitrogen reduction", "Fits with".',
              of: [
                defineArrayMember({
                  name: 'systemNote',
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
                    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (r) => r.required() }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'text' } },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'product.title', subtitle: 'headline', media: 'product.image' },
          },
        }),
      ],
    }),
    defineField({
      name: 'closingHeading',
      title: 'Closing Heading',
      type: 'string',
      description: 'e.g. "When does RDX-Flex fit after RDX-N?"',
    }),
    defineField({
      name: 'closingBody',
      title: 'Closing Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'closingFootnote',
      title: 'Closing Footnote',
      type: 'text',
      rows: 3,
      description: 'Smaller supporting note, e.g. trial/measurement context.',
    }),
    defineField({
      name: 'closingTakeaway',
      title: 'Closing Takeaway',
      type: 'string',
      description: 'One emphasized line to end on.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'compareHeading' },
  },
})
