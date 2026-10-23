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
  } else if (cmd === 'plate') {
    const dir = path.resolve(a1);
    const spec = JSON.parse(fs.readFileSync(path.join(dir, 'render.json'), 'utf8')).data;
    const lookId = spec.heygen?.look || process.env.HEYGEN_LOOK_ID || readEnv('HEYGEN_LOOK_ID');
    if (!lookId) throw new Error('no twin look id: set data.heygen.look in render.json or HEYGEN_LOOK_ID in .env (see `node scripts/heygen.mjs looks`)');
    const script = spec.say || spec.script;
    const words = script.split(/\s+/).length;
    const r = await hg.avatarVideo({
      lookId, script, audio: arg(argv, 'audio'), voiceId: spec.heygen?.voice || readEnv('HEYGEN_VOICE_ID'),
      engine: arg(argv, 'engine', spec.heygen?.engine || 'avatar_iii'), webm: argv.includes('--webm'),
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
