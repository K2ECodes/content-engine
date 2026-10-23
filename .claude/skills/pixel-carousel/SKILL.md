---
name: pixel-carousel
description: Make a Content Systems.ai carousel or static in the brand's 8-bit pixel-world style (platformer sky, pixel Korede and Sanjana, pixel bulb) with Albert Olgaard-style headlines, cards and handwritten notes. Use for every Instagram/LinkedIn carousel or static. Renders via templates/pixel.
---

# Pixel carousel

`render.json`: `{"template": "pixel", "data": {"handle": "@contentsystems.ai" | "@koredekola" | "Korede Kolawole" | "Content Systems.ai", "platform": "instagram" | "linkedin", "slides": [...]}}`. Always 4:5 (1080x1350). A static is a 1-slide carousel (output slide-01.png).

## Slide fields
- `world`: `day` (light-blue sky), `night` (navy + moon), `sunset` (orange to purple sky, city skyline, synthwave sun), `neon` (cyber city, cyan/pink). VARY IT: no 2 consecutive slides in the same world unless deliberate, and no 2 carousels in a row with the same cover world. Each world has its own headline palette.
- `headline`: array of 1 to 3 short lines, UPPERCASE renders automatically; wrap accent words in `*...*`. 2 lines ideal. `size`: omit (112px, max about 18 characters per line), `s` (92px, about 22), `xs` (76px, about 26). `underline: false` to drop the hand-drawn underline.
- `card` (optional, top y default 470; keep it between y 420 and 900): `{y, accent: true (orange border), title, kind, ...}`
  - `rows` {rows: [{k, v}]} spec sheet (k in orange)
  - `bars` {bars: [{label "1M", name "Gemini", value, hot}], foot}
  - `flow` {steps: [{h, p, hi}], foot} 2 to 3 boxes with arrows
  - `checks` {items: ["text with *accent*"]} up to 4
  - `quote` {text with [highlight], who: real source name, never a file path}
  - `code` {text with *gold* keyword} for prompts/skills
- `kw` {text, y}: giant pixel keyword box (use on CTA slides instead of a card if you want)
- `notes`: [{text "short\n2 lines", x, y, w, accent, arrow: {x1, y1, x2, y2, bend}}] Caveat handwritten aside, 2 to 6 words per line; arrow points at the card or a sprite. Keep notes in the sky above the grass (y 700 to 1000).
- `sprites`: [{name, x, h (260 to 300 for people, 90 to 150 for props), flip, y (only for floating props)}]. People stand on the grass automatically. Sprites in assets/pixel/sprites/: people korede-stand|point|shrug|cheer|laptop, sanjana-stand|point|shrug|cheer|laptop; cast robot (friendly AI), evil-robot (the problem / bad AI), cat, shopper, worker (warehouse, hard hat), boss (suit), box-monster (chaos, unbilled parcels), ghost (holding an invoice: ghost fees); props qblock, brick, bulb, bubble, coin, button, cursor, flag, laptop, chart, box, trophy. Company posts: Korede and/or Sanjana plus cast. Korede's personal posts: Korede plus cast (never Sanjana). Mix the cast: 2 to 3 characters + 0 to 2 props per slide, change characters and poses every slide; use evil-robot / box-monster / ghost for the problem and robot for the fix.
- `collage` (cover and end slides): [{src (local png in the post folder, e.g. shots/x.png from `node scripts/shot.mjs <url> shots/x.png --mobile --scroll 60`), x, y, w (300 to 460), h (crop height 300 to 420), pos (crop focus, default "50% 62%" = headline area of a mobile article shot), rot (-8 to 8)}]: taped, tilted real screenshots of the news, tweets or pages the post is about. 2 to 3 per cover. Credit sources in Notes.
- `bursts`: [{text "NEW" | "FREE" | "WTF" | "$200+\nPER ORDER", x, y, w (180 to 260), size (36 to 60), color, rot}]: max 2 burst colours per slide, picked from the world's palette or the featured brand's colour (no rainbow): meme starburst stickers. 2 to 3 on covers and CTA slides, 0 to 1 elsewhere.
- `cta` {keyword, y (300), line}: the big visible end CTA: giant pixel keyword box + Instagram comment bar with the keyword typed + "DM SENT" pill. Use on every lead post's last slide. For non-lead CTAs set keyword to the action ("LINK IN BIO", "SUN 11AM ET", "BOOK A CALL") and line to the detail.

## Structure
Covers and end slides must be LOUD and meme-style: collage of real screenshots + bursts + 2 to 3 characters + the headline. Cover (hook + collage) → 4 to 6 value slides (1 idea each, big headline, 1 card, 1 note) → solution slide (night) → CTA slide (night, "Comment *“KEYWORD”*" + what they get + "free, of course"). 6 to 9 slides.

## Check
`npm run render -- <post>` then LOOK at every slide: headline fits on its lines, card text doesn't wrap awkwardly, notes don't sit on sprites or the card, nothing covers the wordmark strip (y > 1108). `npm run lint -- <post>`. Copy rules from CLAUDE.md apply to every string.

Example: content/2026-W43/ig-company-fri-1130-next-customer-is-an-ai/
