// sanity/sanity.config.ts
//
// WHY: The dataset is read from an environment variable so the same
// Studio config works against both the production and staging datasets.
// Locally, SANITY_STUDIO_DATASET defaults to 'staging' so developers
// never accidentally edit production content from their machine.

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'Redox Bio-Nutrients',

  projectId: 'zym8k10b',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'staging',

  plugins: [
    structureTool({ structure }),
    // visionTool is a GROQ query explorer — useful in development,
    // can be removed for production Studio deployments if desired
    visionTool(),
  ],

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