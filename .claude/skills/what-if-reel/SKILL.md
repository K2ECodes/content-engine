---
name: what-if-reel
description: Make a "what would happen if..." timeline reel or carousel (Day 1, Day 3, Week 2, Month 1, Year 1) for Content Systems.ai or @koredekola, in 2 types: realistic (documentary, reach only) or gamified (pixel cast, funnels to a freebie). Renders via templates/story (video) and templates/pixel (carousel).
---

# What-if timeline reel

Read research/ig-inspiration-2026-10-24.md first. Make BOTH types across a week, in equal numbers.

## Pick the type (different purposes)
| | Realistic | Gamified |
|---|---|---|
| Purpose | Pure top of funnel, reach and follows | Personality + capture info |
| CTA | "Follow for part 2" or 1 question to comment on. NEVER an offer, keyword, freebie, workshop or pixel CTA card | Comment AI / SYSTEMS for an existing freebie (config/offers.json) |
| Look | Photoreal kie.ai nano-banana-2 stills (9:16, documentary prompt, no text/logos), `look: "cinema"` scenes with slow push-in, `stop: false`, `capStyle: "doc"` (italic serif subtitles, bulb hidden) | Stop-motion base, `stage` cards with a big emoji/sprite/brand icon, `rail` with a meter, cold-open gag, pixel scenes |
| Scene type | `hud` | `stage` (+ `word`, `cta`) |

## Realism rules (realistic type)
- Real, plausible outcomes only: economics, logistics, history, science. Each stage gets 1 specific number from a named source (Federal Reserve, UNCTAD, NHC, CFPB, Lloyd's List...) shown as `stat {label, value, count, source}`; sources with URLs go in copy.md Notes. Beats without data are framed as plausible, not as facts.
- Use real precedents ("we've seen a small version: the Ever Given, 6 days, $9.6B a day").
- Boring, true details beat spectacle (card declined, back to paper, orders by phone).
- Second person, calm documentary narration, short sentences. Stage words as anchors: Hour 1, Day 1, Day 3, Week 2, Month 1, Year 1.
- HUD per stage: `dots [n, total]`, `stage` (big), `place` (dateline in sentence case, e.g. "Coffee shop, 8:01 AM"; never an uppercase eyebrow), `stat`, `result` tag (`resultAt` word).
- End on a question or cliffhanger. Tasteful: no tragedy porn, no politics, no real people's faces.
- Personal (@koredekola) = Korede's voice, lip-synced face only at the hook and the ending (`heygen.mjs talk-segments`), no music. Company = Sanjana/Korede/narrator, `branded: true` end badge only.

## Gamified rules
- `stage {when, emoji|sprite|brand, title "with *accent*", sub, meter 0-100}` cards, `data.rail {meter: "AI in charge"}`. Personal reels: no music, `sfxGain 1.6`. Company: playful game music allowed.
- Carousel: templates/pixel, `card.kind: "stage"` (when badge, emoji, text), headline = the beat, paper-world cover with ? blocks labelled Day 1 / Week 1 / Month 1 / Year 1.
- Fun and warm, never mean (e.g. the Nigerian one is celebratory: jollof, greeting elders, Afrobeats, side hustles, Paystack, no wahala).

## Pipeline
1. Script (30 to 45 s). 2. Voice: `freeSpeech` (scripts/lib/heygen.mjs), say version with numbers spelled out. 3. `node scripts/tighten.mjs audio/vo-src.wav --out audio/vo.wav --beatBefore "Hour,Day,Week,Month,Year,Comment"`. 4. Transcribe, fix words to numerals. 5. render.json. Anchors are case-insensitive: use `Word#2` when the word appears earlier ("every level", "most people"). 6. Check stills: `STORY_SNAP=1.5,8,20 node scripts/render.mjs <post>` (no video). 7. Lint, then queue the full render.
Examples: content/2026-W46/ig-personal-mon-1230-what-if-ai-took-over (gamified), ig-personal-tue-1230-what-if-internet-down-30-days and ig-company-wed-1900-what-if-ships-stopped (realistic), ig-personal-sat-1100-what-if-10-nigerian (carousel).
