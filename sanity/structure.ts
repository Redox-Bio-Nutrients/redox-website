// sanity/structure.ts
//
// WHY: The default desk is a flat alphabetical list of every document
// type, which buries the relationships between content. This groups
// the sidebar by site section so editors navigate the Studio the same
// way visitors navigate the site. Products get market-filtered views
// since "Agriculture products" and "Turf products" are how the team
// thinks about the catalog.

import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
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
            ]),
        ),

      S.listItem()
        .title('Regions & Reps')
        .child(
          S.list()
            .title('Regions & Reps')
            .items([
              S.documentTypeListItem('region').title('Regions'),
              S.documentTypeListItem('rep').title('Sales Reps'),
            ]),
        ),

      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('blogPost').title('Posts'),
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('author').title('Authors'),
            ]),
        ),

      S.documentTypeListItem('podcastEpisode').title('Podcast'),

      S.documentTypeListItem('universityResource').title('University'),

      S.divider(),

      S.documentTypeListItem('page').title('Pages'),

      // Site-level singleton — one shared document, no list
      S.listItem()
        .title('Background Imagery')
        .child(
          S.document()
            .schemaType('backgroundPool')
            .documentId('backgroundPool')
            .title('Background Imagery'),
        ),
    ])
