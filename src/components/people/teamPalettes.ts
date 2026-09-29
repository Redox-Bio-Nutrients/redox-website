// src/components/people/teamPalettes.ts
//
// WHY: Each team group on Contact Us (HQ + one per Region) gets its own
// textured-gradient color on its EmployeeCard panels, so the groups read
// as distinct sections. Keyed by the group's slug ('hq' or the region's
// slug); a region added later with no entry here falls back to the
// extras in order. Every color is dark enough for the panel's white
// text; `accent` feeds the texture's complement bloom (see
// buildTextureVars in src/lib/texture.ts).

export interface TeamPalette {
  color: string
  accent: string
}

export const TEAM_PALETTES: Record<string, TeamPalette> = {
  hq: { color: '#2E6B3E', accent: '#6B3FA0' }, // brand green → Redox purple
  midwest: { color: '#1F5F63', accent: '#7FAF2E' }, // deep teal, lime bloom
  turf: { color: '#4A3A8C', accent: '#3A7D50' }, // indigo, green bloom
  west: { color: '#7A3E22', accent: '#C08A2E' }, // canyon rust, gold bloom
}

const FALLBACK_PALETTES: TeamPalette[] = [
  { color: '#2F4E6E', accent: '#7FAF2E' }, // slate blue
  { color: '#4E5B23', accent: '#C08A2E' }, // olive
  { color: '#5A2F4F', accent: '#3A7D50' }, // plum
]

export function teamPalette(groupKey: string, fallbackIndex = 0): TeamPalette {
  return TEAM_PALETTES[groupKey] ?? FALLBACK_PALETTES[fallbackIndex % FALLBACK_PALETTES.length]
}
