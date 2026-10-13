"""Lay narration lines on a timeline -> src/episodes/<ep>/timeline.json.
  python3 scripts/timeline.py ep001 --measure    durations from the voice files .work/<ep>/vo/00.wav, 01.wav ...
  python3 scripts/timeline.py ep001 --estimate   no voice yet: durations estimated at about 150 words per minute
                                                 (lets you build and check the animatic before TTS)
Reads optional episodes/<ep>-*/pauses.json: {"gap":0.35,"scene_gap":0.9,"lead":0.8,"tail":2.5,"extra":{"<line index>": seconds}}
Recorded the voice yourself? Put one WAV per line named 00.wav, 01.wav ... in .work/<ep>/vo/ and use --measure."""
import json, sys
from epconf import DOCS, WORK, SRC

lines = json.load(open(DOCS / 'lines.json'))
if '--measure' in sys.argv or '--estimate' in sys.argv:
    d = []
    for i, item in enumerate(lines):
        sc, t = item[0], item[1]
        if '--estimate' in sys.argv:
            dur = round(len(t.split()) / 2.5 + 0.25 + 0.15 * sum(t.count(c) for c in ',.?!;:'), 2)
        else:
            import soundfile as sf
            info = sf.info(str(WORK / 'vo' / f'{i:02d}.wav'))
            dur = round(info.frames / info.samplerate, 2)
        d.append({'i': i, 'scene': sc, 'text': t, 'speaker': item[2] if len(item) > 2 else 'narrator', 'dur': dur})
    json.dump(d, open(WORK / 'vo' / 'durations.json', 'w'), indent=1)
d = json.load(open(WORK / 'vo' / 'durations.json'))
cfg = {'gap': 0.35, 'scene_gap': 0.9, 'lead': 0.8, 'tail': 2.5, 'extra': {}}
if (DOCS / 'pauses.json').exists():
    cfg.update(json.load(open(DOCS / 'pauses.json')))
t, prev, out = cfg['lead'], None, []
for x in d:
    if prev and x['scene'] != prev:
        t += cfg['scene_gap'] - cfg['gap']
    x['start'] = round(t, 2); x['end'] = round(t + x['dur'], 2)
    t = x['end'] + cfg['gap'] + cfg['extra'].get(str(x['i']), 0); prev = x['scene']; out.append(x)
total = round(out[-1]['end'] + cfg['tail'], 2)
json.dump({'lines': out, 'total': total, 'estimated': '--estimate' in sys.argv}, open(SRC / 'timeline.json', 'w'), indent=1)
sc = {}
for x in out:
    s = sc.setdefault(x['scene'], [x['start'], x['end']]); s[1] = x['end']
for k, (a, b) in sc.items():
    print(f'{k}: {a:7.2f} - {b:7.2f}')
print('total', total, '-> wrote', SRC / 'timeline.json')
