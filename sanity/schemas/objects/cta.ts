// sanity/schemas/objects/cta.ts
//
// WHY: Hero sections, product pages, and landing blocks all need
// editor-controlled call-to-action buttons. One shared shape means
// one CTA component on the frontend.

import { defineField, defineType } from 'sanity'

export const cta = defineType({
  name: 'cta',
  title: 'Call to Action',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Internal path (/contact) or full URL (https://…).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'external',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
