import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]);s=s.replace(a,b)

# ================= ROOMS: bigger, taller, with cover and structure =================
rep("const cols=f<4?3:4,rows=f<2?2:f<8?3:4,S=15,W=cols*S+1,H=rows*S+1,N=cols*rows;",
    "const cols=f<4?3:4,rows=f<2?2:f<8?3:4,S=17,W=cols*S+1,H=rows*S+1,N=cols*rows;")
rep("""    let w=ri(6,10),h=sp?ri(5,7):ri(6,10);if(s===exit&&boss){w=10;h=8;}
    const x0=i*S+3+ri(0,10-w),y0=sp?j*S+5+ri(0,8-h):j*S+3+ri(0,10-h);""",
"""    let w=s===start?ri(6,7):ri(8,12),h=s===start?ri(5,6):sp?ri(6,8):ri(8,12);if(s===exit&&boss){w=12;h=9;}
    const x0=i*S+3+ri(0,12-w),y0=sp?j*S+5+ri(0,9-h):j*S+3+ri(0,12-h);""")
ARCH=r'''  /* room layouts: every fighting room gets a shape that matters. Cover (crates, barricades, barrels) stops bullets and spells, can be climbed
     for height, and monsters walk around it. Full-height walls make chokepoints. A layout is undone if it would cut the room in two,
     if it crowds a doorway, or if it breaks the walk from the start of the floor to any door or to the exit. */
  const cover=new Uint8Array(W*H);
  const isDoorish=v=>v===2||v===3||v===4;
  const nearDoor=(x,y)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(Math.abs(dx)+Math.abs(dy)>2)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;{const kk=yy*W+xx,v=grid[kk];if(isDoorish(v)||(v===1&&roomOf[kk]<0))return true;}}return false;};
  for(const r of rooms){r._pl=[];r._ch=[];r._cv=[];}
  for(const r of rooms){
    if(r.idx===start||r.idx===special||(r.idx===exit&&boss))continue;
    const w=r.x1-r.x0+1,h=r.y1-r.y0+1,PL=r._pl,ch=r._ch,cv=r._cv;
    const B=(a,b,c,d,ht,y0,kind,ori)=>PL.push({x0:Math.min(a,c)*3,z0:Math.min(b,d)*3,x1:Math.max(a,c)*3,z1:Math.max(b,d)*3,y0:y0||0,y1:ht,kind:kind||null,ori:ori||null});
    const wall=(x,y)=>{if(x<r.x0||x>r.x1||y<r.y0||y>r.y1||grid[y*W+x]!==1||nearDoor(x,y))return;grid[y*W+x]=0;ch.push(y*W+x);};
    const crate=(x,y,ht,sz,top,kind)=>{if(x<r.x0+1||x>r.x1-1||y<r.y0+1||y>r.y1-1||grid[y*W+x]!==1||cover[y*W+x]||nearDoor(x,y))return false;const m=(1-(sz||.78))/2;B(x+m,y+m,x+1-m,y+1-m,ht,0,kind||'crate');if(top)B(x+.26,y+.26,x+.74,y+.74,ht+.6,ht,'crate');cover[y*W+x]=1;cv.push(y*W+x);return true;};
    const fence=(x,y,along)=>{if(x<r.x0+1||x>r.x1-1||y<r.y0+1||y>r.y1-1||grid[y*W+x]!==1||cover[y*W+x]||nearDoor(x,y))return false;
      if(along)B(x+.32,y,x+.68,y+1,1.15,0,'fence','z');else B(x,y+.32,x+1,y+.68,1.15,0,'fence','x');cover[y*W+x]=1;cv.push(y*W+x);return true;};
    const ix0=r.x0+2,ix1=r.x1-2,iy0=r.y0+2,iy1=r.y1-2,cx=(r.x0+r.x1)>>1,cy=(r.y0+r.y1)>>1;
    if(w<8||h<8){for(let i=0;i<ri(1,3);i++)crate(ri(ix0,ix1),ri(iy0,iy1),1.1,.7,Math.random()<.3,Math.random()<.4?'barrel':'crate');r.kind='small';}
    else{
    const kind=pick(['pillars','barricade','dais','split','store','barricade','dais']);r.kind=kind;
    if(kind==='pillars'){for(let x=ix0;x<=ix1;x+=3)for(let y=iy0;y<=iy1;y+=3)if(Math.random()<.8)wall(x,y);for(let i=0;i<3;i++)crate(ri(ix0,ix1),ri(iy0,iy1),1.1,.75,false,Math.random()<.5?'barrel':'crate');}
    else if(kind==='barricade'){const along=w>=h;for(const q of[.34,.66]){const line=along?Math.round(r.x0+(w-1)*q):Math.round(r.y0+(h-1)*q),a0=along?r.y0+1:r.x0+1,a1=along?r.y1-1:r.x1-1,mid=(a0+a1)>>1;
        for(let a=a0;a<=a1;a++){if(a===mid||((a-a0)%3===2))continue;along?fence(line,a,true):fence(a,line,false);}}
      crate(r.x0+1,r.y0+1,1.1,.8,false,'barrel');crate(r.x1-1,r.y1-1,1.1,.8,true,'crate');}
    else if(kind==='dais'){/* a raised stone dais in the middle: hold it for the high ground. Steps on two sides. */
      const dx0=cx-1,dx1=cx+1,dy0=cy-1,dy1=cy+1;let ok=true;for(let x=dx0-1;x<=dx1+1;x++)for(let y=dy0-1;y<=dy1+1;y++)if(grid[y*W+x]!==1||nearDoor(x,y))ok=false;
      if(ok){B(dx0,dy0,dx1+1,dy1+1,1.05,0,'dais');for(let x=dx0;x<=dx1;x++)for(let y=dy0;y<=dy1;y++){cover[y*W+x]=1;cv.push(y*W+x);}
        const sx=Math.random()<.5;if(sx){B(dx0-.6,cy+.1,dx0,cy+.9,.52,0,'step');B(dx1+1,cy+.1,dx1+1.6,cy+.9,.52,0,'step');}else{B(cx+.1,dy0-.6,cx+.9,dy0,.52,0,'step');B(cx+.1,dy1+1,cx+.9,dy1+1.6,.52,0,'step');}
        for(const [x,y] of[[dx0-2,dy0-2],[dx1+2,dy0-2],[dx0-2,dy1+2],[dx1+2,dy1+2]])wall(x,y);}
      else for(let i=0;i<4;i++)crate(ri(ix0,ix1),ri(iy0,iy1),1.1,.75);}
    else if(kind==='split'){/* a wall across the room with two gaps: the gaps are chokepoints */
      const along=w>=h;if(along){const x=cx,g1=r.y0+((h/4)|0),g2=r.y1-((h/4)|0);for(let y=r.y0;y<=r.y1;y++)if(y!==g1&&y!==g2)wall(x,y);crate(x-2,g1,1.1,.8,false,'barrel');crate(x+2,g2,1.1,.8);}
      else{const y=cy,g1=r.x0+((w/4)|0),g2=r.x1-((w/4)|0);for(let x=r.x0;x<=r.x1;x++)if(x!==g1&&x!==g2)wall(x,y);crate(g1,y-2,1.1,.8,false,'barrel');crate(g2,y+2,1.1,.8);}}
    else{/* storeroom: crates and barrels stacked at different heights */
      for(let i=0;i<ri(6,9);i++){const br=Math.random()<.35;crate(ri(ix0-1,ix1+1),ri(iy0-1,iy1+1),br?1.05:rnd(.85,1.4),br?.8:rnd(.65,.85),!br&&Math.random()<.35,br?'barrel':'crate');}}}
    /* undo the layout if any open cell of the room can no longer reach the rest */
    const seen=new Uint8Array(W*H),q=[];let tot=0;for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){const k=y*W+x;if(grid[k]!==0&&!cover[k]){tot++;if(!q.length){q.push(k);seen[k]=1;}}}
    for(let i=0;i<q.length;i++){const k=q[i];for(const o of[1,-1,W,-W]){const m=k+o,mx=m%W,my=(m/W)|0;if(mx<r.x0||mx>r.x1||my<r.y0||my>r.y1||seen[m]||grid[m]===0||cover[m])continue;seen[m]=1;q.push(m);}}
    if(q.length<tot){for(const k of ch)grid[k]=1;for(const k of cv)cover[k]=0;PL.length=0;ch.length=0;cv.length=0;r.kind='plain1';}
  }
  /* the whole floor must still walk: from the start stub to every door, the exit stub and every open room cell. If not, undo layouts until it does. */
  const walkOK=()=>{const seen=new Uint8Array(W*H),s0=sStub.y*W+sStub.x,q=[s0];seen[s0]=1;
    for(let i=0;i<q.length;i++){const k=q[i];for(const o of[1,-1,W,-W]){const m=k+o;if(m<0||m>=W*H||seen[m]||grid[m]===0||cover[m])continue;seen[m]=1;q.push(m);}}
    for(const d of doors)if(!seen[d.y*W+d.x])return false;if(!seen[eStub.y*W+eStub.x])return false;
    for(let k=0;k<W*H;k++)if(roomOf[k]>=0&&grid[k]!==0&&!cover[k]&&!seen[k])return false;return true;};
  for(let n=rooms.length-1;n>=0&&!walkOK();n--){const r=rooms[n];if(!r._ch.length&&!r._cv.length&&!r._pl.length)continue;for(const k of r._ch)grid[k]=1;for(const k of r._cv)cover[k]=0;r._pl.length=0;r._ch.length=0;r._cv.length=0;r.kind='plain2';}
  const plats=[];for(const r of rooms){for(const p of r._pl)plats.push(p);delete r._pl;delete r._ch;delete r._cv;}
  return {W,H,S,grid,roomOf,rooms,doors,start,exit,path,sStub,eStub,keyRooms,boss,special,vault,campChild,campDoor,spawnHall,floor:f,plats:plats.length?plats:null,cover,tallAll:true};'''
rep("""  for(const r of rooms){if(r.idx===start||r.idx===special||(r.idx===exit&&boss))continue;const w=r.x1-r.x0+1,h=r.y1-r.y0+1;if(w<8||h<8||Math.random()<.3)continue;
    for(const [px,py] of[[r.x0+2,r.y0+2],[r.x1-2,r.y0+2],[r.x0+2,r.y1-2],[r.x1-2,r.y1-2]])if(Math.random()<.85)grid[py*W+px]=0;}
  return {W,H,S,grid,roomOf,rooms,doors,start,exit,path,sStub,eStub,keyRooms,boss,special,vault,campChild,campDoor,spawnHall,floor:f};""",ARCH)
# all rooms get the high ceiling (corridors stay low), so rooms feel like halls instead of boxes
rep("tallK=k=>(L.boss||L.tall)&&L.roomOf[k]===L.exit;","tallK=k=>L.roomOf[k]>=0&&(!!L.tallAll&&L.roomOf[k]!==L.start||(L.boss||L.tall)&&L.roomOf[k]===L.exit);")
rep("(L.boss||L.tall)&&r.idx===L.exit?HB","(L.tallAll&&r.idx!==L.start||(L.boss||L.tall)&&r.idx===L.exit)?HB",3)
rep("const ceilAt=(x,z)=>(L.boss||L.tall)&&L.roomOf[cellIdx(x,z)]===L.exit?HB:WALLH;","const ceilAt=(x,z)=>{const q=L.roomOf[cellIdx(x,z)];return (q>=0&&(L.tallAll&&q!==L.start||(L.boss||L.tall)&&q===L.exit))?HB:WALLH;};")
# monsters path around cover; nothing spawns inside a block; no traps under blocks
rep("const g=L.grid[m];if(g===0||(g===2&&L.doorAt[m].open<.85))continue;flow[m]=d;q.push(m);","const g=L.grid[m];if(g===0||(g===2&&L.doorAt[m].open<.85)||(L.cover&&L.cover[m]))continue;flow[m]=d;q.push(m);")
rep("function roomCell(r,used){for(let n=0;n<30;n++){const x=ri(r.x0,r.x1),y=ri(r.y0,r.y1),k=y*L.W+x;if(L.grid[k]===0)continue;","function roomCell(r,used){for(let n=0;n<30;n++){const x=ri(r.x0,r.x1),y=ri(r.y0,r.y1),k=y*L.W+x;if(L.grid[k]===0||(L.cover&&L.cover[k]))continue;")
rep("const addTrap=(x,y)=>{const k=y*W+x;if(trapAt[k]||g[k]!==1)return;","const addTrap=(x,y)=>{const k=y*W+x;if(trapAt[k]||g[k]!==1||(L.cover&&L.cover[k]))return;")

# ================= hooks for bosses / trials =================
rep("  bossE=null;SIDN=0;reseed(f,1);","  try{dun2Pick(f,R);}catch(e){}\n  bossE=null;SIDN=0;reseed(f,1);")
rep("    if(PVP.on||r.idx===L.start||(r.idx===L.special&&!L.vault))return;","    if(PVP.on||r.idx===L.start||(r.idx===L.special&&!L.vault)||r.trial)return;")
rep("bossE.kingWoke=0;}budget*=.4;}","bossE.kingWoke=0;}budget*=.4;try{boss2Init(bossE,r);}catch(e){}}")
rep("try{fx2Tick(dt);}catch(e){}","try{fx2Tick(dt);}catch(e){}try{dun2Tick(dt);}catch(e){}")
open(p,'w',encoding='utf-8').write(s);print('p4 ok')
