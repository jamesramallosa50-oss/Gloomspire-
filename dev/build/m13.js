/* ===== BUILD 2.5: dungeon dressing ===== */
/* Every room (not the camp) gets set dressing against its walls: shackles, banners, bookshelves, tables with candles,
   candle clusters, skull piles, rubble, cobwebs in the corners and the odd hanging cage. All the solid pieces of a floor
   are merged into one mesh, the cobwebs into another, so it costs a couple of draw calls plus the candle flames. */
const WEBMAT=new T.MeshBasicMaterial({color:0xd8d6cc,transparent:true,opacity:.32,side:T.DoubleSide,depthWrite:false});
function dungeonDressing(){
  DIMS=[];if(!L||!L.rooms||PVP.on)return;const W=L.W,H=L.H,grid=L.grid,parts=[],webs=[],flames=[],fl=[];
  const m4=new T.Matrix4(),q=new T.Quaternion(),e3=new T.Euler(),one=new T.Vector3(1,1,1),v3=new T.Vector3();
  let F=null;/* current local frame: a matrix for the piece being built */
  const add=(arr,geom,hex,x,y,z,rx,ry,rz)=>{e3.set(rx||0,ry||0,rz||0);q.setFromEuler(e3);const lm=new T.Matrix4().compose(v3.set(x,y,z),q,one);arr.push([geom,hex,new T.Matrix4().multiplyMatrices(F,lm)]);};
  const B=(w,h,d,hex,x,y,z,rx,ry,rz)=>add(parts,geo(w,h,d),hex,x,y,z,rx,ry,rz),C=(rt,rb,h,hex,x,y,z,n,rx,rz)=>add(parts,cyl(rt,rb,h,n||6),hex,x,y,z,rx,0,rz);
  const flame=(x,y,z)=>{const p=new T.Vector3(x,y,z).applyMatrix4(F);flames.push(p);};
  const th=L.theme||{},tint=th.tint||0xffffff,IR=0x2e2c30,IR2=0x46424a,WD=0x5a3a1c,WD2=0x3e2814,STN=0x6a6660,STN2=0x55524c,BONE=0xd8d0b8,WAX=0xe8dcc0,CL=[0x6a1a1e,0x2a3a6a,0x2a5a32,0x5a2a6a][(P.floor*7)%4];
  const used=[];const near=(x,z,r)=>used.some(u=>Math.hypot(u[0]-x,u[1]-z)<r);
  const blockedBy=(x,z,r)=>{for(const p of L.plats||[])if(x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r)return true;for(const t of torches)if(Math.hypot(t.x-x,t.z-z)<r+.4)return true;for(const d of L.doors||[])if(Math.hypot(wx(d.x)-x,wx(d.y)-z)<r+1.6)return true;if(L.secret&&L.secret.tx!=null&&Math.hypot(L.secret.tx-x,L.secret.tz-z)<r+1.8)return true;return false;};
  const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&grid[y*W+x]!==0;
  /* pieces, built in a frame where the wall is behind (z=0) and +z points into the room */
  const P_={
    shackles(){for(const sx of[-.38,.38]){B(.18,.12,.05,IR2,sx,2.35,.03);for(let k=0,y=2.25;k<6;k++,y-=.15)B(.035,.15,k%2?.07:.025,IR,sx,y,.08,0,k%2?1.57:0,0);for(let i=0;i<6;i++){const a=i/6*6.283;B(.06,.03,.03,IR2,sx+Math.cos(a)*.07,1.33,.1+Math.sin(a)*.07,0,-a,0);}}
      if(Math.random()<.5){C(.09,.09,.06,BONE,-.38,1.2,.12,6);B(.03,.3,.03,BONE,-.42,1.02,.12,0,0,.3);}},
    banner(ceil){const top=Math.min(3.2,ceil-.35);B(1.05,.05,.05,IR,0,top,.1);for(const s of[-1,1])C(.04,.04,.08,0xb8902a,s*.55,top,.1,6,0,1.57);
      B(.82,1.45,.025,CL,0,top-.78,.1);B(.84,.08,.03,0xb8902a,0,top-.12,.1);B(.26,.26,.012,0xd8b04a,0,top-.62,.115,0,0,.785);B(.12,.12,.015,CL,0,top-.62,.12,0,0,.785);
      for(let i=0;i<4;i++){const l=.12+Math.random()*.22;B(.2,l,.025,CL,-.31+i*.205,top-1.5-l/2,.1);}},
    shelf(){const BK=[0x6a1a1e,0x2a3a6a,0x2a5a32,0x7a5a2a,0x4a2a5a,0x8a7a5a];B(.07,2.05,.42,WD2,-.62,1.025,.21);B(.07,2.05,.42,WD2,.62,1.025,.21);B(1.24,2.0,.03,0x2a1a0e,0,1.0,.02);
      for(const y of[.04,.62,1.2,1.78,2.04])B(1.3,.05,.42,WD,0,y,.21);
      for(const y0 of[.065,.645,1.225,1.805].slice(0,3+(Math.random()<.5)))for(let x=-.56;x<.5;){const w=.05+Math.random()*.07,h=.3+Math.random()*.16;if(Math.random()<.15){x+=w+.05;continue;}const lean=x>.35&&Math.random()<.5?.25:0;B(w,h,.26+Math.random()*.06,BK[(Math.random()*BK.length)|0],x+w/2,y0+h/2,.22,0,0,-lean);x+=w+.008;}
      if(Math.random()<.6){C(.07,.07,.08,BONE,.35,1.88,.2,6);B(.12,.1,.1,BONE,.35,1.97,.22);}},
    table(){B(1.4,.07,.72,WD,0,.8,.5);for(const sx of[-.62,.62])for(const sz of[.2,.8])B(.08,.77,.08,WD2,sx,.385,sz);B(1.2,.06,.05,WD2,0,.25,.5);
      C(.13,.13,.02,0xa8a8b0,-.3,.845,.55,10);C(.05,.06,.22,0x2a5a32,.15,.945,.35,6);C(.02,.02,.06,0x2a5a32,.15,1.08,.35,5);B(.28,.06,.2,0x6a1a1e,.42,.865,.6,0,.3,0);
      for(const [x,z,h] of[[-.55,.35,.22],[.5,.32,.14]]){C(.05,.06,.04,0xb8902a,x,.855,z,8);C(.03,.03,h,WAX,x,.87+h/2,z,6);flame(x,.87+h+.08,z);}},
    candles(){C(.32,.32,.02,WAX,0,.012,.35,10);const n=3+((Math.random()*3)|0);for(let i=0;i<n;i++){const a=i/n*6.283+Math.random(),r=.06+Math.random()*.16,x=Math.cos(a)*r,z=.35+Math.sin(a)*r*.7,h=.12+Math.random()*.35,rw=.035+Math.random()*.025;C(rw,rw+.01,h,WAX,x,h/2+.02,z,6);if(i<3)flame(x,h+.1,z);}},
    skulls(){const n=3+((Math.random()*4)|0);for(let i=0;i<n;i++){const x=-.4+Math.random()*.8,z=.25+Math.random()*.4,y=i>3?.18:.09,ry=Math.random()*1.4-.7;B(.2,.17,.2,BONE,x,y,z,0,ry,0);
        const fx=Math.sin(ry),fz=Math.cos(ry);for(const s of[-1,1])B(.05,.05,.02,0x1a1612,x+fx*.1+Math.cos(ry)*s*.05,y+.02,z+fz*.1-Math.sin(ry)*s*.05,0,ry,0);}
      for(let i=0;i<4;i++)C(.025,.025,.4+Math.random()*.2,BONE,-.35+Math.random()*.7,.03,.3+Math.random()*.4,5,1.57,Math.random()*3);},
    rubble(){const n=5+((Math.random()*5)|0);for(let i=0;i<n;i++){const s=.1+Math.random()*.28;B(s,s*(.6+Math.random()*.6),s*(.8+Math.random()*.5),Math.random()<.5?STN:STN2,-.6+Math.random()*1.2,s*.35,.2+Math.random()*.7,Math.random(),Math.random()*3,Math.random());}
      B(.5,.4,.45,STN2,-.2,.2,.25,0,.3,0);B(.28,.9,.28,STN,.35,.45,.22,0,0,.2);},
    cage(ceil){const by=Math.max(2.35,Math.min(ceil-1.6,3.4)),top=by+.95;for(let y=ceil-.05,k=0;y>top+.05;y-=.15,k++)B(.03,.16,k%2?.07:.02,IR2,0,y-.075,0,0,k%2?1.57:0,0);
      C(.12,.06,.1,IR,0,top+.04,0,6);for(const y of[by,top])for(let i=0;i<12;i++){const a=i/12*6.283;B(.2,.035,.035,IR,Math.cos(a)*.36,y,Math.sin(a)*.36,0,-(a+1.57),0);}
      for(let i=0;i<8;i++){const a=i/8*6.283;B(.03,.95,.03,IR2,Math.cos(a)*.36,by+.475,Math.sin(a)*.36);}B(.62,.04,.62,IR,0,by-.02,0);
      B(.18,.15,.18,BONE,.05,by+.1,0,0,.4,0);C(.025,.025,.35,BONE,-.1,by+.04,.08,5,1.57,.6);},
  };
  const pieces=['shackles','banner','shelf','table','candles','skulls','rubble','candles','shackles','skulls'];
  let cages=0;
  for(const r of L.rooms){if(r.idx===L.start)continue;const area=(r.x1-r.x0+1)*(r.y1-r.y0+1),want=Math.max(2,Math.min(meta.quality==='low'?4:7,Math.round(area/(meta.quality==='low'?14:9))));
    /* wall-side spots: a room cell with a wall on one side */
    const spots=[],corners=[];
    for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){if(!open(x,y))continue;const k=y*W+x;if(L.cover&&L.cover[k])continue;const ws=[];
      for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]])if(!open(x+dx,y+dy))ws.push([dx,dy]);
      for(const [dx,dy] of ws)spots.push({x,y,dx,dy});if(ws.length===2&&ws[0][0]!==-ws[1][0])corners.push({x,y,ws});}
    spots.sort(()=>Math.random()-.5);let n=0;
    for(const s of spots){if(n>=want)break;const nx=-s.dx,nz=-s.dy,px=wx(s.x)+s.dx*1.5,pz=wx(s.y)+s.dy*1.5,cx=px+nx*.5,cz=pz+nz*.5;
      if(near(cx,cz,2.2)||blockedBy(cx,cz,.9)||solidAt(cx,cz))continue;
      const kind=pieces[(Math.random()*pieces.length)|0];if((kind==='shelf'||kind==='table')&&(blockedBy(cx,cz,1.3)))continue;
      F=new T.Matrix4().compose(v3.set(px,0,pz),q.setFromEuler(e3.set(0,Math.atan2(nx,nz),0)),one);
      try{P_[kind](ceilAt(cx,cz));}catch(e){}used.push([cx,cz]);(L.dress=L.dress||[]).push({kind,x:cx,z:cz,nx,nz});n++;}
    /* a cobweb in some corners */
    for(const c of corners){if(Math.random()>.45)continue;const ceil=ceilAt(wx(c.x),wx(c.y));const ax=c.ws[0][0]||c.ws[1][0],az=c.ws[0][1]||c.ws[1][1];
      const ox=wx(c.x)+ax*1.48,oz=wx(c.y)+az*1.48,len=.9+Math.random()*.7,y0=Math.min(ceil,WALLH)-.02;F=new T.Matrix4().makeTranslation(ox,0,oz);
      for(let i=0;i<5;i++){const t=i/4,dx=-ax*Math.cos(t*1.5708)*len,dz=-az*Math.sin(t*1.5708)*len,dy=-len*.55;const L2=Math.hypot(dx,dy,dz);
        const mm=new T.Matrix4().lookAt(new T.Vector3(0,0,0),new T.Vector3(dx,dy,dz),new T.Vector3(0,1,0));const qq=new T.Quaternion().setFromRotationMatrix(mm);
        webs.push([geo(.012,.012,L2),0,new T.Matrix4().compose(new T.Vector3(ox+dx/2,y0+dy/2,oz+dz/2),qq,one)]);}
      for(const f of[.35,.65,.9]){let px_=null;for(let i=0;i<=8;i++){const t=i/8,p=new T.Vector3(ox-ax*Math.cos(t*1.5708)*len*f,y0-len*.55*f,oz-az*Math.sin(t*1.5708)*len*f);
          if(px_){const d=p.clone().sub(px_),mm=new T.Matrix4().lookAt(new T.Vector3(0,0,0),d,new T.Vector3(0,1,0));webs.push([geo(.01,.01,d.length()),0,new T.Matrix4().compose(px_.clone().add(p).multiplyScalar(.5),new T.Quaternion().setFromRotationMatrix(mm),one)]);}px_=p;}}}
    /* a hanging cage in a few big rooms, away from the walls */
    if(cages<2&&area>=24&&Math.random()<.35){const x=wx(r.x0+1)+.8,z=wx(r.y1-1)-.8;if(!blockedBy(x,z,1)&&!near(x,z,2.5)&&!solidAt(x,z)&&!torches.some(t=>t.chand&&Math.hypot(t.x-x,t.z-z)<3)){F=new T.Matrix4().makeTranslation(x,0,z);try{P_.cage(ceilAt(x,z));cages++;used.push([x,z]);}catch(e){}}}
  }
  if(parts.length)addChunked(parts,PROPMAT);
  if(webs.length)addChunked(webs,WEBMAT);
  /* candle flames: merged a room's worth at a time (two draw calls), culled with distance like torches, never taking a torch light */
  if(flames.length){const g1=cyl(0,.042,.13,5),g2=cyl(0,.024,.085,4),id=new T.Quaternion();for(let i=0;i<flames.length;i+=10){const fs=flames.slice(i,i+10),a1=[],a2=[];let sx=0,sz=0;
      for(const p of fs){a1.push([g1,0,new T.Matrix4().compose(p,id,one)]);a2.push([g2,0,new T.Matrix4().compose(new T.Vector3(p.x,p.y-.015,p.z),id,one)]);sx+=p.x;sz+=p.z;}
      const g=new T.Group();{const m1=new T.Mesh(chandMerge(a1),flameMat),m2=new T.Mesh(chandMerge(a2),flameMat2);m1.userData.own=m2.userData.own=1;g.add(m1);g.add(m2);}lvl.add(g);DIMS.push({x:sx/fs.length,z:sz/fs.length,g});}}
}
