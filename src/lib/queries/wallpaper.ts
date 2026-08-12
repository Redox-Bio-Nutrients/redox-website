// src/lib/queries/wallpaper.ts
//
// Baked in at build time (unlike settings.ts, which is read live) —
// fetched once from BaseLayout.astro so it's available on every page.

import { sanityFetch } from '../sanity'
import type { SiteWallpaper } from '../types/sanity'
import { IMAGE_FRAGMENT } from './fragments'

export async function getSiteWallpaper(): Promise<SiteWallpaper | null> {
  return sanityFetch(
    /* groq */ `*[_type == "siteWallpaper"][0]{
      "lightImage": lightImage ${IMAGE_FRAGMENT},
      "darkImage": darkImage ${IMAGE_FRAGMENT},
      opacity
    }`,
  )
}
