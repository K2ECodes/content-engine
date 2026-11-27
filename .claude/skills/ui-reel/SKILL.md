---
name: ui-reel
description: Make an @koredekola.ai same-day AI launch explainer in the @bossaiautomations look ("<Brand> just dropped <feature> and this is big news"): deep navy background, brand icon tile with a glowing outline, flat Apple-style UI mocks that act out every phrase, single-phrase captions, optional split-screen face at the open and the CTA. Renders via templates/ui-reel (render.json scenes anchored to words.json).
---

# UI reel (templates/ui-reel)

Read research/style-bossai.md first (format, script structure, caption). Reference reel: instagram.com/reel/DgKcYEyNS7w, contact sheet research/ref-bossai-claude-apps-sheet.png. Pilot: content/2026-W48/ig-ai-fri-1230-gemini-tasks-free.

## Pipeline
1. **Story:** freshest item in research/daily ("Hot today" first). Re-check every fact against the official announcement (blog, release notes, help pages): what it does, where, which plans, the catch. Sources go in copy.md `## Notes`.
2. **Script (60 to 85 s):** hook "<Brand> just dropped / just made <feature> ... and this is big news", what it is (1 sentence), a concrete personal example told step by step, "But here's the part most people are missing" + 3 capabilities, who gets it (countries, devices, plans, "even the free one"), 1 honest caution ("The one thing I'd watch out for..."), "But think about what this means...", CTA "If you wanna try it, comment <KEYWORD> and I'll send you the link plus 10 <things> you can <do> today". The keyword is the feature name. Contractions, no em dashes, Korede's lively first person. TTS text in audio/say.txt (spell numbers out, "Korayday").
3. **Voice:** `freeSpeech` (scripts/lib/heygen.mjs) with HEYGEN_INSTANT_VOICE_ID, expressiveness 0.9 (lively) -> audio/vo-src.wav. Transcribe (`~/.local/whisper-venv/bin/python scripts/transcribe.py audio/vo-src.wav words-src.json --prompt "<names>"`), fix words into words.json (numerals, misheard names, the keyword in caps; split any token Whisper merged like "handed" -> "hand" + "it"), then `node scripts/tighten.mjs audio/vo-src.wav --out audio/vo.wav --words words.json --beatBefore "But,For,If"`.
4. **Freebie:** a 1-page PDF in assets/freebies (src HTML on freebie.css, `node scripts/freebie-pdf.mjs src.html out.pdf`), registered in config/offers.json `leadMagnets.items` with the keyword, file and the official link to send.
5. **render.json** (schema below). Check stills first: `UI_SNAP=1,4.5,9,15 node scripts/render.mjs <post>` writes snap-<t>.png (delete them after).
6. **Render once:** `node scripts/render.mjs <post> < /dev/null` -> video.mp4 + poster.png (+ face-slots.json and audio/face-*.wav). Then frames at 4 fps for the whole video (nothing overflowing, every phrase acted out, captions readable), a 1 fps contact sheet into the post folder, and the audio peak (`ffmpeg -i video.mp4 -af volumedetect -f null -`, max_volume must be -0.7 dB or lower; the renderer limits to about -1.7).
7. **copy.md** (caption = 1 line + 5 hashtags for ig-ai, lint needs exactly 5) + meta.json, `npm run lint`. Never schedule a pilot.

## Face slots (optional)
`face.open` (split screen from 0 to `until`, default the end of the first sentence, cap 4 s) and `face.close` (split screen from `at` to the end). The graphics squeeze into the top half (scale 0.82, up 150 px), the face fills y 1060 to 1920 under a soft navy seam, and the caption sits on the seam. Without `src` those windows render full-screen graphics, so a reel works faceless. Every render writes face-slots.json (exact windows) and audio/face-open.wav / audio/face-close.wav (the VO slices): lip-sync a talking head to each slice and drop the files in as `src`. The video's audio is always audio/vo.wav, so a face clip must match its slice. Clips shorter than the slot ping-pong (`loop: false` holds the last frame).

**Clone footage spec for Korede:** vertical or landscape, 1080p or better, 30 fps, chest-up framing with headroom (eyes about 35% from the top, the top of his head at least 10% below the frame edge, shoulders in frame, centred), real desk/room background, natural light, looking at the lens, calm hand movement allowed. The slot shows a 1080x860 window (about 5:4) cropped from the centre (`frame.cx`, `frame.cy` move the crop, `frame.zoom` > 1 punches in). Lengths: open about 3 to 4 s, close about 5 to 7 s (see face-slots.json per reel).

## render.json
```json
{
  "template": "ui-reel",
  "data": {
    "words": "words.json",
    "audio": "audio/vo.wav",
    "brand": "gemini",                       // config/brands.json id: tile logo + default accent (brand.accent || brand.bg)
    "accent": "#7B8CFF",                     // the only accent colour (optional override)
    "accentFg": "#fff",                      // text on accent buttons/pills
    "music": { "file": "audio/music.mp3", "volume": 0.08, "dropT": 0.5 },
    "face": {
      "open":  { "src": "face-open.mp4", "until": "Tasks#2", "frame": { "cx": 0.5, "cy": 0.35, "zoom": 1 }, "ss": 0 },
      "close": { "src": "face-close.mp4", "at": "If you wanna" }
    },
    "captions": { "maxWords": 4 },
    "tr": "fade",                            // default scene transition: fade | slide | cut
    "scenes": [
      { "items": [
        { "type": "tile", "brand": "gemini", "size": 210, "y": 640, "at": "Google", "ringAt": "Gemini", "orbitAt": "Tasks",
          "orbit": [ { "icon": "plane", "color": "blue" }, { "icon": "calendar" }, { "icon": "shopping-cart", "color": "accent" } ] },
        { "type": "pill", "label": "Now free", "y": 905, "at": "free," }
      ] },
      { "at": "For example", "cam": [ { "at": "watch", "x": 540, "y": 600, "zoom": 1.1 }, { "at": "Lagos", "x": 540, "y": 700, "zoom": 1 } ], "items": [
        { "type": "prompt", "brand": "gemini", "y": 600, "modes": ["Chat", "Task"], "modeAt": "Task", "text": "Watch flights from New York to Lagos...", "typeAt": "watch", "cps": 22, "sendAt": "$900." },
        { "type": "cursor", "at": "flip", "path": [ { "x": 700, "y": 820 }, { "x": 300, "y": 660, "at": "Chat" } ], "clicks": [ { "at": "Task" } ], "outAt": "watch" }
      ] }
    ]
  }
}
```
(Comments are for this doc only; render.json is plain JSON.)

### Anchors and coordinates
- Any `at` / `<name>At` at any depth is a spoken-word anchor ("word", "two words", "word#3" for the 3rd time, or seconds), resolved to `t` / `<name>T`. Matching ignores case and punctuation ("it's" = "its", "$900." = "$900"). Scene `at` lands 0.15 s before the word, items 0.05 s.
- `brand` anywhere -> that brand's inline SVG logo; `src` -> file URL (post-relative, or `assets/...`); any key ending in `icon` with a Lucide name (lucide.dev) -> inline SVG.
- The stage is 1080x1920. Items are placed by centre `x` (default 540) and `y` (default 700). Keep graphics in y 300 to 950 (caption at 1010), widths up to about 800, and anything below the caption (y 1080 to 1450) inside x 140 to 940. In face windows only y < 1000 shows.
- A new scene every 2 to 3 s; a scene that runs longer keeps changing (items on later words, `cam` moves, checks ticking).

### Scene keys
`at` (start; the first scene starts at 0), `items`, `tr` (fade | slide | cut), `cam` [{at, x, y, zoom, dur}] (bring point x,y to the centre at zoom; without `cam` every scene drifts in 3.5%), `drift: false`, `whoosh` (transition SFX volume).

### Item keys (every type)
`type`, `x`, `y`, `at`, `scale`, `z`, `in` (rise default | pop | fade | drop | slide | none), `sfx` (kit cue or false), `sfxVol`, `outAt` (+ `outY`, `outScale`), `dimAt` / `undimAt`, `moveAt` + `mx`, `my`, `mscale`, `mdur`.

### Components
| type | what | keys |
|---|---|---|
| `tile` | brand icon tile with a soft glowing outline ring, optional orbiting app icons | `brand` or `icon`+`color`, `size` 200, `ring` (false hides), `ringAt`, `orbit` [app icons], `orbitAt`, `tile` ("dark" gradient logo / "brand" colour tile) |
| `window` | macOS window, traffic lights + title, or browser bar with `url` | `title`, `url`, `w` 760, `h` (min body height), `glow`, `glowAt`, `body` [blocks] |
| `dock` | dock with icons popping in, optional iMac `monitor` around it | `icons` [app icons, each may have `at`], `size` 84, `hi` + `hiAt` (bounce + dot), `monitor`, `w`, `inner` (an item drawn on the screen) |
| `launcher` | start menu / launcher: search, "Pinned", icon grid | `icons`, `cols` 4, `size` 84, `title`, `search`, `hi`, `hiAt`, `w` 560 |
| `grid` | app icon grid; `hi` dims the others and rings 1 | `icons` [{..., `label`}], `cols` 3, `size` 110, `gap`, `hi`, `hiAt`, `q` (index shown as a "?" tile), `dim` |
| `prompt` | prompt box that types letter by letter, Chat/Task style mode switch, send button | `text`, `typeAt`, `cps` 20, `placeholder`, `brand`, `modes` [a, b], `modeAt`, `sendAt`, `glow`, `w` 780 |
| `checklist` | checklist or toggles card | `title`, `icon`, `toggles`, `items` [{label, sub, at, doneAt, value, hiOnDone}], `w` 640 |
| `progress` | bar filling in the accent | `label`, `pct`, `right`, `from`, `to`, `fillAt`, `dur` 1.4, `w` 700 |
| `stats` | stat tiles that light up | `tiles` [{k: ring (`value`, `p`) / bars (`vals`) / list / num (`value`, `label`)}], `litAt`, `size` 190 |
| `cursor` | pointer that moves, clicks, right-clicks a context menu | `path` [{x, y, at, dur}], `clicks` [{at, right}], `menu` {items ["Open", "-", ...], x, y, at, hi, hiAt} (stage coords) |
| `arrow` | dashed arrow that draws in | `x1`, `y1`, `x2`, `y2`, `bend` (curve, e.g. -0.2), `color` (accent / muted), `head`, `dur` |
| `strike` | red strike-through | `x1`, `y1`, `x2`, `y2` |
| `shot` | real screenshot card + optional source domain label | `src`, `w` 760, `h` 520 (visible height), `domain`, `pan` (px to scroll) |
| `headline` | white news card: source, headline, byline | `source`, `icon`/`brand`, `date`, `headline`, `mark` (phrase to highlight) + `markAt`, `byline`, `w` 780 |
| `phone` | phone outline in the accent, holds blocks | `w` 420, `h` 820, `body` [blocks, e.g. notif / bubble] |
| `notif` | notification card | `brand`/`icon`, `title`, `body`, `time`, `w` 760 |
| `invaders` | small row of pixel invaders walking, optional "?" | `n` 7, `size` 54, `gap`, `x`, `y` 1300, `q`, `color` |
| `chips` | wrapping pills popping in | `items` [{label, icon, hi, at}], `w` 820 |
| `pill` / `text` / `label` | badge / big number or word (`sub`, `accent`, `size`) / small grey line | |
| `icon` / `icons` | 1 app icon / a row with labels | `icon`/`brand`/`text`, `color`, `size`, `label`; `items`, `gap` |
| `people` | row of people silhouettes | `n`, `colors` |
| `plans` | plan columns with lock -> check | `cols` [{label, open, unlockAt, hi}], `pw` 180 |
| `comments` | CTA comments card typing the keyword, then posting it | `keyword`, `typeAt`, `cps` 9, `sendAt`, `rows` 3, `w` 680 |
| `focus` | rounded focus ring moving between targets | `moves` [{x, y, w, h, at}] |
| `spark` | little tick burst | `x`, `y`, `r`, `at` |

**App icons** (`icons`, `orbit`, rows): `{ "icon": "<lucide>", "color": "grey|accent|blue|red|green|yellow|purple|teal|pink|orange|#hex" }`, `{ "brand": "<id>", "tile": "brand|dark" }`, `{ "text": "24" }`, `{ "q": true }`; `dot: true` adds a red badge. Keep most icons grey and use the accent for the 1 that matters.

**Blocks** (window / phone bodies): `{k: "bar", w}`, `{k: "bars", n}`, `{k: "text", text, mute, big, size, color: "accent", type: true, typeAt, cps}`, `{k: "row", icon|brand|color|text, label, sub, value, hi, check, toggle, at, doneAt, hiOnDone}`, `{k: "bubble", text, ai, brand, at}`, `{k: "chart", pts, at}`, `{k: "img", src}`, `{k: "btn", label, ghost, at, pressAt}`, `{k: "btns", items}`, `{k: "input", text}`, `{k: "notif", ...}`, `{k: "gap", h}`.

### Captions, audio
- Captions are built from words.json: 1 phrase of 2 to 4 words at a time (breaks on punctuation and pauses, singletons merged), Inter 700 40 px white, centred on y 1010, no box or outline.
- SFX are automatic and soft (pops, taps, key clicks while typing, whooshes on transitions, ticks on checks, chimes) from assets/sfx/kit. `sfxGain` scales them all.
- Music: `music.file` (post-relative), `volume` about 0.08, ducked under the voice; the mix is loudness-normalised and limited (peak about -1.7 dBFS).
