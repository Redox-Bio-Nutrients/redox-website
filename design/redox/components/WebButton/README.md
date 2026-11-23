# WebButton

The website's call-to-action: a frosted glass pill with a green-to-purple gradient.

Static rendition hand-written from redox-website/src/styles/buttons.css (`.btn`, `.btn--primary`, `.btn--ghost`, `.btn--on-color`, `.btn--sm`).

- **Primary:** translucent gradient from the product colour (else `web-green`) to its accent (else `web-purple`), green held to 62% so it reads green-led; white `web-button` text; a soft top highlight; 1px white edge. On hover the gradient turns from 135° to 180° and the purple grows a little over 1s; a thin iridescent rim spins around the edge (stopped under reduced motion). It never moves.
- **Ghost:** a 9% tint of the colour, 1.5px border at 45%, text clamped dark enough to read (lightened in dark mode).
- **On colour:** a ghost on a coloured or photo surface goes white-on-glass.
- Pill (`radius-round`), `web-button-pad-y` × `web-button-pad-x`; `--sm` is smaller. Focus: a 2px outline in the button colour.
- The quieter pattern, an underlined "Explore →" text link, is not a button.
- Turf product pages use their own diagonal-cut buttons instead.
- White text on `web-green` is 4.97:1 in light but falls to 2.85:1 in dark, as the site has it today.
