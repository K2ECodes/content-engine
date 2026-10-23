# Research routines (cloud, on autopilot)

2 scheduled Claude Code cloud routines keep `research/` fresh. They clone this repo, research the web, write a dated file, lint it and push to `main`. They only ever write inside `research/`.

| Routine | Schedule | Output |
|---|---|---|
| Daily signal scan | Every day 10:00 UTC (6:00 ET summer, 5:00 ET winter) | `research/daily/YYYY-MM-DD.md` |
| Weekly deep research | Fridays 14:00 UTC | `research/weekly/YYYY-Www.md` (for the coming week) |

The weekly file is the main input to `npm run plan`. Manage the routines at https://claude.ai/code/routines.

## Daily prompt

You're the research desk for Content Systems.ai, which builds AI systems for logistics/3PL companies and e-commerce brands and runs AI workshops for business owners. Read CLAUDE.md and config/offers.json in this repo first.

Find what changed in the last 24 to 36 hours that our audience (US logistics/3PL operators, e-commerce founders, SMB owners curious about AI) would care about:
1. Major AI news: model and product launches, agent tooling, pricing changes, big company moves, regulation.
2. AI applied to logistics, warehousing, freight, fulfillment, returns, customer service, e-commerce ops and marketing.
3. Industry news in logistics and e-commerce where AI or systems are the angle (tariffs, peak season, carrier changes, Shopify/Amazon platform changes).
4. What's trending on LinkedIn and Instagram in AI/business content: formats, hooks, debates.

Use web search and read the primary sources. Every item needs a source URL and a publish date inside the window. Skip anything you can't date. Never invent numbers.

Write `research/daily/<YYYY-MM-DD>.md` (UTC date) with 5 to 10 items, most relevant first. For each: headline, date, source URL, 2 to 3 sentence summary, "why operators should care" in 1 line, and 1 to 2 post angles (channel, format, pillar, execution). End with a "Hot today" section naming the 1 to 2 items worth a same-day reactive post.

House style for the file: no em dashes or en dashes, no exclamation marks, no percent signs (write "4 in 10"), numerals not words. Run `npm run lint -- research/daily/<file>` and fix every ERROR. Then `git add research/daily && git commit -m "Daily research <date>" && git push origin HEAD:main`. If the push is rejected, `git pull --rebase` and push again. Do nothing outside research/.

## Weekly prompt

You're the research lead for Content Systems.ai (AI systems for logistics/3PL and e-commerce, plus AI workshops). Read CLAUDE.md, config/offers.json, every file in research/daily/ from the last 7 days, research/creators.md if present, and the newest file in reports/ if present.

Then do deeper web research on the biggest 3 to 5 themes of the week and on what's working for AI and operations creators on LinkedIn and Instagram right now.

Write `research/weekly/<YYYY-Www>.md` for the COMING ISO week (the one starting next Monday) with:
1. The week in 5 bullets (dated, sourced).
2. 4 to 6 recommended topics, ranked. For each: why now (with sources), pillar, the 3 executions (proof, mistakes, checklist) as 1-line angles, best channel and format per execution, a suggested comment keyword and freebie, and which offer from config/offers.json it sells.
3. Trending formats and hooks seen this week, with example links.
4. Evergreen business topics to fill gaps (3PL billing, WMS vs systems, returns, support load, inventory, AI employees).
5. Dates that matter next week (workshop date in config/offers.json, holidays, industry events, peak season moments).

Use only real, sourced facts. House style: no em or en dashes, no exclamation marks, no percent signs, numerals. Run `npm run lint -- research/weekly/<file>`, fix every ERROR, then commit "Weekly research <week>" and push to main (pull --rebase on rejection). Do nothing outside research/.
