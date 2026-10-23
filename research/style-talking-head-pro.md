# Editing style breakdown: "talking head pro" (Nick Saraev) plus the Alex AI script formula

Purpose: a premium talking-head style for real recorded footage on 2 personal brands, Growth Sanj (Sanjana's account) and @koredekola, plus a script formula for freebies, open-source tools and AI news. We copy structure, layout, timing and motion rules only. Not their footage, faces, words, music, characters or branding.

Research date: 2026-10-23. Read-only, no login, no cookies, nothing liked, followed or commented. Built into `templates/talkhead` (render branch `talkhead` in scripts/render.mjs) and `.claude/skills/talkhead-reel/SKILL.md`.

## 1. Sources

| ID | URL | Account | Posted | Length | Likes / comments | Caption CTA |
|---|---|---|---|---|---|---|
| API | https://www.instagram.com/reel/DezZdo0Pf5r/ | @nick_saraev (Nick Saraev) | 2026-10-22 | 34.0 s | 376 / 409 | Comment ACCESS |
| PHONE | https://www.instagram.com/reel/De15bfEPMcP/ | @nick_saraev | 2026-10-23 | 33.5 s | 1,027 / 935 (under 1 day) | Comment GOOGLE |
| CRASH | https://www.instagram.com/reel/Dev2SG4jj03/ | @nocodealex (Alex AI) | 2026-10-21 | 26.9 s | 1,369 / 1,050 | Comment CRASH |

This time the first 2 really are Nick Saraev's own reels (uploader and channel fields both say nick_saraev). Comments run close to likes on all 3 (409 on 376, 935 on 1,027, 1,050 on 1,369): the comment-keyword CTA is doing the work, and the algorithm reads every keyword comment as engagement.

Method: ffprobe; ffmpeg scene detection at 0.15; 1 fps contact sheets of every second; 5 fps strips of the first 4 s (every 0.2 s); 2 fps strips of the full Nick reels to time layout changes; full-resolution stills for measurements; faster-whisper small with word timestamps (scripts/transcribe.py); EBU R128 loudness; 100 ms RMS distribution. Working files in /tmp/ref3 (not kept).

## 2. Specs

- All 3: 1080x1920, 30 fps, VP9, AAC 48 kHz. Integrated loudness -14.3 LUFS (both Nick reels) and -14.1 LUFS (CRASH).
- Lengths 27 to 34 s. Short, dense, 1 idea.
- Speech rate: API 3.8 words per second, PHONE 4.4, CRASH 4.3. First word at 0.00 s in all 3: no lead-in, no breath.
- Pauses over 0.3 s: API 3 (all inside a list of model names, max 0.38 s), PHONE 2 (0.30 s), CRASH 1 (0.34 s). Every gap is jump-cut out.
- Sound bed: no silence anywhere (silencedetect at -45 dB finds 0 gaps). Nick: 100 ms RMS p10 -26 dB, median -16 dB, so the bed sits about 10 dB under the voice and plays through the last frame. CRASH: p10 -20 dB, median -15 dB, so its bed is louder, about 5 dB under, as the video is a cartoon with no face.

## 3. Per-video breakdown

### API, @nick_saraev, "Every AI video model, one API" (34 s)

- Footage: 1 seated take, black hoodie, a podcast mic in frame below the chin, plain warm grey wall, soft key light from camera left, shot with lots of headroom so it can be reframed 3 ways.
- 3 layouts, hard cuts between them (scene cuts at 2.63, 7.07, 8.40, 9.47, 11.0, 14.40, 16.93, 17.70, 18.60, 19.77, 21.87, 25.70, 28.47):
  1. STACK (0 to 2.6, 7.0 to 8.4, 14.4 to 17.7, 21.9 to 25.7 s): a pale backdrop (cool off-white with a faint palm-leaf shadow) on the top half; Nick cut out of his background and sitting in a rounded grey card along the bottom, head popping above the card's top edge (person segmentation). Headline at the top, a media card in the middle, the caption word between the card and his head. His eyes sit at about y 1300.
  2. FULL (2.6 to 7.0, 9.5 to 14.4, 17.7 to 21.9, 25.7 to 29.5 s): his own footage, heavily blurred and darkened (warm brown mush) as a background, 1 large UI card centred (y 230 to 1250) with a 3 px lime border and a lime outer glow, caption under the card at about y 1400.
  3. CLOSE (8.4 to 9.5 "here's why", 29.5 to 34 s CTA): full-frame face, eyes at about y 650, face filling the width. Used twice: the turn line and the CTA.
- Face screen time: STACK about 45 in 100 of the runtime, CLOSE about 15 in 100, FULL (no face) about 40 in 100.
- Hook (0.2 s strip): frame 0 "Every" already written at the top, a blurred media card behind it. 0.2 s the headline "Every AI Video Model" is complete (words blur in left to right) and a lime box wipes in under it. 0.4 s "One API" lands in the box in bold italic serif, a lime-bordered video card shows a generated clip, the caption "Higgsfield" appears in lime italic serif under the card. The card swaps clips every 0.6 to 0.8 s (4 different generated shots in 2.6 s). 2.6 s hard cut to FULL: a dark card grid of 5 model tiles plus a "50+ MODELS" tile, each tile gets a lime highlight as its name is spoken (Genjutsu, Seedance, Kling, Soul).
- Media in the cards: real product UI (Higgsfield model grid, docs page with "Copy agent prompt" being clicked by a cursor, a terminal typing a Claude Code prompt and printing "connected · agent prompt · writing the script", a pipeline dashboard with "processing / completed" chips, a prompt box with a Generate button), plus the generated clips themselves. 1 pure white FULL scene (25.7 to 28.5 s) as a brightness reset.
- Accent: Higgsfield lime (about #D4F53C) for the title box, card borders, glows and every keyword.
- CTA (29.5 s): CLOSE, "so if you guys want to try this" in white, then "comment" in small white italic serif above a huge bold "“Access”" in lime with a strong glow, at about y 1650 to 1800 (over his chest). Spoken: "just comment access down below and I'll send you the cheapest API provider on the market right now."

### PHONE, @nick_saraev, "Let Claude Code use a real phone" (33.5 s)

- Same set, same 3 layouts. Timeline (2 fps strip): STACK 0 to 3.5, CLOSE 3.5 to 4.5 ("just like a human"), FULL 4.5 to 12.8, STACK 12.8 to 16.3, FULL 16.3 to 23.0, STACK 23.0 to 29.8, CLOSE 29.8 to 33.5 (CTA).
- Accent switched to Google blue (#1A73E8 class) for this video. Rule: the accent is the brand colour of the thing being covered.
- Hook: headline "Let Claude Code Use" plus a blue box "A Real Phone" (bold italic serif, white). Under it a Claude Code terminal typing "on my phone: drive SF to Oakland in Maps, then play Coldplay" next to a phone mockup that comes alive as the terminal prints "artemis · mobile_run_task (MCP) · Running on your phone", "tap Choose destination", "type Oakland". The demo plays in sync with the hook sentence.
- Proof beats: "99 in 100 success rate" (shown as a giant blue number over a benchmark leaderboard screenshot, the row highlighted), "13.8k stars" counter popping out of the GitHub repo page, "It's called Artemis" over the repo hero, a node diagram (Google logo, "Artemis MCP" pill, branches to Claude Code, Codex, Cursor, Antigravity, VS Code "+3 more") drawn on "plugs straight into Claude Code, Codex and all other coding agents".
- Every card is a real screenshot or a rebuilt UI of the real product: GitHub repo, README install section, task queue app, Google Maps on a phone.
- CTA: CLOSE, "comment" plus "“Google”" in green glow (#3DDC84 class), not the blue. Spoken: "just comment Google down below and I'll send you the link directly."

### CRASH, @nocodealex, "7 Claudes crash-test your idea" (27 s)

- Format: faceless. 100 in 100 3D animation in a toy style (blocky felt-textured robots, a blue go-kart labelled "YOUR IDEA", a test track at night with hazard stripes, a "DISASTER" sign, a moon). The camera never stops: dollies, orbits, crash slow-motion. Scene cuts every 1 to 2 s from 8 s on (cuts at 3.1, 8.3, 10.0, 10.7, 11.4, 12.0, 12.9, 13.9, 14.5, 15.3, 18.4, 19.9 to 21.6 every 0.33 s, 22.8, 24.6, 25.6).
- Section headline: a cream paper strip taped to the top of the frame (y 150 to 260), heavy condensed uppercase in 2 lines, swapped per section: "DESTROY YOUR IDEA BEFORE LAUNCH", "SHIPPED UNTESTED, CRASHED FOR REAL", "1 DRIVER, 6 ATTACKERS", "REAL-WORLD HITS, ON PURPOSE", "EVERY CRACK GETS WRITTEN UP", "PATCH IT, CRASH IT AGAIN", "ANY SIZE, SAME TEST", "GET THE CRASH LAB FREE". The headlines are a second script: read alone they tell the whole story.
- Captions: ransom-note style. Each word on its own torn orange paper tag (#E07050 class) with cream serif text, slight random rotation, 1 to 3 tags at a time, sitting low at about y 1350 to 1450.
- Data moments: a "×1" to "×7" counter badge as the 7 robots pile into the kart, a stat card "0 to 15 to 48 to 80 to 95" rolling up to "95 in 100 FAIL IN YEAR ONE" (on screen as a number with a sign), a terminal bar typing "/crash-test my-startup-idea.md" through the hook, "LIVE FIELD REPORT" chip, stamps "PRICING", "LEGAL", "NO MOAT", a green "BULLETPROOF" stamp, "SIDE HUSTLE" sign, a comment box "Add a comment… Post" at the CTA.
- The product is a free Claude Code command (a prompt pack), dressed up as a physical lab. The metaphor (crash test) is literal on screen for 27 s.

## 4. Cross-video patterns

### Captions (Nick)
- 1 to 3 words at a time, never a sentence. Each word blurs in (about 8 px blur to sharp, 3 to 4 frames) on its spoken onset.
- Body words: neutral grotesk bold (SF Pro Display / Inter class, weight 700 to 800), about 66 to 72 px at 1080 wide, sentence case. Black on the light STACK backdrop, white with a soft shadow on dark and on the face.
- Keywords (product names, numbers, verbs that matter, about 1 per 2 s): bold italic serif, about 80 to 90 px, in the accent colour with a glow of the same colour. Examples: "Higgsfield", "Seedance", "automations", "lethal", "controls", "consistency", "free", "real phone", "results", "Artemis", "13,000", "end-to-end", "MCP", "phone".
- Placement: under the media card (STACK about y 900, FULL about y 1400), on the chest in CLOSE (about y 1700). Ours sit higher (see 6), as our safe zone ends at y 1500.

### Headline
- Only in the hook (first 2.6 to 3.5 s), only on STACK. 2 lines: a plain bold line (about 68 px, black) and a payoff line in bold italic serif inside a solid accent box (about 84 px). It's the hook sentence compressed to 5 to 7 words: "Every AI Video Model / One API", "Let Claude Code Use / A Real Phone".

### Cards, overlays, transitions
- 1 card at a time, always real: product screenshots, the GitHub repo, the README, a phone recording, a terminal. Cards have a 3 px accent border with a soft accent glow (on dark) and rounded corners (about 24 px); phones are full device mockups.
- Inside a card the content keeps moving: terminal text typing, a cursor clicking, a highlight sweeping down a list, tiles lighting up on their names, clips cycling.
- Transitions: only hard cuts between layouts, about every 3 to 5 s, always on a phrase boundary. The incoming card scales in from about 0.92 with a blur, the old one is just gone. No whips, no wipes, no glitch.
- Zooms: the CLOSE layout is itself the punch-in (a cut from a small face in a card to a full-frame face). Inside CLOSE there's a slow push of about 1.03 to 1.05. Max 2 CLOSE moments per video: the turn line ("here's why", "just like a human") and the CTA.
- No emoji, no stickers, no memes, no logos floating around. The premium feel comes from restraint: 1 accent, 1 card, 1 to 3 words.

### Sound
- Voice compressed and loud, a low music bed about 10 dB under through the whole video including the CTA, cut at the last frame. Short soft whooshes and clicks on card entrances (inferred from the waveform transients on card cuts, not heard).

### Script (Nick)
Both Nick reels follow the same 7 beats in about 33 s:
1. News hook with a big name, a free or open thing, and what it lets YOUR tool do: "Google just open sourced a free AI tool that lets your Claude Code use a real phone, just like a human" (0 to 4.5 s).
2. Capability list of 3 to 4 verbs: "open apps, tap through screens, create accounts, change settings" (4.5 to 9 s).
3. Proof number: "a 99 in 100 success rate on all major benchmarks" (his wording uses the sign), "13,000 stars on Google's GitHub" (9 to 15 s).
4. Name reveal, late: "It's called Artemis" (12.8 s). The name only matters once you want it.
5. Use cases, "With it you can..." x3 (16 to 23 s).
6. Kicker: "Plus it comes with its own MCP server, so it plugs straight into Claude Code" and "completely free and open source" (23 to 29.5 s).
7. CTA, the same sentence both times: "So if you (guys) want to try this for yourselves, just comment KEYWORD down below and I'll send you the link directly." The keyword is the brand name or a single word (ACCESS, GOOGLE).

### Script (CRASH, @nocodealex), the freebie formula
1. "I built [a vivid named thing] where [N agents] [do something dramatic to YOUR stuff]" (0 to 3 s). The freebie is framed as a creation, not a prompt.
2. "That's because [scary stat about the problem]" (3 to 8 s).
3. Mechanism as roles: "one Claude acts as the crash driver and the other Claudes throw disasters at it" (8 to 12 s).
4. Variety list of 3 concrete examples: "a recession, a copycat, or a lawsuit" (12 to 15 s).
5. "And get this," then the output you receive: "each crash dummy reports every issue with your plan" (15 to 19 s).
6. Final role and the outcome: "a lead engineer agent tells you exactly what you need to fix so your real idea becomes bulletproof" (19 to 23 s).
7. Range of who it's for: "it works on any idea, from a side hustle to a full startup" (23 to 25 s).
8. CTA in 1 breath: "for the free link, comment CRASH" (25 to 27 s).
- The caption does the explaining (numbered steps 1 to 4, "The catch:" with honest limits, "Follow so the DM lands"), the video only sells the picture.

## 5. What to take, ranked

1. 3 layouts and hard cuts between them every 3 to 5 s (STACK, FULL, CLOSE). Face on screen about 60 in 100 of the time, but never the same framing for more than 5 s.
2. Every claim gets a real artifact on screen within half a second: the repo, the docs, the benchmark, a phone recording. Real beats illustrated.
3. Captions of 1 to 3 words with 1 accent-coloured italic serif keyword. Readable at a glance and expensive-looking.
4. A hook headline only for the first 3 s, in a 2-line plain plus accent-box format.
5. Accent colour = the brand being covered (config/brands.json), so each video looks new while the system stays the same.
6. CTA on the close-up, keyword huge and glowing, spoken in the exact same sentence every time.
7. Jump cuts so tight there's no breath anywhere, first word at frame 0.
8. For freebies (CRASH): name the free thing like a product, give it roles and a metaphor, a scary stat, and let the caption carry the details and the honest catch.

## 6. Our version (templates/talkhead), 1080x1920

- Input: a real recording (4K or 1080p, vertical or landscape, any fps, rotation metadata respected), `words.json` from scripts/transcribe.py, and render.json with the edit plan. ffmpeg cuts video and audio together from an EDL (pauses over 0.3 s trimmed to 0.16 s from the word timings, plus manual `cuts` for flubs), cut points snapped to a 30 fps grid so sound and picture lose exactly the same time, crops a 9:16 column around the face and writes frames at the output fps. Chromium only places those frames and draws the graphics.
- Layouts: `close` (full frame, eyes moved toward the upper third, y 640, as the zoom grows, never an exposed edge, head top never above y 230), `stack` (light backdrop in the accent tint with drifting leaf shadows, headline y 250 to 440, media card to y 780, caption at y 796, footage card from y 900 with eyes about y 1280), `full` (blurred, darkened footage, media card y 290 to 1150, caption at y 1190).
- Punch-ins on chosen words (`punches`), max 1.2, push (0.3 s) or cut. Tight footage: `frame.base` 0.75 to 1 insets the frame on its own blurred copy.
- Captions: Inter 800 70 px, 1 to 3 words, blur-in per word; keywords (`keys`) in Playfair Display italic 800 84 px in the accent colour with a glow. Close y 1300, full y 1190, stack y 796, all inside x 60 to 940 and y 230 to 1500.
- Media cards: `shot` (screenshot from scripts/shot.mjs, browser or phone chrome, slow scroll), `broll` (video clip, pre-extracted frames), `logos` (brand tiles from config/brands.json popping on their words), `text` (liquid glass card, `*word*` in accent serif), `stat` (counter rolling to the number). Pops: emoji, logo tile or glass text chip on a word.
- SFX from assets/sfx/kit: whoosh on every layout cut, pop on cards and pops, shutter on screenshots, tap on punch-ins, counter roll on stats, ding on the CTA keyword. Optional music bed ducked under the voice (mixAudio sidechain).
- CTA card on the close-up: "comment" in italic serif, the keyword huge with an accent glow, a glass handle pill with a Follow button (`handle`, default "@growthsanj", an assumption to confirm). With no keyword it shows the handle as a follow card.
- Deliberate differences from Nick: no person cutout yet (the head stays inside the stack card; a segmentation matte would be the next upgrade), captions higher (our thumb-zone rule), our brand rule of liquid glass on text cards and the CTA pill, no Content Systems.ai mark (personal brands).

## 7. 10 reusable script templates (about 30 s, 4 words per second, about 120 words)

Fill the blanks, keep numerals, keep 1 keyword. [KW] is the comment keyword.

1. **Open-source drop**: "[Big company] just open sourced a free [tool type] that lets your [Claude Code / ChatGPT] [do a human task], just like a human. It can [verb], [verb], [verb] and [verb]. It hit [number] on [benchmark], and it's already got [number] stars on GitHub. It's called [name]. With it you can [use case 1], [use case 2], or just [boring task you hate]. Plus it [plugs into tool you use]. And it's completely free. If you want to try it, comment [KW] and I'll send you the link."
2. **One API / all-in-one**: "Every [category] in 1 place. [Company] put [list of 3 names] behind a single [API / app]. Here's why that's a big deal. Your [agent] can now [step 1], [step 2] and [step 3] by itself. That's lethal if you [run X]. No more [annoying manual step]. Comment [KW] and I'll send you [the cheapest way to get it]."
3. **I built it (freebie)**: "I built a [named thing] where [number] [agents] [do dramatic thing] to your [idea / content / inbox]. That's because [stat about the pain]. 1 [agent] acts as [role], the others [role]. Each one [checks X, Y or Z]. And get this, you get [output] back. Then [final agent] tells you exactly [what to do]. Works for anything from [small case] to [big case]. For the free [link / file], comment [KW]."
4. **News plus what it means for you**: "[Company] just [shipped / changed] [thing], and almost nobody noticed the part that matters: [the detail]. Before this you had to [old pain]. Now [new way], in [time]. Here's what I'd do this week: [action 1], then [action 2]. If you want my [setup / prompt] for it, comment [KW]."
5. **Myth versus reality**: "Everyone says [common belief about tool]. It's wrong. [Proof: number, screenshot, test]. The real way is [counter-move]. I tested it on [concrete case] and [result]. Comment [KW] and I'll send you the exact [prompt / settings]."
6. **Setup checklist (series)**: "Section [n]: [topic]. Turn on [the right thing], and only the ones you [actually use]: [item], [item], [item]. Here's why: [consequence of doing it wrong]. And now it can [new capability], which means you can finally [outcome]. Comment [KW] for the full setup."
7. **Free versus paid**: "You're paying [price] a month for [tool]. [Free alternative] does [same job] for free. It's [open source / built by X], it has [number] stars, and it runs [locally / in your browser]. The catch: [honest limit]. If that's fine for you, comment [KW] and I'll send you the link."
8. **Hidden feature**: "There's a [feature] inside [tool] that [number] in 10 people never turn on. Click [where], then [what]. Now it [does what]. I use it to [real use case] and it saves me [time]. Comment [KW] and I'll send you my [template]."
9. **Before and after**: "This [task] used to take me [time]. Now it takes [time]. The difference is [tool or system] doing [step 1], [step 2] and [step 3] while I [do something else]. Here's the part that surprised me: [twist]. Comment [KW] and I'll send you the [workflow]."
10. **Stack of 3 free tools**: "3 free tools that replace [paid thing]. 1: [tool], it [does X]. 2: [tool], [does Y], [proof number]. 3: [tool], and this one's my favourite because [reason]. All free, all open source. Comment [KW] and I'll send you all 3 links."

## 8. What not to copy
- Their footage, faces, words, music, the RIP-style marks, their accent palettes as a set, the crash-test characters.
- Share signs on our media (house style): write "99 in 100" or show the number with a label.
- Celebrity or meme cutaways.
