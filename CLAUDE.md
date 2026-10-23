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

Formats: `static`, `carousel`, `video`. Video aspect: 9:16 for IG, 1:1 or 4:5 for LinkedIn. Default slots live in `config/channels.json`.

## Content rules
- Pillars: `belief-shift` ("if you believe X, it's costing you Y"), `tools-vs-systems`, `calm-playbooks` (for overwhelmed founders), `operational-clarity`, `case-studies` (results from systems). Angle everything at logistics/3PL and e-commerce operators.
- One topic, 3 executions: `proof`, `mistakes`, `checklist`. Batch by topic.
- About 1 in 3 posts is a lead post with a comment-keyword CTA ("Comment SYSTEMS and I'll send it"). Record the keyword in `meta.json` (`lead: true`, `cta_keyword`). LINT: the keyword must appear in the caption.
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
- Limits: LinkedIn 3000 chars (aim 900 to 1500, warning outside), Instagram caption 2200. Hashtags: max 3 on LinkedIn, max 5 on IG.

## Brand
- Colors: ink-green `#17281C`, cream `#F5F0E8`, orange `#C98A3C`, gold `#E8B84B`, sage `#9CCAA0`.
- Fonts (Google Fonts): Orbitron (display), Rajdhani Bold (headlines), Space Mono (eyebrows, labels), JetBrains Mono (code, data), Playfair Display (pull quotes).
- Logo files live in `assets/brand/`. If it's empty when a logo is needed, ask Korede. Don't invent a logo.

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
