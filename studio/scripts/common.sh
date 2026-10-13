# Sourced by the step scripts: cd to studio/, load config, find the episode folder.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source ./config.sh
EP=${1:?episode code, for example ep001}
SLUG=$(basename "$(ls -d ../episodes/${EP}-* 2>/dev/null | head -1)")
[ -n "$SLUG" ] || { echo "No folder episodes/${EP}-*"; exit 1; }
CONC=(); [ -n "$CONCURRENCY" ] && CONC=(--concurrency="$CONCURRENCY")
[ -x "$PY" ] || { echo "No Python venv at $VENV. Run: bash scripts/setup.sh"; exit 1; }
