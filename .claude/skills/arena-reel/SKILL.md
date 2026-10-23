---
name: arena-reel
description: Make a Content Systems.ai "arena" reel, a 9:16 pixel-art fighting-game explainer in the brand's 8-bit night world (pixel Korede vs problems as enemies, HUD, rounds, boss, YOU WIN, CONTINUE countdown CTA), voiceover-led and word-timed. Use for high-energy explainer videos with a list of problems and 1 main fix, especially comment-keyword lead posts. Renders via templates/arena.
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

Rules: short sentences, a pause only where the game state changes. House style from CLAUDE.md applies to the script and every on-screen string (no dashes, no exclamation marks, no percent signs, numerals, no eyebrow labels, never print pillar or execution names). Enemy names are content, not categories. Proof-bank numbers only; anything else is labelled `"foot": "Illustrative numbers"`. No third-party logos as fighters.

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
