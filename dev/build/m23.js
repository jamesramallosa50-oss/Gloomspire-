/* ===== BUILD 3.15: THE FACILITY — part 2: textures, materials, the lighting shader and the screen effects =====
   All textures are painted in code when the mode starts: board-formed concrete, yellow plaster over a red dado,
   glossy floor tiles, troweled concrete, a water-stained ceiling, diamond plate, painted steel and a prop atlas.
   Each surface texture also gets a normal map, so the flashlight rakes across grout, seams and peeling paint. */
function facTileNoise(P,seed){/* a tileable lattice of random values with period P */
  const R=facRng(seed),L=new Float32Array(P*P);for(let i=0;i<P*P;i++)L[i]=R();
  return (x,y)=>{x=((x%P)+P)%P;y=((y%P)+P)%P;const xi=x|0,yi=y|0,xf=x-xi,yf=y-yi,x1=(xi+1)%P,y1=(yi+1)%P,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=L[yi*P+xi],b=L[yi*P+x1],c=L[y1*P+xi],d=L[y1*P+x1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
function facFbm(seed,base,oct){const N=[];for(let o=0;o<oct;o++)N.push(facTileNoise(base<<o,seed+o*101));
  return (u,v)=>{let s=0,a=.5,t=0;for(let o=0;o<oct;o++){s+=N[o](u*(base<<o),v*(base<<o))*a;t+=a;a*=.5;}return s/t;};}
/* a surface texture: paint(u,v,px,py) fills albedo (0..255), gloss (0..1) and height for every pixel */
function facSurf(w,h,paint,extra){
  const A=new Uint8Array(w*h*4),H=new Float32Array(w*h),o={r:0,g:0,b:0,s:0,h:0};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){o.r=o.g=o.b=128;o.s=.2;o.h=0;paint(x/w,y/h,x,y,o);const i=y*w+x;
    A[i*4]=Math.max(0,Math.min(255,o.r));A[i*4+1]=Math.max(0,Math.min(255,o.g));A[i*4+2]=Math.max(0,Math.min(255,o.b));A[i*4+3]=Math.max(0,Math.min(255,o.s*255));H[i]=o.h;}
  if(extra)extra(A,H,w,h);
  /* normal map from the height field (wrapping, so it tiles) */
  const Nm=new Uint8Array(w*h*3);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const hl=H[y*w+((x-1+w)%w)],hr=H[y*w+((x+1)%w)],hd=H[((y-1+h)%h)*w+x],hu=H[((y+1)%h)*w+x];
    let nx=(hl-hr)*.5,ny=(hd-hu)*.5,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;const i=(y*w+x)*3;Nm[i]=(nx*.5+.5)*255;Nm[i+1]=(ny*.5+.5)*255;Nm[i+2]=(nz*.5+.5)*255;}
  return {A,Nm,w,h};
}
function facDT(data,w,h,fmt){const t=new T.DataTexture(data,w,h,fmt||T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;
  try{t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}catch(_){}t.needsUpdate=true;return t;}
/* drawing helpers on the pixel arrays (after the per-pixel pass): blobs, streaks, cracks */
function facCrack(A,H,w,h,x,y,len,seed,dark){const R=facRng(seed);let a=R()*6.283;for(let i=0;i<len;i++){a+=(R()-.5)*.55;x+=Math.cos(a);y+=Math.sin(a);
  const xi=((Math.round(x)%w)+w)%w,yi=((Math.round(y)%h)+h)%h,k=yi*w+xi;A[k*4]*=dark;A[k*4+1]*=dark;A[k*4+2]*=dark;A[k*4+3]*=.6;H[k]-=1.1;
  if(R()<.02&&len>20){facCrack(A,H,w,h,x,y,len*.35|0,seed+i,dark);}}}
function facTextures(sc){
  sc=sc||1;const S=v=>Math.max(64,Math.round(v*sc));const out={};
  /* --- board-formed concrete (3.16): 3 m square, ten boards of 0.3 m. Each board has its own tone and a faint wood-grain
     imprint, the seams are thin with a small lip, the boards butt end to end here and there; a few small tie marks,
     very few pores, soft mottling and damp streaks running down. Smooth, like the reference, not pockmarked. --- */
  {const w=S(512),h=S(512),NB=10,n1=facFbm(11,4,5),n2=facFbm(12,16,3),grain=facFbm(13,4,3),st=facFbm(14,6,4),mot=facFbm(16,2,4),R=facRng(15),pores=[],ties=[];
    for(let i=0;i<60;i++)pores.push([R(),R(),.0008+R()*.0014]);
    for(let i=0;i<5;i++)ties.push([(i+.5)/5+(R()-.5)*.06,(1+Math.floor(R()*(NB-1)))/NB]);
    const boardOff=[],joint=[],grainK=[];for(let b=0;b<NB;b++){boardOff.push((R()-.5)*22);joint.push(R());grainK.push(.6+R()*.8);}
    out.wallC=facSurf(w,h,(u,v,px,py,o)=>{const b=Math.min(NB-1,Math.floor(v*NB)),fv=v*NB-b;
      const gn=grain(u+b*.37,v*20);
      let g=146+(n1(u,v)-.5)*30+(mot(u,v)-.5)*40+(n2(u,v)-.5)*8+boardOff[b]+(gn-.5)*16*grainK[b];
      let ht=(n2(u,v)-.5)*.25+(gn-.5)*.35*grainK[b]+boardOff[b]*.012;
      /* the seam between boards: a dark hairline, and the edge of the board above sits a touch proud */
      const sd=Math.min(fv,1-fv)*h/NB;if(sd<1.1){g-=24*(1-sd/1.1);ht-=.9*(1-sd/1.1);}else if(fv>.5&&sd<2.4){g+=2.5;ht+=.12;}
      /* boards butting end to end */
      {let du=Math.abs(u-joint[b]);du=Math.min(du,1-du)*w;if(du<.9){g-=18*(1-du/.9);ht-=.6;}}
      for(const q of ties){let dx=Math.abs(u-q[0]);dx=Math.min(dx,1-dx)*w;const dy=(v-q[1])*h,d=Math.hypot(dx,dy);if(d<2.6*sc){g*=.72;ht-=1.2*(1-d/(2.6*sc));}else if(d<4*sc){g+=5;}}
      /* damp running down from the top and pooling low */
      const s=st(u*3,v*.5),streak=Math.max(0,s-.56)*2*(.35+.65*v);g-=streak*34;const low=Math.max(0,.16-v)*3;g-=low*(mot(u*2,v)*30);
      o.r=g*.95;o.g=g;o.b=g*1.0;o.s=.1+streak*.45;o.h=ht;},
      (A,H,w,h)=>{for(const p of pores){const x=(p[0]*w)|0,y=(p[1]*h)|0,r=Math.max(1,p[2]*w);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dy*dy>r*r)continue;const k=((y+dy+h)%h)*w+((x+dx+w)%w);A[k*4]*=.8;A[k*4+1]*=.8;A[k*4+2]*=.8;H[k]-=.6;}}
        for(let i=0;i<2;i++)facCrack(A,H,w,h,R()*w,R()*h,40+R()*50,200+i,.86);});}
  /* --- plaster over a red dado: 2 m wide, 4 m tall (v=0 at the floor). Dark skirting, red paint to 1.25 m, a stripe, then yellow --- */
  {const w=S(512),h=S(1024),n1=facFbm(21,4,5),n2=facFbm(22,24,3),peel=facFbm(23,5,5),stn=facFbm(24,3,5),scuff=facFbm(25,12,4),R=facRng(26);
    out.wallP=facSurf(w,h,(u,v,px,py,o)=>{const y=v*4;let r,g,b,s,ht=(n2(u,v*2)-.5)*.5;
      const pe=peel(u,v*2),wd=stn(u*1.5,v*.6);
      if(y<.1){const d=40+(n1(u*4,v*4)-.5)*14;r=d*1.05;g=d;b=d*.92;s=.3;ht-=.4;}
      else if(y<1.25){const sc_=scuff(u*2,v*4);r=150+(n1(u,v*2)-.5)*30;g=34+(n1(u,v*2)-.5)*10;b=30;s=.34;
        if(sc_>.66){const k=(sc_-.66)*3;r=r*(1-k*.4)+k*60;g=g*(1-k*.3)+k*40;b=b*(1-k*.3)+k*38;s=.18;}
        const dirt=Math.max(0,.45-y)*1.6;r*=1-dirt*.5;g*=1-dirt*.5;b*=1-dirt*.45;
        if(pe>.72&&y>.25){const k=Math.min(1,(pe-.72)*9);r=r*(1-k)+150*k;g=g*(1-k)+148*k;b=b*(1-k)+138*k;s=.08;ht-=k*1.2;}}
      else if(y<1.31){r=92;g=24;b=20;s=.3;ht+=.6;}
      else{r=220+(n1(u,v*2)-.5)*24;g=196+(n1(u,v*2)-.5)*22;b=78+(n1(u,v*2)-.5)*14;s=.28;
        if(pe>.77){const k=Math.min(1,(pe-.77)*8);r=r*(1-k)+190*k;g=g*(1-k)+178*k;b=b*(1-k)+150*k;s=.06;ht-=k*1.1;if(pe<.795){r*=.78;g*=.78;b*=.78;}}
        const drip=Math.max(0,wd-.52)*2.6*Math.min(1,(y-1.3)/2.2);r*=1-drip*.45;g*=1-drip*.5;b*=1-drip*.6;s+=drip*.2;
        const top=Math.max(0,y-3.3)*1.4;r*=1-top*.35;g*=1-top*.38;b*=1-top*.4;}
      o.r=r;o.g=g;o.b=b;o.s=s;o.h=ht;},
      (A,H,w,h)=>{for(let i=0;i<4;i++)facCrack(A,H,w,h,R()*w,h*(.35+R()*.6),40+R()*90,300+i,.7);});}
  /* --- floor tiles: 4 x 4 tiles of 0.6 m in a 2.4 m square, dark grout, grime at the joints, the odd cracked tile --- */
  /* 3.16: 3 x 3 tiles of 0.8 m (as big as the reference's), thin grout, a fine speckle in the glaze */
  {const w=S(512),h=S(512),NT=3,n1=facFbm(31,8,4),n2=facFbm(32,32,2),gr=facFbm(33,4,4),R=facRng(34),tv=[];for(let i=0;i<NT*NT;i++)tv.push([(R()-.5)*16,R()]);
    const hs=(x,y)=>{let n=x*374761393+y*668265263;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967296;};
    out.tile=facSurf(w,h,(u,v,px,py,o)=>{const tx=Math.floor(u*NT),ty=Math.floor(v*NT),fu=u*NT-tx,fv=v*NT-ty,t=tv[ty*NT+tx];
      const e=Math.min(fu,1-fu,fv,1-fv)*w/NT,gw=1.5*sc;
      let g=178+t[0]+(n1(u,v)-.5)*14+(n2(u,v)-.5)*7,s=.85,ht=0;
      const sp=hs(px,py);if(sp<.06)g-=26*(1-sp/.06);else if(sp>.975)g+=16;
      if(e<gw){g=70+(n2(u,v)-.5)*14;s=.16;ht=-1.3;}
      else{const gm=Math.max(0,1-(e-gw)/(8*sc));g-=gm*24*(.5+gr(u,v));s-=gm*.3;ht=-gm*.25+(e<gw+1.2?-.45:0);
        const big=gr(u,v);if(big>.63){g-=(big-.63)*70;s*=.82;}}
      o.r=g*.98;o.g=g;o.b=g*1.01;o.s=s;o.h=ht;},
      (A,H,w,h)=>{for(let i=0;i<2;i++){const tx=(R()*NT)|0,ty=(R()*NT)|0;facCrack(A,H,w,h,(tx+.5)*w/NT,(ty+.5)*h/NT,26+R()*30,400+i,.8);}});}
  /* --- troweled concrete floor: 4 m, cut joints every 2 m, oil stains, worn paths, long cracks --- */
  {const w=S(512),h=S(512),n1=facFbm(41,4,5),n2=facFbm(42,32,2),stn=facFbm(43,3,5),R=facRng(44);
    out.concF=facSurf(w,h,(u,v,px,py,o)=>{let g=128+(n1(u,v)-.5)*34+(n2(u,v)-.5)*12,s=.42,ht=(n2(u,v)-.5)*.4;
      const sd=Math.min(Math.abs(u-.5),Math.abs(v-.5),u,1-u,v,1-v)*w;if(sd<1.3*sc){g-=40;ht-=1.4;s=.15;}
      const st_=stn(u,v);if(st_>.6){const k=Math.min(1,(st_-.6)*4);g-=k*38;s+=k*.35;}
      o.r=g*.97;o.g=g;o.b=g*1.02;o.s=s;o.h=ht;},
      (A,H,w,h)=>{for(let i=0;i<4;i++)facCrack(A,H,w,h,R()*w,R()*h,60+R()*90,500+i,.72);});}
  /* --- plaster ceiling: off-white gone yellow, water-damage rings, mould --- */
  {const w=S(512),h=S(512),n1=facFbm(51,4,5),n2=facFbm(52,24,3),R=facRng(53),rings=[];for(let i=0;i<5;i++)rings.push([R(),R(),.06+R()*.12]);
    out.ceilP=facSurf(w,h,(u,v,px,py,o)=>{let r=206+(n1(u,v)-.5)*24,g=196+(n1(u,v)-.5)*22,b=166+(n1(u,v)-.5)*18,ht=(n2(u,v)-.5)*.5;
      for(const q of rings){let dx=Math.abs(u-q[0]),dy=Math.abs(v-q[1]);dx=Math.min(dx,1-dx);dy=Math.min(dy,1-dy);const d=Math.hypot(dx,dy)/q[2];
        if(d<1){const k=(1-d)*.5+(Math.abs(d-.85)<.04?.5:0)+(Math.abs(d-.6)<.025?.3:0);r-=k*60;g-=k*70;b-=k*80;}}
      const m=n2(u*.5,v*.5);if(m>.7){const k=(m-.7)*3;r-=k*90;g-=k*85;b-=k*70;}
      o.r=r;o.g=g;o.b=b;o.s=.1;o.h=ht;},
      (A,H,w,h)=>{for(let i=0;i<4;i++)facCrack(A,H,w,h,R()*w,R()*h,80+R()*100,600+i,.6);});}
  /* --- diamond plate: raised bars at alternating angles on dark steel, worn shiny tops, rust patches --- */
  {const w=S(256),h=S(256),n1=facFbm(61,4,4),rs=facFbm(62,6,4);
    out.metal=facSurf(w,h,(u,v,px,py,o)=>{const P=10,a=u*P,b=v*P,ci=Math.floor(a),cj=Math.floor(b),fx=a-ci-.5,fy=b-cj-.5,or=(ci+cj)%2?1:-1;
      const pa=(fx+or*fy)*.7071,qa=(fx-or*fy)*.7071,dd=Math.abs(pa)/.44+Math.abs(qa)/.1;
      let g=66+(n1(u,v)-.5)*22,s=.38,ht=0;if(dd<1){const k=1-dd;g+=18+k*30;s=.7;ht=1.7*Math.min(1,k*2.5);}
      const r_=rs(u,v);let r=g*1.02,gg=g,bb=g*1.05;if(r_>.62){const k=Math.min(1,(r_-.62)*4);r=r*(1-k)+104*k;gg=gg*(1-k)+58*k;bb=bb*(1-k)+34*k;s*=1-k*.7;}
      o.r=r;o.g=gg;o.b=bb;o.s=s;o.h=ht;});}
  /* --- painted steel (frames, rails, stair sides, doors get their own) --- */
  {const w=S(256),h=S(256),n1=facFbm(71,4,4),sc_=facFbm(72,16,3),R=facRng(73);
    out.paint=facSurf(w,h,(u,v,px,py,o)=>{let g=176+(n1(u,v)-.5)*22,s=.42,ht=0;const c=sc_(u,v);if(c>.7){const k=(c-.7)*3.3;g-=k*70;s-=k*.25;ht-=k*.8;}
      o.r=g;o.g=g;o.b=g;o.s=s;o.h=ht;},
      (A,H,w,h)=>{for(let i=0;i<40;i++){let x=R()*w,y=R()*h;const a=R()*6.283,l=8+R()*30;for(let j=0;j<l;j++){x+=Math.cos(a);y+=Math.sin(a)*.3;const k=((((y|0)%h)+h)%h)*w+((((x|0)%w)+w)%w);A[k*4]=Math.min(255,A[k*4]+40);A[k*4+1]=Math.min(255,A[k*4+1]+40);A[k*4+2]=Math.min(255,A[k*4+2]+40);H[k]-=.4;}}});}
  /* --- a heavy painted door: panel seams, kick plate, scuffs at hand height --- */
  {const w=S(256),h=S(512),n1=facFbm(81,4,4),sc_=facFbm(82,12,3);
    out.door=facSurf(w,h,(u,v,px,py,o)=>{const y=v*2.26;let g=172+(n1(u,v)-.5)*18,s=.45,ht=0;
      const e=Math.min(u,1-u)*w,ed=Math.min(v,1-v)*h;if(e<3*sc||ed<3*sc){g-=30;ht-=.8;}
      if(Math.abs(u-.5)<.42&&Math.abs(y-1.55)<.55&&(Math.abs(Math.abs(u-.5)-.42)<.012||Math.abs(Math.abs(y-1.55)-.55)<.012)){g-=26;ht-=.7;}
      if(y<.3){g=128+(n1(u*3,v*3)-.5)*30;s=.6;ht+=.4;if(Math.abs(y-.3)<.008)ht-=1;}
      const c=sc_(u,v);if(c>.68){const k=(c-.68)*3;g-=k*55;s-=k*.2;}
      if(Math.abs(y-1.05)<.25&&u>.72){g-=12;}
      o.r=g;o.g=g;o.b=g;o.s=s;o.h=ht;});}
  return out;
}
/* ---------- the prop atlas (canvas): every region is painted with plain 2D drawing ---------- */
function facAtlas(sz){
  const W_=sz,c=document.createElement('canvas');c.width=c.height=W_;const x=c.getContext('2d'),U=W_/8,R=facRng(91),rr=(a,b)=>a+R()*(b-a);
  /* a noise tile to rough up flat colours */
  const nz=document.createElement('canvas');nz.width=nz.height=128;{const g=nz.getContext('2d'),im=g.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){const v=R()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}g.putImageData(im,0,0);}
  const reg=(n)=>{const r=FAT[n];return [r[0]*U,r[1]*U,(r[2]||1)*U,(r[3]||1)*U];};
  const rough=(X,Y,w,h,a,comp)=>{x.save();x.globalAlpha=a;x.globalCompositeOperation=comp||'overlay';for(let yy=Y;yy<Y+h;yy+=128)for(let xx=X;xx<X+w;xx+=128)x.drawImage(nz,0,0,Math.min(128,X+w-xx),Math.min(128,Y+h-yy),xx,yy,Math.min(128,X+w-xx),Math.min(128,Y+h-yy));x.restore();};
  const grime=(X,Y,w,h,a)=>{const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,'rgba(20,15,10,'+(a*.3)+')');g.addColorStop(1,'rgba(20,15,10,'+a+')');x.fillStyle=g;x.fillRect(X,Y,w,h);
    for(let i=0;i<6;i++){x.fillStyle='rgba(30,22,14,'+(a*.25)+')';x.beginPath();x.ellipse(X+rr(0,w),Y+rr(0,h),rr(w*.05,w*.2),rr(h*.03,h*.12),0,0,6.3);x.fill();}};
  const fill=(n,col,ra)=>{const [X,Y,w,h]=reg(n);x.fillStyle=col;x.fillRect(X,Y,w,h);rough(X,Y,w,h,ra==null?.25:ra);return [X,Y,w,h];};
  const text=(s,X,Y,w,h,col,font,al)=>{x.save();x.fillStyle=col;x.font=font;x.textAlign=al||'center';x.textBaseline='middle';x.fillText(s,X+(al==='left'?0:w/2),Y+h/2);x.restore();};
  const L=(X,Y,w,h,col,lw)=>{x.strokeStyle=col;x.lineWidth=lw||1;x.strokeRect(X,Y,w,h);};
  /* wood crate */
  {const [X,Y,w,h]=fill('crate','#8a6a42',.35);for(let i=0;i<5;i++){x.fillStyle='rgba(0,0,0,'+rr(.05,.18)+')';x.fillRect(X,Y+i*h/5,w,h/5);x.fillStyle='rgba(20,12,4,.8)';x.fillRect(X,Y+i*h/5,w,Math.max(1,U/90));}
    for(let i=0;i<40;i++){x.strokeStyle='rgba(60,40,20,.35)';x.lineWidth=1;x.beginPath();const yy=Y+rr(0,h);x.moveTo(X,yy);x.bezierCurveTo(X+w*.3,yy+rr(-3,3),X+w*.6,yy+rr(-3,3),X+w,yy+rr(-2,2));x.stroke();}
    x.fillStyle='#6a4e2e';const b=w*.12;x.fillRect(X,Y,w,b);x.fillRect(X,Y+h-b,w,b);x.fillRect(X,Y,b,h);x.fillRect(X+w-b,Y,b,h);
    x.save();x.translate(X+w/2,Y+h/2);x.rotate(Math.atan2(h-2*b,w-2*b));x.fillRect(-w*.62,-b/2,w*1.24,b);x.restore();rough(X,Y,w,h,.3);
    for(const [a,bq] of[[1,1],[1,4],[4,1],[4,4]]){x.fillStyle='#2a2420';x.beginPath();x.arc(X+a*w/5.3+b*.2,Y+bq*h/5.3+b*.2,U/60,0,6.3);x.fill();}
    text('FRAGILE',X,Y+h*.44,w,h*.12,'rgba(30,20,10,.45)','bold '+(U*.13|0)+'px sans-serif');grime(X,Y,w,h,.5);}
  {const [X,Y,w,h]=fill('card','#a88356',.3);x.fillStyle='rgba(200,190,160,.75)';x.fillRect(X,Y+h*.45,w,h*.1);text('THIS SIDE UP',X,Y+h*.75,w,h*.1,'rgba(40,30,20,.6)',(U*.08|0)+'px sans-serif');grime(X,Y,w,h,.35);}
  {const [X,Y,w,h]=fill('pallet','#7e6440',.4);for(let i=0;i<5;i++){x.fillStyle='rgba(15,10,5,.85)';x.fillRect(X+i*w/5+w/5*.78,Y,w/5*.22,h);}grime(X,Y,w,h,.5);}
  {const [X,Y,w,h]=fill('rubble','#77797a',.6);for(let i=0;i<30;i++){x.fillStyle='rgba(0,0,0,'+rr(.1,.4)+')';x.fillRect(X+rr(0,w),Y+rr(0,h),rr(2,U*.12),rr(2,U*.12));}}
  {const [X,Y,w,h]=fill('rust','#6e3e22',.6);for(let i=0;i<40;i++){x.fillStyle='rgba('+(rr(90,150)|0)+','+(rr(40,70)|0)+',20,.5)';x.beginPath();x.arc(X+rr(0,w),Y+rr(0,h),rr(2,U*.1),0,6.3);x.fill();}}
  {const [X,Y,w,h]=fill('pipe','#6f7b78',.25);const g=x.createLinearGradient(X,0,X+w,0);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.5,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(X,Y,w,h);grime(X,Y,w,h,.4);}
  {const [X,Y,w,h]=fill('tank','#5e6e62',.3);for(let i=1;i<4;i++){x.fillStyle='rgba(0,0,0,.35)';x.fillRect(X,Y+i*h/4,w,2);for(let j=0;j<12;j++){x.fillStyle='rgba(20,20,20,.6)';x.beginPath();x.arc(X+j*w/12+4,Y+i*h/4+5,1.6,0,6.3);x.fill();}}
    for(let i=0;i<10;i++){x.fillStyle='rgba(110,60,30,.35)';x.fillRect(X+rr(0,w),Y+rr(0,h*.6),rr(2,5),rr(10,h*.4));}grime(X,Y,w,h,.6);}
  for(const [n,col] of[['barrel','#2f5a8a'],['barrelR','#8a2a22']]){const [X,Y,w,h]=fill(n,col,.3);for(const f of[.18,.5,.82]){x.fillStyle='rgba(0,0,0,.35)';x.fillRect(X,Y+h*f-3,w,6);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(X,Y+h*f-3,w,2);}grime(X,Y,w,h,.55);}
  {const [X,Y,w,h]=fill('metalD','#33383b',.3);for(let i=0;i<14;i++){x.strokeStyle='rgba(160,170,175,.18)';x.beginPath();const a=rr(X,X+w),b=rr(Y,Y+h);x.moveTo(a,b);x.lineTo(a+rr(-15,15),b+rr(-4,4));x.stroke();}grime(X,Y,w,h,.3);}
  {const [X,Y,w,h]=fill('metalL','#8d9396',.25);grime(X,Y,w,h,.3);}
  {const [X,Y,w,h]=fill('desk','#9a8e7a',.2);for(let i=0;i<20;i++){x.strokeStyle='rgba(80,70,55,.2)';x.beginPath();const yy=Y+rr(0,h);x.moveTo(X,yy);x.lineTo(X+w,yy+rr(-2,2));x.stroke();}x.fillStyle='rgba(40,35,30,.3)';x.beginPath();x.arc(X+w*.7,Y+h*.3,U*.08,0,6.3);x.fill();}
  {const [X,Y,w,h]=fill('deskS','#6c7470',.25);grime(X,Y,w,h,.35);}
  {const [X,Y,w,h]=fill('fabric','#3a4250',.5);for(let i=0;i<w;i+=3){x.fillStyle='rgba(0,0,0,.12)';x.fillRect(X+i,Y,1,h);}grime(X,Y,w,h,.3);}
  {const [X,Y,w,h]=fill('crtB','#b9ae96',.18);grime(X,Y,w,h,.35);}
  {const [X,Y,w,h]=fill('crtF','#b3a88f',.15);x.fillStyle='#1d2422';x.beginPath();x.roundRect?x.roundRect(X+w*.12,Y+h*.12,w*.76,h*.66,U*.05):x.rect(X+w*.12,Y+h*.12,w*.76,h*.66);x.fill();
    x.fillStyle='rgba(120,180,170,.12)';x.fillRect(X+w*.18,Y+h*.18,w*.3,h*.08);x.fillStyle='#4a4a40';x.fillRect(X+w*.72,Y+h*.85,w*.08,h*.06);x.fillStyle='#3a8a3a';x.fillRect(X+w*.84,Y+h*.86,w*.04,h*.04);}
  /* server rack front: rows of units with vents, handles and lights */
  {const [X,Y,w,h]=fill('rackF','#121416',.2);const n=14;for(let i=0;i<n;i++){const yy=Y+h*.04+i*(h*.92/n),uh=h*.92/n-2;if(R()<.12)continue;
      x.fillStyle=R()<.3?'#2a2e32':'#1c1f22';x.fillRect(X+w*.08,yy,w*.84,uh);x.fillStyle='rgba(0,0,0,.6)';for(let k=0;k<10;k++)x.fillRect(X+w*.14+k*w*.045,yy+uh*.25,w*.02,uh*.5);
      x.fillStyle='#55595c';x.fillRect(X+w*.09,yy+uh*.3,w*.03,uh*.4);x.fillRect(X+w*.88,yy+uh*.3,w*.03,uh*.4);
      for(let k=0;k<3;k++){x.fillStyle=['#2a6a2a','#6a5a1a','#3a3a6a'][(i+k)%3];x.fillRect(X+w*.66+k*w*.06,yy+uh*.4,w*.03,uh*.25);}
      if(R()<.3){x.fillStyle='#8a8a7a';x.fillRect(X+w*.5,yy+uh*.2,w*.12,uh*.6);}
      if(R()<.34){const c=['#b8ae90','#c8a020','#2a4a8a','#d8d8d0','#8a2a22'][(R()*5)|0];x.fillStyle=c;x.fillRect(X+w*.09,yy+1,w*.82,uh-2);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(X+w*.12,yy+uh*.6,w*.3,uh*.18);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(X+w*.09,yy+1,w*.82,1.5);if(R()<.5){x.fillStyle='#3aa84a';x.fillRect(X+w*.8,yy+uh*.3,w*.04,uh*.3);}}}
    L(X+2,Y+2,w-4,h-4,'#3a3e42',3);}
  {const [X,Y,w,h]=fill('rackS','#16181a',.2);x.fillStyle='rgba(0,0,0,.7)';for(let yy=Y+8;yy<Y+h-8;yy+=6)for(let xx=X+8;xx<X+w-8;xx+=6)x.fillRect(xx,yy,2,2);L(X+2,Y+2,w-4,h-4,'#2e3236',3);}
  {const [X,Y,w,h]=fill('locker','#5f7068',.25);x.fillStyle='rgba(0,0,0,.55)';for(let i=0;i<6;i++){x.fillRect(X+w*.25,Y+h*.06+i*h*.018,w*.5,h*.008);x.fillRect(X+w*.25,Y+h*.84+i*h*.018,w*.5,h*.008);}
    x.fillStyle='#2a2e2c';x.fillRect(X+w*.78,Y+h*.45,w*.08,h*.08);x.fillStyle='#c8c0a8';x.fillRect(X+w*.38,Y+h*.18,w*.24,h*.03);L(X+1,Y+1,w-2,h-2,'#2a3430',2);grime(X,Y,w,h,.5);}
  {const [X,Y,w,h]=fill('cab','#7a817c',.2);for(let i=0;i<4;i++){const yy=Y+h*.03+i*h*.24;L(X+w*.06,yy,w*.88,h*.22,'#3c403e',2);x.fillStyle='#2c2e2c';x.fillRect(X+w*.35,yy+h*.09,w*.3,h*.03);x.fillStyle='#d8d0b8';x.fillRect(X+w*.4,yy+h*.03,w*.2,h*.04);}grime(X,Y,w,h,.4);}
  {const [X,Y,w,h]=fill('vend','#2a2c32',.2);x.fillStyle='#14181c';x.fillRect(X+w*.08,Y+h*.06,w*.6,h*.62);
    for(let r=0;r<6;r++)for(let k=0;k<4;k++){x.fillStyle=['#a83a2a','#3a6aa8','#d8b83a','#3aa84a','#e8e8e0'][(r*3+k)%5];x.fillRect(X+w*.11+k*w*.14,Y+h*.09+r*h*.1,w*.1,h*.06);}
    x.fillStyle='#4a4e54';x.fillRect(X+w*.74,Y+h*.2,w*.18,h*.3);x.fillStyle='#111';x.fillRect(X+w*.15,Y+h*.78,w*.5,h*.1);}
  {const [X,Y,w,h]=fill('gen','#7a7240',.25);x.fillStyle='rgba(0,0,0,.6)';for(let i=0;i<8;i++)x.fillRect(X+w*.1,Y+h*.12+i*h*.05,w*.45,h*.02);
    for(let i=0;i<2;i++){x.fillStyle='#e8e0c8';x.beginPath();x.arc(X+w*(.7+i*.15),Y+h*.25,w*.06,0,6.3);x.fill();x.strokeStyle='#a00';x.beginPath();x.moveTo(X+w*(.7+i*.15),Y+h*.25);x.lineTo(X+w*(.73+i*.15),Y+h*.21);x.stroke();}
    x.fillStyle='#d8b020';x.fillRect(X+w*.6,Y+h*.55,w*.32,h*.18);text('DANGER',X+w*.6,Y+h*.55,w*.32,h*.18,'#111','bold '+(U*.07|0)+'px sans-serif');grime(X,Y,w,h,.6);}
  {const [X,Y,w,h]=fill('panel','#7c8480',.2);L(X+3,Y+3,w-6,h-6,'#40464a',3);for(let i=0;i<3;i++)for(let k=0;k<4;k++){x.fillStyle='#222';x.fillRect(X+w*.15+k*w*.18,Y+h*.2+i*h*.22,w*.1,h*.12);x.fillStyle='#ccc';x.fillRect(X+w*.17+k*w*.18,Y+h*.22+i*h*.22,w*.06,h*.05);}
    x.fillStyle='#d8b020';x.fillRect(X+w*.2,Y+h*.84,w*.6,h*.08);grime(X,Y,w,h,.4);}
  /* the breaker the fuses go into */
  {const [X,Y,w,h]=fill('breaker','#5b6268',.2);L(X+3,Y+3,w-6,h-6,'#2a2e32',4);text('LIFT POWER',X,Y+h*.06,w,h*.1,'#e8d890','bold '+(U*.09|0)+'px sans-serif');
    for(let i=0;i<3;i++){x.fillStyle='#111';x.fillRect(X+w*(.16+i*.26),Y+h*.24,w*.16,h*.42);x.strokeStyle='#d07020';x.lineWidth=2;x.strokeRect(X+w*(.16+i*.26),Y+h*.24,w*.16,h*.42);}
    for(let i=0;i<8;i++){x.fillStyle=i%2?'#d8b020':'#111';x.beginPath();x.moveTo(X+i*w/8,Y+h);x.lineTo(X+(i+1)*w/8,Y+h);x.lineTo(X+(i+1.6)*w/8,Y+h*.8);x.lineTo(X+(i+.6)*w/8,Y+h*.8);x.fill();}grime(X,Y,w,h,.4);}
  {const [X,Y,w,h]=fill('liftP','#8a9094',.15);x.fillStyle='#222';x.fillRect(X+w*.3,Y+h*.2,w*.4,h*.6);x.fillStyle='#d8c060';x.beginPath();x.arc(X+w/2,Y+h*.38,w*.1,0,6.3);x.fill();x.beginPath();x.arc(X+w/2,Y+h*.62,w*.1,0,6.3);x.fill();}
  {const [X,Y,w,h]=fill('board','#8a6a40',.5);L(X+2,Y+2,w-4,h-4,'#4a3a22',5);for(let i=0;i<6;i++){x.fillStyle=['#e8e4d8','#f0e8a0','#d8e0e8'][i%3];x.save();x.translate(X+rr(w*.15,w*.75),Y+rr(h*.15,h*.7));x.rotate(rr(-.2,.2));x.fillRect(0,0,w*.22,h*.28);x.fillStyle='#a00';x.fillRect(w*.1,2,3,3);x.restore();}}
  {const [X,Y,w,h]=fill('binder','#222',.1);let xx=X;while(xx<X+w){const bw=rr(w*.05,w*.09);x.fillStyle=['#2a3e6a','#6a2a2a','#2a5a3a','#5a5a5a','#8a7a3a'][(R()*5)|0];x.fillRect(xx,Y+h*.05,bw-1,h*.92);x.fillStyle='#ddd';x.fillRect(xx+bw*.2,Y+h*.6,bw*.6,h*.12);xx+=bw;}}
  {const [X,Y,w,h]=fill('paper','#d8d4c8',.1);for(let i=0;i<10;i++){x.fillStyle='rgba(40,40,40,.4)';x.fillRect(X+w*.12,Y+h*.12+i*h*.07,w*rr(.5,.75),1.5);}}
  {fill('cable','#141414',.2);}
  {const [X,Y,w,h]=fill('mat','#2e6a42',.4);x.fillStyle='rgba(0,0,0,.15)';for(let i=0;i<w;i+=4)x.fillRect(X+i,Y,1,h);grime(X,Y,w,h,.25);}
  {const [X,Y,w,h]=fill('cooler','#d8dcd8',.1);x.fillStyle='#5a8ac8';x.fillRect(X+w*.15,Y,w*.7,h*.35);x.fillStyle='#444';x.fillRect(X+w*.4,Y+h*.5,w*.2,h*.06);grime(X,Y,w,h,.3);}
  {const [X,Y,w,h]=fill('radio','#2a2a26',.2);x.fillStyle='#111';for(let i=0;i<6;i++)x.fillRect(X+w*.1,Y+h*.2+i*h*.1,w*.4,h*.05);x.fillStyle='#8a7a40';x.fillRect(X+w*.6,Y+h*.25,w*.3,h*.25);}
  {const [X,Y,w,h]=reg('hazard');for(let i=-8;i<16;i++){x.fillStyle=i%2?'#d8b020':'#141414';x.beginPath();x.moveTo(X+i*w/8,Y);x.lineTo(X+(i+1)*w/8,Y);x.lineTo(X+(i+1)*w/8-h,Y+h);x.lineTo(X+i*w/8-h,Y+h);x.fill();}rough(X,Y,w,h,.35);grime(X,Y,w,h,.4);}
  {const [X,Y,w,h]=fill('vent','#3a3e40',.2);x.fillStyle='#050606';for(let i=0;i<9;i++)x.fillRect(X+w*.08,Y+h*.1+i*h*.09,w*.84,h*.05);L(X+2,Y+2,w-4,h-4,'#5a5e60',5);}
  const scr=(n,s,fs)=>{const [X,Y,w,h]=reg(n);x.clearRect(X,Y,w,h);x.fillStyle='#808080';x.fillRect(X,Y,w,h);x.save();x.globalAlpha=1;x.fillStyle='#6a0e0a';x.font='bold '+fs+'px serif';x.textAlign='center';x.textBaseline='middle';
    x.translate(X+w/2,Y+h/2);x.rotate(-.06);x.fillText(s,0,0);x.restore();for(let i=0;i<10;i++){x.fillStyle='#5a0a08';x.fillRect(X+rr(w*.15,w*.85),Y+h*.55,2,rr(h*.05,h*.35));}};
  scr('scrawl','IT HEARS',U*.2|0);scr('scrawl2','DONT RUN',U*.18|0);scr('scrawl3','HIDE',U*.3|0);
  {const [X,Y,w,h]=reg('signSrv');x.fillStyle='#1c3e6a';x.fillRect(X,Y,w,h);L(X+3,Y+3,w-6,h-6,'#e8e8e0',3);text('SERVER ROOM  →',X,Y,w,h,'#f0f0e8','bold '+(U*.2|0)+'px sans-serif');rough(X,Y,w,h,.2);}
  {const [X,Y,w,h]=reg('signLift');x.fillStyle='#7a1a14';x.fillRect(X,Y,w,h);L(X+3,Y+3,w-6,h-6,'#e8e0d0',3);text('FREIGHT LIFT',X,Y,w,h,'#f4ece0','bold '+(U*.22|0)+'px sans-serif');rough(X,Y,w,h,.2);}
  for(const [n,s] of[['sign1','B1'],['sign2','1'],['sign3','2']]){const [X,Y,w,h]=reg(n);x.fillStyle='#808080';x.fillRect(X,Y,w,h);text(s,X,Y,w,h,'rgba(235,235,225,.9)','bold '+(U*.62|0)+'px sans-serif');}
  {const [X,Y,w,h]=reg('signExit');x.fillStyle='#0e5a2a';x.fillRect(X,Y,w,h);text('EXIT',X,Y,w,h,'#e8ffe8','bold '+(U*.32|0)+'px sans-serif');}
  /* roll-up shutter: corrugated slats, a heavy bottom bar with a handle, rust running down */
  {const [X,Y,w,h]=fill('shutter','#4c5550',.3);const n=22;for(let i=0;i<n;i++){const yy=Y+i*h/n;const g=x.createLinearGradient(0,yy,0,yy+h/n);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.4,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(X,yy,w,h/n);}
    x.fillStyle='#3e4440';x.fillRect(X,Y+h*.93,w,h*.07);x.fillStyle='#24282a';x.fillRect(X+w*.44,Y+h*.89,w*.12,h*.03);for(let i=0;i<14;i++){x.fillStyle='rgba(110,58,28,'+rr(.15,.4)+')';x.fillRect(X+rr(0,w),Y+rr(h*.2,h*.8),rr(1,3),rr(h*.05,h*.25));}
    x.fillStyle='#2a2e2c';x.fillRect(X,Y,w*.03,h);x.fillRect(X+w*.97,Y,w*.03,h);grime(X,Y,w,h,.55);}
  {const [X,Y,w,h]=fill('fuse','#d8d2c0',.1);x.fillStyle='#9a9a9a';x.fillRect(X,Y,w,h*.18);x.fillRect(X,Y+h*.82,w,h*.18);x.fillStyle='#c84a1a';x.fillRect(X,Y+h*.45,w,h*.1);}
  {const [X,Y,w,h]=fill('battery','#2a2a2a',.1);x.fillStyle='#d8a020';x.fillRect(X,Y+h*.6,w,h*.4);text('9V',X,Y+h*.2,w,h*.3,'#ddd','bold '+(U*.2|0)+'px sans-serif');}
  {const [X,Y,w,h]=fill('house','#c8ccc8',.1);}
  {const [X,Y,w,h]=reg('blood');x.fillStyle='#808080';x.fillRect(X,Y,w,h);for(let i=0;i<14;i++){x.fillStyle='rgba(90,8,6,'+rr(.5,.9)+')';x.beginPath();x.ellipse(X+w/2+rr(-w*.3,w*.3),Y+h/2+rr(-h*.3,h*.3),rr(4,U*.18),rr(3,U*.1),rr(0,3),0,6.3);x.fill();}}
  {const [X,Y,w,h]=reg('arrow');x.fillStyle='#808080';x.fillRect(X,Y,w,h);x.fillStyle='rgba(240,240,230,.85)';x.beginPath();x.moveTo(X+w*.1,Y+h*.4);x.lineTo(X+w*.6,Y+h*.4);x.lineTo(X+w*.6,Y+h*.25);x.lineTo(X+w*.9,Y+h*.5);x.lineTo(X+w*.6,Y+h*.75);x.lineTo(X+w*.6,Y+h*.6);x.lineTo(X+w*.1,Y+h*.6);x.fill();}
  const t=new T.CanvasTexture(c);t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;try{t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}catch(_){}
  return {tex:t,canvas:c};
}
/* ---------- the lighting shader shared by every surface of the facility ----------
   light = baked tubes (with a directional touch, so normal maps still read) + red emergency lamps + your flashlight;
   then flashlight highlights and blurred reflections of the nearest tubes on wet floors; exp2 fog; a soft tone curve. */
const FAC_VS=`attribute vec4 tint;attribute vec4 bake;attribute vec4 bake2;attribute vec4 ldir;
varying vec2 vUv;varying vec3 vW;varying vec3 vN;varying vec3 vBk;varying vec3 vEm;varying vec4 vTn;varying vec3 vLd;
void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);vUv=uv;
vBk=bake.rgb*bake.rgb*4.0;vEm=bake2.rgb*bake2.rgb*4.0;vTn=tint;vLd=mat3(modelMatrix)*(ldir.xyz*ldir.w);
gl_Position=projectionMatrix*viewMatrix*wp;}`;
const FAC_FS=`#include <packing>
uniform sampler2D map;uniform sampler2D nmap;uniform sampler2D uShM;uniform mat4 uShX;uniform float uShOn;uniform float uShT;
uniform vec3 uCam;uniform vec3 uLP;uniform vec3 uLD;uniform vec3 uLC;uniform vec2 uLCos;uniform float uLOn;
uniform float uPow;uniform float uEmg;uniform float uSpec;uniform float uShin;uniform float uBump;uniform float uExpo;uniform float uFogD;uniform vec3 uFogC;
uniform vec4 uRL[4];uniform vec4 uRA[4];uniform vec3 uRC[4];
varying vec2 vUv;varying vec3 vW;varying vec3 vN;varying vec3 vBk;varying vec3 vEm;varying vec4 vTn;varying vec3 vLd;
void main(){
  vec4 tx=texture2D(map,vUv);vec3 alb=tx.rgb*vTn.rgb;vec3 N=normalize(vN);vec3 Np=N;
#if NMAP==1
  vec3 Tg=abs(N.y)>0.5?vec3(1.0,0.0,0.0):normalize(vec3(N.z,0.0,-N.x));vec3 Bg=abs(N.y)>0.5?vec3(0.0,0.0,1.0):vec3(0.0,1.0,0.0);
  vec3 nm=texture2D(nmap,vUv).xyz*2.0-1.0;Np=normalize(Tg*nm.x*uBump+Bg*nm.y*uBump+N*nm.z);
  float gl=tx.a*vTn.a*uSpec;
#else
  float gl=vTn.a*uSpec;
#endif
  float ldl=length(vLd);vec3 L0=ldl>0.001?vLd/ldl:N;float dk=clamp(ldl,0.0,0.7);
  float shade=mix(1.0,clamp(dot(Np,L0)/max(dot(N,L0),0.2),0.0,1.7),dk);
  vec3 base=vBk*uPow*shade+vEm*uEmg;
  vec3 lv=uLP-vW;float dd=length(lv);vec3 lf=lv/max(dd,0.001);float cs=dot(-lf,uLD);
  float spot=smoothstep(uLCos.y,uLCos.x,cs);float hot=smoothstep(uLCos.x,1.0,cs);
  float ringv=0.8+0.45*hot+0.1*sin(clamp((cs-uLCos.y)/(1.0-uLCos.y),0.0,1.0)*16.0);
  float att=uLOn/(1.0+0.09*dd*dd);
  /* the flashlight's shadow: things in the beam throw shadows that move as you swing the light */
  if(uShOn>0.5&&spot>0.001){vec4 sc=uShX*vec4(vW+N*0.035,1.0);sc.xyz/=sc.w;
    if(sc.x>0.0&&sc.x<1.0&&sc.y>0.0&&sc.y<1.0&&sc.z<1.0){float z=sc.z-0.0012,lit=0.0;
      lit+=step(z,unpackRGBAToDepth(texture2D(uShM,sc.xy+vec2(-0.6,-0.6)*uShT)));lit+=step(z,unpackRGBAToDepth(texture2D(uShM,sc.xy+vec2(0.6,-0.6)*uShT)));
      lit+=step(z,unpackRGBAToDepth(texture2D(uShM,sc.xy+vec2(-0.6,0.6)*uShT)));lit+=step(z,unpackRGBAToDepth(texture2D(uShM,sc.xy+vec2(0.6,0.6)*uShT)));att*=lit*0.25;}}
  vec3 fl=uLC*(spot*ringv*att*max(dot(Np,lf),0.0));
  vec3 V=normalize(uCam-vW);vec3 sp=vec3(0.0);
  if(gl>0.01){
    vec3 H=normalize(lf+V);sp+=uLC*(spot*att*pow(max(dot(Np,H),0.0),uShin)*gl*1.7);
    vec3 Hd=normalize(L0+V);sp+=vBk*uPow*(pow(max(dot(Np,Hd),0.0),uShin*0.5)*gl*dk*0.6);
    vec3 Rr=reflect(-V,Np);float rk=gl*clamp(dot(vBk,vec3(0.33))*uPow*3.0+0.1,0.0,1.0);
    for(int i=0;i<4;i++){
      vec3 D=uRA[i].xyz*2.0;vec3 A=uRL[i].xyz-uRA[i].xyz;vec3 w0=vW-A;
      float b=dot(Rr,D);float c=dot(D,D);float d=dot(Rr,w0);float e=dot(D,w0);
      float u=clamp((e-b*d)/max(c-b*b,0.0001),0.0,1.0);vec3 Q=A+D*u;float s=max(dot(Q-vW,Rr),0.0);
      vec3 P=vW+Rr*s;float dist=length(P-Q);float sg=0.035+s*(0.05+(1.0-min(gl,1.0))*0.1);
      sp+=uRC[i]*(uRL[i].w*exp(-dist*dist/(sg*sg))*rk/(1.0+s*0.2));
    }
  }
  vec3 col=alb*(base+fl)+sp;
  float fd=length(uCam-vW);col=mix(col,uFogC,1.0-exp(-fd*fd*uFogD*uFogD));
  col=vec3(1.0)-exp(-col*uExpo);
  gl_FragColor=vec4(col,1.0);
}`;
const FAC_EVS=`attribute vec4 em;varying vec4 vE;varying vec3 vW;
void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vE=em;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const FAC_EFS=`uniform float uPow;uniform float uEmg;uniform float uExpo;uniform float uFogD;uniform vec3 uFogC;uniform vec3 uCam;
varying vec4 vE;varying vec3 vW;
void main(){vec3 c=vE.rgb*2.0*(vE.a>0.5?uPow:uEmg)*1.7;float fd=length(uCam-vW);c=mix(c,uFogC,(1.0-exp(-fd*fd*uFogD*uFogD))*0.7);c=vec3(1.0)-exp(-c*uExpo);gl_FragColor=vec4(c,1.0);}`;
const FAC_DFS=`uniform sampler2D map;uniform float uFogD;uniform vec3 uCam;varying vec2 vUv;varying vec3 vW;
void main(){vec3 c=texture2D(map,vUv).rgb;float fd=length(uCam-vW);c=mix(c,vec3(0.5),1.0-exp(-fd*fd*uFogD*uFogD));gl_FragColor=vec4(c,1.0);}`;
const FAC_DVS=`varying vec2 vUv;varying vec3 vW;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vUv=uv;gl_Position=projectionMatrix*viewMatrix*wp;}`;
function facUniforms(){
  const v3=()=>({value:new T.Vector3()});
  return {uCam:v3(),uLP:v3(),uLD:{value:new T.Vector3(0,0,-1)},uLC:{value:new T.Vector3(1,.95,.85)},uLCos:{value:new T.Vector2(.97,.9)},uLOn:{value:1},
    uPow:{value:1},uEmg:{value:1},uExpo:{value:1.65},uFogD:{value:.055},uFogC:{value:new T.Vector3(.004,.008,.01)},
    uRL:{value:[0,1,2,3].map(()=>new T.Vector4())},uRA:{value:[0,1,2,3].map(()=>new T.Vector4())},uRC:{value:[0,1,2,3].map(()=>new T.Vector3())},
    uShM:{value:null},uShX:{value:new T.Matrix4()},uShOn:{value:0},uShT:{value:1/512}};
}
/* one material per surface: how glossy it is, how sharp its highlight is, and how deep its normal map reads */
const FSURF={wallC:[.32,22,1],wallP:[.5,30,.8],tile:[1.25,64,.9],concF:[1.05,40,.75],ceilP:[.18,12,.6],metal:[1.05,46,1.1],paint:[.75,36,.55],prop:[.55,24,0],door:[.8,40,.7]};
function facMats(TX,AT,U){
  const M={};
  const mk=(name,map,nmap)=>{const f=FSURF[name];const un=Object.assign({},U,{map:{value:map},nmap:{value:nmap||map},uSpec:{value:f[0]},uShin:{value:f[1]},uBump:{value:f[2]}});
    return new T.ShaderMaterial({uniforms:un,vertexShader:FAC_VS,fragmentShader:FAC_FS,defines:{NMAP:nmap?1:0}});};
  for(const n of['wallC','wallP','tile','concF','ceilP','metal','paint','door']){const t=TX[n];const map=facDT(t.A,t.w,t.h),nm=facDT(t.Nm,t.w,t.h,T.RGBFormat);if(n==='wallP')map.wrapT=nm.wrapT=T.ClampToEdgeWrapping;M[n]=mk(n,map,nm);M[n].userData.tex=[map,nm];}
  M.prop=mk('prop',AT.tex,null);M.prop.userData.tex=[AT.tex];
  M.emis=new T.ShaderMaterial({uniforms:U,vertexShader:FAC_EVS,fragmentShader:FAC_EFS});
  M.decal=new T.ShaderMaterial({uniforms:Object.assign({},U,{map:{value:AT.tex}}),vertexShader:FAC_DVS,fragmentShader:FAC_DFS,transparent:true,depthWrite:false,
    blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.DstColorFactor,blendDst:T.SrcColorFactor,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  return M;
}
/* turn the gathered geometry into meshes: one per chunk and material */
function facMeshes(W,M,scene){
  const out=[];
  for(const a of W.B.acc.values()){const n=a.p.length/3;if(!n||!a.idx.length)continue;const g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));
    if(a.m==='emis'){const e=new Uint8Array(n*4);for(let i=0;i<n*4;i++)e[i]=Math.max(0,Math.min(255,Math.round(i%4===3?a.em[i]*255:a.em[i]/2*255)));g.setAttribute('em',new T.BufferAttribute(e,4,true));}
    else if(a.m==='decal'){g.setAttribute('uv',new T.Float32BufferAttribute(a.u,2));}
    else{g.setAttribute('normal',new T.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.u,2));
      const tn=new Uint8Array(n*4),bk=new Uint8Array(n*4),b2=new Uint8Array(n*4),ld=new Int8Array(n*4),B=a.bk;
      for(let i=0;i<n;i++){for(let k=0;k<4;k++)tn[i*4+k]=Math.max(0,Math.min(255,Math.round(a.t[i*4+k]*255)));
        for(let k=0;k<3;k++){bk[i*4+k]=Math.round(Math.sqrt(Math.min(1,Math.max(0,B[i*10+k]/4)))*255);b2[i*4+k]=Math.round(Math.sqrt(Math.min(1,Math.max(0,B[i*10+3+k]/4)))*255);}
        bk[i*4+3]=255;b2[i*4+3]=255;const lx=B[i*10+6],ly=B[i*10+7],lz=B[i*10+8],l=Math.hypot(lx,ly,lz),tot=B[i*10+9];
        if(l>1e-5){ld[i*4]=Math.round(lx/l*127);ld[i*4+1]=Math.round(ly/l*127);ld[i*4+2]=Math.round(lz/l*127);ld[i*4+3]=Math.round(Math.min(1,l/Math.max(tot,1e-5))*127);}}
      g.setAttribute('tint',new T.BufferAttribute(tn,4,true));g.setAttribute('bake',new T.BufferAttribute(bk,4,true));g.setAttribute('bake2',new T.BufferAttribute(b2,4,true));g.setAttribute('ldir',new T.BufferAttribute(ld,4,true));}
    g.setIndex(n>65535?new T.Uint32BufferAttribute(a.idx,1):new T.Uint16BufferAttribute(a.idx,1));g.computeBoundingSphere();
    const m=new T.Mesh(g,M[a.m]);m.matrixAutoUpdate=false;m.updateMatrix();m.userData.ck=a.ck;m.userData.band=Math.floor(a.ck/100);if(a.m==='decal')m.renderOrder=2;
    scene.add(m);out.push(m);
    a.p=a.n=a.u=a.t=a.s=a.em=a.bk=null;a.map=null;}
  return out;
}
/* ---------- screen effects: one pass for colour fringing at the edges, film grain, vignette, fear and fades ---------- */
function facPost(){
  const gl2=renderer.capabilities.isWebGL2,o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,depthBuffer:true,stencilBuffer:false};
  let rt;if(gl2&&T.WebGLMultisampleRenderTarget){rt=new T.WebGLMultisampleRenderTarget(4,4,o);rt.samples=4;}else rt=new T.WebGLRenderTarget(4,4,o);
  const mat=new T.ShaderMaterial({uniforms:{tD:{value:rt.texture},uRes:{value:new T.Vector2(4,4)},uTime:{value:0},uCA:{value:.004},uGrain:{value:.06},uVig:{value:.55},uFear:{value:0},uHurt:{value:0},uFade:{value:1},uSat:{value:1.1},uZone:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:`uniform sampler2D tD;uniform vec2 uRes;uniform float uTime;uniform float uCA;uniform float uGrain;uniform float uVig;uniform float uFear;uniform float uHurt;uniform float uFade;uniform float uSat;uniform float uZone;varying vec2 vUv;
float hs(vec2 p){p=fract(p*vec2(0.1031,0.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
void main(){vec2 c=vUv-0.5;float r2=dot(c,c);vec2 off=c*uCA*(0.4+2.2*r2);
  float R=texture2D(tD,vUv+off).r;vec3 G=texture2D(tD,vUv).rgb;float B=texture2D(tD,vUv-off).b;vec3 col=vec3(R,G.g,B);
  /* 3.16 grade: a mild S-curve; in the concrete the darks sink to teal and lose their red, in the offices they lift warm */
  col=mix(col,col*col*(3.0-2.0*col),0.22);
  float l=dot(col,vec3(0.299,0.587,0.114)),lo=1.0-smoothstep(0.0,0.55,l);
  col.r*=1.0-0.4*lo*(1.0-uZone);col.b*=1.0-0.35*lo*uZone;col+=mix(vec3(0.0,0.017,0.021),vec3(0.02,0.011,0.0),uZone)*lo;
  col=mix(vec3(l),col,uSat);
  float e=smoothstep(0.06,0.5,r2);col*=1.0-uVig*e;col=mix(col,col*vec3(1.25,0.45,0.4),clamp(uFear*e*1.4+uHurt,0.0,1.0));
  float n=hs(vUv*uRes+fract(uTime*7.13)*vec2(913.7,371.3))-0.5;col+=n*uGrain*(0.55+0.9*(1.0-l));
  gl_FragColor=vec4(max(col,0.0)*uFade,1.0);}`,depthTest:false,depthWrite:false});
  const q=new T.Mesh(new T.PlaneGeometry(2,2),mat);q.frustumCulled=false;const sc=new T.Scene();sc.add(q);
  return {rt,mat,sc,cam:new T.OrthographicCamera(-1,1,1,-1,0,1),w:4,h:4,size(w,h){if(w!==this.w||h!==this.h){this.w=w;this.h=h;rt.setSize(w,h);mat.uniforms.uRes.value.set(w,h);}},
    dispose(){rt.dispose();mat.dispose();q.geometry.dispose();}};
}
/* ---------- your hand and flashlight: drawn after the world, so it never sinks into a wall ---------- */
function facHand(){
  const g=new T.Group(),metal=new T.MeshPhongMaterial({color:0x5a140e,specular:0x4a3a38,shininess:30}),dark=new T.MeshPhongMaterial({color:0x1c1f22,specular:0x333333,shininess:20}),
    glove=new T.MeshPhongMaterial({color:0x232120,specular:0x161616,shininess:8}),sleeve=new T.MeshLambertMaterial({color:0x1d2629}),lens=new T.MeshBasicMaterial({color:0xfff4d8});
  const cyl=(r0,r1,h,m,z,seg)=>{const c=new T.Mesh(new T.CylinderGeometry(r0,r1,h,seg||16),m);c.rotation.x=Math.PI/2;c.position.z=z;g.add(c);return c;};
  /* the torch: a knurled body, a wider head with a bright rim, a rubber tail cap */
  cyl(.019,.019,.2,metal,.04);for(let i=0;i<4;i++)cyl(.0205,.0205,.008,dark,.0+i*.022);cyl(.021,.021,.03,dark,.155);
  cyl(.032,.021,.055,metal,-.088);cyl(.0335,.0335,.012,dark,-.118);const ln=cyl(.027,.027,.004,lens,-.125);
  const sw=new T.Mesh(new T.BoxGeometry(.012,.008,.022),dark);sw.position.set(0,.021,.07);g.add(sw);
  /* a gloved right hand wrapped round it, thumb on top, and the sleeve */
  const palm=new T.Mesh(new T.BoxGeometry(.052,.058,.09,2,2,2),glove);palm.position.set(.016,-.012,.07);g.add(palm);
  for(let i=0;i<4;i++){const f=new T.Mesh(new T.BoxGeometry(.03,.019,.021),glove);f.position.set(-.006,-.022+i*.001,.035+i*.022);f.rotation.z=-.5;g.add(f);
    const tip=new T.Mesh(new T.BoxGeometry(.016,.018,.02),glove);tip.position.set(-.024,-.004,.035+i*.022);g.add(tip);}
  const th=new T.Mesh(new T.BoxGeometry(.019,.017,.055),glove);th.position.set(-.006,.022,.05);th.rotation.y=.25;g.add(th);
  const cuff=new T.Mesh(new T.CylinderGeometry(.036,.04,.05,12),glove);cuff.rotation.x=Math.PI/2;cuff.position.set(.02,-.014,.135);g.add(cuff);
  const sl=new T.Mesh(new T.CylinderGeometry(.045,.056,.34,12),sleeve);sl.rotation.x=Math.PI/2;sl.position.set(.028,-.022,.3);g.add(sl);
  const sc=new T.Scene();sc.add(g);const amb=new T.AmbientLight(0xffffff,.25);sc.add(amb);const key=new T.DirectionalLight(0xffffff,1);sc.add(key);sc.add(key.target);
  return {g,sc,amb,key,pl:{intensity:0},lens:ln,mats:[metal,dark,glove,sleeve,lens]};
}
/* ---------- light through dusty air: soft shafts under some of the tubes, and motes that only show inside your beam ---------- */
function facShafts(W,U){
  const P=[],A=[],C=[],Nn=[],I=[];let n=0;const R=facRng(808);
  for(const l of W.lights){if(l.dead||l.wallL||l.col==='red'||l.px==null||R()<.35)continue;const ax=l.ax==='x',top=l.py-.02,len=Math.min(2.4,top-FCY[facBand(top)]-.2);
    const t0=[ax?.6:.09,ax?.09:.6],t1=[ax?.95:.75,ax?.75:.95],col=FLC[l.col]||FLC.cyan,k=(l.dim||1)*.5;
    const c=[[-1,-1],[1,-1],[1,1],[-1,1]];
    for(let s=0;s<4;s++){const a=c[s],b=c[(s+1)%4],v0=[l.px+a[0]*t0[0],top,l.pz+a[1]*t0[1]],v1=[l.px+b[0]*t0[0],top,l.pz+b[1]*t0[1]],v2=[l.px+b[0]*t1[0],top-len,l.pz+b[1]*t1[1]],v3=[l.px+a[0]*t1[0],top-len,l.pz+a[1]*t1[1]];
      const nx=(a[0]+b[0])/2,nz=(a[1]+b[1])/2;for(const v of[v0,v1,v2,v3]){P.push(v[0],v[1],v[2]);Nn.push(nx,0,nz);C.push(col[0]*k,col[1]*k,col[2]*k);}A.push(1,1,0,0);
      I.push(n,n+1,n+2,n,n+2,n+3);n+=4;}}
  if(!n)return null;
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(Nn,3));g.setAttribute('a',new T.Float32BufferAttribute(A,1));g.setAttribute('col',new T.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new T.ShaderMaterial({uniforms:Object.assign({},U,{uT:{value:0}}),transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
    vertexShader:'attribute float a;attribute vec3 col;varying float vA;varying vec3 vC;varying vec3 vW;varying vec3 vN;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vA=a;vC=col;vN=normal;gl_Position=projectionMatrix*viewMatrix*wp;}',
    fragmentShader:`uniform vec3 uCam;uniform float uPow;uniform float uT;uniform float uFogD;varying float vA;varying vec3 vC;varying vec3 vW;varying vec3 vN;
      void main(){vec3 V=normalize(uCam-vW);float f=pow(1.0-abs(dot(normalize(vN),V)),0.5);float d=length(uCam-vW);float near=smoothstep(0.6,2.6,d);
      float dust=0.75+0.25*sin(vW.x*3.1+uT*0.7)*sin(vW.z*2.7-uT*0.5)*sin(vW.y*4.0+uT*0.3);
      float a=vA*vA*f*near*dust*0.16*uPow*exp(-d*d*uFogD*uFogD*1.4);gl_FragColor=vec4(vC*a,1.0);}`});
  const mesh=new T.Mesh(g,m);mesh.renderOrder=3;mesh.frustumCulled=false;return mesh;
}
function facDust(U){
  const n=700,P=new Float32Array(n*3),S=new Float32Array(n),R=facRng(909);for(let i=0;i<n;i++){P[i*3]=R()*8-4;P[i*3+1]=R()*4-2;P[i*3+2]=R()*8-4;S[i]=R();}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('seed',new T.BufferAttribute(S,1));
  const m=new T.ShaderMaterial({uniforms:Object.assign({},U,{uT:{value:0},uBox:{value:new T.Vector3()}}),transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`attribute float seed;uniform vec3 uBox;uniform float uT;uniform vec3 uLP;uniform vec3 uLD;uniform vec2 uLCos;uniform float uLOn;varying float vB;
      void main(){vec3 p=position+vec3(sin(uT*0.13+seed*40.0)*0.4,sin(uT*0.09+seed*17.0)*0.3-uT*0.02*(0.5+seed),cos(uT*0.11+seed*23.0)*0.4);
        p=uBox+mod(p-uBox+vec3(4.0,2.0,4.0),vec3(8.0,4.0,8.0))-vec3(4.0,2.0,4.0);
        vec3 l=p-uLP;float d=length(l);float c=dot(l/max(d,0.001),uLD);vB=smoothstep(uLCos.y,uLCos.x,c)*uLOn/(1.0+0.25*d*d)*(0.4+0.6*fract(seed*91.0));
        vec4 mv=viewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(5.0/-mv.z,1.0,4.0);}`,
    fragmentShader:'varying float vB;void main(){vec2 c=gl_PointCoord-0.5;float a=smoothstep(0.25,0.0,dot(c,c))*vB*0.55;gl_FragColor=vec4(vec3(1.0,0.95,0.85)*a,1.0);}'});
  const pts=new T.Points(g,m);pts.frustumCulled=false;pts.renderOrder=4;return pts;
}
/* the flashlight's beam in the air: a faint cone that fades with distance */
function facBeamCone(U){
  const L=5.5,g=new T.CylinderGeometry(.03,Math.tan(.42)*L,L,18,1,true);g.translate(0,-L/2,0);g.rotateX(-Math.PI/2);
  const m=new T.ShaderMaterial({uniforms:Object.assign({},U,{uK:{value:.05}}),transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
    vertexShader:'varying vec3 vW;varying vec3 vN;varying float vZ;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);vZ=-position.z;gl_Position=projectionMatrix*viewMatrix*wp;}',
    fragmentShader:'uniform vec3 uCam;uniform float uK;uniform float uLOn;varying vec3 vW;varying vec3 vN;varying float vZ;void main(){vec3 V=normalize(uCam-vW);float f=pow(abs(dot(vN,V)),2.0);float a=f*uK*uLOn*smoothstep(5.5,0.3,vZ)*smoothstep(0.0,0.6,vZ);gl_FragColor=vec4(vec3(1.0,0.95,0.84)*a,1.0);}'});
  const c=new T.Mesh(g,m);c.frustumCulled=false;c.renderOrder=5;return c;
}
/* 3.16: the glow round every working tube and lamp, like the bloom in the reference. One mesh of camera-facing quads,
   pulled a little toward the camera so the ceiling does not cut it in half; walls in between still hide it. */
function facGlows(W,U){
  const P=[],Cn=[],Cl=[],I=[];let n=0;
  for(const l of W.lights){if(l.dead||l.px==null)continue;const col=FLC[l.col]||FLC.cyan,red=l.col==='red',k=(l.dim||1)*(red?.75:l.col==='warm'?.62:.8),s=l.wallL?(red?.95:.8):1.25;
    for(const [a,b] of[[-1,-1],[1,-1],[1,1],[-1,1]]){P.push(l.px,l.py-(l.wallL?0:.05),l.pz);Cn.push(a,b,s,red?1:0);Cl.push(col[0]*k,col[1]*k,col[2]*k);}
    I.push(n,n+1,n+2,n,n+2,n+3);n+=4;}
  if(!n)return null;
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('cn',new T.Float32BufferAttribute(Cn,4));g.setAttribute('col',new T.Float32BufferAttribute(Cl,3));g.setIndex(I);
  const m=new T.ShaderMaterial({uniforms:Object.assign({},U,{uGK:{value:1}}),transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`attribute vec4 cn;attribute vec3 col;uniform float uPow;uniform float uEmg;uniform float uFogD;varying vec2 vC;varying vec3 vCol;
      void main(){vec4 mv=viewMatrix*vec4(position,1.0);float d=-mv.z;float pull=min(0.55,d*0.4);mv.xyz*=(d-pull)/max(d,0.001);
        float s=cn.z*(d-pull)/max(d,0.001);mv.xy+=cn.xy*s;vC=cn.xy;
        float k=(cn.w>0.5?uEmg:uPow)*smoothstep(0.5,1.6,d)*exp(-d*d*uFogD*uFogD*0.8);vCol=col*k;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uGK;varying vec2 vC;varying vec3 vCol;void main(){float r=dot(vC,vC);float a=exp(-r*5.5)-0.0041;if(a<=0.0)discard;gl_FragColor=vec4(vCol*a*0.55*uGK,1.0);}`});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6;return mesh;
}
