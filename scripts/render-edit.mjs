#!/usr/bin/env node
// "AI edit" reels (templates/edit, research/style-claude-edit-reel.md): iMessage meme hook -> brand stinger -> fast montage of REAL footage cut to the beat.
//   node scripts/render-edit.mjs <post> [--fps 30]
// Reads <post>/render.json { template: "edit", data: { thread, readAt, brand: "claude", hookEnd, stingerEnd, duration, seed,
//   music: { file, start, volume, drop, bpm }, montage: { brands: ["claude", ...], cut?, avoid?: [file prefixes] } } }.
// Hook + stinger come from templates/edit (HTML, frames 0..stingerEnd). The montage is clips from assets/edit-clips/manifest.json
// (screen recordings + official demo footage, never generated filler), one per half-beat from the drop, graded, with a punch-in on every 4th cut.
// Music start = drop - stingerEnd, so the drop lands on the first montage cut. Writes <post>/video.mp4 (track mixed in at full level) and poster.png.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.resolve(process.argv[2] || '');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const FPS = Number(arg('fps', 30));
const spec = JSON.parse(fs.readFileSync(path.join(dir, 'render.json'), 'utf8'));
const d = structuredClone(spec.data);
const brands = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8'));
const b = brands[d.brand] || {};
d.brand = { id: d.brand, name: d.brandName || b.name, color: b.bg, logoInvert: d.logoInvert ?? true, accentOk: d.brandAccent ?? false,
  logoUrl: pathToFileURL(path.join(ROOT, 'assets/logos', b.logo)).href };
const ff = (args) => { const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...args], { stdio: 'inherit' }); if (r.status) throw new Error('ffmpeg failed'); };

// 1. hook + stinger from the HTML template
const head = path.join(dir, 'video-head.mp4');
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => { throw e; });
  await page.goto(pathToFileURL(path.join(ROOT, 'templates/edit/index.html')).href);
  await page.evaluate((x) => window.renderPost(x), d);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', head], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  const frames = Math.round(d.stingerEnd * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
  }
  enc.stdin.end(); await done; await browser.close();
}

// 2. montage from real clips, one per half-beat
const CLIPS = path.join(ROOT, 'assets/edit-clips');
const man = JSON.parse(fs.readFileSync(path.join(CLIPS, 'manifest.json'), 'utf8'));
const mo = d.montage || {};
const want = mo.brands || [d.brand.id];
const avoid = mo.avoid || [];
let s = (d.seed || 1) * 7919;
const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const pool = man.filter((m) => want.includes(m.brand) && !avoid.some((a) => m.file.startsWith(a)) && fs.existsSync(path.join(CLIPS, m.file)));
for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
// spread sources: never two clips from the same source video back to back
const src = (m) => m.file.replace(/-\d+\.mp4$/, '');
const order = []; const left = [...pool];
while (left.length) { const k = left.findIndex((m) => !order.length || src(m) !== src(order[order.length - 1])); order.push(...left.splice(k < 0 ? 0 : k, 1)); }
const cut = mo.cut || 60 / d.music.bpm / 2;
const montLen = d.duration - d.stingerEnd;
const n = Math.ceil(montLen / cut - 1e-6);
if (order.length < n) throw new Error(`only ${order.length} clips for ${n} cuts (brands ${want})`);
const grade = mo.grade || 'eq=contrast=1.07:saturation=1.08:gamma=0.98';
const inputs = [], parts = [];
for (let i = 0; i < n; i++) {
  const c = order[i], len = Math.min(cut, montLen - i * cut);
  const dur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(CLIPS, c.file)], { encoding: 'utf8' }).stdout) || 1;
  const off = Math.max(0, (dur - len) * rnd());
  inputs.push('-ss', off.toFixed(3), '-t', len.toFixed(3), '-i', path.join(CLIPS, c.file));
  const punch = i % 4 === 3 ? `,scale=1188:2112,crop=1080:1920` : '';   // punch-in accent every 4th cut
  parts.push(`[${i}:v]fps=${FPS},scale=1080:1920,setsar=1${punch},${grade},trim=duration=${len.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
}
const montage = path.join(dir, 'video-montage.mp4');
ff([...inputs, '-filter_complex', `${parts.join(';')};${parts.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0[out]`, '-map', '[out]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), montage]);
fs.writeFileSync(path.join(dir, 'montage.json'), JSON.stringify({ cut, clips: order.slice(0, n).map((c) => ({ file: c.file, source: c.source })) }, null, 1));

// 3. join + music
const silent = path.join(dir, 'video-silent.mp4');
ff(['-i', head, '-i', montage, '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', silent]);
const out = path.join(dir, 'video.mp4');
const m = path.resolve(dir, d.music.file), st = Math.max(0, d.music.start ?? d.music.drop - d.stingerEnd), vol = d.music.volume ?? 1;
ff(['-i', silent, '-ss', String(st), '-i', m, '-filter_complex',
  `[1:a]atrim=0:${d.duration},asetpts=PTS-STARTPTS,volume=${vol},afade=t=in:d=0.05,afade=t=out:st=${d.duration - 0.6}:d=0.6,loudnorm=I=-14:TP=-1:LRA=11[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]);
ff(['-ss', String(d.posterAt ?? 2.6), '-i', out, '-frames:v', '1', path.join(dir, 'poster.png')]);
for (const f of [head, montage]) fs.unlinkSync(f);
console.log(`  wrote ${path.relative(ROOT, out)} (${n} cuts @ ${cut.toFixed(3)} s)`);
