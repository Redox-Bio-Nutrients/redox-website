// sanity/lib/benefitIcons.ts
//
// WHY: The Studio's view of the shared benefit icons (the site's is
// src/lib/benefitIcons.ts), read from the same SVG folder so the picker
// can't offer an icon the site doesn't have.
//
// Lazy on purpose. `sanity deploy` (and `sanity schema …`) load the
// schema in a Node worker that refuses Vite's `?raw` imports, so an
// eager glob here broke the deploy. A lazy glob still gives the names
// synchronously (its keys) for the schema's options.list, while the SVG
// text is only fetched in the browser, by the picker and previews.

import { useEffect, useState } from 'react'
import { benefitIconLabel } from '../../src/lib/benefitIconLabel'

const loaders = import.meta.glob('../../src/assets/benefit-icons/*.svg', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const loaderByName: Record<string, () => Promise<string>> = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [path.split('/').pop()!.replace(/\.svg$/, ''), load]),
)

export const BENEFIT_ICON_OPTIONS = Object.keys(loaderByName)
  .sort()
  .map((name) => ({ name, label: benefitIconLabel(name) }))

const cache = new Map<string, Promise<string>>()

function loadSvg(name: string): Promise<string> | undefined {
  const load = loaderByName[name]
  if (!load) return undefined
  if (!cache.has(name)) cache.set(name, load())
  return cache.get(name)
}

/** The icon's SVG text once loaded, else undefined. */
export function useBenefitIconSvg(name: string | undefined): string | undefined {
  const [svg, setSvg] = useState<string>()
  useEffect(() => {
    let live = true
    setSvg(undefined)
    loadSvg(name ?? '')?.then((text) => live && setSvg(text))
    return () => {
      live = false
    }
  }, [name])
  return svg
}
