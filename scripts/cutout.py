#!/usr/bin/env python3
"""Full-frame person cutout (same size as the photo, transparent around the person) so it can be layered exactly
over the original photo, e.g. magazine covers where the head sits in front of the title.
  PYTHONPATH=~/.local/rembg-venv/stub ~/.local/rembg-venv/bin/python scripts/cutout.py <photo> <out.png> [--model u2net_human_seg] [--max 2400]"""
import sys
from rembg import remove, new_session
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
arg = lambda n, d: sys.argv[sys.argv.index('--' + n) + 1] if '--' + n in sys.argv else d
img = Image.open(src).convert('RGB')
mx = int(arg('max', '2400'))
if max(img.size) > mx: img.thumbnail((mx, mx))
res = remove(img, session=new_session(arg('model', 'u2net_human_seg')), alpha_matting=False)
res.save(out); print('wrote', out, res.size)
