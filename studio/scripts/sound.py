"""Synthesize the music bed and SFX for an episode from episodes/<ep>-*/sound.json, and lay the VO track.
python3 scripts/sound.py <ep>
Writes .work/<ep>/vo_track.wav, music.wav, sfx.wav (48 kHz mono).

sound.json:
  "music": {"bpm":100, "sections":[[start,end,["C","Am","F","G"],"groove", "clip name (optional)"],...], "button": 135.0}
     styles: sneaky | groove | tension | bright
     clip: name of a music file from the user (episodes/<ep>-*/music/<name>*.wav|mp3|m4a, or brand/music/<name>*).
           When the file exists, the section uses it (trimmed or looped, 0.4 s fades). Else the section is synthesized.
           Several versions (<name>_v1, <name>_v2): set "pick": {"<name>": "v2"} in "music" to choose one.
     options (6th item): {"anchor": "end"} = the clip's own final chord lands on the section end (good before a cut
           or a button); default "start" = play from the first bar and cut on a bar line. Clips of any length work
           (AI music tools often make about 60 s): the excerpt is chosen on the clip's bar grid and stretched by at most 5 %.
  "sfx": [[time, "kind", gain, {params}], ...]
  Times can be numbers (seconds) or line anchors, so they follow the voice when it changes:
     "L4" = start of line 4, "L4e" = end of line 4, "L4+0.5" / "L4e-0.2" = with an offset, "end" = video end.
     kinds: bonk pop drop bass whoosh click snap shimmer chop tone ding flick fizz zap splash whirr pluck tick marimba
            sniff sneeze step page scribble hum boing
  "sfx_series": [{"kind":"tick","start":64.6,"step":0.5,"count":9,"gain":0.5}, ...]
"""
import json, glob, subprocess, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt
from epconf import DOCS, WORK, SRC

SR = 48000
tl = json.load(open(SRC / 'timeline.json'))
TOTAL = tl['total']
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
cfg = json.load(open(DOCS / 'sound.json'))
import re as _re
_LN = {x['i']: x for x in tl['lines']}


def tm(v):
    """Seconds from a number or a line anchor ("L4", "L4e", "L4e+0.3", "end")."""
    if isinstance(v, (int, float)):
        return float(v)
    if v == 'end':
        return TOTAL
    m = _re.fullmatch(r'L(\d+)(e?)([+-][\d.]+)?', v.replace(' ', ''))
    if not m:
        raise ValueError(f'sound.json: bad time "{v}"')
    ln = _LN[int(m.group(1))]
    return ln['end' if m.group(2) else 'start'] + float(m.group(3) or 0)



def place(buf, sig, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f):
    return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f):
    return sosfilt(butter(2, f, btype='high', fs=SR, output='sos'), x)


NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def hz(name):
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + (o - 4) * 12 - 9) / 12)


_pc = {}


def pluck(note, dur=0.9):
    f = hz(note) if isinstance(note, str) else note
    key = (round(f, 2), dur)
    if key in _pc:
        return _pc[key]
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = lp(rng.uniform(-1, 1, p), 4500); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.994
    _pc[key] = out * env(n, 0.002, 0.35)
    return _pc[key]


def marimba(note, dur=0.8):
    f = hz(note) if isinstance(note, str) else note
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.06) + 0.1 * np.sin(2 * np.pi * f * 9.8 * t) * np.exp(-t / 0.02)
    return s * np.minimum(1, t / 0.002)


def bass(note, dur=0.55):
    f = hz(note) if isinstance(note, str) else note
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t)) * np.minimum(1, t / 0.01) * np.exp(-t / 0.3)


def noise(d):
    return rng.standard_normal(int(d * SR))


def shaker(d=0.08, amp=1.0):
    n = int(d * SR)
    return hp(rng.standard_normal(n), 5000) * env(n, 0.004, 0.025) * amp


def tone(f0=440, f1=440, d=0.2, dec=0.2, a=0.005, wave='sin'):
    n = int(d * SR); f = np.linspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) if wave == 'sin' else np.sign(np.sin(ph)) * 0.5
    return s * env(n, a, dec)


def whoosh(d=1.0, lo=300, hi=3000, rise=True):
    n = int(d * SR); x = noise(d + 0.1); out = np.zeros(n); seg = int(SR * 0.02)
    for i in range(0, n, seg):
        k = i / n if rise else 1 - i / n
        c = lo + (hi - lo) * k
        out[i:i + seg] = bp(x[i:i + seg + 2000], c * 0.7, c * 1.3)[:len(out[i:i + seg])]
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5


SFX = {
    'bonk': lambda: tone(260, 160, 0.15, 0.06),
    'pop': lambda f=700: tone(f, f * 1.8, 0.09, 0.03),
    'drop': lambda: np.concatenate([tone(2200, 900, 0.1, 0.03) * 0.3, np.zeros(int(0.08 * SR))]) + tone(1400, 500, 0.18, 0.06) * 0.8,
    'bass': lambda note='A1', dur=0.8: bass(note, dur),
    'whoosh': whoosh,
    'click': lambda: hp(noise(0.03), 3000) * env(int(0.03 * SR), 0.0005, 0.006) * 1.2 + tone(2500, 2500, 0.03, 0.008) * 0.4,
    'snap': lambda: hp(noise(0.15), 2500) * env(int(0.15 * SR), 0.0005, 0.02) * 1.5,
    'shimmer': lambda d=1.2: sum(np.pad(tone(f, f, d - i * 0.12, 0.3) * 0.25, (int(i * 0.12 * SR), 0))[: int(d * SR)] for i, f in enumerate([1568, 1976, 2349, 2637, 3136])),
    'chop': lambda: hp(noise(0.12), 1500) * env(int(0.12 * SR), 0.001, 0.03) + tone(180, 90, 0.12, 0.04) * 0.8,
    'tone': tone,
    'ding': lambda note='E5': marimba(note, 0.7),
    'flick': lambda: hp(noise(0.12), 2000) * env(int(0.12 * SR), 0.005, 0.04),
    'fizz': lambda d=1.2: hp(noise(d), 4000) * 0.15 * np.sin(np.linspace(0, np.pi, int(d * SR))) + (rng.uniform(0, 1, int(d * SR)) > 0.995) * rng.uniform(0.5, 1, int(d * SR)) * 0.6,
    'zap': lambda rev=False: lp(tone(1200, 300, 0.5, 0.4, 0.01, 'sq') if rev else tone(300, 1200, 0.5, 0.4, 0.01, 'sq'), 3000) * 0.5,
    'splash': lambda: bp(noise(0.7), 400, 4000) * env(int(0.7 * SR), 0.01, 0.2),
    'whirr': lambda d=1.5: lp(noise(d), 600) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * np.arange(int(d * SR)) / SR)) * np.minimum(1, np.minimum(np.arange(int(d * SR)) / SR / 0.3, (d - np.arange(int(d * SR)) / SR) / 0.3)) * 0.6,
    'pluck': lambda note='G4': pluck(note),
    'tick': lambda: hp(noise(0.02), 4000) * env(int(0.02 * SR), 0.0005, 0.004),
    'marimba': lambda note='C5': marimba(note),
    'sniff': lambda: np.concatenate([bp(noise(0.12), 1500, 5000) * env(int(0.12 * SR), 0.03, 0.05), np.zeros(int(0.06 * SR)), bp(noise(0.16), 1500, 5000) * env(int(0.16 * SR), 0.04, 0.06)]) * 0.8,
    'sneeze': lambda: np.concatenate([bp(noise(0.35), 800, 3000) * np.linspace(0, 0.5, int(0.35 * SR)), bp(noise(0.25), 500, 6000) * env(int(0.25 * SR), 0.003, 0.08) * 1.6]),
    'step': lambda: lp(noise(0.08), 900) * env(int(0.08 * SR), 0.002, 0.02) * 1.4 + tone(120, 90, 0.08, 0.03) * 0.5,
    'page': lambda: bp(noise(0.35), 2000, 7000) * np.sin(np.linspace(0, np.pi, int(0.35 * SR))) ** 2 * 0.5,
    'scribble': lambda d=0.8: bp(noise(d), 2500, 6000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * np.arange(int(d * SR)) / SR))) * np.sin(np.linspace(0, np.pi, int(d * SR))) * 0.35,
    'hum': lambda d=3.0: lp(noise(d), 300) * np.minimum(1, np.minimum(np.arange(int(d * SR)) / SR / 0.4, (d - np.arange(int(d * SR)) / SR) / 0.6)) * 0.7,
    'boing': lambda: tone(180, 520, 0.35, 0.25) * (1 + 0.3 * np.sin(2 * np.pi * 18 * np.arange(int(0.35 * SR)) / SR)) * 0.7,
}


def load_audio(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def find_clip(name, pick=None):
    pats = []
    for root in [DOCS / 'music', DOCS.parent.parent / 'brand' / 'music']:
        pats += sorted(glob.glob(str(root / f'{name}_{pick}.*'))) if pick else []
        pats += sorted(glob.glob(str(root / f'{name}*.*')))
    pats = [p for p in pats if p.rsplit('.', 1)[-1].lower() in ('wav', 'mp3', 'm4a', 'aac', 'flac', 'ogg')]
    return pats[0] if pats else None


def clip_section(path, dur, anchor='start', fade=0.25, tail=1.5):
    """Fit a music clip (any length) to a section of `dur` seconds, on the beat.
    anchor='start': play from the first bar; cut on a bar line at the section end.
    anchor='end':   the clip's final chord lands exactly on the section end (its ring-out continues for `tail` s).
    Bars come from the clip's own beat grid; the excerpt is time-stretched by at most 5 % so the bar lines fit exactly."""
    import music_info as mi
    x = mi.load(path)
    an = mi.analyse(x)
    bars = an['bars']
    if anchor == 'end':
        fin = bars[bars <= an['sound_end'] - 0.3]
        fin = fin[-1] if len(fin) else an['sound_end']
        cands = [b0 for b0 in bars if b0 < fin]
        b0 = min(cands, key=lambda b: abs((fin - b) - dur)) if cands else 0.0
        a0, a1, keep = b0, fin, tail
    else:
        b0 = bars[0] if len(bars) and bars[0] < 2.5 else an['sound_start']
        ends = [e for e in bars if e > b0]
        e = min(ends, key=lambda e: abs((e - b0) - dur)) if ends else b0 + dur
        a0, a1, keep = b0, e, 0.0
    ratio = (a1 - a0) / dur                       # >1: speed up a little
    if abs(ratio - 1) > 0.05:                     # no bar fits: no stretch, plain cut with a longer fade
        ratio, a1, fade = 1.0, a0 + dur, max(fade, 0.6)
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', f'{a0:.4f}', '-t', f'{(a1 - a0) + keep * ratio:.4f}', '-i', str(path),
                          '-af', f'atempo={ratio:.5f}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    out = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    out = out / (np.abs(out).max() + 1e-9) * 0.8
    n = len(out); body = int(dur * SR)
    fi = int(0.03 * SR); out[:fi] *= np.linspace(0, 1, fi)
    if anchor == 'end':
        if n > body:                              # ring-out after the final chord
            out[body:] *= np.linspace(1, 0, n - body) ** 2
    else:
        f = int(fade * SR); out = out[:body]
        out[-f:] *= np.linspace(1, 0, f)
    print(f'   {path.split("/")[-1]}: {anchor}-anchored, clip {a0:.2f}-{a1:.2f}s -> {dur:.2f}s (tempo x{ratio:.3f})')
    return out



# ---------------- VO ----------------
vo = np.zeros(N)
for ln in tl['lines']:
    a, sr = sf.read(WORK / 'vo' / f"{ln['i']:02d}.wav")
    if a.ndim > 1:
        a = a.mean(1)
    place(vo, resample_poly(a, SR, sr) if sr != SR else a, ln['start'])
sf.write(WORK / 'vo_track.wav', vo, SR)

# ---------------- music ----------------
M = cfg.get('music')
mus = np.zeros(N)
if M:
    BEAT = 60 / M.get('bpm', 100); BAR = 4 * BEAT
    CH = {'C': ('C2', ['C4', 'E4', 'G4', 'C5']), 'Am': ('A1', ['A3', 'C4', 'E4', 'A4']), 'F': ('F2', ['F3', 'A3', 'C4', 'F4']),
          'G': ('G1', ['G3', 'B3', 'D4', 'G4']), 'Dm': ('D2', ['D4', 'F4', 'A4', 'D5']), 'E': ('E2', ['E3', 'G#3', 'B3', 'E4']),
          'Em': ('E2', ['E3', 'G3', 'B3', 'E4']), 'Bb': ('A#1', ['A#3', 'D4', 'F4', 'A#4'])}
    MEL = {'groove': [(0, 'E5'), (1.5, 'G5'), (2, 'E5'), (3, 'D5')], 'bright': [(0, 'G5'), (1, 'E5'), (1.5, 'F5'), (2, 'G5'), (3, 'C6')]}
    used = []
    for sec in M['sections']:
        s0, s1, prog, style = sec[:4]
        s0, s1 = tm(s0), tm(s1)
        clip = find_clip(sec[4], M.get('pick', {}).get(sec[4])) if len(sec) > 4 else None
        opts = sec[5] if len(sec) > 5 else {}
        if clip:
            place(mus, clip_section(clip, s1 - s0, opts.get('anchor', 'start')), s0, opts.get('gain', 1.0)); used.append(clip)
            continue
        for b in range(int(np.ceil((s1 - s0) / BAR))):
            t0 = s0 + b * BAR
            root, tones = CH[prog[b % len(prog)]]
            for k in ([0, 2] if style != 'sneaky' else [0]):
                if t0 + k * BEAT < s1:
                    place(mus, bass(root), t0 + k * BEAT, 0.55)
            step = 1.0 if style == 'sneaky' else 0.5
            pat = [0, 2, 1, 3, 2, 1, 3, 2]
            for i in range(int(4 / step)):
                tt = t0 + i * step * BEAT
                if tt >= s1:
                    break
                place(mus, pluck(tones[pat[i % 8]]), tt + (0.04 * BEAT if i % 2 else 0), 0.38 if style == 'sneaky' else 0.32)
            if style in ('groove', 'bright'):
                for i in range(8):
                    if t0 + i * 0.5 * BEAT < s1:
                        place(mus, shaker(amp=0.12 if i % 2 else 0.07), t0 + i * 0.5 * BEAT)
            if style == 'tension':
                for i in range(16):
                    if t0 + i * 0.25 * BEAT < s1:
                        place(mus, shaker(0.05, 0.09 if i % 4 == 0 else 0.045), t0 + i * 0.25 * BEAT)
            if style in MEL and b % 2 == 1:
                for off, nt in MEL[style]:
                    if t0 + off * BEAT < s1:
                        place(mus, marimba(nt), t0 + off * BEAT, 0.22)
    END = M.get('button'); END = tm(END) if END is not None else None
    if END and not used:          # the synthesized button only when no music clips are used
        a, b = int((END - 0.6) * SR), int(END * SR)
        mus[a:b] *= np.linspace(1, 0.25, b - a)
        for nt in ['C3', 'E4', 'G4', 'C5']:
            place(mus, pluck(nt, 1.6), END, 0.4)
        place(mus, marimba('C6', 1.4), END, 0.3); place(mus, bass('C2', 1.2), END, 0.7)
    mus = lp(mus, 9000)
    print('music clips used:', [p.split('/')[-1] for p in used] or 'none (all synthesized)')
sf.write(WORK / 'music.wav', mus / (np.abs(mus).max() + 1e-9) * 0.8, SR)

# ---------------- SFX ----------------
sfx = np.zeros(N)
for t, kind, gain, *rest in cfg.get('sfx', []):
    t = tm(t)
    place(sfx, SFX[kind](**(rest[0] if rest else {})), t, gain)
for s in cfg.get('sfx_series', []):
    for i in range(s['count']):
        jitter = rng.uniform(0, s.get('jitter', 0))
        params = dict(s.get('params', {}))
        if 'vary_f' in s:
            params['f'] = s['vary_f'][0] + rng.uniform(0, s['vary_f'][1])
        place(sfx, SFX[s['kind']](**params), tm(s['start']) + i * s['step'] + jitter, s['gain'])
sf.write(WORK / 'sfx.wav', sfx / (np.abs(sfx).max() + 1e-9) * 0.8, SR)
print('sound done', TOTAL)
