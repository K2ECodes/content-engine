# Content Systems.ai content engine: standing rules

Plans, produces and queues social content for Content Systems.ai. Owner: Korede Kolawole (co-founder, CTO). Read this before every session. Rules marked LINT are enforced by `npm run lint`; a post that fails lint never gets queued.

## Company
- Content Systems.ai builds AI systems and phased AI transformations for logistics/3PL companies and e-commerce brands, plus AI education (workshops, webinars) for business owners.
- Goal: the go-to name and thought leader in AI for logistics and e-commerce.
- Tagline: "Purposeful Systems. Lasting Contentment."
- Tone: professional, direct, calm authority, structured, precise, wealth-coded. No hype, no fluff.

## Channels and cadence (per ISO week, America/New_York)
| Channel id | Account | Posts/week | Voice |
|---|---|---|---|
| `li-personal` | Korede's LinkedIn | 7 | POV, founder stories, technical insight from building systems |
| `li-company` | Content Systems.ai LinkedIn | 5 | Proof, frameworks at a high level, case-style breakdowns |
| `ig-company` | Content Systems.ai Instagram | 14 (2/day, at least 4 videos) | Visual explainers, carousels, short videos |

Formats: `static`, `carousel`, `video`. Vary aspect ratios across the week (1:1, 4:5, 9:16) on every channel; set `aspect` in `meta.json`. Default slots live in `config/channels.json`.

## Content rules
- Topics: our business (logistics/3PL, e-commerce, AI systems) plus what's trending in AI right now. Each week starts with fresh research (`content/<week>/trends.md`, sources and dates cited, nothing older than 14 days) and the plan mixes trending stories into the pillars, always tied back to what it means for operators.
- Pillars: `belief-shift` ("if you believe X, it's costing you Y"), `tools-vs-systems`, `calm-playbooks` (for overwhelmed founders), `operational-clarity`, `case-studies` (results from systems). Angle everything at logistics/3PL and e-commerce operators.
- One topic, 3 executions: `proof`, `mistakes`, `checklist`. Batch by topic.
- Every post ends with exactly 1 CTA (`cta_type` in `meta.json`, options and URLs in `config/offers.json`). The job of the CTA is to capture information: comments, form fills, bookings, sign-ups. Give a freebie when it earns the information.
- About 1 in 3 posts is a lead post with a comment-keyword CTA ("Comment SYSTEMS and I'll send it"). Record it as `lead: true`, `cta_type: comment-keyword`, `cta_keyword`. LINT: the keyword must appear in the caption. The freebie must exist (or be built and listed in `config/offers.json`) before the post is approved.
- Push the workshop 2 to 3 times per channel per week while a date is open.
- Instagram captions can't link: use "link in bio" or a comment keyword there.
- Don't give full frameworks away. No generic AI tips, no over-teaching. Position authority, attract qualified founders.
- Never name a client or show a client logo. Refer to clients by industry and location only: "an e-commerce client we work with, based out of Austin", "a 3PL we work with in New Jersey". Results and numbers are fine, identities never.

## House style (all LINT, errors unless noted)
- Zero em dashes and zero en dashes. Use commas, periods, "to" or a middot.
- No exclamation marks. No percent signs in prose (write "40 in 100", "4 in 10" or rephrase).
- Banned: "purpose-led", "human-first", "responsible AI", "second brain" (say "company brain"), "AI consulting firm", "AI agency".
- Always "Content Systems.ai" (lowercase ".ai"). The bare domain contentsystems.ai is fine in links.
- Numerals over spelled-out numbers (warning for "one", error for the rest).
- Contractions everywhere they fit (warning).
- No motivational closers (warning, heuristic on the last line).
- Limits: LinkedIn 3000 chars (aim 900 to 1500, warning outside), Instagram caption 2200. Hashtags: 10 to 15 on LinkedIn, exactly 5 on IG.

## Proof bank (from contentsystems.ai/case-studies, anonymised)
Use only these numbers unless Korede supplies more. Never invent results.
- An e-commerce D2C apparel brand we work with, based out of Berlin: 72 in 100 support tickets handled autonomously across 4 languages, 1 in 4 cancellation attempts retained, €180K annual revenue recovered, paid for itself in Q1. Stack: Shopify Plus, Gorgias.
- A wellness practice we work with near Boston, 5 locations: 28 hours a week reclaimed per location, $340K a year in admin cost, no-shows from 23 to 12 in 100, 2 new locations with 0 admin hires.
- A psychiatry practice we work with in Middlesex County, NJ: 40 in 100 more patient capacity with 0 clinical hires, wait time 8 weeks to 4, 92 in 100 insurance verifications autonomous, $480K added annual revenue.
- A 4-agent real estate team we work with in Austin: lead response from 4 hours to 3 minutes, close rate 3.2x, $14.7M added GCI in year 1, 0 agents hired.
- Our own company runs on 100+ AI employees (content, lead response, onboarding, ads). Fair game for founder stories.
- Logistics angles from contentsystems.ai/logistics (unbilled storage and accessorial fees, month-end billing, WISMO, RFQ speed, receiving by email) and /ecommerce (3PL invoice overcharges, carrier surcharges, stockouts, returns) are positioning, not client results.
- Every system: human approval gate on outbound actions, built on the client's existing stack, client owns what we build.

## Brand
- Logo files in `assets/brand/`: `mark.png` (bulb, transparent), `lockup-horizontal.png` (bulb + wordmark), `wordmark.png`, `*-square.png` (625px), `bg-dark-marble.jpg` (dark green marble with gold circuit lines, background for dark layouts).
- Colors: ink-green `#17281C`, cream `#F5F0E8`, orange `#C98A3C`, gold `#E8B84B`, sage `#9CCAA0`.
- Fonts (Google Fonts): Orbitron (display), Rajdhani Bold (headlines), Space Mono (eyebrows, labels), JetBrains Mono (code, data), Playfair Display (pull quotes).
- Don't redraw or recolour the logo.

## Post folder contract
Every post lives in `content/<YYYY-Www>/<post-id>/`:
- `copy.md`: sections `## Caption` (the published text, counted for limits), optional `## Slides`, `## Script`, `## On-screen`, `## Alt text`, and `## Notes` (internal, not linted).
- `meta.json`: `channel`, `format`, `pillar`, `execution`, `topic`, `lead`, `cta_keyword`, `slot` (local `YYYY-MM-DDTHH:mm`), `timezone` (`America/New_York`), `status`, `media`.
- Media files rendered next to them.
- Post id: `<channel>-<ddd>-<hhmm>-<slug>`, for example `li-personal-mon-0800-wms-mistakes`.
- Status flow: `draft` → `linted` → `approved` (by Korede) → `queued` (held in Schedchie) → `published`.

## Media
- Statics and carousels: HTML/CSS in `templates/`, rendered to PNG with Playwright.
- Videos: branded motion graphics, burned-in captions, voiceover optional later.
- AI images, footage and B-roll: kie.ai. Key is `KIE_API_KEY` in `.env`. Never print, log or commit it. Read kie.ai's current docs before changing the client; don't guess endpoints, models or parameters. Every generation appends a cost line to `logs/kie-costs.jsonl`.

## Publishing (Schedchie MCP, https://mcp.schedchie.com/mcp)
- First list tools and connected accounts, confirm with Korede which is `li-personal`, `li-company`, `ig-company`. If any of the 3 is flagged for reconnection, stop and tell him.
- Approval gate is non-negotiable: every post is created as a held post awaiting approval. Never publish directly, never auto-approve, never use comment, mention or reply tools.
- Only queue posts with `status: approved` that pass lint.
- Weekly: pull analytics, write `reports/<YYYY-Www>.md` (performance by pillar, format, channel), feed it into next week's plan.

## Working rules
- Ask before choices that are costly to undo. Otherwise decide and say what you chose.
- Commit in small steps.
