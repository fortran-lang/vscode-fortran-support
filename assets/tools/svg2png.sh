#!/bin/bash

svg_names=(
    "modern-fortran-logo.svg"
    "readme.discourse.svg"
    "readme.fortls.svg"
    "readme.fpm.svg"
    "readme.github.sponsor.svg"
    "readme.github.svg"
    "readme.lfortran.svg"
    "readme.stdlib.svg"
    "readme.tutorial.svg"
)

# Path to inkcape binary by default it assumes its in PATH
# pass as the first command line argument if not
inkscape="${1:-inkscape}"
echo "Using inkscape: $inkscape"

for svg_name in "${svg_names[@]}"; do
    echo "Converting $svg_name"
    $inkscape -o "../png/${svg_name%.*}.png" "../svg/$svg_name"
done