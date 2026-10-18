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

## Build 3.6 — sound, the King, the last elevator, the Golden Meadow
- Audio pauses when the game is hidden, the phone goes to the home screen, the app is switched or the window loses focus (visibilitychange, pagehide, blur, freeze), and resumes on return. Every AudioContext on the page is tracked, including the hit-sound one.
- New generative music (m19.js): each track has several chord progressions, rhythm patterns and melody shapes; every few bars it picks a new progression and writes a new phrase, with an echo bus for a stone-hall sound. Tracks: title, explore, camp, combat, boss and a new meadow track. The constant 55 Hz drone is replaced by a quiet, slowly moving cave-air noise.
- New sound effects: footsteps (stone or grass), jump, landing, coins, low-health heartbeat, UI clicks, chest, portal, and dungeon ambience (drips, chains, wind, creaks, moans, rumbles) panned left and right; birdsong and breeze in the meadow.
- Floor 51 King: a boss phase-up sets a 2 s shield (8% damage taken) that was only counted down by the boss-model animation, which the King's human model never runs, so the shield never ended. It now ends on a timer for every boss. The King no longer gets phase armour, has 60% of his former health, and his Mend, Rewind and Pact heals are 2-5% at most once every 15 s.
- The King of Gloomspire character's one-hit kill is restored.
- Cutscene on the final elevator (m20.js): letterbox, your character walks onto the lift, turns back to the tower and rises in the green light, then a fade to the meadow. A Skip button ends it.
- Golden Meadow: castle, village, path and old trees are merged into a few meshes (about 250 draw calls down to a few dozen), which pays for oaks, pines, birches, rocks, a fenced path with lantern posts, wind-swayed instanced grass, flower patches, fireflies, butterflies, two layers of horizon mountains, a sun glow and richer ground colours. Grass, flowers, trees and fireflies are reduced on touch devices.

## Build 3.7 — friendlier dungeon music
- The music generator (m19.js) now writes adventure-RPG dungeon music instead of horror: Dorian minor with a major V for cadences (no flat-II or tritone chords), triangle pads instead of detuned sawtooth drones, a constant lute/harp arpeggio, a walking bass, and a melody built as motif → answer → motif → cadence on the chord root. Calm tracks use a soft hand drum; combat and boss use a march with a harmonic-minor scale. The random high plinks and eerie choir are gone.
- Ambience is reduced to soft water drips and torch crackle every 7-15 s; moans, rumbles, creaks, chains, wind and the cave-air noise bed are off, and the low-health heartbeat is removed.

## Build 3.8 — game modes and Horror
- Main menu: a GAME MODES page (m8.js) with picture cards: Classic Climb and Horror. The pictures are small JPEGs embedded in m21.js (`gmPics`).
- Horror (m21.js + patch23.py): its own scene rendered in the main frame loop (`state==='horror'`). The corridor is generated in chunks of 8 tiles (4 m tiles, heading north, east or west, never south, so it cannot cross itself), with wide halls now and then; 3 chunks are kept ahead and everything more than one chunk behind is deleted and its geometry disposed. Walls, floor and ceiling use the game's stone painters (`dtStone`). Traps: spikes (rattle, then rise; jump them) and swinging blades. Potions heal 30.
- The demon follows the player's breadcrumb trail. Speed starts at 4.6 m/s and creeps up to 6.35; it closes in fast when more than 18 m behind. Walk 4.1, sprint 6.7 with stamina. A good run reaches about 1 km.
- The demon model (`assets/horror/demon.glb`) is the uploaded model at full detail (484k vertices, 858k triangles, 2048 px texture), packed losslessly with meshopt (`gltfpack -noq -cc -kn -km -ar 16 -at 24 -as 24`): 40 MB down to 17 MB. It is loaded with three.js r128 GLTFLoader + meshopt decoder from `assets/horror/gltf.js`, only when Horror starts. Texture: mipmaps, linear filtering and anisotropy, so it does not shimmer. One skinned mesh, never frustum-culled.
- Idle animation: built at load time from the run clip (`hzIdleClip`): the average pose of every run frame, plus breathing, head turns and arm sway; idle and run are cross-faded by the demon's speed.
- Horror renders at up to 540 px tall (360 if the frame rate stays under 24) instead of the climb's 240, so the demon keeps its detail.
- Service worker: files in `assets/` are served cache-first from `gloomspire-assets-v1`, which survives game updates. If the demon file ever changes, rename it or bump that cache name.

## Build 3.9 — Horror fixes and Hide & Seek
- Horror corridor: the next step of the path is decided before a piece is built (`hzPickDir`, `G.next`), so the last tile of each piece is built with its exit open. Before, the exit was decided only when the next piece was generated, after the walls had been built, so a wall stood across the path at every piece boundary while the collision let you through. Test: every tile's built doorways match its live doorways.
- Demon AI (shared): `hzLos` (sight through tile doorways, blocked by tall obstacles), `hzLosW` (body-wide sight line), `hzPath` (breadth-first route over tiles) and `hzNav` (straight when the way is clear, otherwise along the route, skipping corners it can see past; follows tile middles for a moment if it gets wedged). In Horror it chases your current position instead of your old trail, so it no longer turns back. Speed 5.3 rising to 6.4 m/s, 6.8 when 9-14 m behind, 8.4 when further. You: walk 4.3, sprint 7.0.
- Hide & Seek (`hsBuild`, `hsWorld`, `hsDemon`): a 16x16-tile (64 m) dungeon. A 6x6-tile great hall with 8 pillars, a candle altar, 4 braziers and crate stacks; up to 10 side rooms; a maze of passages from a randomised spanning tree with extra loops; 8 extra hall entrances. Up to 16 wardrobes in rooms and dead ends, 5 relics placed far apart, an exit gate on the outer wall far from the start that opens after the fifth relic.
- The demon's senses and states: a 140° view that reaches 21 m with your light on, 10 m with it off (3 m less crouching); suspicion that builds faster the closer you are; hearing (run 17 m, walk 6.5 m, crouch silent, a relic 11 m, wardrobe doors 4-5 m, halved through walls); chase, then search from your predicted position (last seen position plus your velocity) through nearby tiles and wardrobes; it always checks a wardrobe it saw you enter; a heat map of where it has seen you; a hunch about your rough location every 20-32 s; an ambush near the gate after the fifth relic; 7% faster per relic.
- The player: crouch (C), light on/off (F), hide or leave (E), sense (Q, a 3 s arrow along the real route, 12 s cooldown), with touch buttons for each. Best escape time is saved.

## Build 3.10 — solid walls and a horror soundscape
- Thick walls in both horror modes (m21.js `hzBuildChunk`, `hzPost`, `hzWallAt`): each wall face sits `HZW` = 0.2 m inside its tile, so a wall between two tiles is 40 cm thick, and a 40 cm stone post is built at every grid corner where a wall ends or turns (not along straight runs). Torches, wardrobes and blood writing moved in to match. Collision (0.32 m from tile edges) is unchanged.
- Horror soundscape (`hzAmb`): the generative music switches to a `silent` track and the mode plays its own: a 4-oscillator low drone through a resonant low-pass that opens with fear, semitone string-cluster swells, a detuned music box, whispers, metal scrapes and slams, and phantom footsteps. When fear is high (the demon close or hunting): pounding drums and tremolo string shrieks. Music parts go through the music bus (they follow the Music setting); the scares are sound effects.
- Jumpscares: `hzSting` (four detuned sawtooth "violins" with vibrato and a low hit) when the demon comes into view within 14 m in Horror, or spots you in Hide & Seek; `hzScream` (distorted shrieks, noise crash and a sub-bass drop through a tanh wave shaper) when it catches you.
- Looks: animated film grain and a permanent dark vignette (CSS), torch and lantern flicker scaled by fear, and blood-written messages on some walls (8 canvas textures, 6-8% of wall tiles).

## Build 3.11 — gimmicks for both horror modes
- Horror (run): slide (C / SLIDE, 0.8 s at 1.12x speed, 1.05 s cooldown, camera at 0.72 m) passes under pendulum blades (hit only if the blade is below 0.95 m while sliding) and the new guillotine (`guil`: a 2.4 s cycle, it slams down to a 0.95 m lower edge and holds; hits anything with its head above the edge). Collapsing floor (`pit`): the tile has its own floor slab with a crack decal; 0.6 s after you step on it, it falls, and standing in the hole is death ("YOU FELL"). Sprinting crosses it in time, or jump the open hole. Trap types are chosen before a piece is built (`t.trapK`); the rate rises from 20% to 34% with distance, and pits only appear after 60 m.
- Horror pickups: potion (+30), holy water (stuns the demon for 3.5 s if it is within 9.5 m and in sight, max 3, start with 1), adrenaline (5 s of free sprint at 1.2x). Events every 38-60 s (`hzEvents`): lights out 7 s, enraged (+1.1 m/s) 7 s, silence (no footsteps) 9 s. Every 250 m: a banner and +15 health.
- Hide & Seek: 2 cursed relics (orange glow) among the 5 true ones: a 60 m noise, a sting and 10 s of rage. SENSE ignores them. Relic curses (random): darkness 18 s, the demon investigates near you, or rage 15 s. Stones (start 3, piles of +2): thrown up to 4-14 m along your view, a 20 m noise where they land. Holy candles (2 in the map): stun 4.5 s within 7 m, then it searches from where it stands. Breath (hold Space / HOLD BREATH while hidden): 20 per second drain, 14 per second regain, gasping when empty is a 7 m noise. The demon hears breathing within 3.3 m and checks your wardrobe; a check fails while you hold your breath, unless it saw you get in.

## Build 3.12 — recorded jumpscare
- The owner's jumpscare recording (5 s stereo WAV, 880 KB) is converted to `assets/horror/jumpscare.mp3` (192 kbps, 119 KB). `hzLoadScare` fetches and decodes it when a horror mode starts; `hzScream` plays it through the master bus at 1.3x when the demon catches you, and falls back to the synthesised shriek if it has not loaded. Served cache-first by the service worker like the demon model.

## Build 3.13 — the horror modes use the climb's settings and controls
- patch24.py lets the climb's own input code drive the horror modes while `hzLook()` is true (a horror mode is running, not paused, not dead): mouse look, touch stick and touch look (`touchMove`, `lkId`), phone gyro (`gyroApply`), and the controller (`pollPad`: look and flick stick are the climb's own code, then `hzPad` maps the player's button bindings; A or Start resumes from pause). The view direction is shared through `P.yaw`/`P.pitch`, synced both ways by the `horTick` wrapper (the old horror-only mouse and touch handlers are gone).
- Touch: the player's own `#touch` layout is shown (the rest of the HUD is hidden with `#hud.hzmode`) and relabelled per mode (`HZSKIN`, `hzSkin`): buttons are routed by a capture-phase pointerdown listener so the climb actions never fire; labels and visibility are restored on exit. `ttalk` is the contextual HIDE/LEAVE button; `tfire` is SPRINT, or BREATH while hidden.
- Settings: field of view from `meta.fov` with the climb's formula and sprint/slide kick; render height scaled by `qFactor()` (graphics quality); sprint the same way as the climb (Shift, the run toggle, holding FIRE, or the stick pushed fully forward); `meta.flash===false` turns off the red and white screen flashes.

## Build 3.14 — the climb's pause screen in the horror modes
- `hzPause` now opens the game's own `#pause` screen (state `pause`, so the frame loop stops exactly as in the climb) with a progress line in place of "The torches keep burning." and an added "Try again" button (`#hzretry`). patch24.py makes `resume()` and `quitToMenu()` hand back to the horror mode when one is running. Customize touch controls works from there: the climb's own labels are shown while editing and the horror labels come back on resume (`hzSkin`, with HUD visibility split into `hzHud`). Escape, P, Enter and the controller resume as in the climb.

## Build 3.15 — THE FACILITY replaces the endless Horror run
- The Horror card now starts `horStart('fac')`. The old endless corridor code is still in m21.js (`horStart('run')`) but no card leads to it. Hide & Seek is unchanged.
- **Plan and builder (m22.js).** The map is hand-made in `facPlan`: three levels (`FCY` = floor heights 8 / 4 / 0), rooms, doors, arches, holes and stairs as rectangles in metres on a 0.5 m grid. `facGrid` turns them into columns of open air intervals (`W.G.iv`, up to 6 per column) plus a kind-of-space grid per level; walls, floors, ceilings, ledges and slab edges all come from where air meets solid (`facGeomWorld`), so nothing is paper-thin. Switchback stairwells (`sw`), straight stairs (`sst`), the atrium's metal stair, railings (`rail`, colliders follow the slope), props (`facProps`: crates, racks, desks with CRTs, shelves, lockers, tanks, pumps, pipes, cables, rubble, signs and painted decals) are boxes and cylinders. Geometry is gathered per 8 m chunk and per material with shared vertices.
- **Light bake (m22.js `facBake`).** Every vertex gets the light of the tubes that reach it (three samples per tube, voxel ray-march for shadows, props let some light through), a floor bounce under each tube, and ambient occlusion. Red emergency lamps go to a second channel (`bake2`) so they stay on when the power fails. The dominant light direction is stored too, so normal maps still read under baked light. `facProbe` gives light at a point for the creature and your hand. About 0.5 s on a desktop, a few seconds on a phone, behind the loading bar.
- **Looks (m23.js).** Textures are painted in code with normal maps (`facTextures`: board-formed concrete, plaster over a red dado mapped by height, tiles, troweled concrete, stained ceiling, diamond plate, painted steel, the door) and a canvas prop atlas (`facAtlas`, `FAT` regions). One shader (`FAC_VS`/`FAC_FS`) for every surface: baked light x power + emergency light + flashlight cone, flashlight highlights, blurred reflections of the 4 nearest tubes on wet floors (`uRL`/`uRA`/`uRC`), exp2 fog, a soft tone curve. Decals blend 2x onto the surface behind. `facPost`: a WebGL2 4x multisampled target, then one pass for colour fringing, grain, vignette, fear tint and fades. Light shafts under some tubes, dust motes that only show inside the beam, a faint beam cone, and the hand-held flashlight drawn after the world (`facHand`).
- **Systems (m24.js).** Collision: a capsule (radius 0.3, from 0.46 m above the feet to the head) against grid columns, boxes and door leaves, in small sub-steps with slide-along-walls; a step that cannot be resolved is undone, so you can never end up inside anything. `facGround` handles stairs (step up 0.46, follow down 0.52) and ledges (fall, land, stagger). Doors are leaves on a hinge with a damped spring (`facDoorsTick`): they open away from whoever opens them, stop against bodies, latch or slam shut, and swing freely when a body leans on them (`pushW`). Navigation: walkable spots every 0.5 m (floors, steps, landings) linked in pairs, with railings and prop edges checked between them, plus leap links (gallery gap, broken floor); A* with a closed set; `facWalkLine` lets the creature cut corners where its body fits.
- **Gameplay (m25.js).** You: walk 3.15, sprint 5.9 (5.2 s of stamina, a breath before it refills, exhausted below zero), crouch 1.65; inertia and sprint-turn momentum; head bob, lean, exhaustion and fear tilt; flashlight battery (5 min, +50% per battery, flicker when low). The creature: prowl, investigate (noise), search (last known position), chase (5.05 m/s + 0.22 per fuse, +0.45 at the end), bash doors, leap links; sight depends on the light where you stand, your flashlight (especially pointed at it), crouching and cover (crates hide you only if your head is covered); hearing from footsteps, doors, falls and pickups (halved through walls). The director (`facDirector`, `facAmbush`): the opening peek at the stairwell door, rest periods, and after a long quiet an ambush that the place explains: behind a door ahead, in a vent above (you hear it first), round a corner, or on the floor above/below staring at you. Each fuse alerts it; after the breaker the lights fail, the alarm sounds, it always knows where you are, and the lift takes 42 s.
- **Sound.** Room tone, duct air and tube hum near lights; the creature's sounds go through one chain that follows it (pan, distance, low-pass when there is no line of sight); a belt radio whose static rises as it gets closer, plus broken-up voices; heartbeat and breathing; door creaks, latches, slams and rattles; chase drums and string shrieks on the music bus.
- **Retry and memory.** `FACW` keeps the built world (geometry, baked light, textures, materials) while you retry, so Try again is instant; going back to the menu disposes everything. Pause mutes the facility's sound. Test hooks: `window.__facManual`/`__facStep` (step frames by hand), `__facHideDm` (do not draw the creature, for swiftshader), `__hzRH` (render height).
- **Editing the map.** Change `facPlan` / `facProps` in m22.js and rebuild; check the layout with a top-down render of `W.G` (open air at each level's floor height) before testing in 3D. Keep ceilings at least 0.4 m below the next floor (otherwise the slab disappears), doors 1 m wide (the creature's body is 0.32 m), and give every new rail a collider through `rail()`.

## Build 3.16 — The Facility made to look and play like its reference video
The owner re-sent the original Facility request with the reference video. 3.15 was compared with the video frame by frame (colour levels measured on both) and moved much closer to it.
- **Light (m22).** `FLC.cyan` is strongly teal (.2,.8,1): the reference's concrete zones have almost no red. `FLC.warm` is less orange. New `FAMB` table: ambient light by zone (teal in the concrete, warm in the offices), so shadows are never black. Warm tubes 4.1 (was 2.7), cold tubes 3.2 (was 2.9), floor bounce .27 (was .2). Ceiling vertices within 2.6 m of a ceiling tube get a wash, so ceilings glow round the fixtures. The generator room (level 1) is lit by red tubes on the emergency circuit, like the reference's red room.
- **Textures (m23).** Board-formed concrete rebuilt: ten 0.3 m boards per 3 m, each with its own tone and a faint grain, thin seams, butt joints, a few tie marks, very few pores, mottling and damp streaks (3.15 was pitted). Floor tiles are 0.8 m (3 x 3 per 2.4 m) with speckle and thin grout. Plaster: fewer cracks and peels. Server racks carry coloured equipment. New atlas region `shutter`: two roll-up shutters on level 0 (`facProps`). Office doors on level 0 are `green`, with brass levers and a deadbolt (m24 `facDoorGeo`). The hand-held flashlight is red.
- **Glow (m23 `facGlows`).** One mesh of camera-facing quads, one per working light, pulled up to 0.55 m toward the camera so the ceiling does not cut them in half; walls in between still hide them. Fades close up, with fog and with the power (red lamps follow the emergency circuit). Kept in `FACW.halo`.
- **Colour grade (m23 `facPost`, m25 `facCam`).** A mild S-curve, then `uZone` (0 = teal concrete, 1 = warm office; from the red/blue ratio of the light probe where you stand, smoothed) decides whether the darks lose their red and sink to teal or lift warm. Saturation 1.1.
- **Feel (m25).** Dynamic resolution (`F.rs` 0.5–1, phones start at 0.85): every 1.2 s the render height steps down 13% if frames average over 19.5 ms, and up 6% after three good checks under 13.5 ms; never below 360 lines; off while `__hzRH` or manual stepping is in use. `facCam` no longer allocates vectors every frame. A falling body is pushed out of slab edges (the collision fuzz found a 5 cm clip when dropping past the gallery edge). Sight subtracts the new ambient (`amb0`) so dark corners hide you as well as before.
- **Director (m25).** New `cross` sighting from `facAmbush`: it sprints (6.2 m/s) from a hidden spot beside the corridor 9–18 m ahead of you to a hidden spot on the other side, then leaves; if it saw you within 11 m it turns and chases 40% of the time. Rests are shorter (14–21 s after the opening peek, 10–19 s after prowling) and ambushes come at 38 s, then every 32–54 s of quiet.
- **Bugs found by the new tests and fixed (m25).** (1) Sprint speed crept up: the turn-momentum code also replaced the target speed with `cur+(tg-cur)*dt*5`, so with the normal acceleration on top a sprint took about 4 s to reach 5.9 m/s and the creature (4.75+) caught players who were sprinting. Now momentum only limits how fast the running line turns; sprint acceleration k=3.6 (full speed in about 1 s), and a reversal of more than 110 degrees is a quick pivot (k=13). (2) Walking into a closed door never opened it: the push test read your speed after the door had already stopped you. It now reads what you are trying to do; sprinting into a door bangs it open (fast, noisy). (3) `facDmGo` reported 'there' when the creature passed under its goal on the floor below (horizontal distance only): it then searched, and the director teleported it for an ambush. Arrival now needs the same floor. (4) The quiet timer started at -99 s, so the first prowl or search set off an ambush at once; it now counts from the start of the run. (5) A corner ambush now roars and stings as it starts, so you can react.
- **Tests.** `mkexp.sh` also exposes `__g.fac` (facility internals: `facPush`, `facGround`, `facPath`, `facUse` and more) and `__g.FACW`. A collision fuzz (70 random spots, 4 s of random walking, sprinting, crouching and turning at 60 Hz) found no penetration into walls, props, rails or door leaves and no crossing of a closed door. `facDie` checks `window.__facNoDie` in the test copy only, so a bot can play on after being caught. The scripts are in `dev/tests/` (screenshots, collision fuzz and bot playthrough, walk tests, smoke test).
