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
// Region assignment is a reference *from* the person *to* the region
// (not an array on the region) — reassigning someone is a single-field
// edit on their own doc, not hunting for their name in a region's
// list. See region.ts / RegionDetail's team query in
// src/lib/queries/regions.ts.

import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Team Member',
  type: 'document',
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
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      description: 'Used on blog posts. Not shown on region team cards.',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Regional/agronomist contact card only — optional otherwise.',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Regional/agronomist contact card only — optional otherwise.',
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'reference',
      to: [{ type: 'region' }],
      description:
        'Set this to list the person as an agronomist/contact on that region’s page. Leave empty for a blog-only author.',
    }),
    defineField({
      name: 'zipPrefixes',
      title: 'Zip Code Prefixes',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        '3-digit zip prefixes this person covers, e.g. "836" covers 83601–83699. For a future zip-lookup tool — not required for the region page itself.',
      hidden: ({ document }) => !document?.region,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})
