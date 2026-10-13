"""Analyse music clips: tempo, beat grid, quiet start, loudness over time, ending.
  python3 scripts/music_info.py file.mp3 [...]
Also used by sound.py (analyse(), bar_times()) to cut clips on the beat."""
import sys, subprocess
import numpy as np
from scipy.signal import stft

SR = 22050


def load(path, sr=SR):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def onset_env(x, sr=SR, hop=512):
    _, _, Z = stft(x, fs=sr, nperseg=2048, noverlap=2048 - hop)
    mag = np.log1p(np.abs(Z) * 100)
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(0)
    flux = flux - np.convolve(flux, np.ones(16) / 16, 'same')
    return np.maximum(flux, 0), sr / hop


def analyse(x, sr=SR):
    env, fps = onset_env(x, sr)
    ac = np.correlate(env, env, 'full')[len(env) - 1:]
    lags = np.arange(len(ac)) / fps
    ok = (lags > 60 / 190) & (lags < 60 / 65)
    # prefer tempos near 120 (series standard) a little
    w = ac * ok * np.exp(-0.5 * (np.log2(np.maximum(lags, 1e-3) / 0.5) / 1.0) ** 2)
    period = lags[np.argmax(w)]
    # refine and find phase
    best = (-1, 0, period)
    for p in np.linspace(period * 0.98, period * 1.02, 21):
        for ph in np.linspace(0, p, 40, endpoint=False):
            idx = ((ph + np.arange(0, len(env) / fps - ph, p)) * fps).astype(int)
            idx = idx[idx < len(env)]
            sc = env[idx].sum() / max(1, len(idx))
            if sc > best[0]:
                best = (sc, ph, p)
    _, phase, period = best
    beats = phase + np.arange(0, len(x) / sr - phase, period)
    # downbeat: the beat (mod 4) with the most onset energy
    strength = [env[np.clip((beats[k::4] * fps).astype(int), 0, len(env) - 1)].sum() for k in range(4)]
    k = int(np.argmax(strength))
    bars = beats[k::4]
    rms = np.sqrt(np.convolve(x ** 2, np.ones(sr // 10) / (sr // 10), 'same'))
    loud = rms > rms.max() * 0.05
    start = np.argmax(loud) / sr
    end = (len(loud) - np.argmax(loud[::-1])) / sr
    return {'bpm': 60 / period, 'beats': beats, 'bars': bars, 'sound_start': start, 'sound_end': end, 'dur': len(x) / sr, 'rms': rms}


def describe(path):
    x = load(path)
    a = analyse(x)
    rms = a['rms']; sr = SR
    seg = [20 * np.log10(rms[int(i * sr):int((i + 5) * sr)].mean() + 1e-9) for i in range(0, int(a['dur']) - 4, 5)]
    tail = 20 * np.log10(rms[int((a['sound_end'] - 2) * sr):int(a['sound_end'] * sr)].mean() + 1e-9)
    body = 20 * np.log10(rms.mean() + 1e-9)
    ending = 'fades out' if tail < body - 8 else 'clear ending' if a['dur'] - a['sound_end'] > 0.5 else 'cut off / loops'
    print(f"{path.split('/')[-1]:28s} {a['dur']:5.1f}s  {a['bpm']:5.1f} BPM  first bar {a['bars'][0]:4.2f}s  sound {a['sound_start']:.2f}-{a['sound_end']:.2f}s  ending: {ending}")
    print('   level per 5 s (dB):', ' '.join(f'{v:4.0f}' for v in seg))


if __name__ == '__main__':
    for p in sys.argv[1:]:
        describe(p)
