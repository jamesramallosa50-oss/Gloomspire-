import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:100]);s=s.replace(a,b)
mod=open('/home/claude/tools/m11.js',encoding='utf-8').read()
# old gate model kept under another name; the new one lives in m11
rep("function openGate(x,z,yaw,mine,owner,dest){\n  const own=owner||'me';","function openGate_old(x,z,yaw,mine,owner,dest){\n  const own=owner||'me';")
rep("const sc=1+.05*Math.sin(g.age*6);g.g.scale.set(sc,sc,sc);g.ring.rotation.z+=dt*1.6;g.disc.material.opacity=.42+.14*Math.sin(g.age*5);for(const r of(g.runes||[]))r.rotation.y+=dt*2.2;","gateAnim(g,dt);")
# projectiles frozen by a time stop are released once no stop is running (they used to hang in the air forever)
rep("      if(p.m)p.m.position.set(p.x,p.y,p.z);\n      continue;\n    }\n    p.age+=dt;let dead=p.age>p.life;",
    "      if(p.m)p.m.position.set(p.x,p.y,p.z);\n      continue;\n    }\n    if(p.spd0!=null){p.spd=p.spd0;p.spd0=null;if(p.life0!=null){p.life=p.age+p.life0;p.life0=null;}}\n    p.age+=dt;let dead=p.age>p.life;")
# any three-spell ultimate with Haste in it is Stopped World
rep("function castFusion(ids){\n  if(ids.includes('raise'))return;","function castFusion(ids){\n  if(ids.includes('raise'))return;\n  if(ids.length===3&&ids.includes('haste')&&castHasteStop(ids))return;")
rep("const util=ids.includes('raise')||ids.includes('lastgate'),","const util=(ids.includes('raise')||ids.includes('lastgate'))&&!(ids.length===3&&ids.includes('haste')),")
# Last Gate and Haste wait a moment on the first tap, so a double tap starts a fusion instead of casting the spell
rep("  P.tapId=id;P.tapT=time;\n  if((P.cds[id]||0)>0)return;",
    "  P.tapId=id;P.tapT=time;\n  if(!P.echo&&!P.tapHold&&(id==='lastgate'||id==='haste')&&barSpells().length>=2&&!(PVP.on&&pvMode()==='gun')){const t0=time;after(.46,()=>{if(P.tapId===id&&P.tapT===t0&&!P.arm&&state==='play'){P.tapHold=true;try{cast(id);}finally{P.tapHold=false;}}});return;}\n  if((P.cds[id]||0)>0)return;")
# King: quiet component casts during a named fusion, and a four-step cycle through every kind of ultimate
rep("floatText(e.x,e.y+e.h+.7,e.z,tag,'crit');ringFx(e.x,e.z,.35,2.4,hex,.35,.5);sfx('bell');","if(!e.kingQuiet)floatText(e.x,e.y+e.h+.7,e.z,tag,'crit');ringFx(e.x,e.z,.35,2.4,hex,.35,.5);sfx('bell');")
rep("""  }else if(phase===1){
    kingUltVolley(e,2);
    e.kingPhase=2;
    e.kingCast=1.15;
  }else{
    kingUltVolley(e,3);
    e.kingPhase=0;
    e.kingCast=.72;
  }""","""  }else if(phase===1){
    kingFusion(e,2);
    e.kingPhase=2;
    e.kingCast=1.15;
  }else if(phase===2){
    kingFusion(e,3);
    e.kingPhase=3;
    e.kingCast=1.3;
  }else{
    kingUltVolley(e,1);
    e.kingPhase=0;
    e.kingCast=.72;
  }""")
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
open(p,'w',encoding='utf-8').write(s);print('p11 ok')
