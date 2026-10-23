#!/bin/zsh
# Split-screen Korede into a finished video during windows: game/content cropped to the top 1150 px (source y CROP_Y..CROP_Y+1150),
# Korede's lip-synced studio shot (plate.mp4) in the bottom 770 px. Input video-noface.mp4. Audio unchanged.
# Usage: scripts/split-cut.sh <post-dir> "s1-e1,s2-e2" [crop_y=330]
P=$1; W=$2; CY=${3:-330}
EN=$(echo $W | tr ',' '\n' | awk -F- '{printf "%sbetween(t,%s,%s)", (NR>1?"+":""), $1, $2}')
ffmpeg -v error -y -i $P/video-noface.mp4 -i $P/plate.mp4 -filter_complex "
[0:v]split=2[base][g];
[g]crop=1080:1150:0:${CY}[top];
[1:v]fps=30,crop=1500:1069:210:0,scale=1080:770,setsar=1,tpad=stop_mode=clone:stop_duration=60[face];
[top][face]vstack=inputs=2,format=yuv420p[split];
[base][split]overlay=0:0:eof_action=pass:enable='$EN'[v]" -map "[v]" -map 0:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy $P/video-split.mp4 && mv $P/video-split.mp4 $P/video.mp4 && echo "split added $W"
