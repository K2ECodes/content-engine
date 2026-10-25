#!/usr/bin/env node
// One-off filler (2026-10-25): plan extra trial reels so @koredekola and @contentsystems.ai each reach ~8 a day (Oct 25 to Nov 8, ET),
// around the trials already pending in Schedchie. Reads tmp/ig-pending.json (list_posts dump: [{id, scheduledTime, account}]),
// writes tmp/trial-fill-plan.json: [{account, accountId, file, caption, coverMs, scheduledTime, source, variant}].
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pending = JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp/ig-pending.json'), 'utf8'));
const ACC = { koredekola: '17841448447150542', 'contentsystems.ai': '17841418697572654' };
const TARGET = 8, CAND = ['10:45', '15:00', '17:00', '21:30', '07:00', '09:00', '19:00', '13:00', '23:00'];
const days = []; for (let d = new Date(Date.UTC(2026, 9, 25)); d <= new Date(Date.UTC(2026, 10, 8)); d = new Date(d.getTime() + 864e5)) days.push(d.toISOString().slice(0, 10));
const etOffset = (ymd) => (ymd < '2026-11-01' ? 4 : 5);   // EDT until Nov 1, then EST
const toUtc = (ymd, hm) => { const [h, m] = hm.split(':').map(Number); const t = new Date(`${ymd}T00:00:00Z`); t.setUTCHours(h + etOffset(ymd), m); return t; };
const now = Date.now() + 30 * 60e3;

function slotsFor(account) {
  const out = {};
  for (const ymd of days) {
    const taken = pending.filter((p) => p.account === account).map((p) => new Date(p.scheduledTime)).filter((t) => {
      const e = new Date(t.getTime() - etOffset(ymd) * 3600e3); return e.toISOString().slice(0, 10) === ymd; });
    const chosen = [];
    for (const hm of CAND) {
      if (taken.length + chosen.length >= TARGET) break;
      const t = toUtc(ymd, hm);
      if (t.getTime() < now) continue;
      if ([...taken, ...chosen].some((x) => Math.abs(x - t) < 90 * 60e3)) continue;
      chosen.push(t);
    }
    out[ymd] = { taken, chosen: chosen.sort((a, b) => a - b) };
  }
  return out;
}

const variants = (dir) => JSON.parse(fs.readFileSync(path.join(ROOT, dir, 'manifest.json'), 'utf8')).variants;
const plan = [];

// @koredekola: rotate the reposts; the 9-5 reel (best performer) may run twice a day, 8 h apart
const K = process.env.ONLY === 'contentsystems.ai' ? Object.fromEntries(days.map((d) => [d, { chosen: [] }])) : slotsFor('koredekola');
const R = ['repost-DZyUxjDoSZq', 'repost-DYuu26hICVf', 'repost-DY3SB5hooE-', 'repost-DaS4WlAonlL', 'repost-DYoB0fMoIEk'].map((s) => ({ s, v: variants(`content/_trials/${s}`), i: 0 }));
for (const ymd of days) {
  const order = [R[0], R[1], R[2], R[3], R[4], R[0]];
  let first95 = null;
  K[ymd].chosen.forEach((t, k) => {
    let src = order[k % order.length];
    if (src === R[0] && first95 && t - first95 < 8 * 3600e3) src = R[1 + (k % 4)];
    if (src === R[0]) first95 = first95 || t;
    const v = src.v[src.i++ % src.v.length];
    plan.push({ account: 'koredekola', accountId: ACC.koredekola, source: src.s, variant: v.id, file: v.file, caption: v.caption, coverMs: v.coverMs, scheduledTime: t.toISOString() });
  });
}

// @contentsystems.ai: round-robin over company + what-if sources, max once per source per day, skip a source that already runs that day
const ONLY = process.env.ONLY;
const C = ONLY === 'koredekola' ? Object.fromEntries(days.map((d) => [d, { chosen: [] }])) : slotsFor('contentsystems.ai');
const CS = fs.readdirSync(path.join(ROOT, 'content/_trials')).filter((d) => d.startsWith('co-') && fs.existsSync(path.join(ROOT, 'content/_trials', d, 'manifest.json'))).map((s) => ({ s, v: variants(`content/_trials/${s}`), i: 0 }));
const caps = JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp/co-captions.json'), 'utf8'));
let rr = 0;
for (const ymd of days) {
  const used = new Set();
  for (const t of C[ymd].chosen) {
    let tries = 0, src;
    do { src = CS[rr++ % CS.length]; tries++; } while ((used.has(src.s) || src.i >= src.v.length) && tries < CS.length * 2);
    if (src.i >= src.v.length) continue;
    used.add(src.s);
    const v = src.v[src.i++];
    plan.push({ account: 'contentsystems.ai', accountId: ACC['contentsystems.ai'], source: src.s, variant: v.id, file: v.file, caption: caps[src.s][(src.i - 1) % caps[src.s].length], coverMs: v.coverMs, scheduledTime: t.toISOString() });
  }
}
fs.writeFileSync(path.join(ROOT, 'tmp/trial-fill-plan.json'), JSON.stringify(plan, null, 1));
const count = {}; for (const p of plan) { const k = `${p.account} ${p.scheduledTime.slice(0, 10)}`; count[k] = (count[k] || 0) + 1; }
console.log(plan.length, 'planned'); console.log(count);
