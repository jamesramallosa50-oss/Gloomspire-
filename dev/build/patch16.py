import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m15.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# carve the vault before the level mesh is built
rep("  /* geometry */\n  const pos=[],uv=[],nor=[],col=[],tallK=","  try{secretCarve(f);}catch(e){console.warn('secret',e);L.secret=null;}\n  /* geometry */\n  const pos=[],uv=[],nor=[],col=[],tallK=")
rep("    lvl.add(m);d.mesh=m;L.doorAt[d.y*W+d.x]=d;\n  });","    lvl.add(m);d.mesh=m;L.doorAt[d.y*W+d.x]=d;\n  });\n  try{secretSetup();}catch(e){console.warn('secret2',e);}")
# the slab does not open on approach and never shows on the map until found
rep("      if(d.type==='normal')openDoor(d);","      if(d.type==='secret'){}\n      else if(d.type==='normal')openDoor(d);")
rep("if(gr===2){const d=L.doorAt[k];g.fillStyle=","if(gr===2){const d=L.doorAt[k];if(d.type==='secret'&&d.open<.5)continue;g.fillStyle=")
rep("function updWorld(dt){\n  /* doors */","function updWorld(dt){\n  try{secretTick(dt);dimTick(dt);}catch(e){}\n  /* doors */")
rep("  else if(o.t==='gate'){if(!PVP.on&&state==='play'&&o.f===P.","  else if(o.t==='sec'){if(!PVP.on&&o.f===P.floor)try{secretOpen(true);}catch(e){}}\n  else if(o.t==='gate'){if(!PVP.on&&state==='play'&&o.f===P.")
# FOV: the slider adds less on wide screens and the lens never opens past 100 (wide) / 112 degrees vertical
rep("+((meta.fov||74)-74);\n","+((meta.fov||74)-74)*(cam.aspect>1.6?.5:.8);\n")
rep("const tf=hasOptic?baseFov:baseFov+(aimFov-baseFov)*ads;","const tf=Math.min(hasOptic?baseFov:baseFov+(aimFov-baseFov)*ads,cam.aspect>1.6?100:112);")
open(p,'w',encoding='utf-8').write(s);print('p16 ok')
