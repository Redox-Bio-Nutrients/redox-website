# Presentations

Slides, sell sheets and anything printed about a product are the public register: DM Serif Display headings, DM Sans text, the leaf corner and the official logo, as in the **Website** section. What sets each product apart is colour: **every product slide is painted from its own label**, so a deck of products reads as a row of distinct packages, not one green page repeated.

The reference builds are in the 2027 Product Guide deck: the RDX-N, RDX-Flex, TriPlex Zinc, KaPstone and OsmoFlow product slides, and eight brand templates (cover, section, agenda, key message, comparison, key numbers, table, closing).

## Shared rules

- **Leaf corners**: two opposite corners large, the other two small, never square (the print brochure's R18/R4, scaled). Large panels 40px / 8px, cards 24px / 6px. Pattern A rounds top-left and bottom-right large; pattern B top-right and bottom-left. Side-by-side or stacked boxes alternate A and B so a pair reads as one shape. Benefit cards are the exception: plain 24px all round.
- **Logos** (assets › Logos): `redox-logo-on-dark.svg` (white wordmark, lime stem) on dark grounds, top left on covers and closings; `redox-logo-on-light-black.svg` (black wordmark, lime stem) in every footer band. Never the brown wordmark on slides.
- **No header row** on any slide (dropped November 2026 to give the content more room): the slide’s own title or eyebrow says what it is, and the content starts at the top margin. **Footer band** on every slide: 96px (y 984 to 1080), no seam or rule on top (dropped November 2026), logo left (none on cover and closing, where the logo is already top left), address right.
- **Spacing**: margins 96px; title at y 56 (an eyebrow at y 48 with the title under it); content starts around y 200 and ends by y 920; when a slide loses space-taking furniture, its main blocks grow into the room rather than leaving it empty; groups stack with 24px gaps; list rows 10–28px above and below with a hairline between; a source line follows its content at a 24–32px gap. Lines wrap only between whole items.
- **The leaf sprig** (two leaves, brand greens) appears only on covers and closings, growing from the top-right corner.
- **Illustrations** (the Amino Creative diagrams and other artwork drawn on white): the white becomes part of the layout, never a white rectangle floating on the green. A portrait or tall illustration takes a **white panel on the right third** (x 1280 to the slide edge, y 0 down to the footer band at 984; 40px leaf corner bottom-left only; a 6px lime edge on its left that fades out by 70% down; 56px padding all round). A landscape illustration that would be too small in a third keeps a **white box** (40px top-left, 8px bottom-left, bleeding off the right edge). A small diagram inside a panel sits on its own white card, and a panel that is mostly illustration goes white entirely. An illustration that was full-slide on the original stays **full-slide**: white ground, the artwork edge to edge, no footer band over it. Keep the artist’s credit that is drawn into the artwork, and note it in the speaker notes.
- **Photo panels**: the cover, section dividers and closing can carry the aerial plot photo the same way (the closing mirrors the cover, so a deck opens and closes on the same image), as a full-height right panel (from x 1184) with a dark fade on its inner side so the text beside it stays readable.

- **Slide-format limits** (the deck editor silently drops what breaks them, so a slide can look right in a browser preview and lose its colour in the deck): one gradient per background, optionally over a flat colour (a glow plus a gradient ground means two layered boxes, or the glow over the ground's middle colour); one border style and colour per element (an accent edge on one side means no hairline on the others).

## The product palette: five roles from the label

Sample the packaging shot (and the old slide, if it used the label colours) and fill five roles. Store them as `product-<code>-*` colour tokens so every deck's colour menu offers them. RDX-N is the worked example:

| Role | Token | RDX-N | Used for |
|---|---|---|---|
| Ground | `product-rdxn-ground` | `#36421f` | Slide background: a gentle 160° gradient from one step lighter (`#45542c`) to one step darker (`#2b351a`). The label's darkest strong colour. |
| Main accent | `product-rdxn-accent` | `#EDC445` | "When to Choose" heading, benefit icons, the footer product chip, panel and divider hairlines (as a tint) |
| Second accent | `product-rdxn-accent-2` | `#d9a54a` | Formula line, bullet dots, and the three "life" touches below |
| Card | `product-rdxn-card` | `#969656` | Benefit cards: fill at 18% opacity, border at 50% |
| Soft text | `product-rdxn-soft` | `#cfc79a` | Benefit descriptions, footer divider |
| Footer band | `product-rdxn-footer` | `#f3edd8` | Pale label cream behind the logo and address |

Fixed in every product: the promise sentence, headings and list text in `#f1eee6`, the address in `#5c5c2e` (or the darkest label colour that passes 4.5:1 on the footer band), dark text `#1a1a1a` on the accent chip.

Choosing them for a new product:
- **Ground** must hold `#f1eee6` at 7:1 or better and the main accent at 4.5:1. Darken the label colour until it does.
- **Main accent** is the label's brightest, most recognisable colour. It needs 4.5:1 on the ground; if the label's bright colour is too pale or too close to the ground, use the next most distinctive one.
- **Second accent** must differ from the main accent in lightness, not hue alone, and pass 4.5:1 on the ground (it sets 24px semibold text).
- No brand-lime and no brand-forest on product slides: those belong to the Redox brand itself (logo, cover and company slides).
- Until the website's product colours are confirmed, the label is the source of truth.

## The product slide

1920×1080. Same layout for every product, so only content and palette change.

- **Packaging shot** left (308×472 at 96, 56), never cropped (`object-fit: contain`).
- **Product block** beside it (from x 464): formula line in the second accent, eyebrow style, pipes between parts ("(0-0-3) | Patented botanical extracts"); then the **product's own logo** (white version, 122px tall, its box as wide as the logo's own proportions so it sits flush left, 450px at most; a wider logo keeps 450px and gets shorter, centred in the 122px slot), never its name typed out; then the promise sentence.
- **Promise sentence**: DM Sans 500 in white `#f1eee6` (never an accent colour), line-height 1.3, sized to its copy like the When to Choose items: measure the largest size (28 to 48px) at which it fits a 704×236 box (y 252 to 488), so it always ends at least 64px above the benefit row. It sits top-aligned under the logo; whatever is left below it is the breathing room. Keep product names whole (a word joiner after the hyphen in "RDX-N"). For reference: RDX-N sets at 40px, RDX-Flex at 37px. If it would need less than 28px, trim the copy.
- **Two or more formulations** (dry and flowable, say; TriPlex Zinc is the worked example): the formula line carries each analysis, pipes between ("Dry 25% Zn | Flowable (5-0-0) 4% Zn, S"); the promise sentence and a **formulations block** share one column that fills y 252 to 528 (the shared bottom edge), sized like the When to Choose items: measure the largest promise size (28 to 48px) whose wrapped height, plus the block at 24px (or 72% of the promise size, if larger) with at least 24px between them and 6px above and below each row, fits 276px; then spread what is left equally into that gap and the rows' top and bottom padding. The block: one row per formulation, its name in the eyebrow style and second accent (150px column; 230px when a label is as long as "Biostimulants"), its carriers in 24px soft text, an accent-tinted hairline above each row. Keep each item whole (non-breaking spaces inside "Protein hydrolysates", "Soluble potash 10%") so a wrapped line breaks only at a pipe and never leaves one word alone. Two formulations fit; three need the carriers trimmed to one line each. Carriers in sentence case. This is the one deliberate size difference between product slides: the smaller promise sentence makes room for the block. The same block carries a spec sheet (Analysis, Biostimulants; KaPstone). For reference: TriPlex Zinc sets at 33px with a 25px gap and 7px row padding; KaPstone at 32px, 28px and 10px.
- **A long formula line** (OsmoFlow is the worked example: four carriers, no analysis): it may run to two lines, each item kept whole (non-breaking spaces inside items and before each pipe, so a line ends on its pipe); the product logo then moves down (y 146) and the logo box keeps the logo's own proportions. The promise sentence stays in its box.
- **Icons with lettering** (OsmoFlow's pH icon): bake the letters into a transparent PNG in DM Sans; live SVG text falls back to whatever font the viewer has.
- **Not yet launched** (KaPstone is the worked example): until the analysis is published, the formula line slot holds a "Coming soon" chip instead (24px eyebrow style, dark text on the main accent, pill). Swap the chip for the formula line at launch; nothing else changes.
- **When to Choose** panel right (608×472 at 1216, 56), the slide's one leaf-cornered panel (40px top-left and bottom-right, 8px on the other two; padding 36px top, 48px sides, 32px bottom): ground-tinted glass, main-accent hairline border, heading 36px DM Serif Display in the main accent. **Holds 2 to 6 items**, and they always fill the panel: no dead space under the last item. Size the items to the content: measure the largest DM Sans size (24 to 40px, line height 1.25) at which every item, at 480px text width plus 8px above and below, fits the 345px under the heading, never breaking a word; then spread whatever height is left into each item's top and bottom padding equally. Each item is a row: a 12px second-accent dot centred on its first line, 20px gap, then the text; an accent-tinted hairline above each. For reference: three two-line items (RDX-N) set at 35px with 13px padding; four items with seven lines between them set at 32px with 8px. At 6 items keep each to one line (about 34 characters); at 4 or fewer, two lines each is fine. Short, no full stops.
- **Vertical rhythm**: every block keeps clear space below it. The promise sentence ends at least 64px above the benefit row (y 488 vs 552), the top band (packaging shot, product block, When to Choose) shares one bottom edge at y 528, and the benefit grid stretches to y 920 (two equal rows, each card’s content centred in it). Text never runs to the bottom of its area: if copy needs more room, it gets smaller, the area never grows.
- **Four benefits** in a 2×2 grid under both (from y 552 to 920, 16px gaps): card-colour cards at 24px radius, a 64px icon in the main accent, a two- or three-word Title Case name in 30px DM Serif Display, 8px above one plain line in 24px soft text, no closing full stop.
- **A touch of the second accent** (on every product slide, never more than these two): a soft bloom behind the packaging shot (radial, 24% at its centre, fading out by two-thirds; 420×520 at 40, 32, painted first so everything sits on it) and a warm glow in the When to Choose panel's bottom-right corner (radial, 16%, over the panel's glass colour, away from the text). Nothing else takes it: text, icons and cards keep their roles.
- **Footer band**: full-bleed, 96px tall at the bottom, in the footer band colour: `redox-logo-on-light-black.svg`, a hairline divider, the product chip (product code, uppercase, dark text on the main accent, pill), and on the right "130 South 100 West | Burley, ID 83318 | redoxgrows.com". No page number.

## Brand slides (the templates)

Slides about Redox rather than one product use the brand palette: `brand-forest` ground as a gentle 160° gradient (#2e4a34 → #253a2a → #1c2d20), `brand-lime` for eyebrows, numbers and dots, a soft lime glow in one corner, text `#f1f4ef` and soft text `#cdd8d0`, glass panels `rgba(14,22,17,0.45)` with `rgba(255,255,255,0.16)` hairlines. Footer band in `web-bg-surface` with no product chip. Every field to fill is in [brackets]; never invent a number or a name.

- **Cover**: white logo top left; eyebrow (audience, month), title 120px serif, one-line subtitle 40px, presenter under a hairline, stacked at 24px gaps from y 296; a 560×856 leaf panel on the right (a crop photo can replace its fill) with the leaf sprig at its top-right corner.
- **Section divider**: eyebrow "Section 02", title 96px serif, one-line description, stacked from y 392; a faint 400px "02" at 8% opacity right-aligned to the margin.
- **Agenda**: title "Agenda"; 3 to 6 rows of number (44px serif, lime), item (36px), time or owner (24px soft, right).
- **Key message**: the takeaway (44px) on the left with its source on a hairline at the bottom; a leaf panel on the right with 2 to 6 supporting points.
- **Comparison**: two cards, patterns B then A; the favoured one gets the lime label, lime border and glow. 2 to 5 points each.
- **Key numbers**: 2 to 4 cards, alternating patterns; a 128px lime figure, a hairline, metric name and what it's compared with; one source line under the row.
- **Product rates** (a table whose rows are products): one card per product instead of table rows, each in that product's label palette (ground gradient, second-accent labels, jug and white logo), on the light ground. The column labels (Rate, Timing and the rest) sit once, above the cards, in dark green caps; each card holds only the jug, the logo and the values in white at 48px, on the same fixed columns with a hairline between. The Redox Technology deck's Rates and Timing slide is the worked example.
- **Table**: the one light slide: white page, cream panel (24/6 leaf), `web-green-dark` table header row, a `web-green-pale` highlight row; up to 8 rows at 30px, numbers right-aligned, source under the table.
- **Closing**: mirrors the cover: white logo, "Thank You", the next step, contact rows under hairlines, the leaf sprig top right.

Text on any coloured fill passes 4.5:1: dark text on light fills, light text only on dark ones.

## Redox Result trial slides

A Redox Result (the two-page trial sheet with the RAM Technology lockup) becomes two slides: **Trial setup** and **Results**. They are a product's slides, so they take the tested product's label palette (the five `product-<code>-*` roles), but they are deliberately not product slides: no packaging shot, no When to Choose panel, no benefit cards. The reference build is the "RDX-Flex on Corn · Trial 304-26-L104" deck (November 2026). One slide set per trial; every value and every sentence comes from the approved Result, never invented.

### Shared to both slides

- **Ground**: the product's ground as a 160° gradient, one step lighter to one step darker (RDX-Flex: `#0b5260` → `#06404a` → `#04323a`). No brand-lime, no brand-forest.
- **Eyebrow** in the second accent, 24px DM Sans 600, 3px letter-spacing, uppercase, always ending in the trial number: "REDOX RESULT · TRIAL 304-26-L104" on Trial setup, "KEY OUTCOMES · TRIAL 304-26-L104" on Results.
- **Text**: headings and body `#f1eee6`; supporting text in the product's soft text; small labels in the main accent (fact labels) or second accent (eyebrows, "Rate", "Background").
- **Footer band** as on product slides (96px, the product's footer colour, `redox-logo-on-light-black.svg` at 56px tall, hairline divider, product chip), plus "Redox Result · Trial <number>" in the address colour after the chip; address on the right. Until the Redox Result / RAM Technology lockup is added to assets › Logos, it stays typed text.
- **Product names kept whole**: a word joiner after the hyphen ("RDX-⁠Flex") and in trial numbers.
- **Speaker notes** carry the sheet's Key Outcomes paragraph word for word, every chart value, anything left off the slide (an empty column, the blank Notes page) and any wording to check.

### Trial setup slide

- **Photo band**: the crop photo from the Result's banner, full bleed across the top (0 to y 200, `object-fit: cover`), fading into the ground over its last 112px (a gradient from transparent to the ground's lightest step). The one photograph in the set, and what sets these slides apart from product slides.
- **Left column** (x 96, 1040px wide): eyebrow at y 240; the crop illustration (assets › Crops, 104px) beside the product and crop as the title ("RDX-Flex on Corn", DM Serif Display 104px) at y 286; the research objective in 36px DM Sans 500 at y 432.
- **Fact grid** under it (from y 612): three columns by two rows, 32px gaps, each cell a 20%-accent hairline, a 24px uppercase label in the main accent and a 30px value: Who, Crop, irrigation, Previous crop, Where, Evaluated, Trial. Values as written on the sheet ("N/A" stays "N/A").
- **Treatments panel** right (608×680 at 1216, 240): the leaf panel of the product slide's When to Choose (40/8 corners, ground-tinted glass `#05363f`-style, 32% main-accent border, the second-accent glow in its bottom-right corner). Heading "Treatments" 36px DM Serif Display in the main accent; one row per treatment under a 20% hairline: name 30px 600, timing 26px soft text, then "Rate" in the second accent and the rate. Background sits at the panel's foot under its own hairline: "BACKGROUND" label, the sentence in 28px soft text.
- A column the sheet leaves empty for every treatment (lbs N on 304-26-L104) is dropped and noted.

### Results slide

- **Title** "Results Across Three Yield Measures" style (72px DM Serif Display, Title Case, at y 88; count the measures), then the first sentence of Key Outcomes in 30px soft text at y 192.
- **One card per chart** from y 312 to 888, 24px gaps, product card colour (fill 18%, border 50%), 24/6 leaf corners alternating patterns A, B, A; the last card carries the second-accent glow. Each card: metric name 36px DM Serif Display in the main accent; the change as a 112px DM Sans 700 figure with its unit in 32px soft text ("+9.4 bu/ac"); one 28px second-accent line ("↑ 5.7% over GS", or before → after when the metric is itself a percentage); then the bar chart.
- **Percentages of a percentage**: a change in a metric that is already a percentage is shown in points ("+10.0 pts", "34.17% → 44.17%"), and the sheet's own wording is flagged for sign-off in the notes rather than rewritten on the slide.
- **Bar charts**: always from zero, on the sheet's own axis maximum; value labels above each bar in 28px bold, treatment labels under the baseline in 24px soft text; baseline a 45% soft-text rule. **The Growers Standard (GS) bar is always gray `#6b6b6b` on every chart** (user's rule, November 2026); the treated bar is the product's main accent. Further treatments, when a trial has them, take neutral steps between the two, never a new hue.
- **How many cards**: one to three on one slide; four to six in two rows; more go to a second Results slide.
- **Source line** at y 916, 24px soft text: "Source: Redox Result trial <number>, <location>. <crop and irrigation>, <background>. Bars start at zero."

## Type

Headings and card titles in DM Serif Display (`web-display-sm`, `web-card-title`); everything else, the promise sentence included, in DM Sans; small labels in the `web-eyebrow` style. Nothing below 24px on a slide. No JetBrains Mono: that belongs to the dashboard.

## Converting an old 2027 slide

The 2027 decks (assets › Presentations and assets › Benefits) are reference only. To convert one:
1. Take its content into the product slide's structure: formula line, promise sentence, When to Choose items, the four benefits. Keep the sales team's wording; flag any benefit name over three words rather than rewriting it silently.
2. Lift the packaging shot and the product's white logo from the slide's images.
3. Sample the label for the five palette roles and add them as `product-<code>-*` tokens.
4. Recolour the benefit icons from `#91d500` to the product's main accent (full-colour originals replace them when supplied).
5. **Normalise every icon's framing** before upload: trim its viewBox to the drawing and pad it to a square with a 6% margin. Source files are cropped differently (some tight to the drawing, some on a padded 324 square), and untrimmed they show at visibly different sizes in the same 64px box.
6. Check against the existing product slides: same benefit wording as the source (including its commas), same border and hairline strengths (cards 50%, panel 32%, dividers 20%), same text widths, sentence case for everything that isn't a heading.

Don't carry over: the patterned background, the icon lime `#91d500`, white text on light boxes, the faint footer address, or the default Office theme underneath.

## Source slides: the one-to-one check

**Required whenever slides are supplied as source**: a PowerPoint, PDF or deck to bring in as it is, or one to convert into the Redox look. Every slide is checked against its source before the deck is handed over. Not a sample, not the ones that look risky: all of them. Slides that look like duplicates are compared pixel by pixel first; in the RAM Technology deck, three "identical" How it Works slides were the tree fruit, corn and turf versions of the artwork.

Why: in November 2026 the RAM Technology · The Nutrient Multiplier deck was handed over looking right in a preview and broken in the deck itself: panels overlapping, an address clipped on every slide, lists 250px out of place. It had to be fixed afterwards. This check is what would have caught it.

**1. Take every value from the file, not from a picture.** Read each slide's XML and its layout's: position and size of every shape, the text, font size, exact line spacing, text anchor (top, middle, bottom), any auto-shrink (`fontScale`), corner radii, fills and borders. On the 1920×1080 canvas, 1pt = 2px and 6350 EMU = 1px. Apply group transforms where a slide has groups.

**2. Build on those coordinates.** Pin each block where the source puts it. Don't re-flow a list into evenly spaced rows when the source spaces it differently. Wording, colours, order and artwork stay exactly as supplied; a conversion changes only what this section says to change.

**3. Size boxes the way the deck editor does.** In a deck, width and height leave out padding and border, so a 1920px footer band with 96px padding renders 2112px wide. Put `box-sizing:border-box` on every box with padding or a border whose edges come from the source.

**4. Preview with the deck's own rendering rules** (the Slides type's viewer base CSS), never a preview that adds resets of its own: a global `box-sizing` rule in the preview is what hid the November problem.

**5. Check every slide three ways, and fix until all three are clean:**
- **Edges**: no element past the slide's right or bottom edge, and nothing but the footer in the band below y 984.
- **Positions**: each source text box's top-left against where its text actually renders. Flag anything more than 12px out. Measure the text itself, not a padded box around it.
- **Side by side**: a render of the source next to the deck, for every slide, looked at in full.

**6. Report it in the handover**: how many slides were checked, what was fixed, and every deliberate difference with its reason (a title PowerPoint auto-shrinks, a line that breaks one word differently because of font metrics). No difference goes unmentioned.
