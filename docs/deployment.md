# Deployment Guide

**Status:** In progress — being built out alongside initial repo setup.

See brief.md for hosting decisions and rationale.

## Environments

| Environment | Branch | URL | Sanity Dataset |
|---|---|---|---|
| Production | main | redoxgrows.com | production |
| Staging | dev | staging.redoxgrows.com (TBD) | staging |

## Branches

- `main` — production only. Never commit directly. All changes via PR from `dev`.
- `dev` — staging. All feature branches merge here first.
- `feature/*`, `fix/*`, `content/*` — short-lived branches off `dev`.

## TODO
- [ ] Netlify site setup (production)
- [ ] Netlify site setup (staging)
- [ ] Environment variables per context
- [ ] Sanity project and dataset creation
- [ ] Webhook wiring