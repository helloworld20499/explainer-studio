"""Stillness / empty-frame check (step 2): reads .work/scan/<composition>/ and reports
  HOLD  : the picture hardly changes for longer than --hold seconds (default 4)
  EMPTY : almost nothing on screen: less than --empty % of the frame (default 8) is covered by drawing,
          counting a small margin around every stroke, so line art counts like filled shapes (the first frame is ignored)
Writes .work/scan/<composition>/report.txt and contact.jpg (flagged frames framed in red). Exit code 1 if anything is flagged.
  python3 scripts/scan.py <composition> [--hold 4] [--empty 3] [--allow 12.0-16.5,30-31]
--allow: time ranges where a hold is intended (a title card, a deliberate pause); write the reason in the storyboard."""
import argparse, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import maximum_filter

ap = argparse.ArgumentParser()
ap.add_argument('comp'); ap.add_argument('--hold', type=float, default=4.0); ap.add_argument('--empty', type=float, default=8.0)
ap.add_argument('--allow', default='')
a = ap.parse_args()
d = Path(__file__).resolve().parent.parent / '.work' / 'scan' / a.comp
meta = json.loads((d / 'scan.json').read_text())
files = sorted(list(d.glob('*.jpg')) + list(d.glob('*.jpeg')), key=lambda p: int(''.join(c for c in p.stem if c.isdigit()) or 0))
files = [f for f in files if f.name != 'contact.jpg']
step = meta['step']
allow = [tuple(map(float, r.split('-'))) for r in a.allow.split(',') if r]
allowed = lambda t: any(x <= t <= y for x, y in allow)

frames = [np.asarray(Image.open(f).convert('RGB')).astype(np.int16) for f in files]
# background of each frame = the most common colour on its border (scenes can change background)
def bg_of(f):
    edge = np.concatenate([f[0], f[-1], f[:, 0], f[:, -1]])
    vals, counts = np.unique((edge // 8) * 8, axis=0, return_counts=True)
    return vals[counts.argmax()] + 4

rows, flags = [], []
change = [0.0]
for i in range(1, len(frames)):
    diff = np.abs(frames[i] - frames[i - 1]).max(axis=2) > 24
    change.append(diff.mean() * 100)
for i, f in enumerate(frames):
    t = i * step
    mask = np.abs(f - bg_of(f)).max(axis=2) > 40
    fg = maximum_filter(mask, size=max(3, f.shape[1] // 32)).mean() * 100
    rows.append((t, fg, change[i]))
# holds: runs of frames with < 0.15 % changed pixels
run_start = None
for i, (t, fg, ch) in enumerate(rows + [(len(rows) * step, 100, 100)]):
    still = ch < 0.15 and i > 0
    if still and run_start is None:
        run_start = rows[i - 1][0]
    if not still and run_start is not None:
        dur = rows[i - 1][0] - run_start
        if dur >= a.hold and not allowed(run_start + dur / 2):
            flags.append(('HOLD', run_start, rows[i - 1][0], f'{dur:.1f} s without visible change'))
        run_start = None
for t, fg, ch in rows[1:]:
    if fg < a.empty and not allowed(t):
        flags.append(('EMPTY', t, t, f'only {fg:.1f} % of the frame has something on it'))

lines = [f"scan {a.comp}: {len(rows)} frames every {step:.2f} s",
         f"rules: hold > {a.hold} s, empty < {a.empty} % (allowed ranges: {a.allow or 'none'})", '']
lines += [f"{k:5s} {t0:7.2f}-{t1:7.2f} s  {why}" for k, t0, t1, why in flags] or ['OK: no long holds, no empty frames.']
(d / 'report.txt').write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))

# contact sheet, 10 per row, flagged frames framed red
w, h = Image.open(files[0]).size
cols = 10; rows_n = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows_n * (h + 16)), 'white')
dr = ImageDraw.Draw(sheet)
bad = lambda t: any(t0 - 1e-6 <= t <= t1 + 1e-6 for _, t0, t1, _ in flags)
for i, f in enumerate(files):
    x, y = (i % cols) * w, (i // cols) * (h + 16)
    sheet.paste(Image.open(f), (x, y))
    t = i * step
    dr.text((x + 4, y + h + 2), f'{t:.1f}s', fill=(200, 0, 0) if bad(t) else (60, 60, 60))
    if bad(t):
        dr.rectangle([x, y, x + w - 1, y + h - 1], outline=(220, 30, 30), width=4)
sheet.save(d / 'contact.jpg', quality=80)
print('contact sheet:', d / 'contact.jpg')
sys.exit(1 if flags else 0)
