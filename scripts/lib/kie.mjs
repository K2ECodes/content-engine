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
  let res;
  for (let attempt = 1; ; attempt++) {
    try {
      res = await fetch(BASE + url, {
        method,
        headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      break;
    } catch (e) {
      // fetch only throws when no response arrived (DNS, reset, timeout), so retrying is safe.
      if (attempt >= 5) throw e;
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  return parse(res, url);
}

async function parse(res, url) {
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
  let res;
  for (let i = 1; ; i++) { try { res = await fetch(url); break; } catch (e) { if (i >= 5) throw e; await sleep(3000 * i); } }
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  return out;
}

// Voices. kie's docs don't state gender; picked by name/descriptor and auditioned (assets/voices/).
// ElevenLabs is preferred; Gemini TTS is the fallback (ElevenLabs on kie returned 500s on 2026-10-23).
export const VOICES = {
  male: { eleven: 'nPczCjzI2devNBz1zQrb', gemini: 'Charon' },   // Brian / Charon
  female: { eleven: '56AoDkrOh6qfVPDXZ7Pt', gemini: 'Kore', gemini38: 'Tavi' },   // Cassidy / Kore / Tavi (3.8 alt: Kore)
};

async function ttsEleven(text, voice, { label, speed, stability, style }) {
  const id = VOICES[voice]?.eleven || voice;
  const d = await runTask('elevenlabs/text-to-speech-multilingual-v2',
    { text, voice: id, stability, similarity_boost: 0.75, style, speed },
    { label, estimateUsd: (text.length / 1000) * 12 * USD_PER_CREDIT });
  return d.result.resultUrls?.[0];
}

async function ttsGemini(text, voice, { label, geminiStyle = 'Newscaster' }) {
  const name = VOICES[voice]?.gemini || voice;
  const d = await runTask('google/gemini-3-1-flash-tts', {
    speakers: [{ speaker_id: 'Speaker 1', voice_name: name, accent: 'American (Gen)', style: geminiStyle, pace: 'Natural' }],
    dialogue_turns: [{ speaker_id: 'Speaker 1', text }],
  }, { label, estimateUsd: 0.05 });
  return d.result.resultUrls?.[0];
}

const TRANSIENT = /\b(500|501|524|429)\b|timeout/i;
async function withRetry(fn, tries = 3) {
  for (let i = 1; ; i++) {
    try { return await fn(); } catch (e) {
      if (i >= tries || !TRANSIENT.test(e.message)) throw e;
      console.warn(`  retry ${i}/${tries - 1}: ${e.message}`);
      await sleep(4000 * i);
    }
  }
}

// Gemini 3.8 takes a free-text delivery direction per turn; voices are named by use case, gender undocumented (auditioned).
export const CREATOR_STYLE = 'Young guy in his late 20s narrating a viral Instagram explainer reel. Energetic, confident and conversational, quick pace, punchy emphasis on numbers, warm and natural, never announcer-like.';
async function ttsGemini38(text, voice, { label, styleText = CREATOR_STYLE }) {
  const name = VOICES[voice]?.gemini38 || voice;
  const d = await runTask('google/gemini-3-8-flash-tts', {
    speakers: [{ speaker_id: 'Speaker 1', voice_name: name }],
    dialogue_turns: [{ speaker_id: 'Speaker 1', style: styleText, text }],
  }, { label, estimateUsd: 0.03 });
  return d.result.resultUrls?.[0];
}
export async function ttsCreator(text, { voice = 'male', out, label, styleText }) {
  const url = await withRetry(() => ttsGemini38(text, voice, { label, styleText }));
  const ext = path.extname(new URL(url).pathname) || '.wav';
  return download(url, out.replace(/\.[a-z0-9]+$/i, '') + ext);
}

// provider: 'auto' (ElevenLabs, then Gemini; skips ElevenLabs for the rest of the run once it fails) | 'eleven' | 'gemini'
let elevenDown = false;
export async function tts(text, { voice = 'male', out, label, provider = process.env.KIE_TTS_PROVIDER || 'auto', speed = 1, stability = 0.5, style = 0, geminiStyle }) {
  let url;
  if (provider === 'eleven' || (provider === 'auto' && !elevenDown)) {
    try { url = await ttsEleven(text, voice, { label, speed, stability, style }); }
    catch (e) { if (provider === 'eleven') throw e; elevenDown = true; console.warn(`  ElevenLabs failed (${e.message}), using Gemini`); }
  }
  if (!url) url = await withRetry(() => ttsGemini(text, voice, { label, geminiStyle }));
  if (!url) throw new Error('tts: no audio URL in result');
  const ext = path.extname(new URL(url).pathname) || '.mp3';
  return download(url, out.replace(/\.[a-z0-9]+$/i, '') + ext);
}

// Suno instrumental. Returns paths of the variations (usually 2).
export async function music({ title, style, negative = 'vocals, singing, voice', duration = 60, out, label }) {
  const d = await withRetry(() => runTask('ai-music-api/generate',
    { custom_mode: true, instrumental: true, model: 'V6', title, style, negative_tags: negative, duration },
    { label, estimateUsd: 12 * USD_PER_CREDIT }));
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

// Upload a local file to kie's temporary storage (free, deleted after 24 h). Returns a public URL.
export async function upload(file, uploadPath = 'content-engine') {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
  form.append('uploadPath', uploadPath);
  form.append('fileName', `${Date.now()}-${path.basename(file)}`);
  let res;
  for (let i = 1; ; i++) {
    try { res = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', { method: 'POST', headers: { Authorization: `Bearer ${key()}` }, body: form }); break; }
    catch (e) { if (i >= 5) throw e; await sleep(3000 * i); }
  }
  const j = await res.json();
  if (!j.success && j.code !== 200) throw new Error(`kie upload: ${j.code} ${j.msg || ''}`);
  return j.data.downloadUrl;
}

// Re-dub a talking-head base clip to new audio (volcengine lite, 8 credits/s), ping-pong looped.
export async function lipsync({ video, audio, out, seconds, label }) {
  const [video_url, audio_url] = await Promise.all([upload(video), upload(audio)]);
  const d = await withRetry(() => runTask('volcengine/video-to-video-lip-sync',
    { mode: 'lite', video_url, audio_url, align_audio: true, align_audio_reverse: true },
    { label, estimateUsd: (seconds || 45) * 8 * USD_PER_CREDIT, timeoutMs: 40 * 60e3 }));
  const url = d.result.resultUrls?.[0];
  if (!url) throw new Error('lipsync: no video URL');
  return download(url, out);
}
