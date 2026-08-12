# Deployment Guide

**Version:** 1.2  
**Last updated:** 2026-06-09  

## Environments

| Environment | Branch | URL | Sanity Dataset |
|---|---|---|---|
| Production | `main` | redoxgrows.com (TBD — domain not yet connected) | `production` |
| Staging | `dev` | https://redox-website-git-dev-redox-bio-nutrients-projects.vercel.app | `staging` |

## Infrastructure

| Service | Account | Purpose |
|---|---|---|
| GitHub | github.com/redoxbionutrients | Source control |
| Vercel | Redox Bio-Nutrients (Hobby) | Hosting + deploys |
| Sanity | curtis.richins@redoxgrows.com | CMS + content API |

## Sanity Project

- **Project ID:** `zym8k10b`
- **Datasets:** `production` (live content), `staging` (dev/preview content)
- **Studio location:** `/sanity` in repo root
- **Dataset control:** `SANITY_STUDIO_DATASET` env var — defaults to `staging`

## Branching Model
main  ──► Vercel Production  (redoxgrows.com)
↑
└── PR merge only — direct pushes blocked by branch protection
dev   ──► Vercel Preview/Staging
↑
└── feature/, fix/, content/* branches merged here first

## Deploy Process

### Deploying to staging
```bash
git checkout dev
git pull origin dev
# make changes
git add .
git commit -m "your message"
git push origin dev
# Vercel auto-deploys to staging preview URL
```

### Deploying to production
1. Open a PR from `dev` → `main` on GitHub
2. Review changes on the staging preview URL
3. Merge PR — Vercel auto-deploys to production

### Emergency rollback
Vercel dashboard → Deployments → find last good deploy → **Instant Rollback**

## Environment Variables (Vercel)

| Variable | Production | Preview |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | `zym8k10b` | `zym8k10b` |
| `PUBLIC_SANITY_DATASET` | `production` | `staging` |
| `PUBLIC_SANITY_API_VERSION` | `2024-01-01` | `2024-01-01` |
| `PUBLIC_SITE_URL` | `https://redoxgrows.com` | Vercel preview URL |
| `SANITY_API_TOKEN` | ✅ set | ✅ set |
| `SANITY_WEBHOOK_SECRET` | placeholder | placeholder |
| `MS365_TENANT_ID` | ⬜ not yet set | ⬜ not yet set |
| `MS365_CLIENT_ID` | ⬜ not yet set | ⬜ not yet set |
| `MS365_CLIENT_SECRET` | ⬜ not yet set | ⬜ not yet set |
| `MS365_SENDER_EMAIL` | optional, defaults to `notifications@redoxgrows.com` | same |

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
   - Apply to both Production and Preview so staging can send test
     requests too.
7. **In Sanity Studio → Form Settings** (bottom of the content list):
   set **Product Information Request Recipient** to whatever inbox
   should receive these leads. This is read live at request time, not
   baked in at build — changing it takes effect on the next
   submission, no redeploy needed.

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
- `PUBLIC_SANITY_DATASET=staging` — always use staging locally
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
| Vercel Staging Deploy | `staging` | Staging rebuild (`dev`) |

Both fire on create/update/delete of published documents, filtered to
site content types only (`product`, `technology`, `region`, `rep`,
`blogPost`, `category`, `author`, `podcastEpisode`,
`universityResource`, `page`, `homepage`, `backgroundPool`,
`siteWallpaper`) — drafts and system documents do not trigger builds.

**When adding a new Sanity document type, add it to this filter too.**
It's not automatic — `homepage` and `backgroundPool` were both missing
from the filter for a while after being created, so publishing them
silently never rebuilt the site. Update via the Sanity webhook API
(sanity.io/manage → API → Webhooks), not just this doc.

**Exception:** `formSettings` deliberately isn't in this filter. It's
read live at request time by a server-rendered API route (see
**Product Information Request Email** above), not baked in at build —
so a rebuild wouldn't do anything for it anyway.

The matching Vercel deploy hooks (`sanity-production`, `sanity-staging`)
live in Vercel → Settings → Git → Deploy Hooks.

Note: `SANITY_WEBHOOK_SECRET` is currently unused — it's reserved for
future *inbound* webhooks to the site (e.g. on-demand ISR). The
Sanity→Vercel deploy-hook flow above doesn't need it.

## Pre-Launch Checklist

Things to revisit before this site is considered launch-ready. Not urgent individually, but each should be a deliberate decision, not an oversight.

- [ ] Connect custom domain (redoxgrows.com) in Vercel
- [ ] Add `PUBLIC_HUBSPOT_PORTAL_ID` when HubSpot integration begins
- [ ] Add `PUBLIC_BUZZSPROUT_PODCAST_ID` when podcast is configured
- [ ] **Deploy Sanity Studio** (`sanity deploy`) so content editors can log in and edit from any browser without running the Studio locally. Deliberately deferred (decided 2026-07-09) while content is still being built out solo — revisit once other people need editing access.
- [ ] **Re-enable Vercel Deployment Protection** (or decide it should stay off). It was turned off 2026-07-15 to share a public demo link — currently both the staging and production `.vercel.app` URLs are open to anyone with the link, with no password/login gate. Fine pre-launch; worth a deliberate decision once the real domain goes live.
- [ ] **Complete the Microsoft 365 app registration** for the Product Information Request email (`MS365_TENANT_ID`/`MS365_CLIENT_ID`/`MS365_CLIENT_SECRET` — see **Product Information Request Email** above) and set the recipient in Sanity Studio → Form Settings. Until both are done, the form still works but returns a "not fully configured yet" error instead of sending.
- [ ] **Replace the placeholder Contact page content** (`contact@example.com` / `(555) 123-4567`, created 2026-08-06) with real contact info in Sanity Studio → Pages → Contact.