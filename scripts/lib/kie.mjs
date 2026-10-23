// kie.ai client. Spec: docs.kie.ai (read 2026-10-23), see README "kie.ai".
// The API key is read from .env and never printed, logged or returned.
// Every finished task appends {ts, model, taskId, credits, usd, label} to logs/kie-costs.jsonl.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://api.kie.ai';
const COST_LOG = path.join(ROOT, 'logs/kie-costs.jsonl');
export const USD_PER_CREDIT = 0.005;
const WEEKLY_CAP_USD = Number(process.env.KIE_WEEKLY_CAP_USD || readEnv().KIE_WEEKLY_CAP_USD || 20);

function readEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')]));
}

function key() {
  const k = process.env.KIE_API_KEY || readEnv().KIE_API_KEY;
  if (!k) throw new Error('KIE_API_KEY missing from .env');
  return k;
}

async function call(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({ code: res.status, msg: `non-JSON response (HTTP ${res.status})` }));
  // kie returns errors as HTTP 200 with a body code.
  if (json.code !== 200) throw new Error(`kie ${url}: ${json.code} ${json.msg || ''}`.trim());
  return json.data;
}

export const credits = () => call('GET', '/api/v1/chat/credit');

// ISO week spend so far, from the cost log.
export function weekSpendUsd(now = new Date()) {
  if (!fs.existsSync(COST_LOG)) return 0;
  const monday = new Date(now);
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return fs.readFileSync(COST_LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .filter((r) => new Date(r.ts) >= monday).reduce((s, r) => s + (r.usd || 0), 0);
}

function logCost(entry) {
  fs.mkdirSync(path.dirname(COST_LOG), { recursive: true });
  fs.appendFileSync(COST_LOG, JSON.stringify(entry) + '\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Create a market task, poll to completion, log its cost. Returns recordInfo data.
export async function runTask(model, input, { label = '', estimateUsd = 0, timeoutMs = 20 * 60e3 } = {}) {
  const spent = weekSpendUsd();
  if (spent + estimateUsd > WEEKLY_CAP_USD)
    throw new Error(`weekly kie.ai cap: $${spent.toFixed(2)} spent + ~$${estimateUsd.toFixed(2)} > $${WEEKLY_CAP_USD} (raise KIE_WEEKLY_CAP_USD in .env)`);

  const { taskId } = await call('POST', '/api/v1/jobs/createTask', { model, input });
  const started = Date.now();
  let wait = 2500;
  for (;;) {
    await sleep(wait);
    wait = Math.min(wait * 1.5, 15000);
    const d = await call('GET', `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
    if (d.state === 'success' || d.state === 'fail') {
      const credits = Number(d.creditsConsumed || 0);
      logCost({ ts: new Date().toISOString(), model, taskId, state: d.state, credits, usd: +(credits * USD_PER_CREDIT).toFixed(4), label });
      if (d.state === 'fail') throw new Error(`kie task ${taskId} failed: ${d.failCode || ''} ${d.failMsg || ''}`.trim());
      d.result = d.response || (d.resultJson ? JSON.parse(d.resultJson) : {});
      return d;
    }
    if (Date.now() - started > timeoutMs) throw new Error(`kie task ${taskId} timed out in state ${d.state}`);
  }
}

export async function download(url, out) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  return out;
}

// Voices. kie's docs don't state gender; these were picked by name/descriptor and auditioned.
export const VOICES = {
  male: 'nPczCjzI2devNBz1zQrb',   // Brian: deep, resonant, comforting
  female: '56AoDkrOh6qfVPDXZ7Pt', // Cassidy: crisp, direct, clear
};
export const resolveVoice = (v) => VOICES[v] || v || VOICES.male;

export async function tts(text, { voice = 'male', out, label, speed = 1, stability = 0.5, style = 0 }) {
  const d = await runTask('elevenlabs/text-to-speech-multilingual-v2',
    { text, voice: resolveVoice(voice), stability, similarity_boost: 0.75, style, speed },
    { label, estimateUsd: (text.length / 1000) * 12 * USD_PER_CREDIT });
  const url = d.result.resultUrls?.[0];
  if (!url) throw new Error('tts: no audio URL in result');
  return download(url, out);
}

// Suno instrumental. Returns paths of the variations (usually 2).
export async function music({ title, style, negative = 'vocals, singing, voice', duration = 60, out, label }) {
  const d = await runTask('ai-music-api/generate',
    { custom_mode: true, instrumental: true, model: 'V6', title, style, negative_tags: negative, duration },
    { label, estimateUsd: 12 * USD_PER_CREDIT });
  const tracks = d.response?.data || d.result?.data || [];
  const urls = tracks.map((t) => t.audio_url).filter(Boolean);
  if (!urls.length) throw new Error('music: no audio_url in result');
  const ext = path.extname(out);
  return Promise.all(urls.map((u, i) => download(u, i ? out.replace(ext, `-${i + 1}${ext}`) : out)));
}

export async function image(prompt, { model = 'nano-banana-2', aspect = '9:16', resolution = '2K', out, label }) {
  const input = model === 'nano-banana-2'
    ? { prompt, aspect_ratio: aspect, resolution, output_format: 'png' }
    : { prompt, aspect_ratio: aspect };
  const d = await runTask(model, input, { label, estimateUsd: 18 * USD_PER_CREDIT });
  const url = d.result.resultUrls?.[0];
  if (!url) throw new Error('image: no URL in result');
  return download(url, out);
}
