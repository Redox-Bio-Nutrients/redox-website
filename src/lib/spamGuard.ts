// src/lib/spamGuard.ts
//
// WHY: The site's three email forms (Product Information Request, Do Not
// Sell or Share, Account Management) had no spam protection, and bots
// started filling the compliance forms. This is the cheap, invisible
// first layer — no CAPTCHA, nothing a real visitor sees:
//
// 1. Honeypot: SpamTrapFields.astro renders an off-screen "website"
//    field. People never see it; form-filling bots do, and fill it in.
// 2. Timing: the same component records how long the form was open
//    before submit (measured in the browser, so clock skew between the
//    visitor and the server doesn't matter). Under MIN_FILL_MS is a
//    bot; a missing value means the POST didn't come from our page at
//    all (a bot hitting the endpoint directly).
// 3. Content: links in fields that should never hold one (names, city,
//    zip…), or several links anywhere, are the usual spam payload.
//
// Callers treat a hit as spam by answering with the normal success
// response and simply not sending the email, so bots get no signal to
// adapt to. Each hit is logged (reason only, no personal data) so it
// shows up in Vercel's function logs.

export const HONEYPOT_FIELD = 'website'
export const ELAPSED_FIELD = 'form_elapsed_ms'

/** Field names the endpoints must leave out of the emailed body. */
export const SPAM_TRAP_FIELDS = [HONEYPOT_FIELD, ELAPSED_FIELD]

const MIN_FILL_MS = 3000

const LINK_PATTERN = /https?:\/\/|www\.|<a\s|\[url|\.(?:ru|cn|xyz|top|click|link|shop|online|site)\b/i
const ANY_LINK = /https?:\/\/|www\./gi

/** Returns why a submission looks like spam, or null if it looks human.
 * `plainFields` are the fields that should never contain a link. */
export function spamReason(form: FormData, plainFields: string[]): string | null {
  if (String(form.get(HONEYPOT_FIELD) ?? '').trim()) return 'honeypot filled'

  const elapsedRaw = form.get(ELAPSED_FIELD)
  if (elapsedRaw === null || elapsedRaw === '') return 'no timing (not submitted from the site)'
  const elapsed = Number(elapsedRaw)
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return `submitted too fast (${elapsedRaw} ms)`

  for (const field of plainFields) {
    if (LINK_PATTERN.test(String(form.get(field) ?? ''))) return `link in "${field}"`
  }

  let links = 0
  for (const [key, value] of form.entries()) {
    if (SPAM_TRAP_FIELDS.includes(key)) continue
    links += (String(value).match(ANY_LINK) ?? []).length
  }
  if (links >= 2) return `${links} links in submission`

  return null
}
