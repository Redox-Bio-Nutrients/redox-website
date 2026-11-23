# Tag

Small uppercase mono status tag: "Approved", "Sent back", "Ready".

Static rendition hand-written from apps/web/src/styles.css (`tag` utility); the caller adds colours.

- 10.5px JetBrains Mono, 500, 0.05em tracking, uppercase via CSS; small leaf corner; 2px × 6px padding.
- Colour by meaning: good/ready = `color-signal` fill with ink edge; neutral = `color-line` border with muted text; problem = `color-danger` border and text; strong = ink fill.
- Write the word in sentence case in the source. Never use a tag for a sentence.
