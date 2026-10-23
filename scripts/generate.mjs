#!/usr/bin/env node
// kie.ai generation: voiceover, music, images. Costs land in logs/kie-costs.jsonl.
// Weekly spend cap: KIE_WEEKLY_CAP_USD in .env (default 20).
//
//   node scripts/generate.mjs credit
//   node scripts/generate.mjs audio <post-dir> [--local]   voiceover per scene + music bed for a video post
//   node scripts/generate.mjs tts "<text>" --voice male|female|<voiceId> --out file.mp3
//   node scripts/generate.mjs music "<style>" --duration 40 --out file.mp3
//   node scripts/generate.mjs image "<prompt>" --aspect 9:16 --out file.png
//
// --local uses macOS `say` for the voiceover and a silent bed: free, for testing timing and mixing only.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as kie from './lib/kie.mjs';

const arg = (argv, name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };

export function probeDuration(file) {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
}

// render.json video data:
//   voice: "male" | "female" | <voiceId>      (omit for no voiceover)
//   music: { style, title?, volume? }         (omit for no music)
//   scenes[].vo: the line spoken over that scene (also the burned-in caption, so it's linted)
//   scenes[].voSay: optional pronunciation override sent to TTS instead of vo ("two hundred fifty thousand")
// Writes <post>/audio/vo-NN.mp3, audio/music.mp3 and audio/manifest.json, which render.mjs uses for timing and mixing.
async function audio(dir, { local = false } = {}) {
  const spec = JSON.parse(fs.readFileSync(path.join(dir, 'render.json'), 'utf8'));
  const data = spec.data;
  const outDir = path.join(dir, 'audio');
  fs.mkdirSync(outDir, { recursive: true });
  const prevPath = path.join(outDir, 'manifest.json');
  const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, 'utf8')) : { scenes: [] };
  const manifest = { voice: data.voice || null, scenes: [], music: null };

  for (const [i, s] of data.scenes.entries()) {
    if (!s.vo || !data.voice) continue;
    const name = `vo-${String(i + 1).padStart(2, '0')}`;
    let file;
    const reuse = prev.voice === data.voice && prev.scenes.find((p) => p.index === i && p.text === s.vo && p.say === (s.voSay || s.vo) && fs.existsSync(path.join(dir, p.file)));
    if (reuse && !local) {
      file = path.join(dir, reuse.file);
    } else if (local) {
      file = path.join(outDir, `${name}.aiff`);
      execFileSync('say', ['-v', data.voice === 'female' ? 'Samantha' : 'Daniel', '-o', file, s.voSay || s.vo]);
    } else {
      file = await kie.tts(s.voSay || s.vo, { voice: data.voice, out: path.join(outDir, `${name}.mp3`), label: `${path.basename(dir)} ${name}` });
    }
    manifest.scenes.push({ index: i, file: path.relative(dir, file), duration: probeDuration(file), text: s.vo, say: s.voSay || s.vo });
    fs.writeFileSync(prevPath, JSON.stringify({ ...manifest, partial: true }, null, 2) + '\n');
    console.log(`  ${name} ${manifest.scenes.at(-1).duration.toFixed(2)}s`);
  }

  if (data.music) {
    const voTotal = manifest.scenes.reduce((t, s) => t + s.duration, 0);
    const length = Math.ceil(Math.max(voTotal + data.scenes.length * 0.8, Math.max(...data.scenes.map((s) => s.end))) + 3);
    const file = path.join(outDir, 'music.mp3');
    if (prev.music && fs.existsSync(file) && !local) {
      // keep the existing bed
    } else if (local) {
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`, '-t', String(length), file]);
    } else {
      await kie.music({ title: data.music.title || path.basename(dir).slice(0, 80), style: data.music.style, duration: Math.min(360, Math.max(10, length)), out: file, label: `${path.basename(dir)} music` });
    }
    manifest.music = { file: 'audio/music.mp3', volume: data.music.volume ?? 0.16 };
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  wrote audio/manifest.json${local ? ' (local placeholders)' : ''}`);
}

async function main(argv) {
  const [cmd, a1] = argv;
  if (cmd === 'credit') {
    console.log(`balance ${await kie.credits()} credits (~$${((await kie.credits()) * kie.USD_PER_CREDIT).toFixed(2)}), spent this week $${kie.weekSpendUsd().toFixed(2)}`);
  } else if (cmd === 'audio') {
    await audio(path.resolve(a1), { local: argv.includes('--local') });
  } else if (cmd === 'tts') {
    console.log(await kie.tts(a1, { voice: arg(argv, 'voice', 'male'), out: arg(argv, 'out', 'tts.mp3'), label: 'cli tts' }));
  } else if (cmd === 'music') {
    console.log(await kie.music({ title: arg(argv, 'title', 'bed'), style: a1, duration: Number(arg(argv, 'duration', 60)), out: arg(argv, 'out', 'music.mp3'), label: 'cli music' }));
  } else if (cmd === 'image') {
    console.log(await kie.image(a1, { aspect: arg(argv, 'aspect', '9:16'), model: arg(argv, 'model', 'nano-banana-2'), out: arg(argv, 'out', 'image.png'), label: 'cli image' }));
  } else {
    console.error('usage: generate.mjs credit | audio <post-dir> [--local] | tts | music | image  (see header)');
    process.exit(1);
  }
}

main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
