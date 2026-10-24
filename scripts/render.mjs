#!/usr/bin/env node
// Render a post's media from its render.json.
//
//   node scripts/render.mjs <post-dir> [--fps 30] [--frames-only]
//
// render.json: { "template": "static" | "carousel" | "pixel" | "video" | "split" | "story" | "arena" | "talkhead", "data": { ... } }
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
import crypto from 'node:crypto';
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
  // long face videos stream for a while; their readiness is awaited per video (renderStory), so a busy network is not fatal
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => console.warn('  network still busy after 30 s (streaming media), continuing'));
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete || new Promise((r) => { i.onload = i.onerror = r; }))));
  return { page, w, h };
}

async function renderStatic(browser, data, aspect, dir) {
  const { page } = await openTemplate(browser, 'static', data, aspect);
  await page.screenshot({ path: path.join(dir, 'static.png') });
  return ['static.png'];
}


// Composite a carousel video slide: still PNG + per-frame clip sequences (mp4 with ss, or png/jpg fitted to the frame width and scrolled top to bottom).
// slide.video: true | { dur }, slide.frames[k].clips: [{ src (repo path or post-relative), ss, dur }], slide.every (s per clip, default 3)
function videoSlide(dir, png, sl, boxes) {
  const D = (typeof sl.video === 'object' && sl.video.dur) || 9, every = sl.every || 3, FPS = 30;
  const resolveSrc = (p) => [path.resolve(dir, p), path.join(ROOT, p)].find((f) => fs.existsSync(f)) || (() => { throw new Error(`clip not found: ${p}`); })();
  const inputs = ['-loop', '1', '-t', String(D), '-i', path.join(dir, png)];
  const chains = [], overlays = [];
  let n = 1;
  boxes.forEach((b, k) => {
    const clips = (sl.frames[b.i] || {}).clips;
    if (!clips || !clips.length) return;
    const w = Math.round(b.w / 2) * 2, h = Math.round(b.h / 2) * 2;
    const segs = [];
    for (let t = 0, j = 0; t < D - 0.01; j++) {
      const c = clips[j % clips.length], d = Math.min(c.dur || every, D - t), f = resolveSrc(c.src);
      if (/\.(png|jpe?g|webp)$/i.test(f)) inputs.push('-loop', '1', '-t', String(d), '-i', f);
      else inputs.push('-ss', String(c.ss || 0), '-t', String(d), '-i', f);
      const tag = `c${k}_${j}`;
      chains.push(/\.(png|jpe?g|webp)$/i.test(f)
        ? `[${n}:v]scale=${w}:-2,pad=${w}:'max(ih,${h})':0:0:white,crop=${w}:${h}:0:'(ih-${h})*t/${d}',fps=${FPS},setsar=1,format=yuv420p[${tag}]`
        : `[${n}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},fps=${FPS},setsar=1,format=yuv420p,trim=duration=${d},setpts=PTS-STARTPTS[${tag}]`);
      segs.push(tag); n++; t += d;
    }
    chains.push(`${segs.map((x) => `[${x}]`).join('')}concat=n=${segs.length}:v=1:a=0,fade=t=in:st=0:d=0.25[f${k}]`);
    overlays.push({ k, x: Math.round(b.x), y: Math.round(b.y) });
  });
  let last = '[0:v]';
  overlays.forEach((o, j) => { const out = j === overlays.length - 1 ? '[out]' : `[o${j}]`; chains.push(`${last}[f${o.k}]overlay=${o.x}:${o.y}:shortest=1${out}`); last = out; });
  const out = png.replace('.png', '.mp4');
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', chains.join(';'), '-map', overlays.length ? '[out]' : '0:v', '-r', String(FPS), '-t', String(D), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(dir, out)], { encoding: 'utf8' });
  if (r.status) throw new Error(`video slide ${out}: ${r.stderr}`);
  return out;
}

async function renderCarousel(browser, data, aspect, dir, template = 'carousel') {
  const { page } = await openTemplate(browser, template, data, aspect);
  const files = [];
  for (let i = 0; i < data.slides.length; i++) {
    await page.evaluate((n) => window.showSlide(n), i);
    await page.evaluate(() => Promise.all([...document.images].map((im) => im.complete || new Promise((r) => { im.onload = im.onerror = r; }))));
    const name = `slide-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(dir, name) });
    files.push(name);
    const sl = data.slides[i];
    if (sl.video && template === 'photo-carousel' && !process.env.NO_VIDEO_SLIDES) {
      // video slide (mr.pynk style): the layout stays still, only the framed boxes play clips that change every few seconds
      const boxes = await page.evaluate(() => [...document.querySelectorAll('.frame')].map((f) => { const r = f.getBoundingClientRect(); return { i: +f.dataset.fi, x: r.x + 10, y: r.y + 10, w: r.width - 20, h: r.height - 20 }; }));
      files.push(videoSlide(dir, name, sl, boxes));
    }
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
  blast: 'anoisesrc=d=0.12:c=white:a=0.9,highpass=f=600,lowpass=f=6000,afade=t=out:st=0.02:d=0.1',
  shutter: 'anoisesrc=d=0.14:c=white:a=0.9,highpass=f=1800,afade=t=out:st=0.03:d=0.11,aecho=0.8:0.5:40:0.35',
  pop: 'sine=f=520:d=0.09,asetrate=48000*1.0,volume=1.2,afade=t=out:st=0.02:d=0.07,vibrato=f=18:d=0.4',
  whoosh: 'anoisesrc=d=0.35:c=pink:a=0.6,highpass=f=400,lowpass=f=3000,afade=t=in:d=0.15,afade=t=out:st=0.15:d=0.2',
  // cold-open character cues (templates/story/coldopen.js)
  snore: 'anoisesrc=d=1.0:c=brown:a=0.7,lowpass=f=420,tremolo=f=4:d=0.8,afade=t=in:d=0.35,afade=t=out:st=0.55:d=0.45',
  // 8-bit cues for templates/arena (square waves and noise, research/style-fire-reel.md 11.9)
  blip: "aevalsrc='0.5*sgn(sin(2*PI*880*t))*exp(-18*t)':s=48000:d=0.12",
  beep: "aevalsrc='0.45*sgn(sin(2*PI*1320*t))*lt(t,0.11)':s=48000:d=0.14",
  coin: "aevalsrc='0.45*sgn(sin(2*PI*if(lt(t,0.07),988,1319)*t))*exp(-5*t)':s=48000:d=0.4",
  dash: "aevalsrc='0.35*sgn(sin(2*PI*(1400*t-2500*t*t)))*exp(-9*t)':s=48000:d=0.22",
  punch: "aevalsrc='0.7*(random(0)*2-1)*exp(-40*t)+0.8*sin(2*PI*90*t)*exp(-22*t)':s=48000:d=0.2",
  explode: 'anoisesrc=d=0.6:c=brown:a=0.9,acrusher=bits=6:mode=lin,lowpass=f=2200,afade=t=out:st=0.05:d=0.55',
  powerup: "aevalsrc='0.4*sgn(sin(2*PI*440*pow(2,floor(t*16)/6)*t))*(1-t/0.62)':s=48000:d=0.6",
  bell: "aevalsrc='0.45*sgn(sin(2*PI*660*t))*exp(-5*t)+0.3*sin(2*PI*1320*t)*exp(-3*t)':s=48000:d=0.6",
  charge: "aevalsrc='0.3*sgn(sin(2*PI*(200+450*t)*t))*(0.6+0.4*sgn(sin(2*PI*12*t)))':s=48000:d=0.8",
  beam: "aevalsrc='0.35*sgn(sin(2*PI*(900-300*t)*t))*exp(-1.5*t)+0.35*(random(0)*2-1)*exp(-3*t)':s=48000:d=0.7",
  fanfare: "aevalsrc='0.4*sgn(sin(2*PI*if(lt(t,0.14),523,if(lt(t,0.28),659,if(lt(t,0.42),784,1047)))*t))*if(lt(t,0.42),1,exp(-2.2*(t-0.42)))':s=48000:d=1.2",
};
// Recorded SFX kit (assets/sfx/kit/<kit>-<n>.wav, sources in kit/LICENSES.md). A cue kind with kit files plays them,
// rotating variants by cue index, instead of the synth. SFX_KIT=0 forces the old synths.
const KIT_ALIAS = { whoosh: 'whoosh-subtle', pop: 'pop', tick: 'tap', click: 'tap', thud: 'impact-soft', blast: 'impact-big', shutter: 'shutter', key: 'keyboard', roll: 'counter-tick' };
// Kit files peak at -3 dBFS; cue vol (default 0.12) is scaled per kit so, measured as max 100 ms RMS against the VO,
// whooshes/pops sit about -18 dB under the voice and hits, dings and big whooshes about -12 to -15 dB.
const KIT_GAIN = { 'whoosh-subtle': 1, tap: 1.1, keyboard: 1, 'counter-tick': 1, pop: 1.2, riser: 1.5, 'whoosh-big': 1.5, ding: 2.8, chime: 2.6, success: 2.8, notify: 2.6, 'impact-soft': 1.2, 'impact-big': 1.8, shutter: 2, boing: 2 };
// per-variant trims so variants of one kit land at a similar loudness (peak-normalised files differ in energy)
const KIT_TRIM = { 'ding-1': 1.3, 'chime-2': 1.6, 'success-1': 1.4, 'pop-2': 1.8, 'pop-3': 1.2, 'riser-1': 1.4, 'impact-soft-2': 1.3 };
const kitCache = {};
function kitFiles(kind) {
  const kit = KIT_ALIAS[kind] ?? kind;
  if (process.env.SFX_KIT === '0') return { kit, files: [] };
  if (!kitCache[kit]) {
    const dir = path.join(ROOT, 'assets/sfx/kit');
    const re = new RegExp(`^${kit.replace(/[^\w-]/g, '')}-(\\d+)\\.wav$`);
    kitCache[kit] = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)).sort((a, b) => Number(a.match(re)[1]) - Number(b.match(re)[1])).map((f) => path.join(dir, f)) : [];
  }
  return { kit, files: kitCache[kit] };
}
function sfxFile(kind) {
  const dir = path.join(ROOT, 'assets/sfx');
  const f = path.join(dir, `${kind}.wav`);
  // a cue kind with neither a kit file nor a synth recipe falls back to its nearest synth cue instead of failing the render
  if (!fs.existsSync(f) && !SFX[kind]) return sfxFile(/^whoosh|riser/.test(kind) ? 'whoosh' : /ding|chime|success|notify/.test(kind) ? 'tick' : 'pop');
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

// Find where the beat actually kicks in: first point where the 2 s loudness reaches 70 in 100 of the track's peak 2 s loudness.
function findDrop(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-']);
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  const win = 2000, rms = [];
  for (let i = 0; i + win <= x.length; i += win) { let sum = 0; for (let k = i; k < i + win; k++) sum += x[k] * x[k]; rms.push(Math.sqrt(sum / win)); }
  const avg = rms.map((_, i) => (rms.slice(i, i + 8).reduce((a, b) => a + b, 0) / Math.min(8, rms.length - i)));
  const peak = Math.max(...avg.slice(0, Math.min(avg.length, 240)));
  const idx = avg.findIndex((v) => v >= peak * 0.7);
  return Math.max(0, idx * 0.25 - 0.1);
}

function mixAudio({ dir, silent, voiceSrc, sfx, music, lastWordEnd, duration, sfxGain = 1 }) {
// Audio: voice first, short dry SFX about 20 dB under, optional music bed ducked under speech.
  const ain = [], af = [], mix = [];
  let n = 1; // input 0 is the silent video
  if (voiceSrc) { ain.push('-i', voiceSrc); af.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo[vo]`); n++; }
  // Resolve every cue to a file (kit variant rotated by cue index within its kit, else the synth) and a volume, then group by file.
  const byFile = new Map(), seen = {};
  for (const c of sfx.filter((c) => c.t < duration).sort((a, b) => a.t - b.t)) {
    const { kit, files } = kitFiles(c.kind);
    let file = null, vol = c.vol ?? 0.12;
    if (files.length) { const i = seen[kit] = (seen[kit] ?? -1) + 1; file = files[i % files.length]; vol = Math.min(0.45, vol * (KIT_GAIN[kit] ?? 1.2) * (KIT_TRIM[path.basename(file, '.wav')] ?? 1)); }
    else file = sfxFile(c.kind);
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push({ t: Math.max(0, c.t), vol: Math.min(0.7, vol * sfxGain) });
    if (process.env.SFX_DEBUG) console.log(`  sfx ${c.t.toFixed(2)}s ${c.kind} -> ${path.basename(file)} vol ${vol.toFixed(3)}`);
  }
  for (const [file, cues] of byFile) {
    ain.push('-i', file);
    af.push(`[${n}:a]asplit=${cues.length}${cues.map((_, i) => `[s${n}_${i}]`).join('')}`);
    cues.forEach((c, i) => { const ms = Math.round(c.t * 1000); af.push(`[s${n}_${i}]adelay=${ms}|${ms},volume=${c.vol.toFixed(4)}[s${n}d${i}]`); mix.push(`[s${n}d${i}]`); });
    n++;
  }
  let musicLabel = null;
  if (music?.file) {
    const mfile = path.join(dir, music.file);
    const start = music.t ?? 0;                       // when the bed comes in (seconds into the video)
    // Land the track's beat drop early in the video (default 2 s in, or on music.dropAt's word), with a short natural lead-in.
    const dropT = music.dropT ?? 2.0;
    const offset = music.offset !== undefined && music.offset !== 'drop' ? Number(music.offset) : Math.max(0, findDrop(mfile) - Math.max(0, dropT - start));
    ain.push('-i', mfile);
    const ms = Math.round(start * 1000);
    af.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=${offset}:${offset + duration},asetpts=PTS-STARTPTS,volume=${music.volume ?? 0.11},afade=t=in:d=0.08,adelay=${ms}|${ms},afade=t=out:st=${Math.max(0, lastWordEnd + (music.tail ?? 0.6))}:d=0.6[bed]`);
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

  mixAudio({ dir, silent, voiceSrc, sfx, music: data.music, lastWordEnd: data.words.at(-1).end, duration, sfxGain: data.sfxGain ?? 1 });
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
  const voiceSrc = d.audio ? path.join(dir, d.audio) : faceSrc;   // a talk-segments plate is video only; the voice comes from audio/vo.wav
  d.duration = Math.max(voiceSrc ? probeSeconds(voiceSrc) : 0, words.at(-1).end + (d.tail ?? 1.8));
  d.words = words;
  const T = (a, label, lead = 0.05) => typeof a === 'number' ? a : Math.max(0, wordTime(words, a, label) - lead);   // a number = seconds
  d.scenes = d.scenes.map((sc, i) => {
    const o = { ...sc, t: i === 0 && sc.at === undefined ? 0 : T(sc.at, `scene ${i}`, 0.12) };
    for (const key of ['rows', 'lines']) if (o[key]) o[key] = o[key].map((r, k) => ({ ...r, t: r.at !== undefined ? T(r.at, `scene ${i} ${key} ${k}`) : undefined }));
    if (o.landAt !== undefined) o.land = wordTime(words, o.landAt, `scene ${i} land`);
    if (o.totalAt !== undefined) o.totalT = T(o.totalAt, `scene ${i} total`);
    if (o.stamp) o.stamp = { ...o.stamp, t: T(o.stamp.at, `scene ${i} stamp`) };
    if (o.click) o.click = { ...o.click, t: T(o.click.at, `scene ${i} click`) };
    if (o.sprites) o.sprites = o.sprites.map((k, j) => ({ ...k, acts: (k.acts || []).map((a, m) => ({ ...a, t: a.at !== undefined ? T(a.at, `scene ${i} sprite ${j} act ${m}`, 0.03) : undefined })) }));
    for (const key of ['nodes', 'edges', 'pulses']) if (o[key]) o[key] = o[key].map((r, k) => ({ ...r, t: r.at !== undefined ? T(r.at, `scene ${i} ${key} ${k}`) : undefined }));
    if (o.counters) o.counters = o.counters.map((c, k) => ({ ...c, t: c.at !== undefined ? T(c.at, `scene ${i} counter ${k}`) : undefined, ticks: (c.ticks || []).map((tk, j) => ({ ...tk, t: T(tk.at, `scene ${i} counter ${k} tick ${j}`, 0.02) })) }));
    if (o.type === 'shot') o.srcUrl = pathToFileURL(path.resolve(dir, o.src)).href;
    if (o.type === 'clip') o.srcUrl = pathToFileURL(o.src.startsWith('assets/') ? path.join(ROOT, o.src) : path.resolve(dir, o.src)).href;
    if (o.bg) o.bgUrl = pathToFileURL(path.resolve(dir, o.bg)).href;
    if (o.type === 'person') { o.photoUrl = pathToFileURL(path.resolve(dir, o.photo)).href; if (o.brand) o.b = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8'))[o.brand]; }
    return o;
  }).sort((a, b) => a.t - b.t);
  d.scenes.forEach((sc, i) => { sc.end = d.scenes[i + 1]?.t ?? d.duration; });
  if (d.music?.at !== undefined) d.music = { ...d.music, t: T(d.music.at, 'music', 0.15) };
  if (d.music?.dropAt !== undefined) d.music = { ...d.music, dropT: T(d.music.dropAt, 'music drop', 0.05) };
  const BRANDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8'));
  const brand = (id) => { const b = BRANDS[id]; if (!b) throw new Error(`unknown brand "${id}" (config/brands.json)`); return { ...b, logoUrl: pathToFileURL(path.join(ROOT, 'assets/logos', b.logo)).href }; };
  d.scenes.forEach((sc) => { if (sc.brand) sc.b = brand(sc.brand); if (sc.type === 'vs') { sc.lb = brand(sc.left); sc.rb = brand(sc.right); } });
  d.bgLogos = (d.bgLogos || []).map((id) => brand(id));
  d.scenes.forEach((sc) => { (sc.nodes || []).forEach((n) => { if (n.brand) n.b = brand(n.brand); }); });
  if (d.coldOpen) {
    // Cold open: 1 visual gag acting out the hook line. Anchors that no longer resolve (after a re-voice) are dropped with a warning, never fatal.
    const C = d.coldOpen;
    const tryT = (a, label) => { if (typeof a === 'number') return a; try { return wordTime(words, a, label); } catch (e) { console.warn(`  cold open: ${e.message}`); return null; } };
    let end = C.until === undefined ? null : tryT(C.until, 'coldOpen until');
    if (end == null) { const k = words.findIndex((w) => /[.?!]$/.test(w.w)); end = words[k + 1]?.start ?? 3; }
    C.end = Math.max(0.8, end - 0.06);
    C.actors = (C.actors || []).map((a) => ({ ...a, ...(a.brand ? { b: brand(a.brand) } : {}), ...(a.sprite ? { srcUrl: pathToFileURL(path.join(ROOT, 'assets/pixel/sprites', `${a.sprite}.png`)).href } : {}) }));
    C.beats = (C.beats || []).map((b, i) => { const t = b.at === undefined ? 0 : tryT(b.at, `coldOpen beat ${i}`); return { ...b, t: t == null ? null : Math.max(0, t - (b.lead ?? 0.08)), ...(b.brand ? { b: brand(b.brand) } : {}) }; })
      .filter((b) => b.t != null && b.t < C.end && C.actors[b.actor]).sort((a, b) => a.t - b.t);
    if (C.titles) C.titles = C.titles.map((tt, i) => ({ ...tt, t: tt.at === undefined ? 0 : tryT(tt.at, `coldOpen title ${i}`) ?? 0 }));
    const lum = (hex) => { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; };
    const fb = C.actors.find((a) => a.b)?.b;
    C.titleColor = C.titleColor || (fb && lum(fb.bg) > 0.15 && lum(fb.bg) < 0.85 ? fb.bg : '#C98A3C');
    d.hook = null;
  }
  if (d.hook) d.hook = { ...d.hook, targets: (d.hook.brands || []).slice(0, 6).map((id) => brand(id)), srcUrl: d.hook.src ? pathToFileURL(path.resolve(dir, d.hook.src)).href : undefined };
  d.pops = (d.pops || []).map((p, i) => ({ ...p, t: T(p.at, `pop ${i}`, 0.03), end: p.until !== undefined ? T(p.until, `pop ${i} until`) : undefined,
    ...(p.kind === 'logo' ? { b: brand(p.brand) } : {}), ...(p.kind === 'sprite' ? { srcUrl: pathToFileURL(path.join(ROOT, 'assets/pixel/sprites', `${p.sprite}.png`)).href } : {}) }));
  d.stickers = (d.stickers || []).map((k, i) => ({ ...k, srcUrl: pathToFileURL(path.resolve(dir, k.src)).href,
    t: k.at === undefined ? 0 : T(k.at, `sticker ${i}`), end: k.until === undefined ? d.duration : T(k.until, `sticker ${i} until`) }));
  if (faceSrc) d.faceCuts = (d.faceCuts || []).map((c, i) => ({ ...c, t: c.at === undefined ? 0 : T(c.at, `faceCut ${i}`, 0.08), pushT: c.pushAt !== undefined ? T(c.pushAt, `faceCut ${i} push`, 0.05) : undefined })).sort((a, b) => a.t - b.t);
  return { data: d, voiceSrc, faceSrc };
}

async function renderStory(browser, spec, dir, fps) {
  const { data, voiceSrc, faceSrc } = resolveStory(dir, spec);
  if (faceSrc) {
    // Headless Chromium can't decode H.264, so hand it a VP9 copy of the HeyGen take.
    const webm = path.join(dir, '.face.webm');
    if (!fs.existsSync(webm) || fs.statSync(webm).mtimeMs < fs.statSync(faceSrc).mtimeMs)
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', faceSrc, '-an', '-c:v', 'libvpx-vp9', '-b:v', '6M', '-deadline', 'realtime', '-cpu-used', '8', webm], { stdio: 'inherit' });
    data.face = { ...(data.face || {}), src: pathToFileURL(webm).href };
    if (spec.data.face?.mask) {
      // Cutout: the still-base lip-sync keeps the silhouette fixed, so 1 alpha mask from the still works for every frame.
      const cut = path.join(dir, '.face-cut.webm');
      const mask = path.resolve(dir, spec.data.face.mask);
      if (!fs.existsSync(cut) || fs.statSync(cut).mtimeMs < fs.statSync(faceSrc).mtimeMs)
        spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', faceSrc, ...(/\.mp4$/i.test(mask) ? ['-i', mask] : ['-loop', '1', '-i', mask]), '-filter_complex',
          `[1:v]${/\.mp4$/i.test(mask) ? 'format=gray' : 'alphaextract'},scale=1920:1080,boxblur=1:1[a];[0:v]scale=1920:1080,format=yuva420p[v];[v][a]alphamerge,format=yuva420p[o]`,
          '-map', '[o]', '-shortest', '-an', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '6M', '-deadline', 'realtime', '-cpu-used', '8', '-auto-alt-ref', '0', cut], { stdio: 'inherit' });
      data.face = { ...data.face, cutSrc: pathToFileURL(cut).href };
    }
  }
  const { page } = await openTemplate(browser, 'story', data, '9:16');
  if (faceSrc) await page.evaluate(() => Promise.all(window.faceVideos.map((v) => new Promise((r) => { v.readyState >= 2 ? r() : v.addEventListener('loadeddata', r, { once: true }); }))));
  await page.evaluate(() => Promise.all((window.clipVideos || []).map((v) => new Promise((r) => { v.readyState >= 2 ? r() : v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 15000); }))));
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
      for (const v of window.faceVideos || []) {
        if (getComputedStyle(v).display === 'none' || getComputedStyle(v.parentElement).opacity === '0') continue;
        const target = Math.min(t, (v.duration || t) - 0.04);
        if (Math.abs(v.currentTime - target) > 0.001) await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = target; });
      }
      for (const v of window.clipVideos || []) {   // screen-recording scenes: play from data-ss while the scene is up
        const t0 = Number(v.dataset.t0), t1 = Number(v.dataset.t1);
        if (!(t >= t0 - 0.1 && t <= t1 + 0.1)) continue;
        const target = Math.max(0, Math.min(Number(v.dataset.ss || 0) + (t - t0), (v.duration || 1) - 0.04));
        if (Math.abs(v.currentTime - target) > 0.001) await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = target; });
      }
    }, t);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r  ${frames} frames, ${duration.toFixed(2)}s at ${fps}fps\n`);
  mixAudio({ dir, silent, voiceSrc, sfx, music: data.music, lastWordEnd: data.words.at(-1).end, duration, sfxGain: data.sfxGain ?? 1 });
  const out = path.join(dir, 'video.mp4');
  const posterAt = data.posterAt ?? Math.min(duration - 0.1, 1.6);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(posterAt), '-i', out, '-frames:v', '1', path.join(dir, 'poster.png')]);
  return ['video.mp4', 'poster.png'];
}

// ---------- arena template (research/style-fire-reel.md) ----------
// Every `at` / `<name>At` in a beat (at any depth) is a spoken-word anchor, resolved to `t` / `<name>T` in seconds.
function resolveArena(dir, spec) {
  const d = structuredClone(spec.data);
  const words = JSON.parse(fs.readFileSync(path.join(dir, d.words), 'utf8')).words;
  const voiceSrc = d.audio ? path.join(dir, d.audio) : null;
  d.duration = Math.max(voiceSrc ? probeSeconds(voiceSrc) : 0, words.at(-1).end + (d.tail ?? 2.6));
  d.words = words;
  const walk = (o, label) => {
    for (const [k, v] of Object.entries(o)) {
      if ((k === 'at' || /At$/.test(k)) && (typeof v === 'string' || typeof v === 'number'))
        o[k === 'at' ? 't' : k.slice(0, -2) + 'T'] = Math.max(0, wordTime(words, v, `${label} ${k}`) - (k === 'at' ? 0.06 : 0.02));
      else if (v && typeof v === 'object') walk(v, `${label} ${k}`);
    }
  };
  d.beats = d.beats.map((b, i) => { const o = structuredClone(b); walk(o, `beat ${i}`); if (o.t === undefined) o.t = (o.hits?.[0]?.t ?? 0); return o; }).sort((a, b) => a.t - b.t);
  d.brands = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8'));   // logo fighters (brand mode)
  return { data: d, voiceSrc };
}

async function renderArena(browser, spec, dir, fps) {
  const { data, voiceSrc } = resolveArena(dir, spec);
  const { page } = await openTemplate(browser, 'arena', data, '9:16');
  const duration = data.duration, frames = Math.round(duration * fps);
  const sfx = await page.evaluate(() => window.sfx);
  const silent = path.join(dir, 'video-silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
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
  // The bed keeps playing under the CONTINUE countdown, so it fades at the very end, not at the last word.
  mixAudio({ dir, silent, voiceSrc, sfx, music: data.music, lastWordEnd: duration - 0.35, duration, sfxGain: data.sfxGain ?? 1 });
  const posterAt = data.posterAt ?? Math.min(duration - 0.1, 1.6);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(posterAt), '-i', path.join(dir, 'video.mp4'), '-frames:v', '1', path.join(dir, 'poster.png')]);
  return ['video.mp4', 'poster.png'];
}

// ---------- talkhead template (research/style-talking-head-pro.md) ----------
// Real recorded footage (4K or 1080p, vertical or landscape, any fps). ffmpeg cuts video and audio together from an EDL
// (pauses trimmed from the word timings, plus manual `cuts`), crops a 9:16 column around the face and writes JPEG frames
// at the output fps. Chromium only shows those frames (it can't decode H.264/HEVC), so zooms, layouts and graphics stay HTML.
const TH_GRID = 1 / 30;   // cut points snap to a 30 fps grid, so video and audio lose exactly the same time at every cut
function probeFootage(f) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation:stream_tags=rotate', '-of', 'json', f]);
  const s = JSON.parse(String(r.stdout)).streams?.[0];
  if (!s) throw new Error(`talkhead: no video stream in ${f}`);
  const rot = Math.abs(Number(s.side_data_list?.find((x) => x.rotation !== undefined)?.rotation ?? s.tags?.rotate ?? 0)) % 180;
  return rot === 90 ? { w: s.height, h: s.width } : { w: s.width, h: s.height };   // ffmpeg autorotates on decode
}
function buildEdl(words, { from = 0, to = Infinity, max = 0.3, keep = 0.16, head = 0.08, tail = 0.22, cuts = [] } = {}) {
  const ws = words.filter((w) => w.start >= from - 0.01 && w.end <= to + 0.01);
  if (!ws.length) throw new Error('talkhead: no words inside from/to');
  let segs = [];
  const before = words.filter((w) => w.end <= ws[0].start + 0.01 && !ws.includes(w)).at(-1);
  let a = Math.max(from - head, ws[0].start - head, before ? before.end + 0.03 : 0);
  for (let i = 1; i < ws.length; i++) {
    const gap = ws[i].start - ws[i - 1].end;
    if (gap > max) { segs.push([a, ws[i - 1].end + keep / 2]); a = ws[i].start - keep / 2; }
  }
  const after = words.find((w) => w.start > ws.at(-1).end - 0.01 && !ws.includes(w));   // never run into the next word
  segs.push([a, Math.min(ws.at(-1).end + tail, after ? after.start - 0.03 : Infinity, to === Infinity ? Infinity : Math.max(to, ws.at(-1).end) + tail)]);
  for (const [ca, cb] of cuts) segs = segs.flatMap(([x, y]) => (cb <= x || ca >= y ? [[x, y]] : [[x, ca], [cb, y]].filter(([p, q]) => q - p > 0.05)));
  const q = (t) => Math.round(t / TH_GRID) * TH_GRID;
  segs = segs.map(([x, y]) => [q(x), q(y)]).filter(([x, y]) => y - x >= TH_GRID * 2);
  const map = (t) => { let acc = 0; for (const [x, y] of segs) { if (t < x) return null; if (t <= y) return acc + (t - x); acc += y - x; } return null; };
  const cutWords = ws.map((w) => { const s = map(w.start), e = map(w.end); return s == null ? null : { ...w, start: +s.toFixed(3), end: +(e ?? s + 0.15).toFixed(3) }; }).filter(Boolean);
  return { segs, words: cutWords, duration: segs.reduce((n, [x, y]) => n + y - x, 0), map };
}
function resolveTalkhead(dir, spec, fps) {
  const d = structuredClone(spec.data);
  const footage = path.resolve(dir, d.footage);
  const srcWords = JSON.parse(fs.readFileSync(path.resolve(dir, d.words), 'utf8')).words;
  const anchor = (a, label) => (a === undefined ? undefined : typeof a === 'number' ? a : wordTime(srcWords, a, label));
  const tight = d.tighten === false ? { max: 1e9 } : d.tighten || {};
  // `to` is the last word kept: its phrase end (a "word#n" anchor of 1 or more words) or seconds
  const toEnd = (a) => { if (a === undefined) return Infinity; if (typeof a === 'number') return a; const s = wordTime(srcWords, a, 'to'), k = srcWords.findIndex((w) => w.start === s); return srcWords[k + String(a).split('#')[0].trim().split(/\s+/).length - 1].end; };
  const edl = buildEdl(srcWords, { ...tight, from: anchor(d.from, 'from') ?? 0, to: toEnd(d.to), cuts: d.cuts || [] });
  const words = edl.words;
  const T = (a, label, lead = 0.05) => typeof a === 'number' ? a : Math.max(0, wordTime(words, a, label) - lead);   // a number = seconds

  // 9:16 column around the face (frame.cx, frame.eyes are fractions of the source frame).
  const src = probeFootage(footage), fr = { cx: 0.5, eyes: 0.38, ...(d.frame || {}) };   // frame.head: top of the head (default eyes - 0.2); frame.base < 1 insets tight footage
  let colW = Math.round(src.h * 9 / 16), colH = src.h;
  if (colW > src.w) { colW = src.w; colH = Math.round(src.w * 16 / 9); }
  colW -= colW % 2; colH -= colH % 2;
  const colX = Math.round(Math.min(Math.max(0, fr.cx * src.w - colW / 2), src.w - colW));
  const colY = Math.round(Math.min(Math.max(0, fr.eyes * src.h - colH * 0.36), src.h - colH));
  const OW = Math.min(1296, Math.max(1080, colW)) & ~1, OH = Math.round(OW * 16 / 9) & ~1;
  const frames = { base: Math.min(1, Math.max(0.75, fr.base ?? 1)), w: OW, h: OH, ex: ((fr.cx * src.w - colX) / colW) * OW, ey: ((fr.eyes * src.h - colY) / colH) * OH, hy: (((fr.head ?? fr.eyes - 0.2) * src.h - colY) / colH) * OH };

  // Cache the cut frames + voice by everything that changes them.
  const key = crypto.createHash('sha1').update(JSON.stringify([edl.segs, fps, colW, colH, colX, colY, OW, fs.statSync(footage).mtimeMs])).digest('hex').slice(0, 10);
  const work = path.join(dir, '.talkhead', key), fdir = path.join(work, 'frames'), voice = path.join(work, 'voice.wav');
  const count = Math.ceil(edl.duration * fps - 1e-6);
  if (!fs.existsSync(voice) || !fs.existsSync(fdir) || fs.readdirSync(fdir).length < count) {
    fs.rmSync(path.join(dir, '.talkhead'), { recursive: true, force: true });
    fs.mkdirSync(fdir, { recursive: true });
    const sel = edl.segs.map(([x, y]) => `between(t,${(x - 0.0005).toFixed(4)},${(y - 0.0005).toFixed(4)})`).join('+');
    const n = edl.segs.length;
    const fc = [`[0:v]fps=30,select='${sel}',setpts=N/30/TB,fps=${fps},crop=${colW}:${colH}:${colX}:${colY},scale=${OW}:${OH}:flags=lanczos,format=yuvj420p[v]`,
      `[0:a]aresample=48000,asplit=${n}${edl.segs.map((_, i) => `[a${i}]`).join('')}`,
      ...edl.segs.map(([x, y], i) => `[a${i}]atrim=${x.toFixed(4)}:${y.toFixed(4)},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st=${Math.max(0, y - x - 0.008).toFixed(4)}:d=0.008[c${i}]`),
      `${edl.segs.map((_, i) => `[c${i}]`).join('')}concat=n=${n}:v=0:a=1[a]`].join(';');
    console.log(`  cutting ${n} segments (${edl.duration.toFixed(2)}s) from ${path.basename(footage)} ${src.w}x${src.h} -> ${OW}x${OH} frames at ${fps}fps`);
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', footage, '-filter_complex', fc, '-map', '[v]', '-q:v', '3', path.join(fdir, '%05d.jpg'), '-map', '[a]', '-ac', '2', voice], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('talkhead: ffmpeg cut failed');
  }
  frames.count = fs.readdirSync(fdir).filter((f) => f.endsWith('.jpg')).length;
  frames.url = pathToFileURL(fdir).href + '/';
  fs.writeFileSync(path.join(dir, 'edl.json'), JSON.stringify({ footage: d.footage, segments: edl.segs.map(([x, y]) => [+x.toFixed(3), +y.toFixed(3)]), duration: +edl.duration.toFixed(3), column: { x: colX, y: colY, w: colW, h: colH } }, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, 'words-cut.json'), JSON.stringify({ words }, null, 1) + '\n');

  const BRANDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8'));
  const brand = (id) => { const b = BRANDS[id]; if (!b) throw new Error(`unknown brand "${id}" (config/brands.json)`); return { ...b, logoUrl: pathToFileURL(path.join(ROOT, 'assets/logos', b.logo)).href }; };
  const lum = (hex) => { const v = parseInt(String(hex).replace('#', '').slice(0, 6), 16); return (0.299 * (v >> 16 & 255) + 0.587 * (v >> 8 & 255) + 0.114 * (v & 255)) / 255; };
  const accent = d.accent || (d.brand ? brand(d.brand).accent || brand(d.brand).bg : '#E8B84B');
  const tail = d.tail ?? (d.cta && !d.cta.at ? 2.6 : 0.5);
  const out = {
    duration: edl.duration + tail, fps, words, frames, accent, accentFg: lum(accent) > 0.6 ? '#111111' : '#FFFFFF',
    keys: d.keys || [], handle: d.handle || '@growthsanj', safeGuides: d.safeGuides, posterAt: d.posterAt,
  };
  out.beats = (d.beats || [{ layout: 'close' }]).map((b, i) => ({ ...b, t: i === 0 && b.at === undefined ? 0 : T(b.at, `beat ${i}`, 0.06), layout: b.layout || 'close' })).sort((a, b) => a.t - b.t);
  if (out.beats[0].t > 0) out.beats.unshift({ t: 0, layout: 'close' });
  if (d.cta) {
    // CTA: spoken keyword line (cta.at) or, with no anchor, a card held over the tail after the last word.
    const ct = d.cta.at !== undefined ? T(d.cta.at, 'cta', 0.05) : edl.duration + 0.1;
    out.cta = { t: ct, kwT: d.cta.keywordAt !== undefined ? T(d.cta.keywordAt, 'cta keyword', 0.03) : undefined, keyword: d.cta.keyword, lead: d.cta.lead ?? (d.cta.keyword ? 'comment' : 'follow') };
    out.beats = out.beats.filter((b) => b.t < ct - 0.05).concat([{ t: ct, layout: 'close', z: d.cta.z ?? 1.08 }]);
  }
  out.beats.forEach((b, i) => { b.end = out.beats[i + 1]?.t ?? out.duration; });
  out.beats.forEach((b, i) => {
    const m = b.media; if (!m) return;
    if (m.kind === 'logos') { m.b = m.brands.map(brand); if (m.ats) m.ts = m.ats.map((a, k) => T(a, `beat ${i} logo ${k}`, 0.03)); }
    if ((m.kind === 'shot' || m.kind === 'broll') && m.src) {
      const f = path.resolve(dir, m.src);
      if (/\.(mp4|mov|m4v|webm)$/i.test(f)) {
        // B-roll video: pre-extract its frames for the beat's length at the output fps
        const bdir = path.join(work, `broll-${i}`);
        if (!fs.existsSync(bdir) || !fs.readdirSync(bdir).length) {
          fs.mkdirSync(bdir, { recursive: true });
          spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(m.from ?? 0), '-i', f, '-t', String(b.end - b.t + 0.2), '-vf', `fps=${fps},scale=900:-2`, '-q:v', '3', path.join(bdir, '%05d.jpg')], { stdio: 'inherit' });
        }
        m.seq = { url: pathToFileURL(bdir).href + '/', count: fs.readdirSync(bdir).length };
        m.srcUrl = `${m.seq.url}00001.jpg`;
      } else m.srcUrl = pathToFileURL(f).href;
    }
  });
  out.punches = (d.punches || []).map((p, i) => ({ ...p, t: T(p.at, `punch ${i}`, 0.04), end: p.until !== undefined ? T(p.until, `punch ${i} until`, 0.04) : undefined }));
  out.pops = (d.pops || []).map((p, i) => ({ ...p, t: T(p.at, `pop ${i}`, 0.03), end: p.until !== undefined ? T(p.until, `pop ${i} until`) : undefined, ...(p.kind === 'logo' ? { b: brand(p.brand) } : {}) }));
  if (d.title) out.title = { top: d.title.top, hi: d.title.hi, t: 0, end: d.title.until !== undefined ? T(d.title.until, 'title until', 0.06) : (out.beats[1]?.t ?? 3) };
  if (d.music?.at !== undefined) d.music = { ...d.music, t: T(d.music.at, 'music', 0.15) };
  out.music = d.music;
  return { data: out, voiceSrc: voice };
}

async function renderTalkhead(browser, spec, dir, fps) {
  const { data, voiceSrc } = resolveTalkhead(dir, spec, fps);
  const { page } = await openTemplate(browser, 'talkhead', data, '9:16');
  const duration = data.duration, frames = Math.round(duration * fps);
  const sfx = await page.evaluate(() => window.sfx);
  const silent = path.join(dir, 'video-silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.seek(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r  ${frames} frames, ${duration.toFixed(2)}s at ${fps}fps\n`);
  mixAudio({ dir, silent, voiceSrc, sfx, music: data.music, lastWordEnd: data.words.at(-1).end, duration, sfxGain: data.sfxGain ?? 1 });
  const posterAt = data.posterAt ?? Math.min(duration - 0.1, 1.2);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(posterAt), '-i', path.join(dir, 'video.mp4'), '-frames:v', '1', path.join(dir, 'poster.png')]);
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
      : spec.template === 'pixel' ? await renderCarousel(browser, { ...data, brandsCfg: JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8')), slides: data.slides.map((sl) => ({ ...sl, ...(sl.bgPhoto ? { bgPhoto: pathToFileURL(path.resolve(dir, sl.bgPhoto)).href } : {}), collage: (sl.collage || []).map((c) => ({ ...c, srcUrl: pathToFileURL(path.resolve(dir, c.src)).href })) })) }, '4:5', dir, 'pixel')
      : spec.template === 'photo' ? await renderCarousel(browser, { ...data, brandsCfg: JSON.parse(fs.readFileSync(path.join(ROOT, 'config/brands.json'), 'utf8')),
          // mask images load in CORS mode, which file:// can't satisfy, so the depth cutout goes in as a data URL
          slides: data.slides.map((sl) => sl.photo?.front ? { ...sl, photo: { ...sl.photo, frontUrl: `data:image/png;base64,${fs.readFileSync(path.join(ROOT, sl.photo.front)).toString('base64')}` } } : sl) }, '4:5', dir, 'photo-carousel')
      : spec.template === 'video' ? await renderVideo(browser, data, aspect, dir, fps)
      : spec.template === 'split' ? await renderSplit(browser, spec, dir, fps)
      : spec.template === 'story' ? await renderStory(browser, spec, dir, fps)
      : spec.template === 'arena' ? await renderArena(browser, spec, dir, fps)
      : spec.template === 'talkhead' ? await renderTalkhead(browser, spec, dir, fps)
      : (() => { throw new Error(`unknown template "${spec.template}"`); })();
    meta.media = files;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
    console.log(`  wrote ${files.join(', ')}`);
  } finally {
    await browser.close();
  }
}

export { resolveTalkhead, openTemplate };
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
