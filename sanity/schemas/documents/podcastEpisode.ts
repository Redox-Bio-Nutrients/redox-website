// sanity/schemas/documents/podcastEpisode.ts
//
// WHY: Audio is hosted on Buzzsprout; Sanity stores the editorial
// wrapper (show notes, guests, related content) plus the Buzzsprout
// episode ID for the embedded player.

import { defineField, defineType } from 'sanity'

export const podcastEpisode = defineType({
  name: 'podcastEpisode',
  title: 'Podcast Episode',
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
      name: 'episodeNumber',
      title: 'Episode Number',
      type: 'number',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'buzzsproutEpisodeId',
      title: 'Buzzsprout Episode ID',
      type: 'string',
      description: 'Used to embed the Buzzsprout player on the episode page.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'guests',
      title: 'Guests',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'showNotes',
      title: 'Show Notes',
      type: 'blockContent',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  orderings: [
    {
      title: 'Episode Number (newest first)',
      name: 'episodeDesc',
      by: [{ field: 'episodeNumber', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'episodeNumber', media: 'coverImage' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `Episode ${subtitle}` : undefined, media }
    },
  },
})
