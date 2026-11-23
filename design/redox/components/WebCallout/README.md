# WebCallout

A product page's solid callout: a lit, textured slab in the product colour with the leaf sprig at its top-right corner.

Static rendition hand-written from redox-website/src/styles/texture-surface.css (`.texture-fill`) and the product page's Callout section.

- Leaf corner at `web-radius-3xl` (top-left and bottom-right). Background is the textured gradient: grain, a light bloom, a deep shadow, a diagonal sweep and a complementary bloom, from the product colour (here the default `web-green`, with `web-purple` as the complement). Positions are seeded per product so a page always looks the same.
- The tint variant puts a frosted `web-glass-bg` panel over a photo instead.
- The leaf sprig is permanent here; the panel keeps right padding clear of it. The callout doesn't clip, so the leaves can break its edge.
- Heading in the serif, white; body `web-lead`; a primary or on-colour button.
