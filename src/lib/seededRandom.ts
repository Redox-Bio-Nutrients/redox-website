// src/lib/seededRandom.ts
//
// WHY: Deterministic per-instance "randomness" for layout variation
// (e.g. CalloutSection's gradient bloom positions) — seeded from
// something stable like a Sanity block's `_key`, so the same callout
// always looks the same across rebuilds (no visual flicker/reshuffle
// on redeploy), but two different callouts land on two different
// variations instead of repeating an identical formula.

function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Mulberry32 PRNG seeded from a string — returns a function that
 * yields deterministic pseudo-random floats in [0, 1) on each call. */
export function seededRandom(seed: string): () => number {
  let a = hashString(seed)
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomBetween(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function randomChoice<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]
}
