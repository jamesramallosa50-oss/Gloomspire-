/* ===== BUILD 2.4: chandeliers ===== */
/* an iron chandelier: plate on the ceiling, a chain of links, two rings of iron, six candles. The iron is merged into one mesh; the flames flicker like torches and the nearest ones carry real light */
function chandMerge(parts){const pos=[],nor=[],col=[],uv=[],v=new T.Vector3(),n=new T.Vector3(),nm=new T.Matrix3();
  for(const [geom,hex,mtx] of parts){const g2=geom.index?geom.toNonIndexed():geom,P_=g2.attributes.position,N_=g2.attributes.normal,U_=g2.attributes.uv,c=new T.Color(hex);nm.getNormalMatrix(mtx);
    for(let i=0;i<P_.count;i++){v.fromBufferAttribute(P_,i).applyMatrix4(mtx);pos.push(v.x,v.y,v.z);n.fromBufferAttribute(N_,i).applyMatrix3(nm).normalize();nor.push(n.x,n.y,n.z);col.push(c.r,c.g,c.b);if(U_)uv.push(U_.getX(i),U_.getY(i));else uv.push(0,0);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;}
function addChandelier(x,z){
  const c=ceilAt(x,z),hy=Math.max(2.75,c>5?c-2.9:c-1.3),parts=[],IR=0x2e2c30,IR2=0x46424a,BR=0x8a6a2a,WAX=0xe8dcc0,m4=new T.Matrix4(),q=new T.Quaternion(),e3=new T.Euler(),one=new T.Vector3(1,1,1);
  const put=(geom,hex,px,py,pz,rx,ry,rz)=>{e3.set(rx||0,ry||0,rz||0);q.setFromEuler(e3);parts.push([geom,hex,new T.Matrix4().compose(new T.Vector3(px,py,pz),q,one)]);};
  put(cyl(.2,.2,.05,8),IR,0,c-.025,0);put(cyl(.06,.09,.12,6),IR2,0,c-.1,0);
  const top=c-.16,bot=hy+.42;for(let y=top,k=0;y>bot;y-=.15,k++)put(geo(.035,.17,k%2?.07:.02),IR2,0,y-.075,0,0,k%2?1.5708:0,0);
  put(cyl(.05,.05,.42,6),IR,0,hy+.21,0);put(cyl(.11,.05,.12,8),BR,0,hy+.02,0);put(ico(.09),BR,0,hy-.12,0);
  for(const [r,y,n] of [[.78,hy,16],[.42,hy+.12,10]])for(let i=0;i<n;i++){const a=i/n*6.283,l=6.283*r/n*1.08;put(geo(l,.045,.05),IR,Math.cos(a)*r,y,Math.sin(a)*r,0,-(a+1.5708),0);}
  const fls=[],grp=new T.Group();
  for(let i=0;i<6;i++){const a=i/6*6.283+.26,cx=Math.cos(a)*.78,cz=Math.sin(a)*.78;put(geo(.78,.04,.04),IR2,Math.cos(a)*.39,hy+.02,Math.sin(a)*.39,0,-a,0);
    put(cyl(.075,.05,.07,6),BR,cx,hy+.06,cz);put(cyl(.032,.032,.2,6),WAX,cx,hy+.19,cz);
    const f1=new T.Mesh(cyl(0,.045,.13,5),flameMat),f2=new T.Mesh(cyl(0,.025,.09,4),flameMat2);f1.position.set(cx,hy+.36,cz);f2.position.set(cx,hy+.34,cz);grp.add(f1);grp.add(f2);fls.push(f1,f2);}
  const m=new T.Mesh(chandMerge(parts),PROPMAT);m.userData.own=1;grp.add(m);
  const hl=new T.Mesh(SPHG,torchHalo);hl.position.set(0,hy+.3,0);hl.scale.setScalar(.42);grp.add(hl);
  grp.position.set(x,0,z);lvl.add(grp);torches.push({x,z,g:grp,fl:fls[0],fls,hl:null,sy:hy+.3,d:0,ph:rnd(10),chand:true});}
function addChandeliers(){
  if(!L||!L.rooms||PVP.on)return;let n=0;const R=L.rooms.slice().sort(()=>Math.random()-.5);
  for(const r of R){if(n>=5)break;if(r.idx===L.start)continue;const w=r.x1-r.x0+1,h=r.y1-r.y0+1;if(w*h<16||Math.random()>.7)continue;
    const cx=(wx(r.x0)+wx(r.x1))/2,cz=(wx(r.y0)+wx(r.y1))/2;
    for(const [ox,oz] of[[0,0],[3,0],[-3,0],[0,3],[0,-3],[3,3],[-3,-3]]){const x=cx+ox,z=cz+oz;if(x<wx(r.x0)||x>wx(r.x1)||z<wx(r.y0)||z>wx(r.y1))continue;if(solidAt(x,z)||solidAt(x+1,z)||solidAt(x-1,z)||solidAt(x,z+1)||solidAt(x,z-1))continue;
      let bad=false;for(const p of L.plats||[])if(x>p.x0-1&&x<p.x1+1&&z>p.z0-1&&z<p.z1+1){bad=true;break;}if(bad)continue;
      try{addChandelier(x,z);n++;}catch(e){}break;}}}
