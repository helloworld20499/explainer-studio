"""Text to speech: one WAV per narration line, best of N takes, one locked voice per speaker.

Usage (in studio/, with the venv active — scripts/setup.sh makes it):
  python3 scripts/tts.py check                         # smoke test: each voice in voices.json says one sentence
  python3 scripts/tts.py ep001                         # all lines, N takes per line, best take kept
  python3 scripts/tts.py ep001 --lines 3,7 --takes 5   # redo some lines only
  python3 scripts/tts.py design host                   # mlx engine: 4 candidate voices from the voice's "design" text

Engines (set per voice in studio/voices.json):
  kokoro  kokoro-onnx, runs on any computer (CPU). Voices: af_heart, af_bella, af_sky, am_michael, am_adam, bf_emma, bm_george ...
  mlx     mlx-audio on Apple silicon (Qwen3-TTS, Chatterbox ...): voice design, voice cloning from ref_audio, "instruct" acting notes
  files   your own recordings: put 00.wav, 01.wav ... in .work/<ep>/vo/ yourself, then run timeline.py --measure
lines.json items: [scene, text] or [scene, text, speaker] or [scene, text, speaker, {"instruct": "...", "speed": 0.95}]
Best take = lowest word error rate when Whisper reads the take back (catches mispronunciations and skipped words).
Pitch lock: a voice with "ref_audio" keeps every line within "pitch_tol" semitones of the reference pitch (clones drift).
"""
import argparse, inspect, json, re, sys, time, difflib, subprocess, tempfile, os
from pathlib import Path
import numpy as np
import soundfile as sf

STUDIO = Path(__file__).resolve().parent.parent
REG = json.loads((STUDIO / 'voices.json').read_text())
LANG = REG.get('language', 'en')
_models = {}


# ---------------- engines ----------------
def synth_kokoro(v, text, extra):
    if 'kokoro' not in _models:
        from kokoro_onnx import Kokoro
        m = STUDIO / '.models'
        _models['kokoro'] = Kokoro(str(m / 'kokoro-v1.0.onnx'), str(m / 'voices-v1.0.bin'))
    lang = v.get('lang', 'en-us' if LANG == 'en' else LANG)
    a, sr = _models['kokoro'].create(text, voice=v.get('voice', 'af_heart'), speed=extra.get('speed', v.get('speed', 1.0)), lang=lang)
    return np.asarray(a, dtype=np.float32), int(sr)


def synth_mlx(v, text, extra):
    repo = v['model']
    if repo not in _models:
        from mlx_audio.tts.utils import load_model
        _models[repo] = load_model(repo)
    m = _models[repo]
    kw = {k: v.get(k) for k in ('voice', 'instruct')}
    kw['lang_code'] = v.get('lang_code', LANG)
    if v.get('ref_audio'):
        ra = STUDIO / v['ref_audio']
        if not ra.exists():
            sys.exit(f'Voice not locked yet: {ra} is missing. Run: python3 scripts/tts.py design <speaker>')
        kw['ref_audio'] = str(ra)
        kw['ref_text'] = (STUDIO / v['ref_text_file']).read_text().strip()
    kw.update({k: x for k, x in extra.items() if k not in ('pitch_lock',)})
    sig = inspect.signature(m.generate)
    any_kw = any(p.kind == p.VAR_KEYWORD for p in sig.parameters.values())
    ok = {k: x for k, x in kw.items() if x is not None and (k in sig.parameters or any_kw)}
    chunks, sr = [], None
    for r in m.generate(text=text, **ok):
        chunks.append(np.array(r.audio, dtype=np.float32).reshape(-1))
        sr = getattr(r, 'sample_rate', None) or getattr(m, 'sample_rate', None) or REG['defaults']['sample_rate']
    return np.concatenate(chunks), int(sr)


ENGINES = {'kokoro': synth_kokoro, 'mlx': synth_mlx}


def voice_of(speaker):
    vs = REG['voices']
    if speaker not in vs:
        print(f'  note: no voice "{speaker}" in voices.json, using "narrator"')
    return vs.get(speaker, vs['narrator'])


def synth(speaker, text, extra=None):
    v = voice_of(speaker)
    eng = v.get('engine', 'kokoro')
    if eng == 'files':
        sys.exit(f'Voice "{speaker}" uses engine "files": record the lines yourself (see the docstring).')
    return ENGINES[eng](v, text, extra or {})


# ---------------- post-processing ----------------
def post_process(a, sr, post):
    """Same pitch/formant shift for every line of a voice (ffmpeg asetrate + atempo keeps the duration)."""
    if not post or not any(post.get(k) for k in ('pitch_semitones', 'tempo')):
        return a
    r = 2 ** (post.get('pitch_semitones', 0) / 12)
    af = f'asetrate={sr}*{r},aresample={sr},atempo={1 / r}'
    if post.get('tempo'):
        af += f",atempo={post['tempo']}"
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, 'i.wav'), os.path.join(d, 'o.wav')
        sf.write(i, a, sr)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', i, '-af', af, '-ar', str(sr), o], check=True)
        b, _ = sf.read(o)
    return b.astype(np.float32)


def estimate_f0(a, sr):
    """Median pitch (Hz) of voiced frames, simple autocorrelation."""
    fr, hop, out = int(0.04 * sr), int(0.01 * sr), []
    for i in range(0, len(a) - fr, hop):
        x = a[i:i + fr]
        if np.sqrt(np.mean(x ** 2)) < 0.02 * (np.abs(a).max() + 1e-9):
            continue
        x = x - x.mean(); c = np.correlate(x, x, 'full')[fr - 1:]
        lo, hi = int(sr / 500), int(sr / 70); k = lo + int(np.argmax(c[lo:hi]))
        if c[k] > 0.4 * c[0]:
            out.append(sr / k)
    return float(np.median(out)) if out else None


_targets = {}


def finish_voice(a, sr, speaker, extra=None):
    """Pitch lock (voices with ref_audio), then the voice's fixed post settings."""
    v = voice_of(speaker)
    post = dict(v.get('post') or {})
    if v.get('ref_audio') and (extra or {}).get('pitch_lock', v.get('pitch_lock', True)):
        if speaker not in _targets:
            r, rs = sf.read(STUDIO / v['ref_audio'])
            f = estimate_f0(r if r.ndim == 1 else r.mean(1), rs)
            _targets[speaker] = f * 2 ** (post.get('pitch_semitones', 0) / 12) if f else None
        f, t = estimate_f0(a, sr), _targets[speaker]
        if f and t:
            d = 12 * np.log2(t / f)
            post['pitch_semitones'] = float(np.sign(d) * max(0.0, abs(d) - v.get('pitch_tol', 1.0)))
    return post_process(a, sr, post)


# ---------------- checking takes ----------------
def norm_words(s):
    return re.sub(r"[^\w' ]+", ' ', s.lower()).split()


def wer(ref, hyp):
    r, h = norm_words(ref), norm_words(hyp)
    sm = difflib.SequenceMatcher(a=r, b=h)
    return sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal') / max(1, len(r))


_asr = None


def transcribe(path):
    global _asr
    if _asr is None:
        try:
            import mlx_whisper
            _asr = lambda p: mlx_whisper.transcribe(p, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language=LANG)['text']
        except ImportError:
            try:
                from faster_whisper import WhisperModel
                m = WhisperModel('small', compute_type='int8')
                _asr = lambda p: ' '.join(s.text for s in m.transcribe(p, language=LANG)[0])
            except ImportError:
                print('  note: no Whisper installed, takes are not checked (pip install faster-whisper)')
                _asr = False
    return _asr(str(path)) if _asr else None


# ---------------- commands ----------------
def cmd_check():
    out = STUDIO / '.work' / 'tts-check'; out.mkdir(parents=True, exist_ok=True)
    text = 'Sunlight looks white, but it is really every colour mixed together.'
    for spk, v in REG['voices'].items():
        if v.get('engine') == 'files':
            continue
        try:
            t0 = time.time(); a, sr = synth(spk, text); dt = time.time() - t0
            p = out / f'{spk}.wav'; sf.write(p, a, sr)
            heard = transcribe(p)
            print(f"OK   {spk:10s} {len(a) / sr:5.1f}s audio in {dt:5.1f}s  wer={wer(text, heard) if heard else '-'}  -> {p}")
        except Exception as e:
            print(f'FAIL {spk:10s} {type(e).__name__}: {e}')


def cmd_design(speaker, n=4):
    v = REG['voices'][speaker]
    if v.get('engine') != 'mlx' or not v.get('design'):
        sys.exit('design needs engine "mlx" and a "design" text for the voice in voices.json')
    d = STUDIO / 'voices' / 'candidates' / speaker; d.mkdir(parents=True, exist_ok=True)
    ref_text = v.get('design_line', "Here is the cool part. Every big question has a small, surprising answer.")
    dv = {'engine': 'mlx', 'model': REG['design_model'], 'instruct': v['design']}
    for i in range(n):
        a, sr = synth_mlx(dv, ref_text, {})
        sf.write(d / f'{speaker}_{i + 1}.wav', a, sr)
    (d / 'ref_text.txt').write_text(ref_text)
    print(f'Listen to {d}. Copy the best one to voices/{speaker}.wav and ref_text.txt to voices/{speaker}.txt,')
    print(f'then set "ref_audio": "voices/{speaker}.wav", "ref_text_file": "voices/{speaker}.txt" and a clone model for the voice.')


def cmd_episode(ep, only=None, takes=None):
    sys.argv = [sys.argv[0], ep]
    sys.path.insert(0, str(Path(__file__).parent))
    from epconf import DOCS, WORK
    lines = json.loads((DOCS / 'lines.json').read_text())
    takes = takes or REG['defaults']['takes']
    tdir = WORK / 'vo' / 'takes'; tdir.mkdir(parents=True, exist_ok=True)
    report = []
    for i, item in enumerate(lines):
        if only and i not in only:
            continue
        text = item[1]
        speaker = item[2] if len(item) > 2 else 'narrator'
        extra = item[3] if len(item) > 3 else {}
        best = None
        for k in range(takes):
            a, sr = synth(speaker, text, extra)
            a = finish_voice(a, sr, speaker, extra)
            hot = np.abs(a).max() > 0.97          # near full scale = likely distortion
            a = a / (np.abs(a).max() + 1e-9) * 10 ** (-3 / 20)   # every take peaks at -3 dBFS
            p = tdir / f'{i:02d}_t{k + 1}.wav'; sf.write(p, a, sr)
            heard = transcribe(p)
            e = (wer(text, heard) if heard is not None else 0.0) + (0.5 if hot else 0)
            if best is None or e < best[0]:
                best = (e, p, a, sr)
            if e == 0:
                break
        e, p, a, sr = best
        sf.write(WORK / 'vo' / f'{i:02d}.wav', a, sr)
        flag = '' if e <= REG['defaults']['max_wer'] else '  <-- CHECK (listen first: names and numbers often read wrong)'
        w = f'wer={e:.2f}' if _asr else 'unchecked'
        report.append(f'{i:02d} {speaker:9s} {w} {len(a) / sr:5.2f}s {p.name}{flag}')
        print(report[-1])
    (WORK / 'vo' / 'tts_report.txt').write_text('\n'.join(report))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('target'); ap.add_argument('arg', nargs='?')
    ap.add_argument('--lines'); ap.add_argument('--takes', type=int)
    a = ap.parse_args()
    if a.target == 'check':
        cmd_check()
    elif a.target == 'design':
        cmd_design(a.arg)
    else:
        cmd_episode(a.target, {int(x) for x in a.lines.split(',')} if a.lines else None, a.takes)
