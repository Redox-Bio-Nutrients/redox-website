---
name: Redox website (redoxgrows.com)
description: Public register of the Redox design system. All values live in design/redox/; this file only points there.
---

# DESIGN.md

The source of truth for this site's visual design is **design/redox/**, a read-only snapshot of the claude.ai "Redox" design system artifact (see design/redox/SOURCE.md). This file deliberately restates no token values, so it cannot drift. Read the files named below and use their tokens by name. Never edit design/redox/, and never invent a colour, font, size, radius, shadow or spacing value that is not in design/redox/tokens.json.

This repo is the website, so use the **public register**:

- design/redox/README.md: the shared brand core (content rules, foundations, iconography, logos, themes)
- design/redox/website.md: the website register
- the `web-*` tokens in design/redox/tokens.json, plus the shared `brand-*` tokens website.md names
- the Web* components in design/redox/components/ (WebButton, WebCallout, WebAnalysis)

Ignore the dashboard-only parts (the non-Web components and non-`web-*` tokens). presentations.md is reference only.

## Overview
Brand personality, the two-register model and content rules: README.md (intro, "Content fundamentals") and website.md (intro, "Principles").

## Colors
website.md "Colour", README.md "Colour", and the `color` group in tokens.json (`web-*` and `brand-*` keys). The product colour comes from the CMS; website.md says where it applies and what replaces it when a product has none.

## Typography
website.md "Type", README.md "Type", and the `type` group in tokens.json (`web-*` roles, plus `turf-display` for Turf product pages only).

## Layout
website.md "Principles" (section gap, content width), README.md "Spacing and layout", and the `spacing` group in tokens.json.

## Elevation & Depth
README.md "The textured slab", website.md "Shape and surface" (frosted glass) and "Imagery" (scrims), and the `shadow` and `zIndex` groups in tokens.json.

## Shapes
website.md "Shape and surface", README.md "Shape", and the `radius` group in tokens.json. Logo rules: README.md "Logos" and design/redox/assets/Logos/README.md. Never redraw or stretch a mark.

## Components
design/redox/components/WebButton, WebCallout and WebAnalysis: each has a README.md (guidelines) and a preview.html. Shared CSS is in components/bundle.css.

## Do's and Don'ts
The rules in website.md and README.md are the do's and don'ts. Motion rules: website.md "Motion" and README.md "Motion". States and feedback: README.md "States and feedback". Product names always use official casing and full names, and only Redox products appear.
