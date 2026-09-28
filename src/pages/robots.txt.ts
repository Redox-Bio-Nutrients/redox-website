// src/pages/robots.txt.ts
//
// Generated (not a static public/robots.txt) so the Sitemap line always
// uses the same absolute site URL as canonical tags and the sitemap
// itself (astro.config.mjs `site`, from PUBLIC_SITE_URL).
//
// /api/ and /preview/ are server-only routes (form handlers, draft
// previews behind a cookie) — nothing there is meant to be crawled.

import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).href
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /preview/', '', `Sitemap: ${sitemapUrl}`, ''].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
