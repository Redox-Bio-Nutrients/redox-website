# Redox design system: repo snapshot

This folder is a read-only copy of the Redox design system, exported on 2026-11-23
from the claude.ai artifact "Redox" (https://claude.ai/artifact/LTAEAD44cbaBU2CDWXP6i3,
last changed 2026-11-18).

The artifact is the source of truth. Do not edit these files in the repo.
Change the design system in claude.ai, then export a fresh copy and replace this folder.

## Which parts apply where

Redox is one brand in two registers (see README.md).

- Dashboard (staff and agronomist app): README.md, tokens.json, and every component
  in components/ except the Web* ones.
- Website (redoxgrows.com): README.md for the shared core, website.md, the `web-*`
  tokens in tokens.json, and the Web* components (WebButton, WebCallout, WebAnalysis).
- presentations.md covers slides and print. It is included for reference only.

## What is included

- README.md: the brand book (content rules, visual foundations, iconography, logos, themes)
- tokens.json: every colour, type, spacing and radius token, with usage notes
- website.md, presentations.md: the public-register sections
- components/: guidelines (README.md), live previews (preview.html) and bundle.css
- fonts/: JetBrains Mono. DM Sans, DM Serif Display and Barlow Condensed load from Google Fonts
- assets/Logos/: the official logo files. Never redraw or stretch a mark

## Not included

The Benefits icons (55), Crops illustrations (24) and Presentations images are not in this copy.
Their README files are, so the rules for using them are. Ask for an export when a repo needs them.
Two component previews point at images by a /_blob/ address that only works inside claude.ai.
