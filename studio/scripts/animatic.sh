#!/usr/bin/env bash
# Gate 2 animatic: the episode with placeholder art, voice, shot numbers and timecode.   bash scripts/animatic.sh ep001
source "$(dirname "$0")/common.sh"
bash scripts/prep.sh "$EP"
npx remotion render src/index.ts "$EP-animatic" "out/$EP/${SLUG}_animatic.mp4" ${CONC[@]+"${CONC[@]}"} 2>&1 | tee "out/$EP/animatic_render.log" | grep -v "^Rendered" || true
[ -f "out/$EP/${SLUG}_animatic.mp4" ] || { echo "RENDER FAILED. Log: studio/out/$EP/animatic_render.log"; exit 1; }
bash scripts/deliver.sh "$EP" "$SLUG/review" "out/$EP/${SLUG}_animatic.mp4"
