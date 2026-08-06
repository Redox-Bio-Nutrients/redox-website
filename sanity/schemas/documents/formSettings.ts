// sanity/schemas/documents/formSettings.ts
//
// WHY: A singleton so the "who receives form submissions" address is
// editable by non-developers without a code deploy. Currently backs
// the Product Information Request email (src/pages/api/resource-
// request.ts). Unlike most content here, this is read live at request
// time by a server-rendered API route (not baked in at build time),
// so it deliberately does NOT need to be added to the Vercel rebuild
// webhook filter (see docs/deployment.md) — publishing a change here
// takes effect on the next form submission, no rebuild required.

import { defineField, defineType } from 'sanity'

export const formSettings = defineType({
  name: 'formSettings',
  title: 'Form Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'resourceRequestRecipient',
      title: 'Product Information Request Recipient',
      type: 'string',
      description:
        'Where "Product Information Request" submissions get emailed (sent from notifications@redoxgrows.com).',
      validation: (rule) => rule.required().email(),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Form Settings' }
    },
  },
})
