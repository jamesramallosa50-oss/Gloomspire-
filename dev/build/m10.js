/* ===== BOSS PACK: new models for all ten guardians, smooth boss animation, tougher phases with bigger spells ===== */
/* Each model is built facing +z, about as tall as its hitbox (ET h), and registers extra parts in M.b2 for the boss animator:
   head (looks at you), torso (breathes), cape/tail (sway), orbit (circles), glow (pulses with the phase), hover (bobs). */
function b2parts(M){return M.b2||(M.b2={head:null,torso:null,cape:[],tail:[],orbit:[],glow:[],spin:[],eye:null});}
function bWarlord(M){const P2=b2parts(M),sk=0x4f7a32,dk=0x2e4a1e,ir=0x3a3c42,rd=0x7a1a1e,bn=0xe8dcc0,gd=0xc8902a;
  for(const s of[-1,1]){const l=M.piv(s*.2,.78,0);M.b(.24,.42,.26,dk,0,-.2,0,l);M.b(.26,.36,.28,ir,0,-.56,.02,l);M.b(.3,.1,.36,0x2a1a14,0,-.74,.06,l);M.legs.push(l);}
  const t=M.piv(0,.8,0);P2.torso=t;M.b(.78,.5,.5,sk,0,.4,0,t);M.b(.86,.34,.54,ir,0,.78,0,t);M.b(.7,.1,.56,rd,0,.24,0,t);M.b(.2,.16,.08,gd,0,.24,.29,t,GLOW);
  for(let i=0;i<3;i++)M.sp(.07,bn,-.25+i*.25,.12,.3,t);
  for(const s of[-1,1]){M.b(.4,.2,.5,ir,s*.52,1.0,0,t);for(let k=0;k<3;k++)M.cy(0,.05,.2,bn,s*(.42+k*.1),1.16,-.1+k*.08,t,null,4);}
  const h=M.piv(0,1.75,.05);P2.head=h;M.b(.42,.38,.4,sk,0,.12,0,h);M.b(.48,.18,.46,ir,0,.34,-.02,h);for(const s of[-1,1]){M.cy(0,.07,.4,bn,s*.28,.52,-.02,h,null,5).rotation.z=-s*.7;M.cy(0,.04,.14,bn,s*.12,-.02,.22,h,null,4).rotation.x=-.3;}
  M.b(.3,.05,.02,0xff3020,0,.18,.205,h,GLOW);P2.glow.push(M.mat(0xff3020,GLOW));
  const a0=M.piv(.6,1.55,0,-.2);M.b(.22,.62,.24,sk,0,-.3,0,a0);M.b(.26,.2,.26,ir,0,-.66,0,a0);M.b(.08,.9,.08,0x3a2414,0,-.9,.25,a0).rotation.x=1.3;
  M.b(.12,.7,.5,0xb8bcc4,0,-1.05,.82,a0);M.b(.04,.66,.06,0xff5a2a,0,-1.05,1.08,a0,GLOW);M.arms.push(a0);
  const a1=M.piv(-.6,1.55,0,-.1);M.b(.22,.62,.24,sk,0,-.3,0,a1);M.b(.1,.8,.7,rd,-.12,-.55,.15,a1);M.b(.03,.34,.34,gd,-.18,-.55,.15,a1);M.arms.push(a1);
  const c=M.piv(0,1.72,-.3);P2.cape.push(c);M.b(.95,1.5,.05,rd,0,-.75,0,c);M.b(.95,.08,.06,0x4a0a0e,0,-1.48,0,c);}
function bQueen(M){const P2=b2parts(M),c=0x2a1a2e,c2=0x6a1a3a,eg=0xb8ff6a;M.legAxis='y';
  const t=M.piv(0,.42,0);P2.torso=t;M.b(.5,.3,.5,c,0,0,.15,t);M.sp(.46,c2,0,.12,-.45,t);M.sp(.38,c,0,.2,-.72,t);
  for(const [x,y,z] of[[.2,.32,-.55],[-.22,.24,-.75],[0,.42,-.68],[.12,.1,-.9],[-.1,.36,-.45]]){M.sp(.09,eg,x,y,z,t,GLOW);}P2.glow.push(M.mat(eg,GLOW));
  for(let i=0;i<4;i++)for(const s of[-1,1]){const l=M.piv(s*.22,.42,.25-i*.17),q=new T.Group();q.rotation.y=s*(.3+i*.35)-(s>0?0:Math.PI)*0;l.add(q);const u=M.b(.6,.06,.07,c2,s*.3,.1,0,q);u.rotation.z=s*.5;M.b(.06,.5,.06,c,s*.58,-.12,0,q).rotation.z=-s*.25;M.legs.push(l);}
  const h=M.piv(0,.5,.42);P2.head=h;M.b(.36,.26,.3,c2,0,0,0,h);for(let i=-2;i<=2;i++)M.cy(0,.04,.24,0xe6b53a,i*.07,.2-Math.abs(i)*.03,-.02,h,null,4);
  for(const [x,y] of[[-.08,.04],[.08,.04],[-.13,-.03],[.13,-.03],[0,.08]])M.b(.05,.05,.02,0xff3030,x,y,.16,h,GLOW);
  M.jaw=new T.Group();M.jaw.position.set(0,-.08,.14);h.add(M.jaw);for(const s of[-1,1])M.cy(0,.035,.22,0xf4f0e0,s*.08,-.08,0,M.jaw,null,4).rotation.x=Math.PI;}
function bAshmaw(M){const P2=b2parts(M),sc=0x2a2226,bl=0x8a2a12,mo=0xff7a1a,bn=0x16100f;M.legAxis='x';
  const t=M.piv(0,1.0,0);P2.torso=t;M.b(.8,.62,1.3,sc,0,0,0,t);M.b(.6,.1,1.1,mo,0,-.32,0,t,GLOW);for(let i=0;i<6;i++)M.cy(0,.08,.3,bn,0,.42,-.55+i*.22,t,null,4);P2.glow.push(M.mat(mo,GLOW));
  for(const [x,z] of[[-.32,.42],[.32,.42],[-.32,-.42],[.32,-.42]]){const l=M.piv(x,.75,z);M.b(.22,.5,.26,sc,0,-.22,0,l);M.b(.26,.24,.34,bl,0,-.6,.06,l);M.b(.3,.06,.38,bn,0,-.72,.1,l);M.legs.push(l);}
  let nk=M.piv(0,1.25,.62);for(let i=0;i<3;i++){M.b(.32-i*.03,.3,.3,sc,0,.12,.12,nk);M.cy(0,.05,.16,bn,0,.3,.12,nk,null,4);const nn=new T.Group();nn.position.set(0,.2,.2);nk.add(nn);nk=nn;}
  P2.head=nk;M.b(.4,.3,.5,sc,0,.08,.2,nk);for(const s of[-1,1]){M.cy(0,.06,.45,bn,s*.14,.32,0,nk,null,5).rotation.x=-.9;M.b(.07,.05,.02,0xffd040,s*.12,.16,.46,nk,GLOW);}
  M.jaw=new T.Group();M.jaw.position.set(0,-.06,.25);nk.add(M.jaw);M.b(.36,.1,.42,bl,0,-.06,.18,M.jaw);for(const s of[-1,1])M.cy(0,.03,.1,0xf4f0e0,s*.12,0,.18,M.jaw,null,4);
  for(const s of[-1,1]){const w=M.piv(s*.38,1.35,0);M.b(.9,.06,.12,bn,s*.45,0,0,w);for(let k=0;k<3;k++){M.b(.04,.04,.7-k*.15,bn,s*(.3+k*.28),-.02,-.32+k*.05,w);M.b(.28,.02,.6-k*.12,0x5a1a10,s*(.44+k*.28),-.04,-.28+k*.05,w,{op:.9});}M.wings.push(w);}
  let tl=M.piv(0,.95,-.65);for(let i=0;i<5;i++){M.b(.24-i*.04,.2-i*.03,.36,sc,0,0,-.18,tl);M.cy(0,.04,.12,mo,0,.12,-.18,tl,GLOW,4);P2.tail.push(tl);const nt=new T.Group();nt.position.set(0,0,-.34);tl.add(nt);tl=nt;}}
function bLich(M){const P2=b2parts(M),rb=0x24283a,dk=0x14161f,bn=0xd8d8d0,gd=0xe6b53a,vi=0xff50e0;
  for(const s of[-1,1]){const l=M.piv(s*.14,.5,0);M.b(.16,.48,.18,dk,0,-.24,0,l);M.legs.push(l);}
  const t=M.piv(0,.6,0);P2.torso=t;M.cy(.3,.5,1.1,rb,0,.35,0,t,null,8);M.cy(.42,.56,.14,dk,0,-.18,0,t,null,8);M.b(.6,.3,.42,rb,0,.92,0,t);M.b(.7,.12,.5,gd,0,1.06,0,t);
  for(let i=0;i<5;i++)M.b(.12,.5,.02,dk,-.3+i*.15,-.05,.33,t).rotation.z=(i-2)*.08;
  const h=M.piv(0,1.85,0);P2.head=h;M.b(.36,.4,.34,bn,0,0,0,h);M.b(.44,.1,.44,gd,0,.24,0,h);for(const [x,z] of[[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17],[0,.2]])M.cy(0,.035,.16,gd,x,.34,z,h,null,4);
  for(const s of[-1,1])M.b(.09,.07,.02,vi,s*.09,.04,.175,h,GLOW);M.b(.2,.05,.02,dk,0,-.12,.175,h);P2.glow.push(M.mat(vi,GLOW));
  const a0=M.piv(.42,1.55,0,-.3);M.b(.16,.6,.18,rb,0,-.28,0,a0);M.b(.05,1.6,.05,0x3a2414,0,-.4,.2,a0);M.cy(.08,.2,.24,0xb8904a,0,.42,.2,a0,null,8);M.b(.05,.05,.05,0x3a2414,0,.25,.2,a0);M.arms.push(a0);
  const a1=M.piv(-.42,1.55,0,-.6);M.b(.16,.6,.18,rb,0,-.28,0,a1);M.b(.1,.12,.1,bn,0,-.62,0,a1);M.arms.push(a1);
  const o=new T.Group();o.position.set(0,1.3,0);M.g.add(o);P2.orbit.push(o);for(let i=0;i<3;i++){const an=i/3*6.283,b=M.cy(.05,.1,.14,0xb8904a,Math.cos(an)*.75,0,Math.sin(an)*.75,o,null,6);M.sp(.03,vi,Math.cos(an)*.75,-.09,Math.sin(an)*.75,o,GLOW);}
  const c=M.piv(0,1.8,-.25);P2.cape.push(c);M.b(.8,1.6,.04,dk,0,-.8,0,c);}
function bOoze(M){const P2=b2parts(M),gr=0x9ac83a,dg=0x4a6a1a,gd=0xe6b53a;
  const t=M.piv(0,0,0);P2.torso=t;P2.squash=true;M.b(1.1,.5,1.1,gr,0,.25,0,t,{op:.78});M.b(.9,.3,.9,gr,0,.6,0,t,{op:.78});M.b(.6,.16,.6,gr,0,.82,0,t,{op:.8});M.b(1.18,.08,1.18,dg,0,.03,0,t,{op:.9});
  for(const [x,y,z,r] of[[.2,.3,.1,.1],[-.25,.4,-.15,.08],[.1,.55,-.25,.07]])M.sp(r,0xd8d0b8,x,y,z,t);M.b(.3,.05,.05,0xd8d0b8,-.1,.2,.2,t).rotation.y=.6;
  const h=M.piv(0,.9,0);P2.head=h;M.b(.5,.1,.5,gd,0,0,0,h);for(const [x,z] of[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2],[0,.22]])M.cy(0,.06,.2,gd,x,.14,z,h,null,4);M.b(.1,.1,.02,0xff3048,0,.02,.26,h,GLOW);
  for(const s of[-1,1])M.b(.12,.14,.04,0xf4ffe0,s*.2,-.25,.55,h,GLOW);M.b(.36,.06,.04,0x1a2a08,0,-.42,.55,h);P2.glow.push(M.mat(0xf4ffe0,GLOW));
  for(let i=0;i<4;i++){const o=new T.Group();o.position.set(0,.4,0);M.g.add(o);P2.orbit.push(o);M.sp(.12,gr,.85,0,0,o,{op:.6});o.rotation.y=i*1.57;}}
function bKnight(M){const P2=b2parts(M),pl=0x8a8f96,dp=0x5c626c,bl=0x6fd0ff,cl=0x2a3a7a,dk=0x14161f;
  for(const s of[-1,1]){const l=M.piv(s*.2,.8,0);M.b(.22,.44,.24,dp,0,-.2,0,l);M.b(.26,.38,.28,pl,0,-.58,.02,l);M.b(.28,.08,.34,dk,0,-.76,.05,l);M.legs.push(l);}
  const t=M.piv(0,.8,0);P2.torso=t;M.b(.72,.62,.44,pl,0,.4,0,t);M.b(.6,.5,.02,cl,0,.35,.23,t);M.b(.12,.3,.02,bl,0,.4,.245,t,GLOW);M.b(.78,.1,.48,dk,0,.06,0,t);
  for(const s of[-1,1]){M.b(.36,.18,.48,pl,s*.5,.84,0,t);M.b(.3,.04,.44,bl,s*.5,.95,0,t,GLOW);}P2.glow.push(M.mat(bl,GLOW));
  const h=M.piv(0,1.75,.03);P2.head=h;M.b(.44,.48,.44,dp,0,.2,0,h);M.b(.34,.05,.02,bl,0,.24,.225,h,GLOW);M.b(.04,.22,.02,dk,0,.12,.225,h);M.b(.08,.36,.32,0x3f6ae8,0,.56,-.04,h);
  const a0=M.piv(.55,1.55,0,-.2);M.b(.2,.6,.22,pl,0,-.3,0,a0);M.b(.24,.18,.26,dp,0,-.62,0,a0);M.b(.07,.16,1.7,0xc8ccd4,0,-.72,1.0,a0);M.b(.025,.04,1.6,bl,0,-.66,1.0,a0,GLOW);M.b(.44,.08,.08,0xe6b53a,0,-.72,.18,a0);M.arms.push(a0);
  const a1=M.piv(-.55,1.55,0,-.4);M.b(.2,.6,.22,pl,0,-.3,0,a1);M.b(.08,1.1,.72,0x3f4a6a,-.12,-.5,.15,a1);M.b(.02,.5,.3,bl,-.17,-.5,.15,a1,GLOW);M.arms.push(a1);
  const c=M.piv(0,1.7,-.25);P2.cape.push(c);M.b(.9,1.55,.05,cl,0,-.78,0,c);M.b(.9,.06,.06,0xe6b53a,0,-1.52,0,c);}
function bMatriarch(M){const P2=b2parts(M),sk=0x3a1020,dk=0x1a0810,em=0xff7a1a,pk=0xff4ad8;
  for(const s of[-1,1]){const l=M.piv(s*.1,.32,0);M.b(.1,.3,.12,sk,0,-.14,0,l);M.b(.12,.06,.16,dk,0,-.3,.03,l);M.legs.push(l);}
  const t=M.piv(0,.35,0);P2.torso=t;M.b(.36,.38,.26,sk,0,.2,0,t);M.b(.14,.14,.04,pk,0,.22,.14,t,GLOW);P2.glow.push(M.mat(pk,GLOW));
  const h=M.piv(0,.82,0);P2.head=h;M.b(.3,.28,.26,sk,0,.04,0,h);for(const s of[-1,1]){M.cy(0,.04,.24,dk,s*.11,.24,-.02,h,null,4).rotation.z=-s*.4;M.b(.06,.04,.02,em,s*.07,.06,.135,h,GLOW);}
  const halo=new T.Group();halo.position.set(0,.3,-.05);h.add(halo);P2.spin.push(halo);for(let i=0;i<8;i++){const an=i/8*6.283;M.b(.05,.05,.03,em,Math.cos(an)*.24,Math.sin(an)*.24,0,halo,GLOW);}
  for(const s of[-1,1]){const a=M.piv(s*.24,.52,0,-.3);M.b(.08,.28,.08,sk,0,-.14,0,a);for(let k=-1;k<=1;k++)M.cy(0,.02,.1,0xf4f0e0,k*.03,-.32,.03,a,null,3).rotation.x=Math.PI;M.arms.push(a);}
  for(const s of[-1,1]){const w=M.piv(s*.12,.55,-.12);for(let k=0;k<3;k++){M.b(.03,.03,.5,dk,s*(.2+k*.2),.08-k*.04,-.05,w).rotation.y=s*.4;M.b(.22,.36,.02,dk,s*(.3+k*.2),-.02-k*.05,-.08,w,{op:.92});}M.b(.6,.03,.04,pk,s*.38,.14,-.06,w,GLOW);M.wings.push(w);}
  let tl=M.piv(0,.2,-.12);for(let i=0;i<4;i++){M.b(.06,.06,.18,sk,0,0,-.09,tl);P2.tail.push(tl);const nt=new T.Group();nt.position.set(0,-.02,-.17);tl.add(nt);tl=nt;}M.b(.1,.1,.1,em,0,0,-.06,tl,GLOW);}
function bChoir(M){const P2=b2parts(M),sh=0xc8d8e0,dk=0x0a1016,gl=0xbfe8ff;
  const t=M.piv(0,.25,0);P2.torso=t;for(let i=0;i<5;i++)M.cy(.22+i*.05,.34+i*.06,.32,sh,0,.15+i*.28,0,t,{op:.55+i*.06},10);M.b(.9,.3,.7,sh,0,-.1,0,t,{op:.25});
  const h=M.piv(0,1.65,0);P2.head=h;M.cy(.36,.36,.03,gl,0,.38,0,h,GLOW,16);M.cy(.28,.28,.035,dk,0,.38,0,h,null,16);P2.glow.push(M.mat(gl,GLOW));
  const ring=new T.Group();h.add(ring);P2.spin.push(ring);for(let i=0;i<3;i++){const an=i/3*6.283,g=new T.Group();g.position.set(Math.sin(an)*.32,0,Math.cos(an)*.32);g.rotation.y=an;ring.add(g);
    M.b(.24,.3,.05,0xf4f4f0,0,0,0,g);M.b(.05,.04,.02,dk,-.06,.05,.03,g);M.b(.05,.04,.02,dk,.06,.05,.03,g);M.b(.1,.03+i*.02,.02,dk,0,-.07,.03,g);}
  for(const s of[-1,1]){const a=M.piv(s*.4,1.4,0,-.2);M.b(.08,.8,.08,sh,0,-.4,0,a,{op:.7});for(let k=-1;k<=1;k++)M.b(.025,.22,.025,0xf4f4f0,k*.035,-.9,.02,a);M.arms.push(a);}
  for(let i=0;i<3;i++){const o=new T.Group();o.position.set(0,.6+i*.35,0);M.g.add(o);P2.orbit.push(o);M.b(.06,.06,.06,gl,.6,0,0,o,GLOW);o.rotation.y=i*2.1;}}
function bColossus(M){const P2=b2parts(M),bn=0xc8b890,db=0x8a7a5a,em=0xff5a2a;
  for(const s of[-1,1]){const l=M.piv(s*.18,.72,0);M.b(.1,.4,.1,bn,0,-.2,0,l);M.sp(.07,bn,0,-.4,0,l);M.b(.09,.32,.09,bn,0,-.58,0,l);M.b(.18,.05,.24,db,0,-.73,.04,l);M.legs.push(l);}
  const t=M.piv(0,.75,0);P2.torso=t;M.b(.1,.75,.1,db,0,.35,-.1,t);for(let i=0;i<5;i++){M.b(.5-i*.03,.04,.32,bn,0,.2+i*.11,0,t);}M.b(.14,.14,.14,em,0,.4,0,t,GLOW);P2.glow.push(M.mat(em,GLOW));M.b(.5,.12,.3,db,0,0,0,t);
  for(const s of[-1,1]){M.sp(.13,bn,s*.32,.75,0,t);M.cy(0,.06,.4,bn,s*.32,.92,0,t,null,5).rotation.z=-s*.5;}
  const h=M.piv(0,1.55,.02);P2.head=h;M.b(.3,.3,.3,bn,0,.05,0,h);M.b(.26,.08,.2,db,0,-.12,.06,h);for(const s of[-1,1]){M.b(.07,.06,.02,em,s*.07,.07,.155,h,GLOW);M.cy(0,.05,.36,bn,s*.17,.3,-.04,h,null,5).rotation.z=-s*.55;}
  const a0=M.piv(.42,1.45,0,-.5);M.b(.1,.5,.1,bn,0,-.25,0,a0);M.b(.09,.45,.09,bn,0,-.65,.05,a0);M.b(.05,1.2,.05,db,0,-.6,.25,a0);M.b(.012,1.1,.012,0xf4f0e0,0,-.6,.14,a0);M.arms.push(a0);
  const a1=M.piv(-.42,1.45,0,-.3);M.b(.1,.5,.1,bn,0,-.25,0,a1);M.b(.09,.45,.09,bn,0,-.65,.05,a1);for(let k=-1;k<=1;k++)M.b(.025,.14,.025,bn,k*.04,-.92,.07,a1);M.arms.push(a1);
  for(let i=0;i<5;i++){const o=new T.Group();o.position.set(0,.6+i*.2,0);M.g.add(o);P2.orbit.push(o);M.b(.05,.12,.05,bn,.55,0,0,o);o.rotation.y=i*1.25;}}
function bBell(M){const P2=b2parts(M),br=0x8a6a2a,b2=0x6a4a1a,gd=0xe6b53a,vi=0xb07aff;
  const t=M.piv(0,0,0);P2.torso=t;M.cy(.25,.5,.5,br,0,1.55,0,t,null,12);M.cy(.5,.72,.6,b2,0,1.0,0,t,null,12);M.cy(.72,.95,.3,br,0,.55,0,t,null,12);M.cy(.98,.98,.08,gd,0,.4,0,t,null,12);
  for(let i=0;i<6;i++){const an=i/6*6.283;M.b(.04,.4,.02,0x2a1a0a,Math.sin(an)*.6,1.05,Math.cos(an)*.6,t).rotation.y=an;}
  M.cy(.12,.25,.2,gd,0,1.9,0,t);M.b(1,.12,.14,0x3a2414,0,2.05,0,t);
  const eye=M.piv(0,1.05,.52);P2.eye=eye;P2.head=eye;M.sp(.24,0x14060c,0,0,0,eye);M.b(.22,.22,.04,vi,0,0,.2,eye,GLOW);M.b(.08,.16,.02,0x06030a,0,0,.225,eye);P2.glow.push(M.mat(vi,GLOW));
  const ring=new T.Group();ring.position.set(0,.62,0);M.g.add(ring);P2.spin.push(ring);for(let i=0;i<8;i++){const an=i/8*6.283+.39,m=M.b(.1,.14,.03,0xffd24a,Math.sin(an)*.9,0,Math.cos(an)*.9,ring,GLOW);m.rotation.y=an;}
  M.jaw=M.piv(0,.9,0);M.cy(.04,.04,.6,0x3a2414,0,-.3,0,M.jaw);M.sp(.16,gd,0,-.62,0,M.jaw);
  for(const s of[-1,1]){const p=M.piv(s*.8,1.2,0,-.3);for(let j=0;j<5;j++)M.b(.07,.16,.05,0x5c626c,0,-.1-j*.17,0,p).rotation.y=j%2*1.57;M.b(.24,.08,.08,0xc8ccd4,0,-.95,.08,p);M.arms.push(p);}}

/* smooth boss animation, layered on top of the shared monster animation */
function boss2Anim(e,dt,moving){
  const M=e.M,P2=M.b2;if(!P2)return;const b=B2&&B2.e===e?B2:null,ph=b?b.ph:0,tm=time+e.ph;
  /* turn smoothly instead of snapping */
  if(e._fs==null)e._fs=e.face;let df=e.face-e._fs;df=Math.atan2(Math.sin(df),Math.cos(df));e._fs+=df*Math.min(1,dt*(5+ph*2));e.g.rotation.y=e._fs+(e.awake?0:Math.sin(time*.6+e.ph)*.3);
  if(P2.torso){const br=1+Math.sin(tm*(1.6+ph*.6))*.035;P2.torso.scale.set(1+(br-1)*.5,br,1+(br-1)*.5);
    if(P2.squash){const q=1+Math.sin(tm*4)*.07+(moving?Math.abs(Math.sin(e.t*.5))*.18:0);P2.torso.scale.set(2-q,q,2-q);}}
  if(P2.head){/* the head follows you */let ya=Math.atan2(P.x-e.x,P.z-e.z)-e.g.rotation.y;ya=Math.atan2(Math.sin(ya),Math.cos(ya));ya=clamp(ya,-.8,.8);
    const h=P2.head;h.rotation.y+=(ya-h.rotation.y)*Math.min(1,dt*6);const wantX=e.wind>0||e.slam>0?-.25:Math.sin(tm*1.3)*.05;h.rotation.x+=(wantX-h.rotation.x)*Math.min(1,dt*5);}
  for(const c of P2.cape){const sw=Math.sin(tm*2.2)*.06+(moving?.25:.05);c.rotation.x+=(sw-c.rotation.x)*Math.min(1,dt*4);}
  P2.tail.forEach((t,i)=>{t.rotation.y=Math.sin(tm*2.4-i*.7)*(.18+i*.04)*(moving?1.4:1);t.rotation.x=Math.sin(tm*1.7-i*.5)*.06;});
  P2.orbit.forEach((o,i)=>{o.rotation.y+=dt*(.8+ph*.7)*(i%2?-1:1);o.position.y+=Math.sin(tm*2+i)*.002;});
  P2.spin.forEach((o,i)=>{o.rotation[i%2?'y':'z']+=dt*(.6+ph*.9);});
  if(P2.glow.length){const k=.7+.3*Math.sin(tm*(3+ph*3)),c=[0,.35,.8][ph]||0;for(const m of P2.glow){if(!m._b0)m._b0=m.color.clone();m.color.copy(m._b0).multiplyScalar(k+c*.6);}}
  /* a shield bubble while it is between phases */
  if(e.b2shT>0){e.b2shT-=dt;if(!M.b2sh){const s=new T.Mesh(SPHG,FXA(0x8fd0ff,.25));M.g.add(s);M.b2sh=s;}M.b2sh.visible=true;const k=1.15+Math.sin(time*8)*.04;M.b2sh.scale.set(k*1.1,k*Math.max(1,e.D.h*.7),k*1.1);M.b2sh.position.y=e.D.h*.5;M.b2sh.material.opacity=.18+.1*Math.sin(time*6);if(e.b2shT<=0){M.b2sh.visible=false;e.b2arm=b?[1,.85,.7][b.ph]:1;}}
}

/* bigger spells for later phases */
const BEAMS=[];for(let i=0;i<4;i++){const m=new T.Mesh(new T.BoxGeometry(1,.5,.7),FXA(0xff4a2a,.0));m.visible=false;scene.add(m);BEAMS.push({m,on:false});}
function bossBeams(e,n,dur,dmg,col){/* rotating beams from the boss: jump them or stay out of their arc */
  const L0=16,list=[];for(let i=0;i<n;i++){const B=BEAMS.find(q=>!q.on);if(!B)break;B.on=true;B.m.material.color.setHex(col);B.m.visible=true;B.m.scale.set(L0,1,1);list.push(B);}
  const st={t:0,a:Math.random()*6.283,tick:0,warm:.9};sfx('zap');
  const step=()=>{if(state!=='play'||e.dead){list.forEach(B=>{B.on=false;B.m.visible=false;});return;}
    st.t+=.033;const warm=st.t<st.warm;st.a+=(warm?.3:1.25)*.033;st.tick-=.033;
    list.forEach((B,i)=>{const an=st.a+i*6.283/list.length,cx=e.x+Math.sin(an)*L0/2,cz=e.z+Math.cos(an)*L0/2;B.m.position.set(cx,warm?.05:.35,cz);B.m.rotation.y=an-Math.PI/2;B.m.material.opacity=warm?.25+.2*Math.sin(st.t*30):.8;B.m.scale.y=warm?.1:1;
      if(!warm&&st.tick<=0){const px=P.x-e.x,pz=P.z-e.z,along=px*Math.sin(an)+pz*Math.cos(an),perp=Math.abs(px*Math.cos(an)-pz*Math.sin(an));if(along>0&&along<L0&&perp<.65&&PY()<.55)hurtP(dmg,{x:e.x,z:e.z,name:e.name});}});
    if(!warm&&st.tick<=0)st.tick=.35;
    if(st.t<dur)after(.033,step);else list.forEach(B=>{B.on=false;B.m.visible=false;});};
  step();}
function bossOrbs(e,n,dmg){const m={x:e.x,y:e.y+e.h*.7,z:e.z};for(let i=0;i<n;i++)after(i*.12,()=>{if(e.dead||state!=='play')return;const an=Math.atan2(P.x-e.x,P.z-e.z)+(i-(n-1)/2)*.35;
  shootProj({kind:'hex',from:'e',x:m.x,y:m.y,z:m.z,dx:Math.sin(an),dy:0,dz:Math.cos(an),spd:8,life:4.5,dmg,who:e.name});});sfx('blink');}
function bossMeteors(e,n,dmg,col){for(let i=0;i<n;i++)after(i*.16,()=>{if(e.dead||state!=='play')return;const an=Math.random()*6.283,rr=i?rnd(1.5,6):0;tgMark(P.x+Math.cos(an)*rr,P.z+Math.sin(an)*rr,1.6,.9,dmg,e.name,col);});sfx('fire');}
/* a new phase: a short shield, then it takes less damage, hits harder and casts more */
function boss2PhaseUp(b){const e=b.e;e.b2shT=2.2;e.b2arm=.08;e.dmg*=1.18;sfx('bell');banner(e.name.toUpperCase(),b.ph===1?'Its blood is up · it hardens':'It will not fall quietly · it hardens again',2200);}
