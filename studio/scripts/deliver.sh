#!/usr/bin/env bash
# Copy finished files to every place in DELIVER_TO (config.sh). Never to git.
#   bash scripts/deliver.sh <ep> <sub-folder> <file>...
source "$(dirname "$0")/common.sh"; shift
SUB=${1:?sub-folder}; shift
for R in "${DELIVER_TO[@]}"; do
  mkdir -p "$R/$SUB" 2>/dev/null || { echo "Cannot write to $R (skipped)"; continue; }
  for F in "$@"; do [ -f "$F" ] && cp "$F" "$R/$SUB/"; done
  echo "Delivered to: $R/$SUB"
done
