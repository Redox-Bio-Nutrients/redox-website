// astro.config.mjs
//
// WHY: i18n is configured from day one even though only English is live
// at launch. Adding a new locale later requires only adding to the
// locales array and creating the corresponding page tree and translation
// file — no structural refactoring.

import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

// ── Sitemap exclusions ──────────────────────────────────────────────
// @astrojs/sitemap already skips server-rendered routes (/api/*,
// /preview/*). On top of that, leave out every page that renders
// <meta name="robots" content="noindex"> — listing a page in the
// sitemap while telling crawlers not to index it just produces Search
// Console warnings. Two sources:
//   1. Hard-coded noindex pages (seo={{ noIndex: true }} in the .astro file).
//   2. Any Sanity document with SEO → "No Index" ticked in Studio,
//      fetched once here at build time. A failed fetch only means those
//      pages stay listed (the page's own noindex tag still applies) —
//      it never fails the build.
const STATIC_NOINDEX_PATHS = [
  '/do-not-sell-my-info/',
  '/account-management/',
  // Not noindex, but vercel.json redirects it to /technologies/ram-technology
  // — a sitemap should only list final URLs, never ones that redirect.
  '/technologies/',
]
const PATH_PREFIX_BY_TYPE = {
  page: '/',
  product: '/products/',
  blogPost: '/blog/',
  technology: '/technologies/',
}

async function getSanityNoIndexPaths() {
  const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '')
  const projectId = env.PUBLIC_SANITY_PROJECT_ID
  const dataset = env.PUBLIC_SANITY_DATASET ?? 'production'
  const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2024-01-01'
  if (!projectId) return []
  const query = `*[seo.noIndex == true && defined(slug.current) && !(_id in path("drafts.**"))]{_type, "slug": slug.current}`
  try {
    const res = await fetch(
      `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`,
    )
    const { result } = await res.json()
    return (result ?? [])
      .filter((doc) => PATH_PREFIX_BY_TYPE[doc._type])
      .map((doc) => `${PATH_PREFIX_BY_TYPE[doc._type]}${doc.slug}/`)
  } catch {
    return []
  }
}

const noIndexPaths = new Set([...STATIC_NOINDEX_PATHS, ...(await getSanityNoIndexPaths())])

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://redoxgrows.com',

  // Adapter for the one server-rendered route (the resource-request
  // email API, src/pages/api/resource-request.ts — see its file header
  // for why it needs a real backend). `output` stays 'static' (the
  // default) so every other page is still prerendered exactly as
  // before; only routes that opt out with `export const prerender =
  // false` run as Vercel functions.
  adapter: vercel(),

  // /sitemap-index.xml (+ /sitemap-0.xml), built from every prerendered
  // page against `site` above. Referenced from src/pages/robots.txt.ts.
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname
        // /preview/* is robots-disallowed; a param-less SSR route there
        // (turf-concept) still gets picked up by the integration.
        return !path.startsWith('/preview/') && !noIndexPaths.has(path)
      },
    }),
  ],

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