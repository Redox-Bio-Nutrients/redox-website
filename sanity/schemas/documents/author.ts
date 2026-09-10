// sanity/schemas/documents/author.ts
//
// WHY: One shared "person" document for the whole site, not split
// across an "Author" type (blog/podcast bylines) and a separate "Rep"
// type (regional contact cards) — the two overlapped almost entirely
// (name/title/photo) and every real person here is the same kind of
// thing: someone at Redox with a name, title, and photo, who may
// *also* write blog posts, *also* be assigned to a region, both, or
// neither. Consolidated 2026-09 (see redox-page-builder-extensions /
// session handoff memory) while building out the Regions page — at
// the time, zero Rep documents existed yet and only one placeholder
// Author did, so this was the cheap moment to do it, before real
// content built up on either side.
//
// A person is flagged into each role explicitly, not inferred:
// - Blog Author: the `isAuthor` checkbox below. blogPost.ts's author
//   reference field is filtered to isAuthor == true, so only flagged
//   people are even pickable as a byline.
// - Regional Agronomist: the `region` reference *from* the person *to*
//   the region (not an array on the region) — reassigning someone is
//   a single-field edit on their own doc, not hunting for their name
//   in a region's list. See region.ts / getRegion() in
//   src/lib/queries/regions.ts.
// Add someone to the pool once with neither flag set, then check
// either or both as needed — same person either way, never a
// duplicate record.

import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Team Member',
  type: 'document',
  fieldsets: [
    { name: 'blog', title: 'Blog Author', options: { collapsible: true } },
    { name: 'region', title: 'Regional Agronomist', options: { collapsible: true } },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'Shown as the blog byline role and/or the job title on a region’s team card.',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'isAuthor',
      title: 'Available as a Blog Author',
      type: 'boolean',
      initialValue: false,
      description: 'Check to make this person pickable as a blog post byline.',
      fieldset: 'blog',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      fieldset: 'blog',
      hidden: ({ document }) => !document?.isAuthor,
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'reference',
      to: [{ type: 'region' }],
      description: 'Set to list this person as an agronomist/contact on that region’s page.',
      fieldset: 'region',
    }),
    defineField({
      name: 'orderRank',
      title: 'Team Sort Order',
      type: 'number',
      initialValue: 100,
      description:
        'Lower numbers show first on the region roster (e.g. put the regional manager at 100, then space teammates out — 200, 300…). Ties fall back to alphabetical by name.',
      fieldset: 'region',
      hidden: ({ document }) => !document?.region,
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.email(),
      fieldset: 'region',
      hidden: ({ document }) => !document?.region,
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      fieldset: 'region',
      hidden: ({ document }) => !document?.region,
    }),
    defineField({
      name: 'coverageAreas',
      title: 'States / Counties Covered',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'e.g. "Iowa", "Story County, IA" — shown on their region team card. Two agronomists in the same region typically split it between them.',
      fieldset: 'region',
      hidden: ({ document }) => !document?.region,
    }),
    defineField({
      name: 'zipPrefixes',
      title: 'Zip Code Prefixes',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        '3-digit zip prefixes this person covers, e.g. "836" covers 83601–83699. For a future zip-lookup tool — not required for the region page itself.',
      fieldset: 'region',
      hidden: ({ document }) => !document?.region,
    }),
  ],
  preview: {
    select: { title: 'name', role: 'role', isAuthor: 'isAuthor', regionTitle: 'region.title', media: 'photo' },
    prepare({ title, role, isAuthor, regionTitle }) {
      const flags = [isAuthor && 'Author', regionTitle && `${regionTitle} Agronomist`].filter(Boolean)
      return {
        title,
        subtitle: [role, flags.join(' · ') || null].filter(Boolean).join(' — ') || 'Not flagged for anything yet',
      }
    },
  },
})
