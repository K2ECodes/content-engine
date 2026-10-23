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
//   video    -> video.mp4 (H.264, yuv420p) + poster.png
// meta.json "media" is updated with the files written.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
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

async function renderVideo(browser, data, aspect, dir, fps) {
  const { page } = await openTemplate(browser, 'video', data, aspect);
  const duration = await page.evaluate(() => window.duration);
  const frames = Math.round(duration * fps);
  const out = path.join(dir, 'video.mp4');

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
  process.stdout.write(`\r  ${frames} frames, ${duration}s at ${fps}fps\n`);

  // Poster: the most legible moment, or 1.5s in.
  await page.evaluate((t) => { window.seek(t); }, data.posterAt ?? 1.5);
  await page.screenshot({ path: path.join(dir, 'poster.png') });
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
      : (() => { throw new Error(`unknown template "${spec.template}"`); })();
    meta.media = files;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
    console.log(`  wrote ${files.join(', ')}`);
  } finally {
    await browser.close();
  }
}

main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
