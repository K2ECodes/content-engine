#!/usr/bin/env python3
"""Cut short real-footage clips (UI, code, terminal, dashboards) from demo videos for the AI edit montage.
  ~/.local/whisper-venv/bin/python scripts/edit-clips-extract.py <video> --brand claude --source "<url>" [--max 6] [--from 0]
Skips talking heads (skin-tone ratio), static frames and cuts; crops the busiest 9:16 window; writes assets/edit-clips/<id>-NN.mp4 (1080x1920, 1.0 s, no audio)
and appends to assets/edit-clips/manifest.json."""
import argparse, json, os, subprocess, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--brand', required=True); ap.add_argument('--source', required=True)
ap.add_argument('--max', type=int, default=6); ap.add_argument('--from', dest='t0', type=float, default=0); ap.add_argument('--id')
ap.add_argument('--skin', type=float, default=0.04)
a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'assets/edit-clips')
vid = a.id or os.path.splitext(os.path.basename(a.video))[0]
W, H, FPS = 192, 108, 4
probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', a.video], capture_output=True, text=True).stdout.split(',')
sw, sh = int(probe[0]), int(probe[1]); portrait = sh > sw
if portrait: W, H = 108, 192
raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(a.t0), '-i', a.video, '-vf', f'fps={FPS},scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)
r, g, b = fr[..., 0], fr[..., 1], fr[..., 2]
y = 0.299 * r + 0.587 * g + 0.114 * b; cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b; cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b
skin = ((cr > 135) & (cr < 173) & (cb > 85) & (cb < 128) & (y > 60)).mean(axis=(1, 2))
edges = np.abs(np.diff(y, axis=2)).mean(axis=(1, 2))
diff = np.r_[0, np.abs(np.diff(y, axis=0)).mean(axis=(1, 2))]
cands = []
for i in range(1, len(fr) - 4):
    w = slice(i, i + 4)
    if skin[w].max() > a.skin or diff[i + 1:i + 4].max() > 25 or edges[w].mean() < 4: continue   # face / hard cut / blank
    mot = diff[i + 1:i + 4].mean()
    if mot < 0.4: continue   # static
    cands.append((edges[w].mean() * min(mot, 6), i))
cands.sort(reverse=True); picked = []
for s, i in cands:
    if all(abs(i - j) >= 8 for j in picked): picked.append(i)
    if len(picked) >= a.max: break
man_p = os.path.join(OUT, 'manifest.json'); man = json.load(open(man_p)) if os.path.exists(man_p) else []
man = [m for m in man if not m['file'].startswith(vid + '-')]
for n, i in enumerate(sorted(picked)):
    t = a.t0 + i / FPS
    if portrait: crop = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920'
    else:
        col = np.abs(np.diff(y[i:i + 4], axis=2)).mean(axis=(0, 1)); cw = int(round(H * 9 / 16))
        best = max(range(0, W - cw + 1), key=lambda x: col[x:x + cw].sum()); x0 = int(best / W * sw); cwp = int(round(sh * 9 / 16))
        crop = f'crop={cwp}:{sh}:{min(x0, sw - cwp)}:0,scale=1080:1920:flags=lanczos'
    f = f'{vid}-{n + 1:02d}.mp4'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', a.video, '-t', '1.0', '-an', '-vf', crop + ',fps=30', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', os.path.join(OUT, f)], check=True)
    man.append({'file': f, 'brand': a.brand, 'source': a.source, 'at': round(t, 2), 'kind': 'demo-video'})
json.dump(man, open(man_p, 'w'), indent=1)
print(vid, len(picked), 'clips')
