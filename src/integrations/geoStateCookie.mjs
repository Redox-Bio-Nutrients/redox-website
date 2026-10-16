// src/integrations/geoStateCookie.mjs
//
// WHY: Regional imagery (region.ts → Location Imagery, opted into per
// product — see src/lib/regionalPool.ts) needs the visitor's US state
// *before* the product hero paints, but pages are prerendered static
// files — the same HTML for everyone. Vercel attaches IP geolocation
// to every request as headers (x-vercel-ip-country /
// x-vercel-ip-country-region), so a tiny edge function in front of
// every page copies the state into a cookie the image pickers read
// synchronously. Every page, not just /products/*: product cards and
// the Featured Product card also appear on catalogs, blog posts,
// Technology pages and the homepage. Pages stay static and CDN-cached.
//
// Why not Astro middleware with the adapter's `middlewareMode: 'edge'`:
// @astrojs/vercel only routes non-prerendered pages through it, and
// its next() forwards to the SSR function — static pages would
// never hit it. So this writes a Build Output API middleware
// directly (a route with `middlewarePath` + `continue`, ahead of the
// filesystem handler), which Vercel runs before serving static files.
//
// Privacy: only US visitors get the cookie, and it holds only the
// two-letter state code. Anyone else gets any old one cleared (e.g.
// someone who visited from Iowa and is now abroad).

import { mkdir, readFile, writeFile } from 'node:fs/promises'

const FUNCTION_NAME = '_geo-state'
export const GEO_COOKIE = 'rdx_geo_state'
// Page routes only: no file extension (skips robots.txt, sitemaps,
// images, fonts) and not Astro's asset/image/API/island routes.
const MATCH = '^/(?!_astro/|_image|_server-islands/|api/)[^.]*$'

const EDGE_SOURCE = `export default function middleware(request) {
  const country = request.headers.get('x-vercel-ip-country')
  const region = request.headers.get('x-vercel-ip-country-region') || ''
  const headers = new Headers({ 'x-middleware-next': '1' })
  if (country === 'US' && /^[A-Z]{2}$/.test(region)) {
    headers.append('set-cookie', '${GEO_COOKIE}=' + region + '; Path=/; Max-Age=86400; SameSite=Lax; Secure')
  } else if ((request.headers.get('cookie') || '').includes('${GEO_COOKIE}=')) {
    headers.append('set-cookie', '${GEO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure')
  }
  return new Response(null, { headers })
}
`

// Wraps the Vercel adapter rather than being its own integration:
// integration hooks run in list order and the adapter writes
// config.json in its own astro:build:done, so a separate integration
// ran first and found nothing. Chaining onto the adapter's hook
// guarantees the order.
export default function withGeoStateCookie(adapter) {
  let root
  const adapterConfigDone = adapter.hooks['astro:config:done']
  adapter.hooks['astro:config:done'] = async (params) => {
    root = params.config.root
    await adapterConfigDone?.(params)
  }
  const adapterDone = adapter.hooks['astro:build:done']
  adapter.hooks['astro:build:done'] = async (params) => {
    await adapterDone?.(params)
    await wireMiddleware(root, params.logger)
  }
  return adapter
}

async function wireMiddleware(root, logger) {
  // Same location the adapter writes to (`.vercel/output` under root).
  const output = new URL('./.vercel/output/', root)
  const configUrl = new URL('config.json', output)
  let config
  try {
    config = JSON.parse(await readFile(configUrl, 'utf8'))
  } catch {
    // Fail loudly so a silent no-op can't ship.
    throw new Error('[geo-state-cookie] .vercel/output/config.json not found after the Vercel adapter ran')
  }
  const fnDir = new URL(`functions/${FUNCTION_NAME}.func/`, output)
  await mkdir(fnDir, { recursive: true })
  await writeFile(new URL('index.js', fnDir), EDGE_SOURCE)
  await writeFile(
    new URL('.vc-config.json', fnDir),
    JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2),
  )
  config.routes = config.routes.filter((r) => r.middlewarePath !== FUNCTION_NAME)
  config.routes.unshift({
    src: MATCH,
    middlewarePath: FUNCTION_NAME,
    middlewareRawSrc: [MATCH],
    continue: true,
  })
  await writeFile(configUrl, JSON.stringify(config, null, 2))
  logger.info(`geo-state-cookie: edge middleware ${FUNCTION_NAME} wired for ${MATCH}`)
}
