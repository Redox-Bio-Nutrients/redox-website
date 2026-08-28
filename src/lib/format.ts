// src/lib/format.ts
//
// WHY: Small formatting helpers shared across editorial content
// (blog, podcast, university) — kept out of components so date
// formatting stays consistent everywhere it appears.

/**
 * "2026-08-06T00:00:00Z" -> "August 6, 2026"
 *
 * Pinned to UTC: Sanity's `datetime` picker stores midnight UTC for a
 * plain date choice, so formatting in the visitor's local zone can
 * roll the displayed day backward (e.g. Mountain time shows "July 31"
 * for an Aug 1 UTC timestamp). The calendar date an editor picked
 * should never depend on the reader's timezone.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Some WordPress-migrated blog post titles came through as literal
 * ALL CAPS (a WP theme's text-transform:uppercase, captured as actual
 * text during migration) while newer posts are already properly
 * cased — this only touches the former, leaving anything not
 * fully-uppercase completely alone. Naive title-case (lowercase, then
 * capitalize the start of each word) isn't linguistically perfect —
 * small words ("a", "to"), acronyms, and brand names (TurfRx → Turfrx)
 * all get capitalized/flattened the same blunt way — but it's a large
 * readability win over shouting caps in a serif display font, which is
 * the actual problem this solves. Applied everywhere a post's title
 * renders as visible heading text (BlogPostDetail's h1,
 * BlogFeatured's h2, BlogMasonryTile's h3, BlogPostNav's prev/next
 * titles) — not applied to the raw `<title>`/meta title (still exactly
 * as authored/migrated) or to alt-text fallbacks, neither of which is
 * "reading a shouting headline" the way on-page text is.
 */
export function normalizeTitleCase(title: string): string {
  if (title !== title.toUpperCase()) return title
  return title.toLowerCase().replace(/(^|[\s/-])([a-z])/g, (_, boundary, letter) => boundary + letter.toUpperCase())
}
