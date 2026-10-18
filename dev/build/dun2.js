/* ===== DUNGEON PACK: boss rework, wave trials, rune plates, weapon summons ===== */
/* ---------- shared HUD (inside #hud, so menus always cover it) ---------- */
const D2={};
{const h=$('hud');
 const bb=document.createElement('div');bb.id='b2bar';bb.hidden=true;bb.innerHTML='<b id="b2name"></b><div id="b2track"><i id="b2trail"></i><i id="b2fill"></i><u style="left:33.3%"></u><u style="left:66.6%"></u></div><span id="b2ph"></span>';h.appendChild(bb);
 const th=document.createElement('div');th.id='d2hud';th.hidden=true;h.appendChild(th);
 const st=document.createElement('style');st.textContent=
 '#b2bar{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);width:min(34vw,440px);text-align:center;pointer-events:none;font-family:inherit;z-index:1}'+
 '#b2bar b{display:block;color:#ffd890;font-size:12px;letter-spacing:2px;text-shadow:0 0 6px #000,0 2px 0 #000;margin-bottom:3px}'+
 '#b2track{position:relative;height:12px;background:#120a0a;border:2px solid #5a2a1e;box-shadow:0 0 0 2px #000,0 0 14px rgba(255,60,30,.25)}'+
 '#b2fill,#b2trail{position:absolute;left:0;top:0;bottom:0;width:100%}#b2fill{background:linear-gradient(#ff5a3a,#b8181d);transition:width .08s}#b2trail{background:#fff0c0;transition:width .6s ease-out .15s}'+
 '#b2track u{position:absolute;top:-2px;bottom:-2px;width:2px;background:#000}#b2ph{display:block;color:#ff8a5a;font-size:9px;margin-top:3px;letter-spacing:1px;text-shadow:0 1px 0 #000}'+
 '#b2bar.enr #b2track{border-color:#ff3a2a;animation:b2p .5s infinite alternate}@keyframes b2p{to{box-shadow:0 0 0 2px #000,0 0 22px rgba(255,40,20,.7)}}'+
 '#d2hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 56px);left:50%;transform:translateX(-50%);pointer-events:none;color:#ffe6a0;font-size:12px;letter-spacing:1px;text-shadow:0 0 6px #000,0 2px 0 #000;background:rgba(10,8,6,.55);border:2px solid #6a4a22;padding:4px 10px;white-space:nowrap;z-index:1}'+
 '#d2hud em{font-style:normal;color:#fff}#d2hud.bad{color:#ff8a7a;border-color:#7a2a22}'+
 /* summon screen */
 '#summon{z-index:5;display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px;overflow:auto}#summon[hidden]{display:none!important}'+
 '#summon h2{margin:0;color:#ffd890;letter-spacing:3px}#sban{width:min(92vw,640px);border:3px solid #3a5aa8;background:linear-gradient(135deg,#0b1a3a,#1b2d66 55%,#0b1a3a);padding:12px;text-align:center;box-shadow:0 0 30px rgba(80,140,255,.25);position:relative;overflow:hidden}'+
 '#sban:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent 0 20deg,rgba(255,255,255,.06) 20deg 25deg,transparent 25deg 45deg);animation:sspin 14s linear infinite}@keyframes sspin{to{transform:rotate(360deg)}}'+
 '#sban p{position:relative;max-width:none;margin:4px 0;color:#cfe0ff;font-size:11px}#sban .rates{color:#9fb6e8;font-size:9px}#sgold{color:#ffd24a}'+
 '#sbtns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}#sbtns button{min-width:150px}'+
 '#scards{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:min(96vw,760px);min-height:10px}'+
 '.scard{width:132px;height:178px;perspective:600px;cursor:pointer}.scard .in{position:relative;width:100%;height:100%;transition:transform .45s cubic-bezier(.3,1.4,.5,1);transform-style:preserve-3d}.scard.open .in{transform:rotateY(180deg)}'+
 '.scard .bk,.scard .fr{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:3px solid #3a5aa8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;box-sizing:border-box}'+
 '.scard .bk{background:repeating-linear-gradient(45deg,#13265a 0 8px,#0e1c44 8px 16px);color:#9fc0ff;font-size:28px}.scard .fr{transform:rotateY(180deg);background:radial-gradient(circle at 50% 35%,var(--rc,#fff) -60%,#0c0f18 70%);border-color:var(--rc,#fff);text-align:center}'+
 '.scard .st{color:#ffd24a;font-size:13px;letter-spacing:1px;text-shadow:0 0 6px #000}.scard img{width:110px;height:55px;image-rendering:pixelated}.scard .nm{font-size:9px;line-height:1.25;color:var(--rc,#fff);text-shadow:0 1px 0 #000}.scard .sl{font-size:8px;color:#aaa}'+
 '.scard.hi .fr{box-shadow:0 0 22px var(--rc),inset 0 0 18px var(--rc)}.scard.hi.open{animation:shop .5s}@keyframes shop{40%{transform:scale(1.12)}}'+
 '.scard .eq{margin-top:2px;font-size:9px;padding:3px 6px}.scard.taken .eq{opacity:.45}'+
 '#snote{color:#9fb6e8;font-size:10px;min-height:14px;text-align:center}';
 document.head.appendChild(st);}

/* ---------- telegraphed attacks (pooled) ---------- */
const TG_RING=new T.RingGeometry(.9,1,40),TG_DISC=new T.CircleGeometry(1,40);
const MARKS=[];for(let i=0;i<10;i++){const g=new T.Group(),m1=FXA(0xff3a1a,0),m2=FXA(0xff6a2a,0);const a=new T.Mesh(TG_RING,m1),b=new T.Mesh(TG_DISC,m2);a.rotation.x=b.rotation.x=-Math.PI/2;b.position.y=-.01;g.add(a);g.add(b);g.visible=false;g.renderOrder=3;scene.add(g);MARKS.push({g,m1,m2,b,t:0,on:false});}
const NOVAS=[];for(let i=0;i<2;i++){const m=FXA(0xff7a2a,0),r=new T.Mesh(new T.RingGeometry(.93,1,64),m);r.rotation.x=-Math.PI/2;r.visible=false;r.renderOrder=3;scene.add(r);NOVAS.push({r,m,on:false});}
function tgMark(x,z,rad,dur,dmg,src,col){const M=MARKS.find(q=>!q.on);if(!M)return;M.on=true;M.x=x;M.z=z;M.rad=rad;M.dur=dur;M.t=0;M.dmg=dmg;M.src=src;M.col=col||0xff3a1a;
  M.m1.color.setHex(M.col);M.m2.color.setHex(M.col);M.g.position.set(x,.07,z);M.g.scale.setScalar(rad);M.g.visible=true;}
function tgNova(x,z,spd,max,dmg,src){const N=NOVAS.find(q=>!q.on);if(!N)return;N.on=true;N.x=x;N.z=z;N.rad=.6;N.spd=spd;N.max=max;N.dmg=dmg;N.src=src;N.hit=false;N.r.position.set(x,.09,z);N.r.visible=true;sfx('boom');}
function tgClear(){for(const M of MARKS){M.on=false;M.g.visible=false;}for(const N of NOVAS){N.on=false;N.r.visible=false;}}
function tgTick(dt){
  for(const M of MARKS){if(!M.on)continue;M.t+=dt;const k=Math.min(1,M.t/M.dur);M.b.scale.setScalar(Math.max(.02,k));M.m1.opacity=.55+.4*Math.sin(M.t*24);M.m2.opacity=.18+.3*k;
    if(k>=1){M.on=false;M.g.visible=false;const c=hex2c(M.col);sphereFx(M.x,.6,M.z,.3,M.rad*.9,M.col,.25,.6);burst(M.x,.3,M.z,fxLow()?8:16,c,4,.5,.6);flash(M.x,1,M.z,M.col,1.6);
      if(M.dmg>0&&state==='play'&&Math.hypot(P.x-M.x,P.z-M.z)<M.rad+PR*.5&&PY()<1.6)hurtP(M.dmg,{x:M.x,z:M.z,name:M.src});}}
  for(const N of NOVAS){if(!N.on)continue;N.rad+=N.spd*dt;N.r.scale.setScalar(N.rad);N.m.opacity=Math.max(0,.9-N.rad/N.max*.6);
    if(!N.hit&&state==='play'){const d=Math.hypot(P.x-N.x,P.z-N.z);if(Math.abs(d-N.rad)<.55&&PY()<.45){N.hit=true;hurtP(N.dmg,{x:N.x,z:N.z,name:N.src});}}
    if(N.rad>=N.max){N.on=false;N.r.visible=false;}}
}

/* ---------- bosses: bigger, three phases, telegraphed attacks, adds, a proper hall ---------- */
let B2=null;
function boss2Init(e,r){
  if(!e||PVP.on)return;
  {const bi=Math.max(0,(P.floor/5|0)-1);e.maxHp=Math.round(e.maxHp*(1.35+.1*bi));e.dmg*=1+.05*bi;}e.hp=e.maxHp;e.b2arm=1;
  const BC={warlord:0xff4a2a,queen:0x9aff5a,ashmaw:0xff7a1a,lich:0xd060ff,oozeking:0x9ac83a,knight:0x6fd0ff,matriarch:0xff4ad8,choir:0xbfe8ff,colossus:0xff5a2a,bell:0xb07aff,king:0xffd24a};
  B2={e,r,ph:0,at:5,shown:false,brz:[],rune:null,trail:1,pat:0,col:BC[e.type]||0xff4a2a};
  const cx=(wx(r.x0)+wx(r.x1))/2,cz=(wx(r.y0)+wx(r.y1))/2,th=L.theme||{},glow=th.glow||0xff6a2a,torch=th.torch||0xff8a30;
  /* a rune circle on the floor that turns with the fight */
  const rg=new T.Group();rg.position.set(cx,.05,cz);
  const rm=FXA(glow,.32),rm2=FXA(glow,.18);
  for(const [r0,m] of[[6.2,rm],[4.6,rm2],[2.4,rm]]){const q=new T.Mesh(RINGG,m);q.rotation.x=-Math.PI/2;q.scale.setScalar(r0);rg.add(q);}
  for(let i=0;i<2;i++){const q=new T.Mesh(SQG,rm2);q.rotation.x=-Math.PI/2;q.rotation.z=i*.785;q.scale.setScalar(5.4);rg.add(q);}
  lvl.add(rg);B2.rune=rg;B2.rm=rm;B2.rm2=rm2;
  /* braziers in the corners, chains hanging from the high ceiling */
  const corners=[[r.x0+1,r.y0+1],[r.x1-1,r.y0+1],[r.x0+1,r.y1-1],[r.x1-1,r.y1-1]];
  for(const [x,y] of corners){if(L.grid[y*L.W+x]===0)continue;const bx=wx(x),bz=wx(y);
    prop(bx,bz,0,M=>{M.cy(.12,.2,1.1,0x2a2622,0,.55,0,null,null,8);M.cy(.48,.28,.32,0x3a342c,0,1.25,0,null,null,10);M.cy(.4,.4,.06,0x1a1410,0,1.4,0,null,null,10);M.b(.5,.24,.5,torch,0,1.5,0,null,GLOW).rotation.y=.78;M.b(.3,.4,.3,0xffe0a0,0,1.6,0,null,GLOW);});
    B2.brz.push({x:bx,z:bz});}
  for(let i=0;i<6;i++){const x=rnd(wx(r.x0)+2,wx(r.x1)-2),z=rnd(wx(r.y0)+2,wx(r.y1)-2),len=rnd(1.5,3.5);
    prop(x,z,rnd(3),M=>{for(let k=0;k<Math.round(len/.3);k++)M.b(.06,.22,.12,0x3a3c42,0,HB-.15-k*.28,0).rotation.y=k%2*1.57;M.b(.3,.3,.3,0x2a2c30,0,HB-len-.3,0);});}
  /* banners on the walls behind the boss */
  for(const x of[r.x0+3,r.x1-3]){const z=wx(r.y0)-1.45;prop(wx(x),z+.02,0,M=>{M.b(1.4,3.2,.05,0x5a1a1e,0,HB-2.4,0);M.b(1.5,.12,.12,0x3a2a1a,0,HB-.75,0);M.b(.5,.5,.06,0xd8a040,0,HB-2.2,.02,null,GLOW).rotation.z=.78;});}
}
function boss2Tick(dt){
  const b=B2;if(!b)return;const e=b.e,bar=$('b2bar');
  if(e.dead||!enemies.includes(e)){if(!bar.hidden){bar.hidden=true;tgClear();if(e.dead&&!b.paid){b.paid=true;/* the hoard */for(let i=0;i<2;i++)addItem('chest',e.x+rnd(-1.5,1.5),e.z+rnd(-1.5,1.5));const g=Math.round(120+P.floor*25);P.gold+=g;floatText(e.x,e.h+1,e.z,'+'+g+'g','coin');}}
    if(b.rune){b.rune.rotation.y+=dt*.1;b.rm.opacity=Math.max(.05,b.rm.opacity-dt*.2);}return;}
  if(b.rune){b.rune.rotation.y+=dt*(.25+b.ph*.35);const pul=.25+.12*Math.sin(time*(2+b.ph*2));b.rm.opacity=pul+(e.awake?.1:0);}
  for(const z of b.brz)if(Math.random()<.35&&Math.hypot(z.x-P.x,z.z-P.z)<24)spark(z.x+rnd(-.2,.2),1.6,z.z+rnd(-.2,.2),rnd(-.2,.2),rnd(1,2.4),rnd(-.2,.2),.5,[1,.6+Math.random()*.3,.15],-.15);
  const d=Math.hypot(e.x-P.x,e.z-P.z);
  if(!e.awake||d>45||state!=='play'){if(state==='play')bar.hidden=true;return;}
  if(!b.shown){b.shown=true;b.at=3.5;}
  bar.hidden=false;const f=Math.max(0,e.hp/e.maxHp);
  $('b2name').textContent=e.name.toUpperCase();$('b2fill').style.width=(f*100)+'%';b.trail=Math.max(f,b.trail-dt*.25);$('b2trail').style.width=(b.trail*100)+'%';
  $('b2ph').textContent=['','ENRAGED','DESPERATE'][b.ph]||'';bar.classList.toggle('enr',b.ph>=2);
  /* phase changes at two thirds and one third */
  const want=f<.34?2:f<.67?1:0;
  if(want>b.ph){b.ph=want;e.spd*=1.12;sfx('roar');shake=Math.max(shake,.35);boss2PhaseUp(b);
    pillarFx(e.x,e.z,2.2,0xff4a2a,.9,.6);tgNova(e.x,e.z,11,16,e.dmg*.55,e.name);
    if(d<6){const k=(6-d)/6,ux=(P.x-e.x)/(d||1),uz=(P.z-e.z)/(d||1);for(let i=0;i<6;i++)slide(P,ux*k*.5,uz*k*.5,PR);}
    if(!MP.on){const pool=Object.keys(ET).filter(k=>ET[k].minF<=P.floor&&ET[k].w>0&&ET[k].cost<=4);const n=1+b.ph+(P.floor>=10?1:0);
      for(let i=0;i<n;i++){let x=e.x,z=e.z;for(let t=0;t<12;t++){const c=roomCell(b.r);x=wx(c.x)+rnd(-.6,.6);z=wx(c.y)+rnd(-.6,.6);if(Math.hypot(x-P.x,z-P.z)>5)break;}
        const a=spawnEnemy(pick(pool),x,z,b.r.idx,{sid:SIDN++});if(a){a.awake=true;a.see=true;pillarFx(x,z,.9,0xff5a2a,.6,.5);ringFx(x,z,.2,1.8,0xff5a2a,.4);}}}
    b.at=2.2;}
  /* telegraphed attacks: marks under your feet, a line of fire, a ring to jump */
  b.at-=dt;
  if(b.at<=0&&!e.stun&&!(e.frozen>0)){const dm=e.dmg*(.7+.1*b.ph);b.pat=(b.pat+1+(Math.random()<.4?1:0))%(3+Math.min(2,b.ph));
    if(b.pat===0){const n=1+b.ph*2;for(let i=0;i<n;i++){const an=Math.random()*6.283,rr=i?rnd(2,4.5):0;tgMark(P.x+Math.cos(an)*rr+P.vx*.4,P.z+Math.sin(an)*rr+P.vz*.4,2+b.ph*.3,1.15-b.ph*.1,dm,e.name);}sfx('zap');}
    else if(b.pat===1){const ux=(P.x-e.x)/(d||1),uz=(P.z-e.z)/(d||1),n=Math.min(9,Math.ceil(d/1.8)+2);for(let i=1;i<=n;i++){const q=i*1.8;after(i*.09,()=>{if(!e.dead)tgMark(e.x+ux*q,e.z+uz*q,1.3,.75,dm*.8,e.name,0xff8a20);});}sfx('fire');}
    else if(b.pat===3){bossMeteors(e,4+b.ph*2,dm*.9,b.col);bossOrbs(e,3+b.ph*2,dm*.5);}
    else if(b.pat===4){bossBeams(e,b.ph>=2?4:2,4.2,dm*.6,b.col);}
    else{tgNova(e.x,e.z,8+b.ph*2,18,dm*.75,e.name);if(b.ph>=2)after(.6,()=>{if(!e.dead)tgNova(e.x,e.z,10,18,dm*.75,e.name);});}
    b.at=[6,4.4,3.1][b.ph]+rnd(-.5,.5);}
}

/* ---------- wave trials and rune plates (from the dungeon clips), all first person ---------- */
let TR=null,PL=null;
function dun2Pick(f,R){
  B2=null;TR=null;PL=null;PZ=[];tgClear();$('b2bar').hidden=true;$('d2hud').hidden=true;
  if(PVP.on||MP.on||!L||!L.rooms||f<2)return;
  const req=new Set(L.doors.map(d=>d.req).filter(q=>q>=0));
  const ok=R.filter(r=>r.idx!==L.start&&r.idx!==L.exit&&r.idx!==L.special&&!L.keyRooms.includes(r.idx)&&!req.has(r.idx)&&(r.x1-r.x0)>=6&&(r.y1-r.y0)>=6);
  if(!ok.length)return;
  const ctr=r=>{const cx=(r.x0+r.x1)>>1,cy=(r.y0+r.y1)>>1;for(let rad=0;rad<4;rad++)for(let y=cy-rad;y<=cy+rad;y++)for(let x=cx-rad;x<=cx+rad;x++){const k=y*L.W+x;if(L.grid[k]===1&&!(L.cover&&L.cover[k]))return {x,y};}return {x:cx,y:cy};};
  if(!L.boss&&Math.random()<.75){const r=ok.splice(ri(0,ok.length-1),1)[0];r.trial=true;const c=ctr(r),x=wx(c.x),z=wx(c.y);
    const g=new T.Group();g.position.set(x,.06,z);const m=FXA(0x58c8ff,.7),m2=FXA(0x58c8ff,.25);
    for(const [s0,mm] of[[1.6,m],[1.15,m2],[.7,m]]){const q=new T.Mesh(RINGG,mm);q.rotation.x=-Math.PI/2;q.scale.setScalar(s0);g.add(q);}
    const pil=new T.Mesh(PILG,m2);pil.scale.set(1.3,3,1.3);pil.position.y=1.5;g.add(pil);lvl.add(g);
    TR={r,x,z,g,m,m2,st:'idle',wave:0,waves:Math.min(5,3+((f-2)/5|0)),t:0,list:[],gap:0};}
  if(ok.length&&Math.random()<.6){const r=pick(ok),used=new Set(),pl=[];
    for(let i=0;i<3;i++){const c=roomCell(r,used),x=wx(c.x),z=wx(c.y);if(pl.some(q=>Math.hypot(q.x-x,q.z-z)<3))continue;const mt=FXA(0xffb040,.55);
      const M=prop(x,z,0,MM=>{MM.b(1.5,.08,1.5,0x2a2622,0,.04,0);MM.b(1.3,.03,1.3,0x5a4a32,0,.09,0);});const gl=new T.Mesh(SQG,mt);gl.rotation.x=-Math.PI/2;gl.position.set(x,.12,z);gl.scale.setScalar(.85);lvl.add(gl);pl.push({x,z,on:false,mt,gl});}
    if(pl.length>=2)PL={r,pl,t:0,done:false,shown:false};}
  try{pzPick(ok.filter(r=>!PL||r!==PL.r));}catch(e){}
}
function trSpawnWave(){
  const f=P.floor,pool=Object.keys(ET).filter(k=>ET[k].minF<=f&&ET[k].w>0),n=Math.min(9,2+TR.wave+((f/3)|0));TR.list=[];
  for(let i=0;i<n;i++){let x=TR.x,z=TR.z;for(let t=0;t<16;t++){const c=roomCell(TR.r);x=wx(c.x)+rnd(-.6,.6);z=wx(c.y)+rnd(-.6,.6);if(Math.hypot(x-P.x,z-P.z)>5.5)break;}
    const el=TR.wave===TR.waves&&i===0;
    after(i*.18,()=>{if(!TR||TR.st!=='run')return;const e=spawnEnemy(pick(pool),x,z,TR.r.idx,{sid:SIDN++,elite:el});if(!e)return;e.awake=true;e.see=true;TR.list.push(e);pillarFx(x,z,.8,0x58c8ff,.55,.6);ringFx(x,z,.2,1.6,0x58c8ff,.4);});}
  TR.pending=n;TR.gap=n*.18+.3;
}
function dun2Tick(dt){
  tgTick(dt);boss2Tick(dt);
  const H=$('d2hud');let txt='',bad=false;
  if(TR){const T0=TR;T0.g.rotation.y+=dt*(T0.st==='run'?2:.6);
    if(T0.st==='idle'){T0.m.opacity=.45+.3*Math.sin(time*3);
      if(Math.hypot(P.x-T0.x,P.z-T0.z)<1.7&&PY()<.5){T0.st='run';T0.wave=1;T0.t=30+T0.waves*12;sfx('bell');banner('TRIAL OF WAVES','Survive '+T0.waves+' waves before the sand runs out',2200);trSpawnWave();}
      else if(Math.hypot(P.x-T0.x,P.z-T0.z)<9)txt='Step into the <em>blue circle</em> to start a wave trial';}
    else if(T0.st==='run'){T0.t-=dt;T0.gap-=dt;const alive=T0.list.filter(e=>!e.dead).length;
      txt='WAVE <em>'+T0.wave+'/'+T0.waves+'</em> · '+Math.max(0,Math.ceil(T0.t))+'s · '+alive+' left';bad=T0.t<10;
      if(T0.gap<=0&&alive===0&&T0.list.length>=T0.pending){if(T0.wave>=T0.waves){T0.st='done';sfx('level');banner('TRIAL CLEARED','The circle gives up its hoard',2000);
          const nC=1+(T0.t>15?1:0);for(let i=0;i<nC;i++)addItem('chest',T0.x+(i?1.6:0),T0.z+(i?.8:0));const g=Math.round(40+P.floor*12);P.gold+=g;floatText(T0.x,2,T0.z,'+'+g+'g','coin');gainXp(Math.round(30+P.floor*8));
          pillarFx(T0.x,T0.z,1.8,0x58c8ff,1.2,.7);ringFx(T0.x,T0.z,.4,6,0x58c8ff,.8);}
        else{T0.wave++;T0.t+=8;sfx('roar');banner('WAVE '+T0.wave,'',900);trSpawnWave();}}
      if(T0.t<=0&&T0.st==='run'){T0.st='fail';sfx('locked');banner('TRIAL FAILED','The sand ran out',1800);}}
    else if(T0.st==='done'||T0.st==='fail'){T0.m.opacity=Math.max(0,T0.m.opacity-dt*.4);T0.m2.opacity=Math.max(0,T0.m2.opacity-dt*.2);}}
  if(PL&&!PL.done){const lit=PL.pl.filter(q=>q.on).length;
    for(const q of PL.pl){q.gl.rotation.z+=dt*(q.on?3:.6);if(!q.on){q.mt.opacity=.35+.25*Math.sin(time*4+q.x);
        if(Math.hypot(P.x-q.x,P.z-q.z)<.95&&PY()<.4){q.on=true;q.mt.color.setHex(0x7aff9a);q.mt.opacity=.9;tone(500+lit*180,800+lit*180,.18,'triangle',.08);ringFx(q.x,q.z,.3,1.4,0x7aff9a,.4);if(lit===0)PL.t=16;}}}
    const n=PL.pl.filter(q=>q.on).length;
    if(n>0){PL.t-=dt;txt=txt||'RUNE PLATES <em>'+n+'/'+PL.pl.length+'</em> · '+Math.max(0,Math.ceil(PL.t))+'s';bad=bad||PL.t<5;
      if(n===PL.pl.length){PL.done=true;sfx('level');const r=PL.r,c=roomCell(r);addItem('chest',wx(c.x),wx(c.y));items[items.length-1].bonus=true;banner('THE VAULT OPENS','A chest rises from the stone',1800);pillarFx(wx(c.x),wx(c.y),1.2,0x7aff9a,1,.7);}
      else if(PL.t<=0){for(const q of PL.pl){q.on=false;q.mt.color.setHex(0xffb040);}sfx('locked');msg('The plates sink back. Step on all of them before the light dies.','bad','plates');}}
    else if(!PL.shown&&PL.pl.some(q=>Math.hypot(P.x-q.x,P.z-q.z)<7)){PL.shown=true;msg('Rune plates glow on the floor. Light them all, quickly.','lore','plates');}}
  {let t2='';try{t2=pzTick(dt);}catch(e){}if(!txt&&t2)txt=t2;}
  H.hidden=!txt||state!=='play';if(txt){H.innerHTML=txt;H.classList.toggle('bad',bad);}
}

/* ---------- weapon summons (gacha) ---------- */
const SUM={c1:250,c10:2250,rates:[[4,.008],[3,.042],[2,.13],[1,.28],[0,.54]]};
function sumRoll(force3){
  meta.pity=(meta.pity||0)+1;let r=0;
  if(meta.pity>=50){r=Math.random()<.2?4:3;}
  else{let x=Math.random(),acc=0;for(const [q,p] of SUM.rates){acc+=p;if(x<acc){r=q;break;}}}
  if(force3&&r<2)r=2;if(r>=3)meta.pity=0;
  const c=Math.random()<.3?'sword':pick(Object.keys(CLS).filter(k=>k!=='sword'));
  return {c,v:ri(0,CLS[c].vars.length-1),b:[ri(0,BEAST.length-1)],r,lv:Math.max(1,P.floor),plus:0};
}
function openSummon(){
  if(state!=='inv'&&state!=='play')return;const from=state;
  let S=$('summon');
  if(!S){S=document.createElement('section');S.id='summon';S.className='screen';S.hidden=true;
    S.innerHTML='<h2>✦ SUMMON ✦</h2><div id="sban"><p><b style="color:#fff;font-size:13px">THE ARMORY OF ASHMERE</b></p><p>Spend gold to call a weapon out of the tower. Higher stars hit harder.</p><p class="rates">5★ 0.8% · 4★ 4.2% · 3★ 13% · 2★ 28% · 1★ 54% · a 4★ or better is guaranteed within 50 summons · a 10-summon always has a 3★ or better</p><p>Your gold: <b id="sgold"></b> · pity <b id="spity"></b>/50</p></div>'+
      '<div id="sbtns"><button id="s1" class="go" type="button"></button><button id="s10" class="go" type="button"></button><button id="sx" type="button">Back</button></div><div id="snote"></div><div id="scards"></div>';
    gameEl.appendChild(S);
    $('s1').addEventListener('click',()=>doSummon(1));$('s10').addEventListener('click',()=>doSummon(10));$('sx').addEventListener('click',closeSummon);}
  S.dataset.from=from;if(from==='play'){state='inv';firing=false;try{resetTouch();unlock();}catch(e){}}
  $('inv').hidden=true;S.hidden=false;sumUi();$('scards').textContent='';$('snote').textContent='Tap a card to equip it. Weapons you leave behind are melted down for a little gold.';
}
function sumUi(){$('sgold').textContent=P.gold+'g';$('spity').textContent=meta.pity||0;$('s1').textContent='Summon x1 · '+SUM.c1+'g';$('s10').textContent='Summon x10 · '+SUM.c10+'g';$('s1').disabled=P.gold<SUM.c1;$('s10').disabled=P.gold<SUM.c10;}
let SUMR=[];
function sumMelt(){let g=0;for(const q of SUMR)if(!q.taken)g+=[15,30,60,120,240,400][q.w.r]||15;SUMR=[];if(g){P.gold+=g;msg('Melted the rest down for '+g+' gold.','good','melt');}return g;}
function doSummon(n){
  const cost=n===10?SUM.c10:SUM.c1;if(P.gold<cost){$('snote').textContent='Not enough gold.';return;}
  sumMelt();P.gold-=cost;const box=$('scards');box.textContent='';SUMR=[];
  const ws=[];for(let i=0;i<n;i++)ws.push(sumRoll(false));if(n===10&&!ws.some(w=>w.r>=2))ws[ri(0,9)]=sumRoll(true);
  ws.forEach((w,i)=>{const R=RAR[w.r],el=document.createElement('div'),stars='★'.repeat(w.r+1),slot=CLS[w.c].slot==='sword'?'SWORD':'GUN';
    el.className='scard'+(w.r>=3?' hi':'');el.style.setProperty('--rc',R.col);
    let img='';try{img=weaponImage(w)||'';}catch(e){}
    el.innerHTML='<div class="in"><div class="bk">✦</div><div class="fr"><div class="st">'+stars+'</div>'+(img?'<img alt="" src="'+img+'">':'')+'<div class="nm">'+wName(w)+'</div><div class="sl">'+slot+' · '+R.n+'</div><button class="eq" type="button">Equip</button></div></div>';
    const q={w,el,taken:false};SUMR.push(q);
    el.querySelector('.eq').addEventListener('click',ev=>{ev.stopPropagation();if(q.taken)return;const sl=CLS[w.c].slot==='sword'?'sword':'gun';P[sl]=mkW(w);q.taken=true;el.classList.add('taken');el.querySelector('.eq').textContent='Equipped';equip(sl,true);msg(wName(w)+' equipped.','good','eq',R);});
    box.appendChild(el);
    setTimeout(()=>{el.classList.add('open');try{tone(400+w.r*160,700+w.r*220,.12+w.r*.05,w.r>=3?'triangle':'square',.05+w.r*.015);}catch(e){}if(w.r>=3)try{sfx('level');}catch(e){}},300+i*(n>1?170:0));});
  save();sumUi();
}
function closeSummon(){const S=$('summon');if(!S||S.hidden)return;sumMelt();S.hidden=true;try{hudUpdate();}catch(e){}
  if(S.dataset.from==='inv'){$('inv').hidden=false;try{renderInv();}catch(e){}}else{state='play';try{lock();}catch(e){}}}
{/* a SUMMON button in the Book */const row=$('invclose')&&$('invclose').parentNode;if(row){const b=document.createElement('button');b.type='button';b.id='invsum';b.textContent='✦ Summon weapons';b.style.cssText='border-color:#5a8aff;color:#cfe0ff';b.addEventListener('click',openSummon);row.insertBefore(b,$('invclose'));}
 addEventListener('keydown',e=>{const S=$('summon');if(S&&!S.hidden){e.stopPropagation();if(e.code==='Escape'||e.code==='Tab'||e.code==='KeyI'){e.preventDefault();closeSummon();}}},true);}
