# Gloomspire

Static game: `index.html` is the whole game. No build step.

## One-time setup
1. Create a new GitHub repo and upload everything in this folder (drag and drop works on github.com).
2. Go to vercel.com/new, pick "Import Git Repository", and choose that repo.
3. Leave Framework Preset as "Other". Leave Build Command and Output Directory empty. Click Deploy.

## Updating the game
Replace `index.html` in the repo with the new version (on github.com: open the file, click the pencil/upload, commit).
Vercel redeploys automatically within a minute and keeps the same link.
## Boss update (version 2.0)
- **New models for all ten guardians**: Orc Warlord (horned helm, spiked pauldrons, cleaver and shield, cape), Brood Queen (crowned spider with glowing egg sacs), Ashmaw (long-necked drake with molten belly, wings and tail), Corvin (bell-staff lich with orbiting bells), Ooze King (layered slime with bones inside and a crown), Sir Halvard (plate knight, greatsword, tower shield), Mother Cinder (winged imp with a burning halo and tail), the Pale Choir (shroud with a ring of three masks), Gorehowl (bone giant with a glowing core and bone bow), the Bell That Wakes (cracked bell with a watching eye and chains).
- **Smooth boss animation**: bosses turn smoothly, breathe, track you with their heads, capes and tails sway, rings and bells orbit, their glow pulses faster each phase, and the Ooze King squashes and stretches.
- **Each phase is harder**: at two thirds and one third health the boss raises a 2 second shield, then takes 15% and then 30% less damage, hits 18% harder each time, attacks more often, and unlocks new spells: meteor rain with homing orbs (phase 2) and rotating beams you must jump or dodge (phase 2, four beams in phase 3). Each later boss also has more health and damage than the one before.

## Puzzle update (version 1.9)
- **Blocked entrances fixed for real**: corridors enter some rooms through an open gap with no door, and room layouts could put a wall or crate in that gap. Those gaps are now protected like doors.
- **Health and mana numbers** sit on top of the bar fill again.
- **Raised platforms** are now ritual daises: dark stone courses, an iron-trimmed top, corner posts with candles and skulls, stone steps.
- **Spawn room** is smaller with a low ceiling; fighting rooms stay big and tall.
- **Harder**: big rooms hold more monsters (up to 10 per room, scaled by room size) and elites are more common.
- **Room puzzles**: Lever rooms (pull the coloured levers in the order the tablet shows; walk into, strike or shoot them) and Crystal rooms (the crystals sing a pattern, repeat it). Both reward a chest and gold, alongside the wave trials and rune plates. Single player only.
- **Last Gate + Haste**: opens a scrolling list of every floor 1 to 51 (bosses marked) and, in co-op, a button to jump straight to each teammate.
- **Co-op versions**: the game now tells you when you and the host run different versions, which is what makes floors differ between players. Both refresh the page.

## Polish update
- **Exits never blocked**: room layouts keep a clear zone two cells deep around every door and stairway, and every floor is checked so you can walk from the start to every door and the exit. Any layout that would block a path is removed.
- **Main menu**: a column of words on the left over the live tower scene, the GLOOMSPIRE logo bottom right. Continue, New Climb, Multiplayer, Options, How to Play and Credits each open their own page with a Back button.
- **Touch layout**: the default layout is now the one from your screenshot. A SCOPE button can be added in Customize > Add button (not on by default); hold it to scope and fire with FIRE.
- **Controller buttons**: Options (main menu) or the pause menu > Controller buttons. Pick an action and press the button you want: Xbox, PlayStation and other pads. Includes a Scope (hold) action, controller type and Reset.
- **Every climb starts fresh**: level 1 and only your climber's own spells. PvP uses its own spells and no longer carries your climb spells; your climb hotbar comes back when you leave the arena.
- **Cover props**: the blocks in rooms are now wooden crates, banded barrels and plank barricades with iron rails. They stop shots, can be climbed, and monsters walk round them.
- **Aim assist**: from the hip it only helps within about 11 m. While scoped it reaches about 34 m, and scoped shots travel almost twice as far.
- **Ultimates**: the one-shot sweep of the whole room is gone; each ultimate does its own thing (the 31 reworked ones still spread over the room). Ultimates keep a short opening flash.
- **Cooldowns by strength**: 3-spell ultimates 14 to 30 s, 2-spell fusions 8 to 15 s, only on the spells you fused. Room-wide and multi-cast ones wait longest, self buffs the least.

## Single-target ultimates now take the whole room
31 ultimates that used to hit one enemy were reworked:
- Cast on every enemy in the room (up to 6 copies, the rest get an echo strike): Marionette Wire, Winter Chrysalis, Compound Debt, Pariah's Mark, Cold Guillotine, Clumsy Colossus, Abyssal Clutch, Crowned Carrier, Overripe, Frozen Recoil, Ticking Seedpod, Iron Embrace, Glacier Harpoon.
- Cast three times, fanned out around you so they hunt the whole room: Butcher Bird, Gobbling Coffer, Bubble Dance.
- Ultimates that carry you along (riding, swinging, wearing a body) play once on your target and strike every other enemy in the room with an echo (a beam in its colours, heavy damage, a 2.5 s stun): Falling Lotus, Umbral Tether, Heart in a Box, Bloodline Theft, Rimebound Duel, Body Thief, Unwelcome Guest, Canopy Swing, Breakback Ride, Frozen Hostage, Pain Given Shape, Pierced Before Thrown, Patient Headsman, Grudge Lantern, Red Wake.
- For these the room-clearing beams wait a moment so you see the ultimate's own effect land first.

## What changed in this version (ultimates)
- **Every ultimate clears the room**: after its own effect, an ultimate drops a pillar of light on every monster in your room, near you, or in plain sight. Normal monsters and elites die, bosses lose a quarter of their life. It opens with a white flash, three shockwaves and a beam over you. 2-spell fusions kill normal monsters, take 65% off elites and 10% off bosses.
- **Cooldowns**: an ultimate puts exactly the three spells you fused on a 45 second cooldown, a fusion puts exactly its two spells on 20 seconds. The other spells stay ready. The seconds left show on each locked slot. (PvP uses 60% of these.)
- **Same-element fusions**: three spells that share an element (for example three fire spells) now fuse. They call an ultimate that carries those elements, always the same one for the same spells. Same for 2-spell fusions.
- An ultimate whose own effect breaks can no longer skip the room clear.

## Dungeon update
- Gun effects toned down (smaller flash, no smoke, no shake per shot or per bullet hit). Melee keeps its punch.
- Health, mana and level bars no longer show through the pause menu, the Book or the shop.
- Android: move stick, FIRE, spells and LOADOUT sit higher, clear of the bottom bar.
- Bigger rooms with high ceilings and tactical layouts: pillared halls, barricades, a raised dais, a split wall with chokepoints, storerooms. Stone blocks stop shots, can be climbed, and monsters walk around them.
- Bosses: more health, a boss bar, three phases with adds and shockwaves, telegraphed attacks (marks, fire lines, rings to jump), decorated halls, two chests on a kill.
- Wave trials (blue circle, Wave X/N with a timer) and rune plates with vault chests, single player only.
- Summon (gacha) in the Book: 250 gold for 1, 2250 for 10, 1-5 stars, pity at 50.

## Performance and effects
- Colour grade in WebGL, hidden props not drawn, idle overlays hidden, pooled hit effects, fewer torch lights on Low/Medium.
- Muzzle flash, shells, tracers, slash arcs, spell squash-and-stretch, impact bursts and embers, all pooled.
## What changed in this version
- **Graphics**: sharper 64px stone textures with bevelled seams, baked corner shading, brighter and longer-reaching torchlight with halos, shadows under creatures, a light colour grade and vignette (off on the Low setting).
- **Climb balance**: enemies have less health, hit softer and move a little slower, packs are smaller, elites are rarer, levelling is faster, flasks drop more often, and a fall costs a third of your levels instead of half. Tune it in `DIFF`, `spawnEnemy` and the `budget` line in `buildLevel0`.
- **New enemies**: Powder Goblin (floor 2+, explodes), Ghoul (floor 3+, pounces), Frost Shaman (floor 4+, slows you), Bone Chanter (floor 6+, heals its allies).
- **Roomier floors**: rooms are about 1.5x larger, corridors are two lanes wide, and big rooms get pillars.
- **PvP battlegrounds**: the Arena, Stadium and Crossing are much larger, and there is a new map, the Scaffold. They have blocks, ledges and catwalks to climb, jump pads, speed strips, linked gates and power orbs. Layouts live in `genArena`.
- **Fixes**: the final boss no longer errors when he casts Orb, fusing Last Gate with Haste and stepping through a Gate of Ascension no longer throw, and the title backdrop no longer crashes when a room reconnects during a match.

Everyone in a multiplayer room needs this same version, because floor layouts changed.

## Build 2.1 — main menu polish
- Menu items slide in one after another; the selected item glows gold with a ▸ marker and a one-line description.
- Arrow keys / W S to move, Enter to open, Esc or Backspace to go back; a soft tick plays on each move.
- CONTINUE shows who you were climbing as, the floor and the level.
- Stat badges along the bottom: climber, difficulty, best floor, falls.
- Logo has a small pixel tower emblem and a slow ember glow; drifting fog along the floor.
- Sub-pages fade in with a gold divider under the title.
