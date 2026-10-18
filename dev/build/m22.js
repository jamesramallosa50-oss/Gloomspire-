/* ===== BUILD 3.15: THE FACILITY (Horror) — part 1: the plan and the world builder =====
   A three-level concrete-and-plaster facility, built from a hand-made plan:
     level 0 (top, y=8)    administration: yellow and red offices, a server hall, a gallery over the atrium
     level 1 (middle, y=4) service: cyan concrete corridors, boiler and storage rooms, the atrium hall (start here)
     level 2 (bottom, y=0) basement: wet concrete, pumps, and the freight lift that is the way out
   The world is a grid of 0.5 m columns. Each column holds the open (air) intervals along y; floors, ceilings and walls
   come from where air meets solid, so walls, slabs, ledges and door frames are always closed and never paper-thin.
   Stairs, railings and props are boxes on top of that grid. Everything that collides is either a grid column or a box. */
const FCY=[8,4,0],FC=.5,FNX=96,FNZ=80,FVY=.25,FNY=52;
const FK={con:1,cro:2,bsm:3,off:4,srv:5,gal:6,hal:7,swc:8,swy:9,frm:10,lift:11};
const FKN=['','con','cro','bsm','off','srv','gal','hal','swc','swy','frm','lift'];
function facRng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
/* ---------- the plan ---------- */
function facPlan(){
  const W={open:[],kinds:[],rooms:[],doors:[],boxes:[],parts:[],lights:[],vents:[],links:[],fuse:[[],[],[]],bat:[],signs:[],rails:[],stairs:[]};
  const kindR=(k,x0,z0,x1,z1,kd)=>W.kinds.push({k,x0,z0,x1,z1,kd:FK[kd]});
  const room=(k,x0,z0,x1,z1,kd,h,nm)=>{const r={k,x0,z0,x1,z1,kd,h,nm};W.rooms.push(r);W.open.push({x0,z0,x1,z1,y0:FCY[k],y1:FCY[k]+h});kindR(k,x0,z0,x1,z1,kd);return r;};
  const door=(k,x0,z0,x1,z1,o)=>{W.open.push({x0,z0,x1,z1,y0:FCY[k],y1:FCY[k]+2.3});kindR(k,x0,z0,x1,z1,'frm');const d=Object.assign({k,x0,z0,x1,z1},o||{});W.doors.push(d);return d;};
  const arch=(k,x0,z0,x1,z1,h,kd)=>{W.open.push({x0,z0,x1,z1,y0:FCY[k],y1:FCY[k]+h});kindR(k,x0,z0,x1,z1,kd);};
  const hole=(k,x0,z0,x1,z1)=>W.open.push({x0,z0,x1,z1,y0:FCY[k+1]+1,y1:FCY[k]+1,hole:1});
  /* a box that collides (and blocks light when big): steps, landings, fills */
  const box=(x0,y0,z0,x1,y1,z1,m,o)=>{const b=Object.assign({x0,y0,z0,x1,y1,z1,m},o||{});W.boxes.push(b);return b;};
  /* a railing between two points at floor height y: posts, a top rail and a middle rail; collides as a thin wall 1.05 m tall */
  const rail=(x0,z0,x1,z1,y,y2)=>{W.rails.push({x0,z0,x1,z1,y,y2:y2==null?y:y2});};
  /* a switchback stairwell: landings at each level (zone A, with the door), two flights per storey and a well between them */
  const sw=(x0,z0,w1,wg,kHi,kLo,kd,dx)=>{
    const X1=x0+2*w1+wg,zA=z0+2,zF=zA+3,zB=zF+1.5,xw0=x0+w1,xw1=x0+w1+wg;
    for(let k=kHi;k<=kLo;k++){room(k,x0,z0,X1,zA,kd,3.6,'stair landing');kindR(k,x0,zA,X1,zB,kd);
      if(dx>0)door(k,X1,z0+.5,X1+.5,z0+1.5,{style:kd==='swy'?'blue':'teal'});else door(k,x0-.5,z0+.5,x0,z0+1.5,{style:kd==='swy'?'blue':'teal'});}
    W.open.push({x0,z0:zA,x1:X1,z1:zB,y0:FCY[kLo],y1:FCY[kHi]+3.6});
    for(let k=kLo;k>kHi;k--){const base=FCY[k],bot=k===kLo;
      for(let i=0;i<10;i++){const za=zA+.3*i,top=base+.2*(i+1);box(x0,bot?base:top-.32,za,xw0,top,za+.3,'step',{stair:1});}
      box(x0,bot?base:base+2-.32,zF,X1,base+2,zB,'land',{stair:1});
      for(let i=0;i<10;i++){const zb=zF-.3*i,top=base+2+.2*(i+1);box(xw1,bot?base:top-.32,zb-.3,X1,top,zb,'step',{stair:1});}
      /* railings: along both inner edges of the flights, and across the well at the mid landing */
      rail(xw0,zA,xw0,zF,base,base+2);rail(xw1,zF,xw1,zA,base+2,base+4);rail(xw0,zF,xw1,zF,base+2);
      W.stairs.push({x0,z0:zA,x1:X1,z1:zF,y0:base,y1:base+4,kd});}
    for(let k=kHi;k<=kLo;k++){if(k===kHi)rail(x0,zA,xw1,zA,FCY[k]);else rail(xw0,zA,xw1,zA,FCY[k]);}
    for(let k=kHi;k<=kLo;k++)W.lights.push({k,x:(x0+X1)/2,z:z0+1,ax:'x',col:kd==='swy'?'warm':'cyan'});
    for(let k=kLo;k>kHi;k--)W.lights.push({k,x:(x0+X1)/2,z:zB-.06,y:FCY[k]+2+2.3,ax:'x',col:kd==='swy'?'warm':'cyan',dim:.8,wall:1});
    return {x0,z0,X1,zA,zF,zB};
  };
  /* a straight stair inside a corridor rect, from level k down to level k+1, going in direction d ('+z','-z') */
  const sst=(x0,x1,zTop,d,k,kdTop,kdBot)=>{const base=FCY[k+1],n=20;
    const zs=i=>d>0?zTop+.3*i:zTop-.3*i;
    for(let i=0;i<n-1;i++){const a=zs(i),b=zs(i+1),top=FCY[k]-.2*(i+1);box(x0,base,Math.min(a,b),x1,top,Math.max(a,b),'step',{stair:1});}
    const zEnd=zs(n);W.stairs.push({x0,z0:Math.min(zTop,zEnd),x1,z1:Math.max(zTop,zEnd),y0:base,y1:FCY[k]});
    return zEnd;
  };
  const L=(k,x,z,ax,col,o)=>W.lights.push(Object.assign({k,x,z,ax,col},o||{}));
  const fuse=(k,x,z,y)=>W.fuse[k].push({k,x,z,y:y==null?FCY[k]+.9:y});
  const bat=(k,x,z,y)=>W.bat.push({k,x,z,y:y==null?FCY[k]+.9:y});
  const vent=(k,x,z)=>W.vents.push({k,x,z});
  const P=(t,k,x,z,o)=>W.parts.push(Object.assign({t,k,x,z},o||{}));
  W.P=P;

  /* ================= LEVEL 1 (y=4): SERVICE — start here ================= */
  const SWB=sw(2,2,1.5,1,0,2,'swc',1);
  room(1,6.5,2,38,4,'con',3,'C1');
  room(1,38.5,2,46,9,'cro',3,'LOCKERS');door(1,38,2.5,38.5,3.5,{style:'grey'});
  room(1,8,4.5,14,10,'cro',2.8,'START');door(1,10.5,4,11.5,4.5,{style:'teal',hinge:0});
  room(1,14.5,4.5,22,12,'cro',3.4,'BOILER');door(1,17,4,18,4.5,{style:'grey'});
  room(1,22.5,4.5,35.5,12,'cro',3.2,'STORAGE');door(1,29,4,30,4.5,{style:'teal'});door(1,35.5,8,36,9,{style:'teal'});
  room(1,36,4,38,28.5,'con',3,'C2');
  room(1,8,10.5,10,26.5,'con',3,'C4');door(1,8.5,10,9.5,10.5,{style:'teal'});
  room(1,10.5,12.5,16,26,'cro',3.4,'GEN');door(1,10,15,10.5,16,{style:'grey'});door(1,16,22,16.5,23,{style:'grey'});
  room(1,16.5,12.5,35.5,26,'hal',3.4,'HALL');door(1,19,12,20,12.5,{style:'grey'});door(1,35.5,18,36,19,{style:'teal'});arch(1,24,26,27,26.5,3,'hal');
  room(1,8,26.5,38,28.5,'con',3,'C3');
  const SWA=sw(38.5,24,1.5,2,0,1,'swy',-1);
  room(1,11,29,16,34,'cro',3,'COLLAPSE');door(1,13,28.5,14,29,{style:'grey'});hole(1,12.5,30.5,14.5,32.5);
  /* stair C: a straight concrete stair inside the corridor, down to the basement */
  W.open.push({x0:8,z0:28.5,x1:10,z1:31.5,y0:0,y1:7});W.open.push({x0:8,z0:31.5,x1:10,z1:34.5,y0:0,y1:5.2});
  kindR(1,8,28.5,10,34.5,'con');kindR(2,8,28.5,10,34.5,'bsm');
  sst(8,10,28.5,1,1,'con','bsm');

  /* ================= LEVEL 0 (y=8): ADMINISTRATION ================= */
  room(0,6.5,2,22,4.5,'off',3,'Y1');
  room(0,6.5,5,14,12,'off',3.2,'OFFICE 1');door(0,9,4.5,10,5,{style:'blue'});
  room(0,14.5,5,22,12,'off',3.2,'OFFICE 2');door(0,18,4.5,19,5,{style:'blue'});door(0,14,9,14.5,10,{style:'blue'});
  room(0,22.5,2,35.5,12,'srv',3.4,'SERVER');door(0,22,2.5,22.5,3.5,{style:'blue'});door(0,28,12,29,12.5,{style:'blue'});
  room(0,16.5,12.5,35.5,26,'gal',3.6,'GALLERY');hole(0,20,16,35.5,26);door(0,18,12,19,12.5,{style:'blue'});
  room(0,6.5,12.5,16,19.5,'off',3.2,'BREAK');door(0,9,12,10,12.5,{style:'blue'});door(0,16,13.5,16.5,14.5,{style:'blue'});
  room(0,6.5,20,16,26,'off',3.2,'ARCHIVE');door(0,10,19.5,11,20,{style:'blue'});door(0,16,23,16.5,24,{style:'blue'});
  room(0,36,2,38,28.5,'off',3,'Y2');door(0,35.5,6,36,7,{style:'blue'});door(0,35.5,13.5,36,14.5,{style:'blue'});
  room(0,6.5,26.5,38,28.5,'off',3,'Y4');door(0,10,26,11,26.5,{style:'blue'});
  /* the atrium: a metal stair from the hall floor up to the gallery, railings along the balcony with one broken gap */
  for(let i=0;i<20;i++){const zb=22-.3*i,top=4+.2*(i+1);box(20,4,zb-.3,21.5,top,zb,'mstep',{stair:1});}
  W.stairs.push({x0:20,z0:16,x1:21.5,z1:22,y0:4,y1:8});
  rail(21.5,22,21.5,16.3,4,8);rail(20,22,20,16.3,4,8);
  rail(21.5,16,30,16,8);rail(32,16,35.5,16,8);rail(20,16,20,26,8);
  W.links.push({a:[31,8,15.4],b:[31,4,17.2],t:'drop'});

  /* ================= LEVEL 2 (y=0): BASEMENT ================= */
  room(2,6.5,2,40,4,'bsm',3,'B1');
  room(2,8,4.5,18,14,'bsm',3.6,'PUMPS');door(2,11,4,12,4.5,{style:'grey'});
  room(2,18.5,4,20.5,36.5,'bsm',3,'B2');
  room(2,21,8,30,16,'bsm',3.2,'FLOODED');door(2,20.5,11,21,12,{style:'teal'});
  room(2,30.5,4.5,40,14,'bsm',3.2,'MAINTENANCE');door(2,34,4,35,4.5,{style:'grey'});door(2,30,10,30.5,11,{style:'grey'});
  room(2,30.5,14.5,32.5,19.5,'bsm',3,'B5');door(2,31,14,32,14.5,{style:'teal'});door(2,31,19.5,32,20,{style:'teal'});
  room(2,21,20,33,30,'lift',3.6,'LIFT HALL');door(2,20.5,24,21,25,{style:'teal'});
  room(2,33.5,22.5,37.5,27.5,'lift',3,'LIFT CAR');arch(2,33,23.5,33.5,26.5,2.8,'lift');
  room(2,26,30.5,28,34.5,'bsm',3,'B4');door(2,26.5,30,27.5,30.5,{style:'teal'});
  room(2,8,34.5,32,36.5,'bsm',3,'B3');
  room(2,11,29,16,34,'bsm',3,'UNDER');door(2,13,34,14,34.5,{style:'grey'});
  W.links.push({a:[13.5,4,30.1],b:[13.5,0,31.5],t:'drop'});
  W.liftDoor={x0:33,z0:23.5,x1:33.5,z1:26.5,k:2};W.lift={x:35.5,z:25,k:2};W.breaker={x:27,z:20.08,k:2,fx:0,fz:1};
  W.start={x:11,z:8.2,k:1,yaw:0};W.peek={x:6.6,z:3,k:1};
  facProps(W);

  /* ---------- lights (tubes on the ceiling; 'dead' ones are dark, 'dim' ones are weak) ---------- */
  for(const x of[9,15,21,27,33])L(1,x,3,'x','cyan',{dead:x===27});
  for(const z of[7,13,19,25])L(1,37,z,'z','cyan',{dead:z===13});
  for(const x of[12,18,24,30,36])L(1,x,27.5,'z','cyan',{dead:x===24});
  for(const z of[14,20])L(1,9,z,'z','cyan');
  L(1,11,7,'x','cyan',{dim:.8});L(1,16.5,8,'z','cyan');L(1,20.5,8,'z','cyan',{dead:1});
  L(1,26,7,'x','cyan');L(1,32,7,'x','cyan',{dead:1});L(1,26,10,'x','cyan');L(1,32,10,'x','cyan');
  L(1,13,16,'z','cyan');L(1,13,22,'z','cyan',{dim:.6});
  L(1,18.2,14.2,'x','cyan');L(1,18.2,22,'z','cyan');L(1,24,14.2,'x','cyan');L(1,30,14.2,'x','cyan',{dead:1});L(0,30,20.5,'x','cyan',{y:10.2,hang:1,dim:1.3});
  L(0,26,19,'x','warm',{y:10.9,hang:1});L(0,32,22,'x','warm',{y:10.9,hang:1,dim:.7});L(0,24,24,'x','cyan',{y:10.6,hang:1,dim:1.2});
  L(1,35.38,22.5,'z','cyan',{wall:1,y:6.6});L(1,28,25.88,'x','cyan',{wall:1,y:6.6});L(1,22,25.88,'x','cyan',{wall:1,y:6.6,dim:.8});
  L(1,40,5.5,'x','cyan');L(1,44,5.5,'x','cyan',{dead:1});L(1,13.5,31.5,'x','cyan',{dim:.45});
  L(1,9,30,'z','cyan');L(2,9,33,'z','cyan',{y:4.95,dim:.7});
  /* level 0: warm office light */
  for(const x of[9,15,20])L(0,x,3.25,'x','warm',{dead:x===15});
  L(0,10,7,'x','warm');L(0,10,10,'x','warm',{dead:1});L(0,18,7,'x','warm');L(0,18,10,'x','warm');
  for(const x of[25,29.5,34])L(0,x,6.8,'x','warm',{dead:x===29.5});for(const x of[26,32])L(0,x,3.25,'x','warm');for(const x of[25,31])L(0,x,10.6,'x','warm',{dead:x===31});
  for(const x of[19,25,31])L(0,x,14.2,'x','warm');L(0,18.2,20,'z','warm');L(0,18.2,24.5,'z','warm',{dead:1});
  L(0,10,15,'x','warm');L(0,13.5,17.5,'x','warm',{dim:.7});L(0,9,23,'x','warm');L(0,13.5,23,'x','warm',{dead:1});
  for(const z of[6,12,18,24])L(0,37,z,'z','warm',{dead:z===18});
  for(const x of[10,16,22,28,34])L(0,x,27.5,'x','warm',{dead:x===22});
  /* level 2: sparse cold light, a few dead */
  for(const x of[9,15,21,27,33,39])L(2,x,3,'x','cyan',{dead:x===21||x===33});
  L(2,11,8,'x','cyan');L(2,15,11,'x','cyan',{dim:.6});L(2,11,12,'x','cyan',{dead:1});
  for(const z of[8,14,20,26,32])L(2,19.5,z,'z','cyan',{dead:z===14});
  L(2,25,11,'x','cyan',{dim:.7});L(2,25,14.5,'x','cyan',{dead:1});
  L(2,34,8,'x','cyan');L(2,37,11,'x','cyan',{dead:1});L(2,31.5,17,'z','cyan',{dim:.7});
  L(2,25,22.5,'x','cyan');L(2,30,22.5,'x','cyan');L(2,25,27.5,'x','cyan',{dead:1});L(2,30,27.5,'x','cyan');
  L(2,35.5,25,'z','cyan',{dim:.8});L(2,27,32.5,'z','cyan',{dim:.7});
  for(const x of[12,24,30])L(2,x,35.5,'x','cyan',{dead:x===24});
  /* red emergency lamps over the lift and in the basement corridors */
  L(2,27,20.3,'x','red',{wall:1,y:3.1});L(2,33.2,25,'z','red',{wall:1,y:2.95});L(2,19.5,35.6,'x','red',{wall:1,y:2.6,dim:.7});
  L(2,21.3,28.5,'z','red',{wall:1,y:2.9,dim:.8});L(2,20.35,12,'z','red',{wall:1,y:2.6,dim:.7});L(2,6.7,3.4,'z','red',{wall:1,y:2.6,dim:.7});L(2,31.5,19.2,'z','red',{wall:1,y:2.6,dim:.6});L(2,9.85,33,'z','red',{wall:1,y:2.4,dim:.6});L(2,27,34.3,'x','red',{wall:1,y:2.5,dim:.6});

  /* ---------- ceiling vents it can drop from ---------- */
  vent(1,24,3);vent(1,37,16);vent(1,20,27.5);vent(1,9,18);vent(0,13,3.25);vent(0,37,20.5);vent(0,26,27.5);vent(2,24,3);vent(2,19.5,17);vent(2,24,35.5);
  /* ---------- where fuses can be (one per level is chosen) and batteries ---------- */
  /* fuse spots and batteries are placed with the props (facProps), on tables, shelves and crates */
  return W;
}
/* ---------- the column grid: open intervals per 0.5 m column, the kind of space per level, and a voxel copy for light and sight ---------- */
const FMI=6;
function facGrid(W){
  const N=FNX*FNZ,iv=new Float32Array(N*FMI*2),ic=new Uint8Array(N),tmp=new Array(N);
  const ci=v=>Math.round(v/FC);
  for(const o of W.open){const i0=Math.max(0,ci(o.x0)),i1=Math.min(FNX,ci(o.x1)),j0=Math.max(0,ci(o.z0)),j1=Math.min(FNZ,ci(o.z1));
    for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++){const c=j*FNX+i;(tmp[c]||(tmp[c]=[])).push([o.y0,o.y1]);}}
  for(let c=0;c<N;c++){const a=tmp[c];if(!a)continue;a.sort((p,q)=>p[0]-q[0]);const m=[];
    for(const p of a){const l=m[m.length-1];if(l&&p[0]<=l[1]+1e-4)l[1]=Math.max(l[1],p[1]);else m.push([p[0],p[1]]);}
    ic[c]=Math.min(FMI,m.length);for(let q=0;q<ic[c];q++){iv[(c*FMI+q)*2]=m[q][0];iv[(c*FMI+q)*2+1]=m[q][1];}}
  const kind=[0,1,2].map(()=>new Uint8Array(N));
  for(const r of W.kinds){const i0=Math.max(0,ci(r.x0)),i1=Math.min(FNX,ci(r.x1)),j0=Math.max(0,ci(r.z0)),j1=Math.min(FNZ,ci(r.z1)),K=kind[r.k];
    for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++)K[j*FNX+i]=r.kd;}
  const G={iv,ic,kind,N};W.G=G;W.PC=new Map();
  /* boxes in a 2 m hash for fast lookups */
  W.bh=new Map();for(const b of W.boxes)facHashAdd(W.bh,b);
  facVox(W);
  return G;
}
function facHashAdd(H,b){for(let j=Math.floor(b.z0/2);j<=Math.floor((b.z1-1e-4)/2);j++)for(let i=Math.floor(b.x0/2);i<=Math.floor((b.x1-1e-4)/2);i++){const k=j*64+i;let a=H.get(k);if(!a)H.set(k,a=[]);a.push(b);}}
function facHashGet(H,x,z){return H.get(Math.floor(z/2)*64+Math.floor(x/2));}
/* is (x,y,z) inside the air of its column */
function facAir(W,x,y,z){const i=Math.floor(x/FC),j=Math.floor(z/FC);if(i<0||j<0||i>=FNX||j>=FNZ)return false;const c=j*FNX+i,G=W.G;
  for(let q=0;q<G.ic[c];q++){const a=G.iv[(c*FMI+q)*2],b=G.iv[(c*FMI+q)*2+1];if(y>=a&&y<=b)return true;}return false;}
/* is the whole span [ya,yb] of column c inside one air interval */
function facClear(G,c,ya,yb){for(let q=0;q<G.ic[c];q++){const a=G.iv[(c*FMI+q)*2],b=G.iv[(c*FMI+q)*2+1];if(ya>=a-1e-4&&yb<=b+1e-4)return true;}return false;}
/* the kind of space at a column for the level whose band holds y */
function facBand(y){return y>=FCY[0]-.001?0:y>=FCY[1]-.001?1:2;}
function facKindAt(W,c,y){const b=facBand(y),K=W.G.kind;let k=K[b][c];if(!k){for(const d of[1,-1,2,-2]){const bb=b+d;if(bb>=0&&bb<3&&K[bb][c]){k=K[bb][c];break;}}}return k||1;}
/* a voxel copy of the solid world (grid + big boxes), 0.5 m across and 0.25 m tall, for the light bake and lines of sight */
function facVox(W){
  const G=W.G,V=new Uint8Array(FNX*FNZ*FNY);
  for(let c=0;c<G.N;c++){const o=c*FNY;for(let y=0;y<FNY;y++){const yy=(y+.5)*FVY;let air=false;for(let q=0;q<G.ic[c];q++){if(yy>=G.iv[(c*FMI+q)*2]&&yy<=G.iv[(c*FMI+q)*2+1]){air=true;break;}}V[o+y]=air?0:1;}}
  for(const b of W.boxes){if(b.noVox)continue;const i0=Math.max(0,Math.round(b.x0/FC)),i1=Math.min(FNX,Math.round(b.x1/FC)),j0=Math.max(0,Math.round(b.z0/FC)),j1=Math.min(FNZ,Math.round(b.z1/FC)),y0=Math.max(0,Math.round(b.y0/FVY)),y1=Math.min(FNY,Math.round(b.y1/FVY));
    for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++){const o=(j*FNX+i)*FNY;for(let y=y0;y<y1;y++)V[o+y]=Math.max(V[o+y],b.m==='prop'?2:1);}}
  W.V=V;
}
function facVoxAt(W,x,y,z){const i=Math.floor(x/FC),j=Math.floor(z/FC),k=Math.floor(y/FVY);if(i<0||j<0||k<0||i>=FNX||j>=FNZ||k>=FNY)return 1;return W.V[(j*FNX+i)*FNY+k];}
/* ---------- props: crates, server racks, desks with CRT monitors, shelves, lockers, tanks, pumps, pipes, cables and debris ----------
   Every prop is made of boxes and cylinders (one shared texture atlas). Anything big enough to stand in the way collides,
   and the big ones also block light in the bake. q = quarter turns: the front faces -z (0), -x (1), +z (2), +x (3). */
function facProps(W){
  const R=facRng(1771),rr=(a,b)=>a+R()*(b-a),PR=W.prims=[],Y=k=>FCY[k];
  const bx=(x,y,z,w,h,d,q,a,o)=>{const p=Object.assign({s:'b',x,y,z,w,h,d,q:q||0,a},o||{});PR.push(p);return p;};
  const cy=(x,y,z,rad,h,a,o)=>{const p=Object.assign({s:'c',x,y,z,r:rad,h,a,ax:'y'},o||{});PR.push(p);return p;};
  const col=(x0,y0,z0,x1,y1,z1,vox)=>{W.boxes.push({x0,y0,z0,x1,y1,z1,m:'prop',noVox:!vox});};
  const colP=(p,vox)=>{if(p.s==='c'){if(p.ax==='y')col(p.x-p.r,p.y,p.z-p.r,p.x+p.r,p.y+p.h,p.z+p.r,vox);return;}
    const sw=p.q&1?p.d:p.w,sd=p.q&1?p.w:p.d;col(p.x-sw/2,p.y,p.z-sd/2,p.x+sw/2,p.y+p.h,p.z+sd/2,vox);};
  const fuse=(k,x,y,z)=>W.fuse[k].push({k,x,y,z});
  const bat=(k,x,y,z)=>W.bat.push({k,x,y,z});
  const fwd=q=>[[0,-1],[-1,0],[0,1],[1,0]][q&3];
  /* the building blocks */
  const crate=(k,x,z,s,q,y)=>{const p=bx(x,y==null?Y(k):y,z,s,s,s,q||0,'crate',{rot:rr(-.12,.12)});colP(p,s>=.8);return p;};
  const stack=(k,x,z,n)=>{let y=Y(k),s=1.05;for(let i=0;i<n;i++){crate(k,x+rr(-.05,.05),z+rr(-.05,.05),s,0,y);y+=s;s*=rr(.78,.92);}};
  const card=(k,x,z,s,y)=>{const p=bx(x,y==null?Y(k):y,z,s,s*.7,s*.8,0,'card',{rot:rr(-.4,.4)});if(y==null&&s>.5)colP(p);return p;};
  const rack=(k,x,z,q)=>{const p=bx(x,Y(k),z,.62,2.05,1,q,{f:'rackF',s:'rackS',t:'metalD'},{led:1});colP(p,1);return p;};
  const crtTop=(x,y,z,q,on)=>{const [fx,fz]=fwd(q);bx(x,y,z,.44,.4,.42,q,{f:'crtF',s:'crtB',t:'crtB'},{crt:on?1:.25});bx(x-fx*.25,y,z-fz*.25,.3,.3,.18,q,'crtB');};
  const chair=(k,x,z,q)=>{const [fx,fz]=fwd(q),y=Y(k);cy(x,y,z,.03,.42,'metalD');bx(x,y+.42,z,.46,.07,.44,q,'fabric');bx(x-fx*.2,y+.5,z-fz*.2,.44,.48,.06,q,'fabric');cy(x,y,z,.24,.04,'metalD');};
  const desk=(k,x,z,q,o)=>{o=o||{};const y=Y(k),[fx,fz]=fwd(q);bx(x,y+.72,z,1.4,.04,.7,q,'desk');
    const sx=(q&1)?0:.66,sz=(q&1)?.66:0;bx(x+sx,y,z+sz,.04,.72,.66,q,'deskS');bx(x-sx,y,z-sz,.04,.72,.66,q,'deskS');bx(x-fx*.32,y+.25,z-fz*.32,1.3,.47,.03,q,'deskS');
    col(x-((q&1)?.35:.7),y,z-((q&1)?.7:.35),x+((q&1)?.35:.7),y+.76,z+((q&1)?.7:.35));
    if(o.crt!==false){crtTop(x-fx*.05,y+.76,z-fz*.05,q,o.on!==false);bx(x+fx*.2,y+.76,z+fz*.2,.46,.03,.16,q,'crtB');}
    if(o.papers)bx(x+((q&1)?0:.45),y+.765,z+((q&1)?.45:0),.3,.01,.22,rr(0,4)|0,'paper',{rot:rr(-.3,.3)});
    if(o.chair!==false)chair(k,x+fx*.75,z+fz*.75,(q+2)&3);};
  const shelf=(k,x,z,q,len,o)=>{o=o||{};const y=Y(k),w=len||1.5,[fx,fz]=fwd(q),ax=(q&1)?0:1;
    for(const s of[-1,1])for(const t of[-1,1])bx(x+(ax?s*(w/2-.03):t*.2),y,z+(ax?t*.2:s*(w/2-.03)),.05,2,.05,0,'metalL');
    for(const h of[.08,.7,1.32,1.94]){bx(x,y+h,z,ax?w:.46,.03,ax?.46:w,0,'metalL');
      if(h<1.9){let u=-w/2+.12;while(u<w/2-.2){const s=rr(.25,.45);if(R()<.75){const cx=x+(ax?u+s/2:0)+(ax?0:rr(-.05,.05)),cz=z+(ax?rr(-.05,.05):u+s/2);
        bx(cx,y+h+.03,cz,ax?s:s*.9,rr(.22,.5),ax?s*.9:s,0,o.binders?'binder':(R()<.5?'card':'crate'),{rot:rr(-.08,.08)});}u+=s+.04;}}}
    col(x-(ax?w/2:.25),y,z-(ax?.25:w/2),x+(ax?w/2:.25),y+2,z+(ax?.25:w/2),1);};
  const lockers=(k,x,z,q,n)=>{const ax=(q&1)?0:1,[fx,fz]=fwd(q);for(let i=0;i<n;i++){const u=(i-(n-1)/2)*.42;const p=bx(x+(ax?u:0),Y(k),z+(ax?0:u),.41,1.9,.5,q,{f:'locker',s:'metalD',t:'metalD'},{rot:R()<.15?rr(-.04,.04):0});}
    col(x-(ax?n*.21:.25),Y(k),z-(ax?.25:n*.21),x+(ax?n*.21:.25),Y(k)+1.9,z+(ax?.25:n*.21),1);};
  const cab=(k,x,z,q,h,y)=>{const p=bx(x,y==null?Y(k):y,z,.48,h||1.32,.62,q,{f:'cab',s:'metalL',t:'metalL'});if(y==null)colP(p);return p;};
  const barrel=(k,x,z,a)=>{const p=cy(x,Y(k),z,.29,.88,a||'barrel');colP(p);return p;};
  const tank=(k,x,z,r,h)=>{const p=cy(x,Y(k),z,r,h,'tank');colP(p,1);cy(x,Y(k)+h,z,r*.35,.25,'rust');cy(x,Y(k),z,r*1.06,.18,'rust');return p;};
  const pipe=(k,x0,z0,x1,z1,y,r,a)=>{const ax=Math.abs(x1-x0)>Math.abs(z1-z0)?'x':'z',len=ax==='x'?Math.abs(x1-x0):Math.abs(z1-z0);
    cy((x0+x1)/2,Y(k)+y,(z0+z1)/2,r,len,a||'pipe',{ax});
    const n=Math.floor(len/3);for(let i=1;i<=n;i++){const t=i/(n+1),px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;cy(px,Y(k)+y,pz,r*1.25,.06,'rust',{ax});}};
  const vpipe=(k,x,z,y0,y1,r,a)=>cy(x,Y(k)+y0,z,r,y1-y0,a||'pipe');
  const table=(k,x,z,w,d,a)=>{const y=Y(k);bx(x,y+.73,z,w,.04,d,0,a||'desk');for(const s of[-1,1])for(const t of[-1,1])bx(x+s*(w/2-.05),y,z+t*(d/2-.05),.05,.73,.05,0,'metalD');col(x-w/2,y,z-d/2,x+w/2,y+.77,z+d/2);};
  const bench=(k,x,z,w,d)=>{const y=Y(k);bx(x,y+.42,z,w,.05,d,0,'deskS');for(const s of[-1,1])bx(x+((w>d)?s*(w/2-.1):0),y,z+((w>d)?0:s*(d/2-.1)),(w>d)?.05:d*.8,.42,(w>d)?d*.8:.05,0,'metalD');col(x-w/2,y,z-d/2,x+w/2,y+.47,z+d/2);};
  const pallet=(k,x,z,q,n)=>{const y=Y(k);bx(x,y,z,1.2,.14,1,q,'pallet');col(x-.6,y,z-.6,x+.6,y+.14,z+.6);
    for(let i=0;i<(n||0);i++){card(k,x+rr(-.3,.3),z+rr(-.25,.25),rr(.4,.55),y+.14+i*.32);}if(n)col(x-.55,y,z-.5,x+.55,y+.14+n*.32,z+.5);};
  const rubble=(k,x,z,n,rad,hmax,y0)=>{for(let i=0;i<n;i++){const a=rr(0,6.283),d=rad*Math.sqrt(R()),s=rr(.12,.42),h=rr(.08,hmax||.4);
    const p=bx(x+Math.cos(a)*d,(y0==null?Y(k):y0)-.02,z+Math.sin(a)*d,s,h,s*rr(.6,1.3),0,R()<.25?'rust':'rubble',{rot:rr(0,3)});if(h>.42)colP(p);}};
  const papers=(k,x,z,n,rad)=>{for(let i=0;i<n;i++){const a=rr(0,6.283),d=(rad||.8)*Math.sqrt(R());bx(x+Math.cos(a)*d,Y(k)+.003+i*.0015,z+Math.sin(a)*d,.21,.002,.29,0,'paper',{rot:rr(0,3),flat:1});}};
  const cable=(k,x0,z0,x1,z1)=>{const n=Math.max(2,Math.round(Math.hypot(x1-x0,z1-z0)/.6));let px=x0,pz=z0;for(let i=1;i<=n;i++){const t=i/n,nx=x0+(x1-x0)*t+(i<n?rr(-.15,.15):0),nz=z0+(z1-z0)*t+(i<n?rr(-.15,.15):0);
    const l=Math.hypot(nx-px,nz-pz);bx((px+nx)/2,Y(k)+.002,(pz+nz)/2,.035,.025,l+.02,0,'cable',{rot:Math.atan2(nx-px,nz-pz),flat:1});px=nx;pz=nz;}};
  const panel=(k,x,z,q,y,w,h,a,d)=>{const [fx,fz]=fwd(q);return bx(x-fx*(d||.12)/2,Y(k)+y,z-fz*(d||.12)/2,w,h,d||.12,q,{f:a,s:'metalD',t:'metalD'});};
  const vend=(k,x,z,q)=>{const p=bx(x,Y(k),z,.92,1.9,.8,q,{f:'vend',s:'metalD',t:'metalD'},{glow:1});colP(p,1);};
  const mat=(k,x0,z0,x1,z1)=>bx((x0+x1)/2,Y(k),(z0+z1)/2,x1-x0,.025,z1-z0,0,'mat',{flat:1});
  const machine=(k,x,z,w,d,h,q,a)=>{const p=bx(x,Y(k),z,w,h,d,q,{f:a||'gen',s:'metalD',t:'metalD'});colP(p,1);return p;};
  const sign=(k,x,z,q,y,w,h,a)=>{const [fx,fz]=fwd(q);bx(x+fx*.01,Y(k)+y,z+fz*.01,w,h,.02,q,a,{sign:1});};

  /* ===== LEVEL 1: SERVICE ===== */
  lockers(1,13.73,6.4,1,5);bench(1,12.6,6.4,.4,2);
  table(1,8.8,5.7,1,.6);bx(8.7,Y(1)+.77,5.6,.32,.16,.12,0,'radio');bat(1,9.05,Y(1)+.79,5.8);
  bx(13.05,Y(1),9.3,1.9,.42,.8,0,'deskS');bx(13.05,Y(1)+.42,9.3,1.85,.12,.75,0,'fabric');col(12.1,Y(1),8.9,14,Y(1)+.55,9.7);
  crate(1,8.6,8.6,.7,0);shelf(1,9.25,4.78,2,1.5);papers(1,11.5,7.5,4,.9);
  pipe(1,6.6,2.2,38,2.2,2.62,.07);pipe(1,6.6,2.42,38,2.42,2.66,.1);pipe(1,36.2,4,36.2,28.4,2.66,.09);pipe(1,8.2,10.6,8.2,26.6,2.64,.08);pipe(1,8,28.32,38,28.32,2.64,.09);
  crate(1,31.6,3.55,.62,1);rubble(1,26.2,3.1,7,.6,.15);bx(26.4,Y(1)+.02,3.2,1.25,.1,.25,0,'metalD',{rot:.35});
  cable(1,27,2.2,27.6,3.6);
  /* boiler room */
  tank(1,16.3,9.2,.85,2.6);tank(1,21,9.1,.72,2.4);vpipe(1,16.3,9.2,2.85,3.4,.12);vpipe(1,21,9.1,2.65,3.4,.1);
  pipe(1,14.6,11.75,22,11.75,2.9,.12);pipe(1,15,11.75,15,4.6,3.05,.08);
  shelf(1,21.7,6.3,1,1.4);fuse(1,21.7,Y(1)+1.35,6.3);
  panel(1,14.5,6.6,3,1.2,.7,.9,'panel');cable(1,14.6,7,16.1,8.6);
  /* storage */
  for(const x of[24.3,25.8,27.3])shelf(1,x,6.8,2);for(const x of[24.3,25.8,27.3])shelf(1,x,9.9,0);for(const x of[31.4,32.9])shelf(1,x,6.8,2);
  stack(1,34.6,10.9,2);crate(1,33.3,11.1,.8,0);crate(1,34.7,5.3,.75,0);fuse(1,34.7,Y(1)+.78,5.3);
  bat(1,23.2,Y(1),11.4);pallet(1,31.8,10.6,0,2);
  /* corridors */
  crate(1,36.4,21.2,.7,0);crate(1,9.55,24.6,.6,0);papers(1,9,13,3,.6);
  /* generator room */
  machine(1,13,19,3,2.6,1.9,1,'gen');vpipe(1,12,18,1.9,3.4,.14,'rust');panel(1,16,18,1,1.1,.8,1,'panel');cable(1,14.5,18.6,15.9,18.2);cable(1,14.5,19.6,15.8,19.2);
  table(1,12,24.5,1.8,.7,'deskS');fuse(1,11.6,Y(1)+.78,24.5);crate(1,15.3,13.2,.9,0);crate(1,15.4,14.2,.7,0);rubble(1,11.4,14,4,.5,.2);
  /* the atrium hall */
  stack(1,23.6,19,2);crate(1,24.7,19.2,.8,0);crate(1,28.1,22.5,1,0);crate(1,29.2,22.6,.8,0);stack(1,28.4,23.6,2);
  pallet(1,33.6,13.9,0,3);pallet(1,33.6,15.3,0,1);for(const [x,z] of[[25.6,14.6],[26.3,14.4],[25.9,15.2]])barrel(1,x,z);
  crate(1,17.4,18.2,.9,0);crate(1,17.5,19.2,.8,0);stack(1,17.6,21,2);pallet(1,18,25.2,0,2);stack(1,31.6,24.5,2);shelf(1,34.75,23.6,1,1.5);
  cable(1,24,21,27,21.5);rubble(1,31,21,5,.6,.15);papers(1,30,19,4,1);
  /* the collapsed room: broken concrete round the hole */
  for(const [x,z] of[[12.2,30.2],[14.9,30.3],[12.1,32.9],[14.8,32.7],[13.5,30.1],[15.2,31.5]])rubble(1,x,z,4,.35,.3);
  bat(1,15.3,Y(1),33.3);crate(1,11.6,33.4,.7,0);
  /* lockers room */
  lockers(1,42.5,2.25,2,9);lockers(1,41.8,8.75,0,7);bench(1,42.2,5.5,3.2,.4);crate(1,45.4,8.4,.7,0);fuse(1,45.4,Y(1)+.72,8.4);papers(1,40,6,3,.6);

  /* ===== LEVEL 0: ADMINISTRATION ===== */
  bx(13.6,Y(0),2.33,.32,1.1,.32,0,'cooler');col(13.4,Y(0),2.15,13.8,Y(0)+1.1,2.5);chair(0,16.2,2.45,2);papers(0,19,3.5,3,.7);
  sign(0,12,2,2,1.5,1.4,.9,'board');
  desk(0,7.25,9.5,1,{papers:1});fuse(0,7.25,Y(0)+.8,9.9);desk(0,11.4,7.3,0);desk(0,12.4,10.6,2,{on:false});cab(0,12.4,5.33,2);cab(0,12.95,5.33,2);cab(0,13.5,5.33,2);
  desk(0,16.6,7.4,0,{papers:1});desk(0,20.6,7.4,0,{on:false});desk(0,16.6,10.6,2);cab(0,21.68,6.2,1);cab(0,21.68,6.8,1);bat(0,21.2,Y(0),11.4);papers(0,19.5,9.5,4,.8);
  /* server hall: two long rows of racks with an aisle between */
  for(let i=0;i<6;i++)rack(0,24.3+i*.62,5,0);for(let i=0;i<7;i++)rack(0,29.9+i*.62,5,0);
  for(let i=0;i<6;i++)rack(0,24.3+i*.62,8.6,2);for(let i=0;i<7;i++)rack(0,29.9+i*.62,8.6,2);
  desk(0,33.4,11.15,0,{chair:true});crtTop(32.75,Y(0)+.76,11.25,0,true);fuse(0,34,Y(0)+.78,11);bat(0,24,Y(0),11.3);crate(0,23.2,11.2,.8,0);
  cable(0,24,6.8,33,6.9);cable(0,28.5,9.4,28.5,11.9);cable(0,26,4.3,26.6,2.2);
  /* gallery */
  desk(0,24.5,13.3,2);crate(0,33.9,13.4,.8,0);crate(0,34.7,13.3,.7,0);crate(0,17.5,20.5,.8,0);chair(0,22.5,14.8,1);papers(0,27,14.5,4,1);
  /* break room with the green mat */
  mat(0,10.8,15.5,14.2,17.6);table(0,8.6,15,1.2,.8);chair(0,8.6,14.25,2);chair(0,8.6,15.75,0);vend(0,6.95,17.8,3);
  bx(13.4,Y(0),13.05,1.9,.45,.8,2,'fabric');bx(13.4,Y(0)+.45,12.78,1.9,.45,.25,2,'fabric');col(12.45,Y(0),12.6,14.35,Y(0)+.9,13.45);
  crate(0,15.3,18.8,.7,0);fuse(0,15.3,Y(0)+.72,18.8);
  /* archive: shelves of binders */
  for(const x of[7.6,9.1,12.6,14.1])shelf(0,x,22,2,1.5,{binders:1});for(const x of[7.6,9.1,12.6,14.1])shelf(0,x,24.5,0,1.5,{binders:1});
  cab(0,15.45,25.4,1);fuse(0,15.45,Y(0)+1.34,25.4);bat(0,7.1,Y(0),25.5);papers(0,11,23,5,1);
  /* corridors */
  chair(0,37.4,10,3);cab(0,37.5,16.5,1,1.32);papers(0,37,22,4,.6);bench(0,20,28.15,1.6,.4);sign(0,24,26.5,2,1.6,1.1,.55,'signSrv');sign(0,7,28.5,0,1.5,.8,.8,'scrawl');

  /* ===== LEVEL 2: BASEMENT ===== */
  pipe(2,6.6,2.25,40,2.25,2.45,.18,'rust');pipe(2,6.6,3.8,40,3.8,2.7,.08);pipe(2,20.3,4,20.3,36.4,2.5,.14,'rust');pipe(2,8,36.3,32,36.3,2.6,.1);
  /* pumps */
  for(const x of[10.6,15.2]){machine(2,x,9,1.6,1,.45,0,'metalD');cy(x,Y(2)+.45,9,.36,1.3,'tank',{ax:'x'});cy(x-.95,Y(2)+.45,9,.42,.6,'rust');vpipe(2,x-.95,9,1.05,3.6,.12,'rust');}
  pipe(2,9.6,6,9.6,13.8,3.1,.15,'rust');table(2,9,13.35,1.2,.55,'deskS');fuse(2,9,Y(2)+.78,13.35);panel(2,10.6,14,0,1.2,1,1.1,'panel');bat(2,17.3,Y(2),13.4);barrel(2,17.2,5.2,'barrelR');
  /* flooded room */
  for(const [x,z] of[[22,9],[22.6,9.4],[23,15],[28.5,8.8]])barrel(2,x,z,R()<.5?'barrel':'barrelR');pallet(2,26.8,9.2,0,2);crate(2,29.3,15.4,.7,0);fuse(2,29.3,Y(2)+.72,15.4);rubble(2,25,13,6,1,.12);
  /* maintenance */
  for(const z of[7,9.2,11.4])table(2,39.55,z,.75,1.9,'deskS');fuse(2,39.55,Y(2)+.78,12.6);for(const x of[36.3,37.8])shelf(2,x,4.78,2,1.5);bat(2,39.3,Y(2),5.2);crate(2,31.2,5.3,.8,0);stack(2,31.3,13.2,2);
  /* lift hall */
  panel(2,27,20,2,1,1.1,1.4,'breaker',.16);sign(2,27,20,2,2.55,1.6,.4,'signLift');sign(2,33,22.6,3,1.6,.8,.5,'hazard');
  stack(2,22.4,21.3,2);crate(2,23.5,21.1,.8,0);stack(2,22.5,28.6,3);crate(2,31.6,28.8,.9,0);pallet(2,29,22,1,2);bat(2,21.8,Y(2),29.3);
  bx(32.25,Y(2),25,1.5,.004,3,0,'hazard',{flat:1});
  panel(2,37.5,24,1,1.2,.35,.5,'liftP',.08);
  /* the room under the hole */
  rubble(2,13.5,31.5,16,1.1,.35);rubble(2,12,30,5,.5,.6);rubble(2,15.2,33.2,5,.5,.6);crate(2,15.4,29.6,.7,0);fuse(2,15.4,Y(2)+.72,29.6);
  papers(2,24,35.5,3,.6);crate(2,31.4,35.9,.6,0);rubble(2,27,32,4,.5,.15);
}
/* ---------- geometry: surfaces from the grid, then stairs, railings, frames, fixtures and props ----------
   Geometry is gathered per 8 m chunk and per material, with shared vertices, so light can be baked per vertex and
   each chunk draws in a handful of calls. */
const FMAT=['wallC','wallP','tile','concF','ceilP','metal','paint','prop','emis','decal'];
const FDEC=new Set(['scrawl','scrawl2','scrawl3','sign1','sign2','sign3','blood','arrow','hazard']);
const FMS={wallC:3,wallP:2,tile:2.4,concF:4,ceilP:4,metal:.6,paint:2};
const FPLA=k=>k===FK.off||k===FK.srv||k===FK.gal||k===FK.swy;
function facWallMat(k){return FPLA(k)?'wallP':k===FK.frm?'paint':'wallC';}
function facFloorMat(k){return k===FK.frm?'metal':(k===FK.cro||k===FK.bsm||k===FK.hal||k===FK.lift)?'concF':'tile';}
function facCeilMat(k){return FPLA(k)?'ceilP':k===FK.frm?'paint':'wallC';}
/* surface colour (multiplies the texture) and wetness (how strongly it reflects) by kind of space */
const FTINT={
  floor:{1:[.5,.68,.8,.62],2:[.66,.74,.76,.42],3:[.5,.58,.58,.95],4:[.86,.82,.68,.32],5:[.7,.7,.66,.28],6:[.86,.8,.66,.34],7:[.62,.72,.76,.5],8:[.52,.68,.76,.5],9:[.86,.8,.6,.3],10:[.6,.6,.62,.4],11:[.58,.6,.62,.62]},
  wall:{1:[.74,.86,.86,.14],2:[.76,.84,.84,.1],3:[.6,.7,.68,.22],4:[1,1,1,.06],5:[.9,.88,.84,.05],6:[1,.98,.95,.06],7:[.72,.82,.84,.1],8:[.74,.84,.86,.12],9:[1,1,1,.06],10:[.34,.52,.56,.3],11:[.66,.68,.72,.12]},
  ceil:{1:[.6,.68,.68,.04],2:[.62,.68,.68,.04],3:[.48,.54,.52,.06],4:[.96,.92,.84,.03],5:[.85,.82,.76,.03],6:[.96,.92,.84,.03],7:[.6,.68,.7,.04],8:[.6,.68,.7,.04],9:[.96,.92,.84,.03],10:[.34,.52,.56,.2],11:[.55,.56,.58,.04]}};
function facNoise3(x,y,z){/* smooth value noise for grime and puddles */
  const h=(i,j,k)=>{let n=i*374761393+j*668265263+k*1274126177;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967296;};
  const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,s=t=>t*t*(3-2*t),u=s(xf),v=s(yf),w=s(zf);
  const L=(a,b,t)=>a+(b-a)*t;
  return L(L(L(h(xi,yi,zi),h(xi+1,yi,zi),u),L(h(xi,yi+1,zi),h(xi+1,yi+1,zi),u),v),L(L(h(xi,yi,zi+1),h(xi+1,yi,zi+1),u),L(h(xi,yi+1,zi+1),h(xi+1,yi+1,zi+1),u),v),w);}
function facChunkKey(x,y,z){return facBand(y)*100+Math.min(9,Math.max(0,Math.floor(z/16)))*10+Math.min(9,Math.max(0,Math.floor(x/16)));}
function facBuilder(){
  const B={acc:new Map()};
  B.get=(ck,m)=>{const key=ck*16+FMAT.indexOf(m);let a=B.acc.get(key);if(!a){a={ck,m,p:[],n:[],u:[],t:[],s:[],idx:[],map:new Map(),em:[]};B.acc.set(key,a);}return a;};
  /* a vertex; weld: share it with other faces of the same orientation; s = where the bake starts looking from */
  B.v=(a,x,y,z,nx,ny,nz,u,v,t,sx,sy,sz,weld,em)=>{
    if(weld){const key=Math.round(x*200)+','+Math.round(y*200)+','+Math.round(z*200)+','+Math.round(nx*3)+Math.round(ny*3)+Math.round(nz*3);const e=a.map.get(key);if(e!=null)return e;a.map.set(key,a.p.length/3);}
    a.p.push(x,y,z);a.n.push(nx,ny,nz);a.u.push(u,v);a.t.push(t[0],t[1],t[2],t[3]);a.s.push(sx,sy,sz);if(a.m==='emis'){const e=em||[1,1,1,1];a.em.push(e[0],e[1],e[2],e[3]==null?1:e[3]);}return a.p.length/3-1;};
  /* a rectangle: centre c, half-extents eu and ev (vectors), normal n; uv(x,y,z) gives the texture coordinate at a corner */
  B.quad=(m,c,eu,ev,n,uvf,t,weld,start,em)=>{
    const P=[[c[0]-eu[0]-ev[0],c[1]-eu[1]-ev[1],c[2]-eu[2]-ev[2]],[c[0]+eu[0]-ev[0],c[1]+eu[1]-ev[1],c[2]+eu[2]-ev[2]],[c[0]+eu[0]+ev[0],c[1]+eu[1]+ev[1],c[2]+eu[2]+ev[2]],[c[0]-eu[0]+ev[0],c[1]-eu[1]+ev[1],c[2]-eu[2]+ev[2]]];
    const cr=[eu[1]*ev[2]-eu[2]*ev[1],eu[2]*ev[0]-eu[0]*ev[2],eu[0]*ev[1]-eu[1]*ev[0]],flip=cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0;
    const a=B.get(facChunkKey(c[0],c[1]+n[1]*.01,c[2]),m),ids=[];
    for(const p of P){const uv=uvf(p);const sx=start?start[0]+(c[0]-p[0])*.06+n[0]*.06:p[0]+(c[0]-p[0])*.04+n[0]*.06,sy=start?start[1]+(c[1]-p[1])*.06+n[1]*.06:p[1]+(c[1]-p[1])*.04+n[1]*.06,sz=start?start[2]+(c[2]-p[2])*.06+n[2]*.06:p[2]+(c[2]-p[2])*.04+n[2]*.06;
      ids.push(B.v(a,p[0],p[1],p[2],n[0],n[1],n[2],uv[0],uv[1],t,sx,sy,sz,weld,em));}
    if(flip)a.idx.push(ids[0],ids[2],ids[1],ids[0],ids[3],ids[2]);else a.idx.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);
  };
  return B;
}
/* world-projected texture coordinates for an axis-aligned face */
function facUV(m,n,yb){const s=FMS[m]||1;
  if(n[1]>.5||n[1]<-.5)return p=>[p[0]/s,p[2]/s];
  const tx=n[2],tz=-n[0];
  if(m==='wallP')return p=>[(p[0]*tx+p[2]*tz)/s,(p[1]-yb)/4];
  return p=>[(p[0]*tx+p[2]*tz)/s,p[1]/s];}
function facTintAt(base,x,y,z,wetMul){const g=.78+.3*facNoise3(x*.45,y*.6,z*.45)-.1*facNoise3(x*1.7,y*1.7,z*1.7);
  let w=base[3];if(wetMul)w=Math.min(1,w*(.55+.9*facNoise3(x*.6+3.1,y*.2,z*.6+7.7)));return [Math.min(1,base[0]*g),Math.min(1,base[1]*g),Math.min(1,base[2]*g),w];}
function facGeomWorld(W,B){
  const G=W.G,SD=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let j=0;j<FNZ;j++)for(let i=0;i<FNX;i++){const c=j*FNX+i,cnt=G.ic[c];if(!cnt)continue;
    const x0=i*FC,z0=j*FC,cx=x0+FC/2,cz=z0+FC/2;
    for(let q=0;q<cnt;q++){const a=G.iv[(c*FMI+q)*2],b=G.iv[(c*FMI+q)*2+1];
      /* floor and ceiling of this air interval */
      {const kd=facKindAt(W,c,a+.05),m=facFloorMat(kd),t=facTintAt(FTINT.floor[kd],cx,a,cz,1);B.quad(m,[cx,a,cz],[FC/2,0,0],[0,0,FC/2],[0,1,0],facUV(m,[0,1,0]),t,1);}
      {const kd=facKindAt(W,c,b-.05),m=facCeilMat(kd),t=facTintAt(FTINT.ceil[kd],cx,b,cz);B.quad(m,[cx,b,cz],[FC/2,0,0],[0,0,FC/2],[0,-1,0],facUV(m,[0,-1,0]),t,1);}
      /* walls: the parts of this interval the neighbour column does not share */
      for(const [di,dj] of SD){const ni=i+di,nj=j+dj;let segs=[[a,b]];
        if(ni>=0&&nj>=0&&ni<FNX&&nj<FNZ){const nc=nj*FNX+ni;for(let r=0;r<G.ic[nc];r++){const na=G.iv[(nc*FMI+r)*2],nb=G.iv[(nc*FMI+r)*2+1],out=[];
          for(const s of segs){if(nb<=s[0]||na>=s[1]){out.push(s);continue;}if(na>s[0])out.push([s[0],na]);if(nb<s[1])out.push([nb,s[1]]);}segs=out;}}
        const n=[-di,0,-dj],fx=di>0?x0+FC:di<0?x0:cx,fz=dj>0?z0+FC:dj<0?z0:cz;
        for(const s of segs){if(s[1]-s[0]<.01)continue;
          /* split at the level bands (each band has its own kind of wall) and every 0.5 m (for the baked light) */
          const cuts=[s[0]];for(let y=Math.floor(s[0]/.5+1e-6)*.5+.5;y<s[1]-.01;y+=.5)cuts.push(y);cuts.push(s[1]);
          for(let u=0;u<cuts.length-1;u++){const ya=cuts[u],yb=cuts[u+1];if(yb-ya<.005)continue;const ym=(ya+yb)/2,kd=facKindAt(W,c,ym),m=facWallMat(kd),band=facBand(ym);
            const t=facTintAt(FTINT.wall[kd],fx,ym,fz);
            B.quad(m,[fx,ym,fz],di?[0,0,FC/2]:[FC/2,0,0],[0,(yb-ya)/2,0],n,facUV(m,n,FCY[band]),t,1);}}}
    }}
}
/* a box: axis-aligned unless rot is given (props); faces can have their own material, skip lists the faces to leave out */
function facBox(B,x0,y0,z0,x1,y1,z1,mats,t,o){o=o||{};
  const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,hx=(x1-x0)/2,hy=(y1-y0)/2,hz=(z1-z0)/2,F=[['px',[1,0,0]],['nx',[-1,0,0]],['py',[0,1,0]],['ny',[0,-1,0]],['pz',[0,0,1]],['nz',[0,0,-1]]];
  for(const [k,n] of F){if(o.skip&&o.skip.includes(k))continue;const m=typeof mats==='string'?mats:(mats[k]||mats.s);
    const c=[cx+n[0]*hx,cy+n[1]*hy,cz+n[2]*hz],eu=n[0]?[0,0,hz]:[hx,0,0],ev=n[1]?[0,0,hz]:[0,hy,0];
    B.quad(m,c,eu,ev,n,o.uv?o.uv(k,n):facUV(m,n,0),t,0,null,o.em);}
}
/* ---------- the texture atlas used by props, fixtures and signs: [column,row,width,height] in 1/8ths ---------- */
const FAT={crate:[0,0],card:[1,0],pallet:[2,0],rubble:[3,0],rust:[4,0],pipe:[5,0],tank:[6,0],barrel:[7,0],
  barrelR:[0,1],metalD:[1,1],metalL:[2,1],desk:[3,1],deskS:[4,1],fabric:[5,1],crtB:[6,1],crtF:[7,1],
  rackF:[0,2,1,2],rackS:[1,2,1,2],locker:[2,2,1,2],cab:[3,2,1,2],vend:[4,2,1,2],gen:[5,2],panel:[5,3],breaker:[6,2],liftP:[6,3],board:[7,2],binder:[7,3],
  paper:[0,4],cable:[1,4],mat:[2,4],cooler:[3,4],radio:[4,4],hazard:[5,4],vent:[6,4],scrawl:[7,4],
  signSrv:[0,5,2,1],signLift:[2,5,2,1],sign1:[4,5],sign2:[5,5],sign3:[6,5],signExit:[7,5],
  fuse:[0,6],battery:[1,6],house:[2,6],tread:[3,6],scrawl2:[4,6],scrawl3:[5,6],arrow:[6,6],blood:[7,6]};
function facReg(a){const r=FAT[a]||FAT.metalD,w=r[2]||1,h=r[3]||1,e=.004;return [r[0]/8+e,1-(r[1]+h)/8+e,(r[0]+w)/8-e,1-r[1]/8-e];}
/* faces in a plane, minus the parts other boxes cover: used so stacked steps only draw their visible risers */
function facRectSub(rs,c){const out=[];for(const r of rs){if(c[2]<=r[0]||c[0]>=r[2]||c[3]<=r[1]||c[1]>=r[3]){out.push(r);continue;}
  if(c[0]>r[0])out.push([r[0],r[1],c[0],r[3]]);if(c[2]<r[2])out.push([c[2],r[1],r[2],r[3]]);
  const a=Math.max(r[0],c[0]),b=Math.min(r[2],c[2]);if(c[1]>r[1])out.push([a,r[1],b,c[1]]);if(c[3]<r[3])out.push([a,c[3],b,r[3]]);}return out;}
function facGeomBoxes(W,B){
  const T_=(k)=>FTINT.wall[k]||FTINT.wall[1];
  for(const b of W.boxes){if(b.m==='prop')continue;
    const kd=facKindAt(W,Math.floor((b.z0+b.z1)/2/FC)*FNX+Math.floor((b.x0+b.x1)/2/FC),b.y1-.05),warm=FPLA(kd);
    const F=[[0,1,b.x1],[0,-1,b.x0],[1,1,b.y1],[1,-1,b.y0],[2,1,b.z1],[2,-1,b.z0]];
    for(const [ax,sg,pv] of F){const n=[0,0,0];n[ax]=sg;
      const A=ax===0?[2,1]:ax===1?[0,2]:[0,1],lo=[b.x0,b.y0,b.z0],hi=[b.x1,b.y1,b.z1];
      let rs=[[lo[A[0]],lo[A[1]],hi[A[0]],hi[A[1]]]];
      for(const o of facHashGet(W.bh,(b.x0+b.x1)/2,(b.z0+b.z1)/2)||[]){if(o===b||o.m==='prop')continue;const ol=[o.x0,o.y0,o.z0],oh=[o.x1,o.y1,o.z1];
        if(sg>0?Math.abs(ol[ax]-pv)>.001:Math.abs(oh[ax]-pv)>.001)continue;rs=facRectSub(rs,[ol[A[0]],ol[A[1]],oh[A[0]],oh[A[1]]]);}
      for(const r of rs){if(r[2]-r[0]<.005||r[3]-r[1]<.005)continue;const c=[0,0,0];c[ax]=pv;c[A[0]]=(r[0]+r[2])/2;c[A[1]]=(r[1]+r[3])/2;
        const o=c.slice();o[ax]+=sg*.03;if(!facAir(W,o[0],o[1],o[2]))continue;
        const eu=[0,0,0],ev=[0,0,0];eu[A[0]]=(r[2]-r[0])/2;ev[A[1]]=(r[3]-r[1])/2;
        let m=ax===1&&sg>0?'metal':ax===1?'paint':(b.m==='land'?'paint':(ax===2?'metal':'paint'));
        if(ax!==1&&(b.m==='step'||b.m==='mstep')){/* risers face along the flight, sides are the stringers */const along=Math.abs(b.x1-b.x0)<Math.abs(b.z1-b.z0)?0:2;m=ax===along?'paint':'metal';}
        const t=m==='metal'?[.55,.56,.58,.35]:(warm?[.42,.4,.36,.2]:[.36,.46,.5,.2]);
        B.quad(m,c,eu,ev,n,facUV(m,n,0),t,0);}}
  }
}
/* a beam between two points with a square cross-section (railings, cables, sloped handrails) */
function facBeam(B,p0,p1,w,m,t,o){const d=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],L=Math.hypot(d[0],d[1],d[2]);if(L<1e-3)return;const f=[d[0]/L,d[1]/L,d[2]/L];
  let up=Math.abs(f[1])>.9?[1,0,0]:[0,1,0];let s=[f[1]*up[2]-f[2]*up[1],f[2]*up[0]-f[0]*up[2],f[0]*up[1]-f[1]*up[0]];let sl=Math.hypot(s[0],s[1],s[2]);s=s.map(v=>v/sl);
  const u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]],c=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,(p0[2]+p1[2])/2],h=w/2,E=[f[0]*L/2,f[1]*L/2,f[2]*L/2];
  for(const [nv,ov] of[[s,u],[u,s]])for(const sg of[1,-1]){const n=nv.map(v=>v*sg);B.quad(m,[c[0]+n[0]*h,c[1]+n[1]*h,c[2]+n[2]*h],E,ov.map(v=>v*h),n,o&&o.uv?o.uv:(p=>[0,0]),t,0,null,o&&o.em);}
}
function facGeomRails(W,B){
  for(const r of W.rails){const L=Math.hypot(r.x1-r.x0,r.z1-r.z0),n=Math.max(1,Math.ceil(L/1.15)),kd=facKindAt(W,Math.floor((r.z0+r.z1)/2/FC)*FNX+Math.floor((r.x0+r.x1)/2/FC),Math.max(r.y,r.y2)+.5);
    const t=FPLA(kd)?[.5,.48,.44,.4]:[.42,.55,.58,.4],at=s=>[r.x0+(r.x1-r.x0)*s,r.y+(r.y2-r.y)*s,r.z0+(r.z1-r.z0)*s];
    /* stair rails follow the nosing of the steps; for those the posts stand on each step */
    for(let i=0;i<=n;i++){const s=i/n,p=at(s);facBeam(B,[p[0],p[1],p[2]],[p[0],p[1]+1.02,p[2]],.045,'paint',t);}
    const a=at(0),b=at(1);facBeam(B,[a[0],a[1]+1.04,a[2]],[b[0],b[1]+1.04,b[2]],.055,'paint',t);facBeam(B,[a[0],a[1]+.52,a[2]],[b[0],b[1]+.52,b[2]],.035,'paint',t);
    /* collides as a thin wall, in short pieces that follow the slope */
    const m=Math.max(1,Math.ceil(L/.3)),ax=Math.abs(r.x1-r.x0)>Math.abs(r.z1-r.z0)?'x':'z';
    for(let i=0;i<m;i++){const p=at(i/m),q=at((i+1)/m),ylo=Math.min(p[1],q[1]),yhi=Math.max(p[1],q[1])+1.06;
      const b=ax==='x'?{x0:Math.min(p[0],q[0]),x1:Math.max(p[0],q[0]),z0:p[2]-.05,z1:p[2]+.05,y0:ylo-.3,y1:yhi,m:'rail',noVox:1}:{x0:p[0]-.05,x1:p[0]+.05,z0:Math.min(p[2],q[2]),z1:Math.max(p[2],q[2]),y0:ylo-.3,y1:yhi,m:'rail',noVox:1};
      W.boxes.push(b);facHashAdd(W.bh,b);}
  }
}
const FDS={teal:[.34,.62,.66],blue:[.3,.5,.72],grey:[.46,.5,.52],green:[.36,.52,.4]};
function facGeomFrames(W,B){
  for(const d of W.doors){const y=FCY[d.k],alongZ=(d.x1-d.x0)<(d.z1-d.z0),t=(FDS[d.style]||FDS.grey).map(v=>v*.62).concat([.4]);
    if(alongZ){for(const [xf,sg] of[[d.x0,-1],[d.x1,1]]){const xa=sg<0?xf-.035:xf,xb=sg<0?xf:xf+.035;
        facBox(B,xa,y,d.z0-.075,xb,y+2.38,d.z0+.005,'paint',t,{skip:['ny']});facBox(B,xa,y,d.z1-.005,xb,y+2.38,d.z1+.075,'paint',t,{skip:['ny']});facBox(B,xa,y+2.3,d.z0-.075,xb,y+2.38,d.z1+.075,'paint',t,{skip:['ny']});}}
    else{for(const [zf,sg] of[[d.z0,-1],[d.z1,1]]){const za=sg<0?zf-.035:zf,zb=sg<0?zf:zf+.035;
        facBox(B,d.x0-.075,y,za,d.x0+.005,y+2.38,zb,'paint',t,{skip:['ny']});facBox(B,d.x1-.005,y,za,d.x1+.075,y+2.38,zb,'paint',t,{skip:['ny']});facBox(B,d.x0-.075,y+2.3,za,d.x1+.075,y+2.38,zb,'paint',t,{skip:['ny']});}}
  }
}
const FLC={cyan:[.5,.94,1],warm:[1,.86,.6],red:[1,.1,.06]};
/* the ceiling height above (x,z) on level k */
function facCeilAt(W,x,z,k){const i=Math.floor(x/FC),j=Math.floor(z/FC),c=j*FNX+i,G=W.G,y=FCY[k]+1;for(let q=0;q<G.ic[c];q++){const a=G.iv[(c*FMI+q)*2],b=G.iv[(c*FMI+q)*2+1];if(y>=a-.01&&y<=b+.01)return b;}return FCY[k]+3;}
function facGeomLights(W,B){
  const reg=p=>{const r=facReg('house');return [r[0]+(r[2]-r[0])*.5,r[1]+(r[3]-r[1])*.5];};
  for(const l of W.lights){const col=FLC[l.col]||FLC.cyan,on=!l.dead,I=(l.dim||1),em=on?[col[0]*1.15*I,col[1]*1.15*I,col[2]*1.15*I,l.col==='red'?0:1]:[.05,.055,.06,1];
    const hous=[.16,.17,.17,.15];
    if(l.wall){/* a caged lamp on the wall: find which way the wall is */
      let wx=0,wz=0;for(const [dx,dz] of[[1,0],[-1,0],[0,1],[0,-1]]){if(!facAir(W,l.x+dx*.4,(l.y||FCY[l.k]+2.5),l.z+dz*.4)){wx=dx;wz=dz;break;}}
      const y=l.y||FCY[l.k]+2.5,px=l.x+wx*(.4-.12),pz=l.z+wz*(.4-.12);
      /* snap to the wall face */
      let fx=l.x,fz=l.z;for(let s=0;s<20;s++){if(!facAir(W,fx+wx*.05,y,fz+wz*.05))break;fx+=wx*.05;fz+=wz*.05;}
      l.px=fx-wx*.14;l.py=y;l.pz=fz-wz*.14;l.nx=-wx;l.nz=-wz;l.wallL=1;
      facBox(B,Math.min(fx,fx-wx*.1)-(wz?.11:0)-(wx?0:0),y-.12,Math.min(fz,fz-wz*.1)-(wx?.11:0),Math.max(fx,fx-wx*.1)+(wz?.11:0),y+.12,Math.max(fz,fz-wz*.1)+(wx?.11:0),'paint',hous);
      facBox(B,l.px-.07,y-.07,l.pz-.07,l.px+.07,y+.07,l.pz+.07,'emis',[1,1,1,1],{em});
      continue;}
    const top=l.y!=null&&l.hang?l.y+.08:facCeilAt(W,l.x,l.z,l.k),y=top-.08,ax=l.ax==='x',hx=ax?.66:.13,hz=ax?.13:.66;
    l.px=l.x;l.py=y-.04;l.pz=l.z;l.top=top;
    facBox(B,l.x-hx,y,l.z-hz,l.x+hx,top,l.z+hz,'paint',hous,{skip:['py']});
    B.quad('emis',[l.x,y-.002,l.z],[ax?.6:0,0,ax?0:.6],[ax?0:.085,0,ax?.085:0],[0,-1,0],p=>[0,0],[1,1,1,1],0,null,em);
    if(l.hang){const cb=facCeilAt(W,l.x,l.z,l.k);for(const s of[-.5,.5])facBeam(B,[l.x+(ax?s:0),top,l.z+(ax?0:s)],[l.x+(ax?s:0),cb,l.z+(ax?0:s)],.012,'paint',[.1,.1,.1,0]);}
  }
}
function facGeomVents(W,B){const r=facReg('vent');
  for(const v of W.vents){const top=facCeilAt(W,v.x,v.z,v.k);v.y=top;
    B.quad('prop',[v.x,top-.012,v.z],[.42,0,0],[0,0,.42],[0,-1,0],p=>[r[0]+(p[0]-v.x+.42)/.84*(r[2]-r[0]),r[1]+(p[2]-v.z+.42)/.84*(r[3]-r[1])],[.8,.82,.82,.3],0);}}
/* props: boxes and cylinders, mapped into the atlas */
function facGeomProps(W,B){
  for(const p of W.prims){
    if(p.s==='c'){facCyl(B,p);continue;}
    if(FDEC.has(p.a)){/* paint and stains: one quad, blended onto the surface behind it */
      const r=facReg(p.a),ang=(p.q||0)*Math.PI/2+(p.rot||0),cs=Math.cos(ang),sn=Math.sin(ang);
      if(p.flat){const eu=[cs*p.w/2,0,-sn*p.w/2],ev=[sn*p.d/2,0,cs*p.d/2],c=[p.x,p.y+.006,p.z];
        B.quad('decal',c,eu,ev,[0,1,0],q=>{const d=[q[0]-c[0],q[2]-c[2]],a=(d[0]*eu[0]+d[1]*eu[2])/(p.w*p.w/4),b=(d[0]*ev[0]+d[1]*ev[2])/(p.d*p.d/4);return [r[0]+(a*.5+.5)*(r[2]-r[0]),r[1]+(b*.5+.5)*(r[3]-r[1])];},[1,1,1,0],0);}
      else{const n=[-sn,0,-cs],eu=[-cs*p.w/2,0,sn*p.w/2],ev=[0,p.h/2,0],c=[p.x+n[0]*.004,p.y+p.h/2,p.z+n[2]*.004];
        B.quad('decal',c,eu,ev,n,q=>{const d=[q[0]-c[0],q[1]-c[1],q[2]-c[2]],a=(d[0]*eu[0]+d[2]*eu[2])/(p.w*p.w/4),b=d[1]/(p.h/2);return [r[0]+(a*.5+.5)*(r[2]-r[0]),r[1]+(b*.5+.5)*(r[3]-r[1])];},[1,1,1,0],0);}
      continue;}
    const ang=(p.q||0)*Math.PI/2+(p.rot||0),cs=Math.cos(ang),sn=Math.sin(ang),hw=p.w/2,hh=p.h/2,hd=p.d/2,cy=p.y+hh;
    const rot=(lx,lz)=>[p.x+lx*cs+lz*sn,p.z-lx*sn+lz*cs];
    const A=typeof p.a==='string'?{f:p.a,s:p.a,t:p.a}:p.a;
    const tint=p.tint||[1,1,1,.12],faces=[['nz',[0,0,-1],A.f],['pz',[0,0,1],A.s],['nx',[-1,0,0],A.s],['px',[1,0,0],A.s],['py',[0,1,0],A.t||A.s],['ny',[0,-1,0],A.s]];
    for(const [k,ln,reg] of faces){if(k==='ny'&&p.y<=FCY[facBand(p.y+.01)]+.02)continue;if(p.flat&&k!=='py')continue;
      const r=facReg(reg);const lc=[ln[0]*hw,ln[1]*hh,ln[2]*hd];
      const leu=ln[1]?[hw,0,0]:ln[0]?[0,0,hd]:[hw,0,0],lev=ln[1]?[0,0,hd]:[0,hh,0];
      const w2=(v)=>{const q=rot(v[0],v[2]);return [q[0]-p.x,v[1],q[1]-p.z];};
      const c0=rot(lc[0],lc[2]),c=[c0[0],cy+lc[1],c0[1]],eu=w2(leu),ev=w2(lev),n=w2(ln);
      /* uv: the face's own corner coordinates mapped to the region */
      const ux=[eu[0],eu[1],eu[2]],vx=[ev[0],ev[1],ev[2]],ul=Math.hypot(...ux)||1,vl=Math.hypot(...vx)||1;
      const sgn=(k==='nz'||k==='px')?1:-1;
      B.quad('prop',c,eu,ev,n,q=>{const d=[q[0]-c[0],q[1]-c[1],q[2]-c[2]];let a=(d[0]*ux[0]+d[1]*ux[1]+d[2]*ux[2])/(ul*ul),b=(d[0]*vx[0]+d[1]*vx[1]+d[2]*vx[2])/(vl*vl);
        a=(k==='nz'||k==='nx'||k==='py'||k==='ny')?-a:a;return [r[0]+(a*.5+.5)*(r[2]-r[0]),r[1]+(b*.5+.5)*(r[3]-r[1])];},tint,0);
      if(k==='nz'&&p.crt){B.quad('emis',[c[0]+n[0]*.004,c[1]+.02,c[2]+n[2]*.004],eu.map(v=>v*.68),ev.map(v=>v*.62),n,q=>[0,0],[1,1,1,1],0,null,[.22*p.crt,.42*p.crt,.4*p.crt,1]);}
      if(k==='nz'&&p.glow){B.quad('emis',[c[0]+n[0]*.004,c[1]+hh*.3,c[2]+n[2]*.004],eu.map(v=>v*.8),ev.map(v=>v*.45),n,q=>[0,0],[1,1,1,1],0,null,[.55,.62,.66,1]);}
      if(k==='nz'&&p.led){for(let i=0;i<5;i++){const lu=(i%2?-.25:.2)+Math.sin(i*7.3+p.x)*.05,lv=-.8+i*.36+Math.sin(p.z*3+i)*.05,cc=[c[0]+eu[0]*lu+ev[0]*lv+n[0]*.003,c[1]+eu[1]*lu+ev[1]*lv,c[2]+eu[2]*lu+ev[2]*lv+n[2]*.003];
        const col=[[.1,.9,.3],[.95,.6,.1],[.9,.15,.1],[.1,.9,.3],[.2,.5,1]][(i+Math.floor(p.x*7))%5];B.quad('emis',cc,eu.map(v=>v*.03),ev.map(v=>v*.012),n,q=>[0,0],[1,1,1,1],0,null,[col[0],col[1],col[2],1]);}}
    }
  }
}
function facCyl(B,p){const r=facReg(p.a),seg=p.r>.5?14:p.r>.15?10:7,ax=p.ax||'y',tint=p.tint||[1,1,1,.15];
  const P=(a,h)=>{const c=Math.cos(a)*p.r,s=Math.sin(a)*p.r;return ax==='y'?[p.x+c,p.y+h,p.z+s]:ax==='x'?[p.x-p.h/2+h,p.y+c,p.z+s]:[p.x+c,p.y+s,p.z-p.h/2+h];};
  const N=a=>{const c=Math.cos(a),s=Math.sin(a);return ax==='y'?[c,0,s]:ax==='x'?[0,c,s]:[c,s,0];};
  const a=B.get(facChunkKey(p.x,ax==='y'?p.y+p.h/2:p.y,p.z),'prop');
  const base=a.p.length/3;
  for(let i=0;i<=seg;i++){const t=i/seg*Math.PI*2,n=N(t);for(const h of[0,p.h]){const q=P(t,h);B.v(a,q[0],q[1],q[2],n[0],n[1],n[2],r[0]+(r[2]-r[0])*i/seg,h?r[3]:r[1],tint,q[0]+n[0]*.06,q[1]+n[1]*.06,q[2]+n[2]*.06,0);}}
  for(let i=0;i<seg;i++){const b=base+i*2;a.idx.push(b,b+1,b+3,b,b+3,b+2);}
  /* fix winding so the outside faces out */
  {const i0=a.idx.length-seg*6,q0=a.idx[i0],q1=a.idx[i0+1],q2=a.idx[i0+2],A=a.p.slice(q0*3,q0*3+3),Bq=a.p.slice(q1*3,q1*3+3),C=a.p.slice(q2*3,q2*3+3),e1=[Bq[0]-A[0],Bq[1]-A[1],Bq[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];
    const cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],nn=a.n.slice(q0*3,q0*3+3);if(cr[0]*nn[0]+cr[1]*nn[1]+cr[2]*nn[2]<0)for(let i=i0;i<a.idx.length;i+=3){const t=a.idx[i+1];a.idx[i+1]=a.idx[i+2];a.idx[i+2]=t;}}
  /* the end caps */
  for(const h of[0,p.h]){if(ax==='y'&&h===0)continue;const n=ax==='y'?[0,h?1:-1,0]:ax==='x'?[h?1:-1,0,0]:[0,0,h?1:-1],c=P(0,h),cc=ax==='y'?[p.x,p.y+h,p.z]:ax==='x'?[p.x-p.h/2+h,p.y,p.z]:[p.x,p.y,p.z-p.h/2+h];
    const ci=B.v(a,cc[0],cc[1],cc[2],n[0],n[1],n[2],(r[0]+r[2])/2,(r[1]+r[3])/2,tint,cc[0]+n[0]*.06,cc[1]+n[1]*.06,cc[2]+n[2]*.06,0),ring=[];
    for(let i=0;i<seg;i++){const t=i/seg*Math.PI*2,q=P(t,h);ring.push(B.v(a,q[0],q[1],q[2],n[0],n[1],n[2],(r[0]+r[2])/2+Math.cos(t)*(r[2]-r[0])/2,(r[1]+r[3])/2+Math.sin(t)*(r[3]-r[1])/2,tint,q[0]+n[0]*.06,q[1]+n[1]*.06,q[2]+n[2]*.06,0));}
    for(let i=0;i<seg;i++){const A=a.p.slice(ci*3,ci*3+3),Bq=a.p.slice(ring[i]*3,ring[i]*3+3),C=a.p.slice(ring[(i+1)%seg]*3,ring[(i+1)%seg]*3+3);
      const e1=[Bq[0]-A[0],Bq[1]-A[1],Bq[2]-A[2]],e2=[C[0]-A[0],C[1]-A[1],C[2]-A[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
      if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]>0)a.idx.push(ci,ring[i],ring[(i+1)%seg]);else a.idx.push(ci,ring[(i+1)%seg],ring[i]);}}
}
function facGeomAll(W){const B=facBuilder();facGeomWorld(W,B);facGeomBoxes(W,B);facGeomRails(W,B);facGeomFrames(W,B);facGeomLights(W,B);facGeomVents(W,B);facGeomProps(W,B);W.B=B;return B;}
/* ---------- the light bake: every vertex gets the light of the tubes that can reach it (with shadows), the light
   bounced off the floor under each tube, and ambient occlusion in corners. Red emergency lamps go to a second channel
   so they stay on when the power fails. ---------- */
function facLightsPrep(W){
  const out=[];
  for(const l of W.lights){if(l.dead||l.px==null)continue;const col=FLC[l.col]||FLC.cyan,I=(l.col==='red'?3.2:l.col==='warm'?2.7:2.9)*(l.dim||1);
    const S=[];if(l.wallL){S.push([l.px,l.py,l.pz]);}else{const ax=l.ax==='x';for(const t of[-.42,0,.42])S.push([l.px+(ax?t:0),l.py,l.pz+(ax?0:t)]);}
    const L={x:l.px,y:l.py,z:l.pz,S,col,I,red:l.col==='red',wall:!!l.wallL,nx:l.nx||0,nz:l.nz||0,d0:l.col==='red'?3.2:l.wallL?2:3,R:l.col==='red'?12:l.wallL?7:10};out.push(L);
    /* light bounced off the floor below a ceiling tube: a weak, wide upward glow */
    if(!l.wallL){let fy=l.py-1;while(fy>l.py-4.5&&facAir(W,l.px,fy-.1,l.pz))fy-=.25;out.push({x:l.px,y:fy+.3,z:l.pz,S:[[l.px,fy+.3,l.pz]],col,I:I*.2,red:L.red,bounce:1,d0:3.6,R:8});}
  }
  const H=new Map();for(let i=0;i<out.length;i++){const L=out[i],r=L.R;for(let j=Math.floor((L.z-r)/4);j<=Math.floor((L.z+r)/4);j++)for(let k=Math.floor((L.x-r)/4);k<=Math.floor((L.x+r)/4);k++){const key=j*100+k;let a=H.get(key);if(!a)H.set(key,a=[]);a.push(i);}}
  W.BL=out;W.BLH=H;
}
/* how much of the way from a to b is clear (1 = clear, 0 = blocked; props let a little through) */
function facMarch(W,ax,ay,az,bx,by,bz,skip){
  const dx=bx-ax,dy=by-ay,dz=bz-az,L=Math.hypot(dx,dy,dz);if(L<.05)return 1;const st=.22,n=Math.floor((L-.12)/st),V=W.V;let tr=1;
  for(let i=Math.ceil((skip||.08)/st);i<=n;i++){const t=i*st/L,x=ax+dx*t,y=ay+dy*t,z=az+dz*t,ii=(x/FC)|0,jj=(z/FC)|0,kk=(y/FVY)|0;
    if(x<0||z<0||y<0||ii>=FNX||jj>=FNZ||kk>=FNY)return 0;const v=V[(jj*FNX+ii)*FNY+kk];if(v===1)return 0;if(v===2){tr*=.5;if(tr<.06)return 0;}}
  return tr;}
const FAO=[[.7,.7,0],[-.7,.7,0],[0,.7,.7],[0,.7,-.7],[.5,.4,.5],[-.5,.4,-.5],[.5,.4,-.5],[-.5,.4,.5]];
function facBakeVert(W,px,py,pz,nx,ny,nz,sx,sy,sz,out,o){
  const kd=facKindAt(W,Math.min(FNZ-1,Math.max(0,(sz/FC)|0))*FNX+Math.min(FNX-1,Math.max(0,(sx/FC)|0)),sy),warm=FPLA(kd);
  /* ambient occlusion: short rays around the normal */
  let occ=0;{let tx=Math.abs(ny)>.9?1:0,ty=Math.abs(ny)>.9?0:1,tz=0;let bx_=ny*tz-nz*ty,by_=nz*tx-nx*tz,bz_=nx*ty-ny*tx;const bl=Math.hypot(bx_,by_,bz_)||1;bx_/=bl;by_/=bl;bz_/=bl;
    tx=by_*nz-bz_*ny;ty=bz_*nx-bx_*nz;tz=bx_*ny-by_*nx;
    for(const d of FAO){const rx=tx*d[0]+nx*d[1]+bx_*d[2],ry=ty*d[0]+ny*d[1]+by_*d[2],rz=tz*d[0]+nz*d[1]+bz_*d[2];
      for(const r of[.28,.6]){const v=facVoxAt(W,sx+rx*r,sy+ry*r,sz+rz*r);if(v){occ+=r<.3?.09:.035;break;}}}}
  const ao=Math.max(.3,1-occ);
  let r=(warm?.03:.016)*ao,g=(warm?.025:.026)*ao,b=(warm?.017:.03)*ao,er=0,eg=0,eb=0,lx=0,ly=0,lz=0,tot=0;
  const cand=W.BLH.get(Math.floor(pz/4)*100+Math.floor(px/4))||[];
  for(const li of cand){const L=W.BL[li];if(Math.abs(L.y-py)>6.5)continue;const ns=L.S.length;
    for(const S of L.S){const dx=S[0]-px,dy=S[1]-py,dz=S[2]-pz,d2=dx*dx+dy*dy+dz*dz;if(d2>L.R*L.R)continue;const d=Math.sqrt(d2)||1e-3,lxn=dx/d,lyn=dy/d,lzn=dz/d;
      const ndl=nx*lxn+ny*lyn+nz*lzn;if(ndl<=0)continue;
      /* how much the source sends this way: tubes shine down, the floor bounce shines up, wall lamps shine out */
      let em;if(L.bounce)em=Math.max(0,-lyn)*.7+.3;else if(L.wall)em=Math.max(0,-(lxn*L.nx+lzn*L.nz))*.7+.3;else em=Math.pow(Math.max(0,lyn),.85)*.88+.12;
      const fade=d>L.R*.65?1-(d-L.R*.65)/(L.R*.35):1,c=L.I*em*ndl*fade/(1+d2/(L.d0*L.d0))/ns;if(c<.003)continue;
      const vis=facMarch(W,sx,sy,sz,S[0],S[1],S[2]);if(vis<=0)continue;const v=c*vis*(.55+.45*ao);
      if(L.red){er+=L.col[0]*v;eg+=L.col[1]*v;eb+=L.col[2]*v;}else{r+=L.col[0]*v;g+=L.col[1]*v;b+=L.col[2]*v;}
      if(!L.bounce){lx+=lxn*v;ly+=lyn*v;lz+=lzn*v;tot+=v;}}}
  out[o]=r;out[o+1]=g;out[o+2]=b;out[o+3]=er;out[o+4]=eg;out[o+5]=eb;out[o+6]=lx;out[o+7]=ly;out[o+8]=lz;out[o+9]=tot;
}
/* bake every mesh; yields to the page now and then so the loading bar moves */
async function facBake(W,prog){
  facLightsPrep(W);const list=[...W.B.acc.values()].filter(a=>a.m!=='emis');let tot=0,done=0;for(const a of list)tot+=a.p.length/3;
  let last=performance.now();
  for(const a of list){const n=a.p.length/3,out=new Float32Array(n*10);
    for(let v=0;v<n;v++){facBakeVert(W,a.p[v*3],a.p[v*3+1],a.p[v*3+2],a.n[v*3],a.n[v*3+1],a.n[v*3+2],a.s[v*3],a.s[v*3+1],a.s[v*3+2],out,v*10);
      if((++done&511)===0&&performance.now()-last>40){if(prog)prog(done/tot);await new Promise(r=>setTimeout(r,0));last=performance.now();}}
    a.bk=out;}
  if(prog)prog(1);
}
/* light at a point for moving things (the creature, your hands): no normal, so half of what a surface facing the light gets */
function facProbe(W,x,y,z){const key=((z/1)|0)*4096+((x/1)|0)*64+((y/1)|0);let c=W.PC.get(key);if(c)return c;const o=new Float32Array(10);
  let r=0,g=0,b=0,er=0,eg=0,eb=0;for(const [nx,ny,nz] of[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){facBakeVert(W,(x|0)+.5,(y|0)+.5,(z|0)+.5,nx,ny,nz,(x|0)+.5,(y|0)+.5,(z|0)+.5,o,0);r+=o[0];g+=o[1];b+=o[2];er+=o[3];eg+=o[4];eb+=o[5];}
  c=[r/3.2,g/3.2,b/3.2,er/3.2,eg/3.2,eb/3.2];W.PC.set(key,c);return c;}
