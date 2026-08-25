// src/pages/api/preview-exit.ts
//
// Clears the preview cookie set by src/pages/api/preview.ts. Linked
// from the preview banner (src/components/preview/PreviewBanner.astro).

import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('sanity-preview', { path: '/' })
  return redirect('/')
}
