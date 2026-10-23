#!/usr/bin/env node
// Tighten a voiceover's cadence (Korede: no "Gen Z pause", but don't let words fall over each other).
// Every pause longer than --max (0.3 s) is shortened to --keep (0.16 s), split evenly around the cut.
// Writes <in>-tight.wav (or --out).
//   node scripts/tighten.mjs <post>/audio/vo.wav [--out file] [--keep 0.16] [--max 0.3] [--noise -35] [--words <post>/words.json]
// With --words, the existing (hand-fixed) word timings are shifted to the tightened audio in place, so no re-transcribe is needed.
import { spawnSync } from 'node:child_process';

const [src] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const out = arg('out', src.replace(/\.(wav|mp3)$/i, '-tight.wav'));
const keep = Number(arg('keep', 0.24)), max = Number(arg('max', 0.4)), noise = arg('noise', '-35');

const dur = (f) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
const det = spawnSync('ffmpeg', ['-i', src, '-af', `silencedetect=noise=${noise}dB:d=${max}`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const starts = [...det.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...det.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));

// Keep segments: speech plus keep/2 of silence on each side of every long pause.
// Section breaks keep a real beat: pauses already longer than --breakOver (0.75 s), or right before any --beatBefore word
// (e.g. --beatBefore "Round,Step,But" with --words), keep --beat (0.45 s) instead of --keep.
const beat = Number(arg('beat', 0.45)), breakOver = Number(arg('breakOver', 0.75));
const beatWords = (arg('beatBefore', '') || '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
let wordList = [];
if (arg('words')) { const fs0 = await import('node:fs'); wordList = JSON.parse(fs0.readFileSync(arg('words'), 'utf8')).words; }
const total = dur(src), segs = [];
let cursor = 0;
starts.forEach((s, i) => {
  const e = ends[i] ?? total;
  if (s <= 0.05) { cursor = Math.max(cursor, e - keep / 2); return; }        // trim leading silence
  const next = wordList.find((w) => w.start >= e - 0.15);
  const isBeat = e - s > breakOver || (next && beatWords.includes(next.w.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const k = isBeat ? beat : keep;
  segs.push([cursor, s + k / 2]);
  cursor = e - k / 2;
});
if (cursor < total) segs.push([cursor, Math.min(total, cursor + (total - cursor))]);

const filters = segs.map(([a, b], i) => `[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, b - a - 0.01).toFixed(3)}:d=0.01[s${i}]`);
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex',
  `${filters.join(';')};${segs.map((_, i) => `[s${i}]`).join('')}concat=n=${segs.length}:v=0:a=1[o]`, '-map', '[o]', '-ar', '44100', '-ac', '1', out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
const wordsFile = arg('words');
if (wordsFile) {
  const fs = await import('node:fs');
  const map = (t) => { let acc = 0; for (const [a, b] of segs) { if (t < a) return acc; if (t <= b) return acc + (t - a); acc += b - a; } return acc; };
  const w = JSON.parse(fs.readFileSync(wordsFile, 'utf8'));
  w.words = w.words.map((x) => ({ ...x, start: +map(x.start).toFixed(3), end: +map(x.end).toFixed(3) }));
  fs.writeFileSync(wordsFile, JSON.stringify(w, null, 1));
  console.log(`  remapped ${w.words.length} words in ${wordsFile}`);
}
console.log(`${src}: ${total.toFixed(2)}s -> ${out}: ${dur(out).toFixed(2)}s (${starts.length} pauses tightened)`);
