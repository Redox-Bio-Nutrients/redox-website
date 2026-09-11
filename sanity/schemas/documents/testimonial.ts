// sanity/schemas/documents/testimonial.ts
//
// WHY: A standalone document rather than another embedded object like
// productSections.ts's `testimonialSection` (a single grower quote
// authored inline on one product's page). This is the opposite shape
// on purpose — one shared pool of customer quotes, reusable across
// any page that wants a testimonials section (the Turf landing page
// first; the Homepage's "See Redox at Work" section is expected to
// want the same pool next) without re-typing a quote per page it
// shows up on. `markets` tags which page(s) a quote is relevant to,
// same field/values as product.ts and blogPost.ts.

import { defineField, defineType } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g. "Superintendent" or "Almond Grower"',
    }),
    defineField({
      name: 'company',
      title: 'Company / Location',
      type: 'string',
      description: 'e.g. "Pelican Point Golf & Country Club" — shown alongside role.',
    }),
    defineField({
      name: 'avatar',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
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
      },
      description: 'Which page(s) this testimonial can show up on. Leave both checked if it applies to either.',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'orderRank',
      title: 'Sort Order',
      type: 'number',
      initialValue: 100,
      description: 'Lower numbers show first within a market. Ties fall back to alphabetical by name.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'company', media: 'avatar' },
  },
})
