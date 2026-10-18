/* ===== BUILD 2.2: gate model, King fusions, Haste ultimates stop time, phone fixes ===== */

/* ---------- the Last Gate: a stone arch with a raised portcullis, braziers and a living portal ---------- */
function openGate(x,z,yaw,mine,owner,dest){
  const own=owner||'me';for(const g of gates.slice())if(g.own===own){lvl.remove(g.g);gates.splice(gates.indexOf(g),1);}
  const destination=Number.isFinite(+dest)&&+dest>0?Math.floor(+dest):null,king=own==='king';
  const pc=king?0xffc040:destination?0xb07aff:0xffd24a,pc2=king?0xff8a20:destination?0xe0c8ff:0xfff0b0;
  const add=(c,o)=>new T.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  const M=new Model(),g=M.g,ST=0x55505a,ST2=0x47424c,ST3=0x3a3640,IRON=0x2a2a30,GOLD=0xc89a3a;
  /* floor: two worn steps and a flat threshold */
  M.b(3.6,.1,1.5,ST3,0,.05,0);M.b(3.1,.1,1.15,ST2,0,.15,0);
  /* pillars: stacked blocks, each a little different, a base and a capital */
  for(const sx of[-1,1]){const px=sx*1.32;M.b(.62,.22,.62,ST3,px,.31,0);
    for(let k=0;k<5;k++){const w=k%2?.5:.46;M.b(w,.42,w,k%2?ST:ST2,px,.62+k*.43,0);}
    M.b(.64,.2,.64,ST3,px,2.66,0);M.b(.1,.1,.04,GOLD,px,2.66,.33);}
  /* the arch: wedge blocks around a half circle, with a keystone */
  const R=1.32,RV=.72,cy=2.98;for(let k=0;k<=8;k++){if(k===4)continue;const a=Math.PI*k/8,b=M.b(.46,.34,.56,k%2?ST:ST2,Math.cos(a)*R,cy+Math.sin(a)*RV,0);b.rotation.z=Math.atan2(Math.sin(a)*R,Math.cos(a)*RV)-Math.PI/2;}
  M.b(.5,.5,.66,ST3,0,cy+RV+.04,0);M.b(.22,.22,.05,pc,0,cy+RV+.04,.34,null,GLOW);M.b(.22,.22,.05,pc,0,cy+RV+.04,-.34,null,GLOW);
  /* the portcullis, wound up into the arch */
  const port=new T.Group();g.add(port);for(let k=-3;k<=3;k++){M.b(.06,.9,.06,IRON,k*.3,0,0,port);M.b(.08,.12,.08,IRON,k*.3,-.5,0,port);}M.b(2.1,.07,.07,IRON,0,.3,0,port);M.b(2.1,.07,.07,IRON,0,-.2,0,port);port.position.set(0,3.2,-.12);
  /* chains to the portcullis */
  for(const sx of[-1,1])M.b(.04,.4,.04,0x5a5a62,sx*.95,3.72,-.12);
  /* runes cut into the pillars */
  const runes=[];for(const sx of[-1,1])for(let k=0;k<3;k++){const r=M.b(.12,.18,.03,pc,sx*1.32,.95+k*.62,.3,null,GLOW);runes.push(r);}
  /* braziers on each side */
  const flames=[];for(const sx of[-1,1]){const bx=sx*1.95;M.cy(.06,.06,.7,IRON,bx,.5,.35,null,null,6);M.cy(.24,.12,.18,IRON,bx,.92,.35,null,null,8);M.cy(.2,.2,.04,0x1a1410,bx,1.0,.35,null,null,8);
    const f1=new T.Mesh(new T.ConeGeometry(.17,.5,6),add(0xff9a2a,.85)),f2=new T.Mesh(new T.ConeGeometry(.09,.32,5),add(0xffe68a,.9));f1.position.set(bx,1.25,.35);f2.position.set(bx,1.18,.35);g.add(f1);g.add(f2);flames.push(f1,f2);}
  /* the portal: an arch-shaped sheet of light, a swirl and a bright core */
  const sh=new T.Shape();sh.moveTo(-1.08,.2);sh.lineTo(-1.08,2.5);sh.absellipse(0,2.5,1.08,.78,Math.PI,0,true,0);sh.lineTo(1.08,.2);sh.lineTo(-1.08,.2);
  const disc=new T.Mesh(new T.ShapeGeometry(sh,18),add(pc,.5));disc.position.z=.01;g.add(disc);
  const disc2=new T.Mesh(new T.ShapeGeometry(sh,18),add(pc2,.18));disc2.position.z=-.01;disc2.scale.set(.82,.9,1);disc2.position.y=.12;g.add(disc2);
  const ring=new T.Group();ring.position.set(0,1.75,.03);g.add(ring);
  for(let k=0;k<3;k++){const m=new T.Mesh(new T.TorusGeometry(.42+k*.24,.035,4,22,Math.PI*1.25),add(k%2?pc2:pc,.75-k*.15));m.rotation.z=k*2.1;ring.add(m);}
  const core=new T.Mesh(new T.CircleGeometry(.3,16),add(0xffffff,.55));core.position.set(0,1.75,.04);g.add(core);
  /* a ring of light on the floor in front */
  const fl=new T.Mesh(new T.RingGeometry(.9,1.15,28),add(pc,.5));fl.rotation.x=-Math.PI/2;fl.position.set(0,.22,.95);g.add(fl);
  if(destination){const n=new T.Mesh(new T.RingGeometry(1.25,1.33,32,1,0,Math.PI),add(pc2,.6));n.position.set(0,1.75,.05);g.add(n);}
  g.position.set(x,0,z);g.rotation.y=yaw;g.scale.set(1,.02,1);lvl.add(g);
  gates.push({g,ring,disc,disc2,core,flames,runes,port,fl,x,z,t:destination?60:45,age:0,own,dest:destination});
  pillarFx(x,z,.9,pc,.8);ringFx(x,z,.3,2.8,pc,.55);burst(x,1.2,z,40,[1,.82,.3],2.8,.7,0);sfx('bell');sfx('blink');shake=Math.max(shake,.2);
  if(mine&&MP.on&&!PVP.on)mpSend({t:'gate',f:P.floor,x:+x.toFixed(2),z:+z.toFixed(2),y:+yaw.toFixed(2),to:destination});
}
function gateAnim(g,dt){
  const a=g.age,rise=Math.min(1,a/.45),e=1-Math.pow(1-rise,3);g.g.scale.set(1,.02+.98*e,1);
  if(g.ring)g.ring.rotation.z-=dt*1.8;
  if(g.disc&&g.disc.material)g.disc.material.opacity=(.26+.08*Math.sin(a*4))*(a<.6?a/.6:1);
  if(g.disc2&&g.disc2.material)g.disc2.material.opacity=.12+.1*Math.sin(a*2.3+1);
  if(g.core){const s=.85+.2*Math.sin(a*6);g.core.scale.set(s,s,1);}
  if(g.flames)for(let i=0;i<g.flames.length;i++){const f=g.flames[i],s=.85+.25*Math.sin(a*13+i*1.7)+.1*Math.sin(a*29+i);f.scale.set(1,s,1);}
  if(g.runes)for(let i=0;i<g.runes.length;i++){const r=g.runes[i];r.visible=Math.sin(a*3-i*.9)>-.6;}
  if(g.port)g.port.position.y=3.2+.04*Math.sin(a*1.5);
  if(g.fl&&g.fl.material){g.fl.rotation.z+=dt*.8;g.fl.material.opacity=.35+.15*Math.sin(a*3);}
  if(g.t<1.2){const q=Math.max(.02,g.t/1.2);g.g.scale.y=q;}
}

/* ---------- Haste in any three-spell ultimate stops time: the answer to the King's Stopped World ---------- */
function castHasteStop(ids){
  if(!ULT.haste)return false;const F=ids.filter(i=>FU[i]).map(i=>FU[i]),hx=(FU.haste&&FU.haste[3])||0xffd24a;
  const D=F.reduce((q,f,i)=>q+f[4],0)*spellPow(),X={els:new Set(F.map(f=>f[2])),hex:hx,hex2:hx,hex3:hx,D:D||60,a:aimDir(),n:3,ids,name:'Stopped World'};FZX=X;
  castFx('haste');P.castT=1;P.recoil=Math.max(P.recoil,.8);chainHud('STOPPED WORLD!',true);P.chainShow=2.4;sfx('zap');sfx('roar');
  try{fzCutIn('Stopped World',hx);fzImpact(1);}catch(e){}P.tint=.55;
  msg('Ultimate: Stopped World. Any ultimate with Haste in it stops time'+(typeof KING_TS!=='undefined'&&KING_TS?', and breaks the King\'s hold.':'.'),'gold');
  try{ULT.haste[2](X);}catch(e){}try{ultOpen(X);}catch(e){}return true;}

/* ---------- the King walks every ultimate: two-spell fusions and three-spell ultimates, in turn, by name ---------- */
let KFZ=null;
function kingFuseList(){if(KFZ)return KFZ;const skip={haste:1,lastgate:1,raise:1},byEl={};
  for(const id in FU){if(skip[id]||!SK[id])continue;const el=FU[id][2];(byEl[el]=byEl[el]||[]).push(id);}
  const mk=Tb=>Object.keys(Tb).sort().map((k,n)=>{const ids=k.split('+').map((el,i)=>{const L0=byEl[el];return L0&&L0.length?L0[(n+i)%L0.length]:null;}).filter(Boolean);return {k,name:Tb[k][0],ids:[...new Set(ids)]};}).filter(q=>q.ids.length);
  KFZ={two:mk(FZ2),three:mk(ULT3)};return KFZ;}
function kingFusion(e,n){const all=kingFuseList(),L0=n===2?all.two:all.three;if(!L0.length){kingUltVolley(e,n);return;}
  const key=n===2?'kf2':'kf3',q=L0[(e[key]||0)%L0.length];e[key]=((e[key]||0)+1)%L0.length;
  floatText(e.x,e.y+e.h+1.25,e.z,q.name.toUpperCase()+(n===3?' · ULTIMATE':''),'crit');msg('The King casts '+q.name+'.','bad','kingfz');
  if(n===3){ringFx(e.x,e.z,.4,9,KING_GOLD,.8);pillarFx(e.x,e.z,1,KING_GOLD,.5,.8);shake=Math.max(shake,.25);}
  e.kingQuiet=true;try{for(const id of q.ids){kingSpellCast(e,id,true);if(e.dead)break;}}finally{e.kingQuiet=false;}kingGoldFx(e,KING_GOLD);}

/* ---------- phone fixes: the ending screens fit and scroll, the boss bar sits lower with its name under it ---------- */
{const st=document.createElement('style');st.textContent=
 '#finalCreditsOverlay,#endingOverlay{overflow-y:auto!important;align-items:flex-start!important;padding:max(10px,env(safe-area-inset-top,0px)) 12px 18px!important;box-sizing:border-box;-webkit-overflow-scrolling:touch;touch-action:pan-y}'+
 '.finalCreditsCard,.endingCard{margin:auto!important;max-width:min(640px,94vw)!important;box-sizing:border-box}'+
 '.finalCreditsCard button,.endingCard button{min-height:46px;padding:12px 24px!important;font-size:14px;touch-action:manipulation}'+
 '@media (max-height:600px){.finalCreditsCard,.endingCard{padding:12px 18px!important}.finalCreditsCard h1,.endingCard h1{font-size:clamp(20px,8vh,34px)!important;margin:4px 0!important}'+
 '.finalKicker,.endingKicker{font-size:10px!important}.finalRule,.endingLine{margin:6px auto 8px!important}.finalCreditsCard p{margin:0 0 8px!important;font-size:12px}'+
 '.finalNames,.endingCredits{gap:3px!important;font-size:11px!important}.finalNames b,.endingCredits b{font-size:14px!important}.finalPrompt{margin-top:8px!important;font-size:11px!important}.endingFinal{margin-top:8px!important;font-size:15px!important}'+
 '.finalCreditsCard button,.endingCard button{margin-top:8px!important}}'+
 '#b2bar{top:calc(env(safe-area-inset-top,0px) + 16px)!important;display:flex;flex-direction:column;align-items:stretch}#b2track{order:1}#b2bar b{order:2;margin:4px 0 0!important}#b2ph{order:3}'+
 'body.touchy #b2bar,#b2bar.tch{top:calc(env(safe-area-inset-top,0px) + 20px)!important;width:min(40vw,440px)}';
 document.head.appendChild(st);
 /* the ending buttons also answer a finger lift, in case a touch never becomes a click */
 const tapBtn=id=>{const b=document.getElementById(id);if(!b||b._tap)return;b._tap=1;b.addEventListener('touchend',ev=>{ev.preventDefault();ev.stopPropagation();try{b.onclick&&b.onclick(ev);}catch(_){}},{passive:false});b.addEventListener('touchstart',ev=>ev.stopPropagation(),{passive:true});};
 setInterval(()=>{tapBtn('finalCreditsContinue');tapBtn('endingBack');try{document.body.classList.toggle('touchy',!!isTouch);}catch(_){}},400);
 addEventListener('keydown',ev=>{const S=document.getElementById('gatepick');if(S&&!S.hidden&&(ev.code==='Escape'||ev.code==='Backspace')){ev.preventDefault();ev.stopImmediatePropagation();closeGatePick(true);}},true);}
