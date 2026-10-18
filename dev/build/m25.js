/* ===== BUILD 3.15: THE FACILITY — part 4: playing it =====
   You wake up on the service level. The freight lift in the basement is the only way out, and it has no power:
   find the three fuses (one on each level), put them in the breaker beside the lift, then survive until the lift comes.
   The creature hunts by sight and sound, opens and smashes doors, drops from ceiling vents and leaps between floors. */
const FAC={walk:3.15,run:5.9,crouch:1.65,tired:2.5,eye:1.62,eyeC:1.02,r:.3,h:1.74,hc:1.12,su:.46};
/* the built facility (geometry, baked light, textures, materials) is kept while you retry, and let go when you leave */
let FACW=null;
async function facBuild(prog){
  const H=HZ,F=H.fac={t:0,noise:[],msgs:[]};
  const step=async(p,t)=>{prog(p,t);await new Promise(r=>setTimeout(r,0));};
  let W;
  if(FACW){W=F.W=FACW.W;F.M=FACW.M;F.U=FACW.U;F.AT=FACW.AT;await step(.5,'BACK INSIDE');
    const U=F.U;U.uPow.value=1;U.uEmg.value=1;U.uLOn.value=1;}
  else{
    await step(.03,'DRAWING THE PLAN');
    W=F.W=facPlan();facGrid(W);await step(.07,'POURING THE CONCRETE');
    facGeomAll(W);await step(.12,'WIRING THE LIGHTS');
    await facBake(W,p=>prog(.12+p*.5,'WIRING THE LIGHTS'));if(!HZ)return;
    await step(.63,'PAINTING THE WALLS');
    const q=(()=>{try{return qFactor();}catch(_){return 1;}})(),sc_=q<.9?.5:1;
    const TX=facTextures(sc_);await step(.8,'STACKING THE CRATES');
    F.AT=facAtlas(sc_<1?1024:2048);F.U=facUniforms();F.M=facMats(TX,F.AT,F.U);}
  const sc=H.scene=F.scene=new T.Scene();sc.background=new T.Color(0x000000);sc.fog=new T.FogExp2(0x010203,F.U.uFogD.value);
  if(FACW){F.meshes=FACW.geos.map(o=>{const m=new T.Mesh(o.g,F.M[o.m]);m.matrixAutoUpdate=false;m.updateMatrix();m.renderOrder=o.ro;m.userData.band=o.band;sc.add(m);return m;});}
  else{F.meshes=facMeshes(W,F.M,sc);}
  await step(.86,'HANGING THE DOORS');
  facDoorsInit(F,F.M);
  if(W.navC){F.nav=W.navC.nav;F.links=W.navC.links;F.linkSet=W.navC.linkSet;}else{facNav(F);W.navC={nav:F.nav,links:F.links,linkSet:F.linkSet};}
  await step(.92,'LETTING IT IN');
  facObjects(F);
  F.vOpen=[];for(const o of W.stairs)F.vOpen.push({x0:o.x0,z0:o.z0,x1:o.x1,z1:o.z1,b0:facBand(o.y0+.1),b1:facBand(o.y1+.1)});for(const o of W.open)if(o.hole)F.vOpen.push({x0:o.x0,z0:o.z0,x1:o.x1,z1:o.z1,b0:facBand(o.y0),b1:facBand(o.y1)});
  /* the creature: your model, untouched, with a version of its material that matches the facility's light */
  {const A=HZA,dm=F.dm={x:0,y:0,z:0,face:0,on:false,vis:false,st:'away',spd:0,rw:0,path:null,pi:0,alert:0,mem:null,t:0};
    const g=new T.Group();g.add(A.root);A.root.position.set(0,0,0);A.root.rotation.set(0,0,0);g.scale.setScalar(1.3);sc.add(g);dm.g=g;g.visible=false;A.mesh.castShadow=false;
    const mat=A.mat.clone();mat.emissive=new T.Color(0x0c0504);mat.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n\tgl_FragColor.rgb=vec3(1.0)-exp(-gl_FragColor.rgb*1.45);');};
    mat.customProgramCacheKey=()=>'facdemon';F.dmat=mat;F.dmat0=A.mesh.material;A.mesh.material=mat;
    const mx=dm.mix=new T.AnimationMixer(A.root);dm.run=mx.clipAction(A.run);dm.idle=mx.clipAction(A.idle);dm.idle.play();dm.run.play();dm.run.setEffectiveWeight(0);dm.idle.setEffectiveWeight(1);
    try{A.root.traverse(o=>{if(o.isBone&&/head/i.test(o.name)&&!dm.head)dm.head=o;});}catch(_){}}
  F.amb=new T.AmbientLight(0xffffff,.2);sc.add(F.amb);F.dmL=new T.PointLight(0xffffff,0,9,1.6);sc.add(F.dmL);
  F.spot=new T.SpotLight(0xfff2d8,1.4,16,.42,.5,2);sc.add(F.spot);sc.add(F.spot.target);
  /* real-time shadows from your flashlight (not on the lowest graphics setting); the creature casts one on high */
  {let q=1;try{q=qFactor();}catch(_){}F.shadows=q>=1.4||!!window.__facShadows;F.dmShadow=q>=2;F.shadow0=renderer.shadowMap.enabled;
    if(F.shadows){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.BasicShadowMap;renderer.shadowMap.autoUpdate=true;const sz=q>=2?1024:512;F.spot.shadow.mapSize.set(sz,sz);F.spot.shadow.camera.near=.12;F.spot.shadow.camera.far=16;F.spot.shadow.bias=0;F.U.uShT.value=1/sz;F.U.uShX.value=F.spot.shadow.matrix;
      for(const m of F.meshes){const k=m.material===F.M.emis||m.material===F.M.decal;m.castShadow=!k;}for(const d of F.doors)d.mesh.castShadow=true;}}
  F.hand=facHand();
  if(FACW){F.shafts=FACW.shafts;F.dust=FACW.dust;F.beam=FACW.beam;F.post=FACW.post;F.halo=FACW.halo;}else{F.shafts=facShafts(W,F.U);F.dust=facDust(F.U);F.beam=facBeamCone(F.U);F.post=facPost();F.halo=facGlows(W,F.U);}
  if(F.shafts)sc.add(F.shafts);sc.add(F.dust);sc.add(F.beam);if(F.halo)sc.add(F.halo);
  if(!FACW)FACW={W,M:F.M,U:F.U,AT:F.AT,geos:F.meshes.map(m=>({g:m.geometry,m:FMAT.find(k=>F.M[k]===m.material)||'prop',ro:m.renderOrder,band:m.userData.band})),shafts:F.shafts,dust:F.dust,beam:F.beam,post:F.post,halo:F.halo};
  F.post.mat.uniforms.uFade.value=1;F.post.mat.uniforms.uHurt.value=0;
  /* you */
  const s=W.start;F.pl=H.pl=Object.assign(H.pl,{x:s.x,y:FCY[s.k],z:s.z,vx:0,vz:0,vy:0,yaw:s.yaw,pitch:-.05,crouch:false,sta:1,tired:false,ground:true,bob:0,bobA:0,roll:0,light:true,bat:1,fear:0,hurt:0,ch:FAC.eye});
  F.pl.isBody=1;F.camY=F.pl.y+FAC.eye;F.fuses=0;F.held=0;F.stage='find';F.startT=0;F.lightT=0;
  facAudioInit(F);
  facDemonInit(F);
  if(F.dmShadow&&F.shadows)HZA.mesh.castShadow=true;
  for(const d of F.lift.doors)d.g.castShadow=!!F.shadows;
  try{renderer.compile(sc,cam);renderer.compile(F.hand.sc,cam);}catch(_){}
  await step(1,'');
}
/* ---------- things you pick up and use: fuses, batteries, the breaker, the lift ---------- */
function facObjects(F){
  const W=F.W,sc=F.scene,R=Math.random;
  const bakeMesh=(g,x,y,z)=>{/* light for a small loose object: the probe where it sits */const p=facProbe(W,x,y+.3,z),n=g.attributes.position.count,tn=new Uint8Array(n*4),bk=new Uint8Array(n*4),b2=new Uint8Array(n*4),ld=new Int8Array(n*4);
    for(let i=0;i<n;i++){tn.set([255,255,255,60],i*4);for(let k=0;k<3;k++){bk[i*4+k]=Math.round(Math.sqrt(Math.min(1,p[k]*1.6/4))*255);b2[i*4+k]=Math.round(Math.sqrt(Math.min(1,p[3+k]*1.6/4))*255);}bk[i*4+3]=b2[i*4+3]=255;}
    g.setAttribute('tint',new T.BufferAttribute(tn,4,true));g.setAttribute('bake',new T.BufferAttribute(bk,4,true));g.setAttribute('bake2',new T.BufferAttribute(b2,4,true));g.setAttribute('ldir',new T.BufferAttribute(ld,4,true));return g;};
  const atlasUV=(g,reg)=>{const r=facReg(reg),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,r[0]+uv.getX(i)*(r[2]-r[0]),r[1]+uv.getY(i)*(r[3]-r[1]));};
  F.glowMat=new T.SpriteMaterial({map:facGlowTex(),color:0xff8a3a,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.8});
  /* one fuse on each level, at a random one of its spots */
  F.fz=[];for(let k=0;k<3;k++){const L=W.fuse[k],s=L[(R()*L.length)|0];const g=new T.CylinderGeometry(.035,.035,.16,10);g.rotateZ(Math.PI/2);atlasUV(g,'fuse');bakeMesh(g,s.x,s.y,s.z);
    const m=new T.Mesh(g,F.M.prop);m.position.set(s.x,s.y+.04,s.z);m.rotation.y=R()*3;sc.add(m);const gl=new T.Sprite(F.glowMat);gl.scale.set(.5,.5,.5);gl.position.copy(m.position);sc.add(gl);
    F.fz.push({k,x:s.x,y:s.y,z:s.z,m,gl,got:false});}
  /* batteries for the flashlight */
  F.bats=[];const bl=W.bat.slice().sort(()=>R()-.5).slice(0,6);for(const b of bl){const g=new T.BoxGeometry(.05,.09,.03);atlasUV(g,'battery');bakeMesh(g,b.x,b.y,b.z);const m=new T.Mesh(g,F.M.prop);m.position.set(b.x,b.y+.045,b.z);m.rotation.y=R()*6;sc.add(m);F.bats.push({x:b.x,y:b.y,z:b.z,m,got:false});}
  /* the breaker: three sockets, and the fuses you have put in */
  const B=W.breaker;F.brk={x:B.x,y:FCY[B.k]+1.7,z:B.z+.18,k:B.k,n:0,sockets:[]};
  for(let i=0;i<3;i++){const g=new T.CylinderGeometry(.03,.03,.13,10);atlasUV(g,'fuse');bakeMesh(g,B.x,FCY[B.k]+1.6,B.z+.3);const m=new T.Mesh(g,F.M.prop);m.position.set(B.x-.36+i*.36,FCY[B.k]+1.62,B.z+.17);m.visible=false;sc.add(m);F.brk.sockets.push(m);}
  /* the freight lift: two heavy doors that slide apart once the car arrives */
  const LD=W.liftDoor,lm=new T.MeshLambertMaterial({vertexColors:true});F.liftMats=[lm];
  F.lift={open:0,want:0,arrive:-1,doors:[],box:{x0:LD.x0,x1:LD.x1,z0:LD.z0,z1:LD.z1,y0:0,y1:2.8,m:'prop',noVox:1},z0:LD.z0,z1:LD.z1,x:(LD.x0+LD.x1)/2};
  if(W.liftBox)F.lift.box=W.liftBox;else{W.liftBox=F.lift.box;W.boxes.push(F.lift.box);facHashAdd(W.bh,F.lift.box);}F.lift.box.off=false;
  /* each door panel is one mesh: steel with three yellow stripes */
  const pb=new T.BoxGeometry(.12,2.78,1.5),sb=new T.BoxGeometry(.13,.08,1.5),parts=[[pb,0x4a5258,new T.Matrix4().makeTranslation(0,1.39,0)]];for(let i=0;i<3;i++)parts.push([sb,0x8a7020,new T.Matrix4().makeTranslation(0,.35+i*.9,0)]);
  const lg=chandMerge(parts);pb.dispose();sb.dispose();
  for(const s of[-1,1]){const g=new T.Mesh(lg,lm);g.position.set(F.lift.x,0,25+s*.75);sc.add(g);F.lift.doors.push({g,s});}
  /* ceiling vents: a dark opening and a grate that can fall */
  F.vents=[];const vm=F.ventMat=new T.MeshBasicMaterial({color:0x020202});
  for(const v of W.vents){const hole=new T.Mesh(new T.PlaneGeometry(.84,.84),vm);hole.rotation.x=Math.PI/2;hole.position.set(v.x,v.y-.004,v.z);sc.add(hole);
    const g=new T.PlaneGeometry(.84,.84);g.rotateX(Math.PI/2);atlasUV(g,'vent');bakeMesh(g,v.x,v.y-1,v.z);const gr=new T.Mesh(g,F.M.prop);gr.position.set(v.x,v.y-.014,v.z);sc.add(gr);F.vents.push({x:v.x,y:v.y,z:v.z,k:v.k,gr,hole,fall:0,vy:0,used:false});}
}
function facGlowTex(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);}
/* ---------- you: movement with weight, stamina, a capsule that never clips, stairs, falls ---------- */
function facNoise(F,x,y,z,r){F.noise.push({x,y,z,r,t:F.t});if(F.noise.length>12)F.noise.shift();}
function facPlayer(F,dt){
  const H=HZ,pl=F.pl;
  /* keyboard turning, as in the climb */
  if(keys.ArrowLeft)pl.yaw+=dt*2.4*sens();if(keys.ArrowRight)pl.yaw-=dt*2.4*sens();
  if(keys.PageUp)pl.pitch=clamp(pl.pitch+dt*1.6*sens(),-1.25,1.25);if(keys.PageDown)pl.pitch=clamp(pl.pitch-dt*1.6*sens(),-1.25,1.25);
  pl.pitch=clamp(pl.pitch,-1.3,1.3);
  let fz=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-touchMove.y-padMove.y,fx=(keys.KeyD?1:0)-(keys.KeyA?1:0)+touchMove.x+padMove.x;
  const ml=Math.hypot(fx,fz);if(ml>1){fx/=ml;fz/=ml;}
  const stf=-touchMove.y-padMove.y,holdBtn=firing||H.padHold;
  const wantRun=(keys.ShiftLeft||keys.ShiftRight||padRun||holdBtn||(stf>.88&&Math.abs(touchMove.x+padMove.x)<.5))&&fz>.25;
  if(wantRun&&pl.crouch&&facCanStand(F))pl.crouch=false;
  if(pl.crouch!==F.wasCrouch){F.wasCrouch=pl.crouch;if(!pl.crouch&&!facCanStand(F))pl.crouch=true;}
  const run=wantRun&&!pl.crouch&&!pl.tired&&pl.sta>0&&pl.ground;F.running=run;
  /* stamina: sprinting drains it fast; it comes back after a breath; run it dry and you can only stagger for a while */
  if(run){pl.sta=Math.max(0,pl.sta-dt/5.2);F.staT=1.1;}else{F.staT=Math.max(0,(F.staT||0)-dt);if(F.staT<=0)pl.sta=Math.min(1,pl.sta+dt*(ml>.1?.11:.19));}
  if(pl.sta<=0&&!pl.tired){pl.tired=true;facSndGasp(F);}if(pl.tired&&pl.sta>.42)pl.tired=false;
  const top=run?FAC.run:pl.crouch?FAC.crouch:pl.tired?FAC.tired:FAC.walk;
  const sy=Math.sin(pl.yaw),cy=Math.cos(pl.yaw);let tvx=(-sy*fz+cy*fx)*top,tvz=(-cy*fz-sy*fx)*top;
  if(pl.ground){
    /* inertia: quick to get going, a short slide when you stop, and a sprint that does not turn on a coin */
    const cur=Math.hypot(pl.vx,pl.vz),tg=Math.hypot(tvx,tvz);
    let pivot=false;if(run&&cur>2&&tg>.1){const ca=Math.atan2(pl.vz,pl.vx),ta=Math.atan2(tvz,tvx);let d=ta-ca;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>1.9)pivot=true;else{const mx=dt*3.4;const na=ca+clamp(d,-mx,mx);tvx=Math.cos(na)*tg;tvz=Math.sin(na)*tg;}}
    const k=pivot?13:tg>cur?(run?3.6:9):10.5,a=1-Math.exp(-k*dt);pl.vx+=(tvx-pl.vx)*a;pl.vz+=(tvz-pl.vz)*a;
  }
  if(pl.land>0){pl.land-=dt;pl.vx*=.9;pl.vz*=.9;}
  const ox=pl.x,oz=pl.z,h=pl.crouch?FAC.hc:FAC.h;
  facMove(F,pl,pl.vx*dt,pl.vz*dt,FAC.r,h,FAC.su);
  const mvx=(pl.x-ox)/Math.max(dt,1e-4),mvz=(pl.z-oz)/Math.max(dt,1e-4);
  /* walking into a closed door pushes it open */
  const wantMv=Math.hypot(tvx,tvz);for(const d of F.doors){if(d.bump){if(Math.abs(d.th)<1.1&&Math.abs(d.tgt)<1&&wantMv>1){d.push=(d.push||0)+dt;if(d.push>(run?.12:.22)){if(d.lock){if(!d.ratT||F.t>d.ratT){d.ratT=F.t+1.2;facSndRattle(F,d);facTip(F,'Locked',1.2);}}else{facDoorOpen(F,d,pl.x,pl.z,run);if(!run){d.tgt*=.92;d.stiff=10;}else facNoise(F,d.cx,d.y,d.cz,14);}d.push=0;}}d.bump=0;}else d.push=0;}
  /* where hitting a wall stopped you, lose that speed */
  if(Math.abs(mvx)<Math.abs(pl.vx)*.5)pl.vx=mvx;if(Math.abs(mvz)<Math.abs(pl.vz)*.5)pl.vz=mvz;
  /* the ground: step up stairs, follow them down, fall off ledges */
  const gy=facGround(F,pl.x,pl.z,pl.y,FAC.su);
  if(pl.ground){if(gy>pl.y-.52&&gy>-1e8){pl.y=gy;pl.vy=0;}else{pl.ground=false;pl.vy=0;pl.fall0=pl.y;}}
  if(!pl.ground){pl.vy-=17*dt;pl.y+=pl.vy*dt;const g2=facGround(F,pl.x,pl.z,pl.y-pl.vy*dt,Math.max(.05,-pl.vy*dt+.05));
    if(pl.y<=g2){const drop=(pl.fall0||pl.y)-g2;pl.y=g2;pl.ground=true;const v=-pl.vy;pl.vy=0;
      if(drop>1.2){pl.land=Math.min(.6,drop*.12);F.dip=Math.min(.42,drop*.09);facSndLand(F,Math.min(1,drop/4));facNoise(F,pl.x,pl.y,pl.z,8+drop*3);try{vib&&vib([30+drop*15|0]);}catch(_){}if(drop>3)pl.sta=Math.max(0,pl.sta-.25);}else if(v>2)F.dip=.05;}}
  /* 3.16: while falling past a ledge, keep the body out of the slab edge */
  if(!pl.ground){for(let it=0;it<3;it++)if(facPush(F,pl,FAC.r,h,FAC.su)<.0005)break;}
  if(pl.y<-6){pl.y=FCY[2];}
  /* footsteps and how much noise they make */
  const sp=Math.hypot(mvx,mvz);F.speed=sp;
  if(pl.ground&&sp>.3){const stride=run?1.12:pl.crouch?.62:.78;const ob=pl.bob;pl.bob+=sp*dt/stride*Math.PI;
    if(Math.floor(ob/Math.PI)!==Math.floor(pl.bob/Math.PI)){const surf=facSurfAt(F,pl.x,pl.y,pl.z);facSndStep(F,surf,run?1:pl.crouch?.28:.6);facNoise(F,pl.x,pl.y,pl.z,run?17:pl.crouch?2.5:7);}}
  pl.bobA+=((pl.ground?Math.min(1,sp/FAC.walk):0)-pl.bobA)*Math.min(1,dt*8);
  /* use and light */
  if(H.kAct||H.kJump)facUse(F);H.kAct=H.kJump=0;
  if(H.kLan||H.kWard){if(pl.bat>.02){pl.light=!pl.light;facSndClick(F);}else facTip(F,'The battery is dead',1.5);}H.kLan=H.kWard=0;
  if(pl.light){pl.bat=Math.max(0,pl.bat-dt/300);if(pl.bat<=0){pl.light=false;facTip(F,'The battery is dead',2);}}
  facLook(F);
}
function facCanStand(F){const pl=F.pl,i=Math.floor(pl.x/FC),j=Math.floor(pl.z/FC);return facClear(F.W.G,j*FNX+i,pl.y+.5,pl.y+FAC.h)&&facPush(F,{x:pl.x,y:pl.y,z:pl.z},FAC.r-.02,FAC.h,FAC.hc)<.002;}
/* what is under your feet: metal stairs, tiles, concrete, or the wet basement */
function facSurfAt(F,x,y,z){const L=F.W.bh.get(Math.floor(z/2)*64+Math.floor(x/2));if(L)for(const b of L){if((b.m==='step'||b.m==='mstep'||b.m==='land')&&x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&Math.abs(b.y1-y)<.05)return 'metal';}
  const c=Math.floor(z/FC)*FNX+Math.floor(x/FC),kd=facKindAt(F.W,c,y+.05);if(kd===FK.frm)return 'metal';if(kd===FK.bsm||kd===FK.lift)return 'wet';return facFloorMat(kd)==='tile'?'tile':'conc';}
/* ---------- looking at things you can use ---------- */
function facLook(F){
  const pl=F.pl,ex=pl.x,ey=F.camY,ez=pl.z,cp=Math.cos(pl.pitch),dx=-Math.sin(pl.yaw)*cp,dy=Math.sin(pl.pitch),dz=-Math.cos(pl.yaw)*cp;
  let best=null,bs=0;
  const cand=(x,y,z,maxD,minC,o)=>{const vx=x-ex,vy=y-ey,vz=z-ez,d=Math.hypot(vx,vy,vz);if(d>maxD||d<.05)return;const c=(vx*dx+vy*dy+vz*dz)/d;if(c<minC)return;const s=c-d*.02;if(s>bs&&facSee(F,ex,ey,ez,x,y,z,false)){bs=s;best=o;}};
  for(const d of F.doors){if(Math.abs(d.y-pl.y)>2)continue;const sg=facDoorSeg(d),mx=(sg[0]+sg[2])/2,mz=(sg[1]+sg[3])/2;cand(mx,d.y+1.05,mz,2.1,.86,{t:'door',d});if(Math.abs(d.th)>.5)cand(d.cx,d.y+1.05,d.cz,1.8,.9,{t:'door',d});}
  for(const f of F.fz)if(!f.got)cand(f.x,f.y+.05,f.z,2,.88,{t:'fuse',f});
  for(const b of F.bats)if(!b.got)cand(b.x,b.y+.05,b.z,2,.88,{t:'bat',b});
  if(F.held>0||F.stage!=='find')cand(F.brk.x,F.brk.y,F.brk.z,2.2,.8,{t:'brk'});
  F.aim=best;
}
function facUse(F){
  const a=F.aim,pl=F.pl;if(!a)return;
  if(a.t==='door'){const d=a.d;if(d.lock){facSndRattle(F,d);facTip(F,'Locked',1.2);return;}
    if(Math.abs(d.th)<.6&&Math.abs(d.tgt)<.6){facDoorOpen(F,d,pl.x,pl.z,false);F.lastOpen={d,t:F.t};}
    else{const fast=F.speed>2.4||F.fearHi;facDoorClose(F,d,fast);if(fast){F.slamBy=F.t;d.slamT=F.t;}}}
  else if(a.t==='fuse'){const f=a.f;f.got=true;f.m.visible=f.gl.visible=false;F.held++;F.fuses++;facSndPick(F);
    facSay(F,'FUSE '+F.fuses+' OF 3',2.2);facTip(F,F.fuses<3?'It heard that.':'All three. Get to the breaker by the freight lift.',3);facNoise(F,pl.x,pl.y,pl.z,40);F.dir.alertAt=F.t+.4;}
  else if(a.t==='bat'){const b=a.b;b.got=true;b.m.visible=false;pl.bat=Math.min(1,pl.bat+.5);facSndPick(F,.6);facTip(F,'Battery +50%',1.6);}
  else if(a.t==='brk'){if(F.held>0){F.brk.sockets[F.brk.n].visible=true;F.brk.n++;F.held--;facSndPlug(F);
      if(F.brk.n>=3)facPowerUp(F);else facTip(F,'Fuses in the breaker: '+F.brk.n+' of 3',2);}
    else if(F.stage==='find')facTip(F,'Fuses in the breaker: '+F.brk.n+' of 3',2);}
}
/* all three fuses are in: the lift is called, the lights fail, and it comes for you */
function facPowerUp(F){F.stage='wait';F.lift.arrive=F.t+32;facSay(F,'THE LIFT IS COMING',3);facTip(F,'Survive until it arrives',4);facSndAlarm(F);
  F.powerT=0;F.dir.final=true;facNoise(F,F.pl.x,F.pl.y,F.pl.z,80);}
function facItems(F,dt){
  const t=F.t;for(const f of F.fz)if(!f.got){f.m.rotation.y+=dt*1.2;f.gl.material.opacity=.45+Math.sin(t*3+f.x)*.25;}
  /* the power failing: the tubes die, only the red emergency lamps are left */
  if(F.stage==='wait'||F.stage==='open'){F.powerT+=dt;const p=F.powerT;F.U.uPow.value=p<1.2?(Math.random()<.5?.2:1):Math.max(.1,F.U.uPow.value-dt*.6);F.U.uEmg.value=Math.min(1.9,1+p*.35);
    if(F.stage==='wait'&&t>=F.lift.arrive){F.stage='open';F.lift.want=1;facSay(F,'GET IN',2);facSndBell(F);}}
  const L=F.lift;L.open+=((L.want?1:0)-L.open)*Math.min(1,dt*.9);for(const d of L.doors)d.g.position.z=25+d.s*(.75+L.open*1.45);L.box.off=L.open>.6;
  if(F.stage==='open'&&F.pl.x>34&&Math.abs(F.pl.z-25)<2.2&&Math.abs(F.pl.y)<.5)facWin(F);
}
/* ---------- the creature ---------- */
const FDM={r:.32,h:2.02,su:.56,prowl:1.9,inv:3.1,search:1.55,chase:4.75};
function facDemonInit(F){
  const dm=F.dm,W=F.W,p=W.peek;dm.isBody=2;dm.x=p.x;dm.z=p.z;dm.y=FCY[p.k];dm.face=Math.PI/2;dm.st='peek';dm.stT=0;dm.on=true;dm.g.visible=true;
  /* the stairwell door it peeks round is open */
  for(const d of F.doors)if(Math.abs(d.cx-6.25)<.3&&Math.abs(d.cz-3)<.6&&d.k===1){d.th=d.tgt=-1.5*facDoorSide(d,10,3);d.mesh.rotation.y=-(d.a0+d.th);}
  F.dir={t:0,calm:0,lastSeen:0,lastChase:0,ambT:38,awayT:0,alertAt:-1,final:false,seenOnce:false};
}
function facDmPlace(F,x,y,z,face){const dm=F.dm;dm.x=x;dm.y=y;dm.z=z;if(face!=null)dm.face=face;dm.path=null;dm.on=true;dm.g.visible=true;dm.leap=null;dm.bash=null;}
function facDmState(F,st){const dm=F.dm;if(dm.st!==st){dm.prev=dm.st;dm.st=st;dm.stT=0;dm.path=null;if(st==='search'){dm.sp=null;dm.looks=0;}if(st==='prowl')dm.goalP=null;}}
/* the creature can see you: distance, your light, the light you stand in, crouching, cover */
function facDmSee(F){
  const dm=F.dm,pl=F.pl,dx=pl.x-dm.x,dz=pl.z-dm.z,dy=pl.y-dm.y,dh=Math.hypot(dx,dz),d=Math.hypot(dh,dy*1.3);if(d>34)return 0;
  const pr=facProbe(F.W,pl.x,pl.y+1,pl.z),amb0=FPLA(facKindAt(F.W,Math.floor(pl.z/FC)*FNX+Math.floor(pl.x/FC),pl.y+1))?.26:.12,lum=Math.min(1,Math.max(0,((pr[0]+pr[1]+pr[2])*F.U.uPow.value+(pr[3]+pr[4]+pr[5])*F.U.uEmg.value)*.8-amb0*Math.min(1,F.U.uPow.value)));
  let range=3.2+19*lum;
  if(pl.light&&F.lamp){const lx=dm.x-F.lamp.x,ly=dm.y+1.6-F.lamp.y,lz=dm.z-F.lamp.z,l=Math.hypot(lx,ly,lz)||1,c=(lx*F.lamp.dx+ly*F.lamp.dy+lz*F.lamp.dz)/l;range=Math.max(range,c>.85?32:13);}
  if(pl.crouch)range*=.58;if(F.speed>4)range*=1.15;if(dm.st==='chase')range=Math.max(range*1.7,15);
  if(d>range)return 0;
  const fx=Math.sin(dm.face),fz=Math.cos(dm.face),cf=dh>.01?(dx*fx+dz*fz)/dh:1;
  if(d>2.3&&cf<(dm.st==='chase'?-.3:.3))return 0;
  if(!facSee(F,dm.x,dm.y+1.95,dm.z,pl.x,pl.y+(pl.crouch?.78:1.35),pl.z,true)){
    /* a second look at your head: crouching behind a crate only hides you if your head is covered too */
    if(!facSee(F,dm.x,dm.y+1.95,dm.z,pl.x,pl.y+(pl.crouch?1.0:1.6),pl.z,true))return 0;}
  return Math.max(.15,1-d/range*.7);
}
function facDmHear(F){const dm=F.dm;let best=null,bd=0;
  for(const n of F.noise){if(n.heard)continue;n.heard=1;const d=Math.hypot(n.x-dm.x,(n.y-dm.y)*1.5,n.z-dm.z);let r=n.r;if(!facSee(F,dm.x,dm.y+1.6,dm.z,n.x,n.y+1,n.z,false))r*=.55;if(d<r&&r-d>bd){bd=r-d;best=n;}}
  return best;}
/* walk the creature toward a point along its path; handles doors, ledges and stairs */
function facDmGo(F,tx,ty,tz,spd,dt){
  const dm=F.dm,N=F.nav;
  if(dm.leap){const L=dm.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur),x=L.a[0]+(L.b[0]-L.a[0])*k,z=L.a[2]+(L.b[2]-L.a[2])*k,y=L.a[1]+(L.b[1]-L.a[1])*k+Math.sin(k*Math.PI)*(L.up?1.1:.6);
    dm.x=x;dm.y=y;dm.z=z;dm.fwant=Math.atan2(L.b[0]-L.a[0],L.b[2]-L.a[2]);if(k>=1){dm.leap=null;dm.y=L.b[1];facDmLand(F);dm.path=null;}return 'leap';}
  if(dm.bash){const B=dm.bash;B.t+=dt;dm.fwant=Math.atan2(B.d.cx-dm.x,B.d.cz-dm.z);if(B.t>=B.dur){if(!B.done){B.done=1;facDoorOpen(F,B.d,dm.x,dm.z,B.fast);if(B.fast){facNoise(F,B.d.cx,B.d.y,B.d.cz,22);F.shake=Math.max(F.shake||0,.4*clamp(1-Math.hypot(F.pl.x-dm.x,F.pl.z-dm.z)/12,0,1));}}
      if(B.t>B.dur+.25||Math.abs(B.d.th)>.9)dm.bash=null;}return 'bash';}
  dm.repT=(dm.repT||0)-dt;const goal=facNodeNear(F,tx,ty,tz);
  if(!dm.path||dm.repT<=0||dm.goal!==goal){dm.repT=dm.st==='chase'?.3:1.2;dm.goal=goal;const a=facNodeNear(F,dm.x,dm.y,dm.z);dm.path=facPath(F,a,goal);dm.pi=0;dm.ahead=null;dm.wlT=0;}
  const P=dm.path;if(!P||P.length<2){/* no route: walk straight if it is close */const dx=tx-dm.x,dz=tz-dm.z,l=Math.hypot(dx,dz),sameY=Math.abs(ty-dm.y)<1.2;if(l<.4&&sameY)return 'there';if(!sameY&&l<.4)return 'move';
    facMove(F,dm,dx/l*spd*dt,dz/l*spd*dt,FDM.r,FDM.h,FDM.su);dm.fwant=Math.atan2(dx,dz);facDmGround(F);return l<1&&sameY?'there':'move';}
  /* drop the nodes already behind */
  while(dm.pi<P.length-1){const p=facNP(F,P[dm.pi]);if(Math.hypot(p[0]-dm.x,p[2]-dm.z)<.45&&Math.abs(p[1]-dm.y)<.7)dm.pi++;else break;}
  /* a door on the way: open it (or smash it when hunting) */
  for(let k=dm.pi;k<Math.min(P.length,dm.pi+4);k++){const di=N.doorOf[P[k]];if(di<0)continue;const d=F.doors[di];
    if(Math.abs(d.th)<1.05&&Math.hypot(d.cx-dm.x,d.cz-dm.z)<1.45&&!(d.opening&&Math.abs(d.tgt)>1)){const fast=dm.st==='chase'||dm.st==='inv';
      dm.bash={d,t:0,dur:fast?(d.lock?.9:(F.t-(d.slamT||-9)<2.5?1.15:.55)):1.1,fast};if(d.lock&&fast)d.lock=false;if(!fast)facSndCreak(F,d,.6);return 'bash';}}
  /* a ledge to jump down or leap up */
  if(dm.pi>0||dm.pi<P.length-1){for(const L of F.links){const i=P.indexOf(L.a,dm.pi),j=P.indexOf(L.b,dm.pi);
      if(i>=0&&j===i+1&&i<=dm.pi+1){const a=facNP(F,L.a),b=facNP(F,L.b);if(Math.hypot(a[0]-dm.x,a[2]-dm.z)<.9){dm.leap={a:[dm.x,dm.y,dm.z],b,t:0,dur:.75,up:false};dm.pi=j;return 'leap';}}
      if(j>=0&&i===j+1&&j<=dm.pi+1){const a=facNP(F,L.b),b=facNP(F,L.a);if(Math.hypot(a[0]-dm.x,a[2]-dm.z)<.9){dm.leap={a:[dm.x,dm.y,dm.z],b,t:0,dur:.9,up:true};dm.pi=i;facDmRoar(F,.5);return 'leap';}}}}
  /* look ahead along the path for the furthest point it can walk to in a straight line */
  dm.wlT-=dt;if(dm.wlT<=0||!dm.ahead){dm.wlT=.15;let best=Math.min(dm.pi,P.length-1);
    for(let k=Math.min(P.length-1,dm.pi+10);k>dm.pi;k--){const p=facNP(F,P[k]);if(facWalkLine(F,dm.x,dm.y,dm.z,p[0],p[1],p[2])){best=k;break;}}dm.ahead=best;}
  const wp=facNP(F,P[Math.max(dm.ahead,dm.pi)]),dx=wp[0]-dm.x,dz=wp[2]-dm.z,l=Math.hypot(dx,dz);
  const last=dm.pi>=P.length-1;if(last&&l<.35)return 'there';
  const st=Math.min(l,spd*dt);if(l>1e-3){const ox=dm.x,oz=dm.z;facMove(F,dm,dx/l*st,dz/l*st,FDM.r,FDM.h,FDM.su);dm.fwant=Math.atan2(dx,dz);
    /* stuck against something: think again */
    if(Math.hypot(dm.x-ox,dm.z-oz)<st*.2){dm.stuck=(dm.stuck||0)+dt;if(dm.stuck>.5){dm.stuck=0;dm.path=null;dm.pi=0;}}else dm.stuck=0;}
  facDmGround(F);
  const g=facNP(F,P[P.length-1]);return Math.hypot(g[0]-dm.x,g[2]-dm.z)<.6&&Math.abs(g[1]-dm.y)<1?'there':'move';
}
function facDmGround(F){const dm=F.dm,g=facGround(F,dm.x,dm.z,dm.y,FDM.su);if(g>dm.y-.7&&g>-1e8)dm.y+=(g-dm.y)*.6;else dm.y=Math.max(g,dm.y-.3);}
/* a random spot within reach of (x,y,z), ideally out of your sight */
function facDmSpot(F,x,y,z,rMin,rMax,hidden,tries){const N=F.nav;
  for(let t=0;t<(tries||40);t++){const n=(Math.random()*N.N)|0,p=facNP(F,n),d=Math.hypot(p[0]-x,(p[1]-y)*1.5,p[2]-z);if(d<rMin||d>rMax)continue;
    if(hidden&&facSee(F,F.pl.x,F.camY,F.pl.z,p[0],p[1]+1.5,p[2],false))continue;return p;}
  return null;}
function facDemonTick(F,dt){
  const dm=F.dm,pl=F.pl,D=F.dir;dm.stT+=dt;dm.t+=dt;
  const dx=pl.x-dm.x,dz=pl.z-dm.z,dist=Math.hypot(dx,dz,(pl.y-dm.y)*1.2);F.dmDist=dm.on?dist:99;
  /* senses, ten times a second */
  dm.senT=(dm.senT||0)-dt;if(dm.senT<=0){dm.senT=.1;dm.sees=dm.on&&dm.st!=='peek'&&dm.st!=='vent'&&dm.st!=='away'&&dm.st!=='door'?facDmSee(F):0;
    dm.heard=dm.on&&dm.st!=='peek'&&dm.st!=='away'?facDmHear(F):null;}else dm.heard=null;
  if(dm.sees>0){dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};}
  let spd=0,res='';
  const chaseSpd=FDM.chase+F.fuses*.18+(D.final?.12:0);
  switch(dm.st){
    case 'peek':{/* standing at the stairwell door, looking down the corridor at you */dm.fwant=Math.atan2(dx,dz);
      const seen=facOnScreen(F,dm.x,dm.y+1.4,dm.z)&&dist<17&&facSee(F,pl.x,F.camY,pl.z,dm.x,dm.y+1.5,dm.z,false);if(seen){dm.seenT=(dm.seenT||0)+dt;if(!D.seenOnce&&dm.seenT>.12){D.seenOnce=1;facSting(F,1);}}
      if((dm.seenT||0)>.75||(dist<4.5&&pl.z<4.6)||dm.stT>40){facDmState(F,'withdraw');}break;}
    case 'withdraw':{spd=2.6;res=facDmGo(F,4,FCY[1],6.5,spd,dt);if(res==='there'||dm.stT>4){dm.on=false;dm.g.visible=false;facDmState(F,'away');D.awayT=14+Math.random()*7;}break;}
    case 'away':break;
    case 'prowl':{spd=FDM.prowl*(D.final?1.6:1);
      if(dm.waitT>0){/* stops, listens, sniffs the air */dm.waitT-=dt;spd=0;if(Math.random()<dt*.5)facDmSniff(F);}
      else{if(!dm.goalP||dm.stT>(dm.goalT||20)){dm.goalP=facDmProwlGoal(F);dm.goalT=dm.stT+14+Math.random()*10;}
        res=facDmGo(F,dm.goalP[0],dm.goalP[1],dm.goalP[2],spd,dt);if(res==='there'){dm.waitT=1+Math.random()*2.5;dm.goalP=null;}}
      break;}
    case 'inv':{spd=FDM.inv;const m=dm.mem;if(!m){facDmState(F,'prowl');break;}res=facDmGo(F,m.x,m.y,m.z,spd,dt);if(res==='there'||dm.stT>25)facDmState(F,'search');break;}
    case 'search':{spd=FDM.search;if(!dm.sp||dm.spT<=0||dm.spT==null){const m=dm.mem||{x:dm.x,y:dm.y,z:dm.z};dm.sp=facDmSpot(F,m.x,m.y,m.z,1.5,8,false,30)||[m.x,m.y,m.z];dm.spT=6;dm.looks=(dm.looks||0)+1;}
      dm.spT-=dt;res=facDmGo(F,dm.sp[0],dm.sp[1],dm.sp[2],spd,dt);if(res==='there'){spd=0;if(dm.lookB==null)dm.lookB=dm.face;dm.fwant=dm.lookB+Math.sin(dm.stT*1.3)*1.1;if(dm.spT>2)dm.spT=2;}else dm.lookB=null;
      if(dm.stT>18||dm.looks>4){dm.looks=0;facDmState(F,'prowl');D.calm=0;}break;}
    case 'chase':{spd=chaseSpd*(dm.stT<.6?.75:1);const seenAgo=F.t-(dm.mem?dm.mem.t:-99);
      const m=seenAgo<1.2?{x:pl.x,y:pl.y,z:pl.z}:dm.mem;if(!m){facDmState(F,'prowl');break;}res=facDmGo(F,m.x,m.y,m.z,spd,dt);
      if(seenAgo>(D.final?9:5.5)){facDmState(F,'search');}
      if(res==='there'&&seenAgo>1.2){facDmState(F,'search');}
      D.lastChase=F.t;break;}
    case 'reveal':{spd=0;dm.fwant=Math.atan2(dx,dz);if(dm.stT>(dm.revT||.5)){facDmState(F,'chase');dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};}break;}
    case 'stare':{spd=0;dm.fwant=Math.atan2(dx,dz);if(dm.stT>1.3||dist<5){facDmRoar(F,1);facDmState(F,'chase');dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};}break;}
    case 'door':{/* waiting behind a door you are about to open */const d=dm.amb.d;dm.fwant=Math.atan2(d.cx-dm.x,d.cz-dm.z);
      if(Math.abs(d.th)>.3){facDmReveal(F,.35);facSting(F,1.2);}
      else if(Math.hypot(pl.x-d.cx,pl.z-d.cz)<2.1&&facDoorSide(d,pl.x,pl.z)!==facDoorSide(d,dm.x,dm.z)){dm.ambT=(dm.ambT||0)+dt;if(dm.ambT>.7){facDoorOpen(F,d,dm.x,dm.z,true);facDmReveal(F,.25);facSting(F,1.2);F.shake=.5;}}
      if(dm.stT>30){dm.on=false;dm.g.visible=false;facDmState(F,'away');D.awayT=8;}break;}
    case 'vent':{/* in the ceiling above a vent: you hear it, then it drops */const v=dm.amb.v;dm.y=v.y+.4;dm.vis=false;
      dm.scrT=(dm.scrT||0)-dt;const dv=Math.hypot(pl.x-v.x,pl.z-v.z);if(dm.scrT<=0&&dv<14){dm.scrT=1.2+Math.random()*1.4;facDmScrape(F,v,clamp(1-dv/14,.2,1));}
      if(dv<4.2&&Math.abs(pl.y-FCY[v.k])<1.5){/* it drops */v.fall=1;v.vy=0;facDmPlace(F,v.x,v.y-.2,v.z,Math.atan2(pl.x-v.x,pl.z-v.z));dm.drop={vy:0};facDmState(F,'drop');facSting(F,1.2);facSndGrate(F,v);}
      if(dm.stT>35){dm.on=false;dm.g.visible=false;facDmState(F,'away');D.awayT=6;}break;}
    case 'drop':{dm.drop.vy-=16*dt;dm.y+=dm.drop.vy*dt;const g=facGround(F,dm.x,dm.z,dm.y+.05,.1);dm.fwant=Math.atan2(dx,dz);if(dm.y<=g){dm.y=g;facDmLand(F);facDmReveal(F,.4);}break;}
    case 'cross':{spd=6.2;const B=dm.cross;res=facDmGo(F,B[0],B[1],B[2],spd,dt);
      if(!dm.crossSeen&&dm.vis){dm.crossSeen=1;facSting(F,.8);}
      if(dm.sees>0&&!dm.crossSaw){dm.crossSaw=1;if(dist<11&&Math.random()<.4){facDmRoar(F,1);facDmState(F,'chase');dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};break;}}
      if(res==='there'||dm.stT>4.5){dm.on=false;dm.g.visible=false;facDmState(F,'away');D.awayT=8+Math.random()*7;}break;}
    case 'kill':break;
  }
  if(dm.st==='prowl'||dm.st==='inv'||dm.st==='search'){
    /* sees you: a moment to react if you are far, none if you are close */
    if(dm.sees>0){dm.alert=Math.min(1.2,(dm.alert||0)+dt*(dist<7?6:2.2)*dm.sees*(F.U.uPow.value<.3?1.4:1));if(dm.alert>=1){facDmRoar(F,1);facSting(F,.9);facDmState(F,'chase');dm.alert=0;}}
    else dm.alert=Math.max(0,(dm.alert||0)-dt*.25);
    if(dm.heard){dm.mem={x:dm.heard.x,y:dm.heard.y,z:dm.heard.z,t:F.t};const dd=Math.hypot(dm.heard.x-dm.x,dm.heard.z-dm.z);if(dm.heard.r>=30&&dd<16)facDmState(F,'chase');else if(dm.st!=='inv'){facDmState(F,'inv');facDmSniff(F);}}}
  if(dm.st==='chase'&&dm.heard)dm.mem={x:dm.heard.x,y:dm.heard.y,z:dm.heard.z,t:F.t-1.3};
  if(dm.sees>0){D.lastSeen=F.t;}
  /* its body: turn, walk or run, footsteps */
  facDmBody(F,dt,spd>0&&res!=='there'&&res!=='bash'?spd:0);
  /* caught */
  if(dm.on&&(dm.st==='chase'||(dm.st==='reveal'&&dm.stT>.2)||dm.st==='stare')&&Math.hypot(dx,dz)<1.05&&Math.abs(pl.y-dm.y)<1.3&&!HZ.dead&&!HZ.won)facDie(F);
}
function facDmReveal(F,t){const dm=F.dm;dm.on=true;dm.g.visible=true;dm.revT=t;facDmState(F,'reveal');facDmRoar(F,1.1);F.dir.lastChase=F.t;}
function facDmProwlGoal(F){/* somewhere between it and you, drifting closer the longer you go unseen */
  const D=F.dir,pl=F.pl,dm=F.dm,press=clamp((F.t-Math.max(D.lastSeen,D.lastChase))/80,0,1)+(F.fuses*.15)+(D.final?1:0);
  const r=Math.max(3,18-press*13),p=facDmSpot(F,pl.x,pl.y,pl.z,Math.max(1,r*.4),r+4,false,40);return p||[pl.x,pl.y,pl.z];}
function facDmBody(F,dt,spd){
  const dm=F.dm;let df=(dm.fwant==null?dm.face:dm.fwant)-dm.face;df=Math.atan2(Math.sin(df),Math.cos(df));dm.face+=df*Math.min(1,dt*(spd>3?8:5));
  dm.g.position.set(dm.x,dm.y,dm.z);dm.g.rotation.y=dm.face;
  const w=spd>.1?1:0;dm.rw+=(w-dm.rw)*Math.min(1,dt*5);dm.run.setEffectiveWeight(dm.rw);dm.idle.setEffectiveWeight(1-dm.rw);dm.run.timeScale=clamp(spd/5.2,.42,1.6);
  /* lean into a sprint */
  dm.g.rotation.x=0;dm.mix.update(dt);
  if(spd>.1&&dm.on){dm.stp=(dm.stp||0)+dt*spd;if(dm.stp>(spd>3.5?1.5:1.15)){dm.stp=0;facDmStep(F,spd>3.5?1:.5);}}
  if(dm.on&&Math.random()<dt*(dm.st==='chase'?.5:.12))facDmBreath(F);
}
/* is a point inside your view */
function facOnScreen(F,x,y,z){const v=F.tmpV||(F.tmpV=new T.Vector3());v.set(x,y,z).project(cam);return v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.95;}
/* ---------- the director: when it rests, when it stalks, when it ambushes you ---------- */
function facDirector(F,dt){
  const D=F.dir,dm=F.dm,pl=F.pl;D.t+=dt;
  /* a fuse was taken: it knows roughly where you are */
  if(D.alertAt>0&&F.t>=D.alertAt){D.alertAt=-1;if(dm.st==='away'){const p=facDmSpot(F,pl.x,pl.y,pl.z,16,28,true,60);if(p){facDmPlace(F,p[0],p[1],p[2]);dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};facDmState(F,'inv');}}
    else if(dm.st!=='chase'&&dm.st!=='reveal'){dm.mem={x:pl.x+(Math.random()-.5)*4,y:pl.y,z:pl.z+(Math.random()-.5)*4,t:F.t};facDmState(F,'inv');}facDmRoar(F,.6);}
  if(dm.st==='away'){D.awayT-=dt;if(D.awayT<=0){
      /* back on the hunt: an ambush if there is a good one, otherwise it starts prowling somewhere out of sight */
      if(!facAmbush(F)){const p=facDmSpot(F,pl.x,pl.y,pl.z,18,30,true,60);if(p){facDmPlace(F,p[0],p[1],p[2]);facDmState(F,'prowl');}else D.awayT=2;}}}
  /* long quiet stretches end in an ambush */
  const quiet=F.t-Math.max(D.lastSeen,D.lastChase);
  if((dm.st==='prowl'||dm.st==='search')&&quiet>D.ambT&&!facOnScreen(F,dm.x,dm.y+1.2,dm.z)){if(facAmbush(F))D.ambT=32+Math.random()*22;else D.ambT+=6;}
  /* after a chase you got away from, it may leave for a while: silence */
  if(dm.st==='prowl'&&dm.stT>25&&quiet>40&&Math.random()<dt*.04&&!D.final&&!facOnScreen(F,dm.x,dm.y+1.2,dm.z)){dm.on=false;dm.g.visible=false;facDmState(F,'away');D.awayT=10+Math.random()*9;}
  /* the end: it always knows where you are */
  if(D.final){D.fT=(D.fT||0)-dt;if(D.fT<=0){D.fT=6;if(dm.st==='away'){const p=facDmSpot(F,pl.x,pl.y,pl.z,16,26,true,60);if(p){facDmPlace(F,p[0],p[1],p[2]);dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};facDmState(F,'inv');}}
      else if(dm.st!=='chase'&&dm.st!=='reveal'&&dm.st!=='drop'&&dm.st!=='stare'){/* it hears roughly where you are */dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};facDmState(F,'inv');}}}
}
/* set up a scare that the place itself explains: behind a door ahead, in a vent above, round a corner, on the floor above or below */
function facAmbush(F){
  const pl=F.pl,dm=F.dm,yaw=pl.yaw,fx=-Math.sin(yaw),fz=-Math.cos(yaw),ahead=(x,z,a,b)=>{const vx=x-pl.x,vz=z-pl.z,d=Math.hypot(vx,vz);return d>=a&&d<=b&&(vx*fx+vz*fz)/d>.45;};
  const opts=[];
  for(const v of F.vents)if(!v.used&&v.k===facBand(pl.y+.1)&&ahead(v.x,v.z,6,15))opts.push(['vent',v]);
  for(const d of F.doors)if(!d.lock&&Math.abs(d.th)<.05&&Math.abs(d.y-pl.y)<.5&&ahead(d.cx,d.cz,4.5,13))opts.push(['door',d]);
  for(const d of F.doors)if(!d.lock&&Math.abs(d.th)>.9&&Math.abs(d.y-pl.y)<.5&&ahead(d.cx,d.cz,5,14)&&facOnScreen(F,d.cx,d.y+1.2,d.cz))opts.push(['slam',d]);
  if(Math.random()<.5){const lvl=facBand(pl.y+.1),near=pl.x>16&&pl.x<36&&pl.z>12&&pl.z<26;if(near&&(lvl===0||lvl===1))opts.push(['stare',lvl]);}
  opts.push(['corner'],['cross'],['cross']);
  for(let tries=0;tries<4&&opts.length;tries++){const i=(Math.random()*opts.length)|0,o=opts[i];opts.splice(i,1);
    if(o[0]==='vent'){const v=o[1];v.used=true;dm.amb={v};facDmPlace(F,v.x,v.y+.4,v.z);dm.g.visible=false;dm.on=true;facDmState(F,'vent');F.quietT=4;return true;}
    if(o[0]==='door'){const d=o[1],s=-facDoorSide(d,pl.x,pl.z),bx=d.cx+d.nx*s*1.25,bz=d.cz+d.nz*s*1.25;const n=facNodeNear(F,bx,d.y,bz);if(n<0)continue;const p=facNP(F,n);
      if(facSee(F,pl.x,F.camY,pl.z,p[0],p[1]+1.4,p[2],false))continue;dm.amb={d};dm.ambT=0;facDmPlace(F,p[0],p[1],p[2],Math.atan2(d.cx-p[0],d.cz-p[2]));facDmState(F,'door');F.quietT=3;return true;}
    if(o[0]==='slam'){/* a door ahead of you slams shut: it is on the other side */const d=o[1],s=-facDoorSide(d,pl.x,pl.z),n=facNodeNear(F,d.cx+d.nx*s*1.6,d.y,d.cz+d.nz*s*1.6);if(n<0)continue;const p=facNP(F,n);
      if(facSee(F,pl.x,F.camY,pl.z,p[0],p[1]+1.4,p[2],false))continue;facDmPlace(F,p[0],p[1],p[2],Math.atan2(d.cx-p[0],d.cz-p[2]));facDoorClose(F,d,true);d.tgt=0;d.stiff=70;d.damp=5;
      dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};facDmState(F,'search');dm.stT=-4;F.quietT=2.5;facDmBreath(F);return true;}
    if(o[0]==='stare'){const lvl=o[1],ty=lvl===0?FCY[1]:FCY[0];const p=facDmSpot(F,pl.x,ty,pl.z,5,11,false,60);if(!p||Math.abs(p[1]-ty)>.3)continue;
      if(!facSee(F,pl.x,F.camY,pl.z,p[0],p[1]+1.6,p[2],false))continue;facDmPlace(F,p[0],p[1],p[2],Math.atan2(pl.x-p[0],pl.z-p[2]));facDmState(F,'stare');F.quietT=1.5;return true;}
    if(o[0]==='cross'){let C=null;const N=F.nav;
      for(let t=0;t<30&&!C;t++){const ang=yaw+(Math.random()-.5)*.8,dd=9+Math.random()*9,q=facNodeNear(F,pl.x-Math.sin(ang)*dd,pl.y,pl.z-Math.cos(ang)*dd);if(q<0)continue;const M=facNP(F,q);if(Math.abs(M[1]-pl.y)>.6||!ahead(M[0],M[2],8.5,18.5))continue;
        if(!facSee(F,pl.x,F.camY,pl.z,M[0],M[1]+1.2,M[2],false))continue;
        const d=Math.hypot(M[0]-pl.x,M[2]-pl.z),px=-(M[2]-pl.z)/d,pz=(M[0]-pl.x)/d,side=sg=>{for(let s=1.5;s<=5;s+=.5){const q=facNodeNear(F,M[0]+px*s*sg,M[1],M[2]+pz*s*sg);if(q<0)continue;const Q=facNP(F,q);
            if(Math.abs(Q[1]-M[1])<.3&&!facSee(F,pl.x,F.camY,pl.z,Q[0],Q[1]+1.2,Q[2],false)&&!facSee(F,pl.x,F.camY,pl.z,Q[0],Q[1]+.4,Q[2],false))return Q;}return null;};
        const A=side(1),B=side(-1);if(!A||!B)continue;if(!facWalkLine(F,A[0],A[1],A[2],M[0],M[1],M[2])||!facWalkLine(F,M[0],M[1],M[2],B[0],B[1],B[2]))continue;C=Math.random()<.5?[A,B]:[B,A];}
      if(!C)continue;facDmPlace(F,C[0][0],C[0][1],C[0][2],Math.atan2(C[1][0]-C[0][0],C[1][2]-C[0][2]));dm.cross=C[1];dm.crossSeen=0;dm.crossSaw=0;facDmState(F,'cross');F.quietT=1.2;return true;}
    if(o[0]==='corner'){let p=null;for(let t=0;t<50&&!p;t++){const q=facDmSpot(F,pl.x,pl.y,pl.z,9,15,true,20);if(q&&Math.abs(q[1]-pl.y)<.6&&ahead(q[0],q[2],8,16))p=q;}
      if(!p)continue;facDmPlace(F,p[0],p[1],p[2],Math.atan2(pl.x-p[0],pl.z-p[2]));dm.mem={x:pl.x,y:pl.y,z:pl.z,t:F.t};facDmState(F,'chase');F.quietT=2.5;facDmRoar(F,.9);facSting(F,.9);return true;}}
  return false;
}
/* ---------- sound: the room, the ducts, the hum of the tubes, the radio on your belt, your heart, and the creature ---------- */
function facAudioInit(F){
  F.au=null;if(!AC||!nbuf)return;try{
  const A=F.au={},t=AC.currentTime;A.out=AC.createGain();A.out.gain.value=1;A.out.connect(master);
  const len=AC.sampleRate*3|0,b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5;}A.brown=b;
  A.amb=AC.createGain();A.amb.gain.value=0;A.amb.connect(A.out);
  const s1=AC.createBufferSource();s1.buffer=b;s1.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=240;const g1=AC.createGain();g1.gain.value=.6;s1.connect(lp);lp.connect(g1);g1.connect(A.amb);s1.start();
  const s2=AC.createBufferSource();s2.buffer=nbuf;s2.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=520;bp.Q.value=.7;const g2=AC.createGain();g2.gain.value=.045;s2.connect(bp);bp.connect(g2);g2.connect(A.amb);s2.start();A.duct=bp;
  const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=100;const hl=AC.createBiquadFilter();hl.type='lowpass';hl.frequency.value=380;const hg=AC.createGain();hg.gain.value=0;o.connect(hl);hl.connect(hg);hg.connect(A.out);o.start();A.hum=hg;
  A.dIn=AC.createGain();A.dLP=AC.createBiquadFilter();A.dLP.type='lowpass';A.dLP.frequency.value=12000;A.dOut=AC.createGain();A.dOut.gain.value=0;A.dIn.connect(A.dLP);
  if(AC.createStereoPanner){A.dPan=AC.createStereoPanner();A.dLP.connect(A.dPan);A.dPan.connect(A.dOut);}else A.dLP.connect(A.dOut);A.dOut.connect(A.out);
  const s3=AC.createBufferSource();s3.buffer=nbuf;s3.loop=true;const rb=AC.createBiquadFilter();rb.type='bandpass';rb.frequency.value=2300;rb.Q.value=.9;const ws=AC.createWaveShaper();ws.curve=hzCurve();const rg=AC.createGain();rg.gain.value=0;
  s3.connect(rb);rb.connect(ws);ws.connect(rg);rg.connect(A.out);s3.start();A.radio=rg;A.src=[s1,s2,o,s3];A.hb=0;A.br=0;A.ev=12;}catch(e){console.warn('fac audio',e);F.au=null;}
}
function facAudioStop(F){const A=F.au;if(!A)return;try{for(const s of A.src)s.stop();A.out.disconnect();}catch(_){}F.au=null;}
/* a one-off sound from a place in the world: panned, quieter with distance, muffled behind walls */
function facPS(F,x,y,z,fn,vol){const A=F.au;if(!A||muted)return;try{
  const dx=x-F.pl.x,dz=z-F.pl.z,dy=y-F.camY,d=Math.hypot(dx,dy,dz),g=AC.createGain();g.gain.value=(vol||1)*Math.min(1.2,2.2/(1+d*.28));
  const occ=d>2&&!facSee(F,F.pl.x,F.camY,F.pl.z,x,y,z,false);let head=g;
  if(occ){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=700;g.connect(f);head=f;g.gain.value*=.75;}
  if(AC.createStereoPanner){const p=AC.createStereoPanner(),a=Math.atan2(dx,dz)-Math.atan2(-Math.sin(F.pl.yaw),-Math.cos(F.pl.yaw));p.pan.value=clamp(-Math.sin(a)*.85,-1,1);head.connect(p);p.connect(A.out);}else head.connect(A.out);
  fn(g);setTimeout(()=>{try{g.disconnect();}catch(_){}},5000);}catch(_){}}
function facO(F,fn){const A=F.au;if(!A||muted)return;try{fn(A.out);}catch(_){}}
function facSndStep(F,s,v){facO(F,o=>{if(s==='metal'){for(const f of[410,860,1290])sfxT(o,f,f*.97,.16,'sine',.03*v);sfxN(o,.06,.09*v,2400,'bandpass',0,2);sfxT(o,95,50,.08,'sine',.07*v);}
  else if(s==='wet'){sfxN(o,.13,.08*v,1400,'bandpass',0,.6);sfxN(o,.05,.05*v,3800,'highpass');sfxT(o,90,50,.07,'sine',.05*v);}
  else if(s==='tile'){sfxN(o,.045,.07*v,3200,'bandpass',0,1.2);sfxT(o,110,55,.07,'sine',.06*v);}
  else{sfxN(o,.07,.06*v,900,'lowpass');sfxN(o,.03,.03*v,2600,'bandpass',.01,1.5);sfxT(o,95,48,.08,'sine',.06*v);}});}
function facSndCreak(F,d,v){facPS(F,d.cx,d.y+1.1,d.cz,o=>{const t=AC.currentTime,q=AC.createOscillator(),bp=AC.createBiquadFilter(),g=AC.createGain();q.type='sawtooth';const f0=150+Math.random()*60;
  q.frequency.setValueAtTime(f0,t);q.frequency.linearRampToValueAtTime(f0*1.5,t+.35);q.frequency.linearRampToValueAtTime(f0*.85,t+.9);bp.type='bandpass';bp.frequency.value=900+Math.random()*400;bp.Q.value=7;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05*v,t+.08);g.gain.linearRampToValueAtTime(.035*v,t+.6);g.gain.exponentialRampToValueAtTime(.0001,t+1);q.connect(bp);bp.connect(g);g.connect(o);q.start(t);q.stop(t+1.05);
  sfxN(o,.9,.012*v,2200,'bandpass',0,10);});}
function facSndSlam(F,d,v){facPS(F,d.cx,d.y+1.1,d.cz,o=>{sfxT(o,78,32,.45,'sine',.55*v);sfxN(o,.28,.32*v,900);sfxT(o,540,520,.7,'sine',.05*v,.01);sfxT(o,1270,1240,.5,'sine',.03*v,.01);sfxN(o,.06,.15*v,3000,'bandpass',0,2);},1.2);F.shake=Math.max(F.shake||0,.15*v);}
function facSndLatch(F,d){facPS(F,d.cx,d.y+1.1,d.cz,o=>{sfxT(o,1900,900,.035,'square',.035);sfxT(o,110,60,.1,'sine',.12);sfxN(o,.05,.05,2000,'bandpass',0,3);});}
function facSndBang(F,d,v){facPS(F,d.cx,d.y+1.1,d.cz,o=>{sfxT(o,90,45,.25,'sine',.3*v);sfxN(o,.15,.15*v,700);});}
function facSndBump(F,d){facPS(F,d.cx,d.y+1.1,d.cz,o=>{sfxT(o,100,60,.12,'sine',.12);});}
function facSndRattle(F,d){facPS(F,d.cx,d.y+1.1,d.cz,o=>{for(let i=0;i<5;i++){sfxT(o,1500+Math.random()*400,900,.03,'square',.025,i*.07);sfxT(o,140,80,.06,'sine',.08,i*.07);}});}
function facSndClick(F){facO(F,o=>{sfxT(o,2400,1800,.02,'square',.03);sfxT(o,800,600,.03,'square',.02,.02);});}
function facSndPick(F,v){v=v||1;facO(F,o=>{sfxT(o,1250,1250,.12,'sine',.06*v);sfxT(o,1880,1880,.16,'sine',.04*v,.06);sfxN(o,.08,.05*v,4000,'highpass');if(v>.8){sfxT(o,60,60,.5,'sawtooth',.03,.05);}});}
function facSndPlug(F){facO(F,o=>{sfxT(o,140,70,.12,'square',.08);sfxN(o,.1,.12,1200);sfxT(o,50,120,.9,'sawtooth',.04,.1);});}
function facSndAlarm(F){F.alarmN=14;F.alarmT=0;}
function facSndBell(F){facPS(F,35.5,2.6,25,o=>{sfxT(o,880,880,1.6,'sine',.12);sfxT(o,1320,1320,1.3,'sine',.07,.02);sfxT(o,660,660,1.8,'sine',.06,.45);},1.5);}
function facSndLand(F,v){facO(F,o=>{sfxT(o,85,40,.25,'sine',.35*v+.1);sfxN(o,.18,.2*v+.05,600);});}
function facSndGasp(F){facO(F,o=>{sfxN(o,.5,.07,900,'bandpass',0,1.5);sfxN(o,.4,.05,1500,'bandpass',.55,2);});}
function facSndGrate(F,v){facPS(F,v.x,v.y,v.z,o=>{sfxN(o,.35,.25,1800,'bandpass',0,1);sfxT(o,620,300,.4,'square',.04);sfxT(o,90,40,.3,'sine',.3);},1.3);}
function facDO(F,fn){const A=F.au;if(!A||muted)return;try{fn(A.dIn);}catch(_){}}
function facDmStep(F,v){facDO(F,o=>{sfxT(o,82,38,.13,'sine',.5*v);sfxN(o,.08,.18*v,500);sfxN(o,.035,.09*v,2600,'bandpass',.02,3);});}
function facDmBreath(F){facDO(F,o=>{sfxN(o,.9,.07,320,'lowpass');sfxT(o,62+Math.random()*20,48,.9,'sawtooth',.035);sfxN(o,.5,.03,1200,'bandpass',.4,3);});}
function facDmRoar(F,v){facDO(F,o=>{sfxT(o,185,60,1.6,'sawtooth',.2*v);sfxT(o,122,44,1.8,'square',.09*v,.05);sfxN(o,1.6,.3*v,700,'bandpass',0,1.2);sfxT(o,620,1500,.5,'sawtooth',.04*v,.1);});}
function facDmSniff(F){facDO(F,o=>{for(let i=0;i<3;i++)sfxN(o,.12,.12,1800,'bandpass',i*.18,2);});}
function facDmScrape(F,v,k){facDO(F,o=>{const f=280+Math.random()*120;sfxT(o,f,f*.8,1,'sawtooth',.03*k);sfxN(o,1,.08*k,2600,'bandpass',0,5);for(let i=0;i<3;i++)sfxT(o,95,50,.08,'sine',.2*k,.2+i*.28);});}
function facDmLand(F){facDO(F,o=>{sfxT(o,70,30,.4,'sine',.7);sfxN(o,.3,.4,500);});F.shake=Math.max(F.shake||0,.35*clamp(1-F.dmDist/12,0,1));}
function facSting(F,v){try{hzSting(v);}catch(_){}}
function facAudio(F,dt){
  const A=F.au;if(!A||!AC)return;const t=AC.currentTime,dm=F.dm,pl=F.pl,pw=F.U.uPow.value;
  F.quietT=Math.max(0,(F.quietT||0)-dt);
  A.amb.gain.setTargetAtTime(HZ.paused?.01:(F.quietT>0?.012:.13),t,F.quietT>0?.25:1.2);
  A.duct.frequency.setTargetAtTime(460+Math.sin(F.t*.13)*140,t,.5);
  {let best=99;for(const l of F.reflL||[])best=Math.min(best,l.d);A.hum.gain.setTargetAtTime(.022*clamp(1-best/4.5,0,1)*Math.min(1,pw*1.2),t,.3);}
  /* the creature's chain follows it */
  const dx=dm.x-pl.x,dz=dm.z-pl.z,d=Math.hypot(dx,dz,(dm.y-pl.y)*1.2);
  if(dm.on){const occ=!facSee(F,pl.x,F.camY,pl.z,dm.x,dm.y+1.6,dm.z,false);A.dOut.gain.setTargetAtTime(Math.min(1.4,2.4/(1+d*.3)),t,.08);A.dLP.frequency.setTargetAtTime(occ?(d<6?1400:650):14000,t,.12);
    if(A.dPan){const a=Math.atan2(dx,dz)-Math.atan2(-Math.sin(pl.yaw),-Math.cos(pl.yaw));A.dPan.pan.setTargetAtTime(clamp(-Math.sin(a)*.85,-1,1),t,.06);}}
  else A.dOut.gain.setTargetAtTime(0,t,.3);
  /* fear: how close it is and whether it is hunting you */
  const chase=dm.on&&(dm.st==='chase'||dm.st==='reveal'||dm.st==='drop'||dm.st==='stare');
  let fear=dm.on&&dm.st!=='vent'?clamp(1-d/18,0,1):0;if(chase)fear=Math.max(fear,.65);if(dm.st==='vent'&&dm.amb)fear=Math.max(fear,.35*clamp(1-Math.hypot(dm.amb.v.x-pl.x,dm.amb.v.z-pl.z)/12,0,1));
  pl.fear+=(fear-pl.fear)*Math.min(1,dt*(fear>pl.fear?3:.5));F.fearHi=pl.fear>.5;
  /* the radio crackles as it gets closer */
  const rk=dm.on?Math.pow(clamp(1-d/22,0,1),1.4):0;A.radio.gain.setTargetAtTime(rk*.09*(.6+.4*Math.random()),t,.05);
  /* your heart */
  A.hb-=dt;if(pl.fear>.12&&A.hb<=0){const bpm=70+pl.fear*85;A.hb=60/bpm;const v=.12+pl.fear*.35;facO(F,o=>{sfxT(o,68,42,.13,'sine',v);sfxT(o,62,40,.15,'sine',v*.7,.17);});}
  /* breathing when you are spent or scared */
  A.br-=dt;const ex=pl.tired?1:clamp((.45-pl.sta)*2.2,0,1);if(A.br<=0&&(ex>.05||pl.fear>.55)){const k=Math.max(ex,pl.fear*.6);A.br=.85-k*.35;facO(F,o=>{sfxN(o,.32,.045*k,800,'bandpass',0,1.2);sfxN(o,.38,.035*k,1100,'bandpass',.42,1.4);});}
  /* the chase: low drums and a shriek of strings, under the Music setting */
  const mo=MUS&&MUS.on?MUS.gain:null;
  if(mo&&chase){A.dr=(A.dr||0)-dt;if(A.dr<=0){A.dr=.4;sfxT(mo,72,34,.4,'sine',.3);sfxN(mo,.16,.08,300);}
    A.sh=(A.sh||0)-dt;if(A.sh<=0){A.sh=2.6+Math.random()*1.4;const q=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain(),fr=1300+Math.random()*700;q.type='sawtooth';q.frequency.value=fr;lf.frequency.value=12;lg.gain.value=fr*.03;lf.connect(lg);lg.connect(q.frequency);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.025,t+.4);g.gain.exponentialRampToValueAtTime(.0001,t+2);q.connect(g);g.connect(mo);q.start(t);q.stop(t+2.1);lf.start(t);lf.stop(t+2.1);}}
  /* the alarm after the breaker */
  if(F.alarmN>0){F.alarmT-=dt;if(F.alarmT<=0){F.alarmT=.9;F.alarmN--;facPS(F,27,2.6,20.3,o=>{sfxT(o,520,520,.42,'square',.05);sfxT(o,390,390,.42,'square',.05,.45);},1.4);}}
  /* the building: distant bangs, pipes, steps that are not yours, a voice on the radio */
  A.ev-=dt;if(A.ev<=0&&!chase){A.ev=12+Math.random()*16;const r=Math.random(),pan=fn=>sfxPan(fn,Math.random()*1.8-.9);
    if(r<.25)pan(o=>{sfxN(o,.5,.12,170);sfxT(o,68,30,.6,'sine',.14);});
    else if(r<.45)pan(o=>{sfxT(o,140,95,2.4,'sawtooth',.012);sfxN(o,2.2,.02,400,'bandpass',0,3);});
    else if(r<.62&&!dm.on)hzS(o=>{for(let i=0;i<4;i++){sfxN(o,.07,.05,420,'lowpass',i*.4);sfxT(o,90,45,.08,'sine',.06,i*.4);}});
    else if(r<.85)facRadioVoice(F);
    else pan(o=>{for(let i=0;i<3;i++)sfxN(o,.04,.05,6000,'highpass',i*.5+Math.random()*.2);});}
}
/* a few seconds of someone talking on the radio, too broken up to understand */
function facRadioVoice(F){facO(F,o=>{const t=AC.currentTime,bp=AC.createBiquadFilter(),ws=AC.createWaveShaper(),g=AC.createGain();bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=1.1;ws.curve=hzCurve();bp.connect(ws);ws.connect(g);g.connect(o);g.gain.value=.018;
  const q=AC.createOscillator();q.type='sawtooth';const f1=AC.createBiquadFilter(),f2=AC.createBiquadFilter();f1.type=f2.type='bandpass';f1.frequency.value=650;f2.frequency.value=1150;f1.Q.value=f2.Q.value=5;q.connect(f1);q.connect(f2);f1.connect(bp);f2.connect(bp);
  let tt=t;const n=4+(Math.random()*5|0);for(let i=0;i<n;i++){const dur=.12+Math.random()*.22;q.frequency.setValueAtTime(105+Math.random()*50,tt);q.frequency.linearRampToValueAtTime(95+Math.random()*60,tt+dur);f1.frequency.setValueAtTime(500+Math.random()*400,tt);f2.frequency.setValueAtTime(1000+Math.random()*600,tt);tt+=dur+Math.random()*.12;}
  q.start(t);q.stop(tt+.1);sfxN(o,.15,.05,2600,'bandpass',0,1);sfxN(o,.15,.05,2600,'bandpass',tt-t,1);});}
/* ---------- the camera: smooth over stairs, a little bob and lean, tilt when you are spent or scared ---------- */
function facCam(F,dt){
  const pl=F.pl,H=HZ;
  if(!H.dead){const eye=pl.crouch?FAC.eyeC:FAC.eye;pl.ch+=(eye-pl.ch)*Math.min(1,dt*9);const tg=pl.y+pl.ch;
    if(!pl.ground)F.camY=tg;else if(tg>F.camY)F.camY+=(tg-F.camY)*Math.min(1,dt*13);else F.camY=Math.max(tg,F.camY-Math.max(dt*1.2,(F.camY-tg)*Math.min(1,dt*15)));
    F.dip=(F.dip||0)*Math.exp(-dt*5);
    const ba=pl.bobA*(F.running?1.45:pl.crouch?.55:1),by=Math.sin(pl.bob*2)*.03*ba-F.dip,bx=Math.sin(pl.bob)*.02*ba;
    let yr=pl.yaw-(F.lastYaw==null?pl.yaw:F.lastYaw);yr=Math.atan2(Math.sin(yr),Math.cos(yr))/Math.max(dt,1e-3);F.lastYaw=pl.yaw;
    const cy=Math.cos(pl.yaw),sy=Math.sin(pl.yaw),strafe=pl.vx*cy-pl.vz*sy,tired=pl.tired?1:clamp((.35-pl.sta)*2.8,0,1);
    const rollT=-strafe*.007-clamp(yr,-5,5)*.005+Math.sin(F.t*1.7)*.035*tired+Math.sin(F.t*.9+1)*.025*pl.fear;
    pl.roll+=(rollT-pl.roll)*Math.min(1,dt*4.5);
    F.shake=(F.shake||0)*Math.exp(-dt*5);const sk=F.shake;
    cam.position.set(pl.x+cy*bx+(Math.random()-.5)*sk*.06,F.camY+by+(Math.random()-.5)*sk*.05,pl.z-sy*bx);
    cam.rotation.set(pl.pitch+Math.sin(pl.bob*2+.6)*.004*ba+Math.sin(F.t*2.3)*.012*tired,pl.yaw,pl.roll);}
  /* field of view from the settings, wider when sprinting */
  {const base=(F.running?79:74)+((meta.fov||74)-74)*(cam.aspect>1.6?.5:.8)-pl.fear*2,tf=Math.min(base,cam.aspect>1.6?100:112);if(Math.abs(cam.fov-tf)>.05){cam.fov+=(tf-cam.fov)*Math.min(1,dt*6);cam.updateProjectionMatrix();}}
  cam.updateMatrixWorld();
  /* the hand and flashlight trail the view a little, and the beam goes where the hand points */
  const Hd=F.hand;F.hy=F.hy==null?pl.yaw:F.hy;F.hp=F.hp==null?pl.pitch:F.hp;
  let dy=pl.yaw-F.hy;dy=Math.atan2(Math.sin(dy),Math.cos(dy));F.hy+=dy*Math.min(1,dt*13);F.hp+=(pl.pitch-F.hp)*Math.min(1,dt*13);
  const lagY=clamp(Math.atan2(Math.sin(F.hy-pl.yaw),Math.cos(F.hy-pl.yaw)),-.25,.25),lagP=clamp(F.hp-pl.pitch,-.25,.25),ba=pl.bobA*(F.running?1.6:1);
  const off=(F._v1||(F._v1=new T.Vector3())).set(.16+lagY*.12+Math.sin(pl.bob)*.012*ba,-.19-lagP*.1+Math.abs(Math.sin(pl.bob))*-.01*ba-(F.running?.03:0),-.36);
  off.applyQuaternion(cam.quaternion);Hd.g.position.copy(cam.position).add(off);
  Hd.g.quaternion.copy(cam.quaternion);Hd.g.rotateY(lagY*.9+.05);Hd.g.rotateX(lagP*.9+(F.running?-.12:0)+Math.sin(pl.bob*2)*.02*ba);Hd.g.rotateZ(pl.roll*.5);
  Hd.g.visible=!H.dead&&!H.won;Hd.g.updateMatrixWorld(true);
  const lp=F._v2||(F._v2=new T.Vector3());Hd.lens.getWorldPosition(lp);const ld=(F._v3||(F._v3=new T.Vector3())).set(0,0,-1).applyQuaternion(Hd.g.quaternion).normalize();
  {const LM=F.lamp||(F.lamp={});LM.x=lp.x;LM.y=lp.y;LM.z=lp.z;LM.dx=ld.x;LM.dy=ld.y;LM.dz=ld.z;}
  /* the beam: weak, and weaker and flickering as the battery dies */
  const lowB=pl.bat<.22?(.55+pl.bat*2)*(Math.random()<(.22-pl.bat)*1.2?.25:1):1,on=pl.light&&!H.won?1.75*lowB:0;F.lightK=on;
  const U=F.U;U.uCam.value.copy(cam.position);U.uLP.value.copy(lp);U.uLD.value.copy(ld);U.uLOn.value=on;U.uLCos.value.set(Math.cos(.2),Math.cos(.42));
  F.spot.position.copy(lp);F.spot.target.position.set(lp.x+ld.x*5,lp.y+ld.y*5,lp.z+ld.z*5);F.spot.intensity=on*1.3;F.spot.target.updateMatrixWorld();
  if(F.shadows){F.spot.castShadow=on>0;U.uShOn.value=on>0&&F.spot.shadow.map?1:0;if(F.spot.shadow.map)U.uShM.value=F.spot.shadow.map.texture;}
  F.beam.position.copy(lp);F.beam.quaternion.copy(Hd.g.quaternion);F.beam.visible=on>0;F.beam.material.uniforms.uK.value=.045;
  Hd.lens.material.color.setRGB(on?1:.15,on?.96:.15,on?.85:.14);
  /* the hand is lit by the light where you stand */
  {const p=facProbe(F.W,pl.x,F.camY,pl.z),k=1.4,r=Math.min(1,p[0]*k*U.uPow.value+p[3]*k*U.uEmg.value+.035),g=Math.min(1,p[1]*k*U.uPow.value+p[4]*k*U.uEmg.value+.035),b=Math.min(1,p[2]*k*U.uPow.value+p[5]*k*U.uEmg.value+.035);
    Hd.amb.color.setRGB(r*.55,g*.55,b*.55);Hd.amb.intensity=1;Hd.key.color.setRGB(r,g,b);Hd.key.intensity=1.1;Hd.key.position.copy(cam.position).add((F._v4||(F._v4=new T.Vector3())).set(-.6,1.2,.6).applyQuaternion(cam.quaternion));Hd.key.target.position.copy(Hd.g.position);Hd.key.target.updateMatrixWorld();}
  /* light on the creature: the light where it stands, and your beam */
  {const dm=F.dm,p=facProbe(F.W,dm.x,dm.y+1.2,dm.z),k=.8;F.amb.color.setRGB(Math.min(1,p[0]*k*U.uPow.value+p[3]*k*U.uEmg.value+.015),Math.min(1,p[1]*k*U.uPow.value+p[4]*k*U.uEmg.value+.012),Math.min(1,p[2]*k*U.uPow.value+p[5]*k*U.uEmg.value+.012));F.amb.intensity=1;
    /* and the nearest working tube lights it from where it really is, so it has shape */
    F.dmLT=(F.dmLT||0)-dt;if(F.dmLT<=0||dt===0){F.dmLT=.25;let best=null,bd=9;for(const l of F.W.lights){if(l.dead||l.px==null)continue;const d=Math.hypot(l.px-dm.x,l.py-dm.y-1.2,l.pz-dm.z);if(d<bd&&facSee(F,l.px,l.py-.15,l.pz,dm.x,dm.y+1.4,dm.z,false)){bd=d;best=l;}}F.dmBest=best;}
    const l=F.dmBest;if(l&&dm.vis){const c=FLC[l.col]||FLC.cyan,kk=(l.dim||1)*(l.col==='red'?U.uEmg.value:U.uPow.value)*1.6;F.dmL.position.set(l.px,l.py-.1,l.pz);F.dmL.color.setRGB(c[0],c[1],c[2]);F.dmL.intensity=kk;}else F.dmL.intensity=0;}
  F.dust.material.uniforms.uBox.value.copy(cam.position);F.dust.material.uniforms.uT.value=F.t;if(F.shafts)F.shafts.material.uniforms.uT.value=F.t;
  /* the nearest tubes are reflected in wet floors */
  F.reflT=(F.reflT||0)-dt;if(F.reflT<=0){F.reflT=.2;const L=[];for(const l of F.W.lights){if(l.dead||l.px==null)continue;const d=Math.hypot(l.px-cam.position.x,(l.py-cam.position.y)*.8,l.pz-cam.position.z);if(d>15)continue;L.push({l,d});}
    L.sort((a,b)=>a.d-b.d);const out=[];for(const c of L){if(out.length>=4)break;if(c.d<5||facSee(F,cam.position.x,cam.position.y,cam.position.z,c.l.px,c.l.py-.15,c.l.pz,false))out.push(c);}F.reflL=out;}
  for(let i=0;i<4;i++){const c=F.reflL&&F.reflL[i];if(!c){U.uRL.value[i].set(0,-50,0,0);U.uRA.value[i].set(0,0,0,0);U.uRC.value[i].set(0,0,0);continue;}const l=c.l,ax=l.wallL?0:l.ax==='x'?.6:0,az=l.wallL?0:l.ax==='x'?0:.6,col=FLC[l.col]||FLC.cyan,k=(l.dim||1)*(l.col==='red'?U.uEmg.value*.8:U.uPow.value)*1.4;
    U.uRL.value[i].set(l.px,l.py-.06,l.pz,1);U.uRA.value[i].set(ax,0,az,0);U.uRC.value[i].set(col[0]*k,col[1]*k,col[2]*k);}
  /* draw only what is near enough to see through the fog */
  F.culT=(F.culT||0)-dt;if(F.culT<=0||dt===0){F.culT=.12;const cx=cam.position.x,cy_=cam.position.y,cz=cam.position.z;
    /* your level, plus the level above or below only near a stairwell, the atrium or the broken floor */
    const pb=facBand(cy_-1),vb=[false,false,false];vb[pb]=true;
    for(const o of F.vOpen){const ddx=Math.max(o.x0-cx,0,cx-o.x1),ddz=Math.max(o.z0-cz,0,cz-o.z1),d=Math.hypot(ddx,ddz);if(d>10)continue;if(o.b0===pb||o.b1===pb){vb[o.b0]=vb[o.b1]=true;}if(d<.6)for(let b=Math.min(o.b0,o.b1);b<=Math.max(o.b0,o.b1);b++)vb[b]=true;}
    if(F.dm.on&&F.dm.vis)vb[facBand(F.dm.y+.5)]=true;F.vb=vb;
    for(const m of F.meshes){const s=m.geometry.boundingSphere;m.visible=vb[m.userData.band]&&Math.hypot(s.center.x-cx,(s.center.y-cy_)*1.2,s.center.z-cz)-s.radius<34;}
    for(const d of F.doors)d.mesh.visible=vb[facBand(d.y+.5)]&&Math.hypot(d.cx-cx,d.y+1-cy_,d.cz-cz)<30;
    for(const v of F.vents){const on=vb[v.k]&&Math.hypot(v.x-cx,v.z-cz)<26;v.gr.visible=on||v.fall;if(v.hole)v.hole.visible=on;}
    /* the creature is only drawn when you could see it */
    const dm=F.dm;let v=dm.on&&dm.st!=='vent'&&dm.st!=='away';if(v){const dd=Math.hypot(dm.x-cx,dm.y+1.2-cy_,dm.z-cz);if(dd>34)v=false;else if(dd>2.6){const fr=F.frus||(F.frus=new T.Frustum()),m4=F.m4||(F.m4=new T.Matrix4());m4.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(m4);
        const sp=F.sph||(F.sph=new T.Sphere());sp.center.set(dm.x,dm.y+1.1,dm.z);sp.radius=1.5;if(!fr.intersectsSphere(sp))v=false;else v=facSee(F,cx,cy_,cz,dm.x,dm.y+1.9,dm.z,false)||facSee(F,cx,cy_,cz,dm.x,dm.y+1,dm.z,false)||facSee(F,cx,cy_,cz,dm.x,dm.y+.3,dm.z,false);}}
    if(window.__facHideDm)v=false;dm.vis=v;dm.g.visible=v;}
  /* 3.16: which kind of light you stand in (cold teal concrete or the warm offices) steers the colour grade */
  {const p=facProbe(F.W,pl.x,F.camY,pl.z),pw=U.uPow.value,em=U.uEmg.value,rr=p[0]*pw+p[3]*em,bb=p[2]*pw+p[5]*em,z=clamp((rr/(bb+.02)-.35)/.9,0,1);F.zone=F.zone==null?z:F.zone+(z-F.zone)*Math.min(1,dt*2.5);}
  if(F.post){const P=F.post.mat.uniforms;P.uTime.value=F.t;P.uZone.value=F.zone;P.uCA.value=.0035+pl.fear*.006+(F.shake||0)*.01;P.uGrain.value=.055+pl.fear*.03;P.uVig.value=.5+pl.fear*.25;P.uFear.value=pl.fear*.5;P.uHurt.value=Math.max(0,(P.uHurt.value||0)-dt*1.5);}
}
/* ---------- the screen ---------- */
function facHudInit(F){
  const u=$('hzui');if(!u)return;u.classList.add('fac');
  if(!$('facst')){const st=document.createElement('style');st.id='facst';st.textContent='#hzui.fac #hzdark,#hzui.fac #hzgrain,#hzui.fac #hzvig,#hzui.fac #hzhp,#hzui.fac #hzeye,#hzui.fac #hzbreath,#hzui.fac #hzarrow{display:none!important}'+
    '#hzui.fac #hzdist{font-size:clamp(13px,3vh,20px)}#hzui.fac #hzbest{font-size:10px;max-width:46vw;line-height:1.5}'+
    '#hzui.fac #hzsta{position:fixed;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);width:clamp(120px,24vw,220px);height:4px;opacity:0;transition:opacity .4s;border:0;background:rgba(255,255,255,.12)}#hzui.fac #hzsta i{background:rgba(230,225,210,.75)}#hzui.fac #hzsta.on{opacity:1}#hzui.fac #hzsta.tired i{background:#c85a3a}'+
    '#fcross{position:fixed;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:rgba(255,255,255,.35);transition:transform .15s,background .15s}#fcross.on{transform:scale(1.8);background:rgba(255,230,180,.9)}'+
    '#hzui.fac #hztip{bottom:28%}#hzui.fac #hzkeys{font-size:10px}#hzui.fac.dead .top,#hzui.fac.dead #hzkeys,#hzui.fac.dead #hztip,#hzui.fac.dead #hzmsg,#hzui.fac.dead #fcross,#hzui.fac.dead #hzpz,#hzui.fac.dead #hzsta{visibility:hidden}';document.head.appendChild(st);}
  if(!$('fcross')){const c=document.createElement('div');c.id='fcross';u.appendChild(c);}
}
function facTip(F,t,s){F.tipUntil=F.t+(s||2);hzTip(t,s||2);}
function facSay(F,t,s){hzSay(t,s||2);}
function facHud(F){
  const pl=F.pl,set=(id,v)=>{const e=$(id);if(e&&e.textContent!==v)e.textContent=v;};
  set('hzdist',F.stage==='find'?(F.fuses<3?'FUSES '+F.fuses+' / 3':'BREAKER '+F.brk.n+' / 3'):F.stage==='wait'?'THE LIFT · '+Math.ceil(Math.max(0,F.lift.arrive-F.t))+' s':'GET IN THE LIFT');
  {const hint=F.stage==='find'?(F.fuses<3?'One fuse on each level. The breaker is by the freight lift, in the basement.':'Put the fuses in the breaker by the freight lift (basement).'):F.stage==='wait'?'Stay alive.':'The lift is open.';
    /* 3.16: the long hint shows when it changes, then fades, so the screen stays clean like the reference */
    if(hint!==F.hintTx){F.hintTx=hint;F.hintT=F.t;}set('hzbest',hint);const e=$('hzbest');if(e){const o=F.t-F.hintT<14?'1':'0';if(e.style.opacity!==o){e.style.transition='opacity 1.6s';e.style.opacity=o;}}}
  const st=$('hzsta');if(st){const on=pl.sta<.995||F.running;if(st.classList.contains('on')!==on)st.classList.toggle('on',on);if(st.classList.contains('tired')!==pl.tired)st.classList.toggle('tired',pl.tired);const w=Math.round(pl.sta*100)+'%';if(st.firstChild.style.width!==w)st.firstChild.style.width=w;}
  set('hzkeys',(pl.light?'LIGHT ':'LIGHT OFF · ')+Math.round(pl.bat*100)+'%'+(F.held&&F.fuses===3?'':'' ));
  const a=F.aim,c=$('fcross');if(c&&c.classList.contains('on')!==!!a)c.classList.toggle('on',!!a);
  if(F.t>(F.tipUntil||0)){let t='';if(a){const k=isTouch?'USE · ':'E · ';if(a.t==='door')t=k+(a.d.lock?'LOCKED':Math.abs(a.d.th)<.6&&Math.abs(a.d.tgt)<.6?'OPEN':'CLOSE');else if(a.t==='fuse')t=k+'TAKE THE FUSE';else if(a.t==='bat')t=k+'TAKE THE BATTERY';else if(a.t==='brk')t=F.held>0?k+'PUT IN A FUSE':'BREAKER '+F.brk.n+' / 3';}
    const m=$('hztip');if(m){if(m.textContent!==t)m.textContent=t;const o=t?'1':'0';if(m.style.opacity!==o)m.style.opacity=o;}}
}
/* ---------- each frame ---------- */
function facSize(F){
  const H=HZ,w=gameEl.clientWidth||innerWidth,h=gameEl.clientHeight||innerHeight,a=w/Math.max(1,h);let q=1;try{q=qFactor();}catch(_){}
  if(F.rs==null)F.rs=isTouch?.85:1;
  const RH=Math.max(Math.min(360,h),Math.min(h*Math.min(2,devicePixelRatio||1),window.__hzRH||Math.min(900,640*clamp(q,.6,1.35))*F.rs))|0,RW=Math.min(1700,Math.round(RH*a));
  const cv=renderer.domElement;if(cv.width!==RW||cv.height!==RH){renderer.setSize(RW,RH,false);cam.aspect=a;cam.updateProjectionMatrix();}
  if(F.post)F.post.size(RW,RH);
}
function facTick(dt){
  const H=HZ,F=H&&H.fac;if(!F||!F.pl)return;if(window.__facManual&&!window.__facStep)return;
  facSize(F);
  if(H.loading||H.paused){facCam(F,0);if(F.au&&AC)F.au.amb.gain.setTargetAtTime(.01,AC.currentTime,.3);return;}
  dt=Math.min(dt,1/20);F.t+=dt;H.t=F.t;
  {const now=performance.now(),rd=H.lastNow?(now-H.lastNow)/1000:.016;H.lastNow=now;H.fpsA=(H.fpsA||60)*.95+(1/Math.max(.001,rd))*.05;
    /* 3.16: hold the frame rate by changing the render size a step at a time (never below 360 lines) */
    if(rd<.25&&!window.__facManual&&!window.__hzRH){F.ftA=F.ftA==null?16.7:F.ftA*.94+rd*1000*.06;F.rsT=(F.rsT||0)+rd;
      if(F.rsT>1.2){F.rsT=0;if(F.ftA>19.5&&F.rs>.5){F.rs=Math.max(.5,F.rs*.87);F.rsGood=0;}else if(F.ftA<13.5&&F.rs<1){if(++F.rsGood>=3){F.rs=Math.min(1,F.rs*1.06);F.rsGood=0;}}else F.rsGood=0;H.lowRes=F.rs<.72;}}}
  if(H.dead){facDeadTick(F,dt);facAudio(F,dt);return;}
  if(H.won){facWinTick(F,dt);facCam(F,dt);return;}
  facPlayer(F,dt);facDoorsTick(F,dt);facDemonTick(F,dt);facDirector(F,dt);facItems(F,dt);
  for(const v of F.vents)if(v.fall){v.vy-=14*dt;v.gr.position.y+=v.vy*dt;v.gr.rotation.x+=dt*3;const g=facGround(F,v.x,v.z,v.gr.position.y+.3,.4);if(v.gr.position.y<g+.02){v.gr.position.y=g+.02;v.gr.rotation.x=0;v.fall=0;}}
  facCam(F,dt);facAudio(F,dt);facHud(F);
  if(H.dead)return;
}
function facRender(){
  const H=HZ,F=H&&H.fac;if(!F||!F.post){if(H&&H.scene)renderer.render(H.scene,cam);return;}
  const P=F.post,ac=renderer.autoClear;
  renderer.setRenderTarget(P.rt);renderer.autoClear=true;renderer.render(F.scene,cam);
  if(F.hand.g.visible){renderer.autoClear=false;renderer.clearDepth();renderer.render(F.hand.sc,cam);}
  renderer.setRenderTarget(null);renderer.autoClear=true;renderer.render(P.sc,P.cam);renderer.autoClear=ac;
}
/* ---------- caught ---------- */
function facDie(F){
  const H=HZ;if(H.dead)return;H.dead=true;F.deadT=0;F.dm.st='kill';F.dm.on=true;F.dm.g.visible=true;
  try{if(document.pointerLockElement)document.exitPointerLock();}catch(_){}
  try{$('hzui').classList.add('dead');}catch(_){}hzScream();F.shake=1.2;F.dieYaw=null;try{vib&&vib([120,40,200]);}catch(_){}if(F.post)F.post.mat.uniforms.uHurt.value=.35;
  const tm=F.t;H.result={txt:'Fuses '+F.fuses+' of 3 · '+hsClock(tm)};
}
function facDeadTick(F,dt){
  const H=HZ,dm=F.dm,pl=F.pl;F.deadT+=dt;if(F.dieYaw==null){F.dieYaw=Math.atan2(-(dm.x-pl.x),-(dm.z-pl.z));F.dieY=F.camY;}
  /* you are spun round to face it, and it puts its face right up to yours */
  let d=F.dieYaw-pl.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));pl.yaw+=d*Math.min(1,dt*16);pl.pitch+=(.02-pl.pitch)*Math.min(1,dt*10);
  const fx=-Math.sin(F.dieYaw),fz=-Math.cos(F.dieYaw),k=Math.min(1,F.deadT/.16),near=.95-.42*k;
  const tgt=[pl.x+fx*near,F.dieY-.06,pl.z+fz*near];
  dm.face=Math.atan2(-fx,-fz);dm.g.rotation.y=dm.face;dm.rw+=(0-dm.rw)*Math.min(1,dt*8);dm.run.setEffectiveWeight(dm.rw);dm.idle.setEffectiveWeight(1-dm.rw);dm.mix.update(dt*.6);
  dm.g.position.set(dm.x,dm.y,dm.z);dm.g.updateMatrixWorld(true);
  let ox=0,oy=2.02,oz=0;if(dm.head){const v=F.tmpH||(F.tmpH=new T.Vector3());dm.head.getWorldPosition(v);ox=v.x-dm.x;oy=v.y-dm.y;oz=v.z-dm.z;}
  const rx=tgt[0]-ox,ry=tgt[1]-oy,rz=tgt[2]-oz,a=Math.min(1,dt*(F.deadT<.2?30:12));dm.x+=(rx-dm.x)*a;dm.y+=(ry-dm.y)*a;dm.z+=(rz-dm.z)*a;dm.g.position.set(dm.x,dm.y,dm.z);
  F.shake=Math.max(F.shake*.97,.3);
  cam.position.set(pl.x+(Math.random()-.5)*.03*F.shake,F.dieY+(Math.random()-.5)*.03*F.shake,pl.z);cam.rotation.set(pl.pitch,pl.yaw,(Math.random()-.5)*.05*F.shake);cam.updateMatrixWorld();
  F.U.uCam.value.copy(cam.position);dm.vis=true;dm.g.visible=true;F.hand.g.visible=false;F.beam.visible=false;
  /* your light swings up into its face */
  F.U.uLP.value.copy(cam.position);F.U.uLD.value.set(fx,0,fz);F.U.uLOn.value=F.pl.light?1.75:0;F.spot.position.copy(cam.position);F.spot.target.position.set(cam.position.x+fx*3,cam.position.y,cam.position.z+fz*3);F.spot.intensity=F.pl.light?1.6:.6;
  if(F.post){const P=F.post.mat.uniforms;P.uCA.value=.009+F.shake*.006;P.uFear.value=.8;P.uGrain.value=.1;P.uHurt.value=Math.max(0,.35-F.deadT*.3);P.uFade.value=F.deadT>1.15?Math.max(0,1-(F.deadT-1.15)*1.8):1;}
  if(F.deadT>1.65&&!H.shown){H.shown=1;const o=$('hzover');o.classList.add('on');$('hzot').className='';$('hzot').textContent='IT CAUGHT YOU';$('hzop').textContent=H.result.txt;$('hzres').style.display='none';}
}
/* ---------- out ---------- */
function facWin(F){const H=HZ;if(H.won)return;H.won=true;F.winT=0;try{$('hzui').classList.add('dead');}catch(_){}F.lift.want=0;F.pl.vx=F.pl.vz=0;
  const tm=F.t,best=meta.facBest&&meta.facBest<tm?meta.facBest:tm,nb=!meta.facBest||tm<meta.facBest;meta.facBest=best;try{save();}catch(_){}
  H.result={txt:'Escaped in '+hsClock(tm)+(nb?' · NEW BEST':' · best '+hsClock(best))};facSay(F,'',.1);}
function facWinTick(F,dt){
  const H=HZ,pl=F.pl;F.winT+=dt;F.lift.open=Math.max(0,F.lift.open-dt*.6);for(const d of F.lift.doors)d.g.position.z=25+d.s*(.75+F.lift.open*1.45);
  /* turn to watch the doors close */
  let d=-Math.PI/2-pl.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));pl.yaw+=d*Math.min(1,dt*3);pl.pitch+=(-.05-pl.pitch)*Math.min(1,dt*3);
  if(F.winT>1.5&&!F.rumble){F.rumble=1;facO(F,o=>{sfxT(o,55,40,3,'sawtooth',.05);sfxN(o,3,.08,200);});}
  F.dm.st==='chase'&&facDemonTick(F,dt);
  if(F.post)F.post.mat.uniforms.uFade.value=F.winT>2.4?Math.max(0,1-(F.winT-2.4)*.7):1;
  if(F.winT>4&&!H.shown){H.shown=1;const o=$('hzover');o.classList.add('on');$('hzot').className='win';$('hzot').textContent='YOU ESCAPED';$('hzop').textContent=H.result.txt;$('hzres').style.display='none';}
}
/* ---------- leaving: give back everything the mode borrowed ---------- */
function facDispose(H,keep){
  const F=H.fac;if(!F)return;
  try{facAudioStop(F);}catch(_){}
  try{if(HZA){if(F.dmat0)HZA.mesh.material=F.dmat0;if(HZA.root.parent)HZA.root.parent.remove(HZA.root);}if(F.dm&&F.dm.mix)F.dm.mix.stopAllAction();if(F.dmat)F.dmat.dispose();}catch(_){}
  /* what belongs to this run only: doors, pickups, the hand, the lift doors */
  const kept=new Set();if(keep&&FACW){for(const o of FACW.geos)kept.add(o.g);for(const o of[FACW.shafts,FACW.dust,FACW.beam,FACW.halo])if(o)kept.add(o.geometry);}
  try{const seen=new Set();const dis=o=>{if(o.geometry&&!seen.has(o.geometry)&&!kept.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}};if(F.scene)F.scene.traverse(dis);if(F.hand)F.hand.sc.traverse(dis);}catch(_){}
  try{if(F.hand)for(const m of F.hand.mats)m.dispose();if(F.glowMat){F.glowMat.map.dispose();F.glowMat.dispose();}if(F.handleMat)F.handleMat.dispose();for(const m of F.liftMats||[])m.dispose();if(F.ventMat)F.ventMat.dispose();}catch(_){}
  if(!keep){try{for(const k in F.M){const m=F.M[k];for(const t of m.userData.tex||[])t.dispose();m.dispose();}for(const o of[F.shafts,F.dust,F.beam,F.halo])if(o)o.material.dispose();if(F.post)F.post.dispose();}catch(_){}FACW=null;}
  try{renderer.setRenderTarget(null);$('view').classList.remove('hzfac');if(F.spot){F.spot.castShadow=false;if(F.spot.shadow.map){F.spot.shadow.map.dispose();F.spot.shadow.map=null;}}renderer.shadowMap.enabled=!!F.shadow0;if(F.U){F.U.uShM.value=null;F.U.uShOn.value=0;}if(HZA)HZA.mesh.castShadow=false;}catch(_){}
  H.fac=null;H.scene=null;
}
