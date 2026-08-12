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
