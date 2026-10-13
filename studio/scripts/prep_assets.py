"""Prepare the images for Remotion.
  python3 scripts/prep_assets.py <ep>
Reads   episodes/<ep>-*/assets/*.png        -> public/_work/<ep>/assets/<name>.png
        brand/characters/library/*.png     -> public/_work/lib/<name>.png
        brand/locations/*.png              -> public/_work/lib/<name>.png  (backgrounds: only resized to 1920x1080)
Characters on pure green (#00FF00): the green is keyed out, green spill is removed, the image is trimmed to the figure.
Images that are not on green are copied as they are."""
import sys, glob, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
from epconf import DOCS, STUDIO

EP = sys.argv[1]
REPO = STUDIO.parent


def is_green_screen(a):
    border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)]).astype(int)
    g = (border[:, 1] > 150) & (border[:, 0] < 120) & (border[:, 2] < 120)
    return g.mean() > 0.8


def key_green(img):
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # greenness: how much green is above the other channels
    gx = g - np.maximum(r, b)
    alpha = np.clip(1 - (gx - 40) / 80, 0, 1)                 # gx <= 40 -> opaque, gx >= 120 -> transparent
    # Screen green is far greener than any colour in the series palette (sage, olive), so key it everywhere:
    # this also clears closed gaps (between arms and body, under a chair).
    outside = alpha < 0.5
    # remove green spill on the edges
    spill = np.clip(gx, 0, None) * (alpha < 1)
    a[..., 1] = g - spill
    rgba = np.dstack([a, alpha * 255]).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    bbox = im.getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox()
    return im.crop(bbox) if bbox else im


def run(src_glob, dst, background=False):
    os.makedirs(dst, exist_ok=True)
    n = 0
    for f in sorted(glob.glob(src_glob)):
        name = os.path.splitext(os.path.basename(f))[0]
        out = os.path.join(dst, name + '.png')
        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f):
            continue
        img = Image.open(f)
        if background:
            img.convert('RGB').resize((1920, 1080), Image.LANCZOS).save(out)
        elif is_green_screen(np.asarray(img.convert('RGB'))):
            key_green(img).save(out)
        else:
            img.save(out)
        n += 1
        print('  ', name)
    return n


pub = STUDIO / 'public' / '_work'
n = run(str(DOCS / 'assets' / '*.png'), str(pub / EP / 'assets'))
n += run(str(REPO / 'brand' / 'characters' / 'library' / '*.png'), str(pub / 'lib'))
n += run(str(REPO / 'brand' / 'locations' / '*.png'), str(pub / 'lib'), background=True)
print(f'prep_assets: {n} new or changed images')
