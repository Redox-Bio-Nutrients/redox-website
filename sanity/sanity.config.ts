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

export default defineConfig({
  name: 'default',
  title: 'Redox Bio-Nutrients',

  projectId: 'zym8k10b',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'staging',

  plugins: [
    structureTool(),
    // visionTool is a GROQ query explorer — useful in development,
    // can be removed for production Studio deployments if desired
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})