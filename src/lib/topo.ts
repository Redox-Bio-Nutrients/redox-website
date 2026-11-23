// src/lib/topo.ts
//
// EXPLORATION (2026-11-17) — procedural topographic contour lines for
// the "technology / bio-stimulant" look from the Nov 2026 social posts
// (forest ground, faint sage contours, amber accent rings, warm glow
// behind the product). Replaces randomized crop photography as a
// background: every seed (e.g. a product slug) gives its own terrain,
// deterministic so server and browser agree and nothing reflows.
//
// Pipeline: seeded value-noise fbm → a "distance from the peak" field
// warped by that noise (gives rings around the peak that relax into
// wavy parallel lines further out, like the posts) → marching squares
// per contour level → segments chained into polylines → smoothed SVG
// path data (quadratic curves through segment midpoints).

import { hexToHsl, ensureReadableOnDark } from './color'

export interface TopoOptions {
  seed: string
  /** viewBox size; contours are generated in these units */
  width?: number
  height?: number
  /** peak position, 0–1 of width/height — where the glow/product sits */
  peakX?: number
  peakY?: number
  /** ring spacing as a fraction of height (smaller = denser) */
  spacing?: number
  /** how strongly the noise bends the rings (0 = perfect circles) */
  warp?: number
  /** every Nth level is an accent line */
  accentEvery?: number
}

export interface TopoResult {
  width: number
  height: number
  base: string
  /** one entry per accent level, each with its own stroke width */
  accent: { d: string; width: number }[]
}

// ── seeded randomness ────────────────────────────────────────────────
function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeNoise(seed: number) {
  const rand = mulberry32(seed)
  const perm = new Uint8Array(512)
  const vals = new Float32Array(256)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  for (let i = 0; i < 256; i++) vals[i] = rand() * 2 - 1
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const v = (x: number, y: number) => vals[perm[(perm[x & 255] + y) & 255]]

  const noise = (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const u = fade(x - xi)
    const w = fade(y - yi)
    return lerp(lerp(v(xi, yi), v(xi + 1, yi), u), lerp(v(xi, yi + 1), v(xi + 1, yi + 1), u), w)
  }
  return (x: number, y: number, octaves = 3) => {
    let sum = 0
    let amp = 1
    let freq = 1
    let norm = 0
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x * freq, y * freq)
      norm += amp
      amp *= 0.5
      freq *= 2
    }
    return sum / norm
  }
}

// ── marching squares ─────────────────────────────────────────────────
type Pt = [number, number]

function contourLevel(
  field: Float32Array,
  nx: number,
  ny: number,
  cell: number,
  level: number,
): Pt[][] {
  const at = (i: number, j: number) => field[j * nx + i]
  // Crossing point on an edge, identified by key, plus adjacency.
  const pts = new Map<string, Pt>()
  const adj = new Map<string, string[]>()
  const link = (a: string, b: string) => {
    ;(adj.get(a) ?? adj.set(a, []).get(a)!).push(b)
    ;(adj.get(b) ?? adj.set(b, []).get(b)!).push(a)
  }
  const edgePt = (key: string, x0: number, y0: number, v0: number, x1: number, y1: number, v1: number) => {
    if (!pts.has(key)) {
      const t = (level - v0) / (v1 - v0)
      pts.set(key, [(x0 + (x1 - x0) * t) * cell, (y0 + (y1 - y0) * t) * cell])
    }
    return key
  }

  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = at(i, j) // top-left
      const b = at(i + 1, j) // top-right
      const c = at(i + 1, j + 1) // bottom-right
      const d = at(i, j + 1) // bottom-left
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0)
      if (idx === 0 || idx === 15) continue
      const top = () => edgePt(`h${i},${j}`, i, j, a, i + 1, j, b)
      const right = () => edgePt(`v${i + 1},${j}`, i + 1, j, b, i + 1, j + 1, c)
      const bottom = () => edgePt(`h${i},${j + 1}`, i, j + 1, d, i + 1, j + 1, c)
      const left = () => edgePt(`v${i},${j}`, i, j, a, i, j + 1, d)
      const centerHigh = (a + b + c + d) / 4 > level
      switch (idx) {
        case 1: case 14: link(left(), bottom()); break
        case 2: case 13: link(bottom(), right()); break
        case 3: case 12: link(left(), right()); break
        case 4: case 11: link(top(), right()); break
        case 6: case 9: link(top(), bottom()); break
        case 7: case 8: link(left(), top()); break
        case 5:
          if (centerHigh) { link(left(), top()); link(bottom(), right()) }
          else { link(left(), bottom()); link(top(), right()) }
          break
        case 10:
          if (centerHigh) { link(left(), bottom()); link(top(), right()) }
          else { link(left(), top()); link(bottom(), right()) }
          break
      }
    }
  }

  // Chain into polylines: start from open ends first, then loops.
  const seen = new Set<string>()
  const lines: Pt[][] = []
  const walk = (start: string) => {
    const line: Pt[] = []
    let prev: string | null = null
    let cur: string | undefined = start
    while (cur && !seen.has(cur)) {
      seen.add(cur)
      line.push(pts.get(cur)!)
      const next: string | undefined = (adj.get(cur) ?? []).find((n) => n !== prev && !seen.has(n))
      prev = cur
      cur = next
    }
    // close loops
    if (line.length > 2 && (adj.get(start) ?? []).includes(prev!)) line.push(line[0])
    return line
  }
  for (const [k, n] of adj) if (n.length === 1 && !seen.has(k)) lines.push(walk(k))
  for (const k of adj.keys()) if (!seen.has(k)) lines.push(walk(k))
  return lines
}

// ── path output ──────────────────────────────────────────────────────
const r = (n: number) => Math.round(n)

function simplify(line: Pt[], minDist: number): Pt[] {
  if (line.length < 3) return line
  const out: Pt[] = [line[0]]
  for (let i = 1; i < line.length - 1; i++) {
    const [px, py] = out[out.length - 1]
    if (Math.hypot(line[i][0] - px, line[i][1] - py) >= minDist) out.push(line[i])
  }
  out.push(line[line.length - 1])
  return out
}

function toPath(line: Pt[]): string {
  if (line.length < 2) return ''
  if (line.length === 2) return `M${r(line[0][0])} ${r(line[0][1])}L${r(line[1][0])} ${r(line[1][1])}`
  let d = `M${r(line[0][0])} ${r(line[0][1])}`
  for (let i = 1; i < line.length - 1; i++) {
    const [x, y] = line[i]
    const mx = (x + line[i + 1][0]) / 2
    const my = (y + line[i + 1][1]) / 2
    d += `Q${r(x)} ${r(y)} ${r(mx)} ${r(my)}`
  }
  const last = line[line.length - 1]
  return d + `L${r(last[0])} ${r(last[1])}`
}

// ── public ───────────────────────────────────────────────────────────
export function generateTopo(opts: TopoOptions): TopoResult {
  const {
    seed,
    width = 2400,
    height = 1200,
    peakX = 0.5,
    peakY = 0.5,
    spacing = 0.05,
    warp = 0.32,
    accentEvery = 7,
  } = opts

  const h = hashString(seed)
  const n1 = makeNoise(h)
  const n2 = makeNoise(h ^ 0x9e3779b9)
  const n3 = makeNoise(h ^ 0x85ebca6b)

  const cell = 16
  const nx = Math.ceil(width / cell) + 1
  const ny = Math.ceil(height / cell) + 1
  const field = new Float32Array(nx * ny)
  const H = height
  const px = peakX * width
  const py = peakY * height
  const f = 0.75 // noise frequency, in "per height" units

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = (i * cell) / H
      const y = (j * cell) / H
      // Domain warp — bends the rings; grows with distance from the
      // peak so rings close to the product stay fairly round.
      const dx0 = (i * cell - px) / H
      const dy0 = (j * cell - py) / H
      const dist0 = Math.hypot(dx0, dy0)
      const k = warp * (0.2 + Math.min(dist0, 1.4))
      const wx = dx0 + k * n1(x * f, y * f, 2)
      const wy = dy0 + k * n2(x * f + 7.3, y * f - 3.1, 2)
      // Slight horizontal stretch so far rings read as tall wavy
      // verticals at the sides, like the posts.
      const dist = Math.hypot(wx * 0.78, wy)
      field[j * nx + i] = dist + 0.015 * n3(x * 2, y * 2, 2)
    }
  }

  let min = Infinity
  let max = -Infinity
  for (const v of field) {
    if (v < min) min = v
    if (v > max) max = v
  }

  const base: string[] = []
  const accent: { d: string; width: number }[] = []
  // Accent stroke widths vary per level (seeded) — 1.6 to 4.2px — so the
  // coloured lines read hand-drawn rather than uniform.
  const widthRand = mulberry32(h ^ 0x27d4eb2f)
  // Offset the first level per seed so the accent rings don't always
  // land at the same distance from the peak.
  const phase = (h % 1000) / 1000
  let n = 0
  for (let level = min + spacing * (0.5 + phase); level < max; level += spacing, n++) {
    const isAccent = n % accentEvery === accentEvery - 2
    let levelPath = ''
    for (const line of contourLevel(field, nx, ny, cell, level)) levelPath += toPath(simplify(line, 7))
    if (!levelPath) continue
    if (isAccent) accent.push({ d: levelPath, width: Math.round((1.6 + widthRand() * 2.6) * 10) / 10 })
    else base.push(levelPath)
  }

  return { width, height, base: base.join(''), accent }
}

// ── multi-colour "spectrum" accents (homepage) ───────────────────────

/**
 * Product label colours → an ordered palette for the homepage's
 * multi-coloured accent rings (an homage to the whole product line).
 * Drops greys/near-blacks, collapses near-duplicate hues (one per 14°
 * bucket), lifts dark ones so they read on the forest ground, and
 * sorts by hue so the rings step through the spectrum outward.
 */
export function productSpectrum(hexes: (string | null | undefined)[]): string[] {
  const seen = new Set<number>()
  const out: { hue: number; hex: string }[] = []
  for (const hex of hexes) {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) continue
    const [h, s, l] = hexToHsl(hex)
    if (s < 25 || l < 12 || l > 92) continue
    const bucket = Math.round(h / 14)
    if (seen.has(bucket)) continue
    seen.add(bucket)
    out.push({ hue: h, hex: ensureReadableOnDark(hex) })
  }
  return out.sort((a, b) => a.hue - b.hue).map((c) => c.hex)
}

// ── audio waveform (podcast heroes) ──────────────────────────────────
/**
 * A symmetric audio-waveform band as vertical bar strokes, in the same
 * viewBox as generateTopo. Seeded, so a page's waveform never changes.
 * Amplitude = noise × a bell envelope centred on `centerX`, so it swells
 * under the peak and tapers to a flat line at the edges.
 */
export function generateWaveform(opts: {
  seed: string
  width?: number
  height?: number
  y?: number
  centerX?: number
  bars?: number
  maxAmp?: number
}): string {
  const { seed, width = 2400, height = 1200, y = 0.74, centerX = 0.5, bars = 180, maxAmp = 0.11 } = opts
  const noise = makeNoise(hashString(`${seed}-wave`))
  const step = width / bars
  const cy = y * height
  let d = ''
  for (let i = 0; i <= bars; i++) {
    const x = i * step
    const t = x / width - centerX
    const envelope = Math.exp(-(t * t) / (2 * 0.17 * 0.17))
    const n = Math.abs(noise(i * 0.22, 3.7, 3)) * 1.8 + 0.08
    const amp = Math.max(2, Math.min(1, n) * envelope * maxAmp * height)
    d += `M${r(x)} ${r(cy - amp)}V${r(cy + amp)}`
  }
  return d
}

// ── served SVG files (/topo.svg) ─────────────────────────────────────
// The contour maps are ~45 KB of path data each, so pages reference
// them as cached SVG files instead of inlining them. Bump TOPO_VERSION
// whenever the generator or the SVG styling changes — it's part of
// every URL, so browsers/CDN fetch the new maps instead of a cached one.
export const TOPO_VERSION = '1'

export interface TopoSvgParams {
  seed: string
  peakX: number
  peakY: number
  spacing?: number
  warp?: number
  accentEvery?: number
  /** one colour = every accent ring; several = golden-ratio stride */
  colors: string[]
}

const BASE_STROKE = 'rgb(196 214 190 / 0.22)'

/** Neighbouring rings step ~0.38 round the palette (golden-ratio
 * stride) so adjacent rings contrast — see the homepage spectrum. */
function ringColor(colors: string[], i: number): string {
  const n = colors.length
  const stride = Math.max(1, Math.round(n * 0.382))
  return colors[(i * stride) % n]
}

// vector-effect isn't inherited, so every path carries it: line widths
// stay in screen pixels however far the map is scaled.
const NSS = 'vector-effect="non-scaling-stroke"'

export function renderTopoSvg(p: TopoSvgParams): string {
  const topo = generateTopo({
    seed: p.seed,
    peakX: p.peakX,
    peakY: p.peakY,
    spacing: p.spacing,
    warp: p.warp,
    accentEvery: p.accentEvery,
  })
  const accents = topo.accent
    .map(
      (a, i) =>
        `<path d="${a.d}" stroke="${ringColor(p.colors, i)}" stroke-width="${a.width}" ${NSS}/>`,
    )
    .join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${topo.width} ${topo.height}" ` +
    `width="${topo.width}" height="${topo.height}" preserveAspectRatio="xMidYMid slice">` +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${topo.base}" stroke="${BASE_STROKE}" stroke-width="1.3" ${NSS}/>` +
    `<g stroke-opacity="0.85">${accents}</g>` +
    `</g></svg>`
  )
}

const num = (n: number) => String(Math.round(n * 1000) / 1000)

/** URL for a served map — parameters in a fixed order so equal maps
 * share one cache entry. */
export function topoSvgUrl(p: TopoSvgParams): string {
  const q = new URLSearchParams({ v: TOPO_VERSION, s: p.seed, x: num(p.peakX), y: num(p.peakY) })
  if (p.spacing != null) q.set('sp', num(p.spacing))
  if (p.warp != null) q.set('w', num(p.warp))
  if (p.accentEvery != null) q.set('ae', String(p.accentEvery))
  q.set('c', p.colors.map((c) => c.replace('#', '').toLowerCase()).join('.'))
  return `/topo.svg?${q}`
}

/** Parse + validate /topo.svg query params; null if anything's off. */
export function parseTopoSvgParams(q: URLSearchParams): TopoSvgParams | null {
  const seed = q.get('s') ?? ''
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(seed)) return null
  const unit = (k: string, d?: number) => {
    const raw = q.get(k)
    if (raw == null) return d
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : NaN
  }
  const peakX = unit('x', 0.5)!
  const peakY = unit('y', 0.5)!
  const spacing = unit('sp')
  const warp = unit('w')
  const aeRaw = q.get('ae')
  const accentEvery = aeRaw == null ? undefined : Number(aeRaw)
  if ([peakX, peakY, spacing, warp].some((n) => Number.isNaN(n))) return null
  if (spacing != null && spacing < 0.02) return null
  if (accentEvery != null && !(Number.isInteger(accentEvery) && accentEvery >= 2 && accentEvery <= 20)) return null
  const colors = (q.get('c') ?? '').split('.').filter(Boolean)
  if (colors.length < 1 || colors.length > 24 || !colors.every((c) => /^[0-9a-f]{6}$/.test(c))) return null
  return { seed, peakX, peakY, spacing, warp, accentEvery, colors: colors.map((c) => `#${c}`) }
}
