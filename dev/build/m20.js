/* ===== BUILD 3.6: the King can be beaten, the last elevator has a cutscene, the Golden Meadow is prettier ===== */

/* ---- 1. Floor 51 King ----
   Why he felt invincible: when a boss enters a new phase it puts up a shield for 2 seconds (it takes only 8% damage).
   The shield timer is counted down by the boss's model animation, and the King's model has no such animation,
   so his 2-second shield never ended. He also healed up to 25% with every Mend in his spell cycles. */
function bossArm(e){/* ends a phase shield on time, whatever model the boss uses */
  if(e.b2arm<1&&e.b2armT&&time>e.b2armT){e.b2armT=0;e.b2shT=0;if(e.M&&e.M.b2sh)e.M.b2sh.visible=false;
    const b=B2&&B2.e===e?B2:null;e.b2arm=b&&e.type!=='king'?[1,.85,.7][b.ph]||1:1;}
  return e.b2arm;
}
function kingHeal(e,f){/* the King may heal a little, at most once every 15 seconds */
  if(e.dead||time<(e.kingHealT||0))return;e.kingHealT=time+15;
  const a=Math.round(e.maxHp*f);e.hp=Math.min(e.maxHp,e.hp+a);
  try{floatText(e.x,e.y+e.h+1,e.z,'+'+a,'heal');ringFx(e.x,e.z,.3,2.2,0x7aff9a,.5);}catch(_){}
}

/* ---- 2. Cutscene: leaving Gloomspire on the last elevator ---- */
let CUT=null;
function cutCamSpot(cx,cz,dx,dz,want){/* the farthest spot up to `want` metres back along (dx,dz) that is not inside a wall */
  let d=want;for(let i=0;i<10;i++){const x=cx+dx*d,z=cz+dz*d;if(!blocked(x,z,.35)&&los(cx,cz,x,z))return d;d*=.82;}return Math.max(1.4,d);
}
function endCutStart(){
  if(CUT||endingStarted)return;
  const eg=L&&L.finalElevator;if(!eg||state!=='play'){startEndingScene();return;}
  firing=false;for(const k in keys)keys[k]=0;try{resetTouch();}catch(_){}try{unlock();}catch(_){}
  const cx=eg.position.x,cz=eg.position.z;
  /* the hero, built from the character you play */
  const M=new Model();
  try{const c=(CH&&CH.look)?CH:CHARS.find(q=>q.id===(CH&&CH.id))||CHARS[0];mkHuman(M,c.look);}catch(_){try{bKnight(M);}catch(__){}}
  let sx=P.x,sz=P.z;if(Math.hypot(sx-cx,sz-cz)<.6){sx=cx+Math.sin(P.yaw)*1.4;sz=cz+Math.cos(P.yaw)*1.4;if(blocked(sx,sz,.3)){sx=P.x;sz=P.z;}}
  M.g.position.set(sx,0,sz);lvl.add(M.g);
  /* a stone and iron lift disc under the ring */
  const pg=new T.Group();
  const disc=new T.Mesh(new T.CylinderGeometry(1.55,1.65,.22,18),new T.MeshLambertMaterial({color:0x4a443c}));disc.position.y=.04;pg.add(disc);
  const rim=new T.Mesh(new T.TorusGeometry(1.6,.06,6,24),new T.MeshLambertMaterial({color:0x26221e}));rim.rotation.x=Math.PI/2;rim.position.y=.16;pg.add(rim);
  pg.position.set(cx,0,cz);lvl.add(pg);
  /* the camera stands on the side the hero walked in from, which is open floor */
  /* the camera goes on the most open side, preferring the side the hero walked in from */
  let px0=sx-cx,pz0=sz-cz,pl=Math.hypot(px0,pz0);if(pl<.3){px0=Math.sin(P.yaw);pz0=Math.cos(P.yaw);pl=1;}px0/=pl;pz0/=pl;
  let bx=px0,bz=pz0,best=-1;
  for(let k=0;k<16;k++){const a=k/16*6.2832,dx=Math.sin(a),dz=Math.cos(a),d=cutCamSpot(cx,cz,dx,dz,8),sc=d+1.2*(dx*px0+dz*pz0);if(sc>best){best=sc;bx=dx;bz=dz;}}
  const ceil=Math.max(3.2,(ceilAt?ceilAt(cx,cz):WALLH));
  const hd=Math.hypot(sx-cx,sz-cz),d0=cutCamSpot(cx,cz,bx,bz,hd+3.6),d1=Math.max(d0,cutCamSpot(cx,cz,bx,bz,7.5));
  /* lean the camera to whichever side has more room */
  const lr=s=>{const x=cx+bx*d0-bz*s*1.2,z=cz+bz*d0+bx*s*1.2;return blocked(x,z,.35)?0:1;};
  CUT={t:0,M,pg,cx,cz,sx,sz,bx,bz,ceil,eg,walk:0,face:Math.atan2(cx-sx,cz-sz),d0,d1,side:lr(1)>=lr(-1)?1:-1,bell:0,el:0,sp:0};
  /* letterbox, caption and a skip button */
  const ov=document.createElement('div');ov.id='cutOv';
  ov.innerHTML='<div class="cbar ct"></div><div class="cbar cb"><div id="cutCap"></div></div><div id="cutWhite"></div><button id="cutSkip" type="button">SKIP ▸</button>';
  const st=document.createElement('style');st.id='cutSt';
  st.textContent='#cutOv{position:fixed;inset:0;z-index:65;pointer-events:none;font-family:var(--f-display)}#cutOv .cbar{position:absolute;left:0;right:0;height:0;background:#000;transition:height .8s ease}#cutOv .ct{top:0}#cutOv .cb{bottom:0;display:flex;align-items:center;justify-content:center}#cutOv.on .cbar{height:12vh}#cutCap{color:#ffe7a8;letter-spacing:.18em;font-size:clamp(11px,2.4vh,17px);text-align:center;opacity:0;transition:opacity 1s;padding:0 16px;text-shadow:0 2px 10px #000}#cutWhite{position:absolute;inset:0;background:radial-gradient(circle,#fffbe8,#ffe0a0);opacity:0;transition:opacity 1.2s ease}#cutSkip{position:absolute;right:max(14px,env(safe-area-inset-right));top:calc(12vh + 10px);pointer-events:auto;background:rgba(0,0,0,.5);color:#ffd24a;border:1px solid #ffd24a;padding:10px 16px;font:inherit;font-size:12px;letter-spacing:.16em;touch-action:manipulation}';
  document.head.appendChild(st);document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('on'));
  const sk=ov.querySelector('#cutSkip');const skip=e=>{e.preventDefault();e.stopPropagation();endCutEnd();};sk.addEventListener('click',skip);sk.addEventListener('touchend',skip);
  CUT.cap=ov.querySelector('#cutCap');CUT.white=ov.querySelector('#cutWhite');CUT.ov=ov;
  $('hud').hidden=true;$('touch').hidden=true;try{$('banner').style.opacity=0;}catch(_){}
  state='cut';MUS.want='meadow';
}
function cutCaption(s){if(CUT&&CUT.cap&&CUT.capS!==s){CUT.capS=s;CUT.cap.style.opacity=0;setTimeout(()=>{if(CUT&&CUT.cap){CUT.cap.textContent=s;CUT.cap.style.opacity=s?1:0;}},420);}}
function endCutTick(dt){
  const C=CUT;if(!C)return;C.t+=dt;const t=C.t,M=C.M,g=M.g;
  const ease=q=>q<0?0:q>1?1:q*q*(3-2*q);
  /* the hero walks to the middle of the lift */
  const wk=ease(t/2.3);let hx=C.sx+(C.cx-C.sx)*wk,hz=C.sz+(C.cz-C.sz)*wk,hy=0;
  const moving=t<2.3&&Math.hypot(C.cx-C.sx,C.cz-C.sz)>.2;
  if(moving)C.walk+=dt*7.5;
  let face=C.face;
  if(t>2.3){const k=ease((t-2.3)/.9);const back=Math.atan2(C.bx,C.bz);let d=back-C.face;d=Math.atan2(Math.sin(d),Math.cos(d));face=C.face+d*k;}
  const sw=moving?Math.sin(C.walk)*.55:0;
  M.legs.forEach((p,i)=>p.rotation.x=(i?-sw:sw));M.arms.forEach((p,i)=>p.rotation.x=(p.userData.base||0)+(i?sw:-sw)*.8);
  /* then it rises toward the light */
  const rt=t-3.4;
  if(rt>0){hy=Math.min(C.ceil+1.5,rt*rt*.42);C.pg.position.y=hy;
    if(!C.el){C.el=1;sfx('elev');try{SFX.portal&&SFX.portal();}catch(_){}shake=.25;}
    C.sp-=dt;if(C.sp<=0){C.sp=.05;spark(C.cx+rnd(-1.4,1.4),hy+rnd(0,.3),C.cz+rnd(-1.4,1.4),0,rnd(1.5,3),0,.8,[.6,1,.7],0);spark(C.cx+rnd(-.8,.8),hy+rnd(.5,2.5),C.cz+rnd(-.8,.8),0,rnd(.5,1.2),0,.9,[1,.9,.5],0);}
    try{const beam=C.eg.children[1];if(beam&&beam.material){beam.material.opacity=Math.min(.55,.12+rt*.12);beam.scale.set(1+rt*.08,1+rt*.5,1+rt*.08);beam.position.y=2.4+rt*1.2;}}catch(_){}
  }else if(t>2.6&&!C.bell){C.bell=1;sfx('bell');}
  g.position.set(hx,hy,hz);g.rotation.y=face+(t>2.3&&t<3.4?Math.sin(t*3)*.02:0);
  /* camera: it stands back on the open side the hero came from, a little high, then drops low and wide as the lift climbs */
  const sxv=-C.bz,szv=C.bx,q2=ease((t-2.3)/2.4);
  const camD=C.d0+(C.d1-C.d0)*q2,camH=C.d1<2.6?1.75:2.5-1.1*q2,lat=(.55+.4*q2)*C.side;
  let px=C.cx+C.bx*camD+sxv*lat,pz=C.cz+C.bz*camD+szv*lat;
  if(blocked(px,pz,.3)||!los(C.cx,C.cz,px,pz)){px=C.cx+C.bx*camD;pz=C.cz+C.bz*camD;}
  const top=(C.ceil||WALLH)-.25,cy=Math.min(camH,top);
  if(C.cp){C.cp.x+=(px-C.cp.x)*Math.min(1,dt*3);C.cp.z+=(pz-C.cp.z)*Math.min(1,dt*3);}else C.cp={x:px,z:pz};
  const lx=t<2.3?hx:C.cx,lz=t<2.3?hz:C.cz,ly=Math.min(1.45+hy*.75,top+1);
  cam.position.set(C.cp.x,cy,C.cp.z);cam.lookAt(lx,ly,lz);
  if(t<.3)cutCaption('YOU LEAVE GLOOMSPIRE BEHIND');
  else if(t>3.3&&t<3.6)cutCaption('THE LAST ELEVATOR RISES TOWARD THE LIGHT');
  if(t>5.6&&C.white)C.white.style.opacity=1;
  if(t>7.1)endCutEnd();
}
function endCutEnd(){
  const C=CUT;if(!C)return;CUT=null;
  try{lvl.remove(C.M.g);lvl.remove(C.pg);C.pg.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});for(const m of C.M.mats)m.dispose();}catch(_){}
  state='play';
  try{startEndingScene();}catch(e){console.warn(e);}
  const ov=C.ov,st=document.getElementById('cutSt');
  if(ov){ov.classList.remove('on');const w=C.white;if(w){w.style.opacity=1;setTimeout(()=>{w.style.opacity=0;},120);}const sk=ov.querySelector('#cutSkip');if(sk)sk.remove();if(C.cap)C.cap.style.opacity=0;setTimeout(()=>{ov.remove();if(st)st.remove();},1500);}
}

/* ---- 3. The Golden Meadow ----
   The old meadow drew the castle, path and trees as about 250 separate pieces. They are now merged into a few,
   which leaves room for a lot more scenery at the same cost: a forest of oaks, pines and birches, rocks, a fenced
   path with lanterns, swaying grass, patches of flowers, fireflies, butterflies, mountains and a sun glow. */
let MDW=null;
function mdDispose(root){try{root.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){(Array.isArray(m)?m:[m]).forEach(q=>{if(q.map)q.map.dispose();q.dispose();});}});}catch(_){}}
function mdMergeStatic(root){
  root.updateMatrixWorld(true);
  const inv=new T.Matrix4().copy(root.matrixWorld).invert(),G={lit:[],basic:[],basicFog:[]},kill=[];
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||o.userData.keep)return;const m=o.material;
    if(!m||Array.isArray(m)||m.transparent||m.map||m.vertexColors)return;
    const k=m.isMeshBasicMaterial?(m.fog===false?'basic':'basicFog'):'lit';
    G[k].push([o.geometry,m.color.getHex(),new T.Matrix4().multiplyMatrices(inv,o.matrixWorld)]);kill.push(o);
  });
  const geos=new Set(),mats=new Set();
  for(const o of kill){if(o.parent)o.parent.remove(o);geos.add(o.geometry);mats.add(o.material);}
  if(G.lit.length)root.add(new T.Mesh(chandMerge(G.lit),new T.MeshLambertMaterial({vertexColors:true})));
  if(G.basic.length)root.add(new T.Mesh(chandMerge(G.basic),new T.MeshBasicMaterial({vertexColors:true,fog:false,side:T.DoubleSide})));
  if(G.basicFog.length)root.add(new T.Mesh(chandMerge(G.basicFog),new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide})));
  for(const g of geos)try{g.dispose();}catch(_){}for(const m of mats)try{m.dispose();}catch(_){}
  /* drop empty groups */
  const empty=[];root.traverse(o=>{if(o!==root&&o.isGroup&&!o.children.length)empty.push(o);});for(const o of empty)if(o.parent)o.parent.remove(o);
}
function mdPathX(z){return Math.sin(z*.09)*2.2;}
function mdFree(x,z,pad){/* a spot that is off the path, out of the river and away from the castle */
  pad=pad||0;if(Math.abs(x)<12+pad&&Math.abs(z)<10+pad)return false;if(Math.hypot(x,z)<16+pad)return false;
  if(z>6&&z<72&&Math.abs(x-mdPathX(z))<3.4+pad)return false;if(z>20&&Math.abs(x-endRiverX(z))<5.5+pad)return false;return true;
}
function mdM(x,y,z,ry,sx,sy,sz){const m=new T.Matrix4().makeRotationY(ry||0);m.scale(new T.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz));m.setPosition(x,y,z);return m;}
function mdTint(hex,j){const c=new T.Color(hex);const k=1+(Math.random()*2-1)*j;c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*(1+(Math.random()*2-1)*j));c.b=Math.min(1,c.b*k);return c.getHex();}
function meadowPlus(world,sky){
  const touch=isTouch,parts=[],glow=[];
  scene.fog.density=.0115;
  /* fewer separate pieces: merge the castle, village, path, old trees and birds */
  mdMergeStatic(world);
  /* richer ground colours: lush greens, golden sunlit patches, a worn dirt path, sandy river banks */
  const ter=world.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.material.vertexColors);
  if(ter){const pos=ter.geometry.attributes.position,col=ter.geometry.attributes.color,c=new T.Color(),cs=[new T.Color(0x356f2a),new T.Color(0x4f9a35),new T.Color(0x78b53f),new T.Color(0xa9c452),new T.Color(0xc9b25a)],dirt=new T.Color(0xa88a5c),sand=new T.Color(0xd2b884);
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);
      let n=(Math.sin(x*.11+z*.07)+Math.sin(x*.043-z*.061)*1.3+Math.sin(x*.27)*Math.cos(z*.23)*.4)/2.7*.5+.5;n=Math.max(0,Math.min(.999,n));
      const f=n*4,a=Math.floor(f);c.copy(cs[a]).lerp(cs[Math.min(4,a+1)],f-a);
      if(z>8&&z<70){const d=Math.abs(x-mdPathX(z));if(d<2.6)c.lerp(dirt,(1-d/2.6)*.85);}
      if(z>22){const d=Math.abs(x-endRiverX(z));if(d<6.5)c.lerp(sand,Math.max(0,1-(d-3.6)/2.9)*.8);}
      col.setXYZ(i,c.r,c.g,c.b);}
    col.needsUpdate=true;}
  /* trees: oaks, pines and birches, all one mesh */
  const trunk=new T.CylinderGeometry(.2,.3,1,6),ico1=new T.IcosahedronGeometry(1,0),cone=new T.ConeGeometry(1,1,7),rock=new T.DodecahedronGeometry(1,0),box=new T.BoxGeometry(1,1,1);
  const NT=touch?46:70;let placed=0;
  for(let i=0;i<NT*4&&placed<NT;i++){
    const far=placed>NT*.55,an=Math.random()*6.283,r=far?rnd(55,95):rnd(20,62),x=Math.sin(an)*r*1.2,z=12+Math.cos(an)*r*.9+18;
    if(!mdFree(x,z,1.5))continue;placed++;
    const y=endingHeight(x,z)-.1,s=rnd(.8,1.35),ty=Math.random(),ry=rnd(6.283);
    if(ty<.45){/* oak */const th=2.2*s;parts.push([trunk,mdTint(0x5a3c26,.12),mdM(x,y+th/2,z,ry,s,th,s)]);
      const cg=[0x3f8a2e,0x4f9a32,0x5ea83a,0x37782a];
      for(let k=0;k<4;k++){const a=k*1.7+ry,rr=k?1.05*s:0,cs=(k?1.25:1.7)*s;parts.push([ico1,mdTint(cg[k],.1),mdM(x+Math.sin(a)*rr,y+th+.9*s+(k?rnd(-.3,.5)*s:.6*s),z+Math.cos(a)*rr,rnd(6),cs,cs*.85,cs)]);}}
    else if(ty<.8){/* pine */const th=1.1*s;parts.push([trunk,mdTint(0x4a3222,.1),mdM(x,y+th/2,z,ry,s*.9,th,s*.9)]);
      for(let k=0;k<3;k++){const w=(1.75-k*.45)*s,h=(1.9-k*.3)*s;parts.push([cone,mdTint(k%2?0x2b5e2c:0x23502a,.08),mdM(x,y+th+k*1.15*s+h/2-.2,z,ry+k,w,h,w)]);}}
    else{/* birch */const th=3*s;parts.push([trunk,mdTint(0xe6e0d0,.05),mdM(x,y+th/2,z,ry,s*.6,th,s*.6)]);
      for(let k=0;k<2;k++)parts.push([ico1,mdTint(k?0x9cc24a:0x86b43e,.1),mdM(x+rnd(-.4,.4)*s,y+th+.3*s+k*.8*s,z+rnd(-.4,.4)*s,rnd(6),1.05*s,1.3*s,1.05*s)]);}
  }
  /* rocks, some mossy */
  for(let i=0;i<(touch?16:26);i++){let x,z,n=0;do{x=rnd(-60,60);z=rnd(10,80);}while(!mdFree(x,z,.5)&&n++<20);const s=rnd(.4,1.3);
    parts.push([rock,mdTint(Math.random()<.4?0x6f7a5c:0x8a8478,.1),mdM(x,endingHeight(x,z)+s*.25,z,rnd(6),s*1.3,s*.7,s)]);}
  /* a wooden fence along the path, and lantern posts every few metres */
  for(let z=18.2;z<62;z+=2.4){const z2=z+2.4,x1=mdPathX(z),x2=mdPathX(z2),ang=Math.atan2(x2-x1,z2-z);
    for(const sd of[-1,1]){const ox=sd*2.6,px=x1+ox,py=endingHeight(px,z);
      parts.push([box,0x6a4a2e,mdM(px,py+.45,z,ang,.13,.9,.13)]);
      const mx=(x1+x2)/2+ox,mz=(z+z2)/2,my=(py+endingHeight(x2+ox,z2))/2;
      for(const h of[.35,.72])parts.push([box,0x7a5634,mdM(mx,my+h,mz,ang,.06,.07,2.45)]);}}
  const lamps=[];
  for(let z=20,i=0;z<66;z+=8.5,i++){const sd=i%2?1:-1,x=mdPathX(z)+sd*3.1,y=endingHeight(x,z);
    parts.push([box,0x3a2a1c,mdM(x,y+1.2,z,0,.16,2.4,.16)]);parts.push([box,0x3a2a1c,mdM(x-sd*.3,y+2.35,z,0,.6,.1,.1)]);
    parts.push([box,0x1e1a18,mdM(x-sd*.55,y+2.05,z,0,.32,.06,.32)]);parts.push([box,0x1e1a18,mdM(x-sd*.55,y+1.63,z,0,.34,.05,.34)]);
    glow.push([box,0xffc35a,mdM(x-sd*.55,y+1.84,z,0,.24,.36,.24)]);lamps.push([x-sd*.55,y+1.84,z]);}
  if(parts.length)world.add(new T.Mesh(chandMerge(parts),new T.MeshLambertMaterial({vertexColors:true})));
  if(glow.length)world.add(new T.Mesh(chandMerge(glow),new T.MeshBasicMaterial({vertexColors:true})));
  /* grass that sways in the wind: one instanced mesh */
  const gpos=[],gcol=[],gnor=[],base=new T.Color(0x2e6626),tip=new T.Color(0xa6d45c);
  for(let b=0;b<3;b++){const a=b*2.09,ca=Math.cos(a),sa=Math.sin(a),w=.07,h=.55+b*.08,lean=(b-1)*.08;
    const v=[[-w*ca,0,-w*sa],[w*ca,0,w*sa],[lean*sa,h,-lean*ca]];
    for(let k=0;k<3;k++){gpos.push(v[k][0],v[k][1],v[k][2]);const c=k===2?tip:base;gcol.push(c.r,c.g,c.b);gnor.push(0,1,0);}}
  const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gpos,3));gg.setAttribute('color',new T.Float32BufferAttribute(gcol,3));gg.setAttribute('normal',new T.Float32BufferAttribute(gnor,3));
  const gm=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});const GU={value:0};
  gm.onBeforeCompile=sh=>{sh.uniforms.uT=GU;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 gW=instanceMatrix*vec4(0.,0.,0.,1.);float gH=position.y;transformed.x+=sin(uT*1.6+gW.x*.35+gW.z*.21)*gH*.22;transformed.z+=cos(uT*1.25+gW.z*.31)*gH*.12;');};
  const GN=touch?900:1800,gi=new T.InstancedMesh(gg,gm,GN),m4=new T.Matrix4(),q=new T.Quaternion(),sv=new T.Vector3(),pv=new T.Vector3(),yax=new T.Vector3(0,1,0),cc=new T.Color();
  let n=0;
  for(let i=0;i<GN*3&&n<GN;i++){
    const near=Math.random()<.6,z=near?rnd(8,58):rnd(8,95),x=near?mdPathX(z)+(Math.random()<.5?-1:1)*rnd(2.2,14):rnd(-70,70);
    if(Math.abs(x)<11&&Math.abs(z)<9)continue;if(z>20&&Math.abs(x-endRiverX(z))<4.2)continue;if(z>8&&z<70&&Math.abs(x-mdPathX(z))<1.9)continue;
    const s=rnd(.7,1.5);q.setFromAxisAngle(yax,rnd(6.283));sv.set(s,s*rnd(.8,1.3),s);pv.set(x,endingHeight(x,z)-.03,z);m4.compose(pv,q,sv);gi.setMatrixAt(n,m4);
    gi.setColorAt(n,cc.setHSL(.24+rnd(-.03,.04),.5+rnd(0,.2),.55+rnd(-.1,.1)));n++;}
  gi.count=n;gi.instanceMatrix.needsUpdate=true;if(gi.instanceColor)gi.instanceColor.needsUpdate=true;world.add(gi);
  /* flowers in patches of the same colour, the way they grow */
  const FL=touch?380:620,fg=new T.OctahedronGeometry(.13,0),fi=new T.InstancedMesh(fg,new T.MeshBasicMaterial(),FL),pal=[0xe8414f,0xffe066,0xb08cff,0xffffff,0xff8fb8,0xff9a3c,0x7ab8ff];
  const patches=[];for(let i=0;i<34;i++){let x,z,k=0;do{x=rnd(-55,55);z=rnd(12,85);}while(!mdFree(x,z,-1)&&k++<20);patches.push([x,z,pick(pal),rnd(1.5,4.5)]);}
  n=0;for(let i=0;i<FL*2&&n<FL;i++){const p=pick(patches),a=rnd(6.283),r=Math.sqrt(Math.random())*p[3],x=p[0]+Math.cos(a)*r,z=p[1]+Math.sin(a)*r;
    if(!mdFree(x,z,-1.5))continue;const s=rnd(.7,1.3);q.setFromAxisAngle(yax,rnd(6.283));sv.set(s,s*.7,s);pv.set(x,endingHeight(x,z)+rnd(.3,.5),z);m4.compose(pv,q,sv);fi.setMatrixAt(n,m4);fi.setColorAt(n,cc.setHex(p[2]));n++;}
  fi.count=n;fi.instanceMatrix.needsUpdate=true;if(fi.instanceColor)fi.instanceColor.needsUpdate=true;world.add(fi);
  /* fireflies and lantern glow */
  const gt=endGlowTexture(),FF=touch?90:160,fp=new Float32Array(FF*3),ph=new Float32Array(FF*4);
  for(let i=0;i<FF;i++){const z=rnd(10,70),x=mdPathX(z)+rnd(-16,16);ph[i*4]=x;ph[i*4+1]=endingHeight(x,z)+rnd(.4,2.6);ph[i*4+2]=z;ph[i*4+3]=rnd(6.283);fp[i*3]=x;fp[i*3+1]=ph[i*4+1];fp[i*3+2]=z;}
  const fgeo=new T.BufferGeometry();fgeo.setAttribute('position',new T.BufferAttribute(fp,3));
  const ffl=new T.Points(fgeo,new T.PointsMaterial({size:.32,map:gt,color:0xfff0a0,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true}));ffl.frustumCulled=false;world.add(ffl);
  if(lamps.length){const lp=new Float32Array(lamps.length*3);lamps.forEach((l,i)=>{lp[i*3]=l[0];lp[i*3+1]=l[1];lp[i*3+2]=l[2];});const lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(lp,3));
    world.add(new T.Points(lg,new T.PointsMaterial({size:2.2,map:gt,color:0xffb44a,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true})));}
  /* butterflies */
  const bm=new T.MeshBasicMaterial({color:0xffd27a,side:T.DoubleSide}),bm2=new T.MeshBasicMaterial({color:0xf2f2ff,side:T.DoubleSide}),wg=new T.PlaneGeometry(.22,.16),bfl=[];
  for(let i=0;i<(touch?5:8);i++){const b=new T.Group(),mt=i%2?bm:bm2;const w1=new T.Mesh(wg,mt),w2=new T.Mesh(wg,mt);w1.position.x=.11;w2.position.x=-.11;
    const p1=new T.Group(),p2=new T.Group();p1.add(w1);p2.add(w2);b.add(p1);b.add(p2);world.add(b);
    const z=rnd(14,50);bfl.push({g:b,l:p1,r:p2,cx:mdPathX(z)+rnd(-6,6),cz:z,rad:rnd(1.5,4),sp:rnd(.4,.8)*(Math.random()<.5?-1:1),ph:rnd(6.283)});}
  /* mountains on the horizon, two layers, and a soft glow around the sun */
  for(const [R,lo,hi,top,bot,seed] of[[205,6,34,0x6a5384,0xd99a8a,1.3],[175,2,20,0x4f4466,0xb98088,4.1]]){
    const N=72,pos=[],colA=[],idx=[],ct=new T.Color(top),cb=new T.Color(bot);
    for(let i=0;i<=N;i++){const a=i/N*6.2832,h=lo+(hi-lo)*(.5+.5*Math.sin(a*3+seed)*Math.cos(a*5.3+seed*2)+.25*Math.sin(a*11+seed))*.8;
      pos.push(Math.sin(a)*R,-12,Math.cos(a)*R,Math.sin(a)*R,h,Math.cos(a)*R);colA.push(cb.r,cb.g,cb.b,ct.r,ct.g,ct.b);
      if(i<N){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}
    const mg=new T.BufferGeometry();mg.setAttribute('position',new T.Float32BufferAttribute(pos,3));mg.setAttribute('color',new T.Float32BufferAttribute(colA,3));mg.setIndex(idx);
    const mm=new T.Mesh(mg,new T.MeshBasicMaterial({vertexColors:true,fog:false,side:T.DoubleSide,depthWrite:false}));mm.renderOrder=-2;mm.frustumCulled=false;sky.add(mm);}
  {const SUN=new T.Vector3(-150,34,400).normalize();const sp=new T.Sprite(new T.SpriteMaterial({map:gt,color:0xffd9a0,transparent:true,opacity:.85,depthWrite:false,fog:false,blending:T.AdditiveBlending}));
    sp.position.copy(SUN).multiplyScalar(215);sp.scale.set(48,48,1);sp.renderOrder=-1;sky.add(sp);}
  MDW={GU,ffl,ph,FF,bfl,t:0};
}
function meadowTick(dt){
  const D=MDW;if(!D)return;D.t+=dt;D.GU.value=D.t;
  const a=D.ffl.geometry.attributes.position,p=a.array,ph=D.ph,t=D.t;
  for(let i=0;i<D.FF;i++){const k=ph[i*4+3];p[i*3]=ph[i*4]+Math.sin(t*.35+k)*1.6;p[i*3+1]=ph[i*4+1]+Math.sin(t*.9+k*2)*.35;p[i*3+2]=ph[i*4+2]+Math.cos(t*.3+k)*1.6;}
  a.needsUpdate=true;D.ffl.material.opacity=.7+.3*Math.sin(t*2.3);
  for(const b of D.bfl){const an=t*b.sp+b.ph,x=b.cx+Math.cos(an)*b.rad,z=b.cz+Math.sin(an)*b.rad;b.g.position.set(x,endingHeight(x,z)+.9+Math.sin(t*2+b.ph)*.35,z);b.g.rotation.y=-an+(b.sp>0?0:Math.PI);
    const f=Math.sin(t*18+b.ph)*.9;b.l.rotation.z=f;b.r.rotation.z=-f;}
}
