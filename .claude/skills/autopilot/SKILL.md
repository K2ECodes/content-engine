---
name: autopilot
description: Schedule TikTok (both accounts) and LinkedIn (both pages) posts on autopilot through Schedchie, alongside the IG trial-reel loop (see trial-reels skill). Use when topping up the TikTok/LinkedIn schedule.
---

# TikTok + LinkedIn autopilot (Korede approved 2026-10-24)

Main IG posts stay manual. Autopilot covers: IG trial reels (trial-reels skill), TikTok (personal + company), LinkedIn (Korede + company page). No AI labels anywhere (tiktok_is_aigc / instagram_is_ai_generated never set true).

Accounts: TikTok personal `-000yrCy6A18Yz1WwdIOKs3muERuL1mEzsw9`, TikTok company `-000ArZBUhhsQppfPpgjaziIAvLSYPsPWaqv`, LinkedIn Korede `acjHaFzZBp`, LinkedIn company `109821772`. Check `list_accounts` first; never schedule onto a publishBlocked account.

## TikTok
1. Eligible: rendered + checked main reels (video.mp4 newer than render.json), not marked HOLD in content/POST-TODAY.md. ig-personal and ig-ai -> personal TikTok (Korede Kola), ig-company -> company TikTok. Instagram split: ig-ai = @koredekola.ai (17841446002300673: carousels + AI-focused videos), ig-personal = @koredekola (17841448447150542: realistic what-if/you-decide + swaps/skits).
2. Files live in `content/_tiktok/<post-id>/` (never in the main folder, never in content/_trials):
   - `node scripts/tiktok-cut.mjs <post> [--music <mp3>] [--vol 0.10]` -> `main.mp4`. Our TikTok accounts can't attach library music (`musicSelectable: false`), so reels without a bed get one mixed in quietly (sidechain-ducked, ~10% under voice). Reuse beds from posts' `audio/music*.mp3`; personal = dark trap or playful, company reels already carry a bed (copy).
   - Variants: `node scripts/trial-variants.mjs <post> --n 2 --out content/_tiktok/<post-id>/variants` (hook pill, grade, zoom, speed, trim; set `hookY` in `<post>/trials.json` so the pill sits on empty space), then mix the bed in for personal ones.
   - Check a frame of every file and loudness (`ebur128`, aim about -14 LUFS).
3. Cadence: 11:00 and 20:00 ET videos, 16:00 ET photo carousel (IG carousel slides, `tiktok_title` <= 90 chars, `tiktok_auto_add_music: true`). Main first; variants of the same reel at least 2 days apart.
4. Caption: the IG caption with @handles turned into plain names, 3 to 5 hashtags. Variants swap line 2 for the variant's hook.
5. platformSpecificContent: `{"<acct>": {"tiktok_privacyStatus": "PUBLIC_TO_EVERYONE"}}` (Korede's choice).
6. IG to TikTok mirror (CLAUDE.md rule, ongoing): every run, check his IG (`list_live_posts` groupId `698137612333f4ab22da6ab2`; skip `viaSchedchie` trial posts) for new feed videos and carousels, including ones he posted by hand, and mirror each to the personal TikTok within 24 h. Skip shortcodes already in `logs/autopilot-posts.jsonl` with `"source": "ig-mirror"`.
   - Files in `content/_mirror/<shortcode>/` (gitignored): videos `yt-dlp -o video.mp4 https://www.instagram.com/reel/<code>/`; carousels from `https://www.instagram.com/p/<code>/embed/captioned/` fetched with an iPhone User-Agent, parse `"contextJSON"` -> `gql_data.shortcode_media.edge_sidecar_to_children[].node.display_url` (video slides: grab a frame as jpg). Save the IG caption as `caption.txt`.
   - Original file, not a trial variant. Videos as video posts; carousels as photo posts with `tiktok_title` (<= 90 chars) and `tiktok_auto_add_music: true`. Caption 1 to 3 lines + `#fyp` and 2 to 4 tags, 😂/🤣 on funny ones, no AI tags on lifestyle/swaps.
   - Slot: the next free 13:00 or 18:00 UTC, at least 2 h from other personal TikTok posts, max 2 mirrors a day. Log with `"source": "ig-mirror", "igShortcode": "<code>"`.
   - Only the latest ~17 IG posts are reachable this way; the TikTok account is on the old connection, so manual TikTok uploads can't be listed (ask Korede if unsure).

## LinkedIn
- Unposted li-personal / li-company posts at their meta.slot (America/New_York -> UTC, mind DST on Nov 1). Carousels as multi-image posts (slide PNGs), statics as 1 image, videos as video. Caption = copy.md Caption with @Company mentions turned into plain names. Skip W43 (manual) and anything Korede posts by hand.

## Upload loop
`upload()` from scripts/lib/kie.mjs gives a public URL -> Schedchie `upload_media(url)` -> `schedule_post`. Verify the first post of each kind with `get_post`. Log every post to `logs/autopilot-posts.jsonl` and add `tiktok_scheduled` / `linkedin_scheduled` to the post's meta.json. Plan file: `tmp/autopilot-plan.json`.

## Notes from the 2026-10-24 top-up
- The company IG account (@contentsystems.ai) is connected through Instagram sign-in, so `search_instagram_audio` and `instagram_audio_id` are refused there. Company trial reels rely on the music bed already in the video; reconnect it with "Continue with Facebook" to attach catalog tracks.
- `trials.json` supports `reframeX: 0` and `maxZoom: 1.06` for videos with left-aligned titles (3D what-if hooks) so the variant crop never cuts the title.
- Light cold-open reels: put the hook pill at `hookY: 1160` (between the characters and the caption pill); dark 3D hooks at `hookY: 1250`.
- Schedchie image ids from `upload_media` must be copied exactly; a typo fails the whole post ("File not found"), re-upload that slide.
