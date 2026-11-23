# Redox website

## Design system
The Redox design system in design/redox/ is the source of truth for all visual design. This is the website, so use the public register (README.md core, website.md, web-* tokens, Web* components). Never edit files in design/redox/. Never invent colours, fonts or spacing that are not in design/redox/tokens.json.

In code, the `web-*` tokens are the CSS variables in src/styles/tokens.css: the token name without `web-`, sometimes with `color-` in front (`web-bg-page` is `--bg-page`, `web-green` is `--color-green`). Always use `var(--…)`, never the hex value: the variables change in dark mode, the hex does not.

## Product names
Redox product names always use official casing and full names. Remove any product that is not a Redox product.
