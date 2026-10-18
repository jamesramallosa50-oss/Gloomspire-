# Facility test scripts (not loaded by the game)

Playwright scripts used to check The Facility (Horror card). They need the test copy made by `dev/build/mkexp.sh`
(it exposes `window.__g`, including `__g.fac`) with `assets/` copied next to it, and Chromium with swiftshader.

| Script | What it does | Run |
|---|---|---|
| `t90.js` | Screenshots at fixed viewpoints (set `VIEWS` to a JSON list of `[name,x,z,level,yaw,pitch]`) | `node t90.js <testcopy> <outdir> <tag>` |
| `t91.js` | `A`: collision fuzz (random spots, random input, checks penetration, closed doors, falls). `B`: a bot that fetches the fuses, uses the breaker and the lift, logging the creature's states. Env: `FLEE=1` (run away and hide), `INVINCIBLE=1` (count catches instead of dying), `NCH` (10 s chunks), `DBG=t0,t1` (log every tick) | `node t91.js <testcopy> AB <seed>` |
| `t93.js` | Smoke test: build label, update log, mode cards, Facility pause/resume/try again/quit, Hide & Seek, climb start | `node t93.js <testcopy>` |
| `t94.js` | Walk tests: corridors, sprint, wall slide, stairs, pushing a closed door open | `node t94.js <testcopy>` |
| `stats.py` | Colour levels of screenshots (dark / mid / bright), to compare with a reference video's frames | `python3 stats.py shot*.png` |

The creature is hidden in these runs (`__facHideDm`) because swiftshader takes minutes to draw the skinned model.
