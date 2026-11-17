// src/pages/topo.svg.ts
//
// Serves the generated topographic contour maps (src/lib/topo.ts) as
// SVG files, so pages reference them with an <img> instead of inlining
// ~45 KB of path data per map. Rendered on demand (a map's parameters
// come from page content — product slugs, section keys, label colours —
// so they can't be enumerated at build time), then cached for a year by
// the browser and Vercel's CDN: the URL fully determines the output and
// carries TOPO_VERSION, so a changed generator gets new URLs.

import type { APIRoute } from 'astro'
import { parseTopoSvgParams, renderTopoSvg } from '../lib/topo'

export const prerender = false

export const GET: APIRoute = ({ url }) => {
  const params = parseTopoSvgParams(url.searchParams)
  if (!params) return new Response('Bad topo parameters', { status: 400 })
  return new Response(renderTopoSvg(params), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
