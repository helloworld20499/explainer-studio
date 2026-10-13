#!/usr/bin/env bash
# Copy voice and images into public/_work/ for Remotion (used by animatic.sh, final.sh, stills).
source "$(dirname "$0")/common.sh"
mkdir -p "public/_work/$EP/vo" "out/$EP"
"$PY" scripts/prep_assets.py "$EP"
ls .work/$EP/vo/[0-9][0-9].wav >/dev/null 2>&1 && cp .work/$EP/vo/[0-9][0-9].wav "public/_work/$EP/vo/" || echo "No voice files yet (animatic without sound)."
bash scripts/ensure_browser.sh
