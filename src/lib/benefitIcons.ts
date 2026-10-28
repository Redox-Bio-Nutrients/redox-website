// src/lib/benefitIcons.ts
//
// WHY: The shared benefit icon set from the Redox design system
// ("Benefits" asset group — 55 line icons first drawn for the 2027
// product slides), for the site, which renders them inline
// (BenefitIcon.astro). The Studio reads the same SVG folder through
// sanity/lib/benefitIcons.ts, so its picker can never offer an icon
// the site can't draw. (That one loads lazily: `sanity deploy`'s Node
// schema extractor can't resolve this file's eager `?raw` glob.)
//
// The SVGs in src/assets/benefit-icons/ were normalized from the slide
// originals: every lime ink (#91D500 and its near-duplicates) became
// `currentColor`, so an icon takes whatever `color` it sits in — see
// KeyBenefitsSection.astro for which colour that is per ground.

import { benefitIconLabel } from './benefitIconLabel'

const files = import.meta.glob('../assets/benefit-icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const svgByName: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.split('/').pop()!.replace(/\.svg$/, ''), svg]),
)

export interface BenefitIconOption {
  /** stored value in Sanity, e.g. "stress-resilience" */
  name: string
  /** human label for the Studio picker, e.g. "Stress Resilience" */
  label: string
  svg: string
}

export const BENEFIT_ICONS: BenefitIconOption[] = Object.keys(svgByName)
  .sort()
  .map((name) => ({ name, label: benefitIconLabel(name), svg: svgByName[name] }))

export function getBenefitIconSvg(name: string | undefined): string | undefined {
  return name ? svgByName[name] : undefined
}
