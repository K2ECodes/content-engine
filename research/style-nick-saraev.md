# Editing style breakdown: the "Nick Saraev" reference reels

Purpose: work out why these reels feel more exciting than our static split-screen talking head, and turn that into a Content Systems.ai HTML/GSAP + FFmpeg template. We copy structure, layout, timing and motion rules only. Not their footage, faces, words, music, characters or branding.

Research date: 2026-10-23. Read-only access, no login, no cookies, nothing liked, followed or commented.

## 1. Sources, and an important correction

None of the 4 reels Korede sent were posted by @nick_saraev. yt-dlp metadata (uploader and channel fields) and the captions say:

| ID | URL | Account | Posted | Length | Likes / comments | Caption CTA |
|---|---|---|---|---|---|---|
| JOB | https://www.instagram.com/reel/DepEkkyicTR/ | @getripping (Ben Zogby) | 2026-10-18 | 72.3 s | 6,799 / 1,751 | Comment RIP |
| VIEWS | https://www.instagram.com/reel/Dex25GQj9Uz/ | @getripping (Ben Zogby) | 2026-10-22 | 116.3 s | 281 / 156 (1 day old) | Comment RIP |
| USERS | https://www.instagram.com/reel/Demyf2QE7X0/ | @getripping (Ben Zogby) | 2026-10-17 | 63.0 s | 6,068 / 1,781 | Comment RIP |
| GEMINI | https://www.instagram.com/reel/Deep_LvgITi/ | @albert.olgaard (Albert Olgaard) | 2026-10-14 | 39.2 s | 1,008 / 187 | Comment BOOKS |

So this is really a study of 2 styles: the @getripping "explainer machine" (3 reels, 100 percent motion graphics plus voiceover, no face at all) and the @albert.olgaard "split talking head plus graphics" (1 reel). Possibly Korede found them through Nick Saraev's orbit (shares, a course, a feed), but the files themselves are not his. The findings below still answer the brief, because these reels are exactly the "more visually exciting" end of the AI-business niche. If Korede wants Nick's own reels, he needs to send links from Nick's grid.

Profile: instagram.com/nick_saraev returned a login wall to curl and `require_login` from the public profile endpoint, so no grid and no top reels. A third-party tracker (CreatorDB, creatordb.app/creatorstats/nicksaraev, refreshed 2026-10-08) estimates about 697K Instagram followers and 535K on YouTube. That is an estimate, not a platform number.

Method: ffprobe; ffmpeg scene detection at 0.3, 0.15 and 0.08; 1 fps contact sheets of every second of all 4 reels; 5 fps strips of every hook (0 to 3 s); 10 fps strips of transitions; full-resolution stills for measurements; faster-whisper small with word timestamps; EBU R128 loudness; RMS of speech vs the pauses between words; spectrograms.

Reference contact sheets (frames only): `research/style-nick-saraev/`
- `getripping-sell-the-job_0-39s_1fps_light-dark-worlds.png`
- `getripping-million-views_0-39s_1fps_counters-funnels.png`
- `getripping-first-100-users_hook_0-3s_5fps.png`
- `albert-olgaard-gemini_0-39s_1fps_split-talking-head.png`

## 2. Specs

- All 4: 1080x1920, 30 fps, VP9 video, AAC 48 kHz stereo, integrated loudness exactly -14.1 LUFS on all 4, loudness range 1.2 to 2.1 LU (heavily compressed, flat), true peaks -1.4 to -2.4 dBFS.
- Lengths 39 to 116 s. The @getripping reels run 63 to 116 s, which is long for a reel; the motion carries the length.

## 3. Per-video breakdown

### JOB, @getripping, "Stop selling AI tools. Sell the job" (72 s)

- Format: 100 percent motion graphics, voiceover only, no face, no stock, no B-roll. 293 words at 4.1 words per second with not a single pause over 0.35 s in 72 s. Either a very tight edit of a read, or an AI voice. Treat it as studio VO.
- Two "worlds" alternating with hard cuts: a dark world (near-black `#0B0B0B` with a faint 90 px grid, a soft spotlight cone falling from the top, floating dust particles) and a light world (off-white `#F3F3F0` with the same faint grid). 18 world flips in 72 s (scene cuts at 4.37, 7.53, 10.43, 14.33, 16.33, 19.40, 27.63, 30.13, 37.17, 38.67, 50.03, 52.80, 55.03, 57.50, 61.53, 66.23, 67.53), so the background changes every 4 s on average. One accent colour for the whole video: mint/teal green, used for chips, glows, highlight boxes and data.
- Hook (0 to 3 s, frame by frame at 0.2 s): frame 0 is a blurred 3D server rack that racks into focus by 0.2 s while the first word "The" is already spoken. 0.4 s: a paper price tag "trillion-dollar" swings in from the top right, rotated about 30 deg, and settles with a spring by 0.8 s. 1.6 s: a glowing pill "software company" slides in and a teal circuit line draws down the rack. 1.8 s: a terminal panel under the rack starts printing "agent · screened 212 applicants", "drafted Elm St contract", "filed 9 permits" with green DONE badges. 2.4 s: a big green "HELLO my name is" sticker slaps onto the rack with a curled corner, and on "services firm" a pen writes the words onto it (3.2 s). A new visual event every 0.4 to 0.8 s in the first 3 s.
- Beat map: hook claim (0 to 4) / "you're building the version that loses", git-branch diagram where your branch gets an orange "loses" pill (4 to 8) / authority, a Sequoia web page in a browser card with "JULIEN BEK" highlighted and a red "prediction" tag struck through (8 to 10) / compass needle swinging from software to services on "backwards" (10 to 11) / "20 years" in split-flap digits plus a founders table filling row by row (12 to 14) / grid of dots multiplying for "software scales", a services floor plan with people for "services don't" (14 to 16) / list of AI tools as cards with a cursor hovering each (19 to 27) / "Companies don't want tools" with "tools" struck in red (28 to 29) / screen candidates crossed out, "best candidates" cards (30 to 34) / "DRAFTED" rubber stamp on a contract (36) / job checklist ticking DONE line by line with a giant "DONE" stamp (37 to 38) / Sequoia quote, coin stacks growing 1 vs 6 with a giant "6" (40 to 42) / money flowing through pipes into a jar labelled "job" (43 to 44) / numbered steps 1, 2, 3 each with a UI card and a cursor clicking (45 to 58) / "STOP" stamps over a $50 per seat pricing card (50 to 52) / price tags on a hanging scale, "service" outweighs "software" (58 to 59) / phone mockup with a HELLO sticker reading "agency" (60 to 61) / two spheres, services budget swelling "six-times-bigger market" (62 to 63) / cockpit dashboard, a finger taps "autopilot", "copilot" gets a red slash (64 to 65) / MRR chart climbing (66 to 67) / CTA (68 to 72).
- CTA: giant neon "RIP" in a glowing outlined box with Figma-style corner handles, a comment box typing "RIP", then a chat card "the tool, short-form engine" with "open the tool" button, a chart line drawing around it. Ends on the CTA graphic.

### VIEWS, @getripping, "How much money do 1 million views make" (116 s)

- Same engine and same two worlds, accent switched to electric cyan. 23 world flips at threshold 0.3.
- Hook: frame 0 is a dark "REEL VIEWS · LIVE" card with an odometer reading 5,977,093 that rolls down to exactly 1,000,000 by 0.8 s, landing on the spoken "one million" at 1.0 s with a cyan glow pulse; underneath, a revenue dashboard with a big "money ?" tile. 2.6 s: a "vibe-coded app" chip pops in on the word.
- Body: built entirely from a repeated data kit: odometer counters, bell curves with red "Low", cyan "Average", outlined "High" markers that drop in one at a time as each rate is spoken (20 to 22 s, 31 to 34 s, 43 to 45 s), a calculator panel where the numbers are typed in and the "=" key presses, then a thermal receipt printer spits out the result ("10,000 profile visits", "2,100 landing page", "63 new subscribers"), 3D glass funnels with particles falling through and leaking out (26 to 29 s, 80 to 85 s), a "STEP 1/2/3/4" tracker bar across the top, a "NO FREE TRIAL" red stamp (12 s), a red "not" scribble over $3,150 (56 s), a red "VERDICT" stamp (71 s), a growing MRR table to "$180,000" (41 to 44 s).
- Structure: question hook, "we studied 2,000 apps", 4 numbered steps each with low/average/high, the result ($3,150), the twist ("not the whole story", trust takes 5 videos), the verdict, the range ($250 vs $18,000), CTA "comment RIP" with the RIP neon box and "$7M" then "$8M a year" counting up.
- Pacing: 3.5 words per second, 5 pauses over 0.35 s (max 0.5 s).

### USERS, @getripping, "Steal 100 users from your competitor" (63 s)

- Same engine, accent violet. 11 world flips at 0.3.
- Hook (frame by frame): 0 to 1.0 s a flat vector stick figure with a violet headband sprints on a treadmill, a speed dial creeps up, a progress track with a chequered finish flag runs across the top. 1.2 s on "weekend" the dial goes red and he is flung off the back with a red impact flash, motion smear and speed lines; 1.6 to 2.4 s his shoe flies off, smoke puffs, the belt glows red-hot. 2.6 s a blurred giant violet "100" racks into focus by 2.8 s with "100 users" boxed. It is a 2.5 s cartoon gag that literally acts out "anyone can build an app in a weekend".
- Body: phone feed mockups scrolling past a review card ("you scrolled right past it"), launch card with 3 likes, "one from your mom" heart pill, ad dashboard counting $168 to $400 with 2 bots, crickets crawling across an empty analytics chart (19 s), a 1:00 AM lock screen (21 s), cartoon eyes peeking for "stalk" (22 s), competitor "50,000 users" with a "10x" team chip, a skyscraper of features towering over a tiny building (27 to 28 s), 1-star review wall with angry emoji faces and a "FURIOUS" stamp (33 s), review quotes highlighted one at a time, a grid of 100 avatar seats filling (39 to 41 s), steps tracker COLLECT / FILM / DM / FIRST 100, a "STOLEN" stamp over the full grid at 57 s, a 24 h clock showing "20 min" for the CTA.
- Pacing: 4.1 words per second, 1 pause over 0.35 s.

### GEMINI, @albert.olgaard, "Did Google just kill Claude" (39 s)

- Format: the one reel with a face. Selfie camera, one take with a few jump cuts, eye level, office chair, holding a DJI lav mic with a grey furry windscreen in shot. Tight crop: face fills the width.
- Layout: split screen, top 45 in 100 of the frame (y 0 to about 858) is a flat warm off-white canvas `#F0EEEA` carrying screenshots and charts; bottom (y 858 to 1920) is his face. Captions sit on the seam. About 1 in 3 seconds the face disappears and the graphic goes full screen (6 to 10 s, 14 to 17 s, 19 to 20 s, 23 to 24 s, 28 to 31 s).
- Hook (frame by frame): 0 to 0.6 s a glossy 3D hydraulic press hovers over the orange Claude app icon, a Google "G" icon next to a red button. 0.8 s on "Claude" the press slams down and crushes the icon flat (the word "Claude" in big italic serif). 1.0 to 1.2 s a brushed-steel shutter with a yellow/black hazard stripe slams down over the frame and lifts again, a physical wipe transition. 1.4 to 2.6 s the Gemini icon slides in on a shelf, the flattened Claude icon lying beside it. 2.8 s cut to his face for the first time, under two side-by-side chat windows both stopping at "max_tokens".
- Body: real product screenshots rebuilt as clean cards (pricing table with "128K tokens" highlighted by a cursor click at 7 s), a bar chart where Gemini's bar shoots up to 1,000,000 with odometer digits (9 to 12 s), a meme cutaway of a well-known actor's shocked face at 13 s on "to put that into perspective", a paragraph where every token is colour-highlighted to show what a token is (14 to 17 s), benchmark leaderboards with bars growing and the winner boxed (21 to 31 s), a talk-show host laughing meme at 27 s on "my favourite thing", a talk-show "you get a car" meme at 35 s on "it's completely free", a comment-box mockup typing "BOOKS" for the CTA (37 to 38 s).
- Captions: two systems. On the split layout, small mono uppercase chips on the seam, 2 to 3 words ("A MASSIVE ISSUE", "FRONTIER MODELS", "IT'S REALLY GOOD"), white on a charcoal `#292926` box, about 56 px, square corners. When the graphic is full screen, one big word or short phrase centred under the graphic at about y 1000: bold sans about 60 px, with the keyword swapped to a large italic serif ("Claude", "128K", "Gemini 4 model", "over Opus") and green for the payoff ("1M", "750K", "much cheaper").
- Pacing: 3.4 words per second.

## 4. Cross-video patterns

### Captions (the @getripping system, the strongest one)
- Placement: top centre, not bottom. First line baseline about y 320 (one sixth of the height), 1 or 2 lines, max about 8 words on screen, the graphic lives under it.
- Font: neutral grotesk (SF Pro Display / Inter class), semibold, about 64 to 72 px at 1080 wide, sentence case, tight tracking.
- Build: additive, word by word, each word on screen within a frame of being spoken. Each new word enters from blur (about 8 px) and zero opacity with a few px of upward drift, sharp in about 150 ms. The newest word is bright white (on dark) or near-black (on light); older words drop to mid-grey. Phrase clears at a sentence boundary with a blur-out.
- Keyword treatment, 1 per line at most: a selection box with a 2 to 3 px accent stroke, a 15 to 20 in 100 tint of the accent behind the word, and two small accent dots on opposite corners (looks like a Figma selection). About every 2 to 4 s.
- Inline emoji before nouns (money bag, theatre masks, chart, calendar, clapper), about 1 per 8 to 10 s.
- Red strike-through on the negated word ("tools", "copilot", "reviews", "screen candidates").

### Graphics
- Every noun or number in the script becomes an object on screen within 0.3 s of being said. New element every 0.8 to 1.2 s; new composition every 3 to 5 s; world flip (dark to light) every 4 to 6 s.
- Objects are rendered as glossy "product UI" cards: rounded 20 to 28 px corners, 1 px light border, soft drop shadow on light, inner glow and a coloured edge light on dark; mono labels in small caps inside cards (dashboards, terminals, receipts, browser windows, phones, calculators). Every card carries a tiny "Values illustrative" footnote; real claims carry "SOURCE · sequoiacap.com".
- A recurring kit: odometer/split-flap counters, bell curves with low/average/high markers, funnels with particles, receipts printing, checklists ticking, stamps (STOP, DRAFTED, DONE, NO FREE TRIAL, STOLEN, VERDICT, FURIOUS) slamming in at about -6 to -10 deg with a scale overshoot, cursors and a pointing hand clicking buttons, a step tracker across the top, grids of avatars or dots filling.
- Visual metaphors acted out as small 3D or vector gags: price tag swinging, name sticker slapping on, compass needle swinging, coins stacking, money in pipes, scales weighing tags, a press crushing a logo, a man flung off a treadmill, crickets walking across a chart.
- Card entrances: scale from 0.92 to 1.0 plus blur 12 px to 0 plus opacity, 250 to 350 ms, soft overshoot; often a rack-focus feel (the whole new scene starts defocused for 2 to 3 frames, see VIEWS 8.5 s). Exits: blur out or hard cut on the world flip.
- Camera: no shake, no whips. Slow pushes on some scenes (cards visibly larger 2 s later in VIEWS 9 to 13 s), plus parallax between caption, card and background grid.

### Sound (measured, not heard)
- All at -14.1 LUFS. In the gaps between words the level only falls about 7 to 8 dB (speech about -13.7 dBFS, gaps -20 to -22 dBFS on @getripping, -17.8 on GEMINI), so there is a continuous bed under the voice. The spectrogram shows a steady low band around 100 to 250 Hz through every pause: a sustained low synth pad or drone, not a beat-driven track.
- Short broadband transients sit on graphic events (for example a high whoosh at 1.7 s in JOB when the pill slides in, a tonal chime cluster at 4.0 s before the first world flip, low hits on the press slam at 0.8 to 1.0 s in GEMINI). So: UI clicks, whooshes, stamps and impacts on most visual events, a bed under everything, the voice compressed flat on top.
- The tail after the last word drops to about -50 to -60 dBFS within 0.5 s: everything cuts dead, so the loop restarts cleanly.

### Script
- 3.4 to 4.1 words per second, almost no pauses. Hooks are a question or a bold claim with a number or a rival ("the next trillion-dollar company", "1 million views", "first 100 users", "did Google just kill Claude").
- Authority early (Sequoia partner, "we studied 2,000 apps"), then numbered steps, a twist ("but hold on"), a crisp verdict line ("Sell the autopilot, not the copilot"), and a comment-keyword CTA that names a free thing.
- Every line is concrete and picturable, which is what makes the per-noun graphics possible.

## 5. Why these beat a static split-screen talking head, ranked by impact

1. Every noun is illustrated. The picture changes on the word, about once a second, so the eye never has nothing new to read. Our split-screen holds 1 card for several sentences.
2. A visual gag in the first 1.5 s. A man flung off a treadmill, a logo crushed by a press, an odometer rolling to a million. Motion plus a joke beats a face saying the hook.
3. Captions as the headline, at the top, building word by word with blur-in, a grey trail and one boxed keyword. The text itself is animated and reads like a designed title, not subtitles.
4. World flips. Dark to light every 4 to 6 s resets attention with a full-frame brightness change, without needing a new layout.
5. Physical, tactile objects: stamps, stickers, receipts, scales, coins, presses. They have weight and overshoot, so they feel like events.
6. Numbers that move: odometers, counters, bars and calculators that land exactly on the spoken figure.
7. Cursor and finger interactions inside UI cards. Watching a click happen implies a real product and a real result.
8. Sound on the picture: a constant bed plus a click, whoosh or thud on most visual events.
9. For the face version (GEMINI): the face is a minority of the screen time, it disappears for full-screen graphics on key claims, and pop-culture reaction cutaways land on emotional lines.
10. Polish signals: tiny source and "Values illustrative" footnotes, mono labels, consistent single accent colour, grid background. It reads as expensive and trustworthy.

## 6. Recreate it: template spec (1080x1920, 30 fps)

House rules apply throughout: no eyebrow labels above headlines, no kickers or series labels, never print the post type, pillar or execution on screen. Small labels inside UI cards (column headers, "MRR", file names) are content, not eyebrows, and are fine. No percent signs in on-screen prose: write "4 in 10".

### Two worlds in our palette
| Theirs | Ours, dark world | Ours, light world |
|---|---|---|
| Background `#0B0B0B` / `#F3F3F0` | Ink-green `#17281C`, 1 px grid lines in cream at 0.05 opacity every 90 px, a top spotlight cone (radial gradient, cream at 0.07 opacity) and 20 to 30 slow drifting gold dust dots at 0.3 opacity | Cream `#F5F0E8`, grid in ink-green at 0.06 opacity |
| Single accent (teal, cyan, violet) | Gold `#E8B84B` for highlights, glows, chips, counters | Orange `#C98A3C` for highlights and data, gold for small glints |
| Alarm red stamps and strikes | Orange `#C98A3C` on dark | Orange `#C98A3C` |
| Positive green (DONE, payoff) | Sage `#9CCAA0` | Sage `#9CCAA0` with ink text |
| Cards | `#1F3426` fill, 1 px sage border at 0.25 opacity, 24 px radius, inner glow 0 0 40px gold at 0.08 | White `#FFFFFF` fill, 1 px ink-green border at 0.12 opacity, 24 px radius, shadow 0 24px 60px rgba(23,40,28,.12) |

Flip world on a sentence boundary every 4 to 6 s with a hard cut (`gsap.set`), plus a 2 frame rack focus on the incoming scene (`filter: blur(10px)` to 0 over 0.1 s).

### Captions
- Rajdhani 700, 72 px, sentence case, letter-spacing 0, line-height 1.05, centred, first baseline y 320, max width 940 px, max 2 lines and about 8 words.
- Word reveal at `word.start - 0.03 s`: from `{opacity:0, filter:'blur(8px)', y:-8}` to `{opacity:1, filter:'blur(0)', y:0}`, 0.15 s, `power2.out`.
- Active word cream `#F5F0E8` on dark / ink `#17281C` on light; previous words drop to 0.45 opacity over 0.2 s.
- Clear at a sentence end or when 2 lines are full: whole block `blur(6px)` plus opacity 0 plus `y:-12`, 0.18 s.
- Keyword box (1 every 2 to 4 s, on the money word, number or verb): 3 px stroke in gold (dark) or orange (light), fill the same colour at 0.18 opacity, 10 px padding, radius 4 px, two 10 px dots on top-left and bottom-right corners; stroke draws in 0.2 s as the word lands.
- Negation: an orange 6 px strike line draws across the word in 0.2 s, word drops to 0.4 opacity.
- Emoji: allowed 1 per 8 to 10 s inline before a noun; keep it to calm ones (chart, calendar, clock, money bag) to match the brand tone.

### Graphic kit (build once, reuse)
- UI card in/out: `scale 0.92 to 1, blur 12 to 0, opacity 0 to 1`, 0.3 s, `back.out(1.4)`.
- Odometer counter: per-digit vertical roll, 0.6 to 0.9 s, `power3.out`, last digit lands on the spoken number. JetBrains Mono 700, 120 to 200 px, in a dark display panel.
- Stamp: Orbitron 800 or Rajdhani 700 uppercase inside a 6 px rough border, rotate -8 deg, from `scale 1.6, opacity 0` to `scale 1`, 0.12 s `power4.in`, then a 2 frame 6 px shake of the card underneath. Words: DONE, BILLED, SENT, FIXED, MISSED. Max 2 per video.
- Checklist ticking one row per spoken item, sage tick draws in 0.2 s.
- Bell curve or bar chart with low/average/high markers dropping in one per spoken value.
- Receipt printer: a paper strip feeding out at 300 px per s with JetBrains Mono line items, the total printed last. Perfect for invoices, unbilled fees and 3PL billing stories.
- Cursor (macOS arrow, 48 px) moving on a bezier path over 0.5 s and clicking (scale 0.85 then back, 0.1 s), with a ripple ring in gold.
- Step tracker: 4 dots on a line across y 200 to 240 with short content words (not category labels), the active dot glowing.
- Source footnote: Space Mono 400, 20 px, 0.55 opacity, bottom-right of the card; add "Illustrative" on any non-proof-bank number. Use only proof bank numbers as real results.
- Metaphor gags: 1 per video in the hook, from a reusable library we build: a pallet stack collapsing, a forklift, an invoice printer jamming, a stamp on a parcel, a phone buzzing with WISMO messages. These are kie.ai stills cut out and animated (see below), or simple SVG.

### Pacing rules
- A new on-screen element every 0.8 to 1.2 s, tied to the word onset of the noun or number it shows.
- A new composition every 3 to 5 s; a world flip every 4 to 6 s.
- First visual event at frame 0 (scene already moving, first word already on screen); a second event by 0.5 s; the hook gag pays off by 1.5 s.
- Slow push on every composition: whole scene `scale 1.00 to 1.04` over its life, `ease: none`.

### Editing a HeyGen avatar take to look like this

The avatar take is clean, one shot, plain background, so we fake the "edit" around it. Target: face on screen 40 to 60 in 100 of the runtime (GEMINI sits about 65; the @getripping reels prove 0 also works).

1. Layouts per beat (decide from the transcript):
   - A. Full-frame face, cropped to 1080x1920 with the eyes at y 760. Use for the first spoken line after the hook gag and for the CTA, max 3 s at a time.
   - B. Split: graphic canvas y 0 to 860, face plate y 860 to 1920 cropped so the eyes sit at y 1250 to 1300. Captions switch to the seam chip style: JetBrains Mono 700, 52 px, uppercase, cream on ink-green `#17281C` box, 76 px tall, square corners, centred on y 860.
   - C. Full-screen graphic, face gone. Use on every number, every step, every negation. About 1 in 3 seconds.
   - D. Picture in picture: face in a 300x300 rounded square (radius 40 px, 3 px gold border) at bottom-right over a full-screen graphic, for 2 to 4 s when he reacts to something on screen.
2. Punch-in schedule on the face plate (fakes a two-camera shoot): alternate wide (scale 1.00) and close (scale 1.18 to 1.25, re-centred on the eyes) on every sentence boundary or every 2.5 to 4 s, whichever comes first, as a hard cut. On emphasis words add a fast push of 1.00 to 1.08 over 0.25 s `power2.out`, max 1 every 6 s. Never two closes in a row. Mirror nothing (logos, text in background).
3. Cut out the avatar's pauses: HeyGen leaves breaths; trim any gap over 0.25 s to 0.08 s and cover each trim with a punch-in change or a layout change so it never reads as a jump cut. Target 3.8 to 4.1 words per second after trimming.
4. Background: replace the plain HeyGen background (export on green or use a matte) with our dark-world canvas (ink-green, grid, spotlight) so the face and graphics share one world. Add a gold rim light: `drop-shadow(0 0 30px rgba(232,184,75,.25))` on the matte edge.
5. Cutaways (instead of pop-culture memes, which carry rights risk and do not fit the calm tone):
   - kie.ai stills, then image-to-video 3 to 5 s clips: warehouse aisles, pallets, a packing bench, a dock door at dawn, a laptop with an invoice, hands on a scanner. Graded to our palette (lift blacks toward `#17281C`, warm highlights toward `#F5F0E8`). One cutaway per 10 to 15 s, 1.5 to 3 s each, always on a concrete noun in the script.
   - Screen captures of real product (Claude Code, our dashboards) inside a UI card frame with a cursor overlay, never raw full screen.
   - Reaction cutaway alternative: a 1 s insert of Korede's own avatar in a different crop and a different background (a second HeyGen take with a raised-eyebrow or nod), used on the twist line.
6. Hook option without the face: open on a 1.5 s metaphor gag (example: a stack of unbilled storage invoices falling into a shredder, a counter rolling up "$48,000 unbilled"), then cut to layout B on the first full sentence.

### Audio
- VO (HeyGen voice) compressed to an LRA under 2 LU, mixed to -14 LUFS integrated, peaks -1.5 dBTP.
- Bed: a low warm synth pad or slow minimal pulse, about 8 dB under the voice in the pauses (about -22 LUFS short-term), no drums, cut dead on the last word.
- SFX on most visual events, short and dry, -16 to -20 dB under the voice: soft UI tick on each card in, a short airy whoosh on world flips and layout changes, a mechanical roll on odometers, a printer chatter under receipts, a dull thud on stamps, a mouse click on cursor clicks, a low hit on the hook gag. No risers, no bass drops.

### Beat template (45 to 75 s)
| Time | Script | Picture |
|---|---|---|
| 0 to 2 s | Claim or question with a number or rival | Metaphor gag, caption building at top |
| 2 to 8 s | Why it matters, "if you're doing X, you're losing Y" | Layout B, first UI card, keyword box |
| 8 to 12 s | Authority or proof (proof bank only) | Source card with footnote, counter landing on the number |
| 12 to 45 s | 3 or 4 numbered steps | Layout C per step, step tracker, cursor clicks, receipt or checklist |
| 45 to 55 s | Twist and verdict line | World flip, stamp, face back full frame for the verdict |
| last 6 to 8 s | Comment-keyword CTA, say it is free | Keyword in a huge Orbitron 800 box with a gold glow and corner handles, comment box typing it, a DM card "sent" |

### What not to copy
- Their stock "Values illustrative" numbers: we use only proof bank numbers, and label anything hypothetical.
- Meme cutaways of real celebrities: rights risk and off-tone.
- Their characters, icons, accent colours and the RIP mark.
