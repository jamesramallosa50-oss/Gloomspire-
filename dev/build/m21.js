/* ===== BUILD 3.8: GAME MODES + HORROR: an endless dungeon, traps, and a demon that never stops running ===== */
/* The dungeon is built a few pieces ahead of you as you run and deleted behind you. The demon follows the exact path you took.
   The demon model is loaded at full detail (every polygon, the full 2048 px texture) only when Horror starts, so the main game
   does not get any heavier. */
let HZ=null,HZA=null;
const HZS=4,HZH=4.2;
/* ---------- loading ---------- */
function hzScript(src){return new Promise((ok,no)=>{if(window.THREE&&THREE.GLTFLoader&&window.MeshoptDecoder){ok();return;}const s=document.createElement('script');s.src=src;s.onload=()=>ok();s.onerror=()=>no(new Error('script'));document.head.appendChild(s);});}
async function hzFetch(url,prog){
  const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);
  const tot=+r.headers.get('content-length')||17184416;
  if(!r.body||!r.body.getReader){const b=await r.arrayBuffer();prog(1);return b;}
  const rd=r.body.getReader(),parts=[];let got=0;
  for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;prog(Math.min(.99,got/tot));}
  const out=new Uint8Array(got);let o=0;for(const p of parts){out.set(p,o);o+=p.length;}prog(1);return out.buffer;
}
async function hzLoadDemon(prog){
  if(HZA)return HZA;
  await hzScript('assets/horror/gltf.js');
  const buf=await hzFetch('assets/horror/demon.glb',prog);
  await MeshoptDecoder.ready;
  const gl=await new Promise((ok,no)=>{const ld=new THREE.GLTFLoader();ld.setMeshoptDecoder(MeshoptDecoder);ld.parse(buf,'',ok,no);});
  const root=gl.scene;let skinned=null;
  root.traverse(o=>{if(o.isSkinnedMesh||o.isMesh){skinned=skinned||o;o.frustumCulled=false;}});
  /* the texture at full size, sharp up close and smooth (mipmapped, anisotropic) at a distance, so it never shimmers */
  const src=skinned.material,map=src.map;
  if(map){map.encoding=T.LinearEncoding;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;}
  const mat=new T.MeshLambertMaterial({map,skinning:true,side:T.DoubleSide,emissive:0x1a0806,emissiveMap:map});
  skinned.material=mat;try{src.dispose();}catch(_){}
  const run=gl.animations[0];
  HZA={root,mesh:skinned,run,idle:hzIdleClip(run),mat};
  return HZA;
}
/* ---------- an idle animation made from the run ----------
   The model only came with a run. The idle pose is the average of every frame of the run (a hunched, bent-knee stance,
   both legs alike), and on top of it the demon breathes, its shoulders rise and fall, its head turns slowly and its arms sway. */
function hzIdleClip(run){
  const tracks=[],D=3.2,N=9,times=[];for(let k=0;k<N;k++)times.push(k/(N-1)*D);
  const q=new T.Quaternion(),acc=new T.Quaternion(),ref=new T.Quaternion(),off=new T.Quaternion(),e=new T.Euler();
  for(const tr of run.tracks){
    const name=tr.name,bone=name.split('.')[0],vs=tr.values,isQ=name.endsWith('.quaternion'),isP=name.endsWith('.position');
    if(!isQ&&!isP)continue;
    const n=tr.times.length;
    if(isQ){let x=0,y=0,z=0,w=0;ref.fromArray(vs,0);
      for(let i=0;i<n;i++){q.fromArray(vs,i*4);if(q.dot(ref)<0){q.x=-q.x;q.y=-q.y;q.z=-q.z;q.w=-q.w;}x+=q.x;y+=q.y;z+=q.z;w+=q.w;}
      acc.set(x,y,z,w).normalize();
      /* breathing and life, small angles on top of the average pose */
      const amp={Spine02:[.035,0,0],Spine01:[.03,0,.01],Spine:[.025,.01,0],neck:[.03,.12,0],Head:[.05,.18,.04],LeftShoulder:[.05,0,0],RightShoulder:[.05,0,0],LeftArm:[.08,0,.05],RightArm:[.08,0,.05],LeftForeArm:[.1,0,0],RightForeArm:[.1,0,0],LeftHand:[.12,0,.06],RightHand:[.12,0,.06]}[bone];
      const out=[];
      for(let k=0;k<N;k++){const ph=k/(N-1)*Math.PI*2;
        if(amp){e.set(amp[0]*Math.sin(ph),amp[1]*Math.sin(ph*.5+.6),amp[2]*Math.sin(ph+1.3));off.setFromEuler(e);q.copy(acc).multiply(off);}else q.copy(acc);
        out.push(q.x,q.y,q.z,q.w);}
      tracks.push(new T.QuaternionKeyframeTrack(name,times,out));
    }else{let x=0,y=0,z=0;for(let i=0;i<n;i++){x+=vs[i*3];y+=vs[i*3+1];z+=vs[i*3+2];}x/=n;y/=n;z/=n;
      const out=[];for(let k=0;k<N;k++){const ph=k/(N-1)*Math.PI*2;out.push(x,bone==='Hips'?y+Math.sin(ph)*1.2:y,z);}
      tracks.push(new T.VectorKeyframeTrack(name,times,out));}
  }
  return new T.AnimationClip('Idle',D,tracks);
}
/* ---------- materials ---------- */
function hzTex(kind,rep){const c=document.createElement('canvas');c.width=c.height=64;tileCanvas(dtStone(kind),64,0,0,c.getContext('2d'));
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.NearestFilter;t.minFilter=T.NearestMipmapLinearFilter;t.generateMipmaps=true;return t;}
function hzWritMats(){/* messages scrawled in blood */
  const W=['RUN','IT SEES YOU','DONT HIDE','BEHIND YOU','NO WAY OUT','IT HEARS','HELP ME','TURN BACK'];
  return W.map(w=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.font='bold '+(w.length>7?34:48)+'px serif';x.textAlign='center';x.textBaseline='middle';
    for(let k=0;k<3;k++){x.fillStyle='rgba('+(90+k*20)+',0,0,'+(.35+k*.25)+')';x.save();x.translate(128+rnd(-2,2),58+rnd(-2,2));x.rotate(rnd(-.06,.06));x.fillText(w,0,0);x.restore();}
    x.fillStyle='rgba(110,0,0,.8)';for(let i=0;i<14;i++){const px=rnd(30,226),py=rnd(60,80),len=rnd(10,45);x.fillRect(px,py,rnd(1.5,3),len);x.beginPath();x.arc(px+1,py+len,2,0,6.3);x.fill();}
    const t=new T.CanvasTexture(c);t.minFilter=T.LinearMipmapLinearFilter;return new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:.92});});
}
function hzMats(){
  return {wall:new T.MeshPhongMaterial({map:hzTex('wall'),specular:0,shininess:0}),moss:new T.MeshPhongMaterial({map:hzTex('moss'),specular:0,shininess:0}),
    floor:new T.MeshPhongMaterial({map:hzTex('floor'),specular:0x111111,shininess:4}),ceil:new T.MeshPhongMaterial({map:hzTex('ceil'),specular:0,shininess:0}),
    prop:new T.MeshPhongMaterial({vertexColors:true,specular:0x111111,shininess:6}),glow:new T.MeshBasicMaterial({vertexColors:true}),
    iron:new T.MeshPhongMaterial({color:0x4a4a52,specular:0x666666,shininess:30}),blade:new T.MeshPhongMaterial({color:0x9aa0aa,specular:0xffffff,shininess:60}),
    potion:new T.MeshBasicMaterial({color:0xff2a3a}),wood:new T.MeshPhongMaterial({color:0x4a3220,specular:0x111111,shininess:5}),dark:new T.MeshPhongMaterial({color:0x2a2622,specular:0,shininess:0}),
    door:new T.MeshPhongMaterial({color:0x5c3c24,specular:0x111111,shininess:5}),bone:new T.MeshPhongMaterial({color:0xd8d0b8,specular:0x222222,shininess:8}),gem:new T.MeshBasicMaterial({color:0xffd24a}),gate:new T.MeshBasicMaterial({color:0xff3a2a})};
}
/* ---------- the endless corridor ---------- */
const HZD={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]},HZO={N:'S',S:'N',E:'W',W:'E'};
function hzKey(i,j){return i+','+j;}
function hzTile(x,z){return HZ.tiles.get(hzKey(Math.floor(x/HZS),Math.floor(z/HZS)));}
function hzAdd(i,j,ck,extra){const t={i,j,open:{N:0,E:0,S:0,W:0},ck,room:0,idx:HZ.pathN++};Object.assign(t,extra||{});HZ.tiles.set(hzKey(i,j),t);HZ.chunks[ck].tiles.push(t);return t;}
/* ---------- the endless corridor (Horror) ----------
   3.9: the next step of the corridor is decided before a piece is built, so the doorway into the next piece is always
   open. Before, the last tile of every piece was walled off and you had to walk through the wall. */
function hzPickDir(G){
  let dir=G.dir;
  if(G.seg>=2&&Math.random()<.32)dir=G.dir==='N'?(Math.random()<.5?'E':'W'):'N';
  const d=HZD[dir];if(HZ.tiles.has(hzKey(G.i+d[0],G.j+d[1])))dir='N';
  return dir;
}
function hzNewChunk(){const C={k:HZ.chunks.length,tiles:[],meshes:[],traps:[],torches:[],items:[]};HZ.chunks.push(C);return C;}
function hzGenChunk(){
  const C=hzNewChunk(),ck=C.k,G=HZ.gen,steps=8;
  for(let s=0;s<steps;s++){
    const dir=G.next||hzPickDir(G);G.next=null;
    if(dir!==G.dir){G.dir=dir;G.seg=0;}
    /* a wide hall now and then on the straight north runs */
    if(ck>1&&dir==='N'&&G.seg>=1&&!G.room&&Math.random()<.1&&steps-s>=3){
      let free=true;for(let r=1;r<=3;r++)for(const dx of[-1,0,1])if(HZ.tiles.has(hzKey(G.i+dx,G.j-r)))free=false;
      if(free){const rid=++HZ.roomN;G.room=4;
        for(let r=1;r<=3;r++){for(const dx of[-1,1])hzAdd(G.i+dx,G.j-r,ck,{room:rid,side:1,idx:HZ.pathN});
          const t=hzAdd(G.i,G.j-r,ck,{room:rid});const pv=HZ.tiles.get(hzKey(G.i,G.j-r+1));pv.open.N=1;t.open.S=1;}
        for(let r=1;r<=3;r++)for(const dx of[-1,0,1]){const t=HZ.tiles.get(hzKey(G.i+dx,G.j-r));for(const k in HZD){const n=HZ.tiles.get(hzKey(t.i+HZD[k][0],t.j+HZD[k][1]));if(n&&n.room===rid)t.open[k]=1;}}
        G.j-=3;G.seg=0;s+=2;continue;}
    }
    if(G.room)G.room--;
    const d=HZD[dir],ni=G.i+d[0],nj=G.j+d[1];
    const pv=HZ.tiles.get(hzKey(G.i,G.j)),t=hzAdd(ni,nj,ck);pv.open[dir]=1;t.open[HZO[dir]]=1;G.i=ni;G.j=nj;G.seg++;
  }
  /* decide the next step now, so this piece is built with its exit open */
  G.next=hzPickDir(G);HZ.tiles.get(hzKey(G.i,G.j)).open[G.next]=1;
  hzBuildChunk(C);
}
function hzQuad(A,x0,y0,z0,ux,uy,uz,vx,vy,vz,U,V){/* a rectangle from corner (x0,y0,z0) along u and v, with tiling UVs */
  const b=A.p.length/3,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;
  A.p.push(x0,y0,z0,x0+ux,y0+uy,z0+uz,x0+ux+vx,y0+uy+vy,z0+uz+vz,x0+vx,y0+vy,z0+vz);
  for(let k=0;k<4;k++)A.n.push(nx/nl,ny/nl,nz/nl);A.u.push(0,0,U,0,U,V,0,V);A.i.push(b,b+1,b+2,b,b+2,b+3);
}
const HZW=.2;
function hzWallAt(i,j,k){/* is there a wall on side k of tile (i,j), seen from either side */
  const t=HZ.tiles.get(hzKey(i,j)),d=HZD[k],n=HZ.tiles.get(hzKey(i+d[0],j+d[1]));
  return !!((t&&!t.open[k]&&t.gate!==k)||(n&&!n.open[HZO[k]]&&n.gate!==HZO[k]));
}
function hzPost(A,vx,vz){/* a stone post where walls end or turn (not along a straight wall) */
  const key=vx+','+vz;if(HZ.posts.has(key))return;HZ.posts.add(key);
  const up=hzWallAt(vx,vz-1,'W'),dn=hzWallAt(vx,vz,'W'),lf=hzWallAt(vx-1,vz,'N'),rt=hzWallAt(vx,vz,'N'),n=up+dn+lf+rt;
  if(!n||(n===2&&((up&&dn)||(lf&&rt))))return;
  const w=HZW,x=vx*HZS,z=vz*HZS,H=HZH;
  hzQuad(A,x-w,0,z+w,2*w,0,0,0,H,0,.2,2.1);hzQuad(A,x+w,0,z-w,-2*w,0,0,0,H,0,.2,2.1);
  hzQuad(A,x-w,0,z-w,0,0,2*w,0,H,0,.2,2.1);hzQuad(A,x+w,0,z+w,0,0,-2*w,0,H,0,.2,2.1);
}
function hzGeo(A){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(A.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(A.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(A.u,2));g.setIndex(A.i);g.computeBoundingSphere();return g;}
function hzBuildChunk(C){
  const S=HZS,H=HZH,mk=()=>({p:[],n:[],u:[],i:[]}),W=mk(),Mo=mk(),F=mk(),Ce=mk(),props=[],glow=[];
  const box=HZ.box;
  for(const t of C.tiles){
    const x0=t.i*S,z0=t.j*S,cx=x0+S/2,cz=z0+S/2;t.bo=Object.assign({},t.open);
    hzQuad(F,x0,0,z0+S,S,0,0,0,0,-S,2,2);hzQuad(Ce,x0,H,z0,S,0,0,0,0,S,2,2);
    /* 3.10: walls have thickness. Each wall face sits 0.2 m in from the tile edge, and a stone post closes every wall end,
       so a wall seen edge-on is 40 cm of stone instead of a paper-thin line. */
    const cl=q=>!t.open[q]&&t.gate!==q,w=HZW;
    for(const k of['N','E','S','W']){if(!cl(k))continue;const A=Math.random()<.22?Mo:W;
      if(k==='N'){const a=x0+(cl('W')?w:0),b=x0+S-(cl('E')?w:0);hzQuad(A,a,0,z0+w,b-a,0,0,0,H,0,(b-a)/2,2.1);}
      if(k==='S'){const a=x0+S-(cl('E')?w:0),b=x0+(cl('W')?w:0);hzQuad(A,a,0,z0+S-w,b-a,0,0,0,H,0,(a-b)/2,2.1);}
      if(k==='W'){const a=z0+S-(cl('S')?w:0),b=z0+(cl('N')?w:0);hzQuad(A,x0+w,0,a,0,0,b-a,0,H,0,(a-b)/2,2.1);}
      if(k==='E'){const a=z0+(cl('N')?w:0),b=z0+S-(cl('S')?w:0);hzQuad(A,x0+S-w,0,a,0,0,b-a,0,H,0,(b-a)/2,2.1);}}
    for(const [vx,vz] of[[t.i,t.j],[t.i+1,t.j],[t.i,t.j+1],[t.i+1,t.j+1]])hzPost(W,vx,vz);
    const closed=['N','E','S','W'].filter(k=>!t.open[k]&&t.gate!==k&&!(t.noTorch&&t.noTorch[k]));
    /* torches on the walls, every few tiles */
    if(closed.length&&(t.idx%3===0||t.room&&Math.random()<.3)){const k=pick(closed),d=HZD[k],tx=cx+d[0]*(S/2-.32),tz=cz+d[1]*(S/2-.32),ry=Math.atan2(d[0],d[1]);
      props.push([box,0x2a2420,new T.Matrix4().compose(new T.Vector3(tx,2.1,tz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(.14,.5,.14))]);
      props.push([box,0x3a2a1a,new T.Matrix4().compose(new T.Vector3(tx-d[0]*.12,2.42,tz-d[1]*.12),new T.Quaternion(),new T.Vector3(.16,.16,.16))]);
      glow.push([box,0xff8a2a,new T.Matrix4().compose(new T.Vector3(tx-d[0]*.12,2.62,tz-d[1]*.12),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),.6),new T.Vector3(.13,.26,.13))]);
      glow.push([box,0xffd27a,new T.Matrix4().compose(new T.Vector3(tx-d[0]*.12,2.6,tz-d[1]*.12),new T.Quaternion(),new T.Vector3(.07,.16,.07))]);
      C.torches.push({x:tx-d[0]*.4,y:2.6,z:tz-d[1]*.4,ph:Math.random()*9});}
    /* bones, skulls and rubble on the floor; chains from the ceiling */
    if(Math.random()<.45){const n=ri(1,3);for(let q=0;q<n;q++){const px=x0+rnd(.5,S-.5),pz=z0+rnd(.5,S-.5);
      if(Math.random()<.5)props.push([box,0xd8d0b8,new T.Matrix4().compose(new T.Vector3(px,.06,pz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rnd(3)),new T.Vector3(.5,.07,.07))]);
      else{props.push([box,0xcfc6ae,new T.Matrix4().compose(new T.Vector3(px,.13,pz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rnd(3)),new T.Vector3(.22,.24,.26))]);props.push([box,0x1a1410,new T.Matrix4().compose(new T.Vector3(px,.16,pz+.13),new T.Quaternion(),new T.Vector3(.14,.06,.02))]);}}}
    if(Math.random()<.25){const px=x0+rnd(.8,S-.8),pz=z0+rnd(.8,S-.8),ln=rnd(.8,1.8);for(let q=0;q<Math.round(ln/.22);q++)props.push([box,0x34363c,new T.Matrix4().compose(new T.Vector3(px,H-.12-q*.22,pz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),q%2*1.57),new T.Vector3(.05,.18,.1))]);}
    if(Math.random()<.2)props.push([box,0x3a0a08,new T.Matrix4().compose(new T.Vector3(x0+rnd(1,S-1),.012,z0+rnd(1,S-1)),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),rnd(3)),new T.Vector3(rnd(.6,1.4),.01,rnd(.5,1.2)))]);
  }
  const add=(A,m)=>{if(!A.p.length)return;const ms=new T.Mesh(hzGeo(A),m);HZ.scene.add(ms);C.meshes.push(ms);};
  /* now and then something is written on a wall */
  if(!HZ.writ)HZ.writ=hzWritMats();if(!HZ.wrG)HZ.wrG=new T.PlaneGeometry(2.6,1.3);C.decals=C.decals||[];
  for(const t of C.tiles){const cs=['N','E','S','W'].filter(k=>!t.open[k]&&t.gate!==k&&!(t.noTorch&&t.noTorch[k]));if(!cs.length||Math.random()>(HZ.mode==='hide'?.06:.08)||t.idx<6&&HZ.mode==='run')continue;
    const k=pick(cs),d=HZD[k],m=new T.Mesh(HZ.wrG,pick(HZ.writ));m.position.set(t.i*S+S/2+d[0]*(S/2-HZW-.02),rnd(1.7,2.3),t.j*S+S/2+d[1]*(S/2-HZW-.02));m.rotation.y=Math.atan2(-d[0],-d[1]);m.renderOrder=1;HZ.scene.add(m);C.decals.push(m);}
  add(W,HZ.mat.wall);add(Mo,HZ.mat.moss);add(F,HZ.mat.floor);add(Ce,HZ.mat.ceil);
  if(props.length){const ms=new T.Mesh(chandMerge(props),HZ.mat.prop);HZ.scene.add(ms);C.meshes.push(ms);}
  if(glow.length){const ms=new T.Mesh(chandMerge(glow),HZ.mat.glow);HZ.scene.add(ms);C.meshes.push(ms);}
  /* traps on straight corridor tiles, never in the first stretch */
  if(C.k>=1&&HZ.mode==='run')for(const t of C.tiles){
    if(t.room||t.trapNo)continue;const ns=(t.open.N&&t.open.S),ew=(t.open.E&&t.open.W);if(!(ns^ew))continue;
    if(Math.random()>.2||HZ.lastTrap>t.idx-3)continue;HZ.lastTrap=t.idx;
    const cx=t.i*HZS+HZS/2,cz=t.j*HZS+HZS/2;
    if(Math.random()<.55){/* spikes: they rattle, then shoot up. Jump over or wait. */
      const g=new T.Group();g.position.set(cx,0,cz);const plate=new T.Mesh(HZ.box,HZ.mat.iron);plate.scale.set(3.7,.04,1.9);plate.position.y=.02;g.add(plate);
      const sp=new T.Mesh(HZ.spikeG,HZ.mat.blade);sp.position.y=-.75;g.add(sp);if(ew)g.rotation.y=Math.PI/2;HZ.scene.add(g);
      C.traps.push({k:'spike',g,sp,x:cx,z:cz,ax:ns?'z':'x',ph:Math.random()*3,up:0});
    }else{/* a swinging blade across the corridor */
      const g=new T.Group();g.position.set(cx,HZH-.05,cz);if(ew)g.rotation.y=Math.PI/2;const arm=new T.Group();g.add(arm);
      const rod=new T.Mesh(HZ.box,HZ.mat.iron);rod.scale.set(.08,2.9,.08);rod.position.y=-1.45;arm.add(rod);
      const bl=new T.Mesh(HZ.bladeG,HZ.mat.blade);bl.position.y=-3.05;arm.add(bl);
      const hub=new T.Mesh(HZ.box,HZ.mat.iron);hub.scale.set(.3,.3,.3);g.add(hub);HZ.scene.add(g);
      C.traps.push({k:'blade',g,arm,x:cx,z:cz,ax:ns?'z':'x',ph:Math.random()*6,sp:1.9+Math.random()*.6});
    }
  }
  /* now and then a healing potion */
  if(C.k>=1&&HZ.mode==='run'&&Math.random()<.45){const t=pick(C.tiles);const m=new T.Mesh(HZ.potG,HZ.mat.potion);m.position.set(t.i*HZS+HZS/2+rnd(-1,1),.35,t.j*HZS+HZS/2+rnd(-1,1));HZ.scene.add(m);C.items.push(m);}
}
function hzDropChunk(C){
  for(const m of C.meshes){HZ.scene.remove(m);m.geometry.dispose();}
  for(const t of C.traps)HZ.scene.remove(t.g);for(const m of C.decals||[])HZ.scene.remove(m);C.decals=[];for(const m of C.items)HZ.scene.remove(m);
  for(const t of C.tiles)HZ.tiles.delete(hzKey(t.i,t.j));C.meshes=[];C.traps=[];C.items=[];C.torches=[];C.dead=true;
}
/* walkable: inside a living tile, away from its closed walls, and away from wall corners */
function hzOk(x,z,r){
  const t=hzTile(x,z);if(!t)return false;const lx=x-t.i*HZS,lz=z-t.j*HZS,S=HZS;
  const nW=lx<r,nE=lx>S-r,nN=lz<r,nS=lz>S-r;
  if(nW&&!t.open.W||nE&&!t.open.E||nN&&!t.open.N||nS&&!t.open.S)return false;
  if((nW||nE)&&(nN||nS)){const d=HZ.tiles.get(hzKey(t.i+(nW?-1:1),t.j+(nN?-1:1)));if(!d||!t.room||d.room!==t.room)return false;}
  if(t.obs)for(const o of t.obs)if(Math.abs(x-o.x)<o.hx+r&&Math.abs(z-o.z)<o.hz+r)return false;
  return true;
}
/* ---------- sight and pathfinding (used by the demon in both modes) ---------- */
function hzDirOf(di,dj){return di===1?'E':di===-1?'W':dj===1?'S':'N';}
function hzLink(t,di,dj){/* can you step from tile t to its neighbour at (di,dj) */
  if(!di&&!dj)return true;
  if(!di||!dj)return !!t.open[hzDirOf(di,dj)];
  const a=HZ.tiles.get(hzKey(t.i+di,t.j)),b=HZ.tiles.get(hzKey(t.i,t.j+dj));
  return !!((a&&t.open[hzDirOf(di,0)]&&a.open[hzDirOf(0,dj)])||(b&&t.open[hzDirOf(0,dj)]&&b.open[hzDirOf(di,0)]));
}
function hzLos(x0,z0,x1,z1){/* a straight line that passes no wall and no pillar, crate or wardrobe */
  const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(L/.3));
  let pi=Math.floor(x0/HZS),pj=Math.floor(z0/HZS),pt=HZ.tiles.get(hzKey(pi,pj));if(!pt)return false;
  for(let k=1;k<=n;k++){const x=x0+dx*k/n,z=z0+dz*k/n,i=Math.floor(x/HZS),j=Math.floor(z/HZS);
    if(i!==pi||j!==pj){const t=HZ.tiles.get(hzKey(i,j));if(!t||Math.abs(i-pi)>1||Math.abs(j-pj)>1||!hzLink(pt,i-pi,j-pj))return false;pi=i;pj=j;pt=t;}
    if(pt.obs)for(const o of pt.obs)if(o.los&&Math.abs(x-o.x)<o.hx&&Math.abs(z-o.z)<o.hz)return false;}
  return true;
}
function hzLosW(x0,z0,x1,z1,r){/* a corridor as wide as a body is clear: the centre line and both shoulders */
  const dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz)||1,px=-dz/l*r,pz=dx/l*r;
  return hzLos(x0,z0,x1,z1)&&hzLos(x0+px,z0+pz,x1+px,z1+pz)&&hzLos(x0-px,z0-pz,x1-px,z1-pz);
}
function hzPath(a,b){/* shortest route between two tiles, as the list of tiles to walk through */
  if(!a||!b)return null;if(a===b)return [];
  const prev=new Map([[a,null]]),q=[a];let h=0;
  while(h<q.length){const t=q[h++];if(t===b)break;for(const k of['N','E','S','W']){if(!t.open[k])continue;const n=HZ.tiles.get(hzKey(t.i+HZD[k][0],t.j+HZD[k][1]));if(n&&!prev.has(n)){prev.set(n,t);q.push(n);}}}
  if(!prev.has(b))return null;const out=[];for(let t=b;t&&t!==a;t=prev.get(t))out.push(t);return out.reverse();
}
function hzTC(t){return [t.i*HZS+HZS/2,t.j*HZS+HZS/2];}
function hzNav(e,tx,tz,spd,dt){/* walk e toward (tx,tz): straight when it can see it, otherwise along the shortest route. true when there. */
  const H=HZ,d=Math.hypot(tx-e.x,tz-e.z);if(d<.55)return true;
  let gx=tx,gz=tz;const strict=(e.wedgeT||0)>H.t;
  if(strict||!hzLosW(e.x,e.z,tx,tz,.36)){
    const me=hzTile(e.x,e.z),to=hzTile(tx,tz),key=to?hzKey(to.i,to.j):'';
    if(!e.pc||e.pcK!==key||e.pcT<H.t||e.pcFrom!==me){e.pc=hzPath(me,to);e.pcK=key;e.pcT=H.t+.35;e.pcFrom=me;}
    const p=e.pc;
    if(p&&p.length){let k=0;if(!strict)while(k+1<p.length&&k<6&&hzLosW(e.x,e.z,...hzTC(p[k+1]),.36))k++;[gx,gz]=hzTC(p[k]);}
    else if(p&&!p.length&&me){/* same tile as the target but something is in the way: go via the tile middle */if(strict){[gx,gz]=hzTC(me);}}
  }
  const dx=gx-e.x,dz=gz-e.z,l=Math.hypot(dx,dz)||1,st=Math.min(l,spd*dt),nx=e.x+dx/l*st,nz=e.z+dz/l*st;
  const okx=hzOk(nx,e.z,.38),okz=hzOk(e.x,nz,.38);
  if(okx)e.x=nx;if(okz)e.z=nz;
  if(!okx&&!okz){/* wedged on a corner: follow tile middles for a moment */e.wedgeT=H.t+.8;const t=hzTile(e.x,e.z);if(t){const c=hzTC(t);e.x+=(c[0]-e.x)*Math.min(1,dt*3);e.z+=(c[1]-e.z)*Math.min(1,dt*3);}else{e.x=nx;e.z=nz;}}
  e.fwant=Math.atan2(dx,dz);
  return false;
}
/* ---------- the shared pieces ---------- */
function hzShared(){
  HZ.box=new T.BoxGeometry(1,1,1);
  {const parts=[],cone=new T.ConeGeometry(.09,.75,5);for(let a=0;a<9;a++)for(let b=0;b<4;b++)parts.push([cone,0xb8bcc4,new T.Matrix4().makeTranslation(-1.6+a*.4,.37,-.6+b*.4)]);HZ.spikeG=chandMerge(parts);}
  {const s=new T.Shape();s.moveTo(-1,.12);s.quadraticCurveTo(0,-.55,1,.12);s.lineTo(.85,.2);s.quadraticCurveTo(0,-.3,-.85,.2);s.closePath();
    HZ.bladeG=new T.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false});HZ.bladeG.translate(0,0,-.02);}
  HZ.potG=new T.CylinderGeometry(.12,.16,.32,8);HZ.gemG=new T.OctahedronGeometry(.17,0);
}
/* ---------- screen, buttons and controls ---------- */
function hzUI(){
  const st=document.createElement('style');st.id='hzst';st.textContent=
   '#hzui{position:fixed;inset:0;z-index:40;pointer-events:none;font-family:var(--f-display);color:#e8dcc8;user-select:none;-webkit-user-select:none}'+
   '#hzui .top{position:absolute;top:max(10px,env(safe-area-inset-top));left:max(14px,env(safe-area-inset-left));display:flex;flex-direction:column;gap:5px}'+
   '#hzdist{font-size:clamp(14px,3.4vh,24px);letter-spacing:3px;text-shadow:0 2px 0 #000}#hzbest{font-size:10px;color:#9a8a7a;letter-spacing:2px}'+
   '.hzbar{width:clamp(110px,22vw,190px);height:7px;background:#1a0c0c;border:1px solid #000}.hzbar i{display:block;height:100%;background:#c8242a}#hzsta i{background:#d8c890}'+
   '#hzdark{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.75))}#hzgrain{position:absolute;inset:-60px;opacity:.1;animation:hzg .45s steps(4) infinite}@keyframes hzg{0%{transform:translate(0,0)}25%{transform:translate(-31px,17px)}50%{transform:translate(23px,-29px)}75%{transform:translate(-13px,-41px)}100%{transform:translate(37px,11px)}}'+
   '#hzvig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 45%,rgba(120,0,0,.85));opacity:0}'+
   '#hzslit{position:absolute;inset:0;display:none;background:linear-gradient(90deg,#000 0,#000 34%,rgba(0,0,0,.25) 38%,rgba(0,0,0,.25) 46%,#000 49%,#000 51%,rgba(0,0,0,.25) 54%,rgba(0,0,0,.25) 62%,#000 66%,#000 100%)}#hzslit.on{display:block}'+
   '#hzflash{position:absolute;inset:0;background:#a00;opacity:0;transition:opacity .25s}'+
   '#hzmsg{position:absolute;left:0;right:0;top:30%;text-align:center;font-size:clamp(20px,7vh,54px);letter-spacing:10px;color:#e0262a;text-shadow:0 3px 0 #000,0 0 30px #600;opacity:0;transition:opacity .6s;padding:0 12px}'+
   '#hztip{position:absolute;left:0;right:0;bottom:22%;text-align:center;font-size:clamp(11px,2.6vh,15px);letter-spacing:3px;color:#ffd8a0;text-shadow:0 2px 0 #000;opacity:0;transition:opacity .3s}'+
   '#hzeye{display:none;width:44px;height:22px;border-radius:50%;border:2px solid #777;background:#111;position:relative;margin-top:2px}#hzeye i{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px;border-radius:50%;background:#777}#hzeye.sus{border-color:#ffc23a}#hzeye.sus i{background:#ffc23a}#hzeye.hunt{border-color:#ff2a2a;box-shadow:0 0 12px #f00}#hzeye.hunt i{background:#ff2a2a;width:14px;height:14px;margin:-7px}#hzeye.shut{height:4px;border-radius:2px;margin-top:11px}#hzeye.shut i{display:none}'+
   '#hzarrow{position:absolute;left:50%;top:18%;width:0;height:0;margin-left:-14px;border-left:14px solid transparent;border-right:14px solid transparent;border-bottom:34px solid rgba(255,210,120,.85);filter:drop-shadow(0 0 8px #f90);opacity:0;transition:opacity .4s;transform-origin:14px 22px}'+
   '#hzpz{all:unset;pointer-events:auto;position:absolute;right:max(12px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));padding:8px 12px;border:1px solid #6a2a2a;background:rgba(10,0,0,.6);color:#e8c8c8;font:inherit;font-size:11px;letter-spacing:2px;cursor:pointer}'+
   '#hzkeys{position:absolute;right:max(12px,env(safe-area-inset-right));top:calc(max(10px,env(safe-area-inset-top)) + 40px);font-size:10px;letter-spacing:2px;color:#9a8a7a;text-align:right;line-height:1.6}'+
   '#hzt{position:absolute;inset:0;pointer-events:auto;touch-action:none;display:none}#hzt.on{display:block}'+
   '#hzstick{position:absolute;width:110px;height:110px;border-radius:50%;border:2px solid rgba(255,220,200,.25);background:rgba(0,0,0,.25);display:none;transform:translate(-50%,-50%)}#hzknob{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px;border-radius:50%;background:rgba(255,220,200,.3)}'+
   '.hzb{position:absolute;width:72px;height:72px;border-radius:50%;border:2px solid rgba(255,200,180,.4);background:rgba(40,0,0,.45);color:#f0d8d0;display:flex;align-items:center;justify-content:center;font-size:10px;letter-spacing:1px;text-align:center}.hzb.on{background:rgba(160,20,20,.6)}.hzb[hidden]{display:none}'+
   '#hzrun{right:max(26px,env(safe-area-inset-right) + 16px);bottom:28px}#hzjump{right:max(116px,env(safe-area-inset-right) + 106px);bottom:20px;width:60px;height:60px}'+
   '#hzcr{right:max(116px,env(safe-area-inset-right) + 106px);bottom:20px;width:60px;height:60px}#hzact{right:max(36px,env(safe-area-inset-right) + 26px);bottom:122px;width:66px;height:66px;background:rgba(80,50,0,.55)}#hzlan{right:max(190px,env(safe-area-inset-right) + 180px);bottom:20px;width:56px;height:56px}#hzsen{right:max(124px,env(safe-area-inset-right) + 114px);bottom:96px;width:54px;height:54px}'+
   '#hzover{position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;background:rgba(0,0,0,.78);pointer-events:auto;text-align:center;padding:16px}#hzover.on{display:flex}'+
   '#hzover h1{margin:0;font-size:clamp(26px,8vh,64px);letter-spacing:8px;color:#e0262a;text-shadow:0 4px 0 #000}#hzover h1.win{color:#ffd24a}#hzover p{margin:0;font-size:13px;letter-spacing:2px;color:#d8c8b8;max-width:36em;line-height:1.6}'+
   '#hzover .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}#hzover button{all:unset;cursor:pointer;padding:12px 18px;border:1px solid #8a2a2a;background:#1a0606;color:#f0d0c8;font:inherit;font-size:12px;letter-spacing:3px}#hzover button:hover{background:#3a0a0a}'+
   '#hzload{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:#000;pointer-events:auto;text-align:center;padding:16px}#hzload .hzbar{width:min(70vw,320px);height:6px}#hzload p{margin:0;font-size:12px;letter-spacing:3px;color:#c8a8a0;max-width:40em;line-height:1.6}';
  document.head.appendChild(st);
  const hide=HZ.mode==='hide';
  const u=document.createElement('div');u.id='hzui';
  u.innerHTML='<div id="hzdark"></div><div id="hzgrain"></div><div id="hzvig"></div><div id="hzslit"></div><div id="hzflash"></div><div class="top"><div id="hzdist">0 m</div><div class="hzbar" id="hzhp"><i></i></div><div class="hzbar" id="hzsta"><i></i></div><div id="hzeye"><i></i></div><div id="hzbest"></div></div><div id="hzmsg"></div><div id="hztip"></div><div id="hzarrow"></div><div id="hzkeys"></div>'+
   '<div id="hzt"><div id="hzstick"><div id="hzknob"></div></div><div class="hzb" id="hzrun">SPRINT</div><div class="hzb" id="hzjump"'+(hide?' hidden':'')+'>JUMP</div><div class="hzb" id="hzcr"'+(hide?'':' hidden')+'>CROUCH</div><div class="hzb" id="hzact" hidden>HIDE</div><div class="hzb" id="hzlan"'+(hide?'':' hidden')+'>LIGHT</div><div class="hzb" id="hzsen"'+(hide?'':' hidden')+'>SENSE</div></div><button id="hzpz" type="button">❚❚ PAUSE</button>'+
   '<div id="hzover"><h1 id="hzot">PAUSED</h1><p id="hzop"></p><div class="row"><button type="button" id="hzres">RESUME</button><button type="button" id="hzagain">TRY AGAIN</button><button type="button" id="hzquit">MAIN MENU</button></div></div>'+
   '<div id="hzload"><p id="hzlt">SUMMONING THE DEMON…</p><div class="hzbar"><i id="hzlb" style="width:0%"></i></div><p id="hzlp" style="font-size:10px;color:#7a6a6a">full-detail model · about 17 MB the first time</p>'+
   (hide?'<p style="font-size:11px;color:#bfa898">Find the 5 relics, then escape through the gate. Walk or crouch to stay quiet, hide in wardrobes, keep your light off when it is near.<br>'+(isTouch?'CROUCH · HIDE · LIGHT · SENSE buttons':'C crouch · E hide / take · F light · Q sense the nearest relic')+'</p>':'<p style="font-size:11px;color:#bfa898">Run. Jump the spikes, time the blades.<br>'+(isTouch?'SPRINT and JUMP buttons':'Shift sprint · Space jump')+'</p>')+'</div>';
  document.body.appendChild(u);
  {const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),im=x.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255|0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}x.putImageData(im,0,0);u.querySelector('#hzgrain').style.backgroundImage='url('+c.toDataURL()+')';}
  const stop=e=>{e.stopPropagation();};for(const ev of['touchstart','touchmove','touchend','pointerdown','click'])u.addEventListener(ev,stop);
  u.querySelector('#hzpz').addEventListener('click',()=>hzPause(true));
  u.querySelector('#hzres').addEventListener('click',()=>hzPause(false));
  u.querySelector('#hzagain').addEventListener('click',()=>{hzQuit(true);});
  u.querySelector('#hzquit').addEventListener('click',()=>hzQuit(false));
  hzTouch(u);
  return u;
}
function hzTouch(u){
  const z=u.querySelector('#hzt'),stick=u.querySelector('#hzstick'),knob=u.querySelector('#hzknob'),B=id=>u.querySelector(id),btn={run:B('#hzrun'),jump:B('#hzjump'),cr:B('#hzcr'),act:B('#hzact'),lan:B('#hzlan'),sen:B('#hzsen')};
  const hit=(el,b)=>b&&!b.hidden&&(el===b||b.contains(el));
  z.addEventListener('touchstart',e=>{if(!HZ)return;for(const t of e.changedTouches){const el=t.target;
    if(hit(el,btn.run)){HZ.tRun=!HZ.tRun;btn.run.classList.toggle('on',HZ.tRun);continue;}
    if(hit(el,btn.jump)){HZ.tJump=1;continue;}
    if(hit(el,btn.cr)){HZ.pl.crouch=!HZ.pl.crouch;continue;}
    if(hit(el,btn.act)){HZ.kAct=1;continue;}
    if(hit(el,btn.lan)){HZ.kLan=1;continue;}
    if(hit(el,btn.sen)){HZ.kSen=1;continue;}
    if(t.clientX<innerWidth*.45&&HZ.mvId==null){HZ.mvId=t.identifier;HZ.mv0=[t.clientX,t.clientY];HZ.mv=[0,0];stick.style.display='block';stick.style.left=t.clientX+'px';stick.style.top=t.clientY+'px';knob.style.transform='';}
    else if(HZ.lkId==null){HZ.lkId=t.identifier;HZ.lk0=[t.clientX,t.clientY];}}e.preventDefault();},{passive:false});
  z.addEventListener('touchmove',e=>{if(!HZ)return;for(const t of e.changedTouches){
    if(t.identifier===HZ.mvId){let dx=t.clientX-HZ.mv0[0],dy=t.clientY-HZ.mv0[1];const l=Math.hypot(dx,dy),m=46;if(l>m){dx*=m/l;dy*=m/l;}HZ.mv=[dx/m,dy/m];knob.style.transform='translate('+dx+'px,'+dy+'px)';}
    else if(t.identifier===HZ.lkId){const dx=t.clientX-HZ.lk0[0],dy=t.clientY-HZ.lk0[1];HZ.lk0=[t.clientX,t.clientY];const s=.006*sens();HZ.pl.yaw-=dx*s;HZ.pl.pitch=clamp(HZ.pl.pitch-dy*s,-1.2,1.2);}}e.preventDefault();},{passive:false});
  const end=e=>{if(!HZ)return;for(const t of e.changedTouches){if(t.identifier===HZ.mvId){HZ.mvId=null;HZ.mv=[0,0];stick.style.display='none';}if(t.identifier===HZ.lkId)HZ.lkId=null;}};
  z.addEventListener('touchend',end);z.addEventListener('touchcancel',end);
}
function hzInputOnce(){
  if(window.__hzIn)return;window.__hzIn=1;
  addEventListener('mousemove',e=>{if(state!=='horror'||!HZ||HZ.paused||HZ.dead||document.pointerLockElement!==$('view'))return;if(Math.abs(e.movementX)>400||Math.abs(e.movementY)>400)return;
    HZ.pl.yaw-=e.movementX*.0023*sens();HZ.pl.pitch=clamp(HZ.pl.pitch-e.movementY*.0023*sens(),-1.2,1.2);});
  addEventListener('keydown',e=>{if(state!=='horror'||!HZ||e.repeat)return;
    if(e.code==='Escape'||e.code==='KeyP'){if(!HZ.dead)hzPause(!HZ.paused);}
    if(e.code==='Space'){e.preventDefault();HZ.kJump=1;}
    if(e.code==='KeyC'||e.code==='ControlLeft')HZ.pl.crouch=!HZ.pl.crouch;
    if(e.code==='KeyE')HZ.kAct=1;if(e.code==='KeyF')HZ.kLan=1;if(e.code==='KeyQ')HZ.kSen=1;});
  document.addEventListener('pointerlockchange',()=>{if(state==='horror'&&HZ&&!HZ.dead&&!HZ.paused&&!isTouch&&document.pointerLockElement!==$('view')&&HZ.lockedOnce)hzPause(true);if(document.pointerLockElement===$('view')&&HZ)HZ.lockedOnce=1;});
  $('view').addEventListener('click',()=>{if(state==='horror'&&HZ&&!HZ.paused&&!HZ.dead&&!isTouch&&document.pointerLockElement!==$('view'))try{$('view').requestPointerLock();}catch(_){}});
}
function hzPause(on){
  if(!HZ||HZ.dead||HZ.loading)return;HZ.paused=on;const o=$('hzover');o.classList.toggle('on',on);$('hzot').textContent='PAUSED';$('hzot').className='';
  $('hzop').textContent=HZ.mode==='hide'?'Relics '+HZ.keys+' of 5 · '+hsClock(HZ.t):Math.floor(HZ.dist)+' m so far';$('hzres').style.display='';
  if(on){try{if(document.pointerLockElement)document.exitPointerLock();}catch(_){}}else if(!isTouch)try{$('view').requestPointerLock();}catch(_){}
}
let HZM='run';
async function horStart(mode){
  if(HZ)return;
  HZM=mode||HZM||'run';
  initAudio();try{if(AC&&AC.state==='suspended')AC.resume();}catch(_){}
  hzInputOnce();
  HZ={posts:new Set(),mode:HZM,paused:true,dead:false,loading:true,tiles:new Map(),chunks:[],pathN:0,roomN:0,lastTrap:-9,gen:{i:0,j:-5,dir:'N',seg:3,room:0,next:'N'},t:0,dist:0,keys:0,noise:[],
    pl:{x:HZS/2,z:HZS/2+.5,y:0,vy:0,yaw:0,pitch:0,hp:100,sta:100,bob:0,hurtT:0,slow:0,crouch:false,ch:1.6},mv:[0,0],mvId:null,lkId:null,dm:{x:0,z:0,spd:0,on:false,wait:3.5,face:0},hb:0,stepD:0,lantern:true,senseT:0};
  $('title').hidden=true;$('hud').hidden=true;$('touch').hidden=true;
  const u=hzUI();u.querySelector('#hzt').classList.toggle('on',!!isTouch);
  state='horror';MUS.want='silent';
  try{
    await hzLoadDemon(p=>{const b=$('hzlb');if(b)b.style.width=Math.round(p*100)+'%';});
  }catch(e){console.warn(e);const lt=$('hzlt');if(lt)lt.textContent='COULD NOT LOAD THE DEMON. CHECK YOUR CONNECTION.';setTimeout(()=>hzQuit(false),2600);return;}
  if(!HZ)return;
  hzBuild();
  const ld=$('hzload');if(ld)ld.remove();
  HZ.loading=false;HZ.paused=false;
  if(!isTouch)try{$('view').requestPointerLock();}catch(_){}
  if(HZ.mode==='hide'){hzSay('HIDE',2.2);hzTip('Find 5 relics · it is listening',4);}else{hzSay('RUN',2.2);hzRoar(.6);}
}
function hzBuild(){
  const sc=HZ.scene=new T.Scene();sc.background=new T.Color(0x000000);sc.fog=new T.Fog(0x000000,2,HZ.mode==='hide'?24:21);
  HZ.mat=hzMats();hzShared();
  sc.add(new T.AmbientLight(0x3a3448,HZ.mode==='hide'?.36:.32));
  HZ.lamp=new T.PointLight(0xffb070,1,11,1.5);sc.add(HZ.lamp);
  HZ.tl=[];for(let i=0;i<3;i++){const l=new T.PointLight(0xff8a3a,0,12,1.6);sc.add(l);HZ.tl.push(l);}
  const A=HZA,dm=HZ.dm;
  const g=new T.Group();g.add(A.root);A.root.position.set(0,0,0);A.root.rotation.set(0,0,0);g.scale.setScalar(1.45);sc.add(g);dm.g=g;
  const mx=dm.mix=new T.AnimationMixer(A.root);dm.run=mx.clipAction(A.run);dm.idle=mx.clipAction(A.idle);dm.idle.play();dm.run.play();dm.run.setEffectiveWeight(0);dm.idle.setEffectiveWeight(1);dm.rw=0;
  if(HZ.mode==='hide')hsBuild();
  else{
    /* the start: a dead end behind you where it waits, then a straight run north, then the generated corridor */
    const C=hzNewChunk();
    for(let j=4;j>=-5;j--){const t=hzAdd(0,j,0);if(j<4)t.open.S=1;t.open.N=1;}
    hzBuildChunk(C);
    for(let k=0;k<3;k++)hzGenChunk();
    HZ.pl.x=HZS/2;HZ.pl.z=1*HZS+HZS/2;HZ.pl.yaw=0;
    dm.x=HZS/2;dm.z=4*HZS+HZS/2;dm.face=Math.PI;
    $('hzbest').textContent='BEST '+Math.floor(meta.hzBest||0)+' m';
  }
  g.position.set(dm.x,0,dm.z);g.rotation.y=dm.face;
  try{renderer.compile(sc,cam);}catch(_){}
}
function hzSay(t,s){const m=$('hzmsg');if(!m)return;m.textContent=t;m.style.opacity=1;clearTimeout(HZ.sayT);HZ.sayT=setTimeout(()=>{if(m)m.style.opacity=0;},s*1000);}
function hzTip(t,s){const m=$('hztip');if(!m||!HZ)return;if(m.textContent!==t)m.textContent=t;m.style.opacity=t?1:0;clearTimeout(HZ.tipT);if(s)HZ.tipT=setTimeout(()=>{if(m)m.style.opacity=0;},s*1000);}
function hzQuit(again){
  const H=HZ;
  try{if(document.pointerLockElement)document.exitPointerLock();}catch(_){}
  if(H&&H.scene){for(const C of H.chunks)if(!C.dead)hzDropChunk(C);if(HZA&&HZA.root.parent)HZA.root.parent.remove(HZA.root);
    try{H.scene.traverse(o=>{if(o.geometry&&o.geometry!==H.box&&!(HZA&&o===HZA.mesh))o.geometry.dispose();});for(const k in H.mat){const m=H.mat[k];if(m.map)m.map.dispose();m.dispose();}H.box.dispose();H.spikeG.dispose();H.bladeG.dispose();H.potG.dispose();if(H.dm.mix)H.dm.mix.stopAllAction();}catch(_){}}
  hzAmbStop();try{for(const m of H.writ||[]){m.map.dispose();m.dispose();}}catch(_){}
  HZ=null;
  const u=$('hzui');if(u)u.remove();const st=$('hzst');if(st)st.remove();
  if(again){state='title';horStart(HZM);return;}
  state='title';$('title').hidden=false;try{window.__mmGo('main');}catch(_){}MUS.want='title';resize();
}
/* ---------- sounds of the hunt (horror modes only) ---------- */
function hzS(fn){if(!AC||muted||!nbuf)return;try{fn(master);}catch(_){}}
function hzRoar(v){hzS(o=>{sfxT(o,180,60,1.6,'sawtooth',.16*v);sfxT(o,120,45,1.8,'square',.08*v,.05);sfxN(o,1.6,.25*v,700,'bandpass',0,1.2);});}
function hzThud(v){hzS(o=>{sfxT(o,90,38,.18,'sine',.32*v);sfxN(o,.12,.12*v,260);});}
function hzSniff(v){hzS(o=>{for(let i=0;i<3;i++)sfxN(o,.12,.09*v,1800,'bandpass',i*.18,2);});}
function hzScream(){/* the jumpscare: a shriek, a crash and a sub-bass hit, all at once */
  hzS(o=>{const t=AC.currentTime,ws=AC.createWaveShaper();ws.curve=hzCurve();ws.connect(o);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.32,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+1.6);g.connect(ws);
    for(const [f0,f1,ty] of[[620,1900,'sawtooth'],[655,2050,'sawtooth'],[300,90,'square'],[1300,700,'sawtooth']]){const q=AC.createOscillator();q.type=ty;q.frequency.setValueAtTime(f0,t);q.frequency.exponentialRampToValueAtTime(f1,t+.35);q.frequency.exponentialRampToValueAtTime(f1*.5,t+1.5);
      const lf=AC.createOscillator(),lg=AC.createGain();lf.frequency.value=23;lg.gain.value=f0*.06;lf.connect(lg);lg.connect(q.frequency);lf.start(t);lf.stop(t+1.6);q.connect(g);q.start(t);q.stop(t+1.6);}
    sfxN(o,1.2,.5,3000,'bandpass',0,.6);sfxN(o,.5,.6,200);sfxT(o,90,25,1.4,'sine',.7);sfxT(o,2400,1200,.4,'square',.06);});}
function hzCurve(){if(window.__hzCv)return window.__hzCv;const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;c[i]=Math.tanh(x*6);}return window.__hzCv=c;}
function hzSting(v){/* a violin-like screech and a low hit: something just saw you, or you just saw it */
  hzS(o=>{const t=AC.currentTime,bp=AC.createBiquadFilter(),g=AC.createGain();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=1.2;bp.connect(g);g.connect(o);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.22*v,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+1.4);
    for(const f of[1180,1250,1330,1660]){const q=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain();q.type='sawtooth';q.frequency.setValueAtTime(f,t);q.frequency.linearRampToValueAtTime(f*1.06,t+1.3);lf.frequency.value=9+Math.random()*4;lg.gain.value=f*.025;lf.connect(lg);lg.connect(q.frequency);q.connect(bp);q.start(t);q.stop(t+1.45);lf.start(t);lf.stop(t+1.45);}
    sfxT(o,80,30,.9,'sine',.45*v);sfxN(o,.4,.2*v,400);});}
/* the horror soundscape (both modes): a breathing drone, dissonant string swells, a broken music box, whispers, distant
   scrapes and slams, footsteps that are not yours, and pounding drums with shrieking strings when it is hunting you.
   Music parts follow the Music setting; the scares are sound effects. */
function hzAmbStop(){const H=HZ;if(H&&H.drone){try{for(const n of H.drone.src)n.stop();H.drone.out.disconnect();}catch(_){}H.drone=null;}}
function hzAmb(dt){
  const H=HZ;if(!AC||muted||!nbuf)return;const t=AC.currentTime,f=H.fear||0,mo=MUS.on?MUS.gain:null;
  if(!H.drone&&mo){const out=AC.createGain(),lp=AC.createBiquadFilter(),lfo=AC.createOscillator(),lg=AC.createGain(),src=[];
    lp.type='lowpass';lp.frequency.value=160;lp.Q.value=4;out.gain.value=0;out.gain.linearRampToValueAtTime(.09,t+4);lp.connect(out);out.connect(mo);
    for(const [fr,ty] of[[41.2,'sawtooth'],[43.65,'sawtooth'],[61.7,'triangle'],[82.4,'sine']]){const q=AC.createOscillator();q.type=ty;q.frequency.value=fr;q.connect(lp);q.start();src.push(q);}
    lfo.frequency.value=.09;lg.gain.value=90;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();src.push(lfo);
    H.drone={out,lp,src};}
  if(H.drone){const D=H.drone;D.lp.frequency.setTargetAtTime(150+f*500,t,.6);D.out.gain.setTargetAtTime(.08+f*.08,t,.8);}
  H.ambT=(H.ambT||{});const T_=H.ambT,due=(k,a,b)=>{if(T_[k]==null)T_[k]=H.t+rnd(a*.5,b);if(H.t>=T_[k]){T_[k]=H.t+rnd(a,b);return true;}return false;};
  const pan=(fn)=>sfxPan(fn,Math.random()*1.8-.9);
  /* strings that swell out of nowhere, a semitone apart */
  if(mo&&due('sw',8,15)){const base=pick([233,247,262,277,311]),out=AC.createGain(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=base*3;bp.Q.value=.8;bp.connect(out);out.connect(mo);if(MUS.wet)out.connect(MUS.wet);
    out.gain.setValueAtTime(.0001,t);out.gain.linearRampToValueAtTime(.05,t+3);out.gain.linearRampToValueAtTime(.0001,t+6.5);
    for(const m of[1,1.0595,1.4983,2.0]){const q=AC.createOscillator();q.type='sawtooth';q.frequency.value=base*m*(1+Math.random()*.004);q.connect(bp);q.start(t);q.stop(t+6.6);}}
  /* a broken music box, out of tune, a long way off */
  if(mo&&due('mb',14,26)){const sc=[0,1,3,5,6,8,10],n0=pick([79,81,84]);let st=ri(3,6);for(let i=0;i<st;i++){const fr=mtof(n0-sc[ri(0,6)]-(i>2?12:0))*(1-Math.random()*.02),tt=t+i*rnd(.32,.55);
    const q=AC.createOscillator(),q2=AC.createOscillator(),g=AC.createGain();q.type='sine';q2.type='sine';q.frequency.value=fr;q2.frequency.value=fr*4.02;g.gain.setValueAtTime(.0001,tt);g.gain.linearRampToValueAtTime(.035,tt+.005);g.gain.exponentialRampToValueAtTime(.0001,tt+1.4);
    q.connect(g);q2.connect(g);g.connect(mo);if(MUS.wet)g.connect(MUS.wet);q.start(tt);q2.start(tt);q.stop(tt+1.5);q2.stop(tt+1.5);}}
  /* whispers from one side */
  if(due('wh',16,30))pan(o=>{for(let i=0;i<ri(5,9);i++){const tt=i*rnd(.08,.16);sfxN(o,rnd(.08,.18),.03,pick([900,1300,2100,2800]),'bandpass',tt,6);}});
  /* a scrape of metal or a slam somewhere in the dark */
  if(due('sc',18,34))pan(o=>{if(Math.random()<.5){sfxT(o,rnd(260,340),rnd(220,300),1.4,'sawtooth',.018);sfxN(o,1.3,.03,2400,'bandpass',0,8);}else{sfxN(o,.5,.16,180);sfxT(o,70,30,.6,'sine',.18);}});
  /* footsteps right behind you that are not yours */
  if(due('fs',30,55)&&f<.5)hzS(o=>{for(let i=0;i<3;i++){sfxN(o,.07,.07,420,'lowpass',i*.42);sfxT(o,95,45,.08,'sine',.08,i*.42);}});
  /* the hunt: drums and shrieking strings */
  if(mo&&f>.6){H.drT=(H.drT||0)-dt;if(H.drT<=0){H.drT=f>.85?.32:.46;sfxT(mo,72,34,.4,'sine',.35*f);sfxN(mo,.18,.1*f,300);}
    if(due('sh',2.2,3.6)){const q=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain(),fr=rnd(1400,2000);q.type='sawtooth';q.frequency.value=fr;lf.frequency.value=13;lg.gain.value=fr*.03;lf.connect(lg);lg.connect(q.frequency);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03*f,t+.4);g.gain.exponentialRampToValueAtTime(.0001,t+2);q.connect(g);g.connect(mo);q.start(t);q.stop(t+2.1);lf.start(t);lf.stop(t+2.1);}}
}
function hzChime(v){hzS(o=>{sfxT(o,1320,1320,1.2,'sine',.05*v);sfxT(o,1980,1980,1,'sine',.03*v,.15);});}
/* ---------- the frame ---------- */
function horTick(dt){
  const H=HZ;if(!H)return;
  /* render size: sharper than the climb, so the demon keeps its detail */
  {const w=gameEl.clientWidth||innerWidth,h=gameEl.clientHeight||innerHeight,a=w/Math.max(1,h),RHh=Math.min(h*Math.min(2,devicePixelRatio||1),window.__hzRH||(H.lowRes?360:540))|0,RWh=Math.min(1280,Math.round(RHh*a));
    const cv=renderer.domElement;if(cv.width!==RWh||cv.height!==RHh){renderer.setSize(RWh,RHh,false);cam.aspect=a;cam.updateProjectionMatrix();}}
  const pl=H.pl;
  pl.ch+=((pl.crouch&&!H.hidden?1.0:1.6)-pl.ch)*Math.min(1,dt*10);
  if(H.hidden){const c=H.hidden;cam.position.set(c.x+c.fx*.12,1.55,c.z+c.fz*.12);}
  else cam.position.set(pl.x,pl.ch+pl.y+Math.sin(pl.bob*1.6)*.05,pl.z);
  cam.rotation.set(pl.pitch,pl.yaw,0);
  if(H.loading||H.paused){if(H.lamp)H.lamp.position.copy(cam.position);if(H.drone&&AC)H.drone.out.gain.setTargetAtTime(.015,AC.currentTime,.3);return;}
  H.t+=dt;try{hzAmb(dt);}catch(_){}
  /* frame-rate guard: if the phone struggles for a few seconds, render fewer pixels (the model itself stays full detail) */
  {const now=performance.now(),rd=H.lastNow?(now-H.lastNow)/1000:.016;H.lastNow=now;H.fpsA=(H.fpsA||60)*.95+(1/Math.max(.001,rd))*.05;}if(H.t>4&&H.fpsA<24&&!H.lowRes)H.lowRes=true;
  if(H.dead){hzDeadTick(dt);return;}
  if(H.won){hsWinTick(dt);return;}
  const hide=H.mode==='hide';
  const sy=Math.sin(pl.yaw),cy=Math.cos(pl.yaw);
  if(H.hidden){hsHiddenTick(dt);}
  else{
    /* move */
    let fx=0,fz=0;
    if(keys.KeyW||keys.ArrowUp)fz+=1;if(keys.KeyS||keys.ArrowDown)fz-=1;if(keys.KeyA)fx-=1;if(keys.KeyD)fx+=1;
    if(keys.ArrowLeft)pl.yaw+=dt*2.2;if(keys.ArrowRight)pl.yaw-=dt*2.2;
    if(H.mv[0]||H.mv[1]){fx+=H.mv[0];fz-=H.mv[1];}
    const ml=Math.hypot(fx,fz);if(ml>1){fx/=ml;fz/=ml;}
    const wantRun=(keys.ShiftLeft||keys.ShiftRight||H.tRun)&&fz>.2;
    if(wantRun&&pl.crouch)pl.crouch=false;
    const run=wantRun&&pl.sta>0&&!pl.tired;
    if(run)pl.sta=Math.max(0,pl.sta-dt*(hide?16:12));else pl.sta=Math.min(100,pl.sta+dt*(ml>.1?15:24));
    if(pl.sta<=0)pl.tired=true;if(pl.tired&&pl.sta>30)pl.tired=false;
    const spd=(hide?(run?6.3:pl.crouch?2.1:3.7):(run?7:4.3))*(pl.slow>0?.45:1);pl.slow=Math.max(0,pl.slow-dt);
    const vx=(-sy*fz+cy*fx)*spd,vz=(-cy*fz-sy*fx)*spd;
    const ox=pl.x,oz=pl.z;let nx=pl.x+vx*dt;if(hzOk(nx,pl.z,.32))pl.x=nx;let nz=pl.z+vz*dt;if(hzOk(pl.x,nz,.32))pl.z=nz;
    const moved=Math.hypot(pl.x-ox,pl.z-oz);H.pvx=(pl.x-ox)/Math.max(dt,.001);H.pvz=(pl.z-oz)/Math.max(dt,.001);
    /* jump (Horror run only) */
    if((H.kJump||H.tJump)&&pl.y<=0&&!hide){pl.vy=4.6;try{SFX.jump&&SFX.jump();}catch(_){}}H.kJump=H.tJump=0;
    if(pl.y>0||pl.vy>0){pl.vy-=13*dt;pl.y=Math.max(0,pl.y+pl.vy*dt);if(pl.y===0)pl.vy=0;}
    /* bob and footsteps; in Hide & Seek every step makes noise the demon can hear (none when crouching) */
    if(moved>0&&pl.y===0){pl.bob+=moved*(run?1.15:pl.crouch?.8:1.35);H.stepD+=moved;if(H.stepD>(run?2.1:1.8)){H.stepD=0;
      if(!pl.crouch)hzS(o=>{sfxN(o,.07,run?.09:.05,480+Math.random()*200);sfxT(o,100,50,.07,'sine',run?.07:.04);});
      if(hide&&!pl.crouch)H.noise.push({x:pl.x,z:pl.z,r:run?17:6.5});}}
  }
  if(!hide){
    /* distance = furthest path tile reached; build ahead, delete behind */
    const ct=hzTile(pl.x,pl.z);if(ct){H.dist=Math.max(H.dist,(ct.idx-4)*HZS);
      const k=ct.ck;while(H.chunks.length<k+4)hzGenChunk();
      for(const C of H.chunks)if(!C.dead&&C.k<k-1)hzDropChunk(C);}
    for(const C of H.chunks){if(C.dead)continue;for(const tp of C.traps)hzTrap(tp,dt,pl);
      for(let i=C.items.length-1;i>=0;i--){const m=C.items[i];m.rotation.y+=dt*2;m.position.y=.35+Math.sin(H.t*3+i)*.06;if(Math.hypot(m.position.x-pl.x,m.position.z-pl.z)<.8){pl.hp=Math.min(100,pl.hp+30);H.scene.remove(m);C.items.splice(i,1);try{SFX.mend&&SFX.mend();}catch(_){}hzSay('+30',1);}}}
  }else hsWorld(dt);
  /* lights: your lantern and the three nearest torches */
  {const on=!hide||H.lantern;H.lamp.position.set(pl.x-sy*.5,1.7+pl.y,pl.z-cy*.5);H.lamp.distance=on?11:5;H.lamp.intensity=((on?1:.3)+Math.sin(H.t*9)*.05+Math.random()*.04)*(Math.random()<(H.fear||0)*.1?.15:1);}
  {const ts=[];for(const C of H.chunks)if(!C.dead)for(const t of C.torches){t.d=Math.hypot(t.x-pl.x,t.z-pl.z);if(t.d<20)ts.push(t);}ts.sort((a,b)=>a.d-b.d);
    for(let i=0;i<3;i++){const l=H.tl[i],t=ts[i];if(!t){l.intensity=0;continue;}l.position.set(t.x,t.y,t.z);l.intensity=(1.05+Math.sin(H.t*11+t.ph)*.12+Math.random()*.12)*clamp((20-t.d)/4,0,1)*(Math.random()<(H.fear||0)*.16?.08:1);}}
  if(hide)hsDemon(dt);else hzDemon(dt);
  /* HUD */
  $('hzdist').textContent=hide?'RELICS '+H.keys+' / 5':Math.floor(H.dist)+' m';$('hzhp').firstChild.style.width=pl.hp+'%';$('hzsta').firstChild.style.width=pl.sta+'%';
  if(pl.hp<=0)hzDie('trap');
}
function hzTrap(tp,dt,pl){
  const H=HZ,along=tp.ax==='z'?pl.z-tp.z:pl.x-tp.x,across=tp.ax==='z'?pl.x-tp.x:pl.z-tp.z;
  if(tp.k==='spike'){
    const c=((H.t+tp.ph)%2.6)/2.6,up=c>.62&&c<.86,warn=c>.48&&c<=.62;
    const ty=up?0:warn?-.62:-.78;tp.sp.position.y+=(ty-tp.sp.position.y)*Math.min(1,dt*(up?28:8));
    const near=Math.hypot(pl.x-tp.x,pl.z-tp.z);
    if(warn&&!tp.rat&&near<10){tp.rat=1;hzS(o=>{for(let i=0;i<4;i++)sfxN(o,.04,.05,3000,'bandpass',i*.06,5);});}if(!warn)tp.rat=0;
    if(up&&!tp.snd&&near<12){tp.snd=1;hzS(o=>{sfxN(o,.12,.18,2600);sfxT(o,1400,600,.08,'square',.04);});}if(!up)tp.snd=0;
    if(up&&Math.abs(along)<1&&Math.abs(across)<1.9&&pl.y<.35&&pl.hurtT<=H.t){pl.hurtT=H.t+.9;hzHurt(26);}
  }else{
    const a=Math.sin((H.t+tp.ph)*tp.sp)*1.15;tp.arm.rotation.z=a;
    const bx=Math.sin(a)*3.05,by=HZH-.05-Math.cos(a)*3.05;
    if(Math.abs(along)<.45&&Math.abs(across-bx)<.75&&by<1.9&&pl.hurtT<=H.t){pl.hurtT=H.t+1;hzHurt(34);}
    const sw=Math.cos((H.t+tp.ph)*tp.sp);if(Math.abs(sw)>.97&&!tp.w&&Math.hypot(pl.x-tp.x,pl.z-tp.z)<9){tp.w=1;hzS(o=>sfxN(o,.35,.07,900,'bandpass',0,2));}if(Math.abs(sw)<.5)tp.w=0;
  }
}
function hzHurt(n){const H=HZ;H.pl.hp-=n;H.pl.slow=.7;const f=$('hzflash');f.style.opacity=.55;setTimeout(()=>{if(f)f.style.opacity=0;},140);try{SFX.hurt&&SFX.hurt();}catch(_){}try{vib&&vib([40]);}catch(_){}}
/* the demon's body: face where it is going, blend idle and run, footsteps, heartbeat */
function hzBody(dt,spd,moving){
  const H=HZ,dm=H.dm,pl=H.pl,dist=Math.hypot(dm.x-pl.x,dm.z-pl.z);
  let df=(dm.fwant==null?dm.face:dm.fwant)-dm.face;df=Math.atan2(Math.sin(df),Math.cos(df));dm.face+=df*Math.min(1,dt*9);
  dm.g.position.set(dm.x,0,dm.z);dm.g.rotation.y=dm.face;
  const w=moving?1:0;dm.rw+=(w-dm.rw)*Math.min(1,dt*5);dm.run.setEffectiveWeight(dm.rw);dm.idle.setEffectiveWeight(1-dm.rw);dm.run.timeScale=clamp(spd/5.2,.5,1.7);
  dm.mix.update(dt);
  if(moving){dm.st=(dm.st||0)+dt*spd;if(dm.st>1.45){dm.st=0;const v=clamp(1-dist/30,0,1)*(spd<3.5?.55:1);if(v>.02)hzThud(v);}}
  return dist;
}
/* ---------- Horror: the demon runs you down along the corridor ---------- */
function hzDemon(dt){
  const H=HZ,dm=H.dm,pl=H.pl;
  let dist=Math.hypot(dm.x-pl.x,dm.z-pl.z);
  if(!dm.on){dm.wait-=dt;if(dm.wait<=0||Math.hypot(pl.x-HZS/2,pl.z-(HZS+HZS/2))>7){dm.on=true;hzRoar(1);}}
  else{
    /* it never backs off: it takes the shortest way to where you are now, and closes in fast when it falls behind */
    const base=Math.min(6.4,5.3+H.t*.004);dm.spd=dist>14?8.4:dist>9?Math.max(base,6.8):base;
    if(!hzTile(dm.x,dm.z)){/* the corridor behind you is gone: it comes in through the oldest piece still standing */
      let first=null;for(const t of H.tiles.values())if(!first||t.idx<first.idx)first=t;
      if(first){const c=hzTC(first),dx=c[0]-dm.x,dz=c[1]-dm.z,l=Math.hypot(dx,dz)||1,st=Math.min(l,dm.spd*1.4*dt);dm.x+=dx/l*st;dm.z+=dz/l*st;dm.fwant=Math.atan2(dx,dz);}}
    else hzNav(dm,pl.x,pl.z,dm.spd,dt);
  }
  dist=hzBody(dt,dm.on?dm.spd:0,dm.on);
  const near=clamp(1-dist/14,0,1);$('hzvig').style.opacity=(near*.9).toFixed(2);
  H.hb-=dt;if(dm.on&&dist<16&&H.hb<=0){H.hb=.35+dist*.05;hzS(o=>{sfxT(o,70,45,.12,'sine',.25*near+.06);sfxT(o,64,40,.14,'sine',.18*near+.04,.16);});}
  if(dm.on&&dist<22&&Math.random()<dt*.18)hzRoar(.45*near+.15);
  H.fear=dm.on?clamp(1-dist/22,0,1):.1;
  /* a sting the moment it comes into view close behind you */
  if(dm.on&&dist<14&&H.t>(H.stingT||0)&&hzLos(dm.x,dm.z,pl.x,pl.z)){if(!H.inView)hzSting(1);H.inView=1;H.stingT=H.t+10;}else if(dist>18||!hzLos(dm.x,dm.z,pl.x,pl.z))H.inView=0;
  if(dm.on&&dist<1.35)hzDie('demon');
}
function hzDie(why){
  const H=HZ;if(H.dead)return;H.dead=true;H.deadT=0;H.why=why;
  try{if(document.pointerLockElement)document.exitPointerLock();}catch(_){}
  if(H.hidden){const c=H.hidden;H.hidden=null;$('hzslit').classList.remove('on');H.pl.x=c.x+c.fx*.9;H.pl.z=c.z+c.fz*.9;}
  if(why==='demon'){hzScream();const f=$('hzflash');f.style.opacity=.7;setTimeout(()=>{if(f)f.style.opacity=0;},300);}
  else{try{SFX.hurt&&SFX.hurt();}catch(_){}}
  if(H.mode==='hide'){H.result={txt:'Relics '+H.keys+' of 5 · '+hsClock(H.t)};return;}
  const best=Math.max(meta.hzBest||0,H.dist),nb=H.dist>(meta.hzBest||0);meta.hzBest=best;try{save();}catch(_){}
  H.result={txt:Math.floor(H.dist)+' m'+(nb?' · NEW BEST':' · best '+Math.floor(best)+' m')};
}
function hzDeadTick(dt){
  const H=HZ,dm=H.dm,pl=H.pl;H.deadT+=dt;
  if(H.why==='demon'){
    /* it lunges in and you turn to face it */
    const dx=dm.x-pl.x,dz=dm.z-pl.z,l=Math.hypot(dx,dz)||1;if(l>1.4){dm.x-=dx/l*Math.min(l-1.4,dt*4);dm.z-=dz/l*Math.min(l-1.4,dt*4);}
    dm.face=Math.atan2(-dx,-dz);dm.g.position.set(dm.x,0,dm.z);dm.g.rotation.y=dm.face;
    const want=Math.atan2(-dx,-dz);let d=want-pl.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));pl.yaw+=d*Math.min(1,dt*9);pl.pitch+=(.2-pl.pitch)*Math.min(1,dt*6);
    dm.rw+=(0-dm.rw)*Math.min(1,dt*5);dm.run.setEffectiveWeight(dm.rw);dm.idle.setEffectiveWeight(1-dm.rw);dm.mix.update(dt*.7);
    cam.position.x+=(Math.random()-.5)*.04;cam.position.y+=(Math.random()-.5)*.04;
  }else{pl.pitch+=(.9-pl.pitch)*dt*2;pl.y=Math.max(-1.1,pl.y-dt*1.4);}
  if(H.deadT>1.4&&!H.shown){H.shown=1;const o=$('hzover');o.classList.add('on');$('hzot').className='';
    $('hzot').textContent=H.why==='demon'?(H.mode==='hide'?'IT FOUND YOU':'IT CAUGHT YOU'):'THE DUNGEON TOOK YOU';
    $('hzop').textContent=H.result.txt;$('hzres').style.display='none';}
}
/* ---------- HIDE & SEEK: one big dungeon, a maze of passages, and a demon that hunts by sight, sound and memory ---------- */
function hsClock(t){t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function hsShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function hsBfs(t0,maxD){/* distances in steps from tile t0 */
  const D=new Map([[t0,0]]),q=[t0];let h=0;
  while(h<q.length){const t=q[h++],d=D.get(t);if(maxD!=null&&d>=maxD)continue;for(const k of['N','E','S','W']){if(!t.open[k])continue;const n=HZ.tiles.get(hzKey(t.i+HZD[k][0],t.j+HZD[k][1]));if(n&&!D.has(n)){D.set(n,d+1);q.push(n);}}}
  return D;
}
function hsBuild(){
  const H=HZ,N=16,S=HZS;H.N=N;
  for(let k=0;k<17;k++)hzNewChunk();
  const ck=(i,j)=>(j>>2)*4+(i>>2),T_=(i,j)=>H.tiles.get(hzKey(i,j));
  /* the great hall in the middle, side rooms around it */
  const rooms=[{x0:5,y0:5,x1:10,y1:10,id:1,hall:1}];
  for(let a=0;a<120&&rooms.length<11;a++){const w=ri(2,3),h=ri(2,3),x0=ri(0,N-w),y0=ri(0,N-h),x1=x0+w-1,y1=y0+h-1;
    if(rooms.some(r=>x0<=r.x1+1&&x1>=r.x0-1&&y0<=r.y1+1&&y1>=r.y0-1))continue;rooms.push({x0,y0,x1,y1,id:rooms.length+1});}
  const rid=(i,j)=>{for(const r of rooms)if(i>=r.x0&&i<=r.x1&&j>=r.y0&&j<=r.y1)return r.id;return 0;};
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)hzAdd(i,j,ck(i,j),{room:rid(i,j),idx:ri(1,5)});
  /* passages: a maze that joins everything, with extra loops so you can circle round it */
  const par=new Map();for(const t of H.tiles.values())par.set(t,t);
  const find=t=>{while(par.get(t)!==t){par.set(t,par.get(par.get(t)));t=par.get(t);}return t;};
  const link=(a,b,k)=>{a.open[k]=1;b.open[HZO[k]]=1;};
  const edges=[];
  for(const t of H.tiles.values())for(const k of['E','S']){const n=T_(t.i+HZD[k][0],t.j+HZD[k][1]);if(!n)continue;
    if(t.room&&t.room===n.room){link(t,n,k);par.set(find(t),find(n));}else edges.push([t,n,k]);}
  hsShuffle(edges);
  for(const [a,b,k] of edges){if(find(a)!==find(b)){link(a,b,k);par.set(find(a),find(b));}else if(Math.random()<.14&&!(a.room&&b.room))link(a,b,k);}
  for(const r of rooms){const want=r.hall?8:1;let n=0;for(const [a,b,k] of hsShuffle(edges.filter(([a,b])=>(a.room===r.id)!==(b.room===r.id)))){if(n>=want)break;if(!a.open[k]){link(a,b,k);n++;}}}
  /* obstacles: pillars, an altar and crates in the hall; they block movement and sight */
  H.obsList=[];const props=[],glow=[],box=H.box;
  const addObs=(x,z,hx,hz,los)=>{const o={x,z,hx,hz,los};H.obsList.push(o);
    for(let j=Math.floor((z-hz-.5)/S);j<=Math.floor((z+hz+.5)/S);j++)for(let i=Math.floor((x-hx-.5)/S);i<=Math.floor((x+hx+.5)/S);i++){const t=T_(i,j);if(t)(t.obs||(t.obs=[])).push(o);}return o;};
  const M=(x,y,z,sx,sy,sz,ry)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry||0),new T.Vector3(sx,sy,sz));
  for(const px of[24,32,40])for(const pz of[24,32,40]){if(px===32&&pz===32)continue;addObs(px,pz,.5,.5,1);
    props.push([box,0x6a645a,M(px,HZH/2,pz,1,HZH,1)]);props.push([box,0x4a453e,M(px,.2,pz,1.3,.4,1.3)]);props.push([box,0x4a453e,M(px,HZH-.2,pz,1.3,.4,1.3)]);}
  addObs(32,32,1.05,1.05,0);props.push([box,0x3a3430,M(32,.45,32,2,.9,2)]);props.push([box,0x2a2420,M(32,.95,32,1.6,.1,1.6)]);
  for(const [a,b] of[[-.5,-.5],[.5,-.4],[-.4,.5],[.45,.45],[0,0]]){props.push([box,0xe8dcc0,M(32+a,1.15,32+b,.09,.3,.09)]);glow.push([box,0xffc860,M(32+a,1.36,32+b,.06,.1,.06)]);}
  H.chunks[0].torches.push({x:32,y:1.6,z:32,ph:1});
  for(const [bx,bz] of[[28,28],[36,28],[28,36],[36,36]]){addObs(bx,bz,.3,.3,0);props.push([box,0x2a2622,M(bx,.5,bz,.18,1,.18)]);props.push([box,0x3a3430,M(bx,1.05,bz,.6,.18,.6)]);glow.push([box,0xff7a22,M(bx,1.22,bz,.42,.22,.42,.7)]);glow.push([box,0xffd27a,M(bx,1.3,bz,.2,.3,.2)]);H.chunks[0].torches.push({x:bx,y:1.7,z:bz,ph:bx+bz});}
  for(let n=0,a=0;n<7&&a<60;a++){const i=ri(5,10),j=ri(5,10),sx=Math.random()<.5?-1:1,sz=Math.random()<.5?-1:1,x=i*S+2+sx*1.25,z=j*S+2+sz*1.25;
    if(H.obsList.some(o=>Math.abs(o.x-x)<o.hx+1.3&&Math.abs(o.z-z)<o.hz+1.3))continue;addObs(x,z,.48,.48,1);n++;
    props.push([box,0x6a4a2e,M(x,.45,z,.95,.9,.95,rnd(.4))]);props.push([box,0x5a3e26,M(x+rnd(-.1,.1),1.3,z+rnd(-.1,.1),.8,.8,.8,rnd(.6))]);}
  /* where you start: the room farthest from the hall */
  const hallT=T_(8,8),dh=hsBfs(hallT);
  let start=null;for(const t of H.tiles.values())if(t.room>1&&(!start||dh.get(t)>dh.get(start)))start=t;
  if(!start)start=T_(0,0);
  const ds=hsBfs(start);
  /* wardrobes to hide in: in rooms and at dead ends, against a wall */
  H.closets=[];
  const deadEnd=t=>['N','E','S','W'].filter(k=>t.open[k]).length===1;
  const cand=hsShuffle([...H.tiles.values()].filter(t=>t.room!==1&&(t.room>1||deadEnd(t))&&['N','E','S','W'].some(k=>!t.open[k])));
  for(const t of cand){if(H.closets.length>=16)break;if(t.closet||t===start&&H.closets.length>0)continue;
    if(H.closets.some(c=>Math.hypot(c.x-(t.i*S+2),c.z-(t.j*S+2))<7))continue;
    const k=pick(['N','E','S','W'].filter(q=>!t.open[q])),d=HZD[k],x=t.i*S+2+d[0]*(2-.64),z=t.j*S+2+d[1]*(2-.64);
    const ew=d[0]!==0;addObs(x,z,ew?.42:.68,ew?.68:.42,1);t.closet=1;(t.noTorch||(t.noTorch={}))[k]=1;
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.atan2(-d[0],-d[1]);
    const body=new T.Mesh(box,H.mat.wood);body.scale.set(1.36,2.3,.84);body.position.y=1.15;g.add(body);
    const top=new T.Mesh(box,H.mat.dark);top.scale.set(1.5,.14,.95);top.position.y=2.35;g.add(top);
    const mkDoor=sd=>{const p=new T.Group();p.position.set(sd*.66,1.12,.43);const dr=new T.Mesh(box,H.mat.door);dr.scale.set(.64,2.08,.05);dr.position.x=-sd*.32;p.add(dr);const kn=new T.Mesh(box,H.mat.iron);kn.scale.set(.05,.12,.05);kn.position.set(-sd*.56,0,.05);p.add(kn);g.add(p);return p;};
    const dl=mkDoor(-1),dr=mkDoor(1);H.scene.add(g);
    H.closets.push({x,z,fx:-d[0],fz:-d[1],g,dl,dr,open:0,want:0,t,checked:-99});}
  /* the five relics, far from you and from each other */
  H.relics=[];
  const rc=[...H.tiles.values()].filter(t=>t.room!==1&&t!==start&&(ds.get(t)||0)>=4&&!t.closet&&(t.room>1||deadEnd(t)));
  for(let n=0;n<5;n++){let best=null,bs=-1;for(const t of rc){if(H.relics.some(r=>r.t===t))continue;let m=99;for(const r of H.relics)m=Math.min(m,Math.abs(r.t.i-t.i)+Math.abs(r.t.j-t.j));const s=Math.min(m,8)+Math.random()*3+(ds.get(t)||0)*.05;if(s>bs){bs=s;best=t;}}
    if(!best)break;const x=best.i*S+2+rnd(-.6,.6),z=best.j*S+2+rnd(-.6,.6);
    const g=new T.Group();g.position.set(x,0,z);const ped=new T.Mesh(box,H.mat.dark);ped.scale.set(.5,.7,.5);ped.position.y=.35;g.add(ped);
    const sk=new T.Mesh(box,H.mat.bone);sk.scale.set(.24,.24,.28);sk.position.y=.84;g.add(sk);
    const gem=new T.Mesh(H.gemG,H.mat.gem);gem.position.y=1.3;g.add(gem);H.scene.add(g);
    best.relic=1;H.relics.push({x,z,g,gem,t:best,taken:false});H.chunks[16].torches.push({x,y:1.4,z,ph:Math.random()*9});}
  /* the gate out, on the outer wall far from where you start */
  let gt=null;for(const t of H.tiles.values()){if(!(t.i===0||t.j===0||t.i===N-1||t.j===N-1)||t.room===1)continue;if(!gt||(ds.get(t)||0)+Math.random()*2>(ds.get(gt)||0))gt=t;}
  const gk=gt.i===0?'W':gt.i===N-1?'E':gt.j===0?'N':'S',gd=HZD[gk];gt.gate=gk;(gt.noTorch||(gt.noTorch={}))[gk]=1;
  const C2=H.chunks[16],e1=hzAdd(gt.i+gd[0],gt.j+gd[1],16),e2=hzAdd(gt.i+2*gd[0],gt.j+2*gd[1],16);e1.open[HZO[gk]]=1;e1.open[gk]=1;e2.open[HZO[gk]]=1;e2.exit=1;e1.exitPath=1;
  {const g=new T.Group(),wx0=gt.i*S+2+gd[0]*2,wz0=gt.j*S+2+gd[1]*2;g.position.set(wx0,0,wz0);g.rotation.y=Math.atan2(gd[0],gd[1]);
    const bars=new T.Group();for(let b=-1.8;b<=1.81;b+=.3){const m=new T.Mesh(box,H.mat.iron);m.scale.set(.07,HZH-.1,.07);m.position.set(b,(HZH-.1)/2,0);bars.add(m);}
    for(const y of[.6,1.8,3]){const m=new T.Mesh(box,H.mat.iron);m.scale.set(3.9,.08,.09);m.position.set(0,y,0);bars.add(m);}
    g.add(bars);const sig=new T.Mesh(box,H.mat.gate);sig.scale.set(1.1,.25,.04);sig.position.set(0,HZH-.4,-.1);g.add(sig);H.scene.add(g);
    const light=new T.Mesh(new T.PlaneGeometry(4,HZH),new T.MeshBasicMaterial({color:0xfff2d0}));const c2=hzTC(e2);light.position.set(c2[0]+gd[0]*1.98,HZH/2,c2[1]+gd[1]*1.98);light.rotation.y=Math.atan2(-gd[0],-gd[1]);H.scene.add(light);
    H.gate={g,bars,sig,t:gt,k:gk,want:0,x:wx0,z:wz0};}
  for(const C of H.chunks)hzBuildChunk(C);
  if(props.length){const ms=new T.Mesh(chandMerge(props),H.mat.prop);H.scene.add(ms);H.chunks[0].meshes.push(ms);}
  if(glow.length){const ms=new T.Mesh(chandMerge(glow),H.mat.glow);H.scene.add(ms);H.chunks[0].meshes.push(ms);}
  /* you, and the demon at the altar */
  const sc=hzTC(start);H.pl.x=sc[0];H.pl.z=sc[1];
  {let best=null;for(const k of['N','E','S','W'])if(start.open[k]){best=k;break;}const d=HZD[best||'N'];H.pl.yaw=Math.atan2(-d[0],-d[1]);}
  const dm=H.dm;dm.x=34;dm.z=34;dm.face=0;
  $('hzbest').textContent=meta.hsBest?'BEST ESCAPE '+hsClock(meta.hsBest):'';
  $('hzeye').style.display='block';
}
/* ---------- your side: relics, wardrobes, the light, the sense, the gate ---------- */
function hsEnter(c){const H=HZ,pl=H.pl;H.hidden=c;pl.crouch=false;c.want=1;setTimeout(()=>{if(c)c.want=0;},450);
  pl.yaw=Math.atan2(-c.fx,-c.fz);pl.pitch=0;c.yaw0=pl.yaw;pl.x=c.x;pl.z=c.z;
  const B=H.dm.ai;if(B&&B.seeT>H.t-.5)H.seenHide=c;else H.seenHide=null;
  H.noise.push({x:c.x,z:c.z,r:4});$('hzslit').classList.add('on');hzS(o=>{sfxT(o,180,240,.35,'sawtooth',.02);sfxN(o,.3,.04,500);});}
function hsLeave(){const H=HZ,c=H.hidden,pl=H.pl;if(!c)return;H.hidden=null;c.want=1;setTimeout(()=>{if(c)c.want=0;},500);
  pl.x=c.x+c.fx*1.05;pl.z=c.z+c.fz*1.05;H.noise.push({x:pl.x,z:pl.z,r:5});$('hzslit').classList.remove('on');hzS(o=>{sfxT(o,220,160,.35,'sawtooth',.02);});}
function hsHiddenTick(dt){const H=HZ,pl=H.pl,c=H.hidden;
  let d=pl.yaw-c.yaw0;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>.75)pl.yaw=c.yaw0+Math.sign(d)*.75;pl.pitch=clamp(pl.pitch,-.45,.45);
  pl.sta=Math.min(100,pl.sta+dt*24);H.pvx=H.pvz=0;H.kJump=H.tJump=0;}
function hsWorld(dt){
  const H=HZ,pl=H.pl;
  let near=null;
  if(!H.hidden)for(const c of H.closets){if(Math.hypot(pl.x-(c.x+c.fx*1.05),pl.z-(c.z+c.fz*1.05))<1.25){near=c;break;}}
  for(const r of H.relics){if(r.taken)continue;r.gem.rotation.y+=dt*1.6;r.gem.position.y=1.3+Math.sin(H.t*2+r.x)*.08;
    if(!H.hidden&&Math.hypot(pl.x-r.x,pl.z-r.z)<1.3){r.taken=true;H.scene.remove(r.g);H.keys++;H.noise.push({x:pl.x,z:pl.z,r:11});
      for(const C of H.chunks){const i=C.torches.findIndex(q=>q.x===r.x+0&&q.z===r.z);if(i>=0)C.torches.splice(i,1);}
      hzS(o=>{sfxT(o,880,1760,.4,'triangle',.08);sfxT(o,1320,2640,.5,'sine',.05,.12);});
      if(H.keys>=5){H.gate.want=1;H.gate.t.open[H.gate.k]=1;hzSay('THE GATE IS OPEN',2.6);hzTip('Use SENSE to find the gate',4);hzRoar(1);const B=H.dm.ai;if(B)B.intT=0;}
      else hzSay('RELIC '+H.keys+' / 5',1.6);}}
  /* one button: hide in a wardrobe or come out */
  if(H.kAct){if(H.hidden)hsLeave();else if(near){hsEnter(near);near=null;}}H.kAct=0;
  const act=$('hzact');if(act){const show=!!(H.hidden||near);if(act.hidden===show)act.hidden=!show;const lab=H.hidden?'LEAVE':'HIDE';if(act.textContent!==lab)act.textContent=lab;}
  if(!isTouch)hzTip(H.hidden?'E · come out':near?'E · hide in the wardrobe':'',0);else if(H.hidden||near)hzTip('',0);
  if(H.kLan){H.lantern=!H.lantern;hzS(o=>sfxT(o,600,400,.05,'square',.03));const b=$('hzlan');if(b)b.classList.toggle('on',!H.lantern);}H.kLan=0;
  /* sense: a short glimpse of the way to the nearest relic (or the gate) */
  if(H.kSen){if(H.t>=H.senseT){H.senseT=H.t+12;H.senseUntil=H.t+3;hzS(o=>{sfxT(o,300,900,.6,'sine',.05);});}else hzTip('SENSE recovers in '+Math.ceil(H.senseT-H.t)+' s',1.2);}H.kSen=0;
  const ar=$('hzarrow');
  if(H.t<H.senseUntil){let tx,tz;if(H.keys>=5){tx=H.gate.x;tz=H.gate.z;}else{let b=null,bd=1e9;for(const r of H.relics)if(!r.taken){const d=Math.hypot(r.x-pl.x,r.z-pl.z);if(d<bd){bd=d;b=r;}}if(b){tx=b.x;tz=b.z;}}
    if(tx!=null){/* point along the first step of the real route, not through walls */
      const p=hzPath(hzTile(pl.x,pl.z),hzTile(tx,tz));if(p&&p.length){let k=0;while(k+1<p.length&&hzLos(pl.x,pl.z,...hzTC(p[k+1])))k++;[tx,tz]=hzTC(p[k]);}
      let rel=Math.atan2(-(tx-pl.x),-(tz-pl.z))-pl.yaw;rel=Math.atan2(Math.sin(rel),Math.cos(rel));ar.style.transform='rotate('+(-rel*57.3).toFixed(0)+'deg)';ar.style.opacity=1;}}
  else if(ar.style.opacity!=='0')ar.style.opacity=0;
  const sb=$('hzsen');if(sb){const on=H.t>=H.senseT;if(sb.classList.contains('on')===on)sb.classList.toggle('on',!on);}
  /* relics hum softly so you can find them */
  H.chT=(H.chT||0)-dt;if(H.chT<=0){H.chT=4;let bd=1e9;for(const r of H.relics)if(!r.taken)bd=Math.min(bd,Math.hypot(r.x-pl.x,r.z-pl.z));if(bd<22)hzChime(clamp(1-bd/22,.1,1));}
  /* wardrobe doors and the gate */
  for(const c of H.closets){c.open+=(c.want-c.open)*Math.min(1,dt*8);c.dl.rotation.y=-c.open*1.5;c.dr.rotation.y=c.open*1.5;}
  {const G=H.gate;if(G.want){G.bars.position.y+=(HZH-.3-G.bars.position.y)*Math.min(1,dt*1.2);}G.sig.material.color.setHex(H.keys>=5?0x7aff9a:0xff3a2a);}
  const t=hzTile(pl.x,pl.z);if(t&&t.exit&&!H.won)hsWin();
}
function hsWin(){const H=HZ;H.won=1;H.wonT=0;const tm=H.t,best=meta.hsBest&&meta.hsBest<tm?meta.hsBest:tm,nb=!meta.hsBest||tm<meta.hsBest;meta.hsBest=best;try{save();}catch(_){}
  H.result={txt:'Escaped in '+hsClock(tm)+(nb?' · NEW BEST':' · best '+hsClock(best))};try{if(document.pointerLockElement)document.exitPointerLock();}catch(_){}
  hzS(o=>{for(const [f,d] of[[523,0],[659,.15],[784,.3],[1046,.45]])sfxT(o,f,f,.9,'triangle',.07,d);});MUS.want='meadow';hzAmbStop();}
function hsWinTick(dt){const H=HZ;H.wonT+=dt;const G=H.gate,d=HZD[G.k];H.pl.x+=d[0]*dt*2;H.pl.z+=d[1]*dt*2;
  if(H.wonT>1.2&&!H.shown){H.shown=1;const o=$('hzover');o.classList.add('on');$('hzot').textContent='YOU ESCAPED';$('hzot').className='win';$('hzop').textContent=H.result.txt;$('hzres').style.display='none';}}
/* ---------- the hunter ----------
   It sees in a wide cone in front of it (further when your light is on, less when you crouch), hears footsteps (running
   carries far, crouching is silent), remembers where it last saw you and guesses where you went, sweeps the rooms around
   that spot and opens wardrobes, and always checks the one it saw you climb into. It learns the places you use most and
   patrols them, and every half minute or so it gets a feeling for roughly where you are. It gets faster with every relic. */
function hsLook(t,after){const D=HZ.dm,B=D.ai;B.st='look';B.lt=t;B.lf=D.face;B.after=after;}
function hsStartSearch(x,z,dur){
  const H=HZ,B=H.dm.ai;B.st='search';B.t2=H.t+dur;B.sw=0;const sw=[];
  const t0=hzTile(x,z)||hzTile(H.dm.x,H.dm.z);if(hzTile(x,z))sw.push({x,z});
  const near=t0?[...hsBfs(t0,3).keys()].filter(t=>t!==t0):[];
  hsShuffle(near).sort((a,b)=>(B.heat.get(hzKey(b.i,b.j))||0)-(B.heat.get(hzKey(a.i,a.j))||0));
  for(const t of near.slice(0,4)){const c=hzTC(t);sw.push({x:c[0],z:c[1]});}
  for(const c of H.closets){const d=Math.hypot(c.x-x,c.z-z);if(c===H.seenHide)sw.unshift({closet:c});else if(d<9&&H.t-c.checked>20&&Math.random()<.45)sw.splice(1+ri(0,Math.max(0,sw.length-1)),0,{closet:c});}
  B.sweep=sw;
}
function hsPickGoal(){
  const H=HZ,B=H.dm.ai;
  if(H.t>=B.intT){B.intT=H.t+rnd(20,32);
    const ref=H.keys>=5&&Math.random()<.5?H.gate.t:H.hidden?H.hidden.t:hzTile(H.pl.x,H.pl.z);
    if(ref){const near=[...hsBfs(ref,2).keys()];const t=pick(near);return hzTC(t);}}
  let best=null,bs=-1e9;const all=[...H.tiles.values()].filter(t=>!t.exit&&!t.exitPath);
  for(let n=0;n<36;n++){const t=pick(all),k=hzKey(t.i,t.j),c=hzTC(t);
    const s=Math.random()+Math.min(2,(B.heat.get(k)||0)*.6)+Math.min(1,(H.t-(B.vis.has(k)?B.vis.get(k):-90))/90)*1.3+(t.room?.3:0)+(t.relic&&H.relics.some(r=>r.t===t&&!r.taken)?.4:0)-Math.hypot(c[0]-H.dm.x,c[1]-H.dm.z)/70;
    if(s>bs){bs=s;best=c;}}
  return best;
}
function hsEye(){const H=HZ,B=H.dm.ai,e=$('hzeye');if(!e||!B)return;
  const c=B.st==='chase'?'hunt':(B.alert>.25||B.st==='investigate'||B.st==='search'||B.st==='check')?'sus':B.st==='wake'?'shut':'';if(e.className!==c)e.className=c;}
function hsDemon(dt){
  const H=HZ,dm=H.dm,pl=H.pl;
  const B=dm.ai||(dm.ai={st:'wake',alert:0,heat:new Map(),vis:new Map(),intT:35,tm:0,lost:0,sweep:[],sw:0,seeT:-9,goal:null});
  const rage=1+.07*H.keys;let spd=0,moving=false;
  const ex=dm.x,ez=dm.z,pdx=pl.x-ex,pdz=pl.z-ez,dist=Math.hypot(pdx,pdz);
  if(B.st==='wake'){B.tm+=dt;if(B.tm>6){B.st='patrol';hzRoar(.7);hzTip('It is awake',2);}hsEye();hzBody(dt,0,false);H.fear=.15;return;}
  /* sight */
  let sees=false;
  if(!H.hidden){const rng=(H.lantern?21:10)-(pl.crouch?3:0)+(B.st==='chase'?12:0);
    if(dist<rng){const fx=Math.sin(dm.face),fz=Math.cos(dm.face),dot=(pdx*fx+pdz*fz)/(dist||1);
      if((dot>.2||dist<3||B.st==='chase'&&H.t-B.seeT<1.5)&&hzLos(ex,ez,pl.x,pl.z))sees=true;}}
  if(sees){B.seeT=H.t;B.lsx=pl.x;B.lsz=pl.z;B.lsvx=H.pvx||0;B.lsvz=H.pvz||0;
    B.alert=Math.min(1.5,B.alert+dt*(B.st==='chase'?4:clamp(2.9-dist*.13,.55,2.9)));
    const k=hzKey(Math.floor(pl.x/HZS),Math.floor(pl.z/HZS));B.heat.set(k,(B.heat.get(k)||0)+dt);}
  else B.alert=Math.max(0,B.alert-dt*.12);
  if(sees&&B.alert>=1&&B.st!=='chase'){B.st='chase';B.lost=0;hzSting(1);hzRoar(1);hzSay('IT SEES YOU',1.4);}
  else if(sees&&B.alert>.3&&(B.st==='patrol'||B.st==='look')){B.st='investigate';B.gx=pl.x;B.gz=pl.z;}
  /* hearing */
  if(B.st!=='chase'&&B.st!=='check')for(const n of H.noise){const d=Math.hypot(n.x-ex,n.z-ez),r=n.r*(hzLos(ex,ez,n.x,n.z)?1:.6);
    if(d<r){B.st='investigate';B.gx=n.x+rnd(-.8,.8);B.gz=n.z+rnd(-.8,.8);B.alert=Math.max(B.alert,d<r*.5?.85:.55);}}
  H.noise.length=0;
  {const t=hzTile(ex,ez);if(t)B.vis.set(hzKey(t.i,t.j),H.t);}
  switch(B.st){
    case 'chase':spd=6.1*rage;moving=true;
      if(sees){hzNav(dm,pl.x,pl.z,spd,dt);B.lost=0;}
      else{if(!B.lost){B.px=B.lsx+clamp(B.lsvx,-7,7)*1.2;B.pz=B.lsz+clamp(B.lsvz,-7,7)*1.2;if(!hzTile(B.px,B.pz)||!hzLos(B.lsx,B.lsz,B.px,B.pz)){B.px=B.lsx;B.pz=B.lsz;}}
        B.lost+=dt;
        if(H.hidden&&H.seenHide===H.hidden){B.st='check';B.chk=H.hidden;B.ct=0;break;}
        const tx=B.lost<1?B.lsx:B.px,tz=B.lost<1?B.lsz:B.pz,there=hzNav(dm,tx,tz,spd,dt);
        if((there&&B.lost>1)||B.lost>5){hsStartSearch(B.px,B.pz,18);hzRoar(.5);}}
      break;
    case 'search':spd=4.4*rage;moving=true;
      if(B.t2<=H.t||B.sw>=B.sweep.length){B.st='patrol';B.goal=null;break;}
      {const s=B.sweep[B.sw];
        if(s.closet){const c=s.closet;if(hzNav(dm,c.x+c.fx*1.05,c.z+c.fz*1.05,spd,dt)){B.st='check';B.chk=c;B.ct=0;B.sw++;B.back='search';}}
        else if(hzNav(dm,s.x,s.z,spd,dt)){B.sw++;hsLook(1.2,'search');if(Math.random()<.6)hzSniff(clamp(1-dist/20,.1,1));}}
      break;
    case 'investigate':spd=4.8*rage;moving=true;
      if(hzNav(dm,B.gx,B.gz,spd,dt))hsLook(1.5,'search2');
      break;
    case 'check':{const c=B.chk;spd=4.6*rage;moving=true;
      if(hzNav(dm,c.x+c.fx*1.05,c.z+c.fz*1.05,spd,dt)){moving=false;dm.fwant=Math.atan2(-c.fx,-c.fz);B.ct+=dt;if(B.ct>.35)c.want=1;
        if(B.ct>.8&&H.hidden===c){hzDie('demon');return;}
        if(B.ct>1.7){c.want=0;c.checked=H.t;if(H.seenHide===c)H.seenHide=null;B.st=B.back==='search'&&B.sw<B.sweep.length?'search':'patrol';B.back=null;B.goal=null;}}}
      break;
    case 'look':moving=false;B.lt-=dt;dm.fwant=B.lf+Math.sin(B.lt*2.4)*1.4;
      if(B.lt<=0){if(B.after==='search2')hsStartSearch(dm.x,dm.z,10);else B.st=B.after==='search'?'search':'patrol';}
      break;
    default:spd=2.9*rage;moving=true;
      if(!B.goal)B.goal=hsPickGoal();
      if(B.goal&&hzNav(dm,B.goal[0],B.goal[1],spd,dt)){B.goal=null;hsLook(1.3,'patrol');}
  }
  if(dist<1.3&&!H.hidden){hzDie('demon');return;}
  const d2=hzBody(dt,moving?spd:0,moving&&spd>0);
  hsEye();
  const near=clamp(1-d2/12,0,1);$('hzvig').style.opacity=(near*(B.st==='chase'?.9:.55)).toFixed(2);
  H.hb-=dt;if(d2<13&&H.hb<=0){H.hb=.32+d2*.05;hzS(o=>{sfxT(o,70,45,.12,'sine',.22*near+.05);sfxT(o,64,40,.14,'sine',.16*near+.04,.16);});}
  if((B.st==='search'||B.st==='investigate')&&d2<20&&Math.random()<dt*.12)hzRoar(.25);
  H.fear=B.st==='chase'?Math.max(.75,clamp(1-d2/20,0,1)):clamp(1-d2/26,0,1)*(B.st==='patrol'?.55:.8);
}
/* ---------- the game-mode cards on the main menu ---------- */
function gmModes(){const P_=gmPics();return [
  {id:'classic',t:'CLASSIC CLIMB',tag:'51 FLOORS',d:'The tower as it was built: spells, guns, bosses and the King at the top. Solo or with friends.',pic:P_.classic},
  {id:'horror',t:'HORROR',tag:'ENDLESS · NEW',d:'An endless dark dungeon that builds itself as you run and crumbles behind you. Traps everywhere, and a demon on your heels. How far can you get?',pic:P_.horror},
  {id:'hide',t:'HIDE & SEEK',tag:'HUNTED · NEW',d:'One huge dungeon: a pillared hall and a maze of passages. Find 5 relics and escape while the demon hunts you by sight and sound. Crouch, hide in wardrobes, keep your light off.',pic:P_.hide||P_.horror}];}
function gmPics(){return {classic:'data:image/jpeg;base64,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',horror:'data:image/jpeg;base64,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',hide:'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBUODAsLDBkSEw8VHhsgHx4bHR0hJTApISMtJB0dKjkqLTEzNjY2ICg7Pzo0PjA1NjP/2wBDAQkJCQwLDBgODhgzIh0iMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzP/wAARCAEOAeADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDwSiiipNAoopcUAJRRR3oAWk70uKAKBhS4pRS4oAQDApcA0YowSQB1NIA2ntRT9pHvQcY5oGNxSgY6U5UbHb6UvOQADuPQUANHNLyTtUZJqVYQFwQCe5oVChJAzn86Vx2Dydo4Jz+hpOnDDBqVWDDjrSlAeCOKm47EAy5wuAO5qQIoGAMY796Xyyv3eR6UKQeRRcEhCvI38Hsw6UjDovVx3HaplPHI4pij5j5S5Xv6fhRcdiM7iQGOB6jvUirgYA49KeArdvqCOlIQ0YOBuHp3FFwsQvHs5U4XvntT0VQvy857+tSpCrAOzBienoKHhxlkxnuvY0XCxERURUqcgcdx6VLkN7Edc0EUxEfB5pDx1pxQjlfxpVUDBHOe9ArDNrNzgAj9acMEZ6etO6de9BibBkKfVT1P4UXCwzluEGfftSmPjkk0/AIyGP50mcnglv5UARBcgqeGH60KNylT1qVkb7+QSOwHakZc4kTnPWi4WGJkjDdR1pSvNDFVfcD7GlyT0H50AROu1+nBpDUjplTySRyKaoLDIHHqaYhuKbkB/wAKkKjvzTH7H0NMQE56D86bjPWnUlADT0/GjrQfu0uKYDMUU6kPQ0AIBxQaU9KQigBBS0YooEJ3ooooAKKKKACiiigAopKWgAopKWgApaKKAAU6kAowcUDFPpS0YFLjFIAzigDv60ZpRQAoJH/16eNrdevvTAeaeuDSGh4Vh709cHg/kajUkvhOg6+lKVOSWGT+lIZKfkGc5Hoaeu1uOh9D1qIdQTzjoD0/OpRh+COfQ1LKQ4xBj7+tNPyNtY59wOR9adiRQQhz/vUwBRwQQ3fPU0hscTkhYxuY+nQfWgW/qWLf3ulC/Kcq2PpUwlUY8zA/2u1Go1bqQeU3SQ/IO6/1qVUGBgDHtSmYZ2xgE9z2FNVSo+V+e4PTP9KWoaIc0atg9GH8Qph3KcPx6N2P+FOMgzjad3pTSGP3zkf3e3/16EDsMVHYloxgdyehqQEng8MOoNKjFBxll9M8ipTElxH1B9D3FDYJFR1EhGwEsP4u340n3SQ/ykdat4MRAkxjordv/rVIyIVBfA28gg4wafMHKU1hdxnBQepHNNeArzHn3B6n6Vcjk52yd+FbGA1SGMHpS5h8qZThCBcqPx709vakfYkmUYF/4kHOf/r07IflMsT6CgXkVJY9rbv4P4h6e9KAMAdu1WPLcn5jgegqJojGR82EPQ9cH0qrisICF5PH1qJgu/gHYx7jjNWPKAIJ5PqaVlDKVPQ0XCxAUBGD09KYgIymMkd/apASCUb7w/Wmur/fxjaPxIpkgUPc/gKiI2OV7dRUxYetRyAn5sYx3poTGGmkZBqQKT0BNL5ZHU4+lO4rEABIowB/9epAg3EZ6U4BV6Ci4WIWB2ng0mOKlbkEVGF45piE+lIRxTulI3UUANIpD1p2KTuaYCUhp2KbQISilpKAEooooAKKKKAFopKKAFpaTNLQAdKWkpcigAHNOpBQDQA4e9KMdjTcigYzkikMd+FGKUEfSlC9zz9KAEHyinZ455pQgYjnIHapTtPXj60hoRImCdce1KTs+9kU4KR0P507OPvce9SVYagydxOM9h/WpAuV9vQf4UwhR04J6Ad6cocAEj8qTGhQxDAIc+oPQUud7Yl4GeBnj86Rd0jAscAdAOv41LtIHYikNIa0RUZU8ejUsYjI3E5f3H8qXjI7Y/hPSniVXB3J8vr2pXHYjZMcrx/Km7sdRj+VPdccq3HoaaDu69/WmDELDGDz7U5d+OmV9CeaEjLN+7GfU9h+NKFcvt4X3bpSBIUMg9S3oBzT1jcgOGVGx0Xn8/Wpvs8YT7zF+7f57VA4ZCPlXb/ex/Sle42mhpRi2WG5j/e5B+npTlGGyBuA/gPVfpTkC/xfN9aWTCpuyCB0OcEfj3ouFh3yyLnIYH1qKXfGAGcmP68/jSlXY71cBj6D+dCYB+YYf0PJoGyqqr5zHPP932qVX8t8qc56r61GVUXfAJJBGwcGp9y4woAHoKpmcQacH7i/ieKjJ3AhzkHt0FI4IO5ev86buLdAaEhtihyvyYz/AHTmmtu7n8BS7dwwxwPalUnO3GT6+tMRGQQQyjkdvUVPgFQ2cCkwAMsW/AYFR7BnA+6ehx0oARAqOUB+XqDTiVIIwTn0pCCVx/GvIoZ8qCvegBIzlcN1HFIzL65+lNPPWkxTsK40/eyKacnvT8UmKokZikxUuwntTWXBxRcCPgU0nLcUpHzUgIyc0xCEH2po6U5jx0ooAac0mDS55oJpiG4oxRnNB+tABSUUUAJRRmigBKWiimIKWiigBaKSloAKWkpc4pDFozQKKAFBp27A4603FO289aAH9SDnNLnkZNJ9RigDByDzSGShgPb6U4ktySCB2qEN7ZpR8xPGR71Nirkitg7lyPepFmOQCNx9qiBx9KUELk52/SiwJkhkLMARgD86d5h9c/WoicjjDU3PYUrDuTFi4+Y4HYVKkjrwOg6A1WGc45P0qRAzHCfL70mhpssARkgk7G9KeHQ/K4DD1A4qHBjzwGz1OM5pFIY54AH51NirltZegRdyD14xTy0TD5iF/wB6quSPmBP1FL5rFeUDVNiuYkMgQ4Xcye/9KcMyj5XC+o/iquRhcq2falA4G5iD2A4p2FclaAIMq2zHY9DRHszz97/a6/hUDE7sk7vc9RQZNwweR6UWYcyLDmMHOdp/nTBmX5eFI55/pUS5GeMj9akUBhx+Z4xRYL3ISPLvMs5LKCScdc1MYGc7lAB9M9aj3+Xebg+WKlfu8VYQsgwDj2/w/wAKcrijYYlu7nHC4655P5Uj2pXlSc9/ep+D86vhvUn+dMa4bocD3A61N2VZIbGkYXOzJ/2uabON4wThv4T6UgPJYZb1HrTvOTGETH6U9bhpYrLgfeGGHXPWpDllI2n6nildySCMBh0wOv1pnmkjKgCmToNx2bkioymGO3oeacSxIJp+5AOCvPoKoncjCE07yjUqDK/jTsUXCxD5Yo2AdBUuKTFFwIsVBL9/8KtkVVuOHHpimhMg5z2ptKSPWmirIEPYUE0d6Q5piEpDS4pKAEopeKSmISilpKACiiigBKWkpaACiiigBaKB0NJmgQtFJmjNADs0oNNzS59qBjs0ueetNBozSAkDEUme+c0wH3xS5H1osFyQMQKXcT/9ao8ilDUrDuSeYfWjdzkmo+tKAM9aLBcmD+uKeGAHAJHvUIx65+tOJGeuKVirk6yAfdGPrUm5T1X8RVQE44GRTgefT8amw0yx5pB4HHv1pQyNgs2D+VV84HPP1pVIA4/UUWHcnyuepb60/wAxPTB9hVTJPT9KcFY+4pWHzFgSZbPQ+oHNSksy8Yce9VUB/vY/WnE47D6mlYaZOsWeQ49waekMbfx/N6dKrArjg5NSCVscgH60mmNNE4RYT84U+hP+FOdRJyuc+qVW5J+VufQ0ocp0YqfSlYfMIq7LwZJDqCfbmrexj12r7etUdx83zDknGKkVmbgcj0zTkrhFpE5VQ2QMOPbNKSrDEgZT6VBkA8/KfenvIzDHBA745qbDuI7ODjkjscVG0Tn5gpqTz+MMTimtcMgwOV9T2pq4nYjEZY8n8zSSJs+YHPqBxmkMrE7s0xp1P8P51VmTdAZApHbPemnA4HPvTC4zkAcGkaQnjtVWIuXbfJjOfWpcVDZcwn/eqxipe5a2GYpuKkxSYoAjxVK9++n0rQxWff8ADp9DVR3JlsVTRmkzxSE1oZC54pM80ZpPxpgBNJmiigAzRSUUCCiiigYUUUlABRmiigAooooEOA4OKbSj7ppKACiiimAtHFJmjNADqM02ikIdkUuaZRQA+gfWm0UDuSCjPNMzRmiwXJcmjNRZpc0WC5KG96Mmo6XPvSsO5ICacCfXFQ7qXd70WC5PvOeuKcJT9feq4b0NG40rDuWTIT3496BIRzx+PNV9x70u6lYfMT+cQc/yp3ms3FVw9KZD2xRYfMWVfHX9acJADkqCPfmqhk9eaPN9qXKHMXlnVegB9iKQzkN8o2+1UvMP0pfM4pco+cttOp+9nNME4HqfxqvvX0pPMAPAp8oc5YM2egwKTzcdCfp6VWMgNJ5lPlFzFgkHnJNMYp2JzUO6jdmnYVycOPKbjvioy3PWkUr5MhPXjFR5FCQmzU05tySDPAIq5iqOk8pN9R/WtEispbm0PhI8UhFPIpCKQxhFZ+pDAjPfJrSIrP1MZSP6mqjuRPYzqSkozWxiKTSUmaM0ALSUUUAFFFFABmjNFFABRRRQMKKKKACiijNMQu44xTaWigBKKWkoAKKKKBC0UlGaAFopKKBC5ozTaWgBc0ZpKKAFzRmkpKAH5o3e1MozQA/NGaZmjNAEmaN1MzRmgdx+6l3VHmjNFguSbvejdUeaM0rBcl3+9G+os0ZosFyXefWk3H1pmTRzRYLj93vRvqPNGaLBck3UbjUeaM07Bcfuo3UzNJmgLlmMFreY54XBqHNNzRmkFzY0blJvqP61p4rK0RuZkx2Bz+laxFYT+I6afwoYRSGn00ipKGEVQ1QYhRvRsfmK0SKz9V/49V/3x/I1UdyJ/CzIoooroOcSilooASilooAKKKKBhRSUtABRRRSAKKKKACiinxSeVMkmM7TnHrQAyiprmf7TMZdgTIAwKhoWwMKSlopiEooooAKKKKAEoopKBBmjNFFADlpaatOoAaaSlPSkoAKKKsQWF3dIXt7WeVAcFo4ywz+AobsBXzRVmbT722j8ye0niTONzxMo/Miq1JO4BRRRTAKKKKADNKoLMFHUnApKVTtYHAOD0NACU+VDFK0bKVZThgeoPety08Px39jJJBK4n+9Crj5XXuPqDn9DWZqETrKJnRkaTO9WGCHH3vw7/j7VCmm7I0lTlFXZVXmnEcU1e9PPSqIIz1pKU9aSmIKKKKACiiigAooooA1tD/1s3+6P51s1jaH/AK2b/cH862jXPU+I6qfwjTSGnGm1BQ2s/VR/oq/74/ka0DVPUv8Ajxf6j+dXHcmezMOiiiug5gooooAKKKKACiiigYlLRRSAKKKKACiiigAooopgFFFFABRRRSASilopiEpVR3ztVm+gzSV2ei+INK0nP2SK4t2lVRK+NwOPxPfPSsqtRwWiuaU6am9WkcYyshwwIPoRim11niK+0jVYp7pC8moMFAcqw4GB9OlcnTpz543asKrT5Ha6foFFFFaGY5aWkXpS0ANNJSmkoA2PC+kQ65rsNhPJJHG6uS0eM8KT3+le4eErceD9Kl0+yd5opJjMWmOCCQBjjHHyivDdI1CbRdRS+tNhmQMB5g3DkYPH4108fxC1tgcrZ/8Afk//ABVeXjqGIqytB+7+p6uBq4WnD96ryv8Agem+LhP4s0B9KklW3VpUk8wKXxtzxgn3rwTWtKk0XV59PlkWVoiPnUEA5APf612P/Cf61/ds/wDvyf8A4qud1u/k1u4N3cxQJMFwWhTbv9CeTn0owNLEUXy1H7v6ix1TC1Yp0laX6GDRWt4Zx/wkVojKrLIWjYMM8MpB/Hnj3qe9tLJdQkM7pGGjUqkY2AEgdua9B1Epcp56ptx5kYVFaWrpGj2ixxxoBbqCUXG45I3H3NZtXF3VyJKzsFWrCye+uBGuQoGWYDoKq1torC1tLZWK/IZJSDgFT0BpTdkVTjd6mtNe29usDWSmPleVXA4/nRqn2PUroTbFdguGIBAz1rOXEwCb8opzgD8qtLgAgIBk5yO9cjSW253pt77GPqNvFA6iJNoPXBqkelaGqnMi1n9q6afwo4qqSm7EbdaSlbrVrToIZ7yMXBYW4YeYV6ge1W3ZXM4q7sVKK73VNR0S70ZbJ8IkYGxo4NrkqpAycc+9cFWdKpzraxpVpeze6YUUUVqZBRRRQBraGR50ozyUGB+NbZ6VgaL/AMfx/wBw/wBK3jXPU+I6aXwiU2nU2oNBDVLU/wDjxf6j+dXTVW/Aaylz2GaqO6IlszAooorpOYKKKKACiiigAooooGJS0lLSAKKKKACiiigAooopgFFFFABRRRSAKKKKBBTlPPWm0q9aGAjE7jyaZTyMk0baYDKKdtpdtAhFpaMGjaaAGmkp+00bD6UAJ5j/AN41PBI/948modh9KlhGCPrSY0WHdgBhiKZvYjljSydBTBUllm1jUhic59jVkqv90VBan5X+oqYms5bmsdhpVf7oqvcRR+W7bBux1qwTUM3MTj1FCFLYo20P2idY84HUkelbfnxvqCJCdx2CJ1I6jtj88Vixq8bFk4OCOlXLeB4gsxYgyHg4561c1cmm7aJGskYjhCBcBGx0/SgOAzJxhgMfUVHGpTOXLEnJJp/fPeuV7nYtijqCIVckAkDg+lZVat7yHHt2rM8pvSuml8JyVviIT1oDMv3WI+hqXyW9KeIwY9rKQfUCtLmNmFwzeXH8x6etVqtTLuCKOwqLyjSWw5bkVFSeWaPLNUTYjoqXyuOuPwpPLNAWL2i/8fx/3D/St41haOCL0/7h/pW5XPU+I6aXwgabSmmmoLENV73/AI8pv92rBqC5XfbSr6qapbiexz1FKw+bjpSV0nKFFFFABRRRQAUUUUDCijtRQAUUUUgFxSj3FGKMH1oGJRTgv1pdtAWGYqaDYGJcjpxmm4o20ASymPyiqkEnuBVfBqTbS7RSQPULe3NxMI923IPJGa0ItIjkcqZ3G0gHEf8AKqkLmCQSKBuHrVxNQumOIwgPrj/GplzdC4qPUzpoRFPJGDkKxAJ74puytq10K91GRjF5chJy5Vs7SfWpbzwvqOn2T3VykSxoQCA+W5OOlT7WKdm9R+xk1dLQwNlL5dW/LPoackO51HuKvmJ5CslpM6hkhkYHuFJFD20kRAkjZCRkBlIyPxrvysvmxeU4SJWO9dv3h2A9K57XU36o488z7FVd+c9ulYxrOTsbSoKMbnP+TmgQD1NaAiXpg/lTxAD0Ga05zPkM8QinCCtHyRj7o/OnC3bqq/pS5x+zM0W5J6UtxDHDcKscvmAjOdpX+dafkuDytZ14Ct7tOOAKIyuxShZDVi838KeLT3qzpyB/MyBgY/rWkLPPIUfnUyqWdi4U+ZXMiKFowcHOa2tAsIb25lS4h8xFTd1KkenQ0C1AHzr+QzUkQERbyZmjLDBCnGRWU53TSNoU+VpsqaxYx214iRwtBuiVmjL79pOcjPfpVD7Nn/69bMkTyHc2Xb1Ykn9aZ5Tgf6v+VEZ2VhSp3dytDplqYkea6wWBykaZYelGyQqV2goF2gHjvkGrG05wcA/Sl8pzyN5/CjmfUailsVvJfqaTy2HcVZ8t154H1pwDDqxP+7zSuUUGszJIWY5HoKX7Ev8AdrRUE8gA/wC8acAw45A9hRzsXImZn2EHoD+VH9nZ9fyrotMbbeAqCDtPPINW9XaZ9OfZKVIZWJJ/hB5/Sp9rK9h+yja5yP8AZ3+TTTpwHcVpmQH7pJHuKiYEnl1q1ORDpxM02IHao2s/9k/lWkVXnofoaYVJ6cVSmyXBGabXHamfZckcHFaZjxzuB/GmMDVqbIcEQwwrbvuTr71Z8891H4VDmkzRuGxN9o/2P1pPPGOVOahpKLILsm89SeQRTZJUZGXnkEdKipKLCuUHtiq5CniotlaMnMbfSq2wVopGbiVtlJsqwUpNuaq4rFfbSbasFKaVouKxDijFSFaTFO4WI8UU/FGKAsMxRinYpKAHYpcUAc08UihFUscDH4mnvA8Z+YYHY0lWJ7yW5VVk24U5GBUtsdkVtopwFKAT60oQ+lO4rAFFKRjpzTgvsKXn2pXHYhLlesePrU1s+5myAOKkVc9j+VIUjzyn40rlWOn8NRefa6jCbh4BIEAkRgrL16Gp9beys/Cj6XBeLNIkigKXDP8Aeyc49K5ZYcqMEbeuOoqVYwBjP5CueVO8+a50QqWhy2KKJcfwhvxqdUnByyrVvZnoxH40m1o+u0j3rTmIHR5I++PwzTtoXHX8FpyTx9OhqYSZHCmobZSSI44hJ0I+hNWktgOoX8qrOpboq5p8cxj4dnFS7lKy3LJgBHGR74FNCLHywVvxwaBNEerZz6mnh0zwpP0FTqXoMDxbySpX6Cs6902W6vTNE6bSAMMcEcYrUJJHCD8TTVC5/eAr/u04ycXdESipKzIdPsZbISbpEO/HQHt/+urLDJ+ZxnvgYp4NvjO/PsTz+VBRMbkjc/QYqW23dlqKSsiLawGVDn9f503cxPzBB9VpRKwbDP5fPR8/zqcRiRMmRj7qRimIh2cE+YF78GgsFxn5/fBoXEUhUeX14ytPMrg4KZH+yf8AGgLoYG3D5VRT/vZpwSQHJIPpg4qNpos/MMY/vLTGmiU4UNn/AGDRZhdFgsgxuiJ9yd1N3xDoxTP1FVfOlPQ4H+1zRubq4DfjT5Q5yw7KeQ+4+2DTD5nZR7E8VDvRc4DL9KXzgBxL+fNOxN0SK00bbgzg+qtintcyspV5JSp6gsSDVbz5D05HqBRuVh87EexBFOwrikg9ATTCrHqWH1qUbeiOOOwamPKUBLNx7igQzaAe2fypDJt45z7HNKJGl7qq+p6n8KcIVQHaxB/OmL0IcNJk5GPrSjKjgHHsaewbHY/UVEeD90+2DTFsBx0x/wCO0w49B+opSTnkN+FML8cPj6iqsTcQsOwH500Nk96Y7bjtyPegJgVRI4sPWkyPUUhyO/60w5z/APWoAcxBU81EBQ2R6UgY+tUSKV96YVp+foaT8qYhlIRQcrzS7s9hQAzFNIqT8Kace9MQzFNp+B60mPegBppMUuDRTEKKcKatPFIYYPpTguDnikyKXcPekMePrSnocE5pmT6UuT60hixsDwevvU27HQVVP3s1MMEZ60MES7hnJbPsKduBGApIqMEDqaXzFHPP4UhjkDq2VOF9DUm5j3A+lRqxYZA/M08A92x9BSGh/J6kn8aUFVPIH50gVT1yfqaa0fORwfWkMkyD90HPsKejSjofwNQpKc7SCfcc1OrPnAT8SaTKRKpkJ5b8hTmi3jlm/OowJCOXA/3RTXRwcglu+GORUWKuSrKYGxlJPYcNVkTsyjEbA+jYGKppcqnDLs/lVpXBApNFRYMZiONo+lCyKP8AXK5988flTg/pSFifSpKLEcsWP3RQfQVIXJ6Gs2RYxyxCn1FRrcyK+xH3egfv+NHJcOexpMCepqBljQ5+6fVTimlpmzlgo9FpFRByVyfVjmhKwN3GNIxI2u0mO7L/AFpHnmzgqEHqPmqY4puCaomxCGRur7j6E1MMY4UU1kXHzAdKr/KzYh3FvRTwKdri2LJH0FRtIinHU+lAgkYZlk49Fp/koF27BijQWpHtkcdkFIIWX+EOfrT/ACjn5XYfrRiRe6t9eKYDS+DyrD8KUSx9A1Ma5CkAqdx6Ac5pPIkl5kO0Z4T/ABosK4PL5rFY0DMO56CmpGUOXUs31yBUpLxqB5a4H900glUrkhgPXGR+lADTIh+9wfcUAIfun8jSl1Y4DA/SmsinqooC4p3Do7fjzTC0g64P4UbVHAZh+NNIYdHB+op2FcUyHun5GoZJFPTI+tOZ3XqB+BqtvVnyfuj2qkiWyVYxjc3X6UFB2P603Kn7rY+hoO4fxH8RTEIVI7mk+b2NLub2NNLkfwmmIa2cdKauc4pxcEVGD89MQ8g+gppHtS8j+I/lSFj7UxDT+NM+6fapC3tTSQRyKAEx9aQ49aaDtOM8U45piE/GmmnH6U3igBD9KQ0tJTABThTM0vNICQUufemfiaQ9KBkoI+tOGfT86jjPy1JuA6mkAbM9TT1QAYpobPQE0u5vQCkMkAA7YpTjuagDkvtY8Hp2qUIo7D8eaAGqWVvkG4egqwC5PCgD3NM/WnNIEGT+VJjQ45A+Z8D2pnzRvuK719/6UJlzub8OelSlsjnmkMkjkRlyh49PSnhjVJlKtvQ7W9qkS53Ha42t+hpNDUi3uPrSq3uarGRY+uAfSkM7H7q/iaViuYuEIw5qB8Q8pIF/2T0NRAu33mP0HFKigHIHPrRYVyQXhAO5MHPB7VMC0gyZMD/Y/wAagKqRyKZsaM7om2n9KVkPmZcVVQZCgn1PJoZVf7wqsLsg4lXHutSiQMNwbI9qVmO6DY6cxyH6HkUv2pl4eMj3XmmNcIvGcn0FNJlk9EX35NO3cL9icXCFS24YHvR50kv3E+X+83Aqou6Ik7A/ox6j+lWUuUc8tg+jcGiwcw4Rhj+8YuQfoPypWijb2J9OKduHemkjikAAyoPllz7NzR9odc74ifdDmms23HTHeofOZyUiUs3selOwrlr7TEeA/PoeDUYeS4/1Y2R/327/AE9aSOAA7pm8xh0HYf41OXpehS13IVt2hOYmBz13Dn86PMdQPMiPHdTmpC4HGeaYW4o1FZCi4jbgMAfRuKQpg7kO1v0/Kom2twwB/Co9gB+RmX6GnYTJGfH+uQH/AGgOKTaByjED68UzMo7q49xUZcq2QhQ98cg1ViSQhx0ZT9RimmRh1Q/gc0LMrdWXP1psr7RTsK5DNITgKeTwBQF2rimx/MxkP0FSUxDSAeoBowB0JH407ApCKAGEt/e/MUhZh2H50pptMQhfjkGoyfnBBqQ1DJTQmS5I/i/Ok3HHIpAcjIpKAF3D0NISPWikNMQhGaaG28HpTiBTSKAF3D1pM00HsaDigBTTaKKYCUuaSigBwPtS4JpuacDSAcqgdzTxgdqjzSg0DJQ1LuqIGnCkAjjNSQyblwfvCmGmcqwYUAWi4Xv+FIoLHcxz6Co96EBu/pRvc9AB9aLDuWM0hlUd+ahwT94k08YHSlYLj/MZui4+tGzd97n2xQKcGA+tIYqqB0GKfUZb2pQTjk0hj80oJqMHFBlCjJNAEmT3FBYDrxUJkdhlRx6niki2SffYlv7p4osFyQvuOFXd9KFhIO5mwfRTTwQBgcD0FLmgByhVHyjHvTs5680xfzzTwakofnIxTWjRwcgUgIFI8yqOtFguN2yRf6tzj0PIoF1jh1wT3Xmot0k5wnC/3j0qSONIjxy57mmINkkvMhKr/dHWl8hQAFO0joRwakzkc9aTNK47IbvnjP3hIPcc08Xa9HUoffkUZBppUEcijQNScSKwypDD1BzRuqm0K5yvyn1FN3zJxkOPeiwcxbNN/Cq63Q6OCp9SOKlDhhlSGHtRYL3HGo2Jp26mkimAxwCOVH41Vb5n8teM9ealmk2g0yFSFLn7zVSIY75k4CggelJ5i9CcH3p3T0FIcHtTEAORkHI9qTd270woDyODSfOOjZ+tAD8epzSZphdh1X8qPMHr+dMQ41E/Sn5zTGoQMI8NHyOlBX0JpkZILAYpxb1BFMQHd7UhJ9KNw9aCaAE3CkzSk00gUwA03PrS/jSGgAzRmkBpaBBRRRQMXNFJRQA7NLmmZoyaAJM0bvTmmcUtIB+W+lNb6mlzSUASIcjNOzioFO0+1S5oGPBp4NRA04NSAkpRgdqj3immXsBn6UrDuT7sU0ygH1NQofMPLY9h3qdQEHAxRYLgBI55+Ue/WpERF7bj6mmZpc0hkhO7rUTxBqeDRnigCNZXj4f5h6jrUyurDggio8ZHI59qiKFTuU4NFguXAcDAFBkAHNVVmxkSZBo2u5BbKr+tFguSNOSdqAk+gpwgyCZTuPoDwKVAqDCDFP3ZpDIQZIhgHcvoakW4VjjlT6GlOCKiaMMORQGpPvIpd1U/nj+62R6GnrcL0bKn3osHMWcnPbFBbFRBgwyKXNKw7jy1NJpu6kJpgBwetR+UByDg+o4p+aKYhnmSqecMPel89T1yp9+lIx4xUDsQOtNIluw7/Wyhc5UdferGRUEOFTjknrTyaGCHkimmm9O9JmgBT+dNJoJppNMQuaaaM0maAG7R2pDn1z9acTTc0xDQcSCnk1E1PzmgAOKbilNJmmAnNGaM0lAgzRRSUABo60UUAFGaKKADmlxSZozQAtFFFABS5pKKBi5pc02jNACmnK3Y03NIOTxQBLuxSbielIAO/NOzSAUL/eOafnjA4FMzRmgYhGDkdalSUMMHg1HTW9aBFnNKCe+KhjkLDB6in5xSGSZpc1HupjyYpWHclMuM9qaGeQ4QceppgTcu5ifoKRZDGcHlaYrk6IE5+83qakzUZJIyDijNIokzRuphNJmkFyTNGajzzRmiwXJM5pjIDSZJHBxRk460xEeHjJ2HA9OtPE+Dhxg+valzSFQRQA7fnkcil3VW2lWypxSrKc4Yc+oosFyfdSZpmaQtRYLiu1RIN757CmyN29akX5FApiFdQTkcfSm7nXvke9LupDQAvmg9eKNwPQ0ymYx0OKdgJs0hNNjy7YJ7dae0R7GkAzNGaRgV603NMQuaTNJmkzTADSAnFBpBQIXdRmijFABRSUZoAWikzRQAUUUUAf/Z'};}
