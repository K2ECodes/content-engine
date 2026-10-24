## Posting (updated 2026-10-24)
- Posting is manual for now (Schedchie not connected). Slots in meta.json are a guide, not rigid.
- Posted: W43 li-personal-fri-0800-nothing-sends-without-yes (Oct 23); W43 ig-personal-fri-1230-ai-wont-spend-without-asking (Oct 24).
- Today's picks: content/POST-TODAY.md (W43 leftovers + best Saturday carousels).

## W45 (Nov 2 to Nov 8), built 2026-10-24 overnight
- Research `content/2026-W45/trends.md`, plan `content/2026-W45/plan.md` (33 posts: li-personal 7, li-company 5, ig-company 14 with 4 videos, ig-personal 7 with 4 videos). Lint: 0 errors, 0 warnings.
- Rendered and checked: 20 pixel posts (company covers = problem we fix + free thing, paper world) and 5 personal photo carousels (Sunday's new 1 = 3 free open-source AI tools, repos verified on the GitHub API).
- 8 story videos scripted, voiced free on HeyGen (Korede x5, Sanjana x1, narrator x2), tightened, transcribed, house-style fixed, render.json written (cold-open gag + stop-motion/cinema/pixel/clip scenes, real screenshots + screen recordings), all anchors validated. NOT rendered: listed in `tmp/w45-video-queue.txt` with the Sunday carousel's 2 video slides. Render ONE AT A TIME after the W44 queue.
- Personal reels have no music (sfxGain 1.6). Company reels reuse W44 music beds (no new spend).
- No lip-synced Korede face in the W45 videos yet (paid kie lip-sync): run `node scripts/heygen.mjs talk-segments <post> <windows>` after Korede approves scripts if he wants his face in.
- New demo clips: gh-firecrawl, price-watch-chat-claude, handoff-chat-claude, shopper-check-term-claude (assets/demo-clips).

# Status / handoff (updated 2026-10-23 ~13:00 Berlin)

Read CLAUDE.md first (all Korede's rules are there). This file says what's done and what's left.

## Done (drafts, not yet queued in Schedchie)
- W43 (Fri Oct 23) and W44 (Oct 26 to Nov 1): plans, research, 23 pixel carousels/statics (vibrant 4-world restyle), freebie PDFs (9), workshop curiosity-loop rewrites.
- Videos done: stop-motion (ig-company-fri-1500-sops-portable-stopmotion), 2 arena logo battles (pixel Korede host, no real face), 3 AI-slop reels, 3 Kling 4.0 straight swaps (LFC kit), Mon walmart-vs-amazon story (talking cutout).
- Voices: Korede HEYGEN_INSTANT_VOICE_ID, Sanjana HEYGEN_SANJANA_VOICE_ID, narrator HEYGEN_NARRATOR_VOICE_ID (all free via scripts/lib/heygen.mjs freeSpeech).

## In progress when the session paused
1. 7 company story videos rewritten value-first (voices Korede/Sanjana/narrator): content/2026-W43/ig-company-fri-1800-invoice-gap + W44 ig-company-{mon-1130,sat-1000,sun-1830,thu-1130,tue-1130}*, li-company-tue-1030*. Check each folder: if video.mp4 is older than render.json or audio/vo.wav, re-render: `npm run render -- <dir>` (ONE AT A TIME; wait while `pgrep -f scripts/render.mjs`).
2. Personal visual pass (scene `bg` images + `person` thought-leader cards + logo pops): W44 ig-personal-{mon-1230,fri-1230,sun-0930,tue-1230,wed-1230}*, li-personal-tue-0800*, W43 ig-personal-fri-1230*. Same staleness check + re-render.
3. Latest template changes every story video must have (re-render anything older than templates/story/index.html, 2026-10-23 ~12:50): captions at y 1010 (above thumb), bulb logo centred top, end badge centred, high-contrast worlds.

## After that
- Frame-strip review of every video (ffmpeg -ss T ... hstack), lint all (`npm run lint -- content/2026-W43 content/2026-W44`), commit + push (`git pull --rebase --autostash` first; the cloud research routine pushes daily).
- Phase 4 (only when Korede approves): Schedchie held posts. Company Instagram account in Schedchie needs reconnecting by Korede.
- kie.ai balance is low (~$0.69); top up before any new swaps/lip-syncs.
