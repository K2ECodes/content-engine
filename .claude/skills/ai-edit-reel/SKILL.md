---
name: ai-edit-reel
description: Make an 11 to 12 s "AI edit" reel (iMessage meme hook about an AI, brand stinger, fast montage of REAL screen footage cut to a beat) for @koredekola.ai, @koredekola trials and Korede's TikTok. Hook/stinger from templates/edit, montage from assets/edit-clips via scripts/render-edit.mjs.
---

# AI edit reel

Ref: tiktok.com/t/ZPLAptXyg (@sburttt, 368K views), notes in research/style-claude-edit-reel.md (read the "Correction": the montage is real footage).

1. Write a funny, relatable text thread about an AI (3 to 5 messages, no exclamation marks, no cringe, never the reference's exact text): e.g. "Be honest. Do you love me?" / "Obviously" / "More than Claude?" / "Next question." Vary brands (Claude, ChatGPT, Gemini...). Times `at` 0.3 to ~3.6 s, `readAt` after the last "me" message, `hookEnd` ~0.5 s later, `stingerEnd` = hookEnd + 0.8.
2. Montage = real footage only, never generated HTML/HyperFrames filler (Korede). Clip library: `assets/edit-clips/*.mp4` (1080x1920, ~1 s, gitignored) + `manifest.json` (file, brand, source, at). Grow it with:
   - `node scripts/edit-clips-record.mjs [ids]`: Playwright screen recordings of real product pages (edit PAGES). chatgpt.com and openai.com serve a bot check to headless Chrome; use official OpenAI demo videos instead.
   - `~/.local/whisper-venv/bin/python scripts/edit-clips-extract.py <video> --brand claude --source "<url> (<channel>: <title>)" [--max 6] [--id yt-<id>]`: cuts UI/code/terminal shots out of official demo videos (yt-dlp, video only), skipping faces, static frames and cuts, cropping the busiest 9:16 window.
   - Review a contact sheet of new clips and delete title cards, faces and blank pages (then drop missing files from the manifest).
3. Track: Korede's Destroy Lonely session folders in ~/Downloads/Destroy Lonely Leaks (If Looks Could Kill / NO STYLIST first) or the reference audio; copy to `assets/edit-audio/` (gitignored). Find the hardest drop (RMS jump) and the tempo; different track per edit.
4. render.json: `{ "template": "edit", "data": { thread, readAt, readTime, timeLabel, brand, brandAccent, hookEnd, stingerEnd, duration: 12, seed, music: { file: "../../../assets/edit-audio/<x>.mp3", drop, bpm, volume: 1 }, montage: { brands: ["claude"], avoid?: ["web-gh-"] } } }`. One clip per half-beat from the drop (override with `montage.cut`); music start = drop - stingerEnd so the drop hits the first cut. For a steady loop use `music.start` instead of `drop`.
5. `node scripts/render-edit.mjs <post>` writes video.mp4, poster.png and montage.json (the cut list with sources). Check the WHOLE video at 4 fps (`ffmpeg -ss 4.5 -i video.mp4 -vf "fps=4,scale=120:213,tile=15x2" -frames:v 1 sheet.png`), not stills. Note the track and footage credits in copy.md Notes.
6. Caption: 5 hashtags only (+ #fyp on TikTok; on @koredekola hashtags + #explore #K2E, no #ai). The track is baked in, so no catalog song on Instagram.
7. Trials: `trials.json` with `noHook: true` and 3 hashtag sets. @koredekola.ai: `node scripts/trial-variants.mjs <post> --n 3 --noHook --noSfx --out content/_trials/ai-<post-id>`; @koredekola: `--n 2 --seed 2 --out content/_trials/kk-<post-id>`. Schedule with `platformSpecificContent: { [accountId]: { instagram_trial_reel: true } }` (TikTok: `{ tiktok_privacyStatus: "PUBLIC_TO_EVERYONE" }`), >= 90 min from other posts on the account (TikTok >= 2 h).
