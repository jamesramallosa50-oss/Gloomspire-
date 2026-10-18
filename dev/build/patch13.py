import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m12.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# chandeliers once the level mesh and torches exist
rep("torches.push({x:s.lx,z:s.lz,g:grp,fl,fls:[fl,f2,f0],hl,sy:2.05,d:0,ph:rnd(10)});\n  });",
    "torches.push({x:s.lx,z:s.lz,g:grp,fl,fls:[fl,f2,f0],hl,sy:2.05,d:0,ph:rnd(10)});\n  });\n  try{addChandeliers();}catch(e){}")
# chandelier lights sit at the chandelier, not at torch height
rep("l.position.set(t.x,1.9,t.z);","l.position.set(t.x,t.chand?t.sy:1.9,t.z);")
# Stopped World: your shots leave the barrel, travel a short way, and hang in the air (visible) until time resumes
rep("      if(p.spd0==null){p.spd0=p.spd;p.life0=p.life-p.age;}\n      p.spd=0;\n      if(p.m)p.m.position.set(p.x,p.y,p.z);",
    "      if(p.spd0==null){p.spd0=p.spd;p.life0=p.life-p.age;}\n      if(TS&&p.from==='p'){if(p.tsd==null)p.tsd=p.age<.06?1.6:0;if(p.tsd>0){const st=Math.min(p.tsd,(p.spd0||0)*dt);const nx=p.x+p.dx*st,nz=p.z+p.dz*st;if(solidAt(nx,nz))p.tsd=0;else{p.x=nx;p.y+=p.dy*st;p.z=nz;p.tsd-=st;}}if(p.m)p.m.visible=true;}\n      p.spd=0;\n      if(p.m)p.m.position.set(p.x,p.y,p.z);")
# the King's crown no longer kills everything in one hit
rep("if(!net&&CH.id==='king')dmg=1e9;","if(!net&&CH.id==='king')dmg*=e.boss?1.35:1.9;")
# guns in the climb hit for less
rep("dmg:base*((S.blast||pel)?","dmg:(PVP.on?1:.78)*base*((S.blast||pel)?")
# aim assist: a narrower cone and shorter reach from the hip, a gentle pull, and shots bend only when you are nearly on target
rep("if(hd>((P.ads||0)>.5||P.scoped?34:11)||hd<.9)continue;","if(hd>((P.ads||0)>.5||P.scoped?28:8)||hd<.9)continue;")
rep("if(Math.abs(dy)>(e===P.lock?1.25:.95)||Math.abs(dp)>.8)continue;","if(Math.abs(dy)>(e===P.lock?.6:.42)||Math.abs(dp)>.5)continue;")
rep("if(cur){P.as=cur;cur.on=cur.ang<.2;cur.pull=!(P.lookT>0)&&cur.ang>.02;}","if(cur){P.as=cur;cur.on=cur.ang<.14;cur.pull=!(P.lookT>0)&&cur.ang>.02&&cur.ang<.32;}")
rep("const kk=Math.min(1,((firing||padFire)?3:2.2)*dt),cap=1.5*dt;","const kk=Math.min(1,((firing||padFire)?1.5:((P.ads||0)>.5?1.6:.7))*dt),cap=.75*dt;")
rep("if(s_&&s_.ang<.26&&!s_.e.dead){","if(s_&&s_.ang<.13&&!s_.e.dead){")
rep("k=s_.ang<.14?.9:.75;","k=s_.ang<.07?.6:.4;")
# enemies walk while they hunt you out of sight, and run once they see you
rep("if(mx||mz){const sp=e.spd*dt*(e.slow>0?.45:1);","if(mx||mz){const sp=e.spd*dt*(e.slow>0?.45:1)*(e.see||e.boss||e.ally?1:.62);")
# idle, walk and run gaits, chosen from how fast the body is really moving
rep("""  if(moving)e.t+=dt*e.spd*2.6;
  const s=moving?Math.sin(e.t):0,idle=Math.sin(time*2+ph);
  let lean=moving?.12:0,roll=moving?Math.sin(e.t)*.08:Math.sin(time*1.1+ph)*.03,bob=moving?Math.abs(Math.cos(e.t))*.08:idle*.025,lunge=0;
  M.legs.forEach((l,i)=>{l.rotation[M.legAxis]=(i%2?-s:s)*(ly?.7:.9)+(ly&&!moving?Math.sin(time*1.5+ph+i)*.08:0);});
  M.arms.forEach((a,i)=>{a.rotation.x=a.userData.base+(i%2?s:-s)*.75+(moving?0:idle*.08);});""",
"""  {const lx=e._ax==null?e.x:e._ax,lz=e._az==null?e.z:e._az,inst=dt>0?Math.min(14,Math.hypot(e.x-lx,e.z-lz)/dt):0;e._ax=e.x;e._az=e.z;e.vs=(e.vs||0)+((moving?inst:0)-(e.vs||0))*Math.min(1,dt*7);}
  const esc=e.sc||1,vs=e.vs/esc,wk=clamp(vs/.8,0,1),rn=clamp((e.vs/Math.max(1.2,e.spd||2.5)-.75)/.2,0,1);
  if(wk>.02)e.t+=dt*(2.4+vs*1.7);
  const s=Math.sin(e.t)*wk,idle=Math.sin(time*2+ph),br=Math.sin(time*2.3+ph);e.gait=rn>.5?'run':wk>.3?'walk':'idle';
  let lean=wk*(.05+.22*rn),roll=wk*Math.sin(e.t)*(.05+.04*rn)+(1-wk)*Math.sin(time*1.1+ph)*.035,bob=wk*Math.abs(Math.cos(e.t))*(.05+.12*rn)+(1-wk)*br*.022,lunge=0;
  const la=ly?.5+.3*rn:.62+.5*rn;
  M.legs.forEach((l,i)=>{l.rotation[M.legAxis]=(i%2?-s:s)*la+(ly?Math.sin(time*1.5+ph+i)*.06*(1-wk):0);});
  M.arms.forEach((a,i)=>{a.rotation.x=a.userData.base+(i%2?s:-s)*(.4+.55*rn)-.6*rn*wk+(1-wk)*(idle*.08+(i%2?.04:-.04)*br);});""")
rep("  g.scale.set(sxz,sy,sxz);\n  const fx=Math.sin(e.face),fz=Math.cos(e.face);","  if(e.type!=='slime'){const bq=1+(1-(wk||0))*br*.018;sy*=bq;sxz/=Math.sqrt(bq);}\n  g.scale.set(sxz,sy,sxz);\n  const fx=Math.sin(e.face),fz=Math.cos(e.face);")
open(p,'w',encoding='utf-8').write(s);print('p13 ok')
