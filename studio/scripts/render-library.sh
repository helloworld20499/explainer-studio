#!/usr/bin/env bash
# Render the object library catalogue and the explanation patterns ON THIS COMPUTER -> docs/library/
#   bash scripts/render-library.sh               pages (PNG) + patterns reel (MP4, flat)
#   bash scripts/render-library.sh --whiteboard  also the whiteboard patterns reel
set -euo pipefail
cd "$(dirname "$0")/.."
source ./config.sh
CONC=(); [ -n "${CONCURRENCY:-}" ] && CONC=(--concurrency="$CONCURRENCY")
[ -d node_modules ] || npm install --no-fund --no-audit
bash scripts/ensure_browser.sh
OUT=../docs/library; mkdir -p "$OUT"
IDS=$(npx remotion compositions src/index.ts 2>/dev/null | grep -oE '^(objlib-[a-z0-9-]+|patterns-sheet[a-z-]*)' | sort -u)
for ID in $IDS; do
  npx remotion still src/index.ts "$ID" "$OUT/$ID.png" --frame=0 --log=error
  echo "  $OUT/$ID.png"
done
npx remotion render src/index.ts patterns-reel "$OUT/patterns-reel.mp4" ${CONC[@]+"${CONC[@]}"} --log=error
if [ "${1:-}" = "--whiteboard" ]; then
  npx remotion render src/index.ts patterns-reel-whiteboard "$OUT/patterns-reel-whiteboard.mp4" --log=error
fi
echo "Library rendered to docs/library/ (PNG pages are kept in git, the MP4 reels are not)."
