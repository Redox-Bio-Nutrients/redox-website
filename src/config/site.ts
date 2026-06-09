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
export const primaryNav = [
  { label: 'Agriculture', href: '/agriculture' },
  { label: 'Turf',        href: '/turf'        },
  { label: 'Technologies',href: '/technologies' },
  { label: 'Regions',     href: '/regions'      },
  { label: 'University',  href: '/university'   },
  { label: 'Blog',        href: '/blog'         },
  { label: 'Podcast',     href: '/podcast'      },
  { label: 'Contact',     href: '/contact'      },
]

// Utility navigation (header right-side)
export const utilityNav = {
  dashboard: {
    label: 'Dashboard',
    href: 'https://dashboard.redoxgrows.com',
    external: true,
  },
  universityLogin: {
    label: 'University Login',
    href: '/university/login',
    external: false,
  },
}

// External service URLs
// Update these when services change — no other files need touching.
export const externalLinks = {
  fundamentalsOfAgronomy: 'https://example.com/fundamentals', // OQ: confirm URL
  buzzsproutFeed: `https://www.buzzsprout.com/${import.meta.env.PUBLIC_BUZZSPROUT_PODCAST_ID ?? ''}`,
}