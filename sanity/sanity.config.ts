// sanity/sanity.config.ts
//
// WHY: The dataset is read from an environment variable
// (SANITY_STUDIO_DATASET) so Studio can point at another dataset if one
// is ever added. The project has a single `production` dataset, so that's
// the default — the old `staging` dataset is retired.

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

const SINGLETON_TYPES = [
  'homepage',
  'podcastPage',
  'technicalPodcastPage',
  'siteWallpaper',
  'backgroundPool',
  'teamContacts',
  'formSettings',
]

export default defineConfig({
  name: 'default',
  title: 'Redox Bio-Nutrients',

  projectId: 'zym8k10b',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [
    structureTool({ structure }),
    // visionTool is a GROQ query explorer — useful in development,
    // can be removed for production Studio deployments if desired
    visionTool(),
  ],

  // WHY: Singletons live at fixed IDs set in structure.ts, and the site
  // reads them by those IDs. Creating one from the global "+" menu would
  // make a second copy at a random ID: the site would ignore it, and for
  // the private ones that ID would be publicly readable.
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !SINGLETON_TYPES.includes(item.templateId))
        : prev,
  },

  schema: {
    types: schemaTypes,
    // WHY: Parameterized template so the market-filtered product views
    // in structure.ts can pre-check the matching market on new
    // products — the views look like folders, so creating "inside"
    // one should behave like one.
    templates: (prev) => [
      ...prev,
      {
        id: 'product-by-market',
        title: 'Product (with market)',
        schemaType: 'product',
        parameters: [{ name: 'market', title: 'Market', type: 'string' }],
        value: (params: { market: string }) => ({
          markets: [params.market],
        }),
      },
    ],
  },
})