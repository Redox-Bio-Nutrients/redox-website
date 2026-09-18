// src/pages/api/compliance-request.ts
//
// Server-rendered (see `prerender = false`), same pattern as
// resource-request.ts — a real backend on an otherwise fully static
// site. Handles both compliance forms that legally need to go
// somewhere real, not just render static text:
//
// - "ccpa-opt-out": the CCPA/Nevada "Do Not Sell or Share My Personal
//   Information" form (src/pages/do-not-sell-my-info.astro).
// - "account-deletion": the Google Play Store account/data deletion
//   request form (src/pages/account-management.astro) — a real Play
//   Store listing requirement, not optional content.
//
// Both send a plain email via Microsoft Graph (src/lib/graphMail.ts)
// to a fixed compliance contact rather than a Studio-configurable
// recipient — Curtis's direct answer was "same as info@redoxgrows.com"
// (the address already published as the contact in the Privacy Policy
// and every Cookie Policy page), not something that needs to be
// editable without a deploy the way the Product Information Request
// recipient is.

import type { APIRoute } from 'astro'
import { sendMail } from '../../lib/graphMail'

export const prerender = false

const SENDER = import.meta.env.MS365_SENDER_EMAIL ?? 'notifications@redoxgrows.com'
const COMPLIANCE_RECIPIENT = 'info@redoxgrows.com'

const REQUEST_LABELS: Record<string, string> = {
  'ccpa-opt-out': 'Do Not Sell or Share My Personal Information',
  'account-deletion': 'Google Play Account/Data Deletion Request',
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400)
  }

  const type = String(form.get('type') ?? '')
  const label = REQUEST_LABELS[type]
  if (!label) {
    return json({ ok: false, error: 'Invalid request type.' }, 400)
  }

  const email = String(form.get('email') ?? '').trim()
  if (!email) {
    return json({ ok: false, error: 'Email is required.' }, 400)
  }

  // Every other submitted field goes straight into the email body,
  // labeled by its own field name — both forms' fields are already
  // named for exactly this (name/phone/address/city/state/zip for the
  // opt-out form, details for account deletion), so there's no
  // per-field mapping to maintain here as those forms evolve.
  const bodyLines = Array.from(form.entries())
    .filter(([key]) => key !== 'type')
    .map(([key, value]) => `${key}: ${String(value) || '(not provided)'}`)

  try {
    await sendMail({
      from: SENDER,
      to: COMPLIANCE_RECIPIENT,
      replyTo: email,
      subject: `${label} — ${email}`,
      body: bodyLines.join('\n'),
    })
  } catch (err) {
    console.error(`[compliance-request] sendMail failed (${type}):`, err)
    return json(
      { ok: false, error: 'Something went wrong submitting your request — please email us directly.' },
      502,
    )
  }

  return json({ ok: true }, 200)
}
