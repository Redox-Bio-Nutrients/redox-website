# Toast

The confirmation that every successful change raises, bottom right.

Static rendition hand-written from apps/web/src/components/Toaster.tsx and src/lib/toast.ts.

- `menu-panel` look at `layer-toast`; a round `color-signal` ✓ (ink edge) or a `color-danger` ! for errors; a ✕ to dismiss. Read out by screen readers.
- Stays 4s (errors 8s), pauses on hover or focus; rises 8px in 160ms, still under reduced motion.
- Messages are short and specific: "Saved", "Deleted", "Submitted for approval". Errors belong inline where they happened; a toast error only where there's nowhere else.
