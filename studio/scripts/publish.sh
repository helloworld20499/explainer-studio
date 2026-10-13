#!/usr/bin/env bash
# Publish package (after final.sh): thumbnails (PNG) + 9:16 Short, then deliver with the upload text.
#   bash scripts/publish.sh ep001
source "$(dirname "$0")/common.sh"
[ -f ".work/$EP/mix.wav" ] || { echo "Run final.sh first (no .work/$EP/mix.wav)"; exit 1; }
mkdir -p "public/_work/$EP" "out/$EP" "../episodes/$SLUG/publish"
cp ".work/$EP/mix.wav" "public/_work/$EP/mix.wav"
bash scripts/ensure_browser.sh
for ID in $(npx remotion compositions src/index.ts 2>/dev/null | grep -oE "^$EP-thumb-[a-z0-9]+" | sort -u); do
  npx remotion still src/index.ts "$ID" "../episodes/$SLUG/publish/${ID#$EP-}.png"
done
npx remotion render src/index.ts "$EP-short" "out/$EP/${SLUG}_short.mp4" ${CONC[@]+"${CONC[@]}"}
bash scripts/deliver.sh "$EP" "$SLUG/publish" "out/$EP/${SLUG}_short.mp4" ../episodes/$SLUG/publish/*
