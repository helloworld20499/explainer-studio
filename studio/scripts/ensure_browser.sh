#!/usr/bin/env bash
# Make sure Remotion's Chrome Headless Shell is complete (run from studio/).
# Problem seen 2026-10-10 with Node 26: Remotion downloads the zip but unpacks only the first files,
# then stops with "No browser found for rendering frames!". This script unpacks the missing files.
set -euo pipefail
D=node_modules/.remotion/chrome-headless-shell
[ -n "${REMOTION_BROWSER:-}" ] && exit 0
npx remotion browser ensure >/dev/null 2>&1 || true
for ZIP in "$D"/chrome-headless-shell-*.zip; do
  [ -f "$ZIP" ] || continue
  PLAT=$(basename "$ZIP" .zip | sed 's/chrome-headless-shell-//')
  BIN="$D/$PLAT/chrome-headless-shell-$PLAT/chrome-headless-shell"
  if [ ! -x "$BIN" ]; then
    echo "Fixing incomplete browser unpack ($PLAT)"
    unzip -nq "$ZIP" -d "$D/$PLAT/"
  fi
done
