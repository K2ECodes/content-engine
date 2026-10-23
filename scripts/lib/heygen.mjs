// HeyGen v3 client (developers.heygen.com, read 2026-10-23; v1/v2 retire 2026-10-31, so v3 only).
// Key: HEYGEN_API_KEY in .env, sent as X-Api-Key, never printed or logged.
// Billing is the API wallet, per second of output. Costs are estimated from duration and logged to logs/heygen-costs.jsonl.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://api.heygen.com';
const COST_LOG = path.join(ROOT, 'logs/heygen-costs.jsonl');

// USD per second for a digital twin (help.heygen.com API pricing, 2026-10-19).
export const RATE = { avatar_iii: 0.01, avatar_iv: 0.0805, avatar_v: 0.12 };

function env() {
  const file = path.join(ROOT, '.env');
  const vars = fs.existsSync(file) ? Object.fromEntries(fs.readFileSync(file, 'utf8').split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])) : {};
  return { ...vars, ...process.env };
}
const WEEKLY_CAP_USD = Number(env().HEYGEN_WEEKLY_CAP_USD || 10);

async function call(method, url, body, headers = {}) {
  const key = env().HEYGEN_API_KEY;
  if (!key) throw new Error('HEYGEN_API_KEY missing from .env');
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(BASE + url, {
      method,
      headers: { 'X-Api-Key': key, ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
    if ((res.status === 429 || res.status === 409) && attempt < 5) {
      await new Promise((r) => setTimeout(r, (Number(res.headers.get('retry-after')) || 5) * 1000));
      continue;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      const e = json.error || {};
      throw new Error(`heygen ${method} ${url}: ${res.status} ${e.code || ''} ${e.message || ''}`.trim());
    }
    return json.data ?? json;
  }
}

export const me = () => call('GET', '/v3/users/me');

export async function looks({ type = 'digital_twin', ownership = 'private' } = {}) {
  const out = [];
  let token = '';
  do {
    const d = await call('GET', `/v3/avatars/looks?avatar_type=${type}&ownership=${ownership}&limit=50${token ? `&token=${token}` : ''}`);
    out.push(...(d.data || d));
    token = d.has_more ? d.next_token : '';
  } while (token);
  return out;
}

export const voices = (type = 'private') => call('GET', `/v3/voices?type=${type}&limit=100`);

export async function uploadAsset(file) {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
  const d = await call('POST', '/v3/assets', form);
  return d.asset_id || d.id;
}

function weekSpend() {
  if (!fs.existsSync(COST_LOG)) return 0;
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return fs.readFileSync(COST_LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .filter((r) => new Date(r.ts) >= monday).reduce((s, r) => s + (r.usd || 0), 0);
}

// Make a vertical talking-head clip of Korede's twin. Either `script` (twin's cloned voice) or `audio` (local file path).
export async function avatarVideo({ lookId, script, audio, voiceId, engine = 'avatar_iii', out, estSeconds = 60,
  speed = 1.08, background = '#F5F0E8', webm = false, keepBackground = false, aspect = '9:16', motionPrompt, label = '' }) {
  const est = (RATE[engine] || 0.12) * estSeconds;
  if (weekSpend() + est > WEEKLY_CAP_USD) throw new Error(`weekly HeyGen cap: ~$${est.toFixed(2)} would exceed $${WEEKLY_CAP_USD} (raise HEYGEN_WEEKLY_CAP_USD in .env)`);

  const body = { type: 'avatar', avatar_id: lookId, aspect_ratio: aspect, resolution: '1080p', fit: 'cover', engine: { type: engine }, caption: { file_format: 'srt' }, title: label || undefined };
  if (audio) body.audio_asset_id = await uploadAsset(audio);
  else { body.script = script; if (voiceId) body.voice_id = voiceId; body.voice_settings = { speed }; }
  if (webm) body.output_format = 'webm';
  else if (!keepBackground) { body.remove_background = true; body.background = { type: 'color', value: background }; }
  if (motionPrompt && engine === 'avatar_v') body.motion_prompt = motionPrompt;

  const idem = crypto.createHash('sha256').update(JSON.stringify({ ...body, audio })).digest('hex').slice(0, 40);
  const { video_id } = await call('POST', '/v3/videos', body, { 'Idempotency-Key': `ce:${idem}` });

  for (;;) {
    await new Promise((r) => setTimeout(r, 10000));
    const v = await call('GET', `/v3/videos/${video_id}`);
    if (v.status === 'failed') throw new Error(`heygen video ${video_id} failed: ${v.failure_code || ''} ${v.failure_message || ''}`);
    if (v.status === 'completed') {
      const seconds = Number(v.duration) || estSeconds;
      fs.mkdirSync(path.dirname(COST_LOG), { recursive: true });
      fs.appendFileSync(COST_LOG, JSON.stringify({ ts: new Date().toISOString(), video_id, engine, seconds, usd: +(seconds * (RATE[engine] || 0)).toFixed(3), label }) + '\n');
      const dl = async (url, dest) => { const r = await fetch(url); if (!r.ok) throw new Error(`download ${r.status}`); fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); return dest; };
      const file = await dl(v.video_url, out.replace(/\.[a-z0-9]+$/i, '') + (webm ? '.webm' : '.mp4'));
      if (v.subtitle_url) await dl(v.subtitle_url, out.replace(/\.[a-z0-9]+$/i, '') + '.srt');
      return { file, seconds, video_id };
    }
  }
}

// Upload a large file with direct upload (up to 200 MB video), returns asset_id.
export async function directUpload(file, contentType = 'video/mp4') {
  const size = fs.statSync(file).size;
  const d = await call('POST', '/v3/assets/direct-uploads', { filename: path.basename(file), content_type: contentType, size_bytes: size });
  const res = await fetch(d.upload_url, { method: 'PUT', headers: d.upload_headers || { 'Content-Type': contentType }, body: fs.readFileSync(file) });
  if (!res.ok) throw new Error(`direct upload PUT ${res.status}`);
  await call('POST', `/v3/assets/${d.asset_id}/complete`, {});
  return d.asset_id;
}

export const getLook = (id) => call('GET', `/v3/avatars/looks/${id}`);

// Train a digital twin from footage. Pass groupId to add it as a new look of an existing character (same person).
export async function trainTwin({ file, name, groupId }) {
  const asset_id = await directUpload(file);
  const body = { type: 'digital_twin', name, file: { type: 'asset_id', asset_id } };
  if (groupId) body.avatar_group_id = groupId;
  return call('POST', '/v3/avatars', body);
}
