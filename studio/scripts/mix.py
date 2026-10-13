"""Loudness-matched mix: VO -16 LUFS, music bed ~18 dB under VO while speaking (gentle ducking), SFX -27 LUFS, master -14 LUFS / -1 dBFS.
python3 scripts/mix.py <ep>   -> .work/<ep>/mix.wav"""
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d
from epconf import WORK
vo, SR = sf.read(WORK / 'vo_track.wav'); mus, _ = sf.read(WORK / 'music.wav'); sfx, _ = sf.read(WORK / 'sfx.wav')
meter = pyln.Meter(SR); db = lambda x: 10 ** (x / 20); lufs = lambda x: meter.integrated_loudness(x)
vo = vo * db(-16 - lufs(vo))
if np.abs(mus).max() > 0:
    mus = mus * db(-16 - 18 + 1 - lufs(mus))
act = uniform_filter1d((np.abs(vo) > 0.01).astype(float), int(0.25 * SR))
act = uniform_filter1d(np.clip(act * 3, 0, 1), int(0.3 * SR))
mus = mus * db(-2 * act)
if np.abs(sfx).max() > 0:
    sfx = sfx * db(-27 - lufs(sfx))
mix = vo + mus + sfx
mix = mix * db(-14 - lufs(mix))
th = db(-1)
over = np.abs(mix) > th * 0.8
mix[over] = np.sign(mix[over]) * (th * 0.8 + th * 0.2 * np.tanh((np.abs(mix[over]) - th * 0.8) / (th * 0.2)))
sf.write(WORK / 'mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_24')
sp = act > 0.9
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f'mix {lufs(mix):.1f} LUFS | music vs VO under speech {rms(mus[sp]) - rms(vo[sp]):.1f} dB')
