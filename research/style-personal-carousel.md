# Personal-brand photo carousel (reference: @mr.pynk, instagram.com/p/DeXonrRjhIW, 41.4K followers, 911 comments)

Files in `research/ref-personal-carousel/`: `embed-01..07.png` (feed view, slide by slide), `vid-2..6.mp4` (slides 2 to 6 are 7 to 10 s video slides), `slide-0N-frame.jpg` and `frames-strip.jpg` (a mid frame of each video slide).

## Slide by slide
1. **Cover (image).** Sharp, moody photo of him: dark wood-panel room, grey hoodie, pink glasses, MacBook on his lap, hand on chin. He sits centred in the lower 2/3, head fully in frame around y 45 to 60 of 100. Headline in 2 stacked rectangular blocks near the top, centred: "Claude sucks" white on a solid Claude-orange block, "at content" black on a white block, the 2nd block slightly offset. A big Claude-orange starburst (the topic's logo, not a sticker) sits behind his shoulder, so he's layered over the brand. Payoff box near the bottom: cream fill, orange border, square corners, "These 5 skills fix it." with an orange underline under "5 skills". A thin orange progress bar runs along the bottom edge (about 1/7 of the width).
2. **Skill 1 (video).** Same photo, blurred (still readable as sofa, hoodie, laptop) and slightly darkened. Top left: small orange square-cornered label "Skill 1." and under it a big white condensed title "/ugc-creator". Middle: 2 framed visuals (white border about 10 px, square corners, drop shadow), staggered: 1 lower left, 1 higher right, slightly overlapping columns. Bottom: annotation box, cream fill with orange border, 2 short lines: "Looks like: ..." and "Performs because: ..." with the labels in orange. Progress bar grows.
3. **Skill 2 /documentary.** Same grid; this time 2 landscape frames, staggered top left and bottom right.
4. **Skill 3 /animation.** Same grid, 2 portrait frames.
5. **Skill 4 /commercial.** Same grid, 2 landscape frames.
6. **Skill 5 /skeleton.** Same grid, 2 portrait frames.
7. **CTA (image).** Back to the sharp cover photo and starburst. Blocks: 'Comment "PYNK"' (keyword in pink, the only 2nd accent) on black, "And i send the skills." on the orange block. Progress bar full.

## The system
- **1 photo for the whole carousel.** Sharp on the first and last slides, blurred as the backdrop of every inner slide. That keeps his face as the brand without new shoots.
- **Fixed grid on inner slides:** label + title top left (x about 7 of 100, y 8 to 20), visuals in the middle band (y 22 to 78), annotation box bottom (y 83 to 92), progress bar at the very bottom. Every inner slide is identical in structure, so the eye only reads what changed.
- **Visuals sit on the blur as framed cards:** white borders, square corners, soft shadow, 2 per slide, staggered.
- **Colour:** dark photo + 1 accent (Claude orange) + white/cream. A 2nd accent only on the CTA keyword.
- **Hook formula:** a contrarian claim about a famous tool ("Claude sucks at content") + a numbered fix in the payoff box ("These 5 skills fix it."). The fix is only revealed by swiping.
- **CTA:** a comment keyword on the last slide and in line 1 of the caption.

## How we copy it (templates/photo-carousel, render.json `"template": "photo"`)
- Same structure: cover and CTA = Korede's cutout over his photo or a swapped clean background (loft, library, city-dusk, studio-plants), inner slides = the same photo blurred (`photo.blur: true`).
- Same grid: `label` + `title` top left, `frames` (2 staggered framed screenshots or photos) or `list` cards in the middle, `ann` box at the bottom (`Looks like` / `Why it works`), progress bar.
- Type (Korede's call, 2026-10-24): Inter 600 to 700 with tight tracking (-0.05em) plus Instrument Serif italic for accent words, instead of the reference's heavy condensed face. No sticker bursts.
- Colours: ink-green/gold brand base, gold accent, cream boxes.
