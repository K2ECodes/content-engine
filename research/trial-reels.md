# Trial reels: what has to change between repeat uploads (2026-10-24)

Goal: Korede posts the main reel by hand; Schedchie posts **trial reels** (shown to non-followers first, auto-promoted to followers if they perform) of the same videos on a schedule, so each piece of content gets several fresh tests.

## What Instagram actually does (sourced)
- **Trial reels** test a reel with non-followers before followers see it. Schedchie exposes this as `instagram_trial_reel: true` (REEL only, "graduation strategy SS_PERFORMANCE"); Instagram only offers it to accounts with **1,000+ followers**, otherwise it publishes as a regular reel. @koredekola (1,667) qualifies; @contentsystems.ai (260) does not.
- **Originality ranking.** Since 2022 Instagram ranks original content above reposts, uses classifiers to predict originality, and demotes near-duplicates and watermarked recycled videos ([Tubefilter, Mosseri 2022](https://www.tubefilter.com/2022/04/21/instagram-adam-mosseri-algorithm-change-original-content/)). In April 2026 it extended this: accounts that **mostly** share content they didn't create or meaningfully transform lose recommendations to non-followers ([PetaPixel, Apr 30 2026](https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/), [Communicate Online](https://communicateonline.me/news/instagram-expands-crackdown-on-reposted-content-across-platform/), [Planoly](https://www.planoly.com/blog/new-instagram-updates-this-week.md), [Sociallyin](https://sociallyin.com/blog/instagram-algorithm-update-repost/)).
- Cropping, resizing or a watermark alone does **not** make someone else's video original. That rule is about reposting other people's work; our variants are our own content, so the risk is being read as a near-duplicate of our own earlier post, not as stolen.
- No source says exactly how trial reels of near-identical videos are scored. Treat the following as our working rules, not Instagram policy.

## Working rules for our variants
1. **Change at least 3 elements per variant**, and always at least 1 the viewer notices in the first 2 s:
   - **Hook** (strongest lever): a different hook line on screen for the first ~2 s, plus a different first line of the caption. Trial reels are a hook test, so this is also the thing we learn from.
   - **Picture:** zoom 3 to 8 in 100 with a small reframe, a different colour grade (contrast, saturation, warmth), slight speed change (0.97 to 1.03x).
   - **Sound:** different overall level, an extra SFX hit on the opening, speed change shifts timing (pitch kept).
   - **Edit:** trim 0.1 to 0.4 s off the start so frame 1 differs.
   - **Cover:** a different cover frame (Schedchie `cover.offsetMs`).
2. **Never mirror** anything with text, logos or a face (text reads backwards, faces look off).
3. **Spacing:** max 3 trial reels a day per account, never 2 variants of the same video within 24 h, never the same hook twice.
4. **Labels:** set `instagram_is_ai_generated: true` on realistic AI-made videos (face swaps, the Reply All trailer, realistic what-ifs with photoreal AI stills).
5. **Learn:** log every scheduled variant (hook, grade, time) to `logs/trial-posts.jsonl`; after 48 h compare views per hook and feed the winning hooks into the next main posts.

Tools: `scripts/trial-variants.mjs` (makes the variants), `scripts/trial-plan.mjs` (spreads them over days), `.claude/skills/trial-reels/SKILL.md` (the run loop).
