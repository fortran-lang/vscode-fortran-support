#!/bin/bash

if [[ -z "$1" ]]; then
  echo "No video file specified"
  exit 1
fi

# get everything after last /
video=${1##*/}
# remove everything after .
fname=${video%.*}

FPS=10

ffmpeg -i ${video} -vf palettegen ${fname}-palette.png
ffmpeg -i ${video} -i ${fname}-palette.png -filter_complex "fps=${FPS},scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse" ${fname}.gif
rm ${fname}-palette.png

