// astro.config.mjs
//
// WHY: i18n is configured from day one even though only English is live
// at launch. Adding a new locale later requires only adding to the
// locales array and creating the corresponding page tree and translation
// file — no structural refactoring.

import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://redoxgrows.com',

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