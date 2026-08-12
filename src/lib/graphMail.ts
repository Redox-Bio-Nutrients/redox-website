// src/lib/graphMail.ts
//
// Sends mail through Microsoft Graph using app-only (client
// credentials) OAuth — the right pattern for a backend service with no
// signed-in user (as opposed to the delegated/interactive OAuth a
// WordPress SMTP plugin typically uses). Requires an Azure AD app
// registration with the Mail.Send *application* permission,
// admin-consented — see docs/deployment.md for the setup runbook.
//
// Three server-only env vars back this (never PUBLIC_-prefixed, so
// Astro never bundles them client-side): MS365_TENANT_ID,
// MS365_CLIENT_ID, MS365_CLIENT_SECRET.

interface SendMailOptions {
  from: string
  to: string
  replyTo?: string
  subject: string
  body: string
}

async function getAccessToken(): Promise<string> {
  const tenantId = import.meta.env.MS365_TENANT_ID
  const clientId = import.meta.env.MS365_CLIENT_ID
  const clientSecret = import.meta.env.MS365_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Microsoft 365 credentials are not configured (MS365_TENANT_ID / MS365_CLIENT_ID / MS365_CLIENT_SECRET)',
    )
  }

  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Failed to get Microsoft Graph access token: ${res.status} ${detail}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

/** Sends mail as `from` via Graph's application-permission sendMail —
 * `from` must be a real mailbox in the tenant; app-only auth can send
 * as any mailbox unless scoped down by an Exchange application access
 * policy (optional hardening, not required to get this working). */
export async function sendMail({ from, to, replyTo, subject, body }: SendMailOptions): Promise<void> {
  const accessToken = await getAccessToken()

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: 'Text', content: body },
        toRecipients: [{ emailAddress: { address: to } }],
        ...(replyTo ? { replyTo: [{ emailAddress: { address: replyTo } }] } : {}),
      },
      saveToSentItems: false,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Microsoft Graph sendMail failed: ${res.status} ${detail}`)
  }
}
