// src/lib/benefitIcons.ts
//
// WHY: The shared benefit icon set from the Redox design system
// ("Benefits" asset group — 55 line icons first drawn for the 2027
// product slides). One registry for both sides: the site renders them
// inline (BenefitIcon.astro) and the Studio's keyBenefitsSection picker
// imports this same file (sanity/components/BenefitIconInput.tsx), so
// the dropdown can never offer an icon the site can't draw.
//
// The SVGs in src/assets/benefit-icons/ were normalized from the slide
// originals: every lime ink (#91D500 and its near-duplicates) became
// `currentColor`, so an icon takes whatever `color` it sits in — see
// KeyBenefitsSection.astro for which colour that is per ground.

const files = import.meta.glob('../assets/benefit-icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const svgByName: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.split('/').pop()!.replace(/\.svg$/, ''), svg]),
)

// Filenames are kebab-case benefit names; these are the few where plain
// title-casing reads wrong.
const LABEL_OVERRIDES: Record<string, string> = {
  ph: 'pH',
}

function labelFor(name: string): string {
  return (
    LABEL_OVERRIDES[name] ??
    name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}

export interface BenefitIconOption {
  /** stored value in Sanity, e.g. "stress-resilience" */
  name: string
  /** human label for the Studio picker, e.g. "Stress Resilience" */
  label: string
  svg: string
}

export const BENEFIT_ICONS: BenefitIconOption[] = Object.keys(svgByName)
  .sort()
  .map((name) => ({ name, label: labelFor(name), svg: svgByName[name] }))

export function getBenefitIconSvg(name: string | undefined): string | undefined {
  return name ? svgByName[name] : undefined
}
