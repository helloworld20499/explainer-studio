#!/usr/bin/env bash
# Final video: render -> sound (music + SFX) -> mix -> subtitles -> mux -> deliver.
#   bash scripts/final.sh ep001            full size
#   bash scripts/final.sh ep001 --preview  half size with sound, for a quick check
source "$(dirname "$0")/common.sh"
bash scripts/prep.sh "$EP"
if [ "${2:-}" = "--preview" ]; then
  npx remotion render src/index.ts "$EP" "out/$EP/preview_silent.mp4" --scale=0.5 ${CONC[@]+"${CONC[@]}"}
  "$PY" scripts/sound.py "$EP" && "$PY" scripts/mix.py "$EP"
  ffmpeg -loglevel error -y -i "out/$EP/preview_silent.mp4" -i ".work/$EP/mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -shortest "out/$EP/${SLUG}_preview.mp4"
  bash scripts/deliver.sh "$EP" "$SLUG/review" "out/$EP/${SLUG}_preview.mp4"
  exit 0
fi
npx remotion render src/index.ts "$EP" "out/$EP/silent.mp4" ${CONC[@]+"${CONC[@]}"}
"$PY" scripts/sound.py "$EP"
"$PY" scripts/mix.py "$EP"
"$PY" scripts/subs.py "$EP"
bash scripts/finish.sh "$EP"
