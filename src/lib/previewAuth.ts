// src/lib/previewAuth.ts
//
// WHY: Draft preview used to set a cookie whose value was just "1", and
// the /preview/* pages only checked for that value — so anyone could set
// the cookie by hand and read unpublished drafts without the preview
// secret (found in the 2026-09-30 security audit). The cookie is now a
// signed, expiring token: `<expiry>.<HMAC-SHA256(secret, expiry)>`,
// minted by /api/preview only after the secret checks out, and verified
// with a constant-time compare on every preview page load. Nobody can
// forge one without SANITY_PREVIEW_SECRET, and changing that secret
// invalidates every cookie already issued.

import { createHmac, timingSafeEqual } from 'node:crypto'

export const PREVIEW_COOKIE = 'sanity-preview'
export const PREVIEW_MAX_AGE_SECONDS = 60 * 60 * 24 // 1 day

function previewSecret(): string | null {
  const secret = import.meta.env.SANITY_PREVIEW_SECRET
  return typeof secret === 'string' && secret.length > 0 ? secret : null
}

function sign(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(`redox-preview:${payload}`).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

/** Constant-time check of the secret passed to /api/preview. */
export function isValidPreviewSecret(candidate: string | null): boolean {
  const secret = previewSecret()
  return Boolean(secret && candidate && safeEqual(candidate, secret))
}

/** Cookie value for a newly authorized preview session. */
export function createPreviewToken(now = Date.now()): string {
  const secret = previewSecret()
  if (!secret) throw new Error('SANITY_PREVIEW_SECRET is not set')
  const expires = String(Math.floor(now / 1000) + PREVIEW_MAX_AGE_SECONDS)
  return `${expires}.${sign(secret, expires)}`
}

/** True only for an unexpired token signed with the current secret. */
export function isValidPreviewToken(token: string | undefined, now = Date.now()): boolean {
  const secret = previewSecret()
  if (!secret || !token) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature || !/^\d+$/.test(expires)) return false
  if (Number(expires) * 1000 < now) return false
  return safeEqual(signature, sign(secret, expires))
}
