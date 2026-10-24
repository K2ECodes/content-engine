#!/usr/bin/env node
// Trial-reel variants of a finished reel (research/trial-reels.md). Each variant changes 3+ elements, chosen by seed:
// zoom + reframe, colour grade, speed (pitch kept), start trim, audio level + optional opening SFX hit, hook line on screen
// for the first ~2.2 s (from <post>/trials.json hooks), cover frame. Never mirrors (our videos carry text and faces).
//   node scripts/trial-variants.mjs <post> [--n 10] [--seed 1] [--hookY 1330] [--out content/_tiktok/<post-id>]
// <post>/trials.json (optional): { "hooks": [...], "captions": [...], "hookY": 300, "noHook": false, "reframeX": 0, "maxZoom": 1.06 }
// Writes content/_trials/<post-id>/vNN.mp4 + manifest.json (kept out of the main post folder).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const post = path.resolve(process.argv[2] || '');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const N = Number(arg('n', 10)), SEED = Number(arg('seed', 1));
const src = path.join(post, 'video.mp4');
if (!fs.existsSync(src)) { console.error(`no video.mp4 in ${post}`); process.exit(1); }
const cfg = fs.existsSync(path.join(post, 'trials.json')) ? JSON.parse(fs.readFileSync(path.join(post, 'trials.json'), 'utf8')) : {};
const hooks = cfg.noHook ? [] : (cfg.hooks || []);
const HOOK_Y = Number(arg('hookY', cfg.hookY ?? 1330));   // per post: place the hook pill where the video has no text of its own
const out = arg('out') ? path.resolve(ROOT, arg('out')) : path.join(ROOT, 'content/_trials', path.basename(path.resolve(post)));   // trial variants live apart from main posts (Korede: never post a trial as a main)
fs.mkdirSync(out, { recursive: true });

// small deterministic PRNG (mulberry32)
const rng = (s) => () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const between = (r, a, b) => a + r() * (b - a);
const pick = (r, list) => list[Math.floor(r() * list.length)];

const GRADES = [
  { name: 'punch', vf: 'eq=contrast=1.08:saturation=1.12:brightness=0.01' },
  { name: 'warm', vf: 'colorbalance=rs=0.04:gs=0.01:bs=-0.04:rm=0.03:bm=-0.03,eq=saturation=1.05' },
  { name: 'cool', vf: 'colorbalance=rs=-0.03:bs=0.04:bm=0.03,eq=contrast=1.04' },
  { name: 'film', vf: 'eq=contrast=1.06:saturation=0.92:gamma=0.97,colorbalance=rh=0.02:bh=-0.02' },
  { name: 'bright', vf: 'eq=brightness=0.03:contrast=1.03:saturation=1.06' },
  { name: 'moody', vf: 'eq=brightness=-0.02:contrast=1.1:saturation=0.97,vignette=PI/6' },
];
const SFX = ['impact-soft-1.wav', 'impact-soft-2.wav', 'ding-1.wav', 'chime-1.wav'].map((f) => path.join(ROOT, 'assets/sfx/kit', f)).filter((f) => fs.existsSync(f));

const probe = (f, q) => spawnSync('ffprobe', ['-v', 'error', ...q, '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout.trim();
const dur = Number(probe(src, ['-show_entries', 'format=duration']));
const hasAudio = !!probe(src, ['-select_streams', 'a', '-show_entries', 'stream=index']);

// hook overlays: rendered once per hook with Playwright (Space Grotesk, dark glass pill), transparent PNG 1080x1920
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const browser = hooks.length ? await chromium.launch() : null;
async function hookPng(text, file) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.setContent(`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=block" rel="stylesheet">
  <style>html,body{margin:0;background:transparent}.p{position:absolute;left:70px;right:70px;top:${HOOK_Y}px;display:flex;justify-content:center}
  .p span{font:700 58px/1.12 'Space Grotesk',sans-serif;letter-spacing:-0.03em;color:#fff;text-align:center;background:rgba(14,22,17,.82);border:2px solid rgba(255,255,255,.28);
  padding:22px 34px 26px;border-radius:26px;box-shadow:0 18px 40px rgba(0,0,0,.45)}</style></head><body><div class="p"><span>${esc(text)}</span></div></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

// per-post seed so two posts never get the same variant settings; rng warmed up (sequential seeds start correlated)
const fnv = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const POST_SEED = fnv(path.basename(post)) + SEED * 7919;
const SPEEDS = [0.97, 1.02, 0.98, 1.03, 0.99, 1.01];
const manifest = { post: path.relative(ROOT, post), source: 'video.mp4', duration: dur, created: new Date().toISOString(), aiLabel: false, variants: [] };   // Korede 2026-10-24: never set Instagram's AI label
for (let i = 1; i <= N; i++) {
  const r = rng(POST_SEED + i * 104729); r(); r(); r();
  const id = `v${String(i).padStart(2, '0')}`;
  const z = between(r, 1.03, cfg.maxZoom ?? 1.08), oxr = between(r, 0, 1), ox = cfg.reframeX ?? oxr, oy = between(r, 0.15, 0.85);   // reframeX 0 keeps left-aligned titles uncut
  const grade = GRADES[(i - 1 + POST_SEED) % GRADES.length];   // consecutive variants never share a grade
  const speed = SPEEDS[(i - 1 + POST_SEED) % SPEEDS.length];
  const trim = Number(between(r, 0.1, 0.4).toFixed(2));
  const vol = Number(between(r, 0.88, 1.1).toFixed(2));
  const sfx = SFX.length && r() < 0.6 ? pick(r, SFX) : null;
  const hook = hooks.length ? hooks[(i - 1) % hooks.length] : null;
  const caption = cfg.captions?.length ? cfg.captions[(i - 1) % cfg.captions.length] : null;
  const coverMs = Math.round(between(r, 400, Math.min(4000, (dur - 1) * 1000)));
  const file = path.join(out, `${id}.mp4`);

  const cw = `iw/${z.toFixed(4)}`, ch = `ih/${z.toFixed(4)}`;
  let vchain = `[0:v]trim=start=${trim},setpts=PTS-STARTPTS,crop=${cw}:${ch}:(iw-${cw})*${ox.toFixed(3)}:(ih-${ch})*${oy.toFixed(3)},scale=1080:1920:flags=lanczos,${grade.vf},setpts=PTS/${speed}`;
  const inputs = ['-i', src];
  let n = 1;
  if (hook) {
    const png = path.join(out, `${id}-hook.png`);
    await hookPng(hook, png);
    inputs.push('-loop', '1', '-t', '2.6', '-i', png);
    vchain += `[base];[${n}:v]format=rgba,fade=t=in:st=0:d=0.15:alpha=1,fade=t=out:st=2.1:d=0.3:alpha=1[hk];[base][hk]overlay=0:0:eof_action=pass:enable='lte(t,2.45)'[v]`;
    n++;
  } else vchain += '[v]';
  const filters = [vchain];
  const maps = ['-map', '[v]'];
  if (hasAudio) {
    let a = `[0:a]atrim=start=${trim},asetpts=PTS-STARTPTS,atempo=${speed},volume=${vol}`;
    if (sfx) { inputs.push('-i', sfx); a += `[am];[${n}:a]volume=0.22,adelay=60|60[sx];[am][sx]amix=inputs=2:normalize=0:duration=first`; n++; }
    filters.push(`${a},aresample=48000[a]`);
    maps.push('-map', '[a]');
  }
  const res = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), ...maps,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', file], { stdio: 'inherit' });
  if (res.status) { console.error(`ffmpeg failed on ${id}`); process.exit(1); }
  const changes = [`zoom ${z.toFixed(3)} reframe ${ox.toFixed(2)}/${oy.toFixed(2)}`, `grade ${grade.name}`, `speed ${speed}x`, `trim ${trim}s`, `audio x${vol}${sfx ? ` + ${path.basename(sfx)}` : ''}`];
  if (hook) changes.unshift(`hook "${hook}"`);
  manifest.variants.push({ id, file: path.relative(ROOT, file), hook, caption, coverMs, changes });
  console.log(`${id}: ${changes.join(' · ')}`);
}
if (browser) await browser.close();
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`wrote ${N} variants + manifest in ${path.relative(ROOT, out)}`);
