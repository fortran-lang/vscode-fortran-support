#!/bin/bash

if [[ -z "$1" ]]; then
  echo "No video file specified"
  exit 1
fi

# get everything after last /
video=${1##*/}
# remove everything after .
fname=${video%.*}

mkdir __tmp__
# TODO: pass additional options to ffmpeg -vf ""...
ffmpeg -i ${video} __tmp__/frame_%05d.png -hide_banner
# TODO: pass additional options to gifski -W 888 --fps=15 ...
gifski -o ${fname}.gif __tmp__/frame_*.png
rm -rf __tmp__

