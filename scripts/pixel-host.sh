#!/bin/zsh
# Overlay pixel Korede (assets/pixel/sprites) as a ringside commentator in windows, bobbing. Input video-noface.mp4.
# Usage: scripts/pixel-host.sh <post-dir> "s1-e1:pose,s2-e2:pose,..."   poses: point|shrug|cheer|stand|laptop
P=$1; SPEC=$2; S=assets/pixel/sprites
IN=(-i $P/video-noface.mp4); FC=""; LAST="0:v"; i=1
for item in ${(s:,:)SPEC}; do
  win=${item%%:*}; pose=${item##*:}; a=${win%%-*}; b=${win##*-}
  IN+=(-i $S/korede-$pose.png)
  FC+="[$i:v]scale=-1:250:flags=neighbor[s$i];[$LAST][s$i]overlay=x=14:y='1215-abs(sin((t-$a)*7))*18':enable='between(t,$a,$b)'[o$i];"
  LAST="o$i"; i=$((i+1))
done
ffmpeg -v error -y $IN -filter_complex "${FC%;}" -map "[$LAST]" -map 0:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy $P/video-host.mp4 && mv $P/video-host.mp4 $P/video.mp4 && echo "pixel host added"
