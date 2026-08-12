// src/pages/api/resource-request.ts
//
// Server-rendered (see `prerender = false`) — the one route on this
// otherwise fully static site that needs a real backend. Handles
// "Product Information Request" submissions from ResourceRequestDialog:
// validates the payload, looks up the notify-to address from Sanity
// (the formSettings singleton, editable without a deploy — see
// src/lib/queries/settings.ts), and sends the email via Microsoft
// Graph from notifications@redoxgrows.com (src/lib/graphMail.ts).
//
// Needs MS365_TENANT_ID / MS365_CLIENT_ID / MS365_CLIENT_SECRET set in
// Vercel (see docs/deployment.md for the Azure AD app registration
// runbook) and formSettings.resourceRequestRecipient set in Sanity
// Studio. Returns a clear error instead of failing silently if either
// is missing.

import type { APIRoute } from 'astro'
import { getFormSettings } from '../../lib/queries'
import { sendMail } from '../../lib/graphMail'

export const prerender = false

const SENDER = import.meta.env.MS365_SENDER_EMAIL ?? 'notifications@redoxgrows.com'

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

  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim()
  const state = String(form.get('state') ?? '').trim()
  const product = String(form.get('product') ?? '').trim()
  const materials = form.getAll('materials').map(String)

  if (!name || !email) {
    return json({ ok: false, error: 'Name and email are required.' }, 400)
  }

  let recipient: string | undefined
  try {
    const settings = await getFormSettings()
    recipient = settings?.resourceRequestRecipient
  } catch (err) {
    console.error('[resource-request] Failed to fetch formSettings from Sanity:', err)
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
  ]

  try {
    await sendMail({
      from: SENDER,
      to: recipient,
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
