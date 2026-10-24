---
name: you-decide-reel
description: Make an interactive "you decide" reel series (episode 1 ends on an A/B choice, viewers comment A or B, episode 2 follows the winning choice), realistic or gamified. Renders via templates/story.
---

# You-decide reel (series)

Read research/ig-inspiration-2026-10-24.md and the what-if-reel skill (same 2 types, same realism rules).

- Episode 1 (20 to 35 s): a second-person situation with a clock ("You run a warehouse in Tampa. A hurricane watch just went up."), 1 to 3 grounded facts, then "You get 1 move", Option A, Option B, "Comment A or B. Part 2 shows what happens." The two options must both be defensible; the truth decides in part 2.
- Realistic: `hud` scene with `opts [{text, at: "Option"}, {text, at: "Option#2"}]` over a photoreal still, sourced stats on the stages before it, no offer CTA.
- Gamified: `choice` scene `{level "DAY 1 · LEVEL 1", q "You get *1 decision.*", a {text, emoji, at}, b {text, emoji, at}, voteAt "Comment", timer: true, fine "A game. Not real news."}`: game buttons, countdown ring, COMMENT A OR B banner. Can funnel to a freebie in the caption.
- Episode 2: count A/B comments 24 h after posting, script the winning path (consequences with real data), end on the next choice. Post as a linked reel series. Log the vote and the episode in the post's Notes.
- Never put real people in fake situations as fact: label fiction about real companies on screen ("A game. Not real news.").
Examples: content/2026-W46/ig-personal-thu-1230-you-decide-anthropic-ceo-ep1, ig-company-tue-1900-you-decide-3pl-peak-ep1 (gamified); ig-personal-fri-1230-you-decide-ai-spent-4000, ig-company-sat-1700-you-decide-hurricane-warehouse (realistic).
