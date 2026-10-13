#!/usr/bin/env bash
# Replace a frame range of the silent render with a re-rendered segment (one re-encode, frame-exact).
#   npx remotion render src/index.ts <ep> out/ep001/seg.mp4 --frames=2670-3305
#   bash scripts/splice.sh <ep> 2670 3305
set -euo pipefail
EP=$1; A=$2; B=$3; cd "$(dirname "$0")/.."
FULL=out/$EP/silent.mp4; SEG=${SEG:-out/$EP/seg.mp4}
ffmpeg -loglevel error -y -i $FULL -i $SEG -filter_complex \
 "[0:v]trim=end_frame=$A,setpts=N/30/TB[a];[1:v]setpts=N/30/TB[b];[0:v]trim=start_frame=$((B+1)),setpts=N/30/TB[c];[a][b][c]concat=n=3:v=1:a=0[v]" \
 -map "[v]" -r 30 -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p out/$EP/_spliced.mp4
mv out/$EP/_spliced.mp4 $FULL
ffprobe -v error -select_streams v -show_entries stream=nb_frames,duration -of csv=p=0 $FULL
