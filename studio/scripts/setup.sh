#!/usr/bin/env bash
# One-time setup.  Run in studio/:   bash scripts/setup.sh
# Needs: Node 18+ and ffmpeg (macOS: Homebrew installs them), Python 3.10-3.12.
# Makes: node_modules (Remotion), a Python venv with the audio tools, and the TTS model files.
set -euo pipefail
cd "$(dirname "$0")/.."
source ./config.sh
need() { command -v "$1" >/dev/null 2>&1; }
if [ "$(uname -s)" = "Darwin" ]; then
  need brew || { echo "Install Homebrew first: https://brew.sh"; exit 1; }
  need node   || brew install node
  need ffmpeg || brew install ffmpeg
fi
need node && need ffmpeg || { echo "Install Node 18+ and ffmpeg first (Linux: your package manager; Windows: use WSL)."; exit 1; }
echo "node $(node -v) | $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"

npm install --no-fund --no-audit

PYB=$(command -v python3.12 || command -v python3.11 || command -v python3)
[ -x "$PY" ] || "$PYB" -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q soundfile scipy numpy pyloudnorm pillow kokoro-onnx
mkdir -p .models
[ -f .models/kokoro-v1.0.onnx ] || curl -L -o .models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f .models/voices-v1.0.bin ]  || curl -L -o .models/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
if [ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then
  "$VENV/bin/pip" install -q mlx-whisper mlx-audio || echo "NOTE: mlx-audio did not install; the kokoro engine still works."
else
  "$VENV/bin/pip" install -q faster-whisper
fi
bash scripts/ensure_browser.sh
echo
echo "Setup done. Next:"
echo "  $PY scripts/tts.py check            # every voice says one sentence"
echo "  npx remotion studio                  # preview the demo episode in the browser"
