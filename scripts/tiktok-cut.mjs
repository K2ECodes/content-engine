#!/usr/bin/env node
// TikTok main cut of a finished reel: content/_tiktok/<post-id>/main.mp4 (kept apart from main posts and IG trials).
// TikTok's API won't attach a library track to our accounts (musicSelectable false), so the bed is mixed in here:
// --music <file> goes in quietly under the voice (sidechain-ducked, --vol 0.10 default). Without --music it's a straight copy
// (reels that already carry a bed, or swaps that keep their original audio).
//   node scripts/tiktok-cut.mjs <post> [--music file] [--vol 0.10]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const post = path.resolve(process.argv[2] || '');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const src = path.join(post, 'video.mp4');
if (!fs.existsSync(src)) { console.error(`no video.mp4 in ${post}`); process.exit(1); }
const out = path.join(ROOT, 'content/_tiktok', path.basename(post));
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, 'main.mp4');
const music = arg('music'), vol = Number(arg('vol', 0.1));
let args;
if (music) {
  const m = path.resolve(ROOT, music);
  args = ['-i', src, '-stream_loop', '-1', '-i', m, '-filter_complex',
    `[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=${vol},afade=t=in:d=0.6[bed];[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit[v1][v2];` +
    `[bed][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[duck];[v1][duck]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', file];
} else args = ['-i', src, '-c', 'copy', '-movflags', '+faststart', file];
const r = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...args], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`wrote ${path.relative(ROOT, file)}${music ? ` (music ${path.relative(ROOT, path.resolve(ROOT, music))} at ${vol})` : ' (copy)'}`);
