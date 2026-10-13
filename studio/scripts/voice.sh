#!/usr/bin/env bash
# Voice step: TTS (best of N takes) -> timeline -> word timestamps.
#   bash scripts/voice.sh ep001                       all lines
#   bash scripts/voice.sh ep001 --lines 7 --takes 5   re-voice some lines only
#   bash scripts/voice.sh ep001 --files               you recorded .work/<ep>/vo/00.wav ... yourself
source "$(dirname "$0")/common.sh"; shift
if [ "${1:-}" != "--files" ]; then "$PY" scripts/tts.py "$EP" "$@"; fi
"$PY" scripts/timeline.py "$EP" --measure
"$PY" scripts/align.py "$EP"
if [ "$AUTO_COMMIT_TIMING" = 1 ] && git rev-parse --git-dir >/dev/null 2>&1; then
  git add "src/episodes/$EP/timeline.json" "src/episodes/$EP/words.json"
  git commit -q -m "$EP: voice timing (timeline.json, words.json)" && { git push -q 2>/dev/null || true; } || echo "Timing files: nothing new to commit."
fi
echo "Voice done. Report: studio/.work/$EP/vo/tts_report.txt"
