---
name: story-reel
description: Make a high-energy Content Systems.ai vertical video in the motion-graphics "story" style (studied from @getripping and @albert.olgaard, see research/style-nick-saraev.md), faceless with AI voiceover or edited around Korede's HeyGen talking head. Use for "dopamine" reels, explainers, viral-style videos, or when editing a HeyGen clone take. Renders via templates/story.
---

# Story reel

Something new on screen every 0.8 to 1.2 s, tied to the spoken word. Captions build word by word at the top, older words dim, the money word gets a box. The world flips dark/light every 4 to 6 s. UI cards (app windows, checklists, receipts, odometers, stamps, a clicking cursor) carry the story. Read `research/style-nick-saraev.md` section 6 once, and CLAUDE.md (house style, no eyebrows, no post-type labels, proof bank only, company channels plain language).

## 1. Script (35 to 50 s, 110 to 160 words)
Hook with a number or a rival in the first line (0 to 2 s) → why it matters → proof (proof bank or sourced news only) → 3 steps or items → twist/verdict → comment-keyword CTA ("Comment SYSTEMS and we'll send you ..." on company, "Comment AI and I'll send ..." on personal). Write `data.script` caption-ready (numerals, contractions; lint checks it). For TTS write a `say` version with numbers spelled out and contractions.

## 2. Voice
- Faceless: `ttsCreator(say, { voice: 'Brio', out: '<post>/audio/vo' })` from `scripts/lib/kie.mjs` (Gemini 3.8, young energetic creator delivery; male alternatives Jett, Enzo, Rami, Riko). Set `data.audio: "audio/vo.wav"`.
- Talking head: `node scripts/heygen.mjs plate <post>` (Korede's retouched twin only; reads `data.heygen.say`; renders 16:9 with the studio background; budget is tight, ask the lead before rendering). Set `data.face: {src: "plate.mp4"}`; the plate audio is the voice.
- Music: `music({ title, style, duration: 60, out: '<post>/audio/music.mp3' })` (Suno V6 instrumental, upbeat modern lo-fi/electronic, no vocals). `data.music: {file, volume: 0.09}`.

## 3. Words
`~/.local/whisper-venv/bin/python scripts/transcribe.py <audio or plate> <post>/words.json`, then print `w@start` and fix misheard words in words.json (captions come from it).

## 4. Scenes (`render.json` `"template": "story"`)
Each scene: `at` (spoken word, `"word#2"` for 2nd occurrence; first scene can omit = starts at 0), `world` dark|light (alternate every 1 to 2 scenes), `type`, and fields:
- `odometer` {value "250,000", prefix "$", label, landAt word}
- `stat` {value, label, foot "Illustrative numbers" or source}
- `word` {text} big gold block (1 to 3 words)
- `list` {title, badge, rows: [{text, val, chip, chipKind ok|bad|wait, at}]} app window
- `checklist` {title, rows: [{text, at}]} ticks on the word
- `receipt` {lines: [{text, val, miss, at}], total {text, val}, totalAt} printer strip
- `cta` {keyword, prompt, dm} keyword box + comment typing + DM sent
Overlays on any scene: `stamp` {text DONE|BILLED|SENT|MISSED|APPROVED, kind ok|bad, at, x, y} (max 2 per video), `click` {at, x, y} cursor click.
Top level: `keys` [words to box, lowercase, no punctuation], `strikes` [words to strike], `tail`, `posterAt`.
New scene every 3 to 5 s; rows/ticks every 0.8 to 1.2 s.

## 5. Talking head (`faceCuts`)
`[{layout: full|split|pip|none, zoom 1.0 to 1.25, push true (fast 8 in 100 push on emphasis), at word}]`. Pattern: open `full` zoom 1.15 on the hook line → `split` (cards above, face below) while explaining → `full` zoom 1.0 with `push` on the twist → `pip` (face in corner) over full-screen graphics for numbers/steps → `full` zoom 1.2 for the CTA line, then `pip` over the CTA card. Change layout or zoom every 2.5 to 4 s, never 2 closes in a row. Face on screen 40 to 60 in 100 of the runtime.

## 5b. Real-world proof
Find the articles, posts and pages the script talks about and screenshot them: `node scripts/shot.mjs <url> <post>/shots/<name>.png --mobile --scroll 60`, then crop to the headline area (`ffmpeg -i x.png -vf "crop=iw:ih*0.56:0:ih*0.20" x-crop.png`) and add `shot` scenes {src, url (shown in the bar), caption, h 980, pan 120}. Credit sources in Notes. Never use still photos or paper cutouts of Korede: only real moving video of him (lip-synced plate, optionally cut out with `face.mask`).
Pronunciation: write the company name as "Kuhn-tent Systems dot A I" in any TTS text.

## 6. Render and review
`npm run render -- <post> --fps 10` to check, then full `npm run render -- <post>` (about 10 min). Pull frames at each scene into a strip and LOOK: nothing overflows a card, captions don't collide, stamps land on cards, the face isn't covered in split. `npm run lint -- <post>`.

Example: `content/_samples/ig-company-fri-1130-invoice-gap/`.

## Placement (Reels/TikTok safe zones, Korede's rule: "psychologically perfect")
- UI covers the top ~220px, bottom ~420px and right ~120px. Nothing important there.
- Captions sit in the middle (top y 860), above the thumb zone (Korede: lower captions sit under his thumb); cards sit above them (y 260 to 980). On `split` the captions move to the seam (y 845); on `corner` they sit just above Korede's head (y 860). The template does this automatically.
- Korede's eyes sit on the upper-third line (y about 640) in `full` shots, face centred, never cropped; punch-ins max 1.15 and only on chosen words (`pushAt`).
- Talking cutout of Korede: real lip-synced video only (`node scripts/heygen.mjs talk-segments <post> 0-5.7,23.3-28.2,...` lip-syncs only the windows he's on screen, cheap). `faceCuts[].cut: true` uses the cutout (with `bg` pixel-day|pixel-night|pixel-sunset|pixel-neon for `full`), `cut: false` the normal studio shot. Mix them: not every video or moment is a cutout; use plain `split` at some points. Layouts: full, split, corner (cutout bottom-right over the cards), pip, none.
- Music: personal = dark rage-trap type beat, company = calm modern electronic. `music.volume` about 0.11 (well under the voice, ducked). The beat drop lands early: default 2 s in, or `music.dropAt: "<word>"` on the hook's turn. No long intro with the drop mid-video.
