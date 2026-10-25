#!/usr/bin/env node
// Animate each beat still into a real video clip (kie Kling V3 Turbo image-to-video), so absurd-physics reels move like the reference.
// Reads <post>/prompts.json shots[].motion (skips shots without it), writes <post>/clips/cNN.mp4 (audio stripped).
//   node --env-file=.env scripts/what-if-clips.mjs <post> [--only 0,3] [--force] [--dur 5]
// A shot's own "dur" ("10") overrides --dur for beats longer than ~6 s (cost doubles).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { runTask, upload, download, weekSpendUsd } from './lib/kie.mjs';

const post = process.argv[2];
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const only = arg('only') ? arg('only').split(',').map(Number) : null;
const force = process.argv.includes('--force'), dur = arg('dur') || '5', per = Number(arg('usd') || 0.45);
const P = JSON.parse(fs.readFileSync(path.join(post, 'prompts.json'), 'utf8'));
const cap = Number(process.env.KIE_WEEKLY_CAP_USD || 30);
fs.mkdirSync(path.join(post, 'clips'), { recursive: true });
const todo = P.shots.map((s, i) => ({ ...s, i })).filter((s) => s.motion && (!only || only.includes(s.i)) && (force || !fs.existsSync(path.join(post, `clips/c${String(s.i).padStart(2, '0')}.mp4`))));
const est = todo.reduce((a, s) => a + per * Number(s.dur || dur) / 5, 0);
if (weekSpendUsd() + est > cap) { console.error(`budget: ${weekSpendUsd().toFixed(2)} + ~${est.toFixed(2)} > ${cap}`); process.exit(2); }
await Promise.all(todo.map(async (s) => {
  const out = path.join(post, `clips/c${String(s.i).padStart(2, '0')}.mp4`), raw = out.replace('.mp4', '-raw.mp4');
  const url = await upload(path.join(post, s.out), 'whatif-clips');
  const prompt = `${s.motion} Keep the exact look, character and framing of the image. Realistic physics, smooth continuous camera motion, no text, no morphing, no extra limbs.`;
  const d = await runTask('kling/v3-turbo-image-to-video', { image_urls: [url], prompt, duration: String(s.dur || dur), resolution: '720p' }, { label: `phys clip ${path.basename(post)} c${s.i}`, estimateUsd: per * Number(s.dur || dur) / 5 });
  await download(d.result.resultUrls[0], raw);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-an', '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  fs.unlinkSync(raw);
  console.log('wrote', out);
}));
