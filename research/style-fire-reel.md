# Editing style breakdown: the "fire" reel (arcade boss-fight explainer)

Purpose: Korede called this reel "fire". Work out exactly why, and turn it into parts we can add to `templates/story` (and reuse in `templates/split`), with a HeyGen talking head of Korede and kie.ai assets. We copy structure, timing, motion grammar and sound design only. Not the creator's characters, script, music, handle, or any brand marks (the reel's hero and opponents are drawn from third-party logos; we design our own original cast).

Research date: 2026-10-23. Read-only, no login, no cookies, nothing liked, followed or commented. Downloaded with yt-dlp (public, no cookies) with Korede's approval.

Reference contact sheets (frames only): `research/style-fire-reel/`
- `jayantcreates-claude-ended-ig_0-32s_1fps_arcade-battle.png` (every second of the reel)
- `jayantcreates-claude-ended-ig_hook_0-3s_5fps.png` (the hook every 0.2 s)
- `jayantcreates-claude-ended-ig_finisher_22.6-24.2s_10fps.png` (charge beam, white hit frame, shatter, YOU WIN)

## 1. Source

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/Detf2t4ETEf/ |
| Account | @jayantcreates.ai (display name Jayant) |
| Posted | 2026-10-20 (3 days before this study) |
| Length | 33.1 s |
| Likes / comments | 2,711 / 4,664 |
| Caption hook | "Claude just ended Instagram", then an emoji list of the jobs, "Comment SKILL and I'll send you the full guide" |
| Hashtags | 7, including a pixel-art tag |

The number that matters: comments are 1.7x likes. That is a comment-keyword CTA converting extremely well, the exact outcome our lead posts want.

## 2. Specs (measured)

- 1080x1920, 60 fps, VP9 at about 570 kbit/s (flat graphics compress tiny), AAC 48 kHz stereo.
- Integrated loudness -14.2 LUFS, loudness range 2.9 LU, true peak -0.7 dBFS.
- Scene detection: at threshold 0.3 zero cuts; at 0.15 one (1.03 s, the white impact flash); at 0.05 only 10 soft events (10.8, 12.9, 14.6, 16.2, 18.6, 23.4, 23.8, 24.7, 27.9). It is one continuous "shot" for 33 s. Everything changes inside a fixed frame.
- No zooms, no punch-ins, no camera moves. The camera is locked like a 2D fighting game. Motion comes from sprites, HUD and effects.
- mpdecimate drops 1,763 of 1,984 frames as duplicates or near-duplicates: most of the frame is static at any moment and only small regions move. That is a cheap render, and a lesson: you do not need full-frame motion to feel busy.

## 3. Format

100 in 100 motion graphics, voiceover only, no face, no stock, no B-roll. A 2D pixel-art fighting game in a dark castle arena. The voice reads a product explainer (one skill, one agent, 11 jobs) and every sentence is staged as a game event: a round, an enemy, a power-up, a combo, a boss, a finisher, a menu, a continue screen.

Voice: 108 words in 30.7 s, 3.5 words per second, 10 pauses over 0.35 s (max 0.96 s, before the CTA). Each pause sits on a game state change (new round, stage card, menu), so the picture fills the breath. Likely an AI or tightly edited VO; treat as studio VO.

## 4. The frame (constant layout, measured at 1080x1920)

- Background: warm near-black `#16151A` top, castle wall of dark arches `#222126` from about y 240 to y 760, a floor line at about y 1060 with small lanterns (orange flame dots) every 180 px, characters standing on the floor with soft oval shadows. A dotted ellipse on the floor marks the fighting ring.
- HUD at the top, like a fighting game: player icon at x 40 y 300, player name in tiny pixel caps, an orange health bar `#DC7662` from x 110 to x 560 at y 340, opponent bar in magenta `#DA3D7C` from x 580 to x 1040, the opponent name in tiny pixel caps right-aligned above it. The opponent name changes every beat and is always the noun being explained (a blank post, an old profile, an empty week, the algorithm). The HUD is the topic label without being an eyebrow.
- Title zone: y 160 to y 330 for round and stage cards.
- Event zone: y 380 to y 560 for popups (unlock boxes, combo counters, upgrade cards).
- Captions: y about 1530, centred.
- Handle watermark: avatar dot plus the handle in small mono, y about 1716, the whole video.

## 5. Captions

- A chunky pixel display font, uppercase, white on a near-black `#0D0C0F` box with no rounding, cap height about 44 px, 12 to 16 px padding.
- Sliding 3-word window, not lines: each word appears on its onset and the oldest word drops off the left ("CLAUDE", "CLAUDE JUST", "CLAUDE JUST ENDED", "JUST ENDED INSTAGRAM"). The box width snaps to the content. No blur, no fade, no colour keywords: the HUD does the emphasis, the caption just keeps up.
- Bottom third, not top: the top belongs to the HUD and titles.

## 6. Beat map (word onsets from faster-whisper, picture from the 5 fps and 10 fps strips)

| Time | What is said (short paraphrase) | Picture |
|---|---|---|
| 0.0 to 1.6 | The bold claim: the AI ended the platform | ROUND 1. Hero dashes at the opponent with 5 afterimage ghosts (0.2 s), punch spark (0.4 to 0.8), full-frame white flash at 1.0 s right after the platform name is spoken (0.88), opponent turns into a pure white silhouette with impact lines, then shatters into about 30 coloured pixel squares (1.2 to 1.6). Opponent bar drains to 0, its HUD icon goes grey. |
| 1.6 to 3.9 | "now it has a skill", "a single AI agent" | A glowing orange orb bounces in on an arc (1.6 to 2.2) and is absorbed, 3 concentric power-up rings pulse on the floor (2.4), a box "NEW SKILL UNLOCKED" types "AI AGENT" letter by letter (2.8 to 3.6) landing on the word. |
| 3.9 to 5.8 | "11 different jobs at once" | Opponent becomes a grey training dummy. A row of 11 empty icon slots across the top fills one by one while a "HIT COMBO" counter climbs 2 to 11, landing at 5.0 s (number spoken at 4.28). |
| 5.8 to 8.7 | "run all the work on your profile and your content" | The arena turns into a platformer: hero jumps between ledges collecting little post cards, a "POSTS x N" score ticks up top right (2, 5, 9, 10). Stage cards "YOUR PROFILE / STAGE 1" at 7.0 and "YOUR CONTENT / STAGE 2" at 8.0, each on the word. |
| 8.7 to 10.8 | job 1, writing posts | ROUND 2 slam at 8.8, "FIGHT" sub-title 0.5 s later, opponent is a blank page character, hit spark at 10.3. |
| 10.8 to 12.9 | job 2, comments and replies | ROUND 3. Speech bubbles fly at the hero, hearts pop on each hit, "REPLIED x 1" to "x 4". |
| 12.9 to 14.6 | job 3, profile | ROUND 4, grey opponent turns into a bright new one, a yellow-bordered card "+ PROFILE UPGRADED" with 3 ticks (bio, highlights, link), sparkle pixels. |
| 14.6 to 16.2 | job 4, plans the week | ROUND 5, a row of coloured blocks drops in like a puzzle game, one per day. |
| 16.2 to 18.5 | "But my favorite one is..." | FINAL ROUND / BOSS in red. A big red boss sprite, a red radial glow behind it, the floor rings turn red. "FAVORITE MOVE" box types the feature name on the word (17.2). |
| 18.5 to 22.4 | finds top reels in your niche, analyzes why | Reel cards float around the boss, a yellow reticle "TARGET LOCKED" snaps onto one (20.0, on "niche"), a red "WEAK POINT: HOOK" label with a scan line crosses the boss (21.0, on "analyzes"). |
| 22.4 to 24.5 | turns ideas into winning scripts | Finisher: an orb charges in the hero's hands (22.6 to 23.4), a beam fires with the text "WINNING SCRIPT" inside it (23.5, on "winning"), boss turns white for 2 frames (23.8), shatters, "YOU WIN" in yellow tilted pixel type with a card of script lines (24.0). |
| 24.5 to 27.5 | how to set it up | Title screen: product name, "PRESS START", a menu (install, options, quit) with a pointer on install, an "INSTALLING" bar fills and flips to "INSTALLED" with a tick (27.0). |
| 27.8 to 33.1 | comment keyword, "I'll send you the full guide" | "CONTINUE?" with a yellow countdown digit (9 down to 2), a platform-style comment box types the keyword on the word (27.9), a pill "DM: FULL GUIDE UNLOCKED" slides in under it (29.0). The countdown keeps ticking 2.6 s after the last word, so the video never "ends", it waits for you. |

## 7. Edit rhythm

- New visual event every 0.4 to 0.8 s in the hook, every 0.8 to 1.5 s in the body. A new "round" (state change) every 1.6 to 2.3 s from 8.8 to 16.2 s, which is the list section: each list item is its own round.
- Events land on word onsets, typically 0 to 0.15 s after the word starts. Titles slam on the first word of a sentence; counters land on the spoken number.
- No cuts, no world flips. Pace comes from state changes inside one locked frame, and from escalating stakes: rounds 1 to 5, then FINAL ROUND, then YOU WIN.

## 8. Sound (measured, not heard)

- -14.2 LUFS integrated, LRA 2.9 LU. Short-term RMS: speech about -15 dBFS, between-word floor about -32 dBFS (p10). So a lower bed than the @getripping reels (they sat 7 to 8 dB under), about 15 dB under speech.
- Spectrogram: dense regular vertical transients through the whole reel (a beat-driven chiptune style bed, not a pad), with brighter broadband hits on impacts (1.0 s flash, 23.8 s finisher) and a harmonic stack around 6 to 7 s (a level-up jingle on the stage card). The texture gets denser from about 8.5 s, when the rounds start: the music steps up a gear with the structure.
- Inference: 8-bit SFX on every game event (dash, punch, orb pickup, power-up, typing blips, combo ticks, coin collects, round bell, explosion, win fanfare, menu select, countdown beep).

## 9. Why it is "fire", ranked

1. One metaphor carries the whole video. "A tool that does many jobs" becomes "a fighter that beats every enemy". The viewer already knows the grammar of a fighting game (rounds, health bars, combos, bosses, continue screens), so zero explaining is needed and every new beat has built-in stakes.
2. The hook is a fight that ends in 1.2 s. A dash, a punch, a white flash and a shatter, landing on the most provocative word of the claim. Violence (cartoon) plus a bold claim, before the viewer can decide to scroll.
3. Escalation baked into the structure. Round 1, 2, 3, 4, 5, FINAL ROUND, BOSS, YOU WIN. A list of features becomes a progression with a climax, so people stay for the boss.
4. The favourite feature is the boss fight. The point they most want you to remember (virality) gets the biggest set piece: red world, reticle, weak point, charge beam with the outcome written inside it.
5. The HUD labels every beat without eyebrows. The opponent name and the round card tell you the topic; counters ("11 HIT COMBO", "POSTS x 10", "REPLIED x 4") turn claims into visible numbers.
6. The CTA is a game screen. "CONTINUE?" with a ticking countdown creates urgency and a reason to act now, the comment box shows exactly what to type, and the DM pill shows the reward. It loops back into a rewatch. Result: 1.7 comments per like.
7. Tactile feedback on every event. Hit flash, white silhouette frames, pixel debris, power-up rings, typed text with blips. Each one is a micro-reward.
8. Consistency and craft. One palette (warm black, coral, magenta, yellow, red for the boss), one font family, a locked camera, no stock footage. It reads as a small game someone built, which is the flex itself: "I made this with AI".
9. Captions stay out of the way. Three words, bottom, high contrast, so the eye lives on the fight.

## 10. Map to our stack

### Already have (templates/story, templates/split, render pipeline)
| Their technique | Ours |
|---|---|
| Word-onset timing of every event | `words` from scripts/transcribe.py; scenes, stamps, clicks all take `t` |
| Dark warm world | `.world.dark` (ink-green, grid, spotlight, dust) |
| Typed text that lands on a word | `cta.typed` with `steps()` typing and key SFX (reusable for the unlock box) |
| Comment box typing the keyword, DM reward card | `cta {keyword, prompt, dm}` |
| Counter landing on the spoken number | `odometer` (per-digit roll, `land`) |
| Checklist with ticks (profile upgraded) | `checklist` rows with tick draw |
| Stamped verdict word (YOU WIN, K.O.) | `stamp` (scale 1.6 to 1, -8 deg, card shake, thud) |
| Menu pointer selecting install | `cursor` plus `ripple` click |
| Card list for the week planner | `list` rows with chips |
| Card shake on impact | stamp shake (x 6 px, yoyo x 3) |
| SFX hooks on events | `window.sfx` kinds: tick, click, roll, print, key, whoosh, thud |
| Face on screen (they have none) | `faceCuts` full / split / pip with zoom and push |
| Pixel world, pixel hero, pixel props, pixel font | `templates/pixel` + `assets/pixel/` (pixel Korede and Sanjana in 5 poses, coin, qblock, bulb, trophy, night sky, Silkscreen), built for carousels, not yet animated in video |
| SFX files | `assets/sfx/` (click, key, print, roll, scratch, thud, tick, whoosh) |

### Missing (what makes the reel)
1. Arena world plus fighting-game HUD (health bars, player and opponent names, round and stage title cards).
2. Sprite actors with actions: idle bob, dash with afterimages, hit, white silhouette, shatter into pixels, jump, power-up rings, charge and beam.
3. Impact grammar: full-frame white flash, hit-stop (freeze), screen shake, spark star, pixel debris.
4. HUD counters that tick per spoken item (combo slots, "x N" scores), not only a centre-screen odometer.
5. Game popups: unlock box, reticle "TARGET LOCKED", scan-line weak-point label, finisher beam with text inside, YOU WIN card.
6. CTA as a CONTINUE countdown that keeps running after the last word.
7. Arcade caption style: sliding 3-word window, boxed, bottom.
8. 8-bit SFX pack plus a beat-driven bed that steps up at the list section.
9. A "game state" narrative layer in the plan: map each sentence to a round, a power-up, the boss and the finisher.

## 11. Spec to add the missing parts (1080x1920, 30 fps, GSAP timeline, seek-safe)

Brand fit first. This slots straight into the brand's own 8-bit world (CLAUDE.md design rules, `templates/pixel`, `assets/pixel/`): we already have pixel Korede and Sanjana sprites (stand, point, shrug, cheer, laptop), pixel props (bulb, coin, qblock, brick, bubble, button, cursor, flag, chart, box, trophy, laptop), day and night skies, and Silkscreen (already loaded by `templates/pixel`) as the pixel face. So the "game" is our platformer world at night, not a borrowed castle. Keep our palette, not theirs: arena background ink-green black `#0F1A13` (or `assets/pixel/sky-night.png` dimmed to 0.7), floor in the brick and grass tiles of `templates/pixel`, lantern or bulb glows gold `#E8B84B`. Hero bar gold `#E8B84B`, enemy bar orange `#C98A3C`, boss world tint orange-red `#C9503C` (new, boss only), score text gold, positive ticks sage `#9CCAA0`. Never a third-party logo as a character.

### 11.1 New world: `world: 'arena'`
- `.world.arena`: background `#0F1A13`; arches as one inline SVG at y 240 to 760 (7 arches, 140 px wide, 40 px gaps, fill `#17281C`, a 2 px darker brick line every 48 px); floor `top: 1060px; height: 4px; background: #1F3426`; lanterns: 6 elements at x 30, 210, 390, 690, 870, 1050, y 1020, 14 px gold squares with `box-shadow: 0 0 24px 6px rgba(232,184,75,.35)`, flicker `gsap.to(l, {opacity: .6, duration: .12, repeat: -1, yoyo: true, ease: 'steps(1)'})` with a different delay each (deterministic, no random).
- Ring ellipse under the fighters: 760x120 at y 1260, `border: 2px dashed rgba(245,240,232,.12)`, border-radius 50 in 100 written as `border-radius: 380px / 60px`.
- `image-rendering: pixelated` on every sprite and on the canvas wrapper.

### 11.2 HUD (`data.hud`)
- Data: `hud: {player: 'KOREDE', icon: 'face' | 'mark', rounds: [{t, title, sub, enemy, enemyHp}]}`.
- Bars: y 340, height 18 px, hero x 110 to 530, enemy x 550 to 1040 right-aligned, 2 px cream border at 0.2 opacity, inner fill scales with `transformOrigin: 'left'` (hero) or `'right'` (enemy). Damage: `tl.to(fill, {scaleX: hp, duration: .25, ease: 'steps(6)'}, hitT)` with a white ghost bar behind that drains 0.3 s later (classic delayed damage).
- Names: Silkscreen 700 22 px, cream at 0.8, y 300. Enemy name swaps with `gsap.set` on each round.
- Player portrait: 96x96 square at x 40 y 290 with 3 px gold border. This is where Korede's HeyGen face lives in the arena (see 11.10).
- Round card: title Silkscreen 700 96 px cream, centred at y 250; sub 56 px orange 70 px below ("FIGHT", "STAGE 2", "BOSS"). In: `from {scale: 2.2, opacity: 0}` to `{scale: 1, opacity: 1}`, 0.12 s, `power4.in`, then a 4 frame shake of the whole HUD (y 6 px, yoyo, repeat 3, 0.033 s). Sub appears 0.45 s later with a 2 frame blink (`opacity 0,1,0,1` with `steps(1)`). Out: blink 3 times over 0.3 s at round end. SFX `bell` on title, `blip` on sub.

### 11.3 Sprite actors (`actors: [{id, src, x, y, scale}]`, `actions: [{t, actor, do, ...}]`)
- Sprites: transparent PNGs from `assets/pixel/sprites/` shown at 300 to 380 px tall (pixel Korede is 276x655 source, so about 0.55x) with `image-rendering: pixelated`. Hero stands at x 240 (feet at y 1330), enemy at x 840, facing each other (`scaleX: -1` on enemy). Pose swaps (stand to point to cheer) are `gsap.set` on `src`, which reads as sprite animation.
- `idle`: `y: -6` yoyo, 0.4 s, `steps(2)`, repeat for the actor's life (built as a finite repeat count from duration, seek-safe).
- `dash` (0.2 s): hero x to enemy x minus 180, `power3.in`; afterimages: 5 clones at 0.04 s spacing, each `opacity .5 to 0` over 0.15 s, tinted with `filter: brightness(1.6) sepia(1) hue-rotate(-10deg)`. Return dash after the hit, 0.25 s `power2.out`.
- `hit` (on the impact word, at `word.start + 0.1`): spark star (8-point SVG, 160 px, cream fill, gold stroke) at the contact point `scale 0 to 1.2 to 0` in 0.15 s; enemy `x: +24` knockback 0.08 s; enemy flashes white 2 frames with `filter: brightness(0) invert(1)` set then reset; hit-stop: pause all actor tweens for 3 frames (place the next actor keyframes 0.1 s later; do not pause the caption track).
- `ko`: white silhouette 4 frames, then `shatter`: hide sprite, spawn 30 squares (12 to 20 px, colours from the sprite palette) at the sprite's box; each flies on a precomputed vector (angle `i * 137.5 deg`, distance 160 to 420 px from `(i * 53) mod 260 + 160`), `rotation: i * 37`, `opacity 1 to 0`, 0.6 s, `power2.out`. Enemy bar to 0 and enemy icon `filter: grayscale(1)`. SFX `explode`.
- `powerup`: orb (40 px gold circle, `box-shadow: 0 0 30px 10px rgba(232,184,75,.6)`) on a 2-segment arc in 0.6 s with one bounce (`motionPath` or 2 tweens with `power1.in` / `power1.out`), absorbed with `scale 1 to 0`; then 3 rings: ellipses 260x60 to 520x120 at the feet, 2 px gold stroke, staggered 0.1 s, each 0.5 s, `opacity .9 to 0`. SFX `coin` then `powerup`.
- `beam` (finisher): charge orb in hands `scale 0 to 1` over 0.8 s with a 6 Hz flicker; beam is a 140 px tall bar from the hero's hands to the right edge, `scaleX 0 to 1` in 0.1 s from the left, fill linear gradient cream core to orange edge, `box-shadow: 0 0 40px 12px rgba(201,138,60,.6)`, text inside it in Silkscreen 40 px ink (the outcome, for example "INVOICE SENT"); boss `ko` 0.3 s after the beam lands. SFX `charge` then `beam`.
- `jump` (platformer beat): parabola 0.45 s (`y -220` `power2.out`, then back `power2.in`), collectibles are 36x44 cream cards with a gold edge that pop `scale 1 to 1.4, opacity 0` on contact, each adding 1 to a score counter.

### 11.4 Impact flash and screen shake
- Full-frame flash: a `#F5F0E8` overlay `opacity 0 to .85` for 1 frame, `.5` second frame, 0 third frame, `steps(1)`, on the hook impact and the finisher only (2 per video max, epilepsy-safe: never more than 3 flashes in any second).
- Shake: whole `.canvas` `x: [8, -8, 6, -4, 0]` over 5 frames, `steps(5)`, on KO only.

### 11.5 HUD counters (`counters: [{t, label, from, to, slots?, at: 'top-right' | 'event'}]`)
- "x N" counter: Silkscreen 40 px gold at x 1040 right-aligned, y 380. Each increment: number swap with `gsap.set`, plus `scale 1.4 to 1` 0.1 s, SFX `blip`. Increments tie to word onsets of each list item or to collectibles.
- Combo with slots: a row of N 56 px squares (2 px cream border at 0.3) centred at y 430, filled one by one with a gold icon or our 5-colour palette, big number 120 px cream at right with "HIT COMBO" 28 px under; final number lands on the spoken number onset plus up to 0.7 s.

### 11.6 Game popups (`popups: [{t, kind, ...}]`)
- `unlock {title, text}`: box 620x130 at y 380 centred, `border: 3px solid #C98A3C`, fill `#0F1A13`; title Silkscreen 18 px orange with 0.3em tracking; text types in at 14 chars per s with a blip every 2 chars, finishing on the word. In: box height `0 to 130` in 0.12 s, `steps(4)`.
- `reticle {x, y, w, h, label}`: 4 corner brackets (40 px arms, 4 px gold) start 60 px outside the target and snap in 0.15 s `back.out(2)`, a 2 frame blink, label Silkscreen 28 px gold above.
- `weakpoint {y, text}`: 6 px orange-red line sweeps top to bottom of the enemy in 0.4 s; label box `#C9503C` fill, cream 24 px text, appears when the line passes y.
- `win {title, lines}`: "YOU WIN" Silkscreen 120 px gold, `rotation: -6`, `from {scale: 0, rotation: -30}` 0.25 s `back.out(2.5)`, then a card (our `.card` dark) with 3 lines typing. SFX `fanfare`.
- `menu {items, pick, progress}`: title card with the product name, "PRESS START" blinking at 2 Hz `steps(1)`, items in Silkscreen 32 px, a gold pointer next to the picked item (reuse `cursor` easing), progress bar 600x18 filling `steps(12)` over 1.5 s, flips to a sage tick label.

### 11.7 CTA: `cta.continue`
- Add `continue: true` to the existing `cta`: "CONTINUE?" Silkscreen 96 px cream at y 250, a countdown digit 160 px gold under it starting at 9, one step per 0.5 s with a `beep` and `scale 1.3 to 1`, running until the last frame (do not let it reach 0 before the end). The existing comment box and DM card stay, restyled for the arena (square corners, 3 px gold border). Keep 2 to 3 s of countdown after the last word.

### 11.8 Arcade captions: `capsStyle: 'arcade'`
- Position `top: 1490px`, centred; box `background: #0A120D; padding: 14px 18px`; Silkscreen 700 48 px cream, uppercase, `letter-spacing: .04em`.
- Sliding window of the last 3 words: on each word onset `gsap.set` the box text to the last 3 words (precompute strings per word, seek-safe). No blur and no fade. Keywords (`keys`) render gold; strikes render orange with the line through (keep our strike rule). Clear the box 0.3 s after a sentence end if the next word is more than 0.4 s away.

### 11.9 Sound
- Bed: a royalty-free or generated chiptune loop at 120 to 140 bpm, two intensities: a light layer for the hook and setup, the full layer from the first list round (where the reel steps up at 8.5 s). Mix at about -29 LUFS short-term under VO at -14 (the reel sits about 15 dB under the voice), cut dead 0.1 s after the last countdown beep.
- New SFX kinds for `window.sfx`: `dash`, `punch`, `explode`, `coin`, `powerup`, `bell`, `blip`, `charge`, `beam`, `fanfare`, `beep`. Square-wave style, under 0.4 s each except `fanfare` (1.2 s) and `charge` (0.8 s), at -16 to -20 dB under the voice. Source them through `media-use` or synthesize with FFmpeg, for example a blip: `ffmpeg -f lavfi -i "aevalsrc='0.4*sgn(sin(2*PI*880*t))*exp(-18*t)':s=48000:d=0.12" blip.wav`; a coin: two of those at 988 Hz then 1319 Hz, 0.06 s apart; an explosion: `anoisesrc=d=0.5:c=brown,afade=t=out:st=0.05:d=0.45,lowpass=f=1800`.
- Final mix as before: `loudnorm=I=-14:TP=-1.5:LRA=3`.

### 11.10 Korede's HeyGen face in this format
The reel works with no face, but our `ig-personal` brief is talking heads. Three uses, all from the existing 16:9 retouched studio take:
- Player portrait: the face in the 96x96 HUD slot all video long (`faceCuts` new layout `hud`: crop centred on the eyes, `object-position` set so the eyes sit at y 40 of the 96 px box). Optional retro look on this slot only: `filter: contrast(1.15) saturate(.9)` plus a 2 px scanline overlay at 0.15 opacity. The face is the player.
- Cold open, 0 to 1.2 s option: full-frame face says the claim, then a hard cut to the arena on the first impact frame (flash covers the cut). Use only if the hook line is stronger said than shown.
- CTA: `pip` face (existing layout, 300x300, gold border) next to the comment box during CONTINUE so Korede asks for the comment himself.
- `templates/split` can borrow the arena as its graphic canvas (y 0 to 768) for a single boss beat, with the HUD shrunk to 0.7 scale; the full format belongs in `templates/story`.

### 11.11 kie.ai assets (read kie.ai's current docs before choosing a model; log costs to logs/kie-costs.jsonl)
- Hero: the existing pixel Korede (`assets/pixel/sprites/korede-*.png`). Missing poses to generate from `assets/pixel/src/cast.png` as the style reference: dash, punch, hit, charge (hands forward), jump. Enemy set, same pixel style and our palette, named after operator pains (a paper-stack invoice monster, a ringing-phone WISMO gremlin, a tangled-spreadsheet golem, a month-end boss twice the size with a red glow). 4 poses each: idle, attack, hit, KO. Generate one pose sheet per character, then slice to PNGs.
- Arena background plate as an alternative to the SVG arches (castle warehouse: pallet racks as arches, dock lanterns) at 1080x1920, then dim to 0.6 brightness so HUD and sprites stay readable.
- No image-to-video needed: sprite motion is cheaper and more controllable in GSAP.

### 11.12 Plan rule for scripts in this format
- Map before writing: hook claim = Round 1 KO; the "how it works" setup = power-up; each list item = a round with its enemy named after the problem; the best feature = the boss; the outcome = the beam text; setup steps = menu; keyword CTA = CONTINUE. 25 to 35 s, 3.5 words per second, pauses only on state changes.
- House rules: no eyebrows, never print the pillar or execution; the HUD shows enemy names (content), not categories. Proof bank numbers only in counters, everything else labelled illustrative in the win card footnote.

## 12. Top missing techniques, ranked by impact
1. Game-metaphor structure plus arena HUD and round cards (11.1, 11.2, 11.12).
2. Sprite actors with the impact grammar: dash, hit, white frame, shatter, flash (11.3, 11.4).
3. Boss finisher set piece for the key point: reticle, weak point, beam with the outcome inside, YOU WIN (11.3 beam, 11.6).
4. CONTINUE countdown CTA with the comment box and DM pill (11.7).
5. 8-bit SFX on every event plus a bed that steps up at the list (11.9).
Then: HUD counters (11.5), arcade 3-word captions (11.8), face as player portrait (11.10).

## 13. What not to copy
- Their characters (drawn from real product logos), their exact script, their music and the handle watermark.
- Third-party logos as fighters or enemies, in any form.
- Hype framing that a tool "ended" a platform: our version keeps calm authority, for example "one system just took over month-end billing", with the fight carrying the energy.
