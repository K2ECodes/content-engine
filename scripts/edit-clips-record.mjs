#!/usr/bin/env node
// Screen-record real product pages for the AI edit montage (Playwright recordVideo, 1080x1920): smooth scroll + cursor moves,
// optional typing into a visible prompt box (never submits). Cuts each recording into 1 s clips in assets/edit-clips/ + manifest.json.
//   node scripts/edit-clips-record.mjs            (records the PAGES list below)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'assets/edit-clips'), TMP = path.join(ROOT, 'tmp/edit-rec');
fs.mkdirSync(TMP, { recursive: true });
const PAGES = [
  { id: 'web-chatgpt', brand: 'chatgpt', url: 'https://chatgpt.com/', type: 'build me a dashboard for my agents' },
  { id: 'web-openai-codex', brand: 'chatgpt', url: 'https://openai.com/codex/' },
  { id: 'web-openai-chatgpt', brand: 'chatgpt', url: 'https://openai.com/chatgpt/overview/' },
  { id: 'web-gh-codex', brand: 'chatgpt', url: 'https://github.com/openai/codex' },
  { id: 'web-gemini', brand: 'gemini', url: 'https://gemini.google.com/', type: 'plan a 5 day trip to Lisbon' },
  { id: 'web-deepmind-gemini', brand: 'gemini', url: 'https://deepmind.google/models/gemini/' },
  { id: 'web-gh-gemini-cli', brand: 'gemini', url: 'https://github.com/google-gemini/gemini-cli' },
  { id: 'web-claude-code', brand: 'claude', url: 'https://www.claude.com/product/claude-code' },
  { id: 'web-anthropic-claude', brand: 'claude', url: 'https://www.anthropic.com/claude' },
  { id: 'web-gh-claude-code', brand: 'claude', url: 'https://github.com/anthropics/claude-code' },
  { id: 'web-cursor', brand: 'cursor', url: 'https://cursor.com/' },
  { id: 'web-gh-trending', brand: 'any', url: 'https://github.com/trending' },
];
const only = process.argv.slice(2);
const manP = path.join(OUT, 'manifest.json');
const man = fs.existsSync(manP) ? JSON.parse(fs.readFileSync(manP, 'utf8')) : [];
const browser = await chromium.launch();
for (const p of PAGES.filter((p) => !only.length || only.includes(p.id))) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, recordVideo: { dir: TMP, size: { width: 1080, height: 1920 } }, colorScheme: 'dark', locale: 'en-US' });
  const page = await ctx.newPage();
  const t0 = Date.now();
  try {
    await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3500);
    for (const sel of ['button:has-text("Accept all")', 'button:has-text("Accept")', 'button:has-text("Reject all")', 'button:has-text("Stay logged out")']) await page.locator(sel).first().click({ timeout: 800 }).catch(() => {});
    const startAt = (Date.now() - t0) / 1000;
    if (p.type) {
      const box = page.locator('textarea, [contenteditable="true"]').first();
      if (await box.isVisible().catch(() => false)) { await box.click().catch(() => {}); await page.keyboard.type(p.type, { delay: 70 }); await page.waitForTimeout(600); }
    }
    for (let i = 0; i < 9; i++) {
      await page.mouse.move(200 + ((i * 337) % 700), 500 + ((i * 523) % 1100), { steps: 12 });
      await page.mouse.wheel(0, 420); await page.waitForTimeout(650);
    }
    p.startAt = startAt;
  } catch (e) { console.error(p.id, e.message.split('\n')[0]); }
  const dur = (Date.now() - t0) / 1000;
  await ctx.close();
  const vid = await page.video().path();
  if (p.startAt == null) continue;
  for (const f of fs.readdirSync(OUT).filter((f) => f.startsWith(p.id + '-'))) fs.unlinkSync(path.join(OUT, f));
  let n = 0;
  for (let t = p.startAt; t + 1 <= dur - 0.3 && n < 8; t += 1.4) {
    const f = `${p.id}-${String(++n).padStart(2, '0')}.mp4`;
    spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-ss', t.toFixed(2), '-i', vid, '-t', '1.0', '-an', '-vf', 'fps=30', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(OUT, f)]);
    man.splice(man.findIndex((m) => m.file === f) >>> 0, man.some((m) => m.file === f) ? 1 : 0);
    man.push({ file: f, brand: p.brand, source: p.url, at: +t.toFixed(2), kind: 'screen-recording' });
  }
  console.log(p.id, n, 'clips');
}
await browser.close();
fs.writeFileSync(manP, JSON.stringify(man, null, 1));
