/* ===== BUILD 3.15: THE FACILITY — part 3: building the level, collision, navigation and doors ===== */
/* ---------- collision: a capsule (radius r, from feet+stepUp to feet+h) against grid columns, boxes and door leaves ---------- */
function facDoorSeg(d){const a=d.a0+d.th;return [d.hx,d.hz,d.hx+Math.cos(a)*d.w,d.hz+Math.sin(a)*d.w];}
function facPush(F,e,r,h,su,skipDoor){
  const W=F.W,G=W.G,y0=e.y+su,y1=e.y+h;let moved=false,pen=0;
  const i0=Math.floor((e.x-r)/FC),i1=Math.floor((e.x+r)/FC),j0=Math.floor((e.z-r)/FC),j1=Math.floor((e.z+r)/FC);
  const rect=(x0,z0,x1,z1)=>{const qx=e.x<x0?x0:e.x>x1?x1:e.x,qz=e.z<z0?z0:e.z>z1?z1:e.z;let dx=e.x-qx,dz=e.z-qz;const d2=dx*dx+dz*dz;if(d2>=r*r)return;
    if(d2>1e-10){const d=Math.sqrt(d2),p=r-d;e.x+=dx/d*p;e.z+=dz/d*p;pen=Math.max(pen,p);moved=true;return;}
    /* centre inside: leave by the shortest side */
    const l=e.x-x0,rr_=x1-e.x,t=e.z-z0,b=z1-e.z,m=Math.min(l,rr_,t,b);if(m===l)e.x=x0-r;else if(m===rr_)e.x=x1+r;else if(m===t)e.z=z0-r;else e.z=z1+r;pen=Math.max(pen,m+r);moved=true;};
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(i<0||j<0||i>=FNX||j>=FNZ){rect(i*FC,j*FC,(i+1)*FC,(j+1)*FC);continue;}
    if(!facClear(G,j*FNX+i,y0,y1))rect(i*FC,j*FC,(i+1)*FC,(j+1)*FC);}
  const seen=F.seen||(F.seen=new Set());seen.clear();
  for(let j=Math.floor((e.z-r)/2);j<=Math.floor((e.z+r)/2);j++)for(let i=Math.floor((e.x-r)/2);i<=Math.floor((e.x+r)/2);i++){const L=W.bh.get(j*64+i);if(!L)continue;
    for(const b of L){if(seen.has(b))continue;seen.add(b);if(b.off||b.y1<=y0||b.y0>=y1)continue;rect(b.x0,b.z0,b.x1,b.z1);}}
  for(const d of F.doors){if(d===skipDoor||Math.abs(d.y-e.y)>2.5)continue;const s=facDoorSeg(d),ex=s[2]-s[0],ez=s[3]-s[1],L2=ex*ex+ez*ez;
    let t=((e.x-s[0])*ex+(e.z-s[1])*ez)/L2;t=t<0?0:t>1?1:t;const qx=s[0]+ex*t,qz=s[1]+ez*t;let dx=e.x-qx,dz=e.z-qz;const d2=dx*dx+dz*dz,R=r+.045;
    if(d2<R*R){const dd=Math.sqrt(d2)||1e-4;if(d2<1e-8){dx=-ez;dz=ex;}const p=R-dd,l=Math.hypot(dx,dz)||1;e.x+=dx/l*p;e.z+=dz/l*p;pen=Math.max(pen,p);moved=true;if(e.isBody===1)d.bump=(d.bump||0)+1;
      /* a body leaning on the leaf turns it on its hinge: the push, the lever arm and the leaf's direction of travel */
      if(e.isBody){const a=d.a0+d.th,na=-Math.sin(a),nz_=Math.cos(a);d.pushW=(d.pushW||0)+(-(dx/l)*na-(dz/l)*nz_)*t*Math.min(1,p*25)*(e.isBody===2?1.6:1);}}}
  return moved?pen:0;
}
/* move an entity by (dx,dz) in small steps, sliding along whatever it touches; a step that cannot be resolved is undone */
function facMove(F,e,dx,dz,r,h,su){
  const L=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(L/(r*.45)));let ok=true;
  for(let s=0;s<n;s++){const ox=e.x,oz=e.z;e.x+=dx/n;e.z+=dz/n;
    for(let it=0;it<4;it++){if(facPush(F,e,r,h,su)<.0005)break;}
    if(facPush(F,{x:e.x,y:e.y,z:e.z},r-.004,h,su)>.002){e.x=ox;e.z=oz;ok=false;
      /* try sliding along each axis alone */
      const ax={x:ox+dx/n,y:e.y,z:oz};if(facPush(F,{x:ax.x,y:e.y,z:ax.z},r-.004,h,su)<=.002){e.x=ax.x;}else{const az={x:ox,y:e.y,z:oz+dz/n};if(facPush(F,{x:az.x,y:e.y,z:az.z},r-.004,h,su)<=.002)e.z=az.z;}}}
  return ok;
}
/* the highest surface you can stand on under (x,z), at most su above the feet at y */
function facGround(F,x,z,y,su){
  const W=F.W,G=W.G,i=Math.floor(x/FC),j=Math.floor(z/FC);if(i<0||j<0||i>=FNX||j>=FNZ)return -1e9;const c=j*FNX+i,lim=y+su+1e-3;let best=-1e9;
  for(let q=0;q<G.ic[c];q++){const a=G.iv[(c*FMI+q)*2],b=G.iv[(c*FMI+q)*2+1];if(a<=lim&&a>best&&b-a>1)best=a;}
  const L=W.bh.get(Math.floor(z/2)*64+Math.floor(x/2));if(L)for(const b of L){if(b.off||b.m==='rail'||x<b.x0||x>b.x1||z<b.z0||z>b.z1)continue;if(b.y1<=lim&&b.y1>best)best=b.y1;}
  return best;
}
/* ---------- lines of sight through the voxel world and the door leaves ---------- */
function facSee(F,ax,ay,az,bx,by,bz,props){
  const W=F.W,dx=bx-ax,dy=by-ay,dz=bz-az,L=Math.hypot(dx,dy,dz);if(L<.1)return true;const st=.2,n=Math.floor(L/st),V=W.V;
  for(let i=1;i<n;i++){const t=i*st/L,x=ax+dx*t,y=ay+dy*t,z=az+dz*t,ii=(x/FC)|0,jj=(z/FC)|0,kk=(y/FVY)|0;
    if(x<0||z<0||y<0||ii>=FNX||jj>=FNZ||kk>=FNY)return false;const v=V[(jj*FNX+ii)*FNY+kk];if(v===1||(v===2&&props))return false;}
  for(const d of F.doors){if(Math.abs(d.th)>1.35)continue;const s=facDoorSeg(d);if(Math.min(ay,by)>d.y+2.26||Math.max(ay,by)<d.y)continue;
    const den=(bx-ax)*(s[3]-s[1])-(bz-az)*(s[2]-s[0]);if(Math.abs(den)<1e-6)continue;const t=((s[0]-ax)*(s[3]-s[1])-(s[1]-az)*(s[2]-s[0]))/den,u=((s[0]-ax)*(bz-az)-(s[1]-az)*(bx-ax))/den;
    if(t>0&&t<1&&u>=0&&u<=1){const yy=ay+(by-ay)*t;if(yy>d.y&&yy<d.y+2.26)return false;}}
  return true;
}
/* ---------- navigation: walkable spots every 0.5 m (floors, stairs, landings), linked to their neighbours ---------- */
function facNav(F){
  const W=F.W,G=W.G,nx=[],nz=[],ny=[],cell=new Map(),pen=[];
  const blockedAt=(x,z,y0,y1)=>{const L=W.bh.get(Math.floor(z/2)*64+Math.floor(x/2));if(L)for(const b of L){if(x<b.x0-.02||x>b.x1+.02||z<b.z0-.02||z>b.z1+.02)continue;if(b.y1>y0&&b.y0<y1)return true;}return false;};
  for(let j=0;j<FNZ;j++)for(let i=0;i<FNX;i++){const c=j*FNX+i;if(!G.ic[c])continue;const x=(i+.5)*FC,z=(j+.5)*FC,cand=new Set();
    for(let q=0;q<G.ic[c];q++)cand.add(Math.round(G.iv[(c*FMI+q)*2]*100)/100);
    const L=W.bh.get(Math.floor(z/2)*64+Math.floor(x/2));if(L)for(const b of L){if((b.m==='step'||b.m==='land'||b.m==='mstep')&&x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1)cand.add(Math.round(b.y1*100)/100);}
    const here=[];
    for(const y of cand){if(!facClear(G,c,y+.5,y+1.9))continue;if(blockedAt(x,z,y+.5,y+1.9))continue;
      /* this must be the actual ground here (not a floor hidden under a step) */
      if(Math.abs(facGround(F,x,z,y+.02,.02)-y)>.03)continue;
      here.push(nx.length);nx.push(i);nz.push(j);ny.push(y);
      let p=0;for(const [di,dj] of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=FNX||jj>=FNZ||!facClear(G,jj*FNX+ii,y+.5,y+1.9)||blockedAt((ii+.5)*FC,(jj+.5)*FC,y+.5,y+1.9))p++;}pen.push(p);}
    if(here.length)cell.set(c,here);}
  const N=nx.length,adj=[];for(let a=0;a<N;a++)adj.push([]);
  const nodeAt=(i,j,y,tol)=>{const L=cell.get(j*FNX+i);if(!L)return -1;let best=-1,bd=tol;for(const n of L){const d=Math.abs(ny[n]-y);if(d<=bd){bd=d;best=n;}}return best;};
  /* nothing thin (a railing, the edge of a crate) may stand between two linked spots */
  const segBlocked=(ax,az,bx,bz,y)=>{for(const t of[.5,.25,.75]){const x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(blockedAt(x,z,y+.5,y+1.9))return true;}return false;};
  /* links are always made in pairs, so every walk can be walked back */
  for(let a=0;a<N;a++){for(const [di,dj] of[[1,0],[0,1],[1,1],[1,-1]]){const L=cell.get((nz[a]+dj)*FNX+nx[a]+di);if(!L||nx[a]+di>=FNX||nz[a]+dj<0||nz[a]+dj>=FNZ)continue;
      for(const b of L){if(Math.abs(ny[b]-ny[a])>.55)continue;const ym=(ny[a]+ny[b])/2;
        if(di&&dj){if(nodeAt(nx[a]+di,nz[a],ym,.55)<0||nodeAt(nx[a],nz[a]+dj,ym,.55)<0)continue;}
        if(segBlocked((nx[a]+.5)*FC,(nz[a]+.5)*FC,(nx[b]+.5)*FC,(nz[b]+.5)*FC,Math.max(ny[a],ny[b])))continue;
        const d=Math.hypot(Math.hypot(di,dj)*FC,ny[b]-ny[a])*(1+.5*(pen[a]+pen[b]));adj[a].push(b,d);adj[b].push(a,d);}}}
  /* drops and climbs: the creature can jump down a ledge, or leap back up it */
  F.links=[];for(const l of W.links){const a=nodeAt(Math.floor(l.a[0]/FC),Math.floor(l.a[2]/FC),l.a[1],.3),b=nodeAt(Math.floor(l.b[0]/FC),Math.floor(l.b[2]/FC),l.b[1],.3);
    if(a<0||b<0)continue;adj[a].push(b,3);adj[b].push(a,5);F.links.push({a,b});(F.linkSet||(F.linkSet=new Set())).add(a*65536+b);F.linkSet.add(b*65536+a);}
  /* door cells: the creature has to open or smash the door */
  const doorOf=new Int16Array(N).fill(-1);F.doors.forEach((d,di)=>{for(let j=Math.round(d.z0/FC);j<Math.round(d.z1/FC);j++)for(let i=Math.round(d.x0/FC);i<Math.round(d.x1/FC);i++){const L=cell.get(j*FNX+i);if(L)for(const n of L)doorOf[n]=di;}});
  F.nav={nx,nz,ny,cell,adj,N,pen,doorOf,nodeAt};
}
function facNodeNear(F,x,y,z){const N=F.nav,i=Math.floor(x/FC),j=Math.floor(z/FC);let best=-1,bd=1e9;
  for(let r=0;r<=3&&best<0;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const L=N.cell.get((j+dj)*FNX+(i+di));if(!L)continue;
    for(const n of L){const d=Math.abs(N.ny[n]-y)*2+Math.hypot(di,dj)*FC;if(Math.abs(N.ny[n]-y)<1.2&&d<bd){bd=d;best=n;}}}return best;}
function facNP(F,n){const N=F.nav;return [(N.nx[n]+.5)*FC,N.ny[n],(N.nz[n]+.5)*FC];}
/* A*: the shortest walk from node a to node b */
function facPath(F,a,b,maxN,noLinks){
  const N=F.nav;if(a<0||b<0)return null;if(a===b)return [a];
  const g=F.pg||(F.pg=new Float32Array(N.N)),from=F.pf||(F.pf=new Int32Array(N.N)),mark=F.pm||(F.pm=new Uint32Array(N.N));F.pgen=(F.pgen||0)+1;const gen=F.pgen;
  const cl=F.pc||(F.pc=new Uint32Array(N.N));
  const bx=(N.nx[b]+.5)*FC,bz=(N.nz[b]+.5)*FC,by=N.ny[b],hh=n=>Math.hypot((N.nx[n]+.5)*FC-bx,(N.nz[n]+.5)*FC-bz,N.ny[n]-by);
  const heap=[],push=(n,f)=>{heap.push([f,n]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  mark[a]=gen;g[a]=0;from[a]=-1;push(a,hh(a));let it=0;
  while(heap.length){const [f,n]=pop();if(n===b)break;if(cl[n]===gen)continue;cl[n]=gen;if(++it>(maxN||30000))return null;const gn=g[n],A=N.adj[n];
    for(let k=0;k<A.length;k+=2){const m=A[k],ng=gn+A[k+1];if(noLinks&&F.linkSet&&F.linkSet.has(n*65536+m))continue;if(mark[m]!==gen||ng<g[m]){mark[m]=gen;g[m]=ng;from[m]=n;push(m,ng+hh(m));}}}
  if(mark[b]!==gen)return null;const out=[];for(let n=b;n>=0;n=from[n]){out.push(n);if(n===a)break;}out.reverse();return out;
}
/* can a body walk straight from p to q (same storey, nothing in the way)? */
function facWalkLine(F,ax,ay,az,bx,by,bz){
  const N=F.nav,BH=F.W.bh,L=Math.hypot(bx-ax,bz-az);if(L<.05)return true;const n=Math.ceil(L/.2),px=-(bz-az)/L*.26,pz=(bx-ax)/L*.26;let y=ay;
  for(let i=1;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
    for(const s of[0,1,-1]){const xx=x+px*s,zz=z+pz*s,c=Math.floor(zz/FC)*FNX+Math.floor(xx/FC),Lc=N.cell.get(c);if(!Lc)return false;let ok=false;
      for(const m of Lc)if(Math.abs(N.ny[m]-y)<.56){if(s===0)y=N.ny[m];ok=true;break;}if(!ok)return false;
      /* railings and the edges of props are thinner than a cell: test the body against them directly */
      const B=BH.get(Math.floor(zz/2)*64+Math.floor(xx/2));if(B)for(const b of B){if(b.off||xx<b.x0||xx>b.x1||zz<b.z0||zz>b.z1)continue;if(b.y1>y+.5&&b.y0<y+1.9)return false;}}}
  return Math.abs(y-by)<.6;
}
/* ---------- doors: heavy leaves on a hinge, swinging on a damped spring ---------- */
function facDoorGeo(F,M,d){
  const w=d.w,h=2.26,t=.05,g=new T.BufferGeometry(),P=[],Nn=[],Uv=[],I=[],Hd=[];let n=0;
  const quad=(p,nrm,uv,hd)=>{for(let i=0;i<4;i++){P.push(...p[i]);Nn.push(...nrm);Uv.push(...uv[i]);Hd.push(hd?1:0);}I.push(n,n+1,n+2,n,n+2,n+3);n+=4;};
  /* the leaf runs along +x from the hinge; both faces map the whole door texture */
  quad([[0,0,t/2],[w,0,t/2],[w,h,t/2],[0,h,t/2]],[0,0,1],[[0,0],[1,0],[1,1],[0,1]]);
  quad([[w,0,-t/2],[0,0,-t/2],[0,h,-t/2],[w,h,-t/2]],[0,0,-1],[[0,0],[1,0],[1,1],[0,1]]);
  quad([[w,0,t/2],[w,0,-t/2],[w,h,-t/2],[w,h,t/2]],[1,0,0],[[0,0],[.02,0],[.02,1],[0,1]]);
  quad([[0,0,-t/2],[0,0,t/2],[0,h,t/2],[0,h,-t/2]],[-1,0,0],[[0,0],[.02,0],[.02,1],[0,1]]);
  quad([[0,h,t/2],[w,h,t/2],[w,h,-t/2],[0,h,-t/2]],[0,1,0],[[0,0],[1,0],[1,.02],[0,.02]]);
  /* lever handles on both faces, part of the same mesh (one draw per door) */
  const huv=[[.3,.8],[.31,.8],[.31,.81],[.3,.81]];
  const box=(cx,cy,cz,hx,hy,hz)=>{for(const [ax,sg] of[[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]]){const nrm=[0,0,0];nrm[ax]=sg;const c=[cx,cy,cz],e=[hx,hy,hz],o=[(ax+1)%3,(ax+2)%3],p=[];
      for(const [a,b] of[[-1,-1],[1,-1],[1,1],[-1,1]]){const v=c.slice();v[ax]+=sg*e[ax];v[o[0]]+=a*e[o[0]];v[o[1]]+=b*e[o[1]];p.push(v);}
      /* keep the winding facing out */const e1=[p[1][0]-p[0][0],p[1][1]-p[0][1],p[1][2]-p[0][2]],e2=[p[2][0]-p[0][0],p[2][1]-p[0][1],p[2][2]-p[0][2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
      if(cr[0]*nrm[0]+cr[1]*nrm[1]+cr[2]*nrm[2]<0)p.reverse();quad(p,nrm,huv,1);}};
  for(const sd of[1,-1]){box(w-.1,1.02,sd*(t/2+.008),.028,.028,.008);box(w-.155,1.02,sd*(t/2+.035),.065,.011,.011);box(w-.1,1.02,sd*(t/2+.02),.01,.01,.014);box(w-.1,1.3,sd*(t/2+.008),.024,.024,.009);}
  g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(Nn,3));g.setAttribute('uv',new T.Float32BufferAttribute(Uv,2));g.setIndex(I);
  /* light baked once, as it is when the door is shut */
  const col=FDS[d.style]||FDS.grey,cnt=n,tn=new Uint8Array(cnt*4),bk=new Uint8Array(cnt*4),b2=new Uint8Array(cnt*4),ld=new Int8Array(cnt*4),o=new Float32Array(10),ca=Math.cos(d.a0),sa=Math.sin(d.a0);
  for(let i=0;i<cnt;i++){const lx=P[i*3],ly=P[i*3+1],lz=P[i*3+2],wx=d.hx+lx*ca-lz*sa,wz=d.hz+lx*sa+lz*ca,wy=d.y+ly,nxl=Nn[i*3],nzl=Nn[i*3+2],wnx=nxl*ca-nzl*sa,wnz=nxl*sa+nzl*ca;
    facBakeVert(F.W,wx,wy,wz,wnx,Nn[i*3+1],wnz,wx+wnx*.08+(d.hx+ca*w/2-wx)*.05,wy+Nn[i*3+1]*.08+(d.y+1.1-wy)*.05,wz+wnz*.08+(d.hz+sa*w/2-wz)*.05,o,0);
    if(Hd[i]){const br=d.style==='green'||d.style==='blue';tn[i*4]=br?215:200;tn[i*4+1]=br?168:198;tn[i*4+2]=br?78:190;tn[i*4+3]=br?230:200;}else{tn[i*4]=col[0]*255;tn[i*4+1]=col[1]*255;tn[i*4+2]=col[2]*255;tn[i*4+3]=110;}
    for(let k=0;k<3;k++){bk[i*4+k]=Math.round(Math.sqrt(Math.min(1,o[k]/4))*255);b2[i*4+k]=Math.round(Math.sqrt(Math.min(1,o[3+k]/4))*255);}bk[i*4+3]=b2[i*4+3]=255;
    const l=Math.hypot(o[6],o[7],o[8]);if(l>1e-5){/* back into the leaf's own frame, since the mesh turns it */const gx=o[6]/l,gz=o[8]/l;ld[i*4]=Math.round((gx*ca+gz*sa)*127);ld[i*4+1]=Math.round(o[7]/l*127);ld[i*4+2]=Math.round((-gx*sa+gz*ca)*127);ld[i*4+3]=Math.round(Math.min(1,l/Math.max(o[9],1e-5))*127);}}
  g.setAttribute('tint',new T.BufferAttribute(tn,4,true));g.setAttribute('bake',new T.BufferAttribute(bk,4,true));g.setAttribute('bake2',new T.BufferAttribute(b2,4,true));g.setAttribute('ldir',new T.BufferAttribute(ld,4,true));
  g.computeBoundingSphere();
  const leaf=new T.Mesh(g,M.door);leaf.position.set(d.hx,d.y,d.hz);leaf.rotation.y=-d.a0;return leaf;
}
function facDoorsInit(F,M){
  F.doors=[];
  const R=facRng(4242);
  for(const od of F.W.doors){const alongZ=(od.x1-od.x0)<(od.z1-od.z0),d={k:od.k,y:FCY[od.k],x0:od.x0,z0:od.z0,x1:od.x1,z1:od.z1,style:od.style||'grey',w:.96,th:0,om:0,tgt:0,stiff:16,lock:!!od.lock};
    const hingeLo=od.hinge!=null?!!od.hinge:R()<.5;
    if(alongZ){d.hx=(od.x0+od.x1)/2;d.hz=hingeLo?od.z0+.02:od.z1-.02;d.a0=hingeLo?Math.PI/2:-Math.PI/2;}
    else{d.hz=(od.z0+od.z1)/2;d.hx=hingeLo?od.x0+.02:od.x1-.02;d.a0=hingeLo?0:Math.PI;}
    /* which way is "away" for each side: the normal of the closed leaf */
    d.nx=-Math.sin(d.a0);d.nz=Math.cos(d.a0);d.cx=(od.x0+od.x1)/2;d.cz=(od.z0+od.z1)/2;
    d.mesh=facDoorGeo(F,M,d);F.scene.add(d.mesh);F.doors.push(d);}
  /* some doors start open, a few ajar */
  for(const d of F.doors){const r=R();if(r<.3){d.th=d.tgt=(R()<.5?1:-1)*1.55;}else if(r<.42){d.th=d.tgt=(R()<.5?1:-1)*.35;}}
}
/* which side of door d is point (x,z) on (+1 / -1) */
function facDoorSide(d,x,z){return (x-d.cx)*d.nx+(z-d.cz)*d.nz>=0?1:-1;}
/* open a door away from whoever opens it; returns false if locked */
function facDoorOpen(F,d,x,z,fast){if(d.lock)return false;const side=facDoorSide(d,x,z);d.tgt=-side*1.58;d.stiff=fast?44:13;d.damp=fast?7:6.2;if(!fast)facSndCreak(F,d,.7+Math.random()*.4);else facSndSlam(F,d,1);d.opening=1;return true;}
function facDoorClose(F,d,fast){d.tgt=0;d.stiff=fast?55:12;d.damp=fast?6:6;d.closing=fast?2:1;if(!fast)facSndCreak(F,d,.5);}
/* does the leaf at angle th touch a body */
function facDoorHits(F,d,th,ent,r){const a=d.a0+th,ex=Math.cos(a)*d.w,ez=Math.sin(a)*d.w;if(Math.abs(ent.y-d.y)>2)return false;
  let t=((ent.x-d.hx)*ex+(ent.z-d.hz)*ez)/(d.w*d.w);t=t<0?0:t>1?1:t;const qx=d.hx+ex*t,qz=d.hz+ez*t;return Math.hypot(ent.x-qx,ent.z-qz)<r+.05;}
function facDoorsTick(F,dt){
  const pl=F.pl,dm=F.dm;
  for(const d of F.doors){const k=d.stiff||14,c=d.damp||6.5;
    /* pushed by a body: the leaf swings freely (heavy and damped) wherever it is pushed */
    if(d.pushW){if(!d.lock){d.om+=clamp(d.pushW,-1.5,1.5)*14*dt;
        /* a door already swinging open the same way keeps going; otherwise it hangs where it is pushed */
        if(!(d.opening&&Math.sign(d.tgt-d.th)===Math.sign(d.pushW))){d.tgt=clamp(d.th+d.om*.12,-1.62,1.62);d.stiff=6;d.damp=7;d.opening=0;}d.pushed=F.t;}d.pushW=0;}
    if(d.opening&&Math.abs(d.tgt-d.th)<.05)d.opening=0;
    if(Math.abs(d.tgt-d.th)<.0015&&Math.abs(d.om)<.003){d.om=0;continue;}
    const n=dt>1/45?2:1,h=dt/n;
    for(let s=0;s<n;s++){d.om+=(k*(d.tgt-d.th)-c*d.om)*h;let nt=d.th+d.om*h;nt=Math.max(-1.62,Math.min(1.62,nt));
      /* the leaf stops against a body rather than pushing through it */
      if(facDoorHits(F,d,nt,pl,.3)&&!facDoorHits(F,d,d.th,pl,.3)){d.om*=-.15;if(Math.abs(d.om)>.3)facSndBump(F,d);break;}
      if(dm.vis!==false&&dm.on&&facDoorHits(F,d,nt,dm,.32)&&!facDoorHits(F,d,d.th,dm,.32)){d.om*=-.1;break;}
      /* shutting: it latches as it reaches the frame */
      if(d.tgt===0&&((d.th>0&&nt<=0)||(d.th<0&&nt>=0))){const sp=Math.abs(d.om);nt=0;d.om=0;if(sp>4)facSndSlam(F,d,Math.min(1.3,sp/7));else facSndLatch(F,d);facNoise(F,d.cx,d.y,d.cz,sp>4?16:5);d.closing=0;}
      if(Math.abs(nt)>=1.62&&Math.abs(d.om)>2){facSndBang(F,d,Math.min(1,Math.abs(d.om)/9));d.om*=-.25;}
      d.th=nt;}
    d.mesh.rotation.y=-(d.a0+d.th);}
}
