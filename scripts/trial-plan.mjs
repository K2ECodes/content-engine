#!/usr/bin/env node
// Spread trial-reel variants over the coming days (research/trial-reels.md, .claude/skills/trial-reels/SKILL.md).
// Eligible: video posts on ig-personal / ig-company with content/_trials/<post-id>/manifest.json. Skips variants already in logs/trial-posts.jsonl.
// Rules: max --perDay (3) per account per day at --times (09:00,13:00,19:00 America/New_York), never 2 variants of the same
// video within 24 h, posts rotate round-robin so every video gets tested.
//   node scripts/trial-plan.mjs [--start 2026-10-25] [--days 7] [--perDay 3] [--times 09:00,13:00,19:00] [--out tmp/trial-plan.json]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const ACCOUNTS = { 'ig-personal': { id: '17841448447150542', name: '@koredekola' }, 'ig-company': { id: '17841418697572654', name: '@contentsystems.ai' } };
const TZ = 'America/New_York';
const tomorrow = new Date(Date.now() + 864e5).toLocaleDateString('en-CA', { timeZone: TZ });
const START = arg('start', tomorrow), DAYS = Number(arg('days', 7)), PER_DAY = Number(arg('perDay', 3));
const TIMES = arg('times', '09:00,13:00,19:00').split(',').slice(0, PER_DAY);
const OUT = path.resolve(ROOT, arg('out', 'tmp/trial-plan.json'));

// local New York wall time -> UTC ISO (DST-safe: correct the guess by the zone's actual offset at that instant)
function nyToUtc(ymd, hm) {
  const [y, m, d] = ymd.split('-').map(Number), [h, mi] = hm.split(':').map(Number);
  let t = Date.UTC(y, m - 1, d, h, mi);
  for (let k = 0; k < 2; k++) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    t += Date.UTC(y, m - 1, d, h, mi) - shown;
  }
  return new Date(t).toISOString();
}
const addDays = (ymd, n) => new Date(Date.parse(`${ymd}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

const logFile = path.join(ROOT, 'logs/trial-posts.jsonl');
const done = new Set(fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean).map((l) => { const j = JSON.parse(l); return `${j.post}#${j.variant}`; }) : []);
const lastAt = {};   // post -> last scheduled time (ms), from the log, so the 24 h rule holds across runs
if (fs.existsSync(logFile)) for (const l of fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean)) { const j = JSON.parse(l); lastAt[j.post] = Math.max(lastAt[j.post] || 0, Date.parse(j.scheduledTime)); }

// collect eligible posts and their unused variants
const pools = {};
for (const week of fs.readdirSync(path.join(ROOT, 'content')).filter((w) => /^\d{4}-W\d{2}$/.test(w)).sort()) {
  for (const id of fs.readdirSync(path.join(ROOT, 'content', week)).sort()) {
    const dir = path.join(ROOT, 'content', week, id), man = path.join(ROOT, 'content/_trials', id, 'manifest.json'), metaF = path.join(dir, 'meta.json');
    if (!fs.existsSync(man) || !fs.existsSync(metaF)) continue;
    const meta = JSON.parse(fs.readFileSync(metaF, 'utf8'));
    if (meta.format !== 'video' || !ACCOUNTS[meta.channel] || meta.trials === 'done') continue;
    const m = JSON.parse(fs.readFileSync(man, 'utf8')), post = path.relative(ROOT, dir);
    const left = m.variants.filter((v) => !done.has(`${post}#${v.id}`));
    if (left.length) (pools[meta.channel] ||= []).push({ post, keyword: meta.cta_keyword || null, left });
  }
}

const plan = [];
for (const [channel, posts] of Object.entries(pools)) {
  let rr = 0;
  for (let day = 0; day < DAYS; day++) for (const hm of TIMES) {
    const ymd = addDays(START, day), when = nyToUtc(ymd, hm), ms = Date.parse(when);
    for (let k = 0; k < posts.length; k++) {
      const p = posts[(rr + k) % posts.length];
      if (!p.left.length || (lastAt[p.post] && ms - lastAt[p.post] < 24 * 3600e3)) continue;
      const v = p.left.shift();
      plan.push({ account: ACCOUNTS[channel].name, accountId: ACCOUNTS[channel].id, post: p.post, variant: v.id, file: v.file.startsWith("content/") ? v.file : path.join("content/_trials", path.basename(p.post), path.basename(v.file)), scheduledTime: when, local: `${ymd} ${hm} ET`,
        hook: v.hook, caption: v.caption, coverMs: v.coverMs, trialReel: true, changes: v.changes });
      lastAt[p.post] = ms; rr = (rr + k + 1) % posts.length;
      break;
    }
  }
}
plan.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(plan, null, 1));
const perDay = {};
for (const p of plan) perDay[`${p.local.slice(0, 10)} ${p.account}`] = (perDay[`${p.local.slice(0, 10)} ${p.account}`] || 0) + 1;
console.log(Object.entries(perDay).map(([k, n]) => `${k}: ${n}`).join('\n'));
console.log(`${plan.length} trial reels planned -> ${path.relative(ROOT, OUT)}`);
const missing = plan.filter((p) => !p.caption).length;
if (missing) console.log(`${missing} have no caption variant (add captions to that post's trials.json)`);
