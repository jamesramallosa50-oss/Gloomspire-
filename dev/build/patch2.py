import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(s.count(a),a[:70]);s=s.replace(a,b)

FX=r'''
/* ===== FX PACK: punchier gunfire, melee and spells. Everything here is pooled: no new materials or lights per shot. =====
   Gun:   muzzle flash on the barrel + light pop, smoke, ejected shells that stay on the floor, tracer tails, wall sparks, blood sprayed in the bullet's direction.
   Melee: a slash arc that sweeps across the view, an impact star and a spark fan on the target, a short hit freeze.
   Spell: a cast ring at the hand + floor whoosh, squash-and-stretch projectiles with a lagging core trail, a white-hot burst on impact, embers left on the target. */
const FXA=(hex,op,dt)=>new T.MeshBasicMaterial({color:hex,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,depthTest:dt!==false,side:T.DoubleSide,fog:false});
const fxLow=()=>{try{return !gameEl.classList.contains('gfx');}catch(e){return false;}};
const hex2c=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255],c2hex=c=>((Math.min(255,c[0]*255)|0)<<16)|((Math.min(255,c[1]*255)|0)<<8)|(Math.min(255,c[2]*255)|0);
/* muzzle flash: a star of crossed quads + a white core + side flames, parented to the gun */
const mzMatA=FXA(0xffc060,1,false),mzMatB=FXA(0xffffff,1,false),mz=new T.Group();
{const q=(w,h,m,rx,ry,rz)=>{const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.rotation.set(rx||0,ry||0,rz||0);mz.add(o);return o;};
 q(.42,.07,mzMatA);q(.07,.42,mzMatA);q(.3,.05,mzMatA,0,0,.785);q(.3,.05,mzMatA,0,0,-.785);q(.11,.11,mzMatB,0,0,.785);
 const s1=q(.36,.08,mzMatA,0,Math.PI/2,0);s1.position.z=-.15;const s2=q(.36,.08,mzMatA,Math.PI/2,Math.PI/2,0);s2.position.z=-.15;}
mz.visible=false;mz.renderOrder=5;vm.add(mz);
const MZP=new T.Vector3(0,.05,-.6);let mzT=0,mzD=.05;
function fx2Muzzle(){try{
  if(!vmM||!vmM.g)return;vm.updateMatrixWorld(true);const inv=new T.Matrix4().copy(vm.matrixWorld).invert(),bb=new T.Box3();let best=null,bz=1e9;
  vmM.g.traverse(m=>{if(!m.isMesh||!m.geometry)return;const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();bb.copy(g.boundingBox).applyMatrix4(m.matrixWorld).applyMatrix4(inv);
    if(bb.min.z<bz-.005||(Math.abs(bb.min.z-bz)<.005&&best&&bb.max.y>best.max.y)){bz=bb.min.z;best=bb.clone();}});
  if(best){MZP.set((best.min.x+best.max.x)/2,(best.min.y+best.max.y)/2,best.min.z-.02);}
}catch(e){}}
/* slash arc in front of the camera: a curved ribbon whose bright head sweeps along it, the tail lagging behind */
const slMat=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
  uniforms:{col:{value:new T.Color(0xfff0c0)},head:{value:0},op:{value:0}},
  vertexShader:'attribute vec2 ae;varying vec2 vA;void main(){vA=ae;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 col;uniform float head,op;varying vec2 vA;void main(){float a=vA.x;if(a>head)discard;float t=smoothstep(head-.85,head,a);float e=sin(vA.y*3.14159);float k=t*t*pow(e,.6)*op;vec3 c=mix(col,vec3(1.),smoothstep(head-.18,head,a)*.8+(1.-abs(vA.y*2.-1.))*.25);gl_FragColor=vec4(c*k,k);}'});
const slash=(()=>{const N=24,pos=[],ae=[],idx=[],th0=-.3,th1=1.9;
  for(let i=0;i<=N;i++){const a=i/N,th=th0+(th1-th0)*a,w=.05+.22*Math.sin(a*Math.PI*.92+.1),r0=.62-w*.5,r1=.62+w*.5;
    pos.push(Math.cos(th)*r0,Math.sin(th)*r0,0,Math.cos(th)*r1,Math.sin(th)*r1,0);ae.push(a,0,a,1);
    if(i<N){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('ae',new T.Float32BufferAttribute(ae,2));g.setIndex(idx);
  const m=new T.Mesh(g,slMat);m.frustumCulled=false;m.visible=false;m.renderOrder=6;vmScene.add(m);return m;})();
let slT=-1,slD=.3,slN=0;
/* cast ring at the casting hand */
const crMat=FXA(0xffffff,0,false),castRing=new T.Mesh(new T.RingGeometry(.7,1,28),crMat);castRing.visible=false;castRing.renderOrder=6;vmScene.add(castRing);
const crCore=new T.Mesh(new T.CircleGeometry(.55,20),FXA(0xffffff,0,false));crCore.renderOrder=6;castRing.add(crCore);
let crT=-1;
/* impact stars in the world (4 pooled), always facing the camera */
const STARS=[];for(let i=0;i<4;i++){const g=new T.Group(),m=FXA(0xffffff,0);for(const r of[0,1.5708,.785,-.785]){const q=new T.Mesh(new T.PlaneGeometry(r%1.5708?.7:1,r%1.5708?.09:.14),m);q.rotation.z=r;g.add(q);}
  g.visible=false;g.renderOrder=4;scene.add(g);STARS.push({g,m,t:0,d:.12,s:1});}
let starI=0;
function fx2Star(x,y,z,hex,s,d){const S=STARS[starI=(starI+1)%STARS.length];S.g.position.set(x,y,z);S.m.color.setHex(hex);S.s=s;S.d=d||.12;S.t=S.d;S.g.visible=true;S.g.rotation.z=Math.random()*3;}
const EMB=[];
/* ---- hooks ---- */
function fx2Fire(C,V,pel,a){
  const low=fxLow(),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),ox=P.x+rx*.16+a.x*.55,oy=EY-.12+a.y*.55,oz=P.z+rz*.16+a.z*.55,kind=C.kind;
  const big=kind==='rocket'?1.7:kind==='slug'?1.5:pel?1.45:(V.cd||.2)<.12?.85:1;
  if(kind!=='bolt'&&kind!=='arrow'){mz.visible=true;mzD=kind==='rocket'?.09:.05;mzT=mzD;mz.position.copy(MZP);mz.rotation.z=Math.random()*6.283;mz.scale.setScalar(big*(.36+Math.random()*.14));
    mzMatA.color.setHex(kind==='rocket'?0xff8a30:kind==='slug'?0xbfe8ff:0xffc060);
    flash(ox,oy,oz,kind==='slug'?0xbfe8ff:0xffb050,.45+.25*big);}
  /* sparks out of the barrel, a puff of smoke */
  const n=low?1:2;for(let i=0;i<n;i++)spark(ox,oy,oz,a.x*rnd(5,9)+rnd(-1,1),a.y*rnd(5,9)+rnd(-.5,1),a.z*rnd(5,9)+rnd(-1,1),.09,[1,.85,.45],0);
  /* the spent shell flies out to the right and stays on the floor */
  if(kind==='bullet'||kind==='pellet'||kind==='slug'){const sx=P.x+rx*.2+a.x*.22,sz=P.z+rz*.2+a.z*.22;
    spark(sx,EY-.25,sz,rx*rnd(1.6,2.6)+rnd(-.3,.3)-a.x*.3,rnd(1.6,2.6),rz*rnd(1.6,2.6)+rnd(-.3,.3)-a.z*.3,3,pel?[.85,.18,.12]:[1,.76,.28],1.1,true);}
}
function fx2Proj(o){const m=o.m;if(!m)return;
  if(GK[o.kind]&&o.kind!=='rocket'){m.scale.set(1.3,1.3,o.kind==='slug'?1.4:2.8);}
  else if(o.kind!=='breath'&&o.kind!=='cleaver'&&o.kind!=='wave'&&o.kind!=='rocket')o.fx2s=1;}
function fx2Stretch(p,dt){const k=Math.exp(-p.age*6),st=1.2+1.1*k,w=1/Math.sqrt(st)+.12*Math.sin(p.age*30)*k;p.m.scale.set(w,w,st);
  if(p.trail&&(!fxLow()||(p.age*60|0)%2===0)){const c=p.trail;spark(p.x-p.dx*.18,p.y-p.dy*.18,p.z-p.dz*.18,rnd(-.15,.15),rnd(-.1,.15),rnd(-.15,.15),.16,[Math.min(1,c[0]*.5+.6),Math.min(1,c[1]*.5+.6),Math.min(1,c[2]*.5+.6)],0);}}
function fx2GunHit(p,e){
  const c=(e.D&&e.D.blood)||[.6,.05,.05],n=fxLow()?2:4,hx=p.x,hy=p.y,hz=p.z;
  for(let i=0;i<n;i++)spark(hx,hy,hz,p.dx*rnd(2,5)+rnd(-.8,.8),rnd(.4,2.4),p.dz*rnd(2,5)+rnd(-.8,.8),.9,c,1,true);
  for(let i=0;i<2;i++)spark(hx-p.dx*.2,hy,hz-p.dz*.2,-p.dx*rnd(1,3)+rnd(-1.5,1.5),rnd(0,2),-p.dz*rnd(1,3)+rnd(-1.5,1.5),.12,[1,.95,.7],0);
  p.fx2e=e;}
function fx2Impact(p){
  const spell=!GK[p.kind],x=p.x,y=p.y,z=p.z,low=fxLow();
  if(!spell){if(p.fx2e||p.blast)return;
    for(let i=0;i<(low?2:3);i++)spark(x,y,z,-p.dx*rnd(1,4)+rnd(-1.6,1.6),rnd(.3,2.5),-p.dz*rnd(1,4)+rnd(-1.6,1.6),rnd(.12,.25),[1,.85,.5],.7);
    return;}
  if(p.kind==='wave'||p.kind==='cleaver'||p.kind==='breath')return;
  const c=p.trail||[1,.7,.3],hex=c2hex(c);
  const dk=Math.max(.3,Math.min(1,(Math.hypot(x-P.x,z-P.z)-.6)/3));
  sphereFx(x,y,z,.12*dk,.75*dk,0xffffff,.13,.85*dk);if(!low)sphereFx(x,y,z,.2*dk,1.25*dk,hex,.26,.5*dk);
  for(let i=0;i<(low?8:16);i++){const an=Math.random()*6.283,sp=rnd(3,7);spark(x,y,z,Math.cos(an)*sp-p.dx*1.5,rnd(-1,4),Math.sin(an)*sp-p.dz*1.5,rnd(.18,.4),i%3?c:[1,1,.9],.4);}
  flash(x,y,z,hex,1+1.4*dk);shake=Math.max(shake,.06);
  const e=p.fx2e;if(e&&!e.dead&&EMB.length<10)EMB.push({e,t:1.4,c});}
function fx2Swing(){
  slT=0;slD=Math.max(.16,P.swingDur*.8);slN++;slash.visible=true;
  const s=slN%2?1:-1;slash.position.set(-.2*s,-.34,-.74);slash.rotation.set(-.3,0,0);slash.scale.set(s,1,1);
  try{slMat.uniforms.col.value.copy(vmAccent.color).lerp(new T.Color(0xffffff),.45);}catch(e){}}
function fx2MeleeHit(e,fx,fz,crit){
  const x=e.x-fx*e.r*.6,y=e.y+e.h*.6,z=e.z-fz*e.r*.6,px=-fz,pz=fx,low=fxLow(),c=(e.D&&e.D.blood)||[.6,.05,.05];
  window.__gsMeleeT=performance.now();fx2Star(x,y,z,crit?0xffe066:0xffffff,crit?1.25:.95,crit?.14:.11);
  for(let i=0;i<(low?6:12);i++){const s=rnd(-1,1)*5;spark(x,y,z,px*s+fx*rnd(1,4),rnd(0,2.5),pz*s+fz*rnd(1,4),rnd(.12,.25),i%3?[1,.92,.6]:[1,1,1],.3);}
  for(let i=0;i<(low?3:6);i++)spark(x,y,z,fx*rnd(1.5,4)+px*rnd(-1.5,1.5),rnd(.5,2.5),fz*rnd(1.5,4)+pz*rnd(-1.5,1.5),.9,c,1,true);
  HSTOP=Math.max(HSTOP,crit?.075:.05);shake=Math.max(shake,crit?.14:.08);}
function fx2Cast(hex){
  crT=0;castRing.visible=true;crMat.color.setHex(hex);crCore.material.color.setHex(hex);castRing.position.set(-.26,-.22,-.6);
  ringFx(P.x,P.z,.3,1.7,hex,.35,.06);}
function fx2Tick(dt){
  if(mzT>0){mzT-=dt;const k=Math.max(0,mzT/mzD);mzMatA.opacity=k;mzMatB.opacity=k;if(mzT<=0)mz.visible=false;}
  if(slT>=0){slT+=dt;const t=slT/slD;slMat.uniforms.head.value=Math.min(1.25,t*1.5);slMat.uniforms.op.value=t<.66?1:Math.max(0,1-(t-.66)*2.4);if(t>1.1){slT=-1;slash.visible=false;}}
  if(crT>=0){crT+=dt;const t=crT/.28,e=1-(1-t)*(1-t);castRing.scale.setScalar(.03+.2*e);crMat.opacity=Math.max(0,1-t)*.9;crCore.material.opacity=Math.max(0,.6-t*1.4);if(t>=1){crT=-1;castRing.visible=false;}}
  for(const S of STARS){if(S.t<=0)continue;S.t-=dt;const t=1-S.t/S.d;S.g.quaternion.copy(cam.quaternion);S.g.rotateZ(t*.6);S.g.scale.setScalar(S.s*(.3+t*.8));S.m.opacity=Math.max(0,1-t*t);if(S.t<=0)S.g.visible=false;}
  for(let i=EMB.length-1;i>=0;i--){const m=EMB[i];m.t-=dt;if(m.t<=0||m.e.dead){EMB.splice(i,1);continue;}if(Math.random()<.6){const e=m.e;spark(e.x+rnd(-e.r,e.r)*.7,e.y+rnd(.2,e.h),e.z+rnd(-e.r,e.r)*.7,rnd(-.2,.2),rnd(.6,1.6),rnd(-.2,.2),rnd(.3,.6),Math.random()<.4?[1,.95,.7]:m.c,-.15);}}
  /* the casting hand's light never leaves the scene (adding/removing a light recompiles shaders = a hitch on every cast) */
  if(!hand.visible)handLight.intensity=0;else handLight.position.set(hand.position.x,hand.position.y+.16,hand.position.z-.1);
}
'''
rep("bladeG.visible=false;scene.add(bladeG);","bladeG.visible=false;scene.add(bladeG);\n"+FX)
# hand light lives in the viewmodel scene permanently
rep("handLight.position.set(0,.16,-.1);hand.add(handLight);","handLight.position.set(0,.16,-.1);vmScene.add(handLight);")
# per-frame tick
rep("placeCam();updParticles(dt);if(OPEN)updOpen(dt);","placeCam();updParticles(dt);try{fx2Tick(dt);}catch(e){}if(OPEN)updOpen(dt);")
# gun fire
rep("  sfx(C.kind==='rocket'?'fire'","  try{fx2Fire(C,V,pel,a);}catch(e){}\n  sfx(C.kind==='rocket'?'fire'")
# projectiles
rep("o.m=m;o.sp=SPC;o.age=0;o.r=K.r;o.trail=o.tr||K.trail;o.hit=null;projs.push(o);","o.m=m;o.sp=SPC;o.age=0;o.r=K.r;o.trail=o.tr||K.trail;o.hit=null;projs.push(o);if(o.from==='p')try{fx2Proj(o);}catch(e){}")
rep("hurtEnemy(e,p.dmg*(bodyHit?.6:1),p.crit);PVS=false;","hurtEnemy(e,p.dmg*(bodyHit?.6:1),p.crit);PVS=false;if(GK[p.kind])try{fx2GunHit(p,e);}catch(_){}else p.fx2e=e;")
rep("else burst(p.x,p.y,p.z,p.trail?8:4,p.trail||[.8,.85,.9],1.5,.3,.6);","else burst(p.x,p.y,p.z,p.trail?8:4,p.trail||[.8,.85,.9],1.5,.3,.6);\n      if(p.from==='p')try{fx2Impact(p);}catch(e){}")
rep("else if(p.kind==='cleaver')p.m.rotateX(dt*22);}","else if(p.kind==='cleaver')p.m.rotateX(dt*22);else if(p.fx2s)fx2Stretch(p,dt);}")
# melee
rep("P.swing=1;P.swingDur=Math.min(.42,Math.max(.26,P.fireCd*.92));sfx('swing');","P.swing=1;P.swingDur=Math.min(.42,Math.max(.26,P.fireCd*.92));sfx('swing');try{fx2Swing();}catch(e){}")
rep("hurtEnemy(e,dm*(crit?2:1)*rnd(.9,1.1),crit);","hurtEnemy(e,dm*(crit?2:1)*rnd(.9,1.1),crit);try{fx2MeleeHit(e,fx,fz,crit);}catch(_){}")
# muzzle position follows whichever gun is in hand
rep("vmM=weaponModel(w,vmAccent,false);vm.add(vmM.g);}","vmM=weaponModel(w,vmAccent,false);vm.add(vmM.g);try{fx2Muzzle();}catch(e){}}")
# spells
rep("for(let i=0;i<14;i++)spark(P.x+a.x*.7+lx*.28,EY-.28,P.z+a.z*.7+lz*.28,a.x*rnd(1,4)+rnd(-1,1),rnd(-.5,1.5),a.z*rnd(1,4)+rnd(-1,1),.35,c,0);}",
    "for(let i=0;i<14;i++)spark(P.x+a.x*.7+lx*.28,EY-.28,P.z+a.z*.7+lz*.28,a.x*rnd(1,4)+rnd(-1,1),rnd(-.5,1.5),a.z*rnd(1,4)+rnd(-1,1),.35,c,0);try{fx2Cast(hex);}catch(e){}}")
open(p,'w',encoding='utf-8').write(s);print('fx ok')
