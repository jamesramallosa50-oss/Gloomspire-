import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m19.js',encoding='utf-8').read()+'\n'+open('/home/claude/tools/m20.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")

# --- sound ---
# every audio context the page makes is remembered, so all of them can be paused when the game is left
rep("<script>/* low-end pass","<script>(function(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;window.__ACS=[];var W=function(o){var c=o?new A(o):new A();window.__ACS.push(c);try{if(document.hidden)c.suspend();}catch(e){}return c;};W.prototype=A.prototype;window.AudioContext=W;if(window.webkitAudioContext)window.webkitAudioContext=W;}catch(e){}})();</script>\n<script>/* low-end pass")
# no more constant hum; echo bus, cave air, background pause, new sound effects
rep("    const o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain();\n    o.frequency.value=55;o2.frequency.value=57.5;o2.type='triangle';g.gain.value=.045;\n    o.connect(g);o2.connect(g);g.connect(master);o.start();o2.start();\n    MUS.gain=AC.createGain();MUS.gain.gain.value=MUS.on?MUS.vol:0;MUS.gain.connect(master);MUS.next=AC.currentTime+.1;setInterval(musTick,70);",
    "    MUS.gain=AC.createGain();MUS.gain.gain.value=MUS.on?MUS.vol:0;MUS.gain.connect(master);MUS.next=AC.currentTime+.1;setInterval(musTick,70);\n    try{mzInit();mzAir();}catch(_){}try{audioWatch();uiClickSnd();}catch(_){}")
# the new music engine
rep("const T_=TRK[MUS.trk];if(MUS.on&&!muted)musStep(T_,MUS.step,MUS.next);","const T_=mzTrk(MUS.trk);if(MUS.on&&!muted)mzStep(T_,MUS.step,MUS.next);")
rep("if(state!=='play')return;\n  if(bossE","if(state!=='play')return;\n  if(OPEN){MUS.want='meadow';return;}\n  if(bossE")
# footsteps you can hear, and the sound watcher (jumps, landings, coins, heartbeat, ambience)
rep("noise(.05,.045,380);","if(SFX.step)SFX.step();else noise(.05,.045,380);")
rep("musPick(dt);mpTick(dt);","musPick(dt);try{sndTick(dt);}catch(_){}mpTick(dt);")

# --- the floor 51 King ---
rep("e.kingSelfCast=true;after(.08,()=>{if(e&&!e.dead)e.kingSelfCast=false;});","e.kingSelfUntil=time+.08;")
rep("if(e&&e.kingSelfCast)return;","if(e&&e.kingSelfUntil>time)return;")
rep("if(id==='mend'){e.hp=Math.min(e.maxHp,e.hp+e.maxHp*(ultimate?.25:.1));return;}","if(id==='mend'){kingHeal(e,ultimate?.05:.03);return;}")
rep("if(id==='rewind')e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.12);","if(id==='rewind')kingHeal(e,.03);")
rep("e.hp=Math.min(e.maxHp,e.hp+d*.8);","kingHeal(e,.02);")
rep("e.hp=e.maxHp;e.b2arm=1;","if(e.type==='king')e.maxHp=Math.round(e.maxHp*.6);e.hp=e.maxHp;e.b2arm=1;")
rep("e.b2shT=2.2;e.b2arm=.08;","e.b2shT=2.2;e.b2arm=.08;e.b2armT=time+2.4;")
rep("if(e.boss&&e.b2arm!=null&&e.b2arm<1)dmg=Math.max(1,Math.round(dmg*e.b2arm));","if(e.boss&&e.b2arm!=null&&e.b2arm<1&&bossArm(e)<1)dmg=Math.max(1,Math.round(dmg*e.b2arm));")
rep("e.b2arm=b?[1,.85,.7][b.ph]:1;","e.b2arm=b&&e.type!=='king'?[1,.85,.7][b.ph]:1;")

# --- cutscene on the last elevator ---
rep("after(.45,()=>startEndingScene());","after(.45,()=>endCutStart());")
rep("  }else if(state==='dead'){useShaft=true;}","  }else if(state==='cut'){try{endCutTick(dt);}catch(e){console.warn(e);endCutEnd();}updParticles(dt);\n  }else if(state==='dead'){useShaft=true;}")

# --- the Golden Meadow ---
rep("    b.position.set(-14+rnd(0,22),40+rnd(0,12),-6+rnd(0,16));world.add(b);}\n}","    b.position.set(-14+rnd(0,22),40+rnd(0,12),-6+rnd(0,16));world.add(b);}\n  try{meadowPlus(world,sky);}catch(e){console.warn('meadow',e);}\n}")
rep("openT+=dt;","openT+=dt;try{meadowTick(dt);}catch(_){}")
rep("if(openRoot)scene.remove(openRoot);","MDW=null;if(openRoot){scene.remove(openRoot);mdDispose(openRoot);}if(openSky)mdDispose(openSky);")
open(p,'w',encoding='utf-8').write(s);print('p22 ok')
