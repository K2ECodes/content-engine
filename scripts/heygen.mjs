#!/usr/bin/env node
// HeyGen talking heads of Korede (his digital twin), for the plate under split reels.
//
//   node scripts/heygen.mjs me                       wallet / plan balance
//   node scripts/heygen.mjs looks                    Korede's twin looks: id, engines, orientation, default voice
//   node scripts/heygen.mjs voices                   private (cloned) voices
//   node scripts/heygen.mjs plate <post-dir> [--engine avatar_iii|avatar_iv|avatar_v] [--audio <file>] [--webm]
//        reads render.json data.script (or data.say) and data.heygen {look, voice}; writes <post>/plate.mp4 + plate.srt
//
// Defaults: Avatar III ($0.01/s), 9:16 1080p, cream background. HEYGEN_LOOK_ID / HEYGEN_VOICE_ID in .env set the default twin.
// Weekly cap HEYGEN_WEEKLY_CAP_USD (default 10).

import fs from 'node:fs';
import path from 'node:path';
import * as hg from './lib/heygen.mjs';

const arg = (argv, n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };

async function main(argv) {
  const [cmd, a1] = argv;
  if (cmd === 'me') {
    const m = await hg.me();
    console.log(JSON.stringify({ billing_type: m.billing_type, wallet: m.wallet, subscription: m.subscription?.plan, usage_based: m.usage_based }, null, 2));
  } else if (cmd === 'looks') {
    for (const l of await hg.looks()) console.log(`${l.id}  ${l.name}  status=${l.status}  engines=${(l.supported_api_engines || []).join(',')}  ${l.preferred_orientation} ${l.image_width}x${l.image_height}  voice=${l.default_voice_id}`);
  } else if (cmd === 'voices') {
    const v = await hg.voices();
    for (const x of v.data || v) console.log(`${x.voice_id}  ${x.name}  ${x.language}  ${x.gender}`);
  } else if (cmd === 'train') {
    // node scripts/heygen.mjs train <footage.mp4> "<name>" [--group <avatar_group_id>]
    const r = await hg.trainTwin({ file: path.resolve(a1), name: argv[2], groupId: arg(argv, 'group') });
    console.log(JSON.stringify({ look: r.avatar_item?.id, group: r.avatar_group?.id, voice: r.avatar_item?.default_voice_id, status: r.avatar_item?.status }, null, 2));
  } else if (cmd === 'voice-clone') {
    // node scripts/heygen.mjs voice-clone <clean-speech.mp3> "<name>"   (free instant clone)
    console.log('voice_id', await hg.instantVoice({ file: path.resolve(a1), name: argv[2] || 'Korede instant' }));
  } else if (cmd === 'kie-plate') {
    // node scripts/heygen.mjs kie-plate <post-dir>: free HeyGen speech in Korede's instant voice + kie lip-sync of the base clip
    const dir = path.resolve(a1);
    const spec = JSON.parse(fs.readFileSync(path.join(dir, 'render.json'), 'utf8')).data;
    const kie = await import('./lib/kie.mjs');
    const voiceId = readEnv('HEYGEN_INSTANT_VOICE_ID');
    if (!voiceId) throw new Error('HEYGEN_INSTANT_VOICE_ID missing (run voice-clone)');
    fs.mkdirSync(path.join(dir, 'audio'), { recursive: true });
    const sp = await hg.freeSpeech(spec.heygen?.say || spec.say || spec.script, { voiceId, out: path.join(dir, 'audio', 'vo.wav') });
    console.log(`speech ${sp.duration}s`);
    const base = path.resolve(spec.heygen?.base || readEnv('TALKING_HEAD_BASE') || 'assets/talking-head/korede-base-16x9.mp4');
    const tmpPlate = path.join(dir, 'plate-lipsync.mp4');
    await kie.lipsync({ video: base, audio: sp.file, out: tmpPlate, seconds: sp.duration, label: `${path.basename(dir)} lipsync` });
    // kie returns the dub; mux our clean WAV back in so the voice is lossless.
    const { spawnSync } = await import('node:child_process');
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', tmpPlate, '-i', sp.file, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', path.join(dir, 'plate.mp4')], { stdio: 'inherit' });
    console.log('wrote plate.mp4');
  } else if (cmd === 'talk-segments') {
    // node scripts/heygen.mjs talk-segments <post-dir> 0-5.4,23.3-28.1,33.1-38.8
    // Lip-syncs only the windows where Korede is on screen (cheap), from audio/vo.wav, on the still base,
    // and builds a full-length plate.mp4 (video only): still frame elsewhere, talking inside the windows.
    const dir = path.resolve(a1);
    const wins = argv[2].split(',').map((w) => w.split('-').map(Number));
    const kie = await import('./lib/kie.mjs');
    const { spawnSync } = await import('node:child_process');
    const ff = (args) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' }); if (r.status) throw new Error('ffmpeg failed'); };
    const vo = path.join(dir, argv.includes('--audio') ? argv[argv.indexOf('--audio') + 1] : 'audio/vo.wav');
    const total = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vo]).stdout.toString());
    const base = path.resolve(readEnv('TALKING_HEAD_BASE') || 'assets/talking-head/korede-base-still-16x9.mp4');
    const still = path.resolve('assets/talking-head/natural-frames/001.jpg');
    const maskDir = path.resolve('assets/talking-head/natural-masks');
    const nMask = fs.readdirSync(maskDir).filter((f) => f.endsWith('.png')).length;
    // kie loops the base ping-pong (align_audio_reverse), so frame k of a segment shows base frame pp(k).
    const pp = (k) => { const m = k % (2 * nMask); return m < nMask ? m : 2 * nMask - 1 - m; };
    const maskFrames = [];
    const segDir = path.join(dir, 'talk'); fs.mkdirSync(segDir, { recursive: true });
    const parts = []; let cursor = 0;
    for (const [i, [a, b]] of wins.entries()) {
      const wav = path.join(segDir, `seg${i}.wav`), mp4 = path.join(segDir, `seg${i}.mp4`);
      ff(['-ss', String(a), '-to', String(b), '-i', vo, '-ac', '1', '-ar', '44100', wav]);
      if (!fs.existsSync(mp4)) await kie.lipsync({ video: base, audio: wav, out: mp4, seconds: b - a, label: `${path.basename(dir)} talk ${i}` });
      if (a > cursor) { parts.push({ still: true, d: a - cursor }); for (let k = 0; k < Math.round((a - cursor) * 25); k++) maskFrames.push(0); }
      parts.push({ file: mp4, d: b - a });
      for (let k = 0; k < Math.round((b - a) * 25); k++) maskFrames.push(pp(k));
      cursor = b;
    }
    if (total > cursor) { parts.push({ still: true, d: total - cursor }); for (let k = 0; k < Math.round((total - cursor) * 25); k++) maskFrames.push(0); }
    const norm = parts.map((p, i) => {
      const out = path.join(segDir, `part${i}.mp4`);
      if (p.still) ff(['-loop', '1', '-i', still, '-t', p.d.toFixed(3), '-r', '25', '-vf', 'scale=1920:1080,format=yuv420p', '-c:v', 'libx264', '-crf', '16', out]);
      else ff(['-i', p.file, '-t', p.d.toFixed(3), '-an', '-r', '25', '-vf', 'scale=1920:1080,format=yuv420p', '-c:v', 'libx264', '-crf', '16', out]);
      return out;
    });
    const list = path.join(segDir, 'list.txt');
    fs.writeFileSync(list, norm.map((f) => `file '${f}'`).join('\n'));
    ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(dir, 'plate.mp4')]);
    // Matching alpha mask video (25 fps), one mask per plate frame.
    const mlist = path.join(segDir, 'masks.txt');
    fs.writeFileSync(mlist, maskFrames.map((m) => `file '${path.join(maskDir, String(m + 1).padStart(3, '0') + '.png')}'\nduration 0.04`).join('\n'));
    ff(['-f', 'concat', '-safe', '0', '-i', mlist, '-vf', 'alphaextract,scale=1920:1080,fps=25,format=gray', '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', path.join(dir, 'plate-mask.mp4')]);
    console.log(`wrote plate.mp4 (${total.toFixed(1)}s, talking in ${wins.map((w) => w.join('-')).join(', ')})`);
  } else if (cmd === 'look') {
    const l = await hg.getLook(a1);
    console.log(JSON.stringify({ id: l.id, name: l.name, status: l.status, error: l.error, group: l.group_id, engines: l.supported_api_engines, orientation: l.preferred_orientation, size: `${l.image_width}x${l.image_height}` }, null, 2));
  } else if (cmd === 'plate') {
    const dir = path.resolve(a1);
    const spec = JSON.parse(fs.readFileSync(path.join(dir, 'render.json'), 'utf8')).data;
    const lookId = spec.heygen?.look || process.env.HEYGEN_LOOK_ID || readEnv('HEYGEN_LOOK_ID');
    if (!lookId) throw new Error('no twin look id: set data.heygen.look in render.json or HEYGEN_LOOK_ID in .env (see `node scripts/heygen.mjs looks`)');
    const script = spec.heygen?.say || spec.say || spec.script;
    const words = script.split(/\s+/).length;
    const r = await hg.avatarVideo({
      lookId, script, audio: arg(argv, 'audio'), voiceId: spec.heygen?.voice || readEnv('HEYGEN_VOICE_ID'),
      engine: arg(argv, 'engine', spec.heygen?.engine || 'avatar_iii'), webm: argv.includes('--webm'),
      keepBackground: spec.heygen?.keepBackground ?? true, aspect: spec.heygen?.aspect || '16:9', speed: spec.heygen?.speed ?? 1.1,
      motionPrompt: spec.heygen?.motion, estSeconds: Math.ceil(words / 3.6) + 3, out: path.join(dir, 'plate.mp4'), label: path.basename(dir),
    });
    console.log(`wrote ${path.relative(process.cwd(), r.file)} (${r.seconds}s)`);
  } else {
    console.error('usage: heygen.mjs me | looks | voices | plate <post-dir> [--engine ..] [--audio file] [--webm]');
    process.exit(1);
  }
}

function readEnv(k) {
  const f = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../.env');
  if (!fs.existsSync(f)) return undefined;
  const m = fs.readFileSync(f, 'utf8').match(new RegExp(`^\\s*${k}\\s*=\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
