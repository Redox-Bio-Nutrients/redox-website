// src/config/site.ts
//
// WHY THIS FILE EXISTS:
// Nav labels, utility nav links, and site-wide settings change without
// any schema or routing changes. Any team member can update a label here
// in one line with no risk of touching routing logic or component code.
// Nav labels never appear as string literals in component files —
// they always come from this file.

export const site = {
  name: 'Redox Bio-Nutrients',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://redoxgrows.com',
  defaultOgImage: '/images/og-default.jpg',
}

// Primary navigation
//
// `children` is optional on every item — any top-level item can carry
// a subnav dropdown by adding one, not just "News"/"Products" below.
// Most items with `children` have no `href` of their own (nothing to
// link to but the dropdown itself) and render as a <details>/<summary>
// trigger. "Products" is the one exception (`href` + `children`
// together, 2026-09) — it's a real link to the Agriculture catalog
// *and* a hover/tap dropdown to either catalog, so Header.astro gives
// it its own split-target markup (see `.header__nav-item--split`).
export interface PrimaryNavChild {
  label: string
  href: string
}

export interface PrimaryNavItem {
  label: string
  href?: string
  children?: PrimaryNavChild[]
  external?: boolean
}

export const primaryNav: PrimaryNavItem[] = [
  // Landing/marketing pages, not the catalogs — see /agriculture/products
  // and /turf/products (also reachable via "Products" below) for the
  // actual product grids. Split 2026-09 per Curtis's change order: each
  // landing page makes its case, then hands off to the catalog via its
  // own "Find the Right Solution" / "Products" button.
  { label: 'Agriculture',      href: '/agriculture'  },
  { label: 'Turf',             href: '/turf'         },
  {
    label: 'Products',
    href: '/agriculture/products',
    children: [
      { label: 'Agriculture Products', href: '/agriculture/products' },
      { label: 'Turf Products',        href: '/turf/products'        },
    ],
  },
  // Points straight at the one real technology page rather than the
  // /technologies index — that index shows a card grid, which today
  // is just a single RAM Technology card to click through. Skip the
  // detour until there's a second technology to actually list (see
  // vercel.json's matching redirect for anyone who still lands on
  // /technologies directly).
  { label: 'RAM Technology',   href: '/technologies/ram-technology' },
  {
    label: 'News',
    children: [
      { label: 'Blog',    href: '/blog'    },
      { label: 'Podcast', href: '/podcast' },
    ],
  },
  { label: 'About Us', href: '/about-us' },
  { label: 'Swag Store', href: 'https://stores.inksoft.com/redoxgrows/shop/home', external: true },
]

// Utility navigation (header right-side)
export const utilityNav = {
  dashboard: {
    label: 'Dashboard Login',
    href: 'https://dashboard.redoxgrows.com',
    external: true,
  },
}

// External service URLs
// Update these when services change — no other files need touching.
export const externalLinks = {
  fundamentalsOfAgronomy: 'https://example.com/fundamentals', // OQ: confirm URL
  buzzsproutFeed: `https://www.buzzsprout.com/${import.meta.env.PUBLIC_BUZZSPROUT_PODCAST_ID ?? ''}`,
}