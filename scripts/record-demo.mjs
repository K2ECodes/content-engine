#!/usr/bin/env node
// Record real footage for carousel video slides (no static screenshot scrolls):
//   demo: a skill-run replay (templates/demo-run) typed and streamed live, recorded with Playwright recordVideo.
//   web:  a real page (e.g. a GitHub repo) with scrolls and clicks.
// node scripts/record-demo.mjs assets/demo-clips/demos.json [id ...]   -> assets/demo-clips/<id>.mp4 (800x1080, 30 fps, >= 10 s)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [defs, ...only] = process.argv.slice(2);
const list = JSON.parse(fs.readFileSync(defs, 'utf8')).filter((d) => !only.length || only.includes(d.id));
const out = path.join(ROOT, 'assets/demo-clips'), tmp = path.join(ROOT, 'tmp/rec');
fs.mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const d of list) {
  const W = d.w || 800, H = d.h || 1080, MIN = d.min || 10;
  // web pages: a narrow viewport (vw) scaled up to W x H so the page text is readable inside a carousel frame
  const VW = d.vw || W, VH = Math.round(VW * H / W);
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, recordVideo: { dir: tmp, size: { width: VW, height: VH } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  if (d.kind === 'web') {
    await page.goto(d.url, { waitUntil: 'networkidle', timeout: 60000 });
    for (const sel of d.hide || []) await page.addStyleTag({ content: `${sel}{display:none!important}` });
    for (const s of d.steps) {
      if (s.wait) await sleep(s.wait);
      if (s.scroll) { const n = Math.ceil(Math.abs(s.scroll) / 40); for (let i = 0; i < n; i++) { await page.mouse.wheel(0, Math.sign(s.scroll) * 40); await sleep(s.speed || 22); } }
      if (s.click) { const el = page.locator(`${s.click} >> visible=true`).first(); await el.scrollIntoViewIfNeeded(); const b = await el.boundingBox(); if (b) { await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await sleep(250); } await el.click(); await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {}); for (const sel of d.hide || []) await page.addStyleTag({ content: `${sel}{display:none!important}` }); }
    }
  } else {
    await page.goto(pathToFileURL(path.join(ROOT, 'templates/demo-run/index.html')).href);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((x) => { window.renderDemo(x); }, d.data);
    await page.waitForFunction(() => window.demoDone === true, null, { timeout: 30000 });
  }
  const left = MIN * 1000 + 600 - (Date.now() - t0); if (left > 0) await sleep(left); else await sleep(1200);
  const vid = await page.video().path();
  await ctx.close();
  // drop the blank first ~0.5 s (page load), 30 fps, h264
  const dst = path.join(out, `${d.id}.mp4`);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(d.trim ?? 0.5), '-i', vid, '-vf', `scale=${W}:${H}:flags=lanczos`, '-r', '30', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', dst]);
  if (r.status) throw new Error(r.stderr.toString());
  fs.rmSync(vid);
  const dur = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst]).stdout.toString().trim();
  console.log(`${d.id}: ${dur}s`);
}
await browser.close();
