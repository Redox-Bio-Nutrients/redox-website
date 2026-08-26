// src/pages/api/preview.ts
//
// Entry point for "preview as a visitor" — see src/pages/preview/ for
// the actual draft-rendering routes. Checks a shared secret
// (SANITY_PREVIEW_SECRET — set it in Sanity Studio's "Open Preview"
// link, or just visit this URL by hand while building a page), then
// sets an httpOnly cookie and redirects into the matching /preview/
// route. The cookie — not the secret — is what actually gates access
// to /preview/*, so once you're in you can click between draft pages
// without re-entering it; see src/pages/api/preview-exit.ts to clear
// it again.
//
// Products and blog posts are wired up (products: brochure-PDF
// drafting; blog: the WordPress migration). Extending to pages later
// means adding their own `type` branch here plus a matching
// src/pages/preview/<type>/[slug].astro, following the same pattern.

import type { APIRoute } from 'astro'

export const prerender = false

const PREVIEW_COOKIE = 'sanity-preview'

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const secret = url.searchParams.get('secret')
  const type = url.searchParams.get('type')
  const slug = url.searchParams.get('slug')

  if (!secret || secret !== import.meta.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid or missing preview secret.', { status: 401 })
  }
  if (!slug) {
    return new Response('Missing "slug" query param.', { status: 400 })
  }

  const routesByType: Record<string, string> = {
    product: `/preview/products/${slug}`,
    blogPost: `/preview/blog/${slug}`,
  }
  const target = routesByType[type ?? 'product']
  if (!target) {
    return new Response(
      `Unknown preview type "${type}". Supported: ${Object.keys(routesByType).join(', ')}.`,
      { status: 400 },
    )
  }

  cookies.set(PREVIEW_COOKIE, '1', {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  })

  return redirect(target)
}
