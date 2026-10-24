---
name: trial-reels
description: Make trial-reel variants of finished reels and schedule them on autopilot in Schedchie as Instagram TRIAL reels (@koredekola and @contentsystems.ai). Use when Korede asks to run, top up or check trial reels, or after new reels are rendered.
---

# Trial reels on autopilot

Korede posts the main reels by hand. Schedchie posts **trial reels** of the same videos (shown to non-followers first, promoted automatically if they perform), several variants per video. This is Korede's explicit exception to the held-post rule (CLAUDE.md, 2026-10-24): trial reels publish on their own; everything else stays manual or held. Why each variant must differ: `research/trial-reels.md`.

## 1. Variants (free, local)
1. Write `<post>/trials.json` for each reel: `hooks` (5 to 10 short hook lines, house style, no em dashes or exclamation marks), `captions` (one full caption per hook in the CLAUDE.md caption style: line 1 `Comment "KEYWORD" and I'll send you ...`, then short single-sentence lines each its own paragraph, @mentions where natural, exactly 5 hashtags), and `hookY` (y in 1920 where the hook pill sits without covering the video's own text: check a frame first).
2. `node scripts/trial-variants.mjs <post> --n 10` writes `trials/v01.mp4 ...` and `trials/manifest.json`. Every variant changes 3+ elements: hook pill for the first ~2.4 s, zoom 1.03 to 1.08 + reframe, colour grade (6 presets, never the same twice in a row), speed 0.97 to 1.03 (pitch kept), start trim 0.1 to 0.4 s, audio level, often an extra SFX hit, and a different cover frame. Never mirrored.
3. Check 1 frame per variant (ffmpeg tile) before planning: the hook pill must not cover text or faces.

## 2. Plan
`node scripts/trial-plan.mjs --start <YYYY-MM-DD> --days 7` -> `tmp/trial-plan.json`: max 3 a day per account at 09:00, 13:00, 19:00 ET (swap in Schedchie `get_best_times` when it has data), never 2 variants of the same video within 24 h (also across earlier runs, read from the log), round-robin across videos.

## 3. Schedule (Schedchie MCP)
1. `list_accounts`: stop and tell Korede if the account shows `publishBlocked` or a health status other than `active`. @koredekola `17841448447150542`, @contentsystems.ai `17841418697572654`.
2. For each plan row, right before scheduling:
   - host the file: `upload(file)` from `scripts/lib/kie.mjs` returns a public https URL;
   - `upload_media({ url })` -> descriptor; set `cover: { offsetMs: row.coverMs }` on it;
   - `schedule_post({ text: row.caption, accountIds: [row.accountId], scheduledTime: row.scheduledTime, media: [descriptor], platformSpecificContent: { [row.accountId]: { instagram_trial_reel: true } } })`.
   - **Never set `instagram_is_ai_generated`** (Korede's call). Hashtags are already in the caption text, so don't pass `hashtags` again.
3. Append one line per scheduled post to `logs/trial-posts.jsonl`: `{ post, variant, account, accountId, scheduledTime, schedchiePostId, hook, changes }`.
4. When a reel has had all its variants scheduled, set `"trials": "done"` in its meta.json.

## 4. Learn
After 48 h pull Schedchie analytics (`get_meta_analytics` / `list_live_posts`) for the trial posts in the log, rank hooks by views and watch time, and write the winners into `research/trial-results.md`; reuse winning hooks on the next main posts.

## Rules
- Autopilot covers trial reels only. Carousels, LinkedIn and main reels follow the normal flow.
- Max 3 trial reels per account per day; stop if Instagram reports partial publishes or errors twice in a row.
- No comment, mention or reply tools.
