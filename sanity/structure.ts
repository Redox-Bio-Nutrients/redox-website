// sanity/structure.ts
//
// WHY: The default desk is a flat alphabetical list of every document
// type, which buries the relationships between content. This groups
// the sidebar by site section so editors navigate the Studio the same
// way visitors navigate the site. Products get market-filtered views
// since "Agriculture products" and "Turf products" are how the team
// thinks about the catalog.

import type { StructureResolver } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      // Site-level singleton — one shared document, pinned at the top
      S.listItem()
        .title('Homepage')
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
            .title('Homepage'),
        ),

      // Two more page-builder singletons, same pattern as Homepage.
      // Titled "... Page" to stay distinct from the unrelated (unused)
      // "Podcast" entry below, which is the dormant podcastEpisode list.
      S.listItem()
        .title('Podcast Page')
        .child(
          S.document()
            .schemaType('podcastPage')
            .documentId('podcastPage')
            .title('Podcast Page'),
        ),

      S.listItem()
        .title('Technical Podcast Page')
        .child(
          S.document()
            .schemaType('technicalPodcastPage')
            .documentId('technicalPodcastPage')
            .title('Technical Podcast Page'),
        ),

      S.divider(),

      S.listItem()
        .title('Catalog')
        .child(
          S.list()
            .title('Catalog')
            .items([
              S.listItem()
                .title('All Products')
                .schemaType('product')
                .child(S.documentTypeList('product').title('All Products')),
              S.listItem()
                .title('Agriculture Products')
                .schemaType('product')
                .child(
                  S.documentTypeList('product')
                    .title('Agriculture Products')
                    .filter('_type == "product" && "agriculture" in markets')
                    .initialValueTemplates([
                      S.initialValueTemplateItem('product-by-market', { market: 'agriculture' }),
                    ]),
                ),
              S.listItem()
                .title('Turf Products')
                .schemaType('product')
                .child(
                  S.documentTypeList('product')
                    .title('Turf Products')
                    .filter('_type == "product" && "turf" in markets')
                    .initialValueTemplates([
                      S.initialValueTemplateItem('product-by-market', { market: 'turf' }),
                    ]),
                ),
              S.divider(),
              S.documentTypeListItem('technology').title('Technologies'),
              // Shared comparison blocks (e.g. RDX Nitrogen System) shown
              // on each member product's page via productSystemSection.
              S.documentTypeListItem('productSystem').title('Product Systems'),
            ]),
        ),

      // Shared pool — same quote can be tagged for Agriculture, Turf,
      // or both (testimonial.ts's `markets` field). Not nested under
      // Catalog: it's not product content, and it's meant to be
      // reused across whichever pages want a testimonials section
      // (Turf's landing page first, Homepage next).
      // Drag-and-drop list (@sanity/orderable-document-list) — the order
      // editors set here is the order testimonials show on the site
      // (sorted by testimonial.orderRank).
      orderableDocumentListDeskItem({ type: 'testimonial', title: 'Testimonials', S, context }),

      // One canonical screen for every person at Redox — a Team
      // Member (author.ts) can be flagged as a blog author, a
      // regional agronomist, office staff on /about-us, any
      // combination, or none yet. Previously duplicated as a "Team
      // Members" shortcut under both Regions and Blog below; 2026-09
      // consolidated to just this one place once office staff made it
      // a third audience for the same list — editors manage everyone
      // here regardless of which page(s) they end up on.
      S.documentTypeListItem('author').title('People'),

      S.documentTypeListItem('region').title('Regions'),

      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('blogPost').title('Posts'),
              S.documentTypeListItem('category').title('Categories'),
            ]),
        ),

      S.documentTypeListItem('podcastEpisode').title('Podcast'),

      S.documentTypeListItem('universityResource').title('University'),

      S.divider(),

      S.documentTypeListItem('page').title('Pages'),

      // Two market-specific singletons sharing one document type — see
      // sanity/schemas/documents/backgroundPool.ts. Split 2026-08-27
      // from a single shared pool now that Ag and Turf need separate
      // image libraries.
      S.listItem()
        .title('Ag Background Imagery')
        .child(
          S.document()
            .schemaType('backgroundPool')
            .documentId('agBackgroundPool')
            .title('Ag Background Imagery'),
        ),

      S.listItem()
        .title('Turf Background Imagery')
        .child(
          S.document()
            .schemaType('backgroundPool')
            .documentId('turfBackgroundPool')
            .title('Turf Background Imagery'),
        ),

      // Private singletons — the dotted IDs keep them out of Sanity's
      // public API (see teamContacts.ts). Both IDs are load-bearing: the
      // site queries these exact IDs.
      S.listItem()
        .title('Team Contact Directory')
        .child(
          S.document()
            .schemaType('teamContacts')
            .documentId('private.teamContacts')
            .title('Team Contact Directory'),
        ),
      S.listItem()
        .title('Form Settings')
        .child(
          S.document()
            .schemaType('formSettings')
            .documentId('private.formSettings')
            .title('Form Settings'),
        ),

      // Site-level singleton — one shared document, no list
      S.listItem()
        .title('Site Wallpaper')
        .child(
          S.document()
            .schemaType('siteWallpaper')
            .documentId('siteWallpaper')
            .title('Site Wallpaper'),
        ),
    ])
