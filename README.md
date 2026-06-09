# Redox Bio-Nutrients Website

Marketing and content site for [Redox Bio-Nutrients](https://redoxgrows.com) — products, technologies, regions/rep locator, blog, podcast, and Redox University.

## Stack

| Layer | Technology |
|---|---|
| Frontend | [Astro 6](https://astro.build) — static output, scoped component styles, design tokens in CSS custom properties |
| CMS | [Sanity](https://www.sanity.io) — Studio lives in [`sanity/`](sanity/), content fetched via GROQ at build time |
| Hosting | [Vercel](https://vercel.com) — `main` → production, `dev` → staging preview |
| Fonts | DM Sans / DM Serif Display (Google Fonts) |

Content publishes trigger automatic rebuilds via Sanity → Vercel webhooks, so editors go live without a code push. See [docs/deployment.md](docs/deployment.md) for environments, env vars, and deploy flow.

## Getting Started

Requires **Node ≥ 22.12**.

```sh
git clone git@github.com:Redox-Bio-Nutrients/redox-website.git
cd redox-website
npm install
cp .env.example .env   # then fill in values — see below
npm run dev            # site at http://localhost:4321
```

`.env` values for local dev:

- `PUBLIC_SANITY_PROJECT_ID=zym8k10b`
- `PUBLIC_SANITY_DATASET=staging` — always use staging locally
- `PUBLIC_SANITY_API_VERSION=2024-01-01`
- `PUBLIC_SITE_URL=http://localhost:4321`
- `SANITY_API_TOKEN` — your personal read token from [sanity.io/manage](https://www.sanity.io/manage/project/zym8k10b)

### Sanity Studio (content editing)

The Studio is a separate package in [`sanity/`](sanity/):

```sh
cd sanity
npm install
npm run dev            # Studio at http://localhost:3333
```

Locally the Studio defaults to the **staging** dataset (`SANITY_STUDIO_DATASET` overrides), so you can't accidentally edit production content.

## Project Structure

```text
/
├── docs/                  # Deployment guide, decisions, module docs
├── sanity/                # Sanity Studio (own package)
│   ├── schemas/           # Document + object type definitions
│   └── structure.ts       # Desk structure (sidebar grouped by site section)
├── public/                # Static assets served as-is
└── src/
    ├── components/        # Astro components, grouped by site section
    ├── config/site.ts     # Site name, nav labels, external links
    ├── layouts/           # BaseLayout (document shell, SEO meta, header/footer)
    ├── lib/
    │   ├── queries/       # GROQ queries, one file per section
    │   └── types/         # TS types mirroring the query projections
    ├── locales/           # UI strings (en.json) — i18n-ready, English only at launch
    ├── pages/             # File-based routes
    └── styles/            # tokens.css (design tokens) + global.css (reset)
```

Conventions worth knowing:

- **Nav labels and site config** come from `src/config/site.ts` — never hardcoded in components.
- **Design decisions live in `src/styles/tokens.css`** — components reference tokens, never raw values.
- **Types mirror queries**: `src/lib/types/sanity.ts` matches the GROQ projections in `src/lib/queries/`, not the raw Sanity documents. Change a projection and its type in the same PR.
- **Product pages are composed of reorderable sections** (text, colored callout, columned bullets, analysis table) defined in `sanity/schemas/objects/productSections.ts` and rendered by `src/components/products/sections/`.

## Commands

All from the repo root (Studio commands from `sanity/`):

| Command | Action |
|---|---|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npx astro check` | Type-check the site |
| `cd sanity && npm run dev` | Sanity Studio at `localhost:3333` |
| `cd sanity && npx sanity schema validate` | Validate content schemas |

## Branching & Deploys

```text
feature/* ─► dev (staging preview) ─► PR ─► main (production)
```

Direct pushes to `main` are blocked — production deploys via reviewed PR only. Full details in [docs/deployment.md](docs/deployment.md).
