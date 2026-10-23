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
