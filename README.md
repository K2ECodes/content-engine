# content-engine

Plans, produces and queues social content for Content Systems.ai across 3 channels: Korede's LinkedIn, the company LinkedIn and the company Instagram. Standing rules for people and agents are in [CLAUDE.md](CLAUDE.md).

## Setup

```sh
cp .env.example .env   # then add KIE_API_KEY
npm install            # Playwright etc. arrive in phase 2
npm test               # lint self-tests
```

Node 22+. FFmpeg on PATH for video.

## Weekly loop

| Step | Command | Output |
|---|---|---|
| 1. Plan | `npm run plan -- 2026-W44` | `content/2026-W44/plan.md` (reads last week's report) |
| 2. Write | (Claude, from the plan) | `content/2026-W44/<post-id>/copy.md` + `meta.json` |
| 3. Media | `npm run generate`, `npm run render` | PNGs, MP4s in each post folder, costs in `logs/kie-costs.jsonl` |
| 4. Lint | `npm run lint` | must be 0 errors before review |
| 5. Approve | Korede sets `status: approved` | |
| 6. Queue | `npm run queue` + Schedchie MCP | held posts in Schedchie, `status: queued` |
| 7. Report | `npm run report` + Schedchie analytics | `reports/2026-W44.md` |

## Lint

```sh
npm run lint                          # every post in content/
npm run lint -- content/2026-W44      # one week
npm run lint -- path/to/any.md        # style rules on any markdown
npm run lint -- --strict              # warnings fail too
npm run lint -- --json
```

Errors (block queueing): em/en dashes, a hyphen used as a dash, exclamation marks, percent signs, banned phrases, "Content Systems.ai" casing, spelled-out numbers, unpermitted client names, caption length, hashtag count, missing CTA keyword on lead posts, invalid `meta.json`.

Warnings: missing contractions, "one" spelled out, LinkedIn length outside 900 to 1500, motivational closers.

The `## Notes` section of `copy.md` and URLs are never linted. Rules and limits live in `config/style.json`, client names in `config/clients.json`, channels, slots, pillars and statuses in `config/channels.json`.

## Layout

```
CLAUDE.md            standing rules
config/              channels + slots, style rules, client permissions
templates/           static/, carousel/, video/ (HTML/CSS, phase 2)
scripts/             plan, render, generate, lint, queue, report
content/<YYYY-Www>/  plan.md + 1 folder per post
assets/brand/        logo files (supplied by Korede)
logs/                kie-costs.jsonl, queue logs
reports/             weekly analytics reports
tests/               lint self-tests + fixtures
```

## Post folder

```
content/2026-W44/li-personal-mon-0800-wms-mistakes/
  copy.md      ## Caption, ## Slides, ## Script, ## On-screen, ## Alt text, ## Notes
  meta.json    channel, format, pillar, execution, topic, lead, cta_keyword, slot, timezone, status, media
  *.png|*.mp4
```

`meta.json` example:

```json
{
  "channel": "li-personal",
  "format": "carousel",
  "pillar": "tools-vs-systems",
  "execution": "mistakes",
  "topic": "wms-is-not-a-system",
  "lead": true,
  "cta_keyword": "SYSTEMS",
  "slot": "2026-10-26T08:00",
  "timezone": "America/New_York",
  "status": "draft",
  "media": ["slide-01.png", "slide-02.png"]
}
```
