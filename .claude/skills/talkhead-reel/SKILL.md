---
name: talkhead-reel
description: Shoot and edit a premium talking-head reel from REAL recorded footage (not HeyGen) in the Nick Saraev style (research/style-talking-head-pro.md) for the personal brands Growth Sanj (Sanjana) and @koredekola. Use when Korede or Sanjana sends a camera recording to cut into a reel, asks for a "talking head like Nick Saraev", "the pro talking head", a news / open-source / freebie reel with their own face, or wants the shoot checklist. Produces <post>/video.mp4 via templates/talkhead.
---

# Talking-head pro reel

Real footage, jump-cut tight, 3 layouts cutting every 3 to 5 s (STACK: headline + media card over a light backdrop with the face in a card at the bottom; FULL: a real screenshot or B-roll card over the blurred footage; CLOSE: full-frame face for the turn line and the CTA), 1 to 3 word captions with 1 accent-coloured italic serif keyword, accent colour = the brand being covered. Read `research/style-talking-head-pro.md` once (section 7 has 10 script templates) and `CLAUDE.md` for house style.

Handles: Growth Sanj = `@growthsanj` (the template default, an ASSUMPTION until Sanjana confirms the exact handle), Korede = `@koredekola`. Never Content Systems.ai selling on these accounts, no company mark.

## Part 1: shoot checklist (tomorrow's reference recording)

**Camera**
- 4K at 30 fps (not 60, not 24), vertical 9:16 if the camera allows, else landscape 16:9 (the renderer crops a 9:16 column around the face). iPhone: Settings > Camera > Record Video > 4K at 30 fps, HEVC is fine, lock exposure and focus on the face (long-press), 1x lens, not 0.5x.
- Lens at eye height, 1 to 1.5 m away. Frame wide enough that there's space above the head (a hand's width at least) and the chest is in shot: the template needs room to punch in to 1.2 and to sit the face in the stack card. Eyes about 1/3 down the frame. Head centred left to right.
- Tripod, no handheld. Don't move the camera between takes so cuts match.

**Light**
- 1 big soft key light at 45 degrees to 1 side, slightly above eye level (window light works: face the window at an angle). A little fill on the other side or a white wall bounce. Light the background a touch darker than the face.
- No overhead light only, no mixed colours (switch off warm bulbs if using daylight). Check no glare on glasses or skin.

**Sound**
- Lav or a podcast mic within 20 cm of the mouth (in shot is fine, Nick has his in frame). Quiet room, soft furnishings, AC and fans off, phone on do-not-disturb.
- 10 s of silence at the start of the recording (room tone), clap once on camera.

**Look**
- Plain, tidy background with some depth (a wall 1 to 2 m behind, 1 plant or shelf). Solid-colour top, no small stripes or logos. The template supplies the colour, so keep the set calm.

**Performance**
- First word at frame 0: no "hey guys", no breath, start mid-energy. Say each hook 3 ways in a row, then pick the best.
- Speak about 4 words per second, slightly faster than normal. Pauses are fine, they get cut. If you fluff a line, stop, pause 2 s, say the whole sentence again (the editor keeps the last clean take).
- Look into the lens, not the screen. Read from a teleprompter app placed right next to the lens, or learn 1 sentence at a time.
- Hooks to record (fill from research/style-talking-head-pro.md section 7):
  - "[Company] just open sourced a free [tool] that lets your [Claude Code] [do X], just like a human."
  - "Every [category] in 1 place."
  - "I built a [named thing] where [N] Claudes [do something to your idea]."
  - "You're paying [price] a month for [tool]. This does it for free."
  - "[Company] just shipped [thing], and nobody noticed the part that matters."
- Always record the CTA line the same way: "If you want to try this for yourself, comment [KEYWORD] and I'll send it to you free."
- Record 2 or 3 reaction lines for CLOSE cuts: "here's why", "and get this", "this is the part that matters".

## Part 2: edit workflow

1. **Post folder** `content/<week>/<post>/` with `copy.md`, `meta.json` (channel `ig-personal` for Korede; Growth Sanj has no channel id in config/channels.json yet, so ask before queueing hers), the footage (or a relative path to it), and `assets/`.
2. **Transcribe the raw footage** (not a tightened copy, the renderer cuts it):
   `~/.local/whisper-venv/bin/python scripts/transcribe.py <footage.mp4> <post>/words.json --prompt "Claude Code, <names>"`. Fix misheard words by hand in words.json (keep the timings).
3. **Pick the take**: print the words with times, set `from` (first word of the good take, `"word#n"` for the nth occurrence) and `to` (last words kept). Add `cuts` [[start, end], ...] in source seconds to drop a fluffed sentence inside the range.
4. **Framing**: grab 1 still (`ffmpeg -ss 5 -i <footage> -frames:v 1 /tmp/f.jpg`) and set `frame` {cx, eyes, head} as fractions of the source frame (face centre x, eye line y, top of head y). If the subject sits too close (face fills the frame), add `base: 0.84` to inset the frame on its own blur.
5. **Real artifacts**: `node scripts/shot.mjs <url> <post>/assets/<name>.png --mobile` for every product, repo or article mentioned (credit the source in Notes). B-roll clips go in assets/ as mp4.
6. **render.json** (`"template": "talkhead"`):
   - `footage`, `words`, `from`, `to`, `cuts`, `tighten` {max 0.3, keep 0.16} (`false` to keep every pause), `frame`.
   - `brand` (config/brands.json id, sets the accent) or `accent` "#hex". `handle`.
   - `title` {top, hi, until}: the 2-line hook headline (plain line + accent box), shown on STACK until the `until` word.
   - `keys`: words to style as accent italic serif (match the transcript token, punctuation included, e.g. "inside.").
   - `beats` [{at, layout: close|stack|full, z, media}], a hard cut at each. First beat at 0. Media: `shot` {src, chrome: browser|phone, domain, pan, credit}, `broll` {src, from, chrome}, `logos` {brands[], ats[]}, `text` {text, sub} (`*word*` = accent serif), `stat` {value, label}.
   - `punches` [{at, z <= 1.2, until, mode: push|cut}]: punch-ins on chosen words in close/stack.
   - `pops` [{at, until, kind: emoji|logo|text, emoji|brand|text, x, y, w}], clamped to the safe zone.
   - `cta` {keyword, at, keywordAt, lead}: with `at` it lands on the spoken CTA line; without it, it holds over the tail after the last word. No keyword = a follow card.
   - `music` {file, volume 0.06 to 0.09}: ducked under the voice. Personal brands: dark trap bed.
   - `safeGuides: true` to check placement.
   Rhythm: change layout every 3 to 5 s on phrase boundaries; CLOSE only for the turn line and the CTA; FULL for every proof (screenshot, number, repo); at most 2 pops.
7. **Check render**: `node scripts/render.mjs <post> --fps 6`, look at a contact sheet (`ffmpeg -i video.mp4 -vf "fps=2,scale=216:-1,tile=8x4" -frames:v 1 sheet.png`), fix, then the final at 30 fps. Never start a render while another `scripts/render.mjs` is running (`pgrep -f scripts/render.mjs`).
8. `node scripts/lint.mjs <post>`; outputs: video.mp4, poster.png, edl.json (kept segments), words-cut.json (words on the cut timeline). `.talkhead/` is a frame cache, safe to delete.

How it works: ffmpeg cuts video and audio together from the EDL (cut points snapped to a 30 fps grid so sync never drifts), crops the 9:16 column, scales to 1080 to 1296 wide and writes JPEG frames at the output fps; Chromium (which can't decode H.264/HEVC) only places those frames, zooms them and draws the graphics; the voice is the cut audio, SFX from assets/sfx/kit and the music bed are mixed by `mixAudio` to -14 LUFS.

Sample: `content/_samples/talkhead-sample` (Korede's own words from tmp/twin-footage.mp4).
