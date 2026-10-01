// sanity/schemas/documents/teamContacts.ts
//
// WHY: Team members' email addresses and phone numbers, kept OUT of the
// public `author` documents. The production dataset is public (private
// datasets need a paid Sanity plan), so any field on a normal document
// can be read by anyone through the anonymous API — that's how the
// agronomists' cell numbers were exposed before 2026-10-01.
//
// This singleton lives at the fixed ID `private.teamContacts` (see
// structure.ts). Sanity never serves a document whose ID contains a dot
// to an unauthenticated request — the same rule that keeps `drafts.*`
// hidden — so the site's build (which sends SANITY_API_TOKEN) can read
// it, but the public API can't. AUTHOR_FRAGMENT in
// src/lib/queries/fragments.ts joins each person's row back onto them by
// reference, so EmployeeCard.astro still gets `email`/`phone` as before.
//
// Only works at that exact ID: a copy created any other way gets a
// random (public) ID, which is why sanity.config.ts hides this type from
// the "create new document" menu.

import { defineArrayMember, defineField, defineType } from 'sanity'

export const teamContacts = defineType({
  name: 'teamContacts',
  title: 'Team Contact Directory',
  type: 'document',
  fields: [
    defineField({
      name: 'contacts',
      title: 'Contacts',
      type: 'array',
      description:
        'Email and phone for each team member, shown behind the "Email me" / "Call me" buttons on their Contact Us card. Kept here instead of on the Team Member document so they can\'t be scraped from Sanity\'s public API.',
      of: [
        defineArrayMember({
          name: 'teamContact',
          title: 'Contact',
          type: 'object',
          fields: [
            defineField({
              name: 'person',
              title: 'Team Member',
              type: 'reference',
              to: [{ type: 'author' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'email',
              title: 'Email',
              type: 'string',
              validation: (rule) => rule.email(),
            }),
            defineField({
              name: 'phone',
              title: 'Phone',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'person.name', email: 'email', phone: 'phone', media: 'person.photo' },
            prepare({ title, email, phone, media }) {
              return {
                title: title ?? 'Choose a team member',
                subtitle: [email, phone].filter(Boolean).join(' · ') || 'No email or phone yet',
                media,
              }
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((contacts?: { person?: { _ref?: string } }[]) => {
          const refs = (contacts ?? []).map((c) => c.person?._ref).filter(Boolean)
          return new Set(refs).size === refs.length
            ? true
            : 'Each team member should only be listed once.'
        }),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Team Contact Directory' }
    },
  },
})
