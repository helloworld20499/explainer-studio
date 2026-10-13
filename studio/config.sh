# Studio settings, read by every script in scripts/. Change them for your machine.
VENV="${VENV:-$PWD/.venv}"                       # Python venv for all Python scripts (made by scripts/setup.sh)
PY="$VENV/bin/python"
# Where finished files go (two copies is a good rule: one synced cloud folder + one local archive). Never git.
DELIVER_TO=(
  "$HOME/Videos/ExplainerStudio"
  # "$HOME/Library/CloudStorage/GoogleDrive-you@example.com/My Drive/MyChannel"   # Google Drive for desktop (macOS)
  # "$HOME/Dropbox/MyChannel"
)
# Commit timing files (timeline.json, words.json) after the voice step, so a cloud AI session gets them with git pull.
AUTO_COMMIT_TIMING="${AUTO_COMMIT_TIMING:-1}"
CONCURRENCY="${REMOTION_CONCURRENCY:-}"          # empty = Remotion default; try: npx remotion benchmark
