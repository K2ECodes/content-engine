# Talking-head pipeline: HeyGen base, HeyGen voice, kie.ai lip-sync

Researched 2026-10-23 from the official docs (docs.kie.ai llms.txt and the per-model .md pages, the kie pricing feed at POST https://api.kie.ai/client/v1/model-pricing/page, and developers.heygen.com). No paid API was called. Prices: 1 kie credit = $0.005.

Goal: stop paying HeyGen Avatar IV (about $0.08/s, so $2.40 per 30 s) for every talking head. Reuse a good HeyGen digital-twin render (retouched look, 1920x1080, 25 fps) as the base, generate new audio in Korede's cloned voice for free, and lip-sync on kie.ai.

## 1. Comparison table

All kie models use `POST https://api.kie.ai/api/v1/jobs/createTask` with `Authorization: Bearer <KIE key>`, then `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...` (or `callBackUrl`). Result video is in `resultJson.resultUrls[0]` (MP4).

| Model id | Input | Max length per task | Output resolution | Credits/s | $ per 30 s | Lip-sync notes |
|---|---|---|---|---|---|---|
| `volcengine/video-to-video-lip-sync` | video + audio (re-dub) | 240 s (lite), 210 s (basic) | follows source, 360p to 1080p, 25 fps MP4 | 8 | $1.20 | Keeps the real HeyGen body, head and eye motion; only the mouth is redrawn. Loops or trims the source to the audio length. Lite = single person frontal (Korede's case). |
| `kling/ai-avatar-standard` | image + audio | 5 min audio | 720p | 8 | $1.20 | Full-frame animation from one portrait; prompt steers expression, movement, camera. Length follows audio. |
| `kling/ai-avatar-pro` | image + audio | 5 min audio | 1080p | 16 | $2.40 | Same as Standard at 1080p. Costs the same as HeyGen Avatar IV, so no saving. |
| `infinitalk/from-audio` (480p) | image + audio | 15 s (per the pricing feed) | 480p | 3 | $0.45 (needs 2 tasks plus a stitch) | Cheapest per second but 480p and a 15 s cap, so a 30 to 45 s clip needs 2 to 3 tasks and visible seams are likely. |
| `infinitalk/from-audio` (720p) | image + audio | 15 s | 720p | 12 | $1.80 (2 tasks) | Same cap, more expensive than Kling Standard. |
| `omnihuman-1-5` | image + audio (+ optional mask) | audio under 60 s, docs say over 15 s degrades quality | 720 or 1080 tier, keeps input aspect | 27 | $4.05 | Strong expressive model, but most expensive here and the docs themselves warn about quality past 15 s. |
| `wan/2-2-a14b-speech-to-video-turbo` | image + audio | 40 to 120 frames (7.5 s at 16 fps) | 480p, 580p, 720p | 12 / 18 / 24 | $1.80 to $3.60 plus 4 to 6 stitched tasks | Not viable for 30 s talking heads. |
| HeyGen Avatar IV (current) | avatar + script | long | 1080p | n/a | about $2.40 | Baseline. |

Not suitable (checked): Seedance 2.0 (`bytedance/seedance-2`, reference audio 2 to 15 s, a style reference rather than a lip-sync driver, 4 to 15 s output), Kling 3.0 Omni, MiniMax H3, Grok Imagine (all generate their own audio from the prompt, 15 s max, not Korede's voice), Wan Animate Move and Replace (motion transfer, no audio drive), Gemini Omni Audio (registers a preset voice, no clone). kie's ElevenLabs TTS (turbo 2.5 at 6 credits per 1,000 chars) only offers a fixed stock voice list, so it can't speak in Korede's voice.

## 2. Model details

### 2a. `volcengine/video-to-video-lip-sync` (recommended)
- Price: 8 credits/s ($0.04/s). Output duration follows the audio, so bill on audio length.
- Output: MP4, 25 fps. Duration = audio duration. Source longer than audio is trimmed, shorter is looped.
- `input` fields:
  - `mode` (string, required): `lite` (single-person frontal, faster) or `basic` (complex scenes, scene segmentation, speaker identification).
  - `video_url` (string uri, required): 360p to 1080p (above 1080p is compressed to 1080p, below 360p rejected). MOV, MP4, HDR, MKV; H.264 recommended. Max 500 MB. Bitrate 1 to 30 Mbps. Frame rate 24 to 60 fps. The HeyGen base (1920x1080, 25 fps) fits.
  - `audio_url` (string uri, required): pure vocal audio, over 1 s and up to 240 s (lite) or 210 s (basic). mpeg, wav, x-wav, aac, mp4, ogg. Max 10 MB.
  - `separate_vocal` (bool, default false): vocal separation to suppress noise. Leave off for clean TTS.
  - `open_scenedet` (bool, default false): basic mode only.
  - `align_audio` (bool, default true): lite only. Loop the video when audio is longer.
  - `align_audio_reverse` (bool, default false): lite only. Loop backwards (ping-pong), needs `align_audio: true`. Use it: it avoids a jump cut at each loop point.
  - `templ_start_seconds` (number, default 0): lite only. Start offset in the source video.

### 2b. `kling/ai-avatar-standard` and `kling/ai-avatar-pro`
- Price: Standard 720p 8 credits/s ($0.04/s), Pro 1080p 16 credits/s ($0.08/s). Audio up to 5 minutes. Length follows audio.
- `input` fields (all required):
  - `image_url` (string): JPEG or PNG, max 10 MB.
  - `audio_url` (string): mpeg, wav, x-wav, aac, mp4, ogg; max 100 MB; max 5 minutes.
  - `prompt` (string, non-empty, max 5,000 chars): expression, movement and camera. Speech comes from the audio.
- No aspect or fps parameter. Aspect follows the image.

### 2c. `infinitalk/from-audio`
- Price: 480p 3 credits/s, 720p 12 credits/s. Pricing feed labels it "up to 15 seconds".
- `input`: `image_url` (jpeg, png, webp, max 10 MB, required), `audio_url` (mpeg, wav, x-wav, aac, mp4, ogg, max 10 MB, required), `prompt` (max 5,000 chars, required), `resolution` (`480p` default or `720p`), `seed` (number, 10000 to 1000000).

### 2d. `omnihuman-1-5`
- Price: 27 credits/s ($0.135/s).
- `input`: `image_url` (uri, any aspect, jpeg, png, webp, max 10 MB, required), `audio_url` (uri, under 60 s, 15 s or less recommended, mpeg, wav, x-wav, aac, ogg, mp4, max 10 MB, required), `mask_url` (array of up to 5 uris, from the Subject Detection endpoint, optional), `prompt` (max 300 chars, optional), `output_resolution` (`"720"` or `"1080"`, default `"1080"`), `pe_fast_mode` (bool, default false), `seed` (int, default -1).
- Output: MP4 as long as the audio, keeps input aspect.

### 2e. `wan/2-2-a14b-speech-to-video-turbo`
- Price: 480p 12, 580p 18, 720p 24 credits/s.
- `input`: `prompt`, `image_url`, `audio_url` (max 10 MB) required; `num_frames` 40 to 120 step 4 (default 80); `frames_per_second` 4 to 60 (default 16); `resolution` 480p, 580p, 720p; `negative_prompt` (500 chars); `seed`; `num_inference_steps` 2 to 40 (27); `guidance_scale` 1 to 10 (3.5); `shift` 1 to 10 (5); `nsfw_checker` bool. Max 120 frames makes it a few seconds per task.

## 3. kie file upload (local file to public URL)

Base URL `https://kieai.redpandaai.co`, header `Authorization: Bearer <KIE key>`. Uploads are free. Files are deleted after 24 hours, so upload right before creating the task.

- Local file (use this for the video and frames): `POST /api/file-stream-upload`, multipart form with `file`, `uploadPath`, optional `fileName` (same name overwrites, with cache delay).
- Remote URL (use this to pull the HeyGen WAV straight in): `POST /api/file-url-upload`, JSON `{"fileUrl","uploadPath","fileName"}`. 30 s download timeout, about 100 MB recommended max.
- Base64 (small files, 10 MB or less): `POST /api/file-base64-upload`, JSON `{"base64Data","uploadPath","fileName"}`.
- Response: `data.downloadUrl` (for example `https://tempfile.redpandaai.co/kieai/<id>/<path>/<name>`). Check `success` and `code == 200`.

```bash
curl -X POST "https://kieai.redpandaai.co/api/file-stream-upload" \
  -H "Authorization: Bearer $KIE_API_KEY" \
  -F "file=@base/korede-base-16x9.mp4" \
  -F "uploadPath=talking-head" \
  -F "fileName=korede-base-16x9.mp4"
```

## 4. HeyGen voice (Korede's cloned voice, free)

Two different voice surfaces exist, and this matters:

1. `POST /v3/voices/speech` (Third Party Speech): catalog voices (stock, designed, and the voice auto-cloned when a digital twin is trained, `avatar_item.default_voice_id`). Engines `orca` (HeyGen Voice), `starfish`, `elevenlabs`. Body: `text` (1 to 5,000 chars, `<break time="1s"/>` allowed), `voice_id`, optional `engine`, `settings.model_id`, `speed` (0.5 to 2.0), `language`, `locale`, `force_regenerate`. Response `data.audio_url` (MP3), `duration`, `engine`, `request_id`, `word_timestamps`. This endpoint is billed. The per-second or per-character price isn't published in the developer docs (it's in the platform.heygen.com pricing dashboard). Turbo Free does not apply here.
2. `POST /v3/models/audio/tts` (HeyGen Voice model): public voices and HeyGen Voice clones made with `POST /v3/models/audio/voices` (instant or professional). This is the free path.

### Turbo Free facts (confirmed)
- `"model": "heygen-voice-1-turbo-free"` is free until 2026-11-30, no credit balance needed, API key or OAuth.
- Supports public voices and HeyGen Voice 1 instant clones only. Professional clones are rejected (400 on `model`). The digital-twin catalog voice is not a HeyGen Voice clone, so it can't be used here either. Instant voices made before HeyGen Voice 1 must be cloned again.
- Limits: 30 requests per minute per workspace member, plus shared free capacity. Either returns `429 rate_limit_exceeded` (honour `Retry-After`, else exponential backoff). Timeouts can return 500. A free request never falls back to a paid model.
- Free-plan voice creation limit: 20 clone calls per rolling 24 hours per workspace.

### Step A, one time: make a free instant clone of Korede's real voice
Instant clones are free to create during the preview, ready in seconds, and use only the first 3 minutes of one recording (1 to 3 minutes of clean speech is ideal; MP3 or WAV; up to 100 MiB). Use Korede's real recorded speech (for example the audio from his original twin training footage), not the HeyGen render's audio, so the clone copies him and not a synthetic copy.

```bash
# upload the recording to HeyGen first (POST /v3/assets, max 32 MB) to get ASSET_ID
curl -X POST "https://api.heygen.com/v3/models/audio/voices" \
  -H "X-Api-Key: $HEYGEN_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: korede-instant-voice-2026-10" \
  -d '{
    "mode": "instant",
    "name": "Korede instant",
    "language": "en",
    "similarity": "max",
    "remove_background_noise": true,
    "audio": [ { "type": "asset_id", "asset_id": "'"$ASSET_ID"'" } ]
  }'
# returns 202 with data.voice_id; poll GET /v3/models/audio/voices/{voice_id} until status is ACTIVE
```

HeyGen's own guidance for closest identity: `similarity: "max"` at clone time and `expressiveness_boost: 0.5` at speech time (these are HeyGen Studio's defaults; the API defaults are `extra_high` and `1.0`).

### Step B, per video: generate the script audio for free

```bash
curl -X POST "https://api.heygen.com/v3/models/audio/tts" \
  -H "X-Api-Key: $HEYGEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "heygen-voice-1-turbo-free",
    "voice_id": "<KOREDE_INSTANT_VOICE_ID>",
    "text": "<script, plain prose, up to 5,000 characters>",
    "language": "en",
    "expressiveness_boost": 0.5
  }'
```

Response (synchronous, no polling): `{"data":{"audio_url":"https://files.heygen.ai/...wav","duration":34.2}}`. One mono PCM16 WAV at 44.1 kHz. Instant voices reject `seed`, `speed`, `pitch_shift`, `pitch_variance` and `<break>` tags, so control pacing with punctuation. Add `"with_timestamps": true` to get per-character timings (free) for captions. A 45 s mono WAV is about 4 MB, under kie's 10 MB audio limit.

## 5. Recommended pipeline (30 to 45 s, 16:9 or 9:16)

Recommendation: `volcengine/video-to-video-lip-sync` in `lite` mode, driven by a short loop of the HeyGen base clip. $0.04/s, so $1.20 per 30 s and $1.80 per 45 s, half the Avatar IV cost, at 1080p and 25 fps with the real retouched HeyGen look and natural head motion. Audio is free via Turbo Free. Total per 30 s video: $1.20.

Frame-only fallback: `kling/ai-avatar-standard` at the same $1.20 per 30 s, but 720p and the whole body is re-animated from a still, so it drifts further from the retouched look. Use Pro (1080p, $2.40) only if Volcengine quality fails, and at that price HeyGen Avatar IV is just as cheap.

### Steps
1. Base clip, one time. From the best HeyGen render, cut a 10 to 20 s stretch with calm, neutral head motion, no hand gestures that look tied to specific words, and no cuts. Ping-pong looping (`align_audio_reverse`) hides the loop point.
   ```bash
   ffmpeg -ss 00:00:05 -t 15 -i heygen-best.mp4 -an -c:v libx264 -crf 16 -r 25 -pix_fmt yuv420p base/korede-base-16x9.mp4
   ```
   For 9:16, also make a vertical base by cropping the centre (608x1080 from the 1920x1080 frame, which is inside the 360p to 1080p range) and lip-sync that directly:
   ```bash
   ffmpeg -i base/korede-base-16x9.mp4 -vf "crop=608:1080:(in_w-608)/2:0" -c:v libx264 -crf 16 -r 25 base/korede-base-9x16.mp4
   ```
   Upscale to 1080x1920 after lip-sync if needed. A native 9:16 HeyGen render as the base looks sharper; it's a one-time cost.
   For the frame fallback, grab a still: `ffmpeg -ss 00:00:05 -i heygen-best.mp4 -frames:v 1 -q:v 2 base/korede-frame.jpg`.
2. Voice: TTS call from section 4, Step B. Download the WAV (keep a local copy; treat `audio_url` as short-lived).
3. Upload to kie: base video via `file-stream-upload` (re-upload each day, files expire after 24 h), WAV via `file-url-upload` from the HeyGen `audio_url` or via `file-stream-upload` from the local copy.
4. Create the lip-sync task:
   ```json
   POST https://api.kie.ai/api/v1/jobs/createTask
   {
     "model": "volcengine/video-to-video-lip-sync",
     "callBackUrl": "https://your-domain.com/api/kie-callback",
     "input": {
       "mode": "lite",
       "video_url": "https://tempfile.redpandaai.co/kieai/<id>/talking-head/korede-base-16x9.mp4",
       "audio_url": "https://tempfile.redpandaai.co/kieai/<id>/talking-head/script-001.wav",
       "separate_vocal": false,
       "open_scenedet": false,
       "align_audio": true,
       "align_audio_reverse": true,
       "templ_start_seconds": 0
     }
   }
   ```
   `callBackUrl` is optional; without it, poll `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=<taskId>` until `state` is `success` or `fail` (`waiting`, `queuing`, `generating` in between). Video URL: `JSON.parse(data.resultJson).resultUrls[0]`. `param` is double-encoded JSON.
5. Frame fallback request:
   ```json
   POST https://api.kie.ai/api/v1/jobs/createTask
   {
     "model": "kling/ai-avatar-standard",
     "input": {
       "image_url": "https://tempfile.redpandaai.co/kieai/<id>/talking-head/korede-frame.jpg",
       "audio_url": "https://tempfile.redpandaai.co/kieai/<id>/talking-head/script-001.wav",
       "prompt": "A man speaking directly to camera in a calm, confident, professional tone, subtle natural head movement and blinking, steady locked-off medium close-up, no camera movement"
     }
   }
   ```
   Same polling. Swap the model to `kling/ai-avatar-pro` for 1080p.
6. Finish: download the MP4, check sync, then pass it to the reel or YouTube editor skills as raw talking-head footage. If the 9:16 version was made from a 16:9 output instead, crop after with the same ffmpeg crop.

### Test before switching
Run one 10 s test of each candidate before committing (Volcengine lite 80 credits = $0.40, Kling Standard 80 credits = $0.40). Judge teeth and lip detail at 1080p, any mouth-region blur against the retouched skin, and whether the loop point is visible.

## 6. Blockers and risks
- Turbo Free needs a HeyGen Voice instant clone. The digital twin's own voice (catalog `default_voice_id`) and any professional clone can't use it; they'd go through paid speech. One free instant clone call fixes this.
- Turbo Free ends 2026-11-30 (about 5 weeks away). After that, paid `heygen-voice-1-turbo` or `heygen-voice-1` pricing applies, and that price isn't in the developer docs.
- Turbo Free capacity is shared and unguaranteed: expect occasional 429s, build retry with backoff.
- kie uploads expire after 24 hours; the base clip must be re-uploaded per batch.
- Volcengine lip-sync quality and exact output resolution aren't documented beyond "360p to 1080p input, 25 fps MP4 output"; confirm with the 10 s test.
- Looping a 10 to 20 s base for 45 s repeats body motion; long scripts may look repetitive. Using 2 or 3 different base clips across a week keeps it varied.
- The 16:9 base cropped to 9:16 is 608x1080, softer than a native vertical render.
- Neither key was read or tested here; both pipelines assume `KIE_API_KEY` and `HEYGEN_API_KEY` are set in the environment.
