// sanity/sanity.config.ts
//
// WHY: The dataset is read from an environment variable so the same
// Studio config works against both the production and staging datasets.
// Locally, SANITY_STUDIO_DATASET defaults to 'staging' so developers
// never accidentally edit production content from their machine.

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { BulkDelete } from 'sanity-plugin-bulk-delete'
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
    // Adds a "Bulk Delete" tool to Studio's nav — multi-select
    // documents of one type, with a confirm step and reference-safety
    // checks (Curtis's ask, 2026-09-14: no native multi-select in the
    // stock document list). Its published peer range only declares
    // `sanity: ^3.76.0 || ^4.0.0` — installed with --legacy-peer-deps
    // since we're on v5. Source-reviewed (no obfuscation, its only
    // "fetch" calls are the Sanity client's own .fetch(query) for GROQ,
    // admin-role gated, explicit "cannot be undone" confirm dialog) but
    // NOT yet runtime-verified against v5 — confirm it actually renders
    // in `sanity dev` before relying on it for the real deletion.
    BulkDelete({ schemaTypes }),
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