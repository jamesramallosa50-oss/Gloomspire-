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

## Build 2.2
- Victory and ending screens fit phone screens, scroll if needed, and the button answers a tap.
- Boss health bar sits lower, with the boss name under the bar so it is never cut off.
- The King now cycles every kind of ultimate by name: a spell, a two-spell fusion, a three-spell ultimate, then a single-spell X ultimate, walking all 77 fusions and 220 ultimates in turn.
- Any three-spell ultimate with Haste in it is Stopped World (15 s time stop). Cast it during the King's time stop to break it.
- Fixed projectiles staying frozen in the air after a time stop ended (the floating and glitching objects).
- Haste + Last Gate: the first tap of Last Gate or Haste waits a moment, so a double tap starts the fusion instead of opening a gate. The floor picker opens first, the game holds, and nothing is spent until you pick; closing it refunds everything. A guard stops a finger still on the screen from picking a floor.
- In co-op the picker has a "Teleport to a teammate" section (it says when nobody is connected).
- New Last Gate model: stone arch with pillars and keystone, raised portcullis, braziers, swirling portal (gold, violet for floor gates); it rises out of the floor when it opens.

## Build 2.3 — objects
- Fixed surfaces flickering through each other (texture glitch), worst on phones: the camera's near plane moved from 0.05 to 0.12, which gives about 2.4x more depth precision.
- Removed overlapping faces that fought each other: crate corner posts and edge bars, crate braces, dais and step tops and trim, camp crates, rug layers and table planks.
- Floating lamps: the two camp lanterns now hang on chains from the ceiling. The Crown's bell (floor 51) hangs on a full chain instead of floating under a short one. Guardian-floor hanging decor uses the real ceiling height.
- Guardian-floor decor is never placed inside crates, fences, the dais or walls.

## Build 2.4
- The floor-51 bell hangs from the real ceiling (it used a fixed 3 m height before, so in tall rooms it floated).
- Chandeliers: iron rings with six lit candles on a chain from the ceiling, in up to 5 larger rooms per floor. The nearest ones give real light.
- Stopped World: your shots leave the barrel, travel about a metre and hang in the air, visible, until time resumes.
- Gun damage in the climb is 22% lower. The King's crown no longer one-shots everything: ×1.9 damage to monsters, ×1.35 to bosses.
- Aim assist: shorter reach from the hip (8 m, 28 m scoped), a narrower cone, a gentler pull, and shots only bend when you are almost on target.
- Enemies have idle (breathing, weight shift), walk and run gaits based on how fast they really move. They walk while hunting you out of sight and run once they see you.

## Build 2.5 — dungeon dressing
- Every room except the camp gets 2–7 pieces against its walls, chosen at random: wall shackles with chains, tattered banners on rods, bookshelves full of books, tables with candles, a bottle, a plate and a tome, floor candle clusters on a wax pool, skull and bone piles, and fallen rubble with a broken column.
- Cobwebs in about half the room corners, and iron cages with bones hanging in up to two big rooms per floor.
- Nothing is placed in doorways, against torches, on crates, fences or the dais, or in the camp.
- Cheap to draw: each floor's set dressing is one merged mesh, the cobwebs are another, and candle flames are merged per room (they never take a torch light). Roughly +12 draw calls per frame.

## Build 2.6 — more dungeon
- Stone buttresses fill the inside corners of every room, with a plinth and a capital, plus a middle band in tall rooms.
- Wooden ceiling beams with iron-banded brackets cross normal-height rooms every two cells.
- New wall pieces: weapon racks (swords, spears, a shield), sacks and barrels, stone sarcophagi with a candle, skull niches, notice boards with pinned parchments, altars with a chalice and candles, iron maidens, and meat hooks on chains.
- Floors: iron drain grates, dark puddles, old blood stains, scattered straw, bone scraps and cracked slabs. Damp moss creeps up the walls. Some rooms have chains with hooks hanging from the ceiling.
- Still cheap: one extra merged mesh for the pieces, three for the floor and wall decals (water, blood, moss) and two for the candle flames.

## Build 2.7
- Lag: every merged decoration mesh (crates, fences, the dais, wall pieces, cobwebs, floor decals) is split into 6 m chunks, so the line-of-sight culler skips the ones behind walls. Before, they were drawn every frame wherever you stood. Candle flames are hidden by distance a few times a second instead of being sorted with the torches every frame. On Low quality there are fewer wall pieces and no floor decals. Merged meshes are freed when you change floor.
- FOV: the slider is gentler on wide phone screens, and the view never opens past 100° vertical (112° on narrower screens). At max the picture used to stretch past 150° and break up.
- Secret passages: about half the floors hide a vault behind a wall slab. Nearby is either a bookshelf with one red book pulled out, or a skull plaque with glowing eyes and a loose jaw. Walk up to it and face it, and the lever pulls, the slab grinds up into the ceiling and the vault opens: a bonus chest, health and mana draughts, ore, candles and an old skeleton on a pile of coins. The slab and vault stay off the map until found. In co-op it opens for everyone on the floor.

## Build 2.8
- Brighter: torch lights are about 55% stronger and reach 27 m instead of 21 with a softer falloff. The ambient light is lifted and warmed, and the fog starts further away. Phones on Auto use 5 torch lights instead of 4 (Low uses 4).
- Stutter fix: compiled shaders are kept instead of being deleted and rebuilt each time the last effect using them ended. Those rebuilds caused the hitches when spells and hits fired.
- Fewer draw calls: each torch's iron bracket and handle are merged into chunked level meshes (4 fewer objects per torch). Only the flames and glow stay separate.

## Build 2.9 — low-end pass
Tested as a low-end phone: CPU slowed 4×, 800×360 touch screen, a fight on floor 8, with tracing and profiling.
- The biggest cost was not the 3D scene. It was the browser repainting the HUD: about 20 times a second the game re-wrote the same numbers, class names and hidden flags (HP, mana, gold, keys, level, the scope overlay, the boss bar), and each write made the browser re-lay-out and re-paint those parts of the screen. A small shim now skips writes that don't change anything. HUD paint work fell by about 55–70% and layout by about 70%.
- The level's walls, floors and ceilings were one mesh drawn every frame. They are now 9 m chunks that frustum and wall culling can skip.
- Shaders for the level and common effects are compiled while the floor loads instead of mid-fight.
- Result in the test: about 1.5× more frames at full resolution, and about 2× more on the CPU side alone (median frame 67–83 ms → 17–33 ms at 4× slowdown).

## Build 3.0
- First update pushed straight from GitHub. The main menu shows "Build 3.0 · NEW · auto-updated from GitHub" so you can confirm the live site has it.

## Build 3.1
- Update log: an UPDATE LOG button at the bottom left of the main menu opens a page listing every update, newest first. A gold dot shows until you've read the latest one.

## Build 3.2
- Lighting toned down to keep the dungeon mood: torch light 1.38 (was 1.75; 1.12 before 2.8), reach 24 m, the campfire at spawn at 62% light, ambient 2.1 with only a slight warm lift, and fog from 7.5 to 58 m.

## Build 3.3
- Darker: ambient 1.6 (1.9 originally) with no warm lift; torches back to their original 1.1 glow, 21 m reach and falloff; the spawn campfire at 50%; fog from 5 to 50 m.

## Build 3.4 — dungeon textures
- Walls, floors and ceilings are painted at 128 px per tile instead of 32 px blown up. Walls are irregular cut stone in about 11 courses, with recessed mortar, rounded and chipped corners, bevels lit from the top left, cracks, damp streaks and moss along the joints. Floors are worn flagstones of mixed sizes with dirt in the joints. Ceilings are rough, soot-stained blocks. The dark shaft and elevated stone get their own darker variant.
- Doors, traps and the special floors keep their art, upscaled with fine grain.
- Texture filtering: crisp up close and mipmapped at a distance, so walls no longer shimmer.

## Build 3.5
- Sealed and exit doors no longer trust a running kill counter that could drift. On approach they count the room's living enemies directly and open when none are left. Otherwise, every 3 s they wake the survivors, mark them with red light (with a message when 3 or fewer remain) and move any that are stuck inside a crate, pillar, dais or wall to a free cell.
- Textures made consistent: plain, mossy and dark walls share one stone layout, so faces line up at corners and between neighbours; tiles are 64 px in the same pixel scale as the doors, props and enemies; nearest filtering with mip levels, so the look is the same near and far.
