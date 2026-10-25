# Fight card carousel (ref: instagram.com/p/DezNuipk6Jm, Ahmed Alassafi, Oct 2026)

10 slides, every slide a 12 s 1080x1350 video at 30 fps, no audio (music is picked in the app). Caption: Comment "DUET" CTA on line 1, then the story, 5 hashtags.

## Slide by slide (frames checked at 0.2, 4 and 11 s)
1. Cover: photoreal-3D stormy night, a black monolith with the winner's logo glowing orange, the 3 rivals as cute glossy 3D creatures lying defeated and smoking on the rocks. Lightning flickers, smoke drifts. Title bottom: white line 1 + orange line 2 ("Claude just destroyed / Dots, Muse and Grok Bot."), small "Here's what just happened →", handle bottom left, SWIPE bottom right, thin orange progress bar.
2. "THE FIGHT CARD" label, "4 AI agents launched in 10 weeks. Only one wins." Line-up of the 4 mascots (winner bigger, glowing floor), name + company · launch date under each, 2-line sub.
3. ROUND 1 · PRICE · VS DOTS, round ticks under the label. "Duet is 5x cheaper." Loser mascot vs winner, $100/mo struck in red vs $20/mo in orange, product names in mono caps, 2-line explanation.
4. ROUND 2 · THE WORK · VS MUSE: "Muse books your dinner. Duet chases your invoices." Two mascots, two feature lists (grey vs white with orange icons), reviewer quote line ("The first personal agent I'd call a pro tool.", NAME, AFTER TWO WEEKS).
5. ROUND 3 · APPS: 6,000+ vs 4,000+, each as a grid of small squares (orange vs grey, the winner's grid lights up as it plays), app icon row, footnote "each square is 100 apps".
6. ROUND 4 · THE BRAIN · VS ALL: list rows (mascot icon, product, model), an orange highlight box sweeps down the rows and lands on the winner. Quote line.
7. ROUND 5 · INITIATIVE: phone lock screen at 8:02 with 3 stacked notifications from the winner, each lights up in turn. Quote line.
8. ROUND 6 · TRUST: an approval card ("NEEDS YOUR OK", draft message, Not now / Send), a row of action chips (Send, Pay, Sign, Delete) with "always asks you first", a red "BLOCKED, EVEN IF YOU SAY YES · NEVER" box (trading stocks, moving money).
9. THE VERDICT: "6 rounds. 6 wins." Winner mascot, checklist R1 to R6 (round name + one-line result + check), then an honest "Where it still loses:" line.
10. CTA: winner mascot glowing, "Comment / DUET / and I'll DM you the setup guide →", 2-line sub.

## System
- Dark navy page (#121722 to #1d2433 radial), 1 accent = the winner's brand colour, white text, grey secondary. Red only for strikes and the blocked box.
- Small spaced mono label above every title, round ticks, big 2-tone title (white + accent), clean UI cards, quote line in italics with a mono caps attribution, footer: avatar + handle left, "03 / 10" right, accent progress bar along the bottom.
- Motion is subtle and constant: mascots bob, glows pulse, highlight sweeps, grids light up, notifications light in turn, lightning on the cover. Nothing enters from empty, so the first frame is a full thumbnail.
- Why it works: a sports-style head-to-head is easy to follow, every slide has 1 claim and 1 visual proof, the mascots make brand news cute and shareable, the verdict admits where the winner loses (credibility), and the CTA keyword matches the topic.

## Our version
templates/fight-card (render.json "template": "fight"), mascots in assets/mascots/cut/<brand>.png (nano-banana-2 + local rembg cutout), cover scenes assets/mascots/bg-storm.png and bg-arena.png. Our fonts (Space Grotesk, Space Mono, Inter), no fake reviewer quotes (only sourced ones or none), illustrative UI labelled as such.

## Video version: "Team vs Team" scoreboard reel (ref: instagram.com/reel/DetvkNttocS, Omkar Satpute, Big Tech vs open source, 77 s)
- Light, near-white canvas; a dark scoreboard bar pinned at the top (team A score in red, team B in blue, "ROUND 2 OF 5" pill, mini logo badges per side).
- Two side-by-side team cards (red header "BIG TECH" / blue header "OPEN SOURCE"), 3 product rows each with logo + name + 1 fact that fills in per round.
- Round title in large italic serif ("Price.", "Where it runs.", "The brain."), "ROUND N OF 5" small caps above.
- Each round: facts appear on the spoken word, the winning card gets a "POINT" stamp, the loser card dims/tilts away, the score ticks up.
- Black interstitial for the final score ("2:3 Open source wins."), then a twist ("You don't have to pick": one tool runs the others, node diagram), then the engagement CTA "Team Big Tech or team open source? Tell me in the comments", follow pill.
- Calm narrator, one sentence per beat, ~5 rounds, facts dated and sourced in the caption ("checked Oct 18, makers' own pages").
- For us: same mechanics in Content Systems colours (ink-green/cream/gold, team colours = the two sides' brand colours), works as story template scenes: scoreboard + two team cards + POINT stamp + final score card + twist diagram + comment-your-team CTA.
