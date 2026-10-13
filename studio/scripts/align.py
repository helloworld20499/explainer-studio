"""Word-level timestamps for every narration line -> src/episodes/<ep>/words.json
  python3 scripts/align.py ep001              Whisper: mlx-whisper (Apple silicon) or faster-whisper (any machine)
  python3 scripts/align.py ep001 --estimate   no voice yet: spread the words over each line (for the animatic)
words.json: {"lines":[{"i":0,"start":0.8,"words":[{"w":"cutting","start":0.82,"end":1.10}, ...]}]}
Animation code uses these times: cue(12, 'grabs') instead of a fixed number of seconds (src/kit/cues.ts).
Language: set "language" in studio/voices.json (default "en")."""
import json, re, sys
from epconf import WORK, SRC, STUDIO

tl = json.load(open(SRC / 'timeline.json'))
LANG = json.load(open(STUDIO / 'voices.json')).get('language', 'en')
norm = lambda w: re.sub(r"[^\w']", '', w).lower()


def estimate(ln):
    toks = [w for w in ln['text'].split() if norm(w)]
    weights = [len(norm(w)) + 2 for w in toks]
    span, t, out = ln['end'] - ln['start'], ln['start'], []
    for w, k in zip(toks, weights):
        d = span * k / sum(weights)
        out.append({'w': norm(w), 'start': round(t, 3), 'end': round(t + d * 0.9, 3)}); t += d
    return out


def whisper():
    try:
        import mlx_whisper
        def run(path):
            r = mlx_whisper.transcribe(path, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language=LANG, word_timestamps=True)
            return [(w['word'], w['start'], w['end']) for s in r['segments'] for w in s.get('words', [])]
        return run
    except ImportError:
        from faster_whisper import WhisperModel
        m = WhisperModel('small', compute_type='int8')
        def run(path):
            segs, _ = m.transcribe(path, language=LANG, word_timestamps=True)
            return [(w.word, w.start, w.end) for s in segs for w in (s.words or [])]
        return run


run = None
if '--estimate' not in sys.argv:
    try:
        run = whisper()
    except Exception as e:      # no Whisper installed or the model cannot be downloaded
        print(f'WARNING: Whisper not available ({type(e).__name__}: {e}). Word times are ESTIMATED from the line times.')
        print('         Install it (Apple silicon: pip install mlx-whisper; else: pip install faster-whisper) and run align.py again.')
out = []
for ln in tl['lines']:
    if run:
        words = [{'w': norm(w), 'start': round(ln['start'] + a, 3), 'end': round(ln['start'] + b, 3)}
                 for w, a, b in run(str(WORK / 'vo' / f"{ln['i']:02d}.wav")) if norm(w)]
    else:
        words = estimate(ln)
    out.append({'i': ln['i'], 'scene': ln['scene'], 'start': ln['start'], 'text': ln['text'], 'words': words})
    print(f"{ln['i']:02d} {len(words):3d} words")
json.dump({'lines': out}, open(SRC / 'words.json', 'w'), indent=1)
print('wrote', SRC / 'words.json')
