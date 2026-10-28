// src/lib/benefitIconLabel.ts
//
// Human label for a benefit icon's stored name ("stress-resilience" →
// "Stress Resilience"). Plain TS with no Vite features, so both the
// site registry (src/lib/benefitIcons.ts) and the Studio's
// (sanity/lib/benefitIcons.ts) can share it — the Studio's schema is
// also loaded by `sanity deploy`'s Node schema extractor, which can't
// resolve Vite-only imports.

// Filenames are kebab-case benefit names; these are the few where plain
// title-casing reads wrong.
const LABEL_OVERRIDES: Record<string, string> = {
  ph: 'pH',
}

export function benefitIconLabel(name: string): string {
  return (
    LABEL_OVERRIDES[name] ??
    name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}
