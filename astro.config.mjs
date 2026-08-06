// astro.config.mjs
//
// WHY: i18n is configured from day one even though only English is live
// at launch. Adding a new locale later requires only adding to the
// locales array and creating the corresponding page tree and translation
// file — no structural refactoring.

import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://redoxgrows.com',

  // Adapter for the one server-rendered route (the resource-request
  // email API, src/pages/api/resource-request.ts — see its file header
  // for why it needs a real backend). `output` stays 'static' (the
  // default) so every other page is still prerendered exactly as
  // before; only routes that opt out with `export const prerender =
  // false` run as Vercel functions.
  adapter: vercel(),

  // i18n — English only at launch, structured for future locales
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: {
      prefixDefaultLocale: false, // /products/ not /en/products/
    },
  },

  // Image optimization
  image: {
    domains: ['cdn.sanity.io'],
  },
})