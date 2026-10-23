---
name: split-reel
description: Make a Content Systems.ai vertical reel in the split-screen "talking head + word-timed graphics" style (studied from @stilesai, see research/style-stilesai.md). Use when Korede asks for a reel/short "like stiles", a split-screen explainer, a talking-head video with graphics, or a HeyGen avatar video with motion graphics. Produces content/<week>/<post>/video.mp4 via templates/split.
---

# Split reel

1 continuous take on the bottom 60 percent of the frame (Korede on camera, his HeyGen avatar, a screen recording, or an AI still), a flat cream canvas on top where a new graphic lands on the exact spoken word every 2.5 to 3.5 s, and 2 to 3 word caption chips on the seam. No camera moves, no jump cuts: all the energy comes from the graphics. Read `research/style-stilesai.md` once for the reasoning, and `CLAUDE.md` for house style (no eyebrows, no post-type labels, plain language on company channels, numerals, no dashes).

## Workflow

1. **Script** (about 4 words per second, 30 to 45 s, so 110 to 170 words). Beat map: number hook (0 to 3 s) → problem → proof stat → 2 or 3 steps (give each a full-screen beat) → result → comment-keyword CTA ("Comment SYSTEMS and we'll send you how it works"). No outro. Use only proof-bank numbers from CLAUDE.md. Put the caption-ready script in `render.json` `data.script` (lint checks it). Write contractions and numerals the way they should read.

2. **Voice / plate** (pick 1):
   - Korede's own recording: drop `plate.mp4` (one take, phone is fine) in the post folder. Its audio is the voice.
   - HeyGen avatar of Korede: generate `plate.mp4` from the script (see `scripts/heygen.mjs` once built; budget agreed with Korede). Its audio is the voice.
   - Voiceover only: `node -e` with `scripts/lib/kie.mjs` `tts()` (male Charon or female Kore via Gemini; ElevenLabs when kie's ElevenLabs is up) to `audio/vo.wav`, then a still or B-roll plate: `npm run generate -- image "<prompt>" --aspect 9:16 --out <post>/plate.png` (calm, photoreal, our greens and creams, no text, no people unless it's Korede).
   Spoken text for TTS may spell numbers out; the captions come from the transcript.

3. **Word timing**: `~/.local/whisper-venv/bin/python scripts/transcribe.py <plate.mp4 or audio/vo.wav> <post>/words.json`. Print the words with their start times and anchor beats to them.

4. **Beats** in `render.json` (`"template": "split"`). Each beat has `at` = the spoken word (or phrase, or `"word#2"` for the 2nd occurrence, or seconds). A beat replaces the previous one with a hard cut. `full: true` hides the plate for an emphasis beat (3 to 5 per minute, 30 to 40 percent of runtime).
   - `hero` {value, prefix, suffix, decimals, label}: counter that lands on the word
   - `card` {title, body}
   - `meter` {rows: [{label, value, unit, max, alarm}]}: bars; `alarm` = orange + thud
   - `list` {items: [{text, at}]}: ticks 1 item per spoken word
   - `grid` {cells, cols, hits, caption}: e.g. 40 cells, 10 hits = 1 in 4
   - `note` {text}: orange handwritten aside over the current beat (max 2)
   - `cta` {keyword, chips[], say}: keyword types out, chips pop, "Free" chip goes sage
   Top-level: `words`, `audio` (if the voice isn't in the plate), `plate.src`, `hot`/`good` (caption words to tint orange/sage), `foot` (source footnote, e.g. "Client result, anonymised"), optional `music` {file, volume} (off by default; voice-first), `tail` (seconds held after the last word).

5. **Render**: `npm run render -- <post>` (use `--fps 10` for a quick check). SFX (tick, thud, click, keys, marker) are synthesised and placed automatically; loudness lands near -14 LUFS.

6. **Review**: pull frames at each beat (`ffmpeg -ss <t> -i video.mp4 -frames:v 1 ...`, hstack into a strip) and look: graphics land on their word, nothing sits under a caption chip, full-screen beats feel full, text is readable at phone size. Watch the whole thing once. Then `npm run lint -- <post>`.

## Post folder
`copy.md` (caption with the keyword in the first 3 lines, 5 IG hashtags), `meta.json` (format `video`, aspect `9:16`), `render.json`, `words.json`, `plate.*`, `audio/`. Example: `content/_samples/ig-company-thu-1900-tickets-answered/`.

## Don't
- Don't copy @stilesai's footage, mascot, kicker labels or wording. We borrow the editing grammar only.
- Don't invent numbers or name clients.
- Don't add whooshes, risers, zooms or shakes; the restraint is the style. (For a busier style, see research/style-nick-saraev.md when it exists.)
