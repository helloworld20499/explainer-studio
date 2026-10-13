#!/usr/bin/env bash
# Mux mix.wav onto the silent render (+ a burned-in subtitle version when ffmpeg has libass), then deliver.
source "$(dirname "$0")/common.sh"
SIL=out/$EP/silent.mp4; MIX=.work/$EP/mix.wav
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q h264_videotoolbox; then VENC="-c:v h264_videotoolbox -b:v 12M"; else VENC="-c:v libx264 -preset medium -crf 18"; fi
ffmpeg -loglevel error -y -i $SIL -i $MIX -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/$EP/${SLUG}_nosubs.mp4
# ffmpeg 8 rejects the short form "ass=file"; use explicit option names
if ffmpeg -hide_banner -filters 2>/dev/null | grep -qE '^ ... ass '; then SUBF="ass=filename=.work/$EP/subs.ass:fontsdir=public/fonts"
elif ffmpeg -hide_banner -filters 2>/dev/null | grep -qE '^ ... subtitles '; then SUBF="subtitles=filename=.work/$EP/subs.ass:fontsdir=public/fonts"
else SUBF=""; fi
if [ -n "$SUBF" ]; then
  ffmpeg -loglevel error -y -i $SIL -i $MIX -map 0:v -map 1:a -vf "$SUBF" $VENC -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out/$EP/${SLUG}_subs.mp4
else
  echo "NOTE: this ffmpeg has no libass, so no burned-in version. Upload the no-subs video + the .srt file (better for YouTube anyway)."
fi
cp ../episodes/$SLUG/subtitles.en.srt out/$EP/${SLUG}.en.srt
bash scripts/deliver.sh "$EP" "$SLUG/$(date +%Y-%m-%d)" out/$EP/${SLUG}_nosubs.mp4 out/$EP/${SLUG}.en.srt out/$EP/${SLUG}_subs.mp4
