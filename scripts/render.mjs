#!/usr/bin/env node
// Render a post's media from its render.json.
//
//   node scripts/render.mjs <post-dir> [--fps 30] [--frames-only]
//
// render.json: { "template": "static" | "carousel" | "video", "data": { ... } }
// Aspect comes from meta.json (1:1, 4:5, 9:16). Icons are Lucide names (lucide.dev), resolved here
// into inline SVG under the key "<name>Svg" (icon -> iconSvg, loopIcon -> loopIconSvg).
//
// Output, next to render.json:
//   static   -> static.png
//   carousel -> slide-01.png ... slide-NN.png
//   video    -> video.mp4 (H.264, yuv420p, AAC when audio/manifest.json exists) + poster.png
// Run `npm run generate -- audio <post-dir>` first to add voiceover and music.
// meta.json "media" is updated with the files written.

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SIZES = { '1:1': [1080, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920] };
const ICON_DIR = path.join(ROOT, 'node_modules/lucide-static/icons');

function resolveIcons(node) {
  if (Array.isArray(node)) return node.map(resolveIcons);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    out[k] = resolveIcons(v);
    if (/icon$/i.test(k) && typeof v === 'string') {
      const file = path.join(ICON_DIR, `${v}.svg`);
      if (!fs.existsSync(file)) throw new Error(`unknown Lucide icon "${v}"`);
      out[`${k}Svg`] = fs.readFileSync(file, 'utf8');
    }
  }
  return out;
}

async function openTemplate(browser, template, data, aspect) {
  const [w, h] = SIZES[aspect] || (() => { throw new Error(`unsupported aspect "${aspect}"`); })();
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { throw e; });
  await page.goto(pathToFileURL(path.join(ROOT, 'templates', template, 'index.html')).href);
  await page.addStyleTag({ content: `:root{--w:${w}px;--h:${h}px}` });
  await page.evaluate(([d, o]) => window.renderPost(d, o), [data, { aspect }]);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete || new Promise((r) => { i.onload = i.onerror = r; }))));
  return { page, w, h };
}

async function renderStatic(browser, data, aspect, dir) {
  const { page } = await openTemplate(browser, 'static', data, aspect);
  await page.screenshot({ path: path.join(dir, 'static.png') });
  return ['static.png'];
}

async function renderCarousel(browser, data, aspect, dir) {
  const { page } = await openTemplate(browser, 'carousel', data, aspect);
  const files = [];
  for (let i = 0; i < data.slides.length; i++) {
    await page.evaluate((n) => window.showSlide(n), i);
    await page.evaluate(() => Promise.all([...document.images].map((im) => im.complete || new Promise((r) => { im.onload = im.onerror = r; }))));
    const name = `slide-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(dir, name) });
    files.push(name);
  }
  return files;
}

// Voiceover drives timing: each scene lasts at least as long as its line plus breathing room,
// and burned-in captions are rebuilt from the spoken text.
const VO_LEAD = 0.35, VO_TAIL = 0.55;
function chunkCaptions(text, start, duration) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 6 || (/[.,;:?]$/.test(w) && cur.length >= 3)) { chunks.push(cur.join(' ')); cur = []; }
  }
  if (cur.length) chunks.push(cur.join(' '));
  const total = chunks.reduce((n, c) => n + c.length, 0);
  let t = start;
  return chunks.map((c) => { const d = (c.length / total) * duration; const cap = { start: t, end: t + d + 0.15, text: c }; t += d; return cap; });
}

function applyAudio(data, manifest) {
  const vo = new Map(manifest.scenes.map((s) => [s.index, s]));
  let t = 0;
  const captions = [];
  data.scenes = data.scenes.map((s, i) => {
    const v = vo.get(i);
    const dur = Math.max(s.end - s.start, v ? v.duration + VO_LEAD + VO_TAIL : 0);
    const out = { ...s, start: t, end: t + dur };
    if (v) { v.at = t + VO_LEAD; captions.push(...chunkCaptions(v.text, v.at, v.duration)); }
    t += dur;
    return out;
  });
  if (manifest.scenes.length) data.captions = captions;
  return data;
}

function muxAudio(dir, silent, out, manifest, duration) {
  const inputs = ['-i', silent];
  const filters = [];
  const voLabels = [];
  manifest.scenes.forEach((s, i) => {
    inputs.push('-i', path.join(dir, s.file));
    const ms = Math.round(s.at * 1000);
    filters.push(`[${i + 1}:a]aresample=48000,adelay=${ms}|${ms}[v${i}]`);
    voLabels.push(`[v${i}]`);
  });
  let last = null;
  if (voLabels.length) { filters.push(`${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0,asplit=2[vo][key]`); last = '[vo]'; }
  if (manifest.music) {
    const m = manifest.scenes.length + 1;
    inputs.push('-i', path.join(dir, manifest.music.file));
    filters.push(`[${m}:a]aresample=48000,atrim=0:${duration},volume=${manifest.music.volume},afade=t=in:d=0.8,afade=t=out:st=${Math.max(0, duration - 1.8)}:d=1.8[bed]`);
    if (last) {
      filters.push('[bed][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]', '[vo][duck]amix=inputs=2:normalize=0[mix]');
      last = '[mix]';
    } else last = '[bed]';
  }
  filters.push(`${last}loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
  const ff = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '0:v', '-map', '[aout]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(duration), '-movflags', '+faststart', out], { stdio: 'inherit' });
  if (ff.status !== 0) throw new Error('ffmpeg audio mux failed');
}

async function renderVideo(browser, data, aspect, dir, fps) {
  const manifestPath = path.join(dir, 'audio/manifest.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
  if (manifest) data = applyAudio(data, manifest);
  const { page } = await openTemplate(browser, 'video', data, aspect);
  const duration = await page.evaluate(() => window.duration);
  const frames = Math.round(duration * fps);
  const out = path.join(dir, manifest ? 'video-silent.mp4' : 'video.mp4');

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => { window.seek(t); }, f / fps);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r  ${frames} frames, ${duration.toFixed(2)}s at ${fps}fps\n`);
  if (manifest) {
    muxAudio(dir, out, path.join(dir, 'video.mp4'), manifest, duration);
    fs.rmSync(out);
    console.log(`  mixed ${manifest.scenes.length} voiceover lines${manifest.music ? ' + music' : ''}`);
  }

  // Poster: the most legible moment, or 1.5s in.
  await page.evaluate((t) => { window.seek(t); }, data.posterAt ?? 1.5);
  await page.screenshot({ path: path.join(dir, 'poster.png') });
  return ['video.mp4', 'poster.png'];
}


// ---------- split template (research/style-stilesai.md) ----------
const SFX = {
  tick: 'sine=f=1800:d=0.05,volume=0.9,afade=t=out:st=0.01:d=0.04',
  thud: 'sine=f=70:d=0.2,volume=2.5,afade=t=out:st=0.03:d=0.17',
  click: 'anoisesrc=d=0.025:c=white:a=0.7,highpass=f=2500,afade=t=out:st=0:d=0.025',
  key: 'anoisesrc=d=0.03:c=pink:a=0.6,bandpass=f=3200:w=1800,afade=t=out:st=0:d=0.03',
  scratch: 'anoisesrc=d=0.32:c=brown:a=0.8,highpass=f=900,lowpass=f=4500,afade=t=in:d=0.05,afade=t=out:st=0.16:d=0.16',
  roll: 'anoisesrc=d=0.6:c=pink:a=0.35,bandpass=f=1500:w=1200,tremolo=f=30:d=0.8,afade=t=out:st=0.3:d=0.3',
  print: 'anoisesrc=d=0.28:c=white:a=0.3,bandpass=f=2500:w=2000,tremolo=f=45:d=0.9,afade=t=out:st=0.18:d=0.1',
  whoosh: 'anoisesrc=d=0.35:c=pink:a=0.6,highpass=f=400,lowpass=f=3000,afade=t=in:d=0.15,afade=t=out:st=0.15:d=0.2',
};
function sfxFile(kind) {
  const dir = path.join(ROOT, 'assets/sfx');
  const f = path.join(dir, `${kind}.wav`);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(dir, { recursive: true });
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', SFX[kind], '-ar', '48000', '-ac', '2', f]);
  }
  return f;
}

const norm = (w) => w.toLowerCase().replace(/[^\w$.%]/g, '').replace(/\.$/, '');
function wordTime(words, anchor, label) {
  if (typeof anchor === 'number') return anchor;
  const [text, nth] = String(anchor).split('#');
  const target = text.split(/\s+/).map(norm);
  let seen = 0;
  for (let i = 0; i < words.length; i++) {
    if (target.every((t, k) => words[i + k] && norm(words[i + k].w) === t) && ++seen === Number(nth || 1)) return words[i].start;
  }
  throw new Error(`split: anchor "${anchor}" (${label}) not found in the transcript`);
}

function resolveSplit(dir, spec) {
  const d = structuredClone(spec.data);
  const words = JSON.parse(fs.readFileSync(path.join(dir, d.words), 'utf8')).words;
  const voiceSrc = d.audio ? path.join(dir, d.audio) : d.plate && /\.(mp4|mov|m4v)$/i.test(d.plate.src) ? path.join(dir, d.plate.src) : null;
  const audioDur = voiceSrc ? probeSeconds(voiceSrc) : 0;
  d.duration = Math.max(audioDur, words.at(-1).end + (d.tail ?? 1.6));
  d.words = words;
  d.beats = d.beats.map((b, i) => {
    const at = wordTime(words, b.at, `beat ${i}`);
    const out = { ...b, t: Math.max(0, b.type === 'hero' ? at - 0.6 : at - 0.1) };
    if (b.type === 'hero') out.land = at;
    if (b.items) out.items = b.items.map((it, k) => ({ ...it, t: it.at !== undefined ? wordTime(words, it.at, `beat ${i} item ${k}`) : undefined }));
    return out;
  }).sort((a, b) => a.t - b.t);
  if (d.plate) {
    const isVideo = /\.(mp4|mov|m4v)$/i.test(d.plate.src);
    d.plate = isVideo ? { kind: 'video', file: path.join(dir, d.plate.src) } : { kind: 'image', src: pathToFileURL(path.join(dir, d.plate.src)).href };
  }
  return { data: d, voiceSrc };
}

function probeSeconds(f) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]);
  return Number(String(r.stdout).trim()) || 0;
}

function mixAudio({ dir, silent, voiceSrc, sfx, music, lastWordEnd, duration }) {
// Audio: voice first, short dry SFX about 20 dB under, optional music bed ducked under speech.
  const ain = [], af = [], mix = [];
  let n = 1; // input 0 is the silent video
  if (voiceSrc) { ain.push('-i', voiceSrc); af.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo[vo]`); n++; }
  const kinds = [...new Set(sfx.map((c) => c.kind))];
  for (const k of kinds) {
    const cues = sfx.filter((c) => c.kind === k && c.t < duration);
    if (!cues.length) continue;
    ain.push('-i', sfxFile(k));
    af.push(`[${n}:a]asplit=${cues.length}${cues.map((_, i) => `[${k}${i}]`).join('')}`);
    cues.forEach((c, i) => { const ms = Math.round(c.t * 1000); af.push(`[${k}${i}]adelay=${ms}|${ms},volume=0.12[${k}d${i}]`); mix.push(`[${k}d${i}]`); });
    n++;
  }
  let musicLabel = null;
  if (music?.file) {
    ain.push('-i', path.join(dir, music.file));
    af.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${duration},volume=${music.volume ?? 0.07},afade=t=out:st=${Math.max(0, lastWordEnd)}:d=0.3[bed]`);
    musicLabel = '[bed]'; n++;
  }
  const parts = [];
  if (voiceSrc) { af.push('[vo]asplit=2[vo1][key]'); parts.push('[vo1]'); }
  if (mix.length) { af.push(`${mix.join('')}amix=inputs=${mix.length}:normalize=0[sfx]`); parts.push('[sfx]'); }
  if (musicLabel) {
    if (voiceSrc) { af.push(`${musicLabel}[key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck]`); parts.push('[duck]'); }
    else parts.push(musicLabel);
  } else if (voiceSrc) af.push('[key]anullsink');
  const out = path.join(dir, 'video.mp4');
  if (!parts.length) { fs.renameSync(silent, out); }
  else {
    af.push(`${parts.join('')}amix=inputs=${parts.length}:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[aout]`);
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', silent, ...ain, '-filter_complex', af.join(';'), '-map', '0:v', '-map', '[aout]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(duration), '-movflags', '+faststart', out], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('ffmpeg split audio mix failed');
    fs.rmSync(silent);
    console.log(`  mixed voice + ${sfx.length} sfx cues${musicLabel ? ' + music' : ''}`);
  }
}

async function renderSplit(browser, spec, dir, fps) {
  const { data, voiceSrc } = resolveSplit(dir, spec);
  const { page } = await openTemplate(browser, 'split', data, '9:16');
  const duration = data.duration, frames = Math.round(duration * fps);
  const sfx = await page.evaluate(() => window.sfx);
  const silent = path.join(dir, 'video-silent.mp4');

  const inputs = [], pre = [];
  if (data.plate?.kind === 'video') {
    inputs.push('-i', data.plate.file);
    pre.push(`[0:v]fps=${fps},scale=1080:1152:force_original_aspect_ratio=increase,crop=1080:1152,setsar=1[pl]`,
      `color=c=0xF5F0E8:s=1080x1920:r=${fps}:d=${duration}[bg]`, '[bg][pl]overlay=0:768:eof_action=repeat[base]');
  } else {
    inputs.push('-f', 'lavfi', '-i', `color=c=0xF5F0E8:s=1080x1920:r=${fps}:d=${duration}`);
    pre.push('[0:v]null[base]');
  }
  inputs.push('-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', [...pre, '[base][1:v]overlay=0:0:format=auto[v]'].join(';'),
    '-map', '[v]', '-t', String(duration), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => { window.seek(t); }, f / fps);
    const buf = await page.screenshot({ type: 'png', omitBackground: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r  ${frames} frames, ${duration.toFixed(2)}s at ${fps}fps\n`);

  mixAudio({ dir, silent, voiceSrc, sfx, music: data.music, lastWordEnd: data.words.at(-1).end, duration });
  const out = path.join(dir, 'video.mp4');
  // Poster: first beat fully in.
  await page.evaluate((t) => { window.seek(t); }, data.posterAt ?? Math.min(duration - 0.1, (data.beats[0]?.t ?? 0) + 0.7));
  await page.screenshot({ path: path.join(dir, 'poster-overlay.png'), omitBackground: true });
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(data.posterAt ?? Math.min(duration - 0.1, (data.beats[0]?.t ?? 0) + 0.7)), '-i', out, '-frames:v', '1', path.join(dir, 'poster.png')]);
  fs.rmSync(path.join(dir, 'poster-overlay.png'));
  return ['video.mp4', 'poster.png'];
}

// ---------- story template (research/style-nick-saraev.md) ----------
function resolveStory(dir, spec) {
  const d = structuredClone(spec.data);
  const words = JSON.parse(fs.readFileSync(path.join(dir, d.words), 'utf8')).words;
  const faceSrc = d.face?.src ? path.join(dir, d.face.src) : null;
  const voiceSrc = d.audio ? path.join(dir, d.audio) : faceSrc;
  d.duration = Math.max(voiceSrc ? probeSeconds(voiceSrc) : 0, words.at(-1).end + (d.tail ?? 1.8));
  d.words = words;
  const T = (a, label, lead = 0.05) => Math.max(0, wordTime(words, a, label) - lead);
  d.scenes = d.scenes.map((sc, i) => {
    const o = { ...sc, t: i === 0 && sc.at === undefined ? 0 : T(sc.at, `scene ${i}`, 0.12) };
    for (const key of ['rows', 'lines']) if (o[key]) o[key] = o[key].map((r, k) => ({ ...r, t: r.at !== undefined ? T(r.at, `scene ${i} ${key} ${k}`) : undefined }));
    if (o.landAt !== undefined) o.land = wordTime(words, o.landAt, `scene ${i} land`);
    if (o.totalAt !== undefined) o.totalT = T(o.totalAt, `scene ${i} total`);
    if (o.stamp) o.stamp = { ...o.stamp, t: T(o.stamp.at, `scene ${i} stamp`) };
    if (o.click) o.click = { ...o.click, t: T(o.click.at, `scene ${i} click`) };
    return o;
  }).sort((a, b) => a.t - b.t);
  d.scenes.forEach((sc, i) => { sc.end = d.scenes[i + 1]?.t ?? d.duration; });
  if (faceSrc) d.faceCuts = (d.faceCuts || []).map((c, i) => ({ ...c, t: c.at === undefined ? 0 : T(c.at, `faceCut ${i}`, 0.08) })).sort((a, b) => a.t - b.t);
  return { data: d, voiceSrc, faceSrc };
}

async function renderStory(browser, spec, dir, fps) {
  const { data, voiceSrc, faceSrc } = resolveStory(dir, spec);
  if (faceSrc) {
    // Headless Chromium can't decode H.264, so hand it a VP9 copy of the HeyGen take.
    const webm = path.join(dir, '.face.webm');
    if (!fs.existsSync(webm) || fs.statSync(webm).mtimeMs < fs.statSync(faceSrc).mtimeMs)
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', faceSrc, '-an', '-c:v', 'libvpx-vp9', '-b:v', '6M', '-deadline', 'realtime', '-cpu-used', '8', webm], { stdio: 'inherit' });
    data.face = { src: pathToFileURL(webm).href };
  }
  const { page } = await openTemplate(browser, 'story', data, '9:16');
  if (faceSrc) await page.evaluate(() => new Promise((r) => { const v = window.faceVideo; v.readyState >= 2 ? r() : v.addEventListener('loadeddata', r, { once: true }); }));
  const duration = data.duration, frames = Math.round(duration * fps);
  const sfx = await page.evaluate(() => window.sfx);
  const silent = path.join(dir, 'video-silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  for (let f = 0; f < frames; f++) {
    const t = f / fps;
    await page.evaluate(async (t) => {
      window.seek(t);
      const v = window.faceVideo;
      if (v) { const target = Math.min(t, (v.duration || t) - 0.04); if (Math.abs(v.currentTime - target) > 0.001) { await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = target; }); } }
    }, t);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r  ${frames} frames, ${duration.toFixed(2)}s at ${fps}fps\n`);
  mixAudio({ dir, silent, voiceSrc, sfx, music: data.music, lastWordEnd: data.words.at(-1).end, duration });
  const out = path.join(dir, 'video.mp4');
  const posterAt = data.posterAt ?? Math.min(duration - 0.1, 1.6);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(posterAt), '-i', out, '-frames:v', '1', path.join(dir, 'poster.png')]);
  return ['video.mp4', 'poster.png'];
}

async function main(argv) {
  const dir = path.resolve(argv.find((a) => !a.startsWith('--')) || '');
  const fps = Number(argv[argv.indexOf('--fps') + 1]) || 30;
  const spec = JSON.parse(fs.readFileSync(path.join(dir, 'render.json'), 'utf8'));
  const metaPath = path.join(dir, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const aspect = meta.aspect || spec.aspect || '4:5';
  const data = resolveIcons(spec.data);

  const browser = await chromium.launch();
  try {
    console.log(`render ${path.relative(ROOT, dir)} · ${spec.template} · ${aspect}`);
    const files = spec.template === 'static' ? await renderStatic(browser, data, aspect, dir)
      : spec.template === 'carousel' ? await renderCarousel(browser, data, aspect, dir)
      : spec.template === 'video' ? await renderVideo(browser, data, aspect, dir, fps)
      : spec.template === 'split' ? await renderSplit(browser, spec, dir, fps)
      : spec.template === 'story' ? await renderStory(browser, spec, dir, fps)
      : (() => { throw new Error(`unknown template "${spec.template}"`); })();
    meta.media = files;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
    console.log(`  wrote ${files.join(', ')}`);
  } finally {
    await browser.close();
  }
}

main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
