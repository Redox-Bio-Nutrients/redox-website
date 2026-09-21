// sanity/schemas/objects/homeSections.ts
//
// WHY: The homepage is a reorderable array of modular sections, same
// pattern as product pages. Editors compose it from one big hero plus
// any number of 1-3 column sections. Column sections can opt into a
// full-viewport-width background (color or image) while their content
// stays constrained to the site's standard content width — the two
// concerns (background bleed vs. content width) are separate fields
// so editors can't accidentally break the layout grid.

import { defineField, defineType } from 'sanity'

// Shared by the single Hero and each slide of the Hero Carousel — same
// content shape either way (heading/subheading/media/CTA), so a slide
// is just "a hero" repeated. Factored out to avoid maintaining two
// copies of these field definitions.
function heroContentFields() {
  return [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
      description:
        'Full-bleed image. Falls back to a brand-green gradient when empty. Also used as the video poster frame if a Background Video is set.',
    }),
    defineField({
      name: 'backgroundVideo',
      title: 'Background Video',
      type: 'file',
      options: { accept: 'video/*' },
      description:
        'Optional — takes priority over Background Image when set. Use a short, looped, silent-friendly clip (mp4).',
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'cta',
    }),
  ]
}

// ── Hero — big image-led header, same visual language as product pages ──

export const homeHeroSection = defineType({
  name: 'homeHeroSection',
  title: 'Hero',
  type: 'object',
  // Extra fields beyond the shared hero content (heading/subheading/
  // media/cta) — scoped to the single Hero, not the Carousel's slides,
  // where a per-slide random pool or alignment override would be an
  // odd fit for a curated sequence.
  fields: [
    ...heroContentFields(),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 2,
      description:
        'Optional standalone statement shown under the subheading, in the same italic serif treatment as a blockContent Pull Quote — e.g. "Plants don’t just need nutrients — they need to actually use them." Leave blank for no quote.',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote Attribution',
      type: 'string',
      description: 'Optional — e.g. a name, or leave blank for an unattributed statement.',
      hidden: ({ parent }) => !parent?.quote,
    }),
    defineField({
      name: 'textAlign',
      title: 'Text Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'useBackgroundPool',
      title: 'Use Background Pool',
      type: 'boolean',
      initialValue: false,
      description:
        'Draws a random image from the shared background-imagery library instead of Background Image above (same pool products/blog posts fall back to) — re-rolls on every page load, no image to pick here.',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || 'Hero', subtitle: 'Hero' }
    },
  },
})

// ── Hero Carousel — same visual treatment, cycles through slides ────

export const homeHeroCarouselSection = defineType({
  name: 'homeHeroCarouselSection',
  title: 'Hero Carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroSlide',
          title: 'Slide',
          fields: heroContentFields(),
          preview: {
            select: { title: 'heading', media: 'backgroundImage' },
          },
        },
      ],
      description: 'Use the single Hero instead if you only need one slide.',
      validation: (rule) => rule.required().min(2).max(6),
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'interval',
      title: 'Autoplay Interval (seconds)',
      type: 'number',
      initialValue: 6,
      hidden: ({ parent }) => !parent?.autoplay,
      validation: (rule) => rule.min(3).max(30),
    }),
  ],
  preview: {
    select: { slides: 'slides' },
    prepare({ slides }) {
      const count = slides?.length ?? 0
      return {
        title: 'Hero Carousel',
        subtitle: `${count} slide${count === 1 ? '' : 's'}`,
      }
    },
  },
})

// ── 1-3 column section ──────────────────────────────────────────────

export const homeColumnSection = defineType({
  name: 'homeColumnSection',
  title: 'Columns Section',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional small label shown above the heading, e.g. "THE TECHNOLOGY BEHIND EVERY REDOX SOLUTION".',
    }),
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading shown above the columns.',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid (centered, equal columns)', value: 'grid' },
          { title: 'Split (image full-bleed, content beside it)', value: 'split' },
          { title: 'Overlap (floating card over the previous section)', value: 'overlap' },
          { title: 'Duo (two full-bleed image panels, side by side)', value: 'duo' },
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
      description:
        'Split ignores Column Count and uses only the first Column entry below: its Image renders full-height/full-bleed to one viewport edge (set which side with Image Position), and its Heading/Body/CTA render in the other column (alongside the Eyebrow/Section Heading above) at the page’s normal margin. Overlap ignores Column Count and any Image on the first Column entry — a text-only white card (Heading/Body/CTA) pulled up to overlap the bottom-right of whatever section comes directly before it (designed for right after a full-bleed image Hero). Duo ignores Column Count and uses only the first two Column entries: each one becomes its own full-bleed photo panel (one bleeding to the left viewport edge, one to the right, meeting in the middle) with its own Heading/Body/CTA overlaid on the photo — the Eyebrow/Section Heading above still renders as a shared intro over both panels. Needs an Image on both of the first two Column entries.',
    }),
    defineField({
      name: 'imagePosition',
      title: 'Image Position',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'left',
      hidden: ({ parent }) => parent?.layout !== 'split',
      description: 'Split layout only. Which viewport edge the full-bleed image sits against; content fills the other side.',
    }),
    defineField({
      name: 'columns',
      title: 'Column Count',
      type: 'number',
      options: {
        list: [
          { title: '1 column', value: 1 },
          { title: '2 columns', value: 2 },
          { title: '3 columns', value: 3 },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 3,
      hidden: ({ parent }) => ['split', 'overlap', 'duo'].includes(parent?.layout),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Columns',
      type: 'array',
      description: 'One entry per column — keep this in sync with Column Count.',
      of: [
        {
          type: 'object',
          name: 'columnItem',
          title: 'Column',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'blockContent',
            }),
            defineField({
              name: 'cta',
              title: 'Call to Action',
              type: 'cta',
            }),
          ],
          preview: {
            select: { title: 'heading', media: 'image' },
            prepare({ title, media }) {
              return { title: title || 'Column', media }
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).max(3),
    }),
    defineField({
      name: 'backgroundType',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'None (page background)', value: 'none' },
          { title: 'Color', value: 'color' },
          { title: 'Image', value: 'image' },
          { title: 'Pool (randomized brand imagery)', value: 'pool' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
      description:
        'Color/Image/Pool backgrounds span the full viewport width; the columns inside still align to the standard content width. Pool draws a random image from the shared background-imagery library (same pool products/blog posts fall back to) — re-rolls on every page load, no image to pick here.',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex color, e.g. #2E6B3E',
      hidden: ({ parent }) => parent?.backgroundType !== 'color',
      validation: (rule) =>
        rule.custom((val, ctx) => {
          const parent = ctx.parent as { backgroundType?: string } | undefined
          if (parent?.backgroundType === 'color' && !val) return 'Required when background is Color'
          if (val && !/^#([0-9a-fA-F]{6})$/.test(val as string)) {
            return 'Must be a 6-digit hex color like #2E6B3E'
          }
          return true
        }),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.backgroundType !== 'image',
    }),
  ],
  preview: {
    select: { title: 'heading', columns: 'columns', items: 'items' },
    prepare({ title, columns, items }) {
      const count = items?.length ?? 0
      return {
        title: title || 'Columns Section',
        subtitle: `${columns ?? 1} col — ${count} item${count === 1 ? '' : 's'}`,
      }
    },
  },
})

// ── Stats/features grid — a heading+body pair per item, no image or
// link needed (unlike homeColumnSection's items) ──────────────────
//
// WHY its own type rather than reusing homeColumnSection: that type
// caps at 3 columns (validation min(1).max(3)) and its items carry an
// image/cta most stat-grid uses don't need. bulletSection was the
// other candidate — its items are a flat array of plain strings, no
// room for a bold heading + separate description per item, which is
// exactly the shape a "More Than 30 Years of Innovation / Developing
// plant-performance solutions since 1994." pairing needs.

export const homeStatsSection = defineType({
  name: 'homeStatsSection',
  title: 'Stats / Features Grid',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Intro Text',
      type: 'text',
      rows: 3,
      description: 'Optional short paragraph shown under the heading, above the grid.',
    }),
    defineField({
      name: 'items',
      title: 'Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'statItem',
          title: 'Stat',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (rule: any) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'body' },
          },
        },
      ],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare({ title, items }) {
      const count = items?.length ?? 0
      return { title: title || 'Stats / Features Grid', subtitle: `${count} stat${count === 1 ? '' : 's'}` }
    },
  },
})

// ── Final CTA banner — heading + body + up to 4 buttons ───────────
//
// WHY its own type: every other section caps at one cta. A closing
// "here are the 3 ways to take the next step" banner (Find a Rep /
// Contact Redox / About Us, say) needs several buttons side by side,
// not one.

export const homeCtaSection = defineType({
  name: 'homeCtaSection',
  title: 'CTA Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [{ type: 'cta' }],
      validation: (rule) => rule.required().min(1).max(4),
    }),
  ],
  preview: {
    select: { title: 'heading', buttons: 'buttons' },
    prepare({ title, buttons }) {
      const count = buttons?.length ?? 0
      return { title: title || 'CTA Banner', subtitle: `${count} button${count === 1 ? '' : 's'}` }
    },
  },
})

// ── Featured Product — a single product, by reference ──────────────
//
// WHY a reference instead of copied-in fields: the homepage's earlier
// RDX-Flex spot duplicated the product's name/tagline/CTA as manually-
// typed fields, which could (and did) drift out of sync with the
// product's own page. This section has nothing to keep in sync —
// name, tagline, image, and brand color all come live from whichever
// product is selected; editing the product itself is the only way to
// change any of that. The section only decides *which* product to
// feature and supplies the one thing the product doesn't have an
// opinion on (the eyebrow label).

// A standalone `homePullQuoteSection` briefly existed here (2026-09-21)
// to move a quote off the Contact Us page onto the Homepage, directly
// under the Hero as its own section. Removed same day per Curtis's
// direct follow-up — he wanted the quote living *inside* the Hero,
// under its subheading, not as a separate section — see
// `homeHeroSection`'s own `quote`/`quoteAttribution` fields above.

export const homeFeaturedProductSection = defineType({
  name: 'homeFeaturedProductSection',
  title: 'Featured Product',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Featured Product',
      description: 'Small label shown above the product name.',
    }),
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'product' }],
      validation: (rule) => rule.required(),
      description:
        'Its name, tagline, image, and brand color come from this product automatically. To change any of those, edit the product itself — this just picks which one to feature and links to its page.',
    }),
  ],
  preview: {
    select: { title: 'product.title', subtitle: 'eyebrow', media: 'product.image' },
    prepare({ title, subtitle, media }) {
      return { title: title || 'Featured Product', subtitle: subtitle || 'Featured Product', media }
    },
  },
})

// ── Blog Showcase — the N most recent posts, live ───────────────────
//
// WHY a reference/query section rather than manually-picked posts (the
// way homeColumnSection's items are hand-authored): the whole point of
// a "See Redox at Work" homepage spot is that it never goes stale —
// same "nothing to keep in sync" reasoning as homeFeaturedProductSection
// above. An editor sets the heading/intro copy and how many posts to
// show; which posts those are is always whatever's most recently
// published, resolved live by HOME_SECTIONS_FRAGMENT's "posts" select
// branch (src/lib/queries/fragments.ts) — nothing here stores a post
// list to drift out of date.
export const homeBlogShowcaseSection = defineType({
  name: 'homeBlogShowcaseSection',
  title: 'Blog Showcase (recent posts)',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional small label shown above the heading.',
    }),
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Intro Text',
      type: 'text',
      rows: 3,
      description: 'Optional short paragraph shown under the heading, above the posts.',
    }),
    defineField({
      name: 'postCount',
      title: 'Number of Posts',
      type: 'number',
      options: {
        list: [
          { title: '2 posts', value: 2 },
          { title: '3 posts', value: 3 },
          { title: '4 posts', value: 4 },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'cta',
      description: 'Optional — e.g. "View All Posts" linking to /blog.',
    }),
  ],
  preview: {
    select: { title: 'heading', postCount: 'postCount' },
    prepare({ title, postCount }) {
      return { title: title || 'Blog Showcase', subtitle: `${postCount ?? 3} most recent post${postCount === 1 ? '' : 's'}` }
    },
  },
})
