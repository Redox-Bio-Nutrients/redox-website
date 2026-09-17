// src/pages/api/resource-request.ts
//
// Server-rendered (see `prerender = false`) — the one route on this
// otherwise fully static site that needs a real backend. Handles
// "Product Information Request" submissions from ResourceRequestDialog:
// validates the payload, picks a recipient, and sends the email via
// Microsoft Graph from notifications@redoxgrows.com (src/lib/graphMail.ts).
//
// Recipient routing (2026-09): if the submitted "State" matches a
// Team Member's coverage area (author.ts's coverageAreas — the same
// field the region roster cards show), the email goes to that rep
// directly, with the general Form Settings recipient CC'd as a
// backup so nothing silently depends on one person's inbox. If no
// state match is found (an uncovered state, "Outside the U.S.", or no
// reps have coverage areas configured yet), it falls back to the
// general recipient alone — the original, only behavior before this.
// See findRepForState() below and getStateCoverageReps() in
// src/lib/queries/people.ts for the matching itself.
//
// Needs MS365_TENANT_ID / MS365_CLIENT_ID / MS365_CLIENT_SECRET set in
// Vercel (see docs/deployment.md for the Azure AD app registration
// runbook) and formSettings.resourceRequestRecipient set in Sanity
// Studio. Returns a clear error instead of failing silently if either
// is missing.

import type { APIRoute } from 'astro'
import { getFormSettings, getStateCoverageReps } from '../../lib/queries'
import type { CoverageRep } from '../../lib/types/sanity'
import { sendMail } from '../../lib/graphMail'

export const prerender = false

const SENDER = import.meta.env.MS365_SENDER_EMAIL ?? 'notifications@redoxgrows.com'

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Case-insensitive exact match against a rep's coverage areas — the
// dropdown only ever submits a full state name (see US_STATES in
// ResourceRequestDialog.astro), so this deliberately doesn't try to
// fuzzy-match county-level entries like "Story County, IA"; those are
// for the region roster cards, not request routing. `reps` is already
// ordered by the same orderRank/name tie-break the region roster uses
// (getStateCoverageReps()), so the first match found is the right
// person to pick when two reps' coverage happens to overlap.
function findRepForState(reps: CoverageRep[], state: string): CoverageRep | null {
  if (!state) return null
  const target = state.trim().toLowerCase()
  return reps.find((rep) => rep.coverageAreas.some((area) => area.trim().toLowerCase() === target)) ?? null
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400)
  }

  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim()
  const state = String(form.get('state') ?? '').trim()
  const product = String(form.get('product') ?? '').trim()
  const materials = form.getAll('materials').map(String)

  if (!name || !email) {
    return json({ ok: false, error: 'Name and email are required.' }, 400)
  }

  let recipient: string | undefined
  let cc: string | undefined
  let matchedRep: CoverageRep | null = null
  try {
    const [settings, reps] = await Promise.all([getFormSettings(), getStateCoverageReps()])
    matchedRep = findRepForState(reps, state)
    const generalRecipient = settings?.resourceRequestRecipient

    if (matchedRep) {
      recipient = matchedRep.email
      // Only CC the general inbox if it's a different address than the
      // matched rep — an identical to/cc pair is redundant, and Graph
      // may reject duplicate recipients on the same message.
      if (generalRecipient && generalRecipient.toLowerCase() !== matchedRep.email.toLowerCase()) {
        cc = generalRecipient
      }
    } else {
      recipient = generalRecipient
    }
  } catch (err) {
    console.error('[resource-request] Failed to fetch formSettings/coverage reps from Sanity:', err)
  }

  if (!recipient) {
    console.error(
      '[resource-request] No resourceRequestRecipient configured in Sanity (formSettings singleton) — create it in Studio.',
    )
    return json(
      { ok: false, error: 'This form is not fully configured yet — please email us directly.' },
      500,
    )
  }

  const bodyLines = [
    `Product: ${product || '(not specified)'}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `State: ${state || '(not specified)'}`,
    `Materials requested: ${materials.length ? materials.join(', ') : '(none selected)'}`,
    ...(matchedRep ? [`Routed to: ${matchedRep.name} (covers ${state})`] : []),
  ]

  try {
    await sendMail({
      from: SENDER,
      to: recipient,
      cc,
      replyTo: email,
      subject: `Product information request — ${product || 'General'}`,
      body: bodyLines.join('\n'),
    })
  } catch (err) {
    console.error('[resource-request] sendMail failed:', err)
    return json(
      { ok: false, error: 'Something went wrong sending your request — please email us directly.' },
      502,
    )
  }

  return json({ ok: true }, 200)
}
