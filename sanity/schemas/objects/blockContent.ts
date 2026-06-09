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
  ],
})
