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
`universityResource`, `page`, `homepage`, `backgroundPool`) — drafts
and system documents do not trigger builds.

**When adding a new Sanity document type, add it to this filter too.**
It's not automatic — `homepage` and `backgroundPool` were both missing
from the filter for a while after being created, so publishing them
silently never rebuilt the site. Update via the Sanity webhook API
(sanity.io/manage → API → Webhooks), not just this doc.

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