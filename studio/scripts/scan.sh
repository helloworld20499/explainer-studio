#!/usr/bin/env bash
# Stillness / empty-frame check for a composition (run before every gate):
#   bash scripts/scan.sh ep001-animatic            all defaults (hold > 4 s, empty < 3 %)
#   bash scripts/scan.sh ep001 --allow 12-16.5     a hold that is intended (say why in the storyboard)
set -euo pipefail
cd "$(dirname "$0")/.."
source ./config.sh
COMP=${1:?composition id}; shift
bash scripts/ensure_browser.sh
node scripts/scan.mjs "$COMP" 0.5
"$PY" scripts/scan.py "$COMP" "$@"
