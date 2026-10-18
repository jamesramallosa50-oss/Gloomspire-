#!/bin/bash
# Rebuild the game from dev/src-original + dev/build and write index.html and sw.js to the repo root.
# Usage (from anywhere): bash dev/build/build-repo.sh
set -e
R=$(cd "$(dirname "$0")/../.." && pwd)
W=$(mktemp -d)
mkdir -p "$W/tools" "$W/src/Gloomspire--main"
cp "$R"/dev/build/* "$W/tools/"
cp "$R/dev/src-original/index.html" "$R/dev/src-original/sw.js" "$W/src/Gloomspire--main/"
# the patch scripts were written for a /home/claude/{src,tools,out} layout; point them at the temp workspace
sed -i "s#/home/claude#$W#g" "$W"/tools/*.py "$W/tools/build.sh" "$W/tools/mkexp.sh"
bash "$W/tools/build.sh"
cp "$W/out/Gloomspire--main/index.html" "$W/out/Gloomspire--main/sw.js" "$R/"
echo "built into $R (workspace $W)"
