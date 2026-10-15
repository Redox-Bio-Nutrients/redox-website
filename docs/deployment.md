# Deployment Guide

**Version:** 1.3  
**Last updated:** 2026-10-15  

## Environments

| Environment | Branch | URL | Sanity Dataset |
|---|---|---|---|
| Production | `main` | **https://redoxgrows.com** (live since 2026-09-28) | `production` |
| Preview | any non-`main` branch | `https://redox-website-git-<branch>-redox-bio-nutrients-projects.vercel.app` | `production` |

- `redoxgrows.com` (apex) is the canonical host — `PUBLIC_SITE_URL`,
  canonical tags and the sitemap all use it.
- **`www.redoxgrows.com` also serves Production** (Vercel → Domains →
  "Connect to an environment: Production"), *not* a redirect to the apex.
  A www → apex redirect was tried at launch and caused
  `ERR_TOO_MANY_REDIRECTS` for returning visitors whose browsers had
  cached the old WP Engine apex → www 301 indefinitely. **Don't re-add
  the redirect.**
- The original production URL
  (`https://redox-website-redox-bio-nutrients-projects.vercel.app`) still
  works and serves the same deployment.
- The `dev` branch is stale and no longer used as a staging channel —
  every feature branch / PR gets its own Preview URL instead.

## Infrastructure

| Service | Account | Purpose |
|---|---|---|
| GitHub | github.com/Redox-Bio-Nutrients | Source control |
| Vercel | Redox Bio-Nutrients (**Pro**, since 2026-09-28) | Hosting + deploys |
| Sanity | curtis.richins@redoxgrows.com | CMS + content API |

DNS for `redoxgrows.com` is managed at Squarespace. Only the apex `@`
A record (→ `216.150.1.1`) and the `www` CNAME point at Vercel; every
other record (MX/SPF for Microsoft 365 + HubSpot, and the `dashboard.` /
`clients.` subdomains, etc.) is unrelated to this site — leave them alone.

## Sanity Project

- **Project ID:** `zym8k10b`
- **Dataset:** a single `production` dataset, used by Production,
  Preview builds and local development alike. (An old `staging`
  dataset from August is no longer used by anything and is pending
  deletion.)
- **Studio:** hosted at https://redox-bio-nutrients.sanity.studio/
  (source in `/sanity`). `sanity.config.ts` defaults to `production`;
  `SANITY_STUDIO_DATASET` overrides it.

## Branching Model

```
main  ──► Vercel Production  (redoxgrows.com)
 ↑
 └── PR merge only — feature branches open PRs straight against main
     (each branch gets its own Vercel Preview URL to review first)
```

## Deploy Process

### Deploying to production
1. Branch from an up-to-date `origin/main`, commit, push.
2. Review the branch's Vercel Preview URL.
3. Open a PR against `main` and merge it — Vercel auto-deploys to
   production.

Content-only changes don't need a deploy at all — publishing in Sanity
Studio rebuilds production automatically (see **Content Rebuild
Webhooks** below).

### Emergency rollback
Vercel dashboard → Deployments → find last good deploy → **Instant Rollback**

## Environment Variables (Vercel)

| Variable | Production | Preview |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | `zym8k10b` | `zym8k10b` |
| `PUBLIC_SANITY_DATASET` | `production` | not set (code defaults to `production`) |
| `PUBLIC_SANITY_API_VERSION` | `2024-01-01` | `2024-01-01` |
| `PUBLIC_SITE_URL` | `https://redoxgrows.com` (no `www`, no trailing slash) | Vercel preview URL |
| `SANITY_API_TOKEN` | ✅ set (Viewer token) | ✅ set |
| `SANITY_PREVIEW_SECRET` | ✅ set | unverified |
| `SANITY_WEBHOOK_SECRET` | placeholder | placeholder |
| `MS365_TENANT_ID` | ✅ set | unverified |
| `MS365_CLIENT_ID` | ✅ set | unverified |
| `MS365_CLIENT_SECRET` | ✅ set | unverified |
| `MS365_SENDER_EMAIL` | optional, defaults to `notifications@redoxgrows.com` | same |

**Dataset fallback:** `PUBLIC_SANITY_DATASET` is only set for Production.
`src/lib/sanity.ts` (and Studio's `sanity.config.ts`) default to
`'production'` when it's unset, so Preview builds read the same content
as Production. (Until 2026-10-15 the fallback was `'staging'`, which
meant Preview builds read the stale `staging` dataset.) Adding
`PUBLIC_SANITY_DATASET=production` to the Preview environment in Vercel
is optional — it just makes the setting explicit.

The three `MS365_*` secrets power `src/pages/api/resource-request.ts`
(the "Product Information Request" email on product pages) — see
**Product Information Request Email** below for what they are and how
to get them. Until they're set, that form still renders and submits,
but the API route returns a clear "not fully configured yet" error
instead of silently failing.

## Product Information Request Email (Microsoft Graph)

Product pages have a "Product Information Request" button that opens a
form (Name / Email / State / Materials Requested). Submissions are
emailed **from** `notifications@redoxgrows.com` **to** whatever address
is set in Sanity Studio (see below) via `src/pages/api/resource-request.ts`
— the one server-rendered route on an otherwise fully static site
(`src/lib/graphMail.ts` has the actual Graph call).

This uses **app-only OAuth** (client credentials), not the delegated
"sign in as this user" flow a WordPress SMTP plugin typically uses —
app-only is the correct pattern for a backend service with no user
present, and needs its own Azure AD app registration (a new one, not
reusable from WordPress's).

**One-time setup in Azure AD / Entra ID** (admin access required):

1. **portal.azure.com → Microsoft Entra ID → App registrations → New
   registration.** Name it something like "Redox Website — Resource
   Request Mail". Single tenant is fine. No redirect URI needed (this
   app never does an interactive sign-in).
2. Note the **Application (client) ID** and **Directory (tenant) ID**
   from the registration's Overview page.
3. **Certificates & secrets → New client secret.** Copy the secret
   **value** immediately (not the Secret ID) — Azure only shows it once.
4. **API permissions → Add a permission → Microsoft Graph →
   Application permissions** (not Delegated) → search `Mail.Send` →
   add it.
5. Still on API permissions: **Grant admin consent for [tenant]** —
   required for an application permission to actually work, and only
   an admin can click this (you have admin access, so this is you).
6. In Vercel (Project → Settings → Environment Variables), add:
   - `MS365_TENANT_ID` = the Directory (tenant) ID from step 2
   - `MS365_CLIENT_ID` = the Application (client) ID from step 2
   - `MS365_CLIENT_SECRET` = the secret value from step 3
   - Apply to both Production and Preview so Preview deployments can
     send test requests too.
7. **In Sanity Studio → Form Settings** (bottom of the content list):
   set **Product Information Request Recipient** to the single inbox
   that should receive every one of these leads. This is read live at
   request time, not baked in at build — changing it takes effect on
   the next submission, no redeploy needed. Every submission goes here
   regardless of the visitor's selected State — see below.

**One gatekeeper, not per-state routing (2026-09-18):** a per-state
routing feature briefly existed here (built 2026-09-15, live
2026-09-17) that sent the email directly to whichever Team Member's
**States Covered** matched the visitor's selected State, CC'ing the
general recipient as backup. It was reverted at Curtis's explicit
request: the regional VPs couldn't agree on ownership boundaries, so
now every submission goes to the one **Product Information Request
Recipient** above and that person disseminates it manually. The
visitor's State is still collected and shown in the email body for
their reference — it just no longer decides who receives it. A Team
Member's **States Covered** / **Coverage Label** fields still exist and
still drive the "Covers ..." line on their About Us team card; they're
purely cosmetic now, with zero effect on this form.

**Optional hardening, not required to get this working:** by default,
app-only `Mail.Send` can send as *any* mailbox in the tenant. An
Exchange Online admin can scope the app down to only
`notifications@redoxgrows.com` with an
[application access policy](https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access)
(PowerShell, `New-ApplicationAccessPolicy`) — worth doing eventually,
not blocking.

## Local Development

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Local `.env` values:
- `PUBLIC_SANITY_DATASET=production` — the only dataset (local builds
  only ever read published content; drafts are only visible through
  the `/api/preview` flow)
- `PUBLIC_SITE_URL=http://localhost:4321`
- `SANITY_API_TOKEN` — your personal Sanity API token

## Content Rebuild Webhooks

Publishing in Sanity Studio triggers a Vercel rebuild automatically, so
new/edited content goes live without a code push:

```
Studio publish → Sanity GROQ webhook → Vercel deploy hook → rebuild (~1 min)
```

| Webhook (sanity.io/manage → API → Webhooks) | Dataset | Triggers |
|---|---|---|
| Vercel Production Deploy | `production` | Production rebuild (`main`) |
| Vercel Staging Deploy | `production` | Rebuild of the stale `dev` branch (can be removed) |

Both fire on create/update/delete of published documents (drafts don't
trigger builds), filtered with
`!(_type match "sanity.*") && !(_type match "system.*")` — i.e. **every**
content type, so a new document type rebuilds the site without any
webhook change. (Confirmed via the webhooks API 2026-10-01; this doc
previously listed an older per-type filter.) Note both hooks are on the
`production` dataset, so each publish rebuilds `main` *and* `dev`.

`private.formSettings` triggers a rebuild too, but doesn't need one:
it's read live at request time by a server-rendered API route (see
**Product Information Request Email** above), not baked in at build.

### Private documents (team contacts, form recipient)

The `production` dataset is **public** — private datasets need a paid
Sanity plan — so any field on a normal document can be read by anyone
through Sanity's anonymous API. Sensitive values live in two singletons
with dotted IDs, which Sanity never serves to unauthenticated requests
(the same rule that hides `drafts.*`):

| Document ID | Studio item | Holds | Read by |
|---|---|---|---|
| `private.teamContacts` | Team Contact Directory | Team members' email + phone | `AUTHOR_FRAGMENT` at build time |
| `private.formSettings` | Form Settings | Product Information Request recipient | `/api/resource-request` at request time |

The site reads them with `SANITY_API_TOKEN` (a Viewer token), so that
variable must be set in Vercel for **Production and Preview**, and the
runtime form depends on it too. Without it the build still succeeds but
Contact Us cards lose their Email/Call buttons, and the form answers
"not fully configured". Don't put contact details back on `author`, and
don't create these types any other way (they'd get a random public ID).

The matching Vercel deploy hooks (`sanity-production`, `sanity-staging`)
live in Vercel → Settings → Git → Deploy Hooks.

Note: `SANITY_WEBHOOK_SECRET` is currently unused — it's reserved for
future *inbound* webhooks to the site (e.g. on-demand ISR). The
Sanity→Vercel deploy-hook flow above doesn't need it.

## Post-Launch Status

The site went live on redoxgrows.com on 2026-09-28. The old pre-launch
checklist is resolved:

- [x] Custom domain connected (apex + `www`, both serving Production).
- [x] Vercel upgraded to Pro.
- [x] Sanity Studio deployed — https://redox-bio-nutrients.sanity.studio/
- [x] Microsoft 365 app registration done; Product Information Request
  emails send from `notifications@redoxgrows.com` to the recipient set
  in Studio → Form Settings.
- [x] Real contact details on Contact Us (per-person Email/Call buttons
  read from `private.teamContacts`).
- [x] Vercel Deployment Protection left **off** at launch by decision —
  Standard Protection would gate the production `.vercel.app` URL. Revisit
  if Preview URLs should be private.
- [ ] Delete the unused `staging` Sanity dataset — safe once this
  dataset-fallback change is deployed (nothing reads `staging` after that).
