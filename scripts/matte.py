#!/usr/bin/env python3
"""Free local green-screen: per-frame person matte for a talking-head video (rembg u2net_human_seg, CPU).
  PYTHONPATH=~/.local/rembg-venv/stub ~/.local/rembg-venv/bin/python scripts/matte.py <in.mp4> <out-mask.mp4> [--fps 25] [--scale 640]
Writes a grayscale mask video (white = person) at the input fps, same size as input; story's face.mask accepts it."""
import sys, subprocess, numpy as np
from rembg import remove, new_session
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
arg = lambda n, d: sys.argv[sys.argv.index('--' + n) + 1] if '--' + n in sys.argv else d
fps = arg('fps', '25'); sc = int(arg('scale', '640'))
w, h = [int(x) for x in subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',src],capture_output=True,text=True).stdout.strip().split(',')]
sh = int(h * sc / w) // 2 * 2
dec = subprocess.Popen(['ffmpeg','-v','error','-i',src,'-vf',f'fps={fps},scale={sc}:{sh}','-f','rawvideo','-pix_fmt','rgb24','-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','gray','-s',f'{sc}x{sh}','-r',fps,'-i','-','-vf',f'scale={w}:{h}:flags=bicubic,gblur=sigma=1.2','-c:v','libx264','-crf','12','-pix_fmt','yuv420p',out], stdin=subprocess.PIPE)
sess = new_session('u2net_human_seg'); n = 0; prev = None
while True:
    b = dec.stdout.read(sc * sh * 3)
    if len(b) < sc * sh * 3: break
    img = Image.fromarray(np.frombuffer(b, np.uint8).reshape(sh, sc, 3))
    m = np.array(remove(img, session=sess, only_mask=True), dtype=np.float32)
    if prev is not None: m = 0.6 * m + 0.4 * prev   # temporal smoothing against flicker
    prev = m
    enc.stdin.write(m.clip(0, 255).astype(np.uint8).tobytes()); n += 1
    if n % 50 == 0: print('frames', n, flush=True)
enc.stdin.close(); enc.wait(); print('wrote', out, n, 'frames')
