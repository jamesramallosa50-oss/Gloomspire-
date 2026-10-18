import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:80]);s=s.replace(a,b)
# --- 1. gun hits: much softer shake / no camera bounce / short freeze only on kills. Melee keeps the full punch. ---
rep('''      shakeMag = Math.max(shakeMag, isKill ? 10.0 : (isCrit ? 7.2 : 4.5));
      var now = performance.now();
      var freezeMs = isKill ? 60 : (isCrit ? 45 : 30);
      if (now > freezeUntil) freezeUntil = now + freezeMs;

      /* Step 4b: Bounce the player back a bit! */
      recoilVel = Math.max(recoilVel, isKill ? 4.2 : (isCrit ? 3.2 : 2.4));''','''      var now = performance.now();
      var mel = now - (window.__gsMeleeT || 0) < 200;
      gsHitMel = mel;
      shakeMag = Math.max(shakeMag, mel ? (isKill ? 8.0 : (isCrit ? 6.0 : 4.0)) : (isKill ? 2.2 : (isCrit ? 1.2 : 0)));
      var freezeMs = mel ? (isKill ? 60 : (isCrit ? 45 : 30)) : (isKill ? 30 : 0);
      if (freezeMs && now > freezeUntil) freezeUntil = now + freezeMs;
      /* Step 4b: Bounce the player back a bit (melee only; on guns it read as constant shaking) */
      if (mel) recoilVel = Math.max(recoilVel, isKill ? 3.2 : (isCrit ? 2.6 : 2.0));''')
rep('''      var n2d = isKill ? 14 : (isCrit ? 10 : 7);''','''      var n2d = mel ? (isKill ? 12 : (isCrit ? 8 : 6)) : (isKill ? 6 : (isCrit ? 3 : 2));''')
rep('''      var count = isKill ? (lowFx ? 12 : 18) : (isCrit ? (lowFx ? 6 : 10) : (lowFx ? 4 : 7));''','''      var count = isKill ? (lowFx ? 8 : (gsHitMel ? 16 : 10)) : (isCrit ? (lowFx ? 3 : (gsHitMel ? 8 : 4)) : (lowFx ? 2 : (gsHitMel ? 6 : 3)));''')
rep('''    var gsFxPool = [], gsMaxFx = 48;''','''    var gsFxPool = [], gsMaxFx = 40, gsHitMel = false;''')
rep('''      if (!sparkGeo) sparkGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      if (!puffGeo) puffGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);''','''      if (!sparkGeo) sparkGeo = new THREE.BoxGeometry(0.075, 0.075, 0.075);
      if (!puffGeo) puffGeo = new THREE.BoxGeometry(0.17, 0.17, 0.17);''')
# gun hits no longer shove the monster's model around every bullet
rep('''        var pushDist = isKill ? 0.42 : (isCrit ? 0.34 : 0.24);''','''        var pushDist = mel ? (isKill ? 0.42 : (isCrit ? 0.34 : 0.24)) : (isKill ? 0.3 : (isCrit ? 0.12 : 0.06));''')
# --- 2. HUD bars no longer paint over the pause menu, the book and the shop ---
rep('#game.glgrade #vgn { display: none !important; }','#game.glgrade #vgn { display: none !important; } #hud { z-index: 0; }')
# --- 3. Android layout: lift the stick, FIRE, spells and loadout clear of the bottom bar ---
rep('''  stick:{x:.100,y:.792,s:1},
  tloadout:{x:.543,y:.852,s:.9},
  tspells:{x:.675,y:.853,s:1},''','''  stick:{x:.115,y:.665,s:1},
  tloadout:{x:.395,y:.70,s:.9},
  tspells:{x:.545,y:.70,s:1},''')
rep("  tfire:{x:.882,y:.780,s:1.5},","  tfire:{x:.885,y:.655,s:1.4},")
rep('''  meta.touchLayoutVersion=10;
}''','''  meta.touchLayoutVersion=10;
}
if(meta.touchLayoutVersion===10){meta.ctl=meta.ctl||{};for(const k of['stick','tloadout','tspells','tfire'])meta.ctl[k]=JSON.parse(JSON.stringify(DEFAULT_TOUCH_LAYOUT[k]));meta.touchLayoutVersion=11;}''')
open(p,'w',encoding='utf-8').write(s);print('p3 ok')
