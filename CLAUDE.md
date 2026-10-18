# Gloomspire: instructions for Claude

Gloomspire is a first-person pixel tower-climbing roguelike (51 floors, spells and fusions, guns, bosses, co-op and PvP). It runs in the browser from one file, `index.html`, with three.js r128 inlined. It is hosted on Vercel from this repo: every push to `main` deploys both Vercel projects (`gl00mspire` and `gloomspire-dungeon`). The owner plays mostly on an Android phone in landscape, and on a low-end laptop.

## How the game is built
Do **not** hand-edit `index.html`. It is generated:

- `dev/src-original/`: the game before any of Claude's changes (`index.html`, `sw.js`). Never edit.
- `dev/build/patch*.py`: string-replace patches applied in order. Each `rep(a,b)` asserts that its anchor matches exactly once.
- `dev/build/m*.js`, `dun2.js`, `domshim.js`: code modules the patches insert into the game's main script (strict mode; function declarations at top level, not inside blocks).
- `dev/build/build.sh`: the patch order, the service-worker cache name and a syntax check (it must print `syntax bad: 0`).
- **Rebuild:** run `bash dev/build/build-repo.sh`. It writes `index.html` and `sw.js` to the repo root.

To change the game, either edit the module or patch that owns the feature, or add a new `patchN.py` (plus an optional `mN.js`) and append it to the loop in `build.sh`. Then rebuild.

Where things live:

| File | Feature |
|---|---|
| `m8.js` | Main menu (the title-screen pages, Update Log, build label), touch scope button, controller binding screen, cover-prop meshes |
| `m9.js` | `GSV` version constant, Haste + Last Gate floor picker, lever and crystal puzzles |
| `m10.js` | Boss models and boss phases |
| `m11.js` | Last Gate model, Haste triple = Stopped World, King fusion cycle, phone fixes for the ending screen and boss bar |
| `m12.js` | Chandeliers |
| `m13.js`, `m14.js` | Dungeon set dressing |
| `m15.js` | Chunked meshes, secret passages and vaults |
| `m16.js` | Shader warm-up |
| `dun2.js` | Boss bar, trials, pressure plates, summon gacha |
| `patch17.py` | Lighting values: torch light, ambient, fog |
| `patch19.py` + `domshim.js` | DOM write dedupe (HUD performance) |
| `m17.js` + `patch20.py` | Dungeon textures: walls, floors, ceilings, painted at 128 px per tile |

## Every update must
1. **Bump the version** everywhere it appears:
   - `GSV` in `dev/build/m9.js`. Co-op warns players whose versions differ.
   - The build label `Gloomspire · Build X.Y` in `dev/build/m8.js`.
   - `LOGV` in `m8.js`.
   - The sw cache `gloomspire-vN` in `build.sh` (increment N).
2. **Add an Update Log entry** at the top of the `UL` array in `m8.js`: version, date, short plain-English bullets for players.
3. **Append the build's notes** to `dev/build/README_notes.md` and copy that file to the root `README.md`.
4. **Rebuild** and confirm `syntax bad: 0`.
5. **Test** in headless Chromium (Playwright with swiftshader is available in Claude's environment): load the page, open the climb page with `window.__mmGo('climb')`, click `start`, `begin`, `begin`, `rollskip`, and check there are no page errors. For deeper tests, `dev/build/mkexp.sh` makes a copy that exposes `window.__g` (P, L, enemies, buildLevel, cast and more). Its paths assume the `/home/claude` layout.
6. **Commit and push** to `main`. Then check the commit status: both Vercel contexts should report `success`.

## Owner preferences learned so far
- Keep the dark dungeon mood. Lighting was tuned several times; 3.3 (ambient 1.6, torches 1.1 / 21 m) is the accepted level.
- Mobile performance matters: low-end Android. Avoid per-frame DOM writes, new per-object materials, and extra draw calls. Merge static geometry (see `chandMerge` / `addChunked`).
- Everything should look dungeon-style: stone, iron, wood, candles. Nothing floating or clipping.
- Co-op must stay deterministic: level generation uses the seeded `Math.random` inside `buildLevel`.
- Explain changes simply. The owner is not a programmer.
