# Deployment Guide

**Version:** 1.1  
**Last updated:** 2026-05-29  

## Environments

| Environment | Branch | URL | Sanity Dataset |
|---|---|---|---|
| Production | `main` | redoxgrows.com (TBD — domain not yet connected) | `production` |
| Staging | `dev` | Vercel preview URL (see Vercel dashboard) | `staging` |

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

## TODO

- [ ] Connect custom domain (redoxgrows.com) in Vercel
- [ ] Set up Sanity webhook → Vercel production deploy hook
- [ ] Set up Sanity webhook → Vercel staging deploy hook
- [ ] Replace `SANITY_WEBHOOK_SECRET` placeholder with real secret
- [ ] Add `PUBLIC_HUBSPOT_PORTAL_ID` when HubSpot integration begins
- [ ] Add `PUBLIC_BUZZSPROUT_PODCAST_ID` when podcast is configured