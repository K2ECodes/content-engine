#!/usr/bin/env node
// Generate the beat stills for a deadpan what-if reel from <post>/prompts.json (kie nano-banana-2).
// The first still sets the hero; every later still passes it as image_input so the character stays consistent.
//   node --env-file=.env scripts/what-if-stills.mjs <post> [--only 3,4] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { runTask, upload, download, weekSpendUsd } from './lib/kie.mjs';

const post = process.argv[2];
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const only = arg('only') ? arg('only').split(',').map(Number) : null;
const force = process.argv.includes('--force');
const P = JSON.parse(fs.readFileSync(path.join(post, 'prompts.json'), 'utf8'));
const cap = Number(process.env.KIE_WEEKLY_CAP_USD || 30), per = 0.09;
const todo = P.shots.map((s, i) => ({ ...s, i })).filter((s) => (!only || only.includes(s.i)) && (force || !fs.existsSync(path.join(post, s.out + '.done'))));
if (weekSpendUsd() + todo.length * per > cap) { console.error(`budget: ${weekSpendUsd().toFixed(2)} + ${(todo.length * per).toFixed(2)} > ${cap}`); process.exit(2); }

let refUrl = null;
const refFile = path.join(post, P.shots[0].out);
for (const s of todo) {
  const out = path.join(post, s.out);
  const input = { prompt: s.prompt, aspect_ratio: '9:16', resolution: '2K', output_format: 'png' };
  if (s.i > 0) { refUrl ??= await upload(refFile, 'whatif'); input.image_input = [refUrl]; input.prompt = `Keep the exact same main character as the reference image (same face, hair, outfit, low-poly style). ${s.prompt}`; }
  const d = await runTask('nano-banana-2', input, { label: `what-if still ${path.basename(post)} ${s.out}`, estimateUsd: per });
  await download(d.result.resultUrls[0], out);
  fs.writeFileSync(out + '.done', new Date().toISOString());
  console.log('wrote', out);
}
