// sanity/schemas/documents/technicalPodcastPage.ts
//
// WHY: Same singleton page-builder pattern as podcastPage.ts, plus an
// `episodes` array — the Technical Podcast has no public feed to pull
// from (see the old src/lib/technicalPodcast.ts, now superseded), so
// the curated title/YouTube ID list moves here as a plain repeatable
// field (same shape as homeStatsSection.items/homeCtaSection.buttons)
// rather than a separate document type — a small (~19), slow-growing,
// hand-curated list has no need for its own document list/detail
// screens in Studio. Array order = display order.

import { defineField, defineType } from 'sanity'

export const technicalPodcastPage = defineType({
  name: 'technicalPodcastPage',
  title: 'Technical Podcast Page',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        { type: 'homeHeroSection' },
        { type: 'homeHeroCarouselSection' },
        { type: 'homeColumnSection' },
        { type: 'homeStatsSection' },
        { type: 'homeCtaSection' },
        { type: 'chartSection' },
        { type: 'calloutSection' },
        { type: 'bulletSection' },
      ],
      description:
        'Compose the page around the episode grid — put a Hero first for the page header. The episode grid itself always renders after the first section, followed by anything else you add here.',
    }),
    defineField({
      name: 'episodes',
      title: 'Episodes',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'technicalPodcastEpisode',
          title: 'Episode',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'youtubeId',
              title: 'YouTube Video ID',
              type: 'string',
              description: 'The "v=" value from the video\'s YouTube URL, e.g. RPNTzMQ1aEs.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'episodeNumber',
              title: 'Episode Number',
              type: 'number',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'episodeNumber' },
            prepare({ title, subtitle }) {
              return { title, subtitle: subtitle ? `Episode ${subtitle}` : undefined }
            },
          },
        },
      ],
      description: 'Drag to reorder — this order is the display order on the page.',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    prepare() {
      return { title: 'Technical Podcast Page' }
    },
  },
})
