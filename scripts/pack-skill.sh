#!/usr/bin/env bash
# Zip the portable skill for upload to Claude.ai / Claude desktop -> dist/explainer-video-studio.zip
# The two copies (.claude/ and .agents/) must be the same; this script stops if they differ.
set -euo pipefail
cd "$(dirname "$0")/.."
diff -q .claude/skills/explainer-video-studio/SKILL.md .agents/skills/explainer-video-studio/SKILL.md
mkdir -p dist
rm -f dist/explainer-video-studio.zip
(cd .claude/skills && zip -qr ../../dist/explainer-video-studio.zip explainer-video-studio -x '*.DS_Store')
echo "dist/explainer-video-studio.zip"
