/* ===== BUILD 3.4: dungeon textures =====
   The walls, floors and ceilings were 32px tiles blown up so one 3 m wall showed two huge even bricks with square moss
   patches, which read as Minecraft. They are now painted at 128px per tile: irregular cut stone in many courses, worn
   flagstone floors, rough soot-stained vaults, recessed mortar, chipped corners, cracks, damp streaks and moss that
   creeps along the joints. Only function declarations here: they run while the atlas is built, before this module's
   position in the script is reached. */
function dtNoise(x,y,p,s){/* tileable value noise with period p */const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const m=q=>((q%p)+p)%p,a=Hh(m(ix),m(iy),s),b=Hh(m(ix+1),m(iy),s),c=Hh(m(ix),m(iy+1),s),d=Hh(m(ix+1),m(iy+1),s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function dtFbm(x,y,s,base){/* 128px tile, periods divide 128 */let t=0,w=.5,f=base||8;for(let o=0;o<4;o++){t+=w*dtNoise(x*f/128,y*f/128,f,s+o*17);w*=.5;f*=2;}return t/.9375;}
function dtClamp(v){return v<0?0:v>255?255:v;}
/* a course-and-stone layout for a 128x128 tile that wraps on all sides */
function dtLayout(seed,rowMin,rowMax,wMin,wMax){const rows=[];let y=0,r=0;
  while(y<128){let h=rowMin+Math.floor(Hh(r,1,seed)*(rowMax-rowMin+1));if(128-(y+h)<rowMin)h=128-y;rows.push({y0:y,h,stones:[]});y+=h;r++;}
  rows.forEach((row,ri)=>{const off=Math.floor(Hh(ri,7,seed)*128);let x=0,k=0;while(x<128){let w=wMin+Math.floor(Hh(ri,k+20,seed)*(wMax-wMin+1));if(128-(x+w)<wMin)w=128-x;row.stones.push({x0:(x+off)%128,w,t:Hh(ri*31+k,3,seed),hu:Hh(ri*31+k,5,seed),cr:Hh(ri*31+k,9,seed)});x+=w;k++;}});
  const map=new Array(128*128);
  for(const row of rows)for(let yy=0;yy<row.h;yy++)for(const st of row.stones)for(let xx=0;xx<st.w;xx++){const X=(st.x0+xx)%128,Y=row.y0+yy;map[Y*128+X]={st,lx:xx,ly:yy,w:st.w,h:row.h};}
  return map;}
function dtStone(kind){/* returns a painter (X,Y)->[r,g,b] for a 128px tile */
  const P={wall:{seed:301,rows:[9,13],w:[18,34],base:[118,114,108],mort:[30,28,26],moss:0,damp:.5},
    moss:{seed:302,rows:[9,13],w:[18,34],base:[112,112,102],mort:[28,30,24],moss:1,damp:.8},
    dark:{seed:303,rows:[10,14],w:[20,36],base:[84,82,90],mort:[22,22,26],moss:0,damp:.3},
    floor:{seed:304,rows:[26,40],w:[24,46],base:[104,98,90],mort:[34,30,26],moss:0,damp:0,floor:1},
    ceil:{seed:305,rows:[18,30],w:[22,44],base:[74,70,68],mort:[20,19,18],moss:0,damp:0,ceil:1}}[kind];
  const DC=dtStone.cache||(dtStone.cache={}),L=DC[kind]||(DC[kind]=dtLayout(P.seed,P.rows[0],P.rows[1],P.w[0],P.w[1]));
  return (X,Y)=>{const c=L[Y*128+X];if(!c)return P.mort;const {st,lx,ly,w,h}=c;
    /* mortar: 2px joints, rounded corners and chipped edges */
    const ex=Math.min(lx,w-1-lx),ey=Math.min(ly,h-1-ly),chip=Hh(X>>1,Y>>1,P.seed+40)>.82?1:0;
    const corner=ex<3&&ey<3&&(3-ex)*(3-ey)>3;
    if(ex<1+chip*(ey<2?1:0)||ey<1||corner){const n=dtFbm(X,Y,P.seed+50,16);let m=[P.mort[0]*(.8+n*.5),P.mort[1]*(.8+n*.5),P.mort[2]*(.8+n*.5)];
      if(P.moss&&Hh(X>>2,Y>>2,P.seed+60)>.45&&dtFbm(X,Y,P.seed+61,8)>.5)m=[30+n*20,52+n*30,24+n*12];
      if(P.floor){m=[m[0]*1.1,m[1]*.95,m[2]*.8];}return m;}
    /* stone body: per-stone tone, slight hue drift, layered grain, bevelled edges lit from the top-left */
    let k=.74+st.t*.36+(dtFbm(X,Y,P.seed,8)-.5)*.34+(Hh(X,Y,P.seed+7)-.5)*.1;
    if(P.floor)k+= (1-Math.min(1,(Math.min(ex,ey))/8))*-.12+(dtFbm(X,Y,P.seed+3,4)-.5)*.12;/* worn centres, darker edges */
    if(ex<3||ey<3){const tl=(lx<3||ly<3),br=(lx>w-4||ly>h-4);if(tl&&!br)k*=1.13;else if(br)k*=.8;}
    /* cracks: a jagged line through some stones */
    if(st.cr>.7){const cx=(lx/w-.5),cy=(ly/h-.5),line=Math.abs(cy*1.6-cx*(st.hu-.5)*3+Math.sin(lx*.9+st.t*9)*.06);if(line<.045)k*=.45;}
    /* pits and flecks */
    const hp=Hh(X,Y,P.seed+80);if(hp>.975)k*=.6;else if(hp<.02)k*=1.18;
    let col=[P.base[0]*k*(1+(st.hu-.5)*.12),P.base[1]*k,P.base[2]*k*(1-(st.hu-.5)*.12)];
    /* damp streaks running down the wall, and moss creeping from the joints */
    if(P.damp){const s=dtFbm(X*4,Y,P.seed+90,8);if(s>.62){const q=(s-.62)*2.2*P.damp;col=[col[0]*(1-q*.55),col[1]*(1-q*.5),col[2]*(1-q*.45)];}}
    if(P.moss){const m=dtFbm(X,Y,P.seed+95,8)+(Y/128)*.35-(Math.min(ex,ey)/10);if(m>.62){const q=Math.min(1,(m-.62)*3);col=[col[0]*(1-q)+44*q,col[1]*(1-q)+70*q,col[2]*(1-q)+34*q];}}
    if(P.ceil){const s=dtFbm(X,Y,P.seed+99,4);col=[col[0]*(.7+s*.5),col[1]*(.7+s*.5),col[2]*(.72+s*.5)];}
    return [dtClamp(col[0]),dtClamp(col[1]),dtClamp(col[2])];};
}
/* designed tiles (doors, traps, the special floors) keep their 32px art, upscaled 4x with fine grain so they sit with the new stone */
function dtUp(fn,ti){const H=hiTile(fn,ti);return (X,Y)=>{const c=H(X>>1,Y>>1),k=1+(Hh(X,Y,500+ti)-.5)*.08;return [dtClamp(c[0]*k),dtClamp(c[1]*k),dtClamp(c[2]*k)];};}
function dtAtlas(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
  const paint=[dtStone('wall'),dtStone('moss'),dtStone('floor'),dtStone('ceil')];
  TILES.forEach((fn,i)=>tileCanvas(i<4?paint[i]:i===9?dtStone('dark'):dtUp(fn,i),128,(i&3)*128,(i>>2)*128,g));
  tileCanvas((X,Y)=>PLAT_TOP(X>>1,Y>>1),128,256,384,g);tileCanvas((X,Y)=>PLAT_SIDE(X>>1,Y>>1),128,384,384,g);
  const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.minFilter=T.LinearMipmapNearestFilter;t.generateMipmaps=true;return t;}
