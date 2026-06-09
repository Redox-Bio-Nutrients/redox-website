// sanity/schemas/documents/universityResource.ts
//
// WHY: University content lives in Sanity but access is enforced by
// the frontend (`gated` flag) — Sanity is not the auth layer. The
// resource types cover what's expected at launch; extend the list as
// new formats appear.

import { defineField, defineType } from 'sanity'

export const universityResource = defineType({
  name: 'universityResource',
  title: 'University Resource',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'resourceType',
      title: 'Resource Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video', value: 'video' },
          { title: 'Article', value: 'article' },
          { title: 'Course', value: 'course' },
          { title: 'Download', value: 'download' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gated',
      title: 'Requires University login',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube/Vimeo URL — only for Video resources.',
      hidden: ({ document }) => document?.resourceType !== 'video',
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Only for Download resources.',
      hidden: ({ document }) => document?.resourceType !== 'download',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'resourceType', media: 'coverImage' },
  },
})
