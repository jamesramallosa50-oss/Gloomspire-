# Gloomspire

Static game: `index.html` is the whole game. No build step.

## One-time setup
1. Create a new GitHub repo and upload everything in this folder (drag and drop works on github.com).
2. Go to vercel.com/new, pick "Import Git Repository", and choose that repo.
3. Leave Framework Preset as "Other". Leave Build Command and Output Directory empty. Click Deploy.

## Updating the game
Replace `index.html` in the repo with the new version (on github.com: open the file, click the pencil/upload, commit).
Vercel redeploys automatically within a minute and keeps the same link.
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
