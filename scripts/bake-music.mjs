#!/usr/bin/env node
// Bake a music track under a video's own audio (voice + SFX), for accounts that can't attach catalog songs
// (@koredekola.ai, @contentsystems.ai, TikTok). Video stream is copied, only the audio is rebuilt.
//
//   node scripts/bake-music.mjs <in.mp4> <track.mp3> <out.mp4> [--start s] [--under 20] [--gap 11] [--json]
//
// Mix rules (CLAUDE.md, 2026-10-26):
// - music sits about 20 dB under the voice while anyone talks (--under 17 on the envelope measures ~-20 LU after
//   fades and gating, ~10%), and comes up to
//   about 9 to 11 dB under the voice level only where there is no speech (--gap)
// - speech is found with silencedetect on the video's own audio; the music follows a gain envelope
//   (fast duck 120 ms, slow release 350 ms), fades in 0.4 s and out 1.2 s
// - --start: seconds into the track; default = the most energetic stretch of the track (the hook)
// - final peak limited to -1.0 dBFS (spec: <= -0.7 dBFS), AAC 192k, +faststart
// --bed-only writes only the music bed (for level checks).
// --json prints the measurements (voice LUFS, music under/gap levels, output peak) as 1 JSON line.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const BIN = path.join(os.homedir(), '.local/bin');
const FF = fs.existsSync(path.join(BIN, 'ffmpeg')) ? path.join(BIN, 'ffmpeg') : 'ffmpeg';
const FP = fs.existsSync(path.join(BIN, 'ffprobe')) ? path.join(BIN, 'ffprobe') : 'ffprobe';

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--json'].includes(args[i - 1])));
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? Number(args[i + 1]) : d; };
const [inF, trackF, outF] = pos;
if (!inF || !trackF || !outF) { console.error('usage: bake-music.mjs <in.mp4> <track.mp3> <out.mp4> [--start s] [--under 20] [--gap 11] [--json]'); process.exit(1); }
const UNDER = opt('under', 17), GAP = opt('gap', 9);
const SR = 48000;

const run = (bin, a) => { const r = spawnSync(bin, a, { encoding: 'utf8', maxBuffer: 1 << 28 }); if (r.status !== 0) throw new Error(r.stderr.slice(-800)); return r.stderr; };
const duration = (f) => Number(execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim());
const lufs = (f, pre = []) => { const e = run(FF, ['-hide_banner', '-nostats', ...pre, '-i', f, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']); const m = [...e.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(); return m ? Number(m[1]) : -70; };

const dur = duration(inF);
const tdur = duration(trackF);

// 1. voice loudness + speech segments (silencedetect relative to the voice level)
const Lvo = lufs(inF);
const thr = Math.max(-60, Lvo - 22);
const sd = run(FF, ['-hide_banner', '-nostats', '-i', inF, '-vn', '-af', `silencedetect=noise=${thr}dB:d=0.35`, '-f', 'null', '-']);
const sil = [];
let s0 = null;
for (const l of sd.split('\n')) {
  const a = l.match(/silence_start: (-?[\d.]+)/); if (a) s0 = Math.max(0, Number(a[1]));
  const b = l.match(/silence_end: ([\d.]+)/); if (b && s0 !== null) { sil.push([s0, Number(b[1])]); s0 = null; }
}
if (s0 !== null) sil.push([s0, dur]);

// 2. track start: most energetic window of the track (hook/chorus) unless --start given
let start = opt('start', NaN);
if (Number.isNaN(start)) {
  const pcm = execFileSync(FF, ['-v', 'error', '-i', trackF, '-ac', '1', '-ar', '4000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const smp = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const hop = 2000; // 0.5 s
  const e = [];
  for (let i = 0; i + hop <= smp.length; i += hop) { let s = 0; for (let j = i; j < i + hop; j++) s += smp[j] * smp[j]; e.push(s / hop); }
  const win = Math.min(e.length, Math.ceil(dur * 2));
  let best = 0, bi = 0, acc = 0;
  for (let i = 0; i < e.length; i++) { acc += e[i]; if (i >= win) acc -= e[i - win]; if (i >= win - 1 && i - win + 1 <= (tdur - dur - 1) * 2 && acc > best) { best = acc; bi = i - win + 1; } }
  start = Math.max(0, bi / 2 - 1.0); // land a beat before the energetic stretch
}
if (start + dur > tdur) start = Math.max(0, tdur - dur);
const Lm = lufs(trackF, ['-ss', String(start), '-t', String(dur)]);

// 3. gain envelope (linear, relative to music normalised to the voice level)
const gU = Math.pow(10, -UNDER / 20), gG = Math.pow(10, -GAP / 20);
const n = Math.ceil(dur * SR);
const target = new Float32Array(n).fill(gU);
for (const [a, b] of sil) { const i0 = Math.floor(a * SR), i1 = Math.min(n, Math.floor(b * SR)); for (let i = i0; i < i1; i++) target[i] = gG; }
const env = new Float32Array(n);
const att = 1 / (0.12 * SR), rel = 1 / (0.35 * SR);
let g = target[0];
for (let i = 0; i < n; i++) {
  const t = target[i];
  // move linearly toward the target in gain space (span gG-gU per 120 ms down / 350 ms up)
  const step = (gG - gU) * (t < g ? att : rel);
  g = t < g ? Math.max(t, g - step) : Math.min(t, g + step);
  const ts = i / SR;
  const fin = Math.min(1, ts / 0.4), fout = Math.min(1, Math.max(0, (dur - ts) / 1.2));
  env[i] = g * fin * fout;
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bake-'));
const envF = path.join(tmp, 'env.wav');
{
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(32, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) buf.writeFloatLE(env[i], 44 + i * 4);
  fs.writeFileSync(envF, buf);
}

// 4. mix: music normalised to the voice loudness, times the envelope, plus the original audio, limited.
// AAC can overshoot the limiter on sharp transients, so measure and redo with a lower ceiling if the peak is above -0.7 dBFS.
const norm = (Lvo - Lm).toFixed(2);
fs.mkdirSync(path.dirname(path.resolve(outF)), { recursive: true });
let limit = 0.891, peak = 0;
for (let attempt = 0; attempt < 4; attempt++) {
  const fc = [
    `[0:a]aresample=${SR},aformat=sample_fmts=fltp:channel_layouts=stereo[vo]`,
    `[1:a]atrim=${start.toFixed(3)}:${(start + dur).toFixed(3)},asetpts=PTS-STARTPTS,aresample=${SR},aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${norm}dB[m]`,
    `[2:a]aresample=${SR},aformat=sample_fmts=fltp:channel_layouts=stereo[e]`,
    `[m][e]amultiply[bed]`,
    (args.includes('--bed-only') ? `[vo]anullsink;[bed]anull` : `[vo][bed]amix=inputs=2:normalize=0:duration=first`) + `,alimiter=limit=${limit.toFixed(3)}:level=false:attack=1:release=60[out]`,
  ];
  run(FF, ['-hide_banner', '-y', '-i', inF, '-i', trackF, '-i', envF, '-filter_complex', fc.join(';'), '-map', '0:v:0', '-map', '[out]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', String(SR), '-movflags', '+faststart', '-shortest', outF]);
  // 5. measure the result
  const vd = run(FF, ['-hide_banner', '-nostats', '-i', outF, '-vn', '-af', 'volumedetect', '-f', 'null', '-']);
  peak = Number((vd.match(/max_volume: (-?[\d.]+) dB/) || [])[1]);
  if (peak <= -0.7) break;
  limit *= 0.85;
}
fs.rmSync(tmp, { recursive: true, force: true });

const res = { in: inF, track: path.basename(trackF), out: outF, dur: +dur.toFixed(2), start: +start.toFixed(2), voiceLUFS: Lvo, trackLUFS: Lm, musicUnderSpeechLUFS: +(Lvo - UNDER).toFixed(1), musicGapLUFS: +(Lvo - GAP).toFixed(1), silences: sil.length, outPeakDb: peak };
if (args.includes('--json')) console.log(JSON.stringify(res));
else console.log(`${path.basename(outF)}: ${res.track} @${res.start}s, voice ${Lvo} LUFS, music ${UNDER} dB under speech / ${GAP} dB in ${sil.length} gaps, peak ${peak} dBFS`);
