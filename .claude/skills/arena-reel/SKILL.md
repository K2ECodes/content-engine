---
name: arena-reel
description: Make an "arena" reel (Content Systems.ai explainers, or logo-battle AI-news reels for Korede where company logos fight in brand colours), a 9:16 pixel-art fighting-game explainer in the brand's 8-bit night world (pixel Korede vs problems as enemies, HUD, rounds, boss, YOU WIN, CONTINUE countdown CTA), voiceover-led and word-timed. Use for high-energy explainer videos with a list of problems and 1 main fix, especially comment-keyword lead posts. Renders via templates/arena.
---

# Arena reel

Style source: `research/style-fire-reel.md` (why it works, measured beats). Template: `templates/arena/index.html` (data format at the top of its script). Example: `content/_samples/ig-company-arena-3pl-billing/`.

## 1. Script it as a fight (25 to 45 s, about 3.3 words a second)
Map before writing:
| Game beat | Script job | Timing |
|---|---|---|
| ROUND 1 hook fight | Bold, calm money or time claim. Dash, hit and KO land inside the first 1.5 s | 0 to 1.5 s |
| popups (optional) | The setup numbers ("WORK DONE $250K", "BILLED $242K") | 1 to 2 popups |
| ROUND 2 to 5 | Each list item is 1 round: enemy named after the problem, KO on the line's last word, `add` ticks the HUD counter | about 3 s each |
| FINAL ROUND / BOSS | The main point (the root problem). Power-up = "we built a system". Reticle, weak point, charge, beam with the outcome inside it | 10 to 14 s |
| YOU WIN | The result in 1 short line + 1 proof line | 2 s |
| CONTINUE? | Comment-keyword CTA. Countdown keeps ticking about 2.5 s after the last word | 4 to 5 s |

Rules: short sentences, a pause only where the game state changes. House style from CLAUDE.md applies to the script and every on-screen string (no dashes, no exclamation marks, no percent signs, numerals, no eyebrow labels, never print pillar or execution names). Enemy names are content, not categories. Proof-bank numbers only; anything else is labelled `"foot": "Illustrative numbers"`. Company posts: no third-party logos as fighters. Korede's AI-news posts (ig-personal): logo battles are the point, see section 6.

## 2. Voiceover and music (kie.ai, about $0.07 total)
```js
import * as kie from './scripts/lib/kie.mjs';
await kie.ttsCreator(script, { voice: 'Brio', out: '<post>/audio/vo.wav', label: '<post-id> vo' });
await kie.music({ title: '<post-id>', style: '8-bit chiptune, NES arcade fighting game battle theme, 135 bpm, square wave lead, punchy noise drums, driving bass arpeggio, energetic, no vocals', duration: 45, out: '<post>/audio/music.mp3', label: '<post-id> music' });
```
1 call each. Keep 1 music variation, delete the other. Company channel: this is the one place a chiptune bed is on-brand; keep `music.volume` around 0.07 (ducked under the voice automatically).

## 3. Words
`~/.local/whisper-venv/bin/python scripts/transcribe.py <post>/audio/vo.wav <post>/words.json --prompt "Content Systems.ai, 3PL, <jargon>"`
Then read the words and fix what Whisper misheard (it hears "billed" as "built", "kitting" as "kidding", drops `$` and `K`, splits "month-end"). Keep the timings, fix only `w`. Captions print these words.

## 4. render.json
```json
{ "template": "arena", "data": {
  "words": "words.json", "audio": "audio/vo.wav", "music": { "file": "audio/music.mp3", "volume": 0.07 },
  "script": "...", "player": { "name": "KOREDE", "sprite": "korede" },
  "counter": { "label": "RECOVERED", "prefix": "$" }, "foot": "Illustrative numbers", "posterAt": 1.0,
  "beats": [
    { "type": "round", "title": "ROUND 1", "sub": "FIGHT", "enemy": { "name": "BILLING LEAK", "sprite": "qblock", "eyes": false }, "dashAt": "just", "hitAt": "knocked", "koAt": "$8K#1", "flash": true },
    { "type": "popup", "at": "$250K", "title": "WORK DONE", "text": "$250K", "kind": "good", "slot": 0 },
    { "type": "round", "at": "First", "title": "ROUND 2", "sub": "FIGHT", "enemy": { "name": "STORAGE OVERAGE", "sprite": "box" }, "hitAt": "free", "koAt": "billed#1", "add": 3100 },
    { "type": "boss", "at": "But", "title": "FINAL ROUND", "sub": "BOSS", "enemy": { "name": "MONTH-END BILLING" }, "reticleAt": "reads", "weak": { "at": "matches", "text": "WEAK POINT: NO CONTRACT CHECK" }, "chargeAt": "team#2", "beam": { "at": "every#2", "text": "EVERY LINE APPROVED" }, "koAt": "billed#3", "flash": true },
    { "type": "powerup", "at": "system", "title": "POWER UP", "text": "BILLING SYSTEM", "outAt": "reads" },
    { "type": "win", "at": "That's", "lines": ["$8K BACK ON THE INVOICE", "EVERY LINE APPROVED"], "foot": "Illustrative numbers" },
    { "type": "continue", "at": "Want", "keyword": "SYSTEMS", "typeAt": "SYSTEMS", "dm": "DM SENT: THE CHECKLIST", "from": 9 }
  ] } }
```
- Anchors: every `at` and `xxxAt` (at any depth) is a spoken word from words.json, matched without punctuation and case; `"word#2"` is the 2nd occurrence, multi-word anchors like `"every line"` work. render.mjs resolves them to seconds (`t`, `xxxT`) and stops with a clear error if one is missing. The first beat may omit `at` (starts at 0).
- Round: `dashAt` and `hitAt` are optional (defaults: hit 0.45 s before KO, dash 0.22 s before hit). `flash: true` (white full frame) only on the hook and the boss KO, 2 per video max.
- Enemy sprites (`assets/pixel/sprites/`): box, brick, qblock, bubble, coin, chart, laptop, flag, button, cursor, trophy, bulb. `eyes: false` for sprites with their own face (qblock). `h` overrides the 280 px height. The boss is always a brick wall golem with red eyes.
- Player: `korede` or `sanjana` (company posts either, Korede's personal posts Korede only).
- Popups stack in `slot` 0 and 1 and leave at the next fight unless `outAt`. Keep popup text to about 14 characters, beam text to about 20, win lines to about 24, enemy names to about 18.
- Captions are automatic: sliding 3-word window, Silkscreen, newest word in gold, at y 1400.
- SFX are automatic (dash, punch, explode, coin, powerup, bell, blip, charge, beam, fanfare, beep), synthesized once into `assets/sfx/` by render.mjs.

## 5. Render and review
1. `node scripts/render.mjs <post> --fps 10` (fast draft).
2. Contact sheet and LOOK: `ffmpeg -i <post>/video.mp4 -vf "fps=1,scale=270:-1,tile=7x6" -frames:v 1 sheet.png`, plus full-size frames at the hook hit (about 0.5 s), each KO, the beam and CONTINUE. Check: KO inside 1.5 s, nothing overlaps the HUD or captions, text fits (beam text auto-shrinks), counter lands on the right totals, countdown never reaches 0.
3. Listen once: voice on top, SFX present but under the voice, bed audible under the countdown.
4. `node scripts/render.mjs <post>` (30 fps final), `npm run lint -- <post>`.
5. meta.json: `format: video`, `aspect: 9:16`, `lead: true`, `cta_type: comment-keyword`, `cta_keyword`, `status: draft`.

## 6. Brand mode: logo battles (ig-personal AI news)
"Claude just took X from Y" style reels: the fighters are company logos (config/brands.json, files in assets/logos) on cut-paper tiles with angry pixel eyes, boxing gloves and legs, in brand colours. Example: `content/2026-W44/ig-personal-sat-1800-openai-took-replit/` (also `ig-personal-thu-1900-walmart-let-agents-shop`).

- Turn it on with `"player": { "brand": "openai", "color": "#10A37F" }` and `"opponent": { "brand": "claude" }` (default enemy for every round without `enemy`). Per fighter: `tile` (tile colour, e.g. Amazon `#232F3E` because its smile logo is white), `color` (HUD bar, gloves, plate, glow, flashes; default = brand bg, or accent/fg when the bg is too dark), `name`, `logo`, `eyes: false`. render.mjs passes brands.json as `data.brands`.
- Face: Korede's talking cutout is optional here; only add it where it fits (twist or CTA) if the post has a plate, never a still photo.
- Look: left glow in the player's colour, right glow in the enemy's, pixel name plates and HUD names in brand colour, KO/hit flashes in the attacker's colour (`flash: true`, `'#hex'` or a brand id). `stopMotion: 10` (default in brand mode) re-poses every logo tile 10 times a second (cut-paper wobble); dashes, rain, throws, stamps and the prize move on `steps()` eases.
- Extras: `handle: "@koredekola"` (replaces the Content Systems.ai wordmark on the win card and CTA, never use the CS wordmark or bulb on ig-personal), `popTop: 380` (popups higher, clear of the prize), `prize: { brand, owner, label, y: 720 }` (crowned trophy logo between the fighters), `crowd: { brands: [...] }` (front-row fans that bob and leave at CONTINUE).
- Fair fights: `ko: false` on a round = stagger and stay dizzy with `koText` ("STOLEN", "OPEN") and `hp`, instead of shattering. Only shatter a logo when the news really is a knockout. Give the twist its own beat (`revive`, a `title` "ROUND 2", an enemy `powerup` with `side: "enemy"`).
- New beats, all word-anchored (data format at the top of templates/arena/index.html): `title`, `steal` (prize changes owner, label swaps), `counter` (enemy hits back), `combo` (`hits: [{ at, text }]`, a jab and label per spoken word, HIT xN), `blast`, `revive`, `rain` (logos fall in stepped frames), `cheer` (crowd jumps, optional bubble), `throw` (a logo or pixel sprite flies at a fighter: `result: "join"` = ally at its feet, `"block"` = shield flash and bounce), `stamp` (big slammed label, `size: "sm"`), `clash` (both collide mid-ring, split-colour flash). `powerup` takes `brand` (logo arcs in instead of the bulb), `win` takes `brand`.
- Hook (Korede, 2026-10-23): the first 1 to 2 s is a huge arcade hit. Use `blast` (`{ type: "blast", at: <first word>, hitAt: <hook's last word>, shots: 8, rocket: true, quiet: true }`, `from: "enemy"` to fire back): a pixel blaster pops into the glove, bolts fly in stepped frames with muzzle flashes, every bolt flashes the target white and steps its health bar down, the rocket lands on the KO word. Pair it with a `round` that has `dash: false` and its `koAt` on the same word. Cartoon only: pixel bolts and rockets, no realistic guns, no gore.
- Palette (strict by default in brand mode): the pixel world is desaturated to a dark base and only the fighters and the prize keep colour; every other logo (crowd, rain, allies) is white on ink, pixel sprites go grey. Max 3 hues a frame: dark base + the 2 fighters' colours. `badColor` sets bad-popup colour (use the opponent's), `keep: [ids]` keeps an extra logo in colour, `palette: "full"` turns it off.
- Shatter (`ko` default) removes the logo until a `revive`, which flies the pixels back together. Only shatter when the logo isn't needed on screen until the revive; otherwise `ko: false`.
- Truth rules: logos only for companies in the story; a rule-breaker or generic agent is a pixel sprite (`robot`, `evil-robot`), never a real brand. Crowd logos are spectators, not claims.
- Density: something lands on every 1 to 1.5 s (a hit, stamp, throw, rain or cheer). Contact sheet at 2 fps; any 3 identical frames in a row is a dead spot, add a beat.
- Voice for ig-personal: Korede's free cloned voice (`freeSpeech` in scripts/lib/heygen.mjs, voice 2119a56717374a708188f84e99e8f2c4, pace with punctuation only), then `node scripts/tighten.mjs <post>/audio/vo.wav` and use `audio/vo-tight.wav`; transcribe the tight file. Music: 1 kie `music()` call, dark rage trap style, keep the punchier variation, `music.volume` about 0.17 (bed about 9 dB under the voice before ducking).
