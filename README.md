# Gloomspire

Static game: `index.html` is the whole game. No build step.

## One-time setup
1. Create a new GitHub repo and upload everything in this folder (drag and drop works on github.com).
2. Go to vercel.com/new, pick "Import Git Repository", and choose that repo.
3. Leave Framework Preset as "Other". Leave Build Command and Output Directory empty. Click Deploy.

## Updating the game
Replace `index.html` in the repo with the new version (on github.com: open the file, click the pencil/upload, commit).
Vercel redeploys automatically within a minute and keeps the same link.
## What changed in this version (combat effects)
- **Gunfire**: a muzzle flash on the barrel with a light pop, sparks and a puff of smoke, spent shells that fly out to the right and stay on the floor (red ones for shotguns), stretched tracer tails on bullets, sparks off walls, and blood sprayed out behind whatever you hit. Heavy guns kick the screen a little.
- **Melee**: a slash arc sweeps across the view in your blade's rarity colour, alternating sides each swing. Hits throw a white impact star (gold on crits), a fan of sparks and blood in the swing direction, and freeze the game for a few frames.
- **Spells**: a ring flares at your casting hand and a whoosh ring runs along the floor. Projectiles squash and stretch as they launch and leave a bright lagging core trail. On impact there is a white-hot flash, a coloured shockwave, a spray of sparks, a light pop and a small shake, and the target keeps smouldering with embers for a moment.
- **Still cheap**: everything is pooled. No new lights, materials or meshes are made per shot, and the particles go through the game's existing single-draw particle system. On Low graphics the counts are halved. The casting hand's light no longer gets added and removed on every cast (that used to recompile shaders and caused a small hitch).

## Performance pass
- Colour grade and vignette drawn inside WebGL at the game's low resolution instead of a full-screen CSS filter.
- Props, torches and monsters behind walls or past the fog are not drawn and skip their matrix updates.
- Idle overlay layers (embers canvas, speed/cast/ward/hurt washes) are hidden; the menu blur is removed.
- Hit effects are pooled and capped; monster bounds are measured once.
- Low uses 3 torch lights, Medium and phone Auto use 4. Auto starts lower on phones and drops faster. Minimap redraws at ~30 fps.

## What changed in this version
- **Graphics**: sharper 64px stone textures with bevelled seams, baked corner shading, brighter and longer-reaching torchlight with halos, shadows under creatures, a light colour grade and vignette (off on the Low setting).
- **Climb balance**: enemies have less health, hit softer and move a little slower, packs are smaller, elites are rarer, levelling is faster, flasks drop more often, and a fall costs a third of your levels instead of half. Tune it in `DIFF`, `spawnEnemy` and the `budget` line in `buildLevel0`.
- **New enemies**: Powder Goblin (floor 2+, explodes), Ghoul (floor 3+, pounces), Frost Shaman (floor 4+, slows you), Bone Chanter (floor 6+, heals its allies).
- **Roomier floors**: rooms are about 1.5x larger, corridors are two lanes wide, and big rooms get pillars.
- **PvP battlegrounds**: the Arena, Stadium and Crossing are much larger, and there is a new map, the Scaffold. They have blocks, ledges and catwalks to climb, jump pads, speed strips, linked gates and power orbs. Layouts live in `genArena`.
- **Fixes**: the final boss no longer errors when he casts Orb, fusing Last Gate with Haste and stepping through a Gate of Ascension no longer throw, and the title backdrop no longer crashes when a room reconnects during a match.

Everyone in a multiplayer room needs this same version, because floor layouts changed.
