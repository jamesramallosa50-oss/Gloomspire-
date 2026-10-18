/* ===== BUILD 2.7: cullable set dressing, secret passages ===== */
/* merged meshes are split into 6 m chunks so the line-of-sight culler can skip the ones behind walls */
const CHK=6;
function addChunked(parts,mat,ro){const by=new Map();for(const p of parts){const m=p[2].elements,k=Math.floor(m[12]/CHK)+','+Math.floor(m[14]/CHK);let a=by.get(k);if(!a)by.set(k,a=[]);a.push(p);}
  for(const a of by.values()){const m=new T.Mesh(chandMerge(a),mat);m.userData.own=1;if(ro)m.renderOrder=ro;lvl.add(m);}}
function splitGeomChunks(g,mat,sz){sz=sz||CHK;const P_=g.attributes.position.array,N_=g.attributes.normal.array,C_=g.attributes.color.array,U_=g.attributes.uv.array,by=new Map();
  for(let t=0;t<P_.length/9;t++){const o=t*9,cx=(P_[o]+P_[o+3]+P_[o+6])/3,cz=(P_[o+2]+P_[o+5]+P_[o+8])/3,k=Math.floor(cx/sz)+','+Math.floor(cz/sz);let a=by.get(k);if(!a)by.set(k,a=[]);a.push(t);}
  for(const ts of by.values()){const p=[],n=[],c=[],u=[];for(const t of ts){for(let i=0;i<9;i++){p.push(P_[t*9+i]);n.push(N_[t*9+i]);c.push(C_[t*9+i]);}for(let i=0;i<6;i++)u.push(U_[t*6+i]);}
    const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(p,3));gg.setAttribute('normal',new T.Float32BufferAttribute(n,3));gg.setAttribute('color',new T.Float32BufferAttribute(c,3));gg.setAttribute('uv',new T.Float32BufferAttribute(u,2));
    const m=new T.Mesh(gg,mat);m.userData.own=1;lvl.add(m);}}
/* candle flames hide with distance, checked a few times a second instead of being sorted with the torches every frame */
let DIMS=[],dimT=0;
function dimTick(dt){dimT-=dt;if(dimT>0||!DIMS.length)return;dimT=.25;for(const d of DIMS)if(!d.far)d.g.visible=Math.hypot(d.x-P.x,d.z-P.z)<30;}

/* ---------- secret passages: a wall slab hides a small vault; a loose book or a skull lever nearby opens it ---------- */
function secretCarve(f){
  L.secret=null;if(PVP.on||f<1||Math.random()>.55)return;const W=L.W,H=L.H,g=L.grid,ro=L.roomOf;
  const solid=(x,y)=>x>=1&&y>=1&&x<W-1&&y<H-1&&g[y*W+x]===0;
  const R=L.rooms.filter(r=>r.idx!==L.start&&r.idx!==L.exit&&r.idx!==L.special).sort(()=>Math.random()-.5);
  for(const r of R){const cand=[];
    for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++)for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]]){
      const px=-dy,py=dx;/* lateral */if(L.cover&&L.cover[y*W+x])continue;
      let ok=true;for(let s=1;s<=5&&ok;s++)for(let l=-2;l<=2&&ok;l++){const cx=x+dx*s+px*l,cy=y+dy*s+py*l;if(s===1&&l!==0&&Math.abs(l)===2)continue;if(!solid(cx,cy))ok=false;}
      /* the trigger goes on the wall of the next room cell along */
      const tx=x+px,ty=y+py,t2x=x-px,t2y=y-py;let tr=null;
      if(ok){if(tx>=r.x0&&tx<=r.x1&&ty>=r.y0&&ty<=r.y1&&solid(tx+dx,ty+dy))tr={x:tx,y:ty};else if(t2x>=r.x0&&t2x<=r.x1&&t2y>=r.y0&&t2y<=r.y1&&solid(t2x+dx,t2y+dy))tr={x:t2x,y:t2y};}
      if(ok&&tr)cand.push({x,y,dx,dy,px,py,tr});}
    if(!cand.length)continue;const c=cand[(Math.random()*cand.length)|0];
    const vault=[];for(let s=2;s<=4;s++)for(let l=-1;l<=1;l++){const cx=c.x+c.dx*s+c.px*l,cy=c.y+c.dy*s+c.py*l,k=cy*W+cx;g[k]=1;ro[k]=-1;vault.push(k);}
    const dk=(c.y+c.dy)*W+(c.x+c.dx);g[dk]=2;
    if(!doorGeo.secret){const gg=tileBox(CELL,WALLH,.4,0),pa=gg.attributes.position,col=new Float32Array(pa.count*3);for(let i=0;i<pa.count;i++){const k=pa.getY(i)<0?.64:1;col[i*3]=col[i*3+1]=col[i*3+2]=k;}gg.setAttribute('color',new T.BufferAttribute(col,3));doorGeo.secret=gg;doorMats.secret=levelMat;}
    const d={x:c.x+c.dx,y:c.y+c.dy,axis:c.dx?'x':'z',type:'secret',req:-1,open:0,opening:false};L.doors.push(d);
    L.secret={d,room:r.idx,x:c.x,y:c.y,dx:c.dx,dy:c.dy,px:c.px,py:c.py,tr:c.tr,vault,found:false,near:0,hint:false,kind:Math.random()<.5?'book':'skull',tx:wx(c.tr.x)+c.dx*.9,tz:wx(c.tr.y)+c.dy*.9};return;}
}
function secretSetup(){
  const S=L.secret;if(!S||!S.d.mesh)return;const d=S.d;
  /* the slab sits flush with the room's wall so it reads as wall */
  d.mesh.position.x=wx(d.x)-S.dx*1.28;d.mesh.position.z=wx(d.y)-S.dy*1.28;
  /* the trigger, on the neighbouring wall: a bookshelf with one red book pulled proud, or a skull plaque with a lever jaw */
  const nx=-S.dx,nz=-S.dy,px=wx(S.tr.x)+S.dx*1.5,pz=wx(S.tr.y)+S.dy*1.5,G=new T.Group(),M=new Model();G.add(M.g);
  M.g.position.set(px,0,pz);M.g.rotation.y=Math.atan2(nx,nz);
  if(S.kind==='book'){const WD=0x5a3a1c,WD2=0x3e2814,BK=[0x6a1a1e,0x2a3a6a,0x2a5a32,0x7a5a2a,0x4a2a5a];
    M.b(.07,2.05,.42,WD2,-.62,1.025,.21);M.b(.07,2.05,.42,WD2,.62,1.025,.21);M.b(1.24,2.0,.03,0x2a1a0e,0,1.0,.02);for(const y of[.04,.62,1.2,1.78,2.04])M.b(1.3,.05,.42,WD,0,y,.21);
    for(const y0 of[.065,.645,1.225,1.805])for(let x=-.56;x<.5;){const w=.06+Math.random()*.06,h=.3+Math.random()*.14;if(!(y0===1.225&&Math.abs(x)<.08))M.b(w,h,.28,BK[(Math.random()*5)|0],x+w/2,y0+h/2,.22);x+=w+.01;}
    S.lever=M.piv(0,1.225,.36);M.b(.08,.38,.28,0xa8181d,0,.19,-.06,S.lever);M.b(.085,.04,.2,0xd8b04a,0,.3,-.06,S.lever,GLOW);}
  else{M.b(.9,.9,.1,0x48443e,0,1.55,.05);M.b(1,.1,.14,0x55524c,0,2.04,.07);M.b(1,.1,.14,0x55524c,0,1.06,.07);M.b(.34,.3,.3,0xd8d0b8,0,1.62,.2);
    for(const s of[-1,1])M.b(.08,.07,.02,0x9aff6a,s*.08,1.66,.355,null,GLOW);M.b(.12,.04,.02,0x1a1612,0,1.56,.355);
    S.lever=M.piv(0,1.48,.2);M.b(.26,.08,.24,0xc8c0a8,0,-.04,.04,S.lever);for(const s of[-1,1])M.cy(.03,.03,.5,0x46424a,s*.36,1.55,.12,null,null,6);}
  for(const t of torches.slice())if(!t.chand&&Math.hypot(t.x-px,t.z-pz)<1.6){lvl.remove(t.g);torches.splice(torches.indexOf(t),1);}
  lvl.add(G);S.g=G;S.tx=px+nx*.6;S.tz=pz+nz*.6;S.nx=nx;S.nz=nz;
  /* the vault: candles, a skeleton slumped against the back wall, a heap of coins, and the loot */
  const vx=wx(S.x+S.dx*3),vz=wx(S.y+S.dy*3);
  prop(vx,vz,Math.atan2(nx,nz),Q=>{for(const s of[-1,1]){Q.cy(.05,.06,.5,0xe8dcc0,s*1.1,.25,-1.1,null,null,6);Q.b(.06,.12,.06,0xffd060,s*1.1,.56,-1.1,null,GLOW);}
    for(let i=0;i<14;i++)Q.cy(.07,.07,.03,0xf0c040,(Math.random()-.5)*.9,.02+i*.012,.9+(Math.random()-.5)*.6,null,GLOW,8);Q.b(.22,.18,.2,0xd8d0b8,-.9,.45,-1.15);Q.b(.4,.5,.18,0xc8c0a8,-.9,.2,-1.2);});
  addItem('chest',vx+S.px*.9,vz+S.py*.9);items[items.length-1].bonus=true;addItem('hp',vx-S.px*1.1,vz-S.py*1.1);addItem('mp',vx-S.px*1.1+S.dx*.8,vz-S.py*1.1+S.dy*.8);addItem('ore',vx+S.dx*.9,vz+S.dy*.9);
}
function secretOpen(net){const S=L&&L.secret;if(!S||S.found)return;S.found=true;S.anim=0;openDoor(S.d,true);sfx('door');sfx('seal');shake=Math.max(shake,.35);
  banner('SECRET PASSAGE',S.kind==='book'?'The bookcase was a lever':'The skull was a lever',2200);msg('Stone grinds against stone. A hidden vault opens in the wall.','gold','secret');
  burst(wx(S.d.x)-S.dx*1.4,2,wx(S.d.y)-S.dy*1.4,40,[.75,.7,.62],3,1,1,true);meta.secrets=(meta.secrets||0)+1;save();
  if(!net&&MP.on&&!PVP.on)try{mpSend({t:'sec',f:P.floor});}catch(e){}}
function secretTick(dt){const S=L&&L.secret;if(!S||!S.g||state!=='play')return;
  if(S.found){if(S.lever&&S.anim<1){S.anim=Math.min(1,S.anim+dt*3);S.lever.rotation.x=(S.kind==='book'?.55:.8)*S.anim;}if(Math.random()<dt*8&&S.d.open<1)spark(wx(S.d.x)-S.dx*1.4+(Math.random()-.5)*2.6,Math.random()*3,wx(S.d.y)-S.dy*1.4,0,-1,0,.8,[.7,.66,.6],1);return;}
  const dx=S.tx-P.x,dz=S.tz-P.z,d=Math.hypot(dx,dz);
  if(d<4.5&&!S.hint){S.hint=true;msg(S.kind==='book'?'One red book sits a little proud of the shelf...':'The skull\'s eyes glow, and its jaw hangs loose like a handle...','lore','sechint');}
  const a=aimDir(),fa=(dx*a.x+dz*a.z)/(d||1);
  if(d<1.9&&fa>.55){S.near+=dt;if(S.near>.12&&S.near-dt<=.12)msg('Pull it?','lore','secpull');if(S.near>.7)secretOpen();}else S.near=0;}
