#!/bin/zsh
# Overlay Korede's talking cutout (plate.mp4 + plate-mask.mp4 from talk-segments) bottom-right of a finished video
# in windows. Usage: scripts/corner-cut.sh <post-dir> "s1-e1,s2-e2,..."   (input: video-noface.mp4)
P=$1; W=$2
EN=$(echo $W | tr ',' '\n' | awk -F- '{printf "%sbetween(t,%s,%s)", (NR>1?"+":""), $1, $2}')
ffmpeg -v error -y -i $P/video-noface.mp4 -i $P/plate.mp4 -i $P/plate-mask.mp4 -filter_complex "
[1:v]crop=900:1080:510:0,scale=620:-1,setpts=PTS-STARTPTS[f];
[2:v]crop=900:1080:510:0,scale=620:-1,format=gray,boxblur=1:1[m];
[f][m]alphamerge,format=yuva420p[cut];
[0:v][cut]overlay=x=W-w+40:y=H-h-180:enable='$EN'[v]" -map "[v]" -map 0:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy $P/video-face.mp4 && mv $P/video-face.mp4 $P/video.mp4 && echo "face added $W"
