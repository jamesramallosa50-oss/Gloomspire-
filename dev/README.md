# Build sources (not loaded by the game)

The game is the single `index.html` at the root. It is generated from:

- `src-original/index.html`: the game before the patch series.
- `build/`: the patches (`patch*.py`), the code modules they insert (`m8.js` … `m16.js`, `dun2.js`, `domshim.js`) and `build.sh`, which applies them in order and syntax-checks the result.
- `build/README_notes.md`: per-build change notes.

`build.sh` expects the layout `/home/claude/{src,tools,out}`. Copy `build/` to `tools/` and `src-original/` to `src/Gloomspire--main/` to rebuild.
