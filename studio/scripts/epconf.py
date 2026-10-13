"""Shared paths for one episode.  Usage in every script:  python3 scripts/<tool>.py ep000"""
import os, sys
from pathlib import Path
STUDIO = Path(__file__).resolve().parent.parent
REPO = STUDIO.parent
EP = (sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else os.environ.get('EP', 'ep000'))
_m = sorted((REPO / 'episodes').glob(EP + '-*'))
if not _m:
    sys.exit(f'No episode folder episodes/{EP}-* found')
DOCS = _m[0]                      # script, storyboard, lines.json, pauses.json, sound.json, subtitles
SRC = STUDIO / 'src' / 'episodes' / EP   # Remotion scenes + timeline.json
WORK = STUDIO / '.work' / EP      # generated audio (git-ignored)
OUT = STUDIO / 'out' / EP         # rendered videos (git-ignored)
MODELS = STUDIO / '.models'       # TTS model files (git-ignored, see setup.sh)
FONTS = STUDIO / 'public' / 'fonts'
for d in (WORK, OUT, WORK / 'vo'):
    d.mkdir(parents=True, exist_ok=True)
SLUG = DOCS.name
