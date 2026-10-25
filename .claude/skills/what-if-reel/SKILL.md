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

## 3D hook (world3d, 2026-10-24)
Korede: no face on these videos (no AI lip-sync), and the first 2 s must not read as AI. Open on the low-poly 3D layer (templates/story/world3d.js, Three.js r128 vendored in templates/_base/vendor, seek-driven and deterministic):
- `data.world3d`: shared look. `kind: "globe"` (low-poly Earth: `pins` [{lat, lon, label, color, size, flag: "ng", delay}], `arcs` [[lat, lon, lat, lon, color]], `ships` + `seaRoutes`, `highlight` {box [lat0, lat1, lon0, lon1], color}, `palette`) or `kind: "city"` (low-poly city: windows, cars, traffic lights; `seed`, `palette`).
- `scene.w3d` on any scene (usually a `hud` scene for the stage text): the 3D layer shows behind it. Globe: `focus` {lat, lon}, `zoom` [from, to] camera distance (7 to 11 shows the whole Earth), `spin`, `lookY` (0.9 default keeps the globe under the captions), `showPins`, `showArcs`, `drawn`, `arcsOff` (0 to 1: lines go dead grey), `shipsMove` false (anchored), `labels`. City: `orbit`, `height`, `zoom` [from, to], `lightsOff` [from, to], `traffic`, `lightsWork`.
- Consecutive w3d scenes glide into each other; the layer fades over the next photo scene.
- Check with `STORY_SNAP=0.5,2,4 node scripts/render.mjs <post>`.

## Tone: realistic, not optimistic (Korede, 2026-10-25)
Reference: instagram.com/reel/Dex7yYdOtPo (115K likes, low-poly 3D "what if it grew 1 inch every day", 92 s).
- Follow the premise to its honest consequences, good AND bad. Most beats are inconvenient, embarrassing, expensive or dangerous. Never a feel-good ending by default.
- The comedy comes from deadpan realism applied to a crazy premise: "Day 34. Doctors have no explanation." "Uber bans you for life." "HR fires you for safety reasons." "$25 a ticket." "You're 107. Still single."
- Every stage: a counter that escalates (day/age + a measurable number) and a size/scale comparison ("longer than a school bus", "as long as a blue whale", "longer than the Burj Khalifa").
- Fast escalation: early beats days apart, then years. One short deadpan line per beat. End on a dry punchline, then "What should X next?" as the comment prompt.
- Visual: one consistent low-poly 3D character and world (template world3d / photoreal stills), same character every beat.

## Visual system (from the same reference, frames checked)
- Look: soft low-poly / blocky 3D (Roblox-meets-Pixar), warm natural light, shallow depth of field, gentle camera drift. One recurring hero character in a fixed outfit (red hoodie, grey joggers) so viewers track him; side characters same style (doctor, HR, scientists, crowd).
- Every beat is a NEW little set that acts out the line literally: bedroom, doctor's office with height chart, car that it doesn't fit in, farm, plane seat, office, then wide aerial shots as scale explodes (news vans, tents, highway, cows) for the late beats.
- Overlay (top-left, same position every beat): small caps "DAY 34 · AGE 18", huge serif number "2 ft 10 in", small caps comparison "LONGER THAN A BASEBALL BAT", tiny stat "WEIGHT 2.6 LB", red pill "+1 INCH EVERY DAY" (the rule of the premise, always visible).
- Narration line as large italic serif subtitle mid-left ("Day 34. Doctors have no explanation."), white with soft shadow; no caption boxes, no logos, no UI chrome.
- Camera: early beats close and intimate; scale grows with the number until drone/aerial shots; final beat back to an intimate shot for the punchline.
- How we build it: generate each beat's still with nano-banana-2 in a fixed low-poly style prompt + the same character reference image (first still becomes the reference for the rest), animate with slow push-in/parallax (or Kling image-to-video for 2 to 3 key beats if budget allows), overlay in templates/story `hud` with the serif number + small caps + red rule pill.
- Voice: Korede's own voice (HeyGen instant clone) on what-ifs and physics reels on every account (company may use Sanjana); never the ttsCreator narrator (Korede disliked it, 2026-10-25). Delivery must be interesting: storyteller energy, amused/incredulous, punchy, rising with the escalation; deadpan lives in the writing, not a flat voice.
- Hero: Korede himself as the stylised 3D character (from his real photos, recognisable, tall, fit, braids, studs), consistent across shots.
- Our spin (Korede, 2026-10-25): don't clone the reference look. Keep the mechanics, make it ours: warm ink-green and gold grade, cream serif number + Space Mono small caps + gold rule pill, our own hero (distinct face/outfit, signature item, Afro-Berlin vibe), more cinematic light and camera, SFX on every beat, tiny K2E end tag.

## Our spin: deadpan `wif` reels (2026-10-25)
Mechanics from the low-poly reference, our look: warm ink-green and gold grade, cream serif number (Fraunces 500), Space Mono small caps, gold rule pill, K2E end tag, SFX on each beat, one recurring Afro-Berlin hero (green bomber, gold chain).
- `data.capStyle: "wif"`: italic Fraunces narration mid-left, cream, key words gold.
- Scene `type: "wif"` with `look: "cinema"` + `bg` still: `when` ("Week 3"), `num` + optional `count` (counts up) + `unit`, `cmp` (scale comparison), `stat` (tiny line), `rule` (gold pill, the premise rule), `tag` ("K2E" on the last beat), `sfx`.
- Files per post: `beats.json` (lines, say, overlay, set description), `prompts.json` (one still per beat), `audio/say.txt`.
- Stills: `node --env-file=.env scripts/what-if-stills.mjs <post>` (first still is the hero reference for the rest; skips stills already done; refuses if over the weekly cap).
- Voice: Korede's HeyGen free instant clone (HEYGEN_INSTANT_VOICE_ID, deadpan, expressiveness 0.25; "Korayday" in TTS), tighten with `--beatBefore "Day,Week,Month,Year,What" --beat 0.5`.
- Examples: content/2026-W46/ig-personal-thu-2030-what-if-10-nigerian-deadpan, ig-personal-sat-2030-what-if-dollar-every-ai.

## Variant: "absurd physics + bait-and-switch ad" (ref instagram.com/reel/DdZC5ElxwpV, Middleton Ford, 587K likes, 37 s)
- Premise: "If you tried to pole vault over the Empire State Building..." Deadpan narrator explains what would REALLY happen (smash into it at ~20 ft), then the absurd engineering fix (2,000 ft pole, 4 ft thick, a giant slot dug in the road, run faster than a race car), then the payoff physics (hundreds of feet per second, fly across the country).
- Visual: game-engine 3D (GTA/Unreal look), bright daylight city, one hero, constant camera motion, red measurement callouts with brackets ("19 ft", "2,000 ft", "4 ft"), short white captions bottom-third, 1 to 3 words.
- The twist: he lands safely at the business ("...land safely at Middleton Ford, where you can drive away in your brand new F-150"). The ad is the punchline, so it reads as entertainment first. Caption tiny ("Looking for a truck?..."), #funny #viral.
- For us: company version lands at the point ("...and your invoice still arrives correct, because Content Systems.ai checked every line"), personal/.ai version lands at the freebie or a joke. Real physics numbers, deadpan voice, measurement callouts in our gold.

## Variant: "twice as X every time" exponential escalation (ref instagram.com/reel/De5O5VRxp3U)
- Premise: one action repeated, doubling each time ("shout twice as loud every time"). Counter "SHOUT #13", huge number "190 dB", small caps real-world comparison ("THE LOUDEST SOUND AIR CAN CARRY", "2x THE BIGGEST US BOMB", "40 MINUTES OF THE SUN"), energy stat, red rule pill "TWICE AS LOUD EVERY TIME".
- Escalates from street level (people turn around, eardrums rupture, windows shatter) to city (car alarms everywhere, the UN asks you to stop) to planet (pressure waves circle Earth, Earth cracks) to the Sun, then a hard cut to space: "0 dB. In space no one can hear you" + one-word comedic punchline in the hero's slang.
- Every beat is a real physics milestone (dB thresholds, TNT/Hiroshima/Krakatoa equivalents, sun output); camera pulls back with each doubling until we see the planet.
- For us: "Send twice as many cold emails every day", "AI agent doubles its tasks every hour", "deliver twice as many parcels every day" (company), "you get twice as rich every day" (koredekola; Nigerian angles only occasionally, not every time).

## Detail per beat (Korede, 2026-10-25)
Don't just say "Day 2" + one line. Each beat gets 2 to 3 short sentences: what happens (specific), a concrete detail or number that makes it real (who, where, how much), and the consequence or a joke beat. Example: not "Day 3. Visa queues." but "Day 3. The Nigerian embassy in London has a queue around 4 blocks. A man in a suit has been there since 5 AM with a cooler of jollof. He's selling plates for 12 pounds." Keep it punchy, still 45 to 70 s total, so use fewer, richer beats rather than many thin ones.

## Hook test (Korede, 2026-10-25)
The premise must be something people genuinely wonder about, phrased "What would happen if...". Bad: "How far could you throw a package from New York to LA?" (nobody asks that). Good: "What would happen if Black Friday lasted a whole year?", "What would happen if every warehouse worker quit tomorrow?"

## Real-video build (physics / doubling reels, 2026-10-25)
- Every shot is real motion: keyframes with `scripts/what-if-stills.mjs` (nano-banana-2; `refs` in prompts.json for Korede's likeness from assets/photos/korede/refs, `noref` for shots without him), then `node --env-file=.env scripts/what-if-clips.mjs <post>` (Kling V3 Turbo i2v, 720p, audio stripped, 1080x1920 30 fps into clips/cNN.mp4; $0.45 per 5 s, a shot's `"dur": "10"` doubles it). Check every clip for face/hand/physics glitches; redo with `--only N --force`.
- Edit in templates/story: `"capStyle": "phys"`, scenes `"type": "phys"` with `"bg": "clips/cNN.mp4"` (an .mp4 bg plays in sync instead of a push-in), gold bracket `callouts: [{ text, x, y, h, at }]` (at = word or seconds).
- Voice: Korede's (HeyGen `freeSpeech`, HEYGEN_INSTANT_VOICE_ID, expressiveness 1.0 tested livelier than 0.6) or the company voices per CLAUDE.md, never the ttsCreator narrator. Storyteller energy, a beat before the twist. Then tighten.mjs + transcribe.py, fix words.json.
- Script lines run longer than clips once beats are detailed: give long beats a 10 s clip, or stretch a 5 s clip up to ~1.5x with `setpts` + `minterpolate` (mci) to fit the scene.
