/* ===== BUILD 2.6: more dungeon: beams, buttresses, wall furniture, floor details ===== */
const DECMAT={water:new T.MeshBasicMaterial({color:0x0e1a22,transparent:true,opacity:.55,depthWrite:false}),
  blood:new T.MeshBasicMaterial({color:0x3a0608,transparent:true,opacity:.6,depthWrite:false}),
  moss:new T.MeshBasicMaterial({color:0x2a3a14,transparent:true,opacity:.55,depthWrite:false})};
function dungeonDressing2(){
  if(!L||!L.rooms||PVP.on)return;const W=L.W,H=L.H,grid=L.grid,parts=[],dec={water:[],blood:[],moss:[]},flames=[];
  const q=new T.Quaternion(),e3=new T.Euler(),one=new T.Vector3(1,1,1),v3=new T.Vector3();let F=new T.Matrix4();
  const add=(arr,geom,hex,x,y,z,rx,ry,rz)=>{e3.set(rx||0,ry||0,rz||0);q.setFromEuler(e3);arr.push([geom,hex,new T.Matrix4().multiplyMatrices(F,new T.Matrix4().compose(v3.set(x,y,z),q,one))]);};
  const B=(w,h,d,hex,x,y,z,rx,ry,rz)=>add(parts,geo(w,h,d),hex,x,y,z,rx,ry,rz),C=(rt,rb,h,hex,x,y,z,n,rx,rz)=>add(parts,cyl(rt,rb,h,n||6),hex,x,y,z,rx,0,rz);
  const D=(k,w,d,x,z,ry)=>add(dec[k],geo(w,.004,d),0,x,.016+Math.random()*.004,z,0,ry||0,0);
  const flame=(x,y,z)=>flames.push(new T.Vector3(x,y,z).applyMatrix4(F));
  const rr=(a,b)=>a+Math.random()*(b-a),pick_=a=>a[(Math.random()*a.length)|0];
  const IR=0x2e2c30,IR2=0x46424a,WD=0x5a3a1c,WD2=0x3e2814,WD3=0x4a2e16,STN=0x6a6660,STN2=0x55524c,STN3=0x48443e,BONE=0xd8d0b8,WAX=0xe8dcc0,SACK=0x8a7a5a,SACK2=0x6e6044;
  const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&grid[y*W+x]!==0;
  const prev=(L.dress||[]).map(d=>[d.x,d.z]),used=prev.slice();const near=(x,z,r)=>used.some(u=>Math.hypot(u[0]-x,u[1]-z)<r);
  const blockedBy=(x,z,r)=>{for(const p of L.plats||[])if(x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r)return true;for(const t of torches)if(!t.dim&&Math.hypot(t.x-x,t.z-z)<r+.4)return true;for(const d of L.doors||[])if(Math.hypot(wx(d.x)-x,wx(d.y)-z)<r+1.6)return true;if(L.secret&&L.secret.tx!=null&&Math.hypot(L.secret.tx-x,L.secret.tz-z)<r+1.8)return true;return false;};
  /* wall furniture, built with the wall at z=0 and the room at +z */
  const WP={
    rack(){B(1.5,.07,.08,WD2,0,1.75,.08);B(1.5,.07,.08,WD2,0,.55,.08);for(const s of[-.7,.7])B(.08,1.7,.1,WD,s,.85,.08);
      for(let i=0;i<4;i++){const x=-.5+i*.33,t=i%2;if(t){B(.03,1.7,.03,WD3,x,1.0,.18,0,0,.06);B(.06,.22,.02,0xa8acb4,x+.05,1.92,.18,0,0,.06);}else{B(.06,1.0,.015,0xb8bcc4,x,1.08,.17);B(.2,.04,.05,0x8a6a2a,x,.58,.17);B(.04,.16,.04,WD3,x,.47,.17);}}
      B(.5,.5,.04,0x6a1a1e,.45,1.15,.2,0,0,0);B(.12,.12,.02,0xb8902a,.45,1.15,.225);},
    sacks(){for(let i=0;i<4;i++){const x=rr(-.6,.6),z=rr(.3,.75),s=rr(.3,.42);B(s,s*.9,s*.75,i%2?SACK:SACK2,x,s*.45,z,0,rr(-.6,.6),rr(-.15,.15));B(s*.35,s*.25,s*.3,SACK2,x,s*.95,z);}
      for(let i=0;i<2;i++){const x=rr(-.7,.7),z=rr(.35,.7);C(.27,.24,.8,0x5a3a1c,x,.4,z,10);C(.28,.28,.05,IR,x,.2,z,10);C(.28,.28,.05,IR,x,.62,z,10);C(.22,.22,.02,WD2,x,.81,z,10);}},
    coffin(){const L2=2.0;B(.75,.5,L2,STN3,0,.25,.75,0,1.5708,0);B(.85,.12,L2+.12,STN2,0,.56,.75,0,1.5708,0);B(.5,.06,1.3,STN,0,.65,.75,0,1.5708,0);B(.28,.22,.18,STN,-.62,.75,.75);
      for(const s of[-1,1])B(.12,.6,.12,STN2,s*1.05,.3,.75);C(.04,.04,.2,WAX,.85,.72,.75,6);flame(.85,.88,.75);},
    niche(){B(1.2,1.1,.12,STN3,0,1.5,.06);B(1.3,.12,.3,STN2,0,.92,.15);B(1.3,.12,.3,STN2,0,2.08,.15);for(const s of[-1,1])B(.14,1.2,.3,STN2,s*.6,1.5,.15);B(.9,.06,.26,STN,0,1.5,.15);
      for(const [x,y] of[[-.3,1.07],[0,1.07],[.3,1.07],[-.15,1.62],[.18,1.62]]){B(.2,.17,.18,BONE,x,y+.085,.18,0,rr(-.3,.3),0);B(.05,.04,.02,0x1a1612,x-.05,y+.1,.275);B(.05,.04,.02,0x1a1612,x+.05,y+.1,.275);}},
    notice(){B(1.0,.7,.05,WD,0,1.6,.04);B(1.08,.06,.07,WD2,0,1.96,.05);B(1.08,.06,.07,WD2,0,1.24,.05);for(const [x,y,w,h] of[[-.25,1.65,.32,.42],[.15,1.55,.3,.36],[.32,1.75,.2,.22]]){B(w,h,.01,0xd8c8a0,x,y,.075,0,0,rr(-.12,.12));B(w*.7,.02,.012,0x3a2a1a,x,y+h*.25,.08);B(w*.6,.02,.012,0x3a2a1a,x,y,.08);B(.04,.04,.02,IR,x,y+h/2-.03,.085);}},
    altar(){B(1.3,.85,.6,STN2,0,.425,.4);B(1.42,.08,.7,STN,0,.88,.4);B(.9,.04,.5,0x5a1a1e,0,.93,.4);B(.9,.3,.02,0x5a1a1e,0,.78,.66);
      C(.1,.12,.2,0xb8902a,0,1.05,.35,8);C(.14,.1,.06,0xb8902a,0,1.18,.35,8);for(const s of[-.5,.5]){C(.04,.04,.3,WAX,s,1.1,.35,6);flame(s,1.33,.35);}B(.2,.17,.18,BONE,.28,1.0,.45,0,-.4,0);},
    maiden(){B(.8,2.1,.6,IR,0,1.05,.32);B(.66,1.9,.04,IR2,0,1.08,.63);B(.3,.36,.06,IR2,0,1.85,.64);for(let i=0;i<5;i++)B(.04,.04,.12,0xa8acb4,-.15+i*.075,1.5-i*.1,.69);for(const s of[-1,1])B(.06,.12,.06,IR2,s*.38,1.4,.62);},
    hooks(){B(1.4,.08,.08,IR2,0,2.6,.05);for(let i=0;i<4;i++){const x=-.5+i*.33,l=rr(.25,.8);for(let k=0,y=2.55;k<Math.round(l/.14);k++,y-=.14)B(.03,.15,k%2?.06:.02,IR,x,y-.07,.12,0,k%2?1.57:0,0);B(.03,.18,.03,IR2,x,2.5-l,.12);B(.12,.03,.03,IR2,x+.05,2.42-l,.12);}},
  };
  const kinds=['rack','sacks','sacks','coffin','niche','notice','altar','maiden','hooks','niche'];
  for(const r of L.rooms){if(r.idx===L.start)continue;const area=(r.x1-r.x0+1)*(r.y1-r.y0+1);
    const spots=[],corners=[];
    for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){if(!open(x,y))continue;if(L.cover&&L.cover[y*W+x])continue;const ws=[];for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]])if(!open(x+dx,y+dy))ws.push([dx,dy]);
      for(const [dx,dy] of ws)spots.push({x,y,dx,dy});if(ws.length===2&&ws[0][0]!==-ws[1][0])corners.push({x,y,ws});}
    /* stone buttresses in the corners */
    for(const c of corners){const ax=c.ws[0][0]||c.ws[1][0],az=c.ws[0][1]||c.ws[1][1],cx=wx(c.x)+ax*1.22,cz=wx(c.y)+az*1.22,h=Math.min(ceilAt(wx(c.x),wx(c.y)),HB);if(blockedBy(cx,cz,.3))continue;
      F=new T.Matrix4();B(.56,h,.56,STN2,cx,h/2,cz);B(.7,.3,.7,STN3,cx,.15,cz);B(.68,.18,.68,STN3,cx,h-.09,cz);if(h>WALLH+.5)B(.66,.14,.66,STN3,cx,WALLH,cz);}
    /* ceiling beams across the short side, with brackets at each end */
    {const ceil=ceilAt((wx(r.x0)+wx(r.x1))/2,(wx(r.y0)+wx(r.y1))/2);if(ceil<=WALLH+.2&&area>=9){const alongX=(r.x1-r.x0)<(r.y1-r.y0);F=new T.Matrix4();
      if(alongX){for(let y=r.y0+1;y<=r.y1-1;y+=2){const z=wx(y),x0=wx(r.x0)-1.5,x1=wx(r.x1)+1.5;B(x1-x0,.26,.3,WD3,(x0+x1)/2,ceil-.13,z);for(const x of[x0+.12,x1-.12]){B(.22,.5,.32,WD2,x,ceil-.5,z);B(.24,.1,.36,IR,x,ceil-.28,z);}}}
      else{for(let x=r.x0+1;x<=r.x1-1;x+=2){const x_=wx(x),z0=wx(r.y0)-1.5,z1=wx(r.y1)+1.5;B(.3,.26,z1-z0,WD3,x_,ceil-.13,(z0+z1)/2);for(const z of[z0+.12,z1-.12]){B(.32,.5,.22,WD2,x_,ceil-.5,z);B(.36,.1,.24,IR,x_,ceil-.28,z);}}}}}
    /* wall furniture */
    spots.sort(()=>Math.random()-.5);let n=0;const want=Math.max(1,Math.min(4,Math.round(area/14)));
    for(const s of spots){if(n>=want)break;const nx=-s.dx,nz=-s.dy,px=wx(s.x)+s.dx*1.5,pz=wx(s.y)+s.dy*1.5,cx=px+nx*.55,cz=pz+nz*.55;
      if(near(cx,cz,2.2)||blockedBy(cx,cz,1.1)||solidAt(cx,cz))continue;const k=pick_(kinds);if(k==='coffin'&&(near(cx,cz,3)||blockedBy(cx,cz,1.5)))continue;
      F=new T.Matrix4().compose(v3.set(px,0,pz),q.setFromEuler(e3.set(0,Math.atan2(nx,nz),0)),one);try{WP[k]();}catch(e){}used.push([cx,cz]);(L.dress=L.dress||[]).push({kind:k,x:cx,z:cz,nx,nz});n++;}
    /* moss and damp on the walls, low down */
    for(const s of spots){if(Math.random()>.18)continue;const nx=-s.dx,nz=-s.dy,px=wx(s.x)+s.dx*1.5,pz=wx(s.y)+s.dy*1.5;F=new T.Matrix4().compose(v3.set(px,0,pz),q.setFromEuler(e3.set(0,Math.atan2(nx,nz),0)),one);
      const w=rr(.8,2),x=rr(-.6,.6);add(dec.moss,geo(w,rr(.3,.8),.004),0,x,rr(.15,.4),.022);add(dec.moss,geo(w*.5,rr(.4,1.1),.004),0,x+rr(-.3,.3),rr(.3,.7),.024);}
    /* the floor: drains, puddles, old blood, straw, bone scraps, cracked slabs */
    const cells=[];for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++)if(open(x,y)&&!(L.cover&&L.cover[y*W+x]))cells.push([x,y]);cells.sort(()=>Math.random()-.5);
    const nf=Math.min(cells.length,Math.max(2,Math.round(area/5)));F=new T.Matrix4();
    for(let i=0;i<nf;i++){const [cx_,cy_]=cells[i],x=wx(cx_)+rr(-1,1),z=wx(cy_)+rr(-1,1);if(blockedBy(x,z,.5))continue;const k=Math.random();
      if(k<.14){B(.9,.03,.9,IR,x,.015,z);for(let j=-3;j<=3;j++)B(.05,.035,.8,0x1a1816,x+j*.11,.02,z);}
      else if(k<.34){D('water',rr(.8,1.8),rr(.6,1.4),x,z,rr(0,3));D('water',rr(.4,.9),rr(.3,.7),x+rr(-.6,.6),z+rr(-.6,.6),rr(0,3));}
      else if(k<.46){D('blood',rr(.5,1.2),rr(.4,.9),x,z,rr(0,3));for(let j=0;j<3;j++)D('blood',rr(.1,.25),rr(.1,.2),x+rr(-.9,.9),z+rr(-.9,.9),rr(0,3));}
      else if(k<.62){for(let j=0;j<14;j++)B(rr(.25,.5),.012,.02,j%3?0xb89a4a:0x8a7a3a,x+rr(-.5,.5),.012,z+rr(-.5,.5),0,rr(0,3),0);}
      else if(k<.76){for(let j=0;j<4;j++)C(.02,.02,rr(.2,.45),BONE,x+rr(-.4,.4),.025,z+rr(-.4,.4),5,1.5708,rr(0,3));if(Math.random()<.4)B(.17,.14,.17,BONE,x,.07,z,0,rr(0,3),0);}
      else{for(let j=0;j<3;j++)B(rr(.4,1),.014,.03,0x1a1612,x+rr(-.3,.3),.012,z+rr(-.3,.3),0,rr(0,3),0);B(rr(.6,1),.05,rr(.5,.8),STN3,x,.025,z,0,rr(0,3),rr(-.03,.03));}}
    /* chains hanging from the ceiling */
    if(Math.random()<.5){const [cx_,cy_]=cells[nf]||cells[0]||[r.x0,r.y0],x=wx(cx_)+rr(-.8,.8),z=wx(cy_)+rr(-.8,.8),ceil=ceilAt(x,z);if(!blockedBy(x,z,.5)&&!torches.some(t=>t.chand&&Math.hypot(t.x-x,t.z-z)<2)){
      F=new T.Matrix4();const n2=2+((Math.random()*2)|0);for(let c=0;c<n2;c++){const ox=x+rr(-.4,.4),oz=z+rr(-.4,.4),bot=Math.max(2.6,ceil-rr(.8,1.7));for(let k=0,y=ceil;y>bot;y-=.15,k++)B(.03,.16,k%2?.065:.02,IR,ox,y-.075,oz,0,k%2?1.57:0,0);B(.03,.2,.03,IR2,ox,bot-.1,oz);B(.14,.03,.03,IR2,ox+.06,bot-.2,oz);}}}
  }
  if(parts.length)addChunked(parts,PROPMAT);
  if(meta.quality!=='low')for(const k in dec)if(dec[k].length)addChunked(dec[k],DECMAT[k],1);
  if(flames.length){const g1=cyl(0,.042,.13,5),g2=cyl(0,.024,.085,4),id=new T.Quaternion(),a1=[],a2=[];for(const p of flames){a1.push([g1,0,new T.Matrix4().compose(p,id,one)]);a2.push([g2,0,new T.Matrix4().compose(new T.Vector3(p.x,p.y-.015,p.z),id,one)]);}
    const g=new T.Group();{const m1=new T.Mesh(chandMerge(a1),flameMat),m2=new T.Mesh(chandMerge(a2),flameMat2);m1.userData.own=m2.userData.own=1;g.add(m1);g.add(m2);}lvl.add(g);let sx=0,sz=0;for(const p of flames){sx+=p.x;sz+=p.z;}DIMS.push({x:sx/flames.length,z:sz/flames.length,g,far:1});}
}
