/* ===== BUILD 3.4/3.5: dungeon textures =====
   The walls, floors and ceilings were 32px tiles blown up, so one 3 m wall showed two huge even bricks with square moss
   patches, which read as Minecraft. They are painted as 64px tiles in the same pixel scale as the rest of the game:
   irregular cut stone in many courses, worn flagstone floors, rough soot-stained vaults, dark mortar, chipped corners,
   cracks, damp streaks and moss that creeps along the joints.
   3.5: every wall variant (plain, mossy, dark) shares one stone layout, so neighbouring wall faces line up instead of
   breaking at each corner; textures stay crisp at every distance (nearest filtering with mip levels), so near and far
   walls look the same.
   Only function declarations here: they run while the atlas is built, before this module's place in the script. */
function dtNoise(x,y,p,s){/* tileable value noise with period p */const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const m=q=>((q%p)+p)%p,a=Hh(m(ix),m(iy),s),b=Hh(m(ix+1),m(iy),s),c=Hh(m(ix),m(iy+1),s),d=Hh(m(ix+1),m(iy+1),s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function dtFbm(x,y,s,base){/* 64px tile; every period divides 64 so the tile wraps */let t=0,w=.5,f=base||8;for(let o=0;o<3;o++){t+=w*dtNoise(x*f/64,y*f/64,f,s+o*17);w*=.5;f*=2;}return t/.875;}
function dtClamp(v){return v<0?0:v>255?255:v;}
/* a course-and-stone layout for a 64x64 tile that wraps on all four sides */
function dtLayout(seed,rowMin,rowMax,wMin,wMax){const N=64,rows=[];let y=0,r=0;
  while(y<N){let h=rowMin+Math.floor(Hh(r,1,seed)*(rowMax-rowMin+1));if(N-(y+h)<rowMin)h=N-y;rows.push({y0:y,h,stones:[]});y+=h;r++;}
  rows.forEach((row,ri)=>{const off=Math.floor(Hh(ri,7,seed)*N);let x=0,k=0;while(x<N){let w=wMin+Math.floor(Hh(ri,k+20,seed)*(wMax-wMin+1));if(N-(x+w)<wMin)w=N-x;
    row.stones.push({x0:(x+off)%N,w,t:Hh(ri*31+k,3,seed),hu:Hh(ri*31+k,5,seed),cr:Hh(ri*31+k,9,seed)});x+=w;k++;}});
  const map=new Array(N*N);
  for(const row of rows)for(let yy=0;yy<row.h;yy++)for(const st of row.stones)for(let xx=0;xx<st.w;xx++){const X=(st.x0+xx)%N,Y=row.y0+yy;map[Y*N+X]={st,lx:xx,ly:yy,w:st.w,h:row.h};}
  return map;}
function dtStone(kind){/* a painter (X,Y)->[r,g,b] for one 64px tile */
  const P={wall:{lay:'w',base:[116,112,106],mort:[30,28,26],moss:0,damp:.5,s:301},
    moss:{lay:'w',base:[112,111,102],mort:[28,30,24],moss:1,damp:.7,s:301},
    dark:{lay:'w',base:[86,84,92],mort:[22,22,26],moss:0,damp:.3,s:301},
    floor:{lay:'f',base:[104,98,90],mort:[32,28,24],floor:1,s:304},
    ceil:{lay:'c',base:[78,74,70],mort:[22,20,19],ceil:1,s:305}}[kind];
  const LAY={w:[301,5,7,9,17],f:[304,13,20,12,23],c:[305,9,15,11,22]}[P.lay];
  const DC=dtStone.cache||(dtStone.cache={}),L=DC[P.lay]||(DC[P.lay]=dtLayout(LAY[0],LAY[1],LAY[2],LAY[3],LAY[4]));
  return (X,Y)=>{const c=L[Y*64+X];if(!c)return P.mort;const {st,lx,ly,w,h}=c;
    /* mortar: a 1px joint on the top and left of every stone, with the odd chipped corner */
    const chip=lx<2&&ly<1||lx<1&&ly<2?Hh(X,Y,P.s+40)>.55:false;
    if(lx===0||ly===0||chip){const n=dtFbm(X,Y,P.s+50,16);let m=[P.mort[0]*(.8+n*.5),P.mort[1]*(.8+n*.5),P.mort[2]*(.8+n*.5)];
      if(P.moss&&dtFbm(X,Y,P.s+61,8)>.47)m=[30+n*18,50+n*26,24+n*10];
      if(P.floor)m=[m[0]*1.12,m[1]*.96,m[2]*.8];return m;}
    /* stone body: its own tone, a slight hue drift, grain, and a bevel lit from the top left */
    let k=.76+st.t*.34+(dtFbm(X,Y,P.s,8)-.5)*.3+(Hh(X,Y,P.s+7)-.5)*.08;
    if(lx===1||ly===1)k*=1.14;else if(lx===w-1||ly===h-1)k*=.8;
    if(P.floor){const e=Math.min(lx,ly,w-1-lx,h-1-ly);k+=(e<2?-.08:0)+(dtFbm(X,Y,P.s+3,4)-.5)*.1;}
    /* a crack across some bigger stones */
    if(st.cr>.78&&h>=7&&w>=12){const cx=lx/w-.5,cy=ly/h-.5;if(Math.abs(cy*1.4-cx*(st.hu-.5)*2.4)<.08&&lx>1&&lx<w-2)k*=.55;}
    if(Hh(X,Y,P.s+80)>.97)k*=.72;
    let col=[P.base[0]*k*(1+(st.hu-.5)*.1),P.base[1]*k,P.base[2]*k*(1-(st.hu-.5)*.1)];
    /* damp streaks running down, and moss creeping out of the joints toward the floor */
    if(P.damp){const s=dtFbm(X*4,Y,P.s+90,4);if(s>.62){const q=(s-.62)*2.2*P.damp;col=[col[0]*(1-q*.5),col[1]*(1-q*.46),col[2]*(1-q*.42)];}}
    if(P.moss){const m=dtFbm(X,Y,P.s+95,8)+(Y/64)*.3-Math.min(lx,ly,w-1-lx,h-1-ly)*.12;if(m>.6){const q=Math.min(1,(m-.6)*3);col=[col[0]*(1-q)+44*q,col[1]*(1-q)+68*q,col[2]*(1-q)+34*q];}}
    if(P.ceil){const s=dtFbm(X,Y,P.s+99,4);col=[col[0]*(.72+s*.45),col[1]*(.72+s*.45),col[2]*(.74+s*.45)];}
    return [dtClamp(col[0]),dtClamp(col[1]),dtClamp(col[2])];};
}
function dtAtlas(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  const paint=[dtStone('wall'),dtStone('moss'),dtStone('floor'),dtStone('ceil')];
  /* doors, traps and the special floors keep their own art at the same 64px scale */
  TILES.forEach((fn,i)=>tileCanvas(i<4?paint[i]:i===9?dtStone('dark'):hiTile(fn,i),64,(i&3)*64,(i>>2)*64,g));
  tileCanvas(PLAT_TOP,64,128,192,g);tileCanvas(PLAT_SIDE,64,192,192,g);
  /* crisp pixels at every distance, with mip levels so far walls do not shimmer */
  const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.minFilter=T.NearestMipmapLinearFilter;t.generateMipmaps=true;return t;}
