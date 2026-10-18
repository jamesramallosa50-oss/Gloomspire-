/* ===== POLISH PACK: dungeon props for cover, main menu, touch scope, controller binds ===== */

/* ---------- cover props: wooden crates, barrels and barricades, all merged into one mesh (one draw call per floor) ---------- */
const PROPMAT=new T.MeshPhongMaterial({color:0xffffff,vertexColors:true,map:NOISE,flatShading:true,shininess:0,specular:0x000000});
function buildCoverProps(){
  if(!L||!L.plats)return;const ps=L.plats.filter(p=>p.kind==='crate'||p.kind==='barrel'||p.kind==='fence');if(!ps.length)return;
  const pos=[],nor=[],col=[],uv=[],tint=(L.theme&&L.theme.tint)||0xffffff,tr=((tint>>16)&255)/255,tg=((tint>>8)&255)/255,tb=(tint&255)/255;
  const C=h=>[((h>>16)&255)/255*tr,((h>>8)&255)/255*tg,(h&255)/255*tb];
  const box=(cx,cy,cz,w,h,d,hex,ry)=>{const c=C(hex),cs=Math.cos(ry||0),sn=Math.sin(ry||0),hx=w/2,hy=h/2,hz=d/2;
    const F=[[[1,0,0],[[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz],[hx,-hy,hz]],d,h],[[-1,0,0],[[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz],[-hx,-hy,-hz]],d,h],
      [[0,1,0],[[-hx,hy,-hz],[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz]],w,d],[[0,-1,0],[[-hx,-hy,hz],[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz]],w,d],
      [[0,0,1],[[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz],[-hx,-hy,hz]],w,h],[[0,0,-1],[[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz],[hx,-hy,-hz]],w,h]];
    for(const [n,v,a,b] of F){const U=[[0,0],[0,b],[a,b],[a,0]];for(const i of[0,1,2,0,2,3]){const p=v[i];pos.push(cx+p[0]*cs+p[2]*sn,cy+p[1],cz-p[0]*sn+p[2]*cs);nor.push(n[0]*cs+n[2]*sn,n[1],-n[0]*sn+n[2]*cs);col.push(c[0],c[1],c[2]);uv.push(U[i][0]*.5,U[i][1]*.5);}}};
  const cyl=(cx,cy,cz,r,h,hex,seg)=>{const c=C(hex);seg=seg||8;for(let i=0;i<seg;i++){const a0=i/seg*6.283,a1=(i+1)/seg*6.283,x0=Math.cos(a0)*r,z0=Math.sin(a0)*r,x1=Math.cos(a1)*r,z1=Math.sin(a1)*r,am=(a0+a1)/2,nx=Math.cos(am),nz=Math.sin(am);
      const q=[[x0,-h/2,z0],[x0,h/2,z0],[x1,h/2,z1],[x1,-h/2,z1]];for(const k of[0,1,2,0,2,3]){pos.push(cx+q[k][0],cy+q[k][1],cz+q[k][2]);nor.push(nx,0,nz);col.push(c[0],c[1],c[2]);uv.push(i/seg*2,(q[k][1]>0?1:0)*.6);}
      for(const [yy,ny] of[[h/2,1],[-h/2,-1]])for(const p of ny>0?[[0,0],[x1,z1],[x0,z0]]:[[0,0],[x0,z0],[x1,z1]]){pos.push(cx+p[0],cy+yy,cz+p[1]);nor.push(0,ny,0);col.push(c[0]*.85,c[1]*.85,c[2]*.85);uv.push(p[0]+.5,p[1]+.5);}}};
  const WOOD=0x7a5230,WOOD2=0x5a3a20,DARK=0x3a2614,IRON=0x4a4a54,IRON2=0x2e2e36;
  for(const p of ps){const w=p.x1-p.x0,d=p.z1-p.z0,h=p.y1-p.y0,cx=(p.x0+p.x1)/2,cz=(p.z0+p.z1)/2,y0=p.y0;
    if(p.kind==='crate'){/* a plank crate: a body, dark edge frames, a cross brace on each side, iron corner caps */
      const t=Math.min(.12,Math.min(w,d,h)*.1);box(cx,y0+h/2,cz,w-.04,h-.04,d-.04,(Math.abs(cx*7+cz*3)|0)%2?WOOD:0x84603a);
      for(const sx of[-1,1])for(const sz of[-1,1])box(cx+sx*(w/2-t/2),y0+h/2,cz+sz*(d/2-t/2),t+.035,h+.03,t+.035,DARK);
      for(const sy of[0,1])for(const sz of[-1,1])box(cx,y0+(sy?h-t/2:t/2),cz+sz*(d/2-t/2),w-2*t,t+.01,t+.01,DARK);
      for(const sy of[0,1])for(const sx of[-1,1])box(cx+sx*(w/2-t/2),y0+(sy?h-t/2:t/2),cz,t+.01,t+.01,d-2*t,DARK);
      for(const sz of[-1,1])box(cx,y0+h/2,cz+sz*(d/2+.005),w-2*t-.06,t*.8,.02,WOOD2,0);
      for(const sx of[-1,1])box(cx+sx*(w/2+.005),y0+h/2,cz,.02,t*.8,d-2*t-.06,WOOD2,0);
      for(const sx of[-1,1])for(const sz of[-1,1])box(cx+sx*(w/2-.06),y0+h-.06,cz+sz*(d/2-.06),.15,.13,.15,IRON);}
    else if(p.kind==='barrel'){/* a cluster of banded barrels filling the block */
      const n=w>1.6&&d>1.6?3:w>1.2?2:1,r=Math.min(w,d)/(n>1?3.6:2.2);const spots=n===1?[[0,0]]:n===2?[[-w*.22,0],[w*.22,0]]:[[-w*.22,-d*.18],[w*.22,-d*.18],[0,d*.22]];
      for(const [ox,oz] of spots){const bh=h-.02;cyl(cx+ox,y0+bh/2,cz+oz,r,bh,(Math.abs(ox*9+oz*5+cx)|0)%2?0x6a4526:0x7a5230,10);
        for(const yy of[.18,.5,.82])cyl(cx+ox,y0+bh*yy,cz+oz,r+.025,.07,IRON2,10);cyl(cx+ox,y0+bh+.005,cz+oz,r*.82,.02,DARK,10);}
      if(n===1)box(cx,y0+.03,cz,w*.95,.06,d*.95,DARK);}
    else if(p.kind==='fence'){/* a wooden barricade: posts, thick planks, an iron rail and spikes on top */
      const along=p.ori==='z',L0=along?d:w,th=along?w:d,rot=along?Math.PI/2:0,ax=along?0:1,az=along?1:0;
      for(const s of[-.5,.5]){const px=cx+ax*s*(L0-.14),pz=cz+az*s*(L0-.14);box(px,y0+h/2+.06,pz,.16,h+.12,th+.06,DARK);}
      for(let k=0;k<4;k++){const yy=y0+.14+k*((h-.2)/4)+.1;box(cx,yy,cz,L0-.08,(h-.2)/4-.04,th*.7,k%2?WOOD:WOOD2,rot);}
      box(cx,y0+h-.04,cz,L0,.07,th*.85,IRON,rot);
      for(let k=0;k<5;k++){const t=(k+.5)/5-.5;box(cx+ax*t*L0,y0+h+.12,cz+az*t*L0,.05,.24,.05,IRON2);}}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  try{splitGeomChunks(g,PROPMAT);}catch(e){const m=new T.Mesh(g,PROPMAT);m.userData.own=1;lvl.add(m);}
}

/* ---------- main menu: a column of words over the tower, like a proper game menu ---------- */
{const TI=$('title');
 const st=document.createElement('style');st.textContent=
 '#title.mm:not([hidden]){background:linear-gradient(90deg,rgba(3,4,6,.94) 0%,rgba(3,4,6,.62) 34%,rgba(3,4,6,.08) 68%),linear-gradient(0deg,rgba(3,4,6,.85) 0%,transparent 28%),radial-gradient(ellipse at 72% 42%,transparent 25%,rgba(0,0,0,.6) 100%)!important;backdrop-filter:none!important;display:block!important;padding:0!important;overflow:hidden}'+
 '#title.mm>*:not(#mm):not(.mmpage){display:none!important}#title.mm .mmpage{display:none}#title.mm .mmpage.on{display:flex;animation:mmpg .28s ease-out}#title.mm:not([data-pg="main"]) #mm{display:none}'+
 '@keyframes mmpg{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}@keyframes mmin{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:none}}'+
 '@keyframes mmglow{0%,100%{text-shadow:0 4px 0 #000,0 0 26px rgba(255,120,30,.32)}50%{text-shadow:0 4px 0 #000,0 0 40px rgba(255,140,40,.55)}}@keyframes mmfl{0%,100%{opacity:.85}47%{opacity:.85}50%{opacity:.55}53%{opacity:.9}}'+
 '@keyframes mmfog{from{transform:translateX(-6%)}to{transform:translateX(6%)}}'+
 '#mm{position:absolute;inset:0;pointer-events:none}'+
 '#mmfog{position:absolute;left:-10%;right:-10%;bottom:0;height:34%;background:radial-gradient(ellipse at 30% 100%,rgba(120,130,140,.16),transparent 60%),radial-gradient(ellipse at 75% 100%,rgba(90,100,110,.12),transparent 55%);animation:mmfog 14s ease-in-out infinite alternate}'+
 '#mmside{position:absolute;left:max(28px,env(safe-area-inset-left,0px) + 20px);top:50%;transform:translateY(-52%);pointer-events:auto}'+
 '#mmside:before,#mmside:after{content:"";display:block;width:220px;height:1px;background:linear-gradient(90deg,rgba(255,180,90,.55),transparent);margin:6px 0 10px}#mmside:after{margin:10px 0 0}'+
 '#mmnav{display:flex;flex-direction:column;align-items:flex-start;gap:1px}'+
 '#mmnav button{all:unset;cursor:pointer;position:relative;text-align:left;align-self:flex-start;font-family:inherit;font-size:clamp(15px,3.1vh,26px);letter-spacing:3px;color:#b9c6c9;padding:4px 2px 4px 22px;text-shadow:0 2px 0 #000,0 0 12px rgba(0,0,0,.8);transition:color .14s,transform .14s,letter-spacing .14s;opacity:0;animation:mmin .4s ease-out forwards}'+
 '#mmnav button:before{content:"▸";position:absolute;left:2px;top:50%;transform:translate(-6px,-52%);opacity:0;color:#ff9426;transition:opacity .14s,transform .14s}'+
 '#mmnav button small{display:block;text-align:left;font-size:clamp(8px,1.4vh,11px);letter-spacing:1px;color:#9a8f7a;max-height:0;overflow:hidden;opacity:0;transition:max-height .18s,opacity .18s,margin .18s}'+
 '#mmnav button.sel,#mmnav button:focus-visible,#mmnav button.gpf{color:#ffd890;transform:translateX(8px);letter-spacing:4px;text-shadow:0 2px 0 #000,0 0 14px rgba(255,150,40,.55)}'+
 '#mmnav button.sel:before,#mmnav button.gpf:before{opacity:1;transform:translate(0,-52%)}#mmnav button.sel small,#mmnav button.gpf small{max-height:2.4em;opacity:1;margin-top:2px}#mmnav button[hidden]{display:none}'+
 '#mmlogo{position:absolute;right:max(26px,env(safe-area-inset-right,0px) + 18px);bottom:26px;text-align:right;pointer-events:auto;cursor:pointer;display:flex;align-items:flex-end;gap:12px}'+
 '#mmlogo svg{width:clamp(30px,8vh,64px);height:auto;filter:drop-shadow(0 3px 0 #000);animation:mmfl 6s infinite}'+
 '#mmlogo b{display:block;font-size:clamp(34px,10vh,92px);line-height:.9;color:#f2ead8;letter-spacing:2px;animation:mmglow 4s ease-in-out infinite}'+
 '#mmlogo i{display:block;font-style:normal;font-size:clamp(8px,1.5vh,12px);color:#ff9426;letter-spacing:5px;margin-top:6px}'+
 '#mmfoot{position:absolute;left:max(28px,env(safe-area-inset-left,0px) + 20px);bottom:12px;display:flex;flex-direction:column;gap:5px;pointer-events:none}'+
 '#mmstats{display:flex;gap:6px;flex-wrap:wrap}#mmstats span{font-size:9px;color:#d8c8a0;background:rgba(20,16,10,.6);border:1px solid #4a3a22;padding:3px 6px;text-shadow:0 1px 0 #000}'+
 '#mmhint{font-size:9px;color:#7a8486}#mmbuild{font-size:9px;color:#6a7476}#mmrec{font-size:9px;color:#ff8a7a;max-width:46vw}'+
 '.mmpage{position:absolute;inset:0;overflow:auto;padding:16px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;align-items:center;gap:10px;background:linear-gradient(180deg,rgba(6,7,9,.93),rgba(4,5,7,.88))}'+
 '.mmpage .mmhead{align-self:stretch;display:flex;align-items:center;gap:14px;padding-bottom:10px;position:relative}.mmpage .mmhead:after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,170,80,.6),transparent)}'+
 '.mmpage .mmhead h2{margin:0;letter-spacing:4px;color:#ffd890;font-size:18px;text-shadow:0 2px 0 #000}.mmpage .mmhead h2:before{content:"◆ ";color:#ff9426;font-size:12px}'+
 '#mmp-climb #cont{display:none!important}.mmback{min-width:auto!important}.mmpage p{max-width:44em;text-align:center}#mmcred p{color:#c9c2b0}'+
 'body.touchy #mmhint{display:none}';
 document.head.appendChild(st);
 const mm=document.createElement('div');mm.id='mm';
 const it=(id,p,label,sub)=>'<button type="button"'+(id?' id="'+id+'"':'')+(p?' data-p="'+p+'"':'')+(id==='mmcont'?' hidden':'')+'>'+label+'<small>'+sub+'</small></button>';
 mm.innerHTML='<div id="mmfog"></div><div id="mmside"><nav id="mmnav">'+it('mmcont','','CONTINUE','')+it('','climb','NEW CLIMB','Choose who climbs and how hard')+it('','mp','MULTIPLAYER','Climb together or fight in the arena')+it('','opt','OPTIONS','Graphics, full screen, controller buttons')+it('','how','HOW TO PLAY','Controls, fusions and ultimates')+it('','cred','CREDITS','Who built the tower')+'</nav></div>'+
   '<div id="mmlogo"><svg viewBox="0 0 16 24" shape-rendering="crispEdges" aria-hidden="true"><rect x="6" y="0" width="4" height="2" fill="#ff9426"/><rect x="5" y="2" width="6" height="4" fill="#3a3630"/><rect x="7" y="3" width="2" height="2" fill="#ffd24a"/><rect x="4" y="6" width="8" height="6" fill="#4a463e"/><rect x="7" y="8" width="2" height="2" fill="#ffb040"/><rect x="3" y="12" width="10" height="6" fill="#3e3a34"/><rect x="5" y="14" width="2" height="2" fill="#ff8a2a"/><rect x="9" y="14" width="2" height="2" fill="#ff8a2a"/><rect x="2" y="18" width="12" height="6" fill="#2e2a26"/><rect x="7" y="20" width="2" height="4" fill="#0a0806"/></svg><div><b>GLOOMSPIRE</b><i>EVERY FLOOR IS LOCKED</i></div></div>'+
   '<div id="mmfoot"><div id="mmrec"></div><div id="mmstats"></div><div id="mmhint">↑ ↓ choose · Enter open · Esc back</div><div id="mmbuild">Gloomspire · Build 2.9</div></div>';
 TI.appendChild(mm);
 const page=(id,title)=>{const d=document.createElement('div');d.className='mmpage';d.id='mmp-'+id;d.innerHTML='<div class="mmhead"><button type="button" class="mmback">◀ BACK</button><h2>'+title+'</h2></div>';TI.appendChild(d);return d;};
 const mv=(d,ids)=>{for(const id of ids){const e=typeof id==='string'?$(id):id;if(e)d.appendChild(e);}};
 const kids=[...TI.children];
 const pC=page('climb','NEW CLIMB'),pM=page('mp','MULTIPLAYER'),pO=page('opt','OPTIONS'),pH=page('how','HOW TO PLAY'),pK=page('cred','CREDITS');
 const intro=kids.find(e=>e.tagName==='P'&&!e.id&&!e.className),who=kids.find(e=>e.tagName==='P'&&e.className==='dim'&&!e.id),row=$('start').parentNode;
 mv(pC,[intro,who,'chrow','chpage','chinfo','diffrow','diffd']);const r2=document.createElement('div');r2.className='row';mv(r2,['cont','start']);pC.appendChild(r2);
 mv(pO,['fs','qualb2','inst','instHelp']);{const b=document.createElement('button');b.type='button';b.id='mmpad';b.textContent='Controller buttons';b.addEventListener('click',()=>openPadBind());pO.insertBefore(b,$('fs'));const o=document.createElement('div');o.className='row';o.style.flexWrap='wrap';o.style.justifyContent='center';o.style.gap='8px';mv(o,['mmpad','fs','qualb2','inst']);pO.insertBefore(o,$('instHelp'));}
 mv(pH,['howto']);mv(pM,['mpbox','mpstat']);
 pK.insertAdjacentHTML('beforeend','<div id="mmcred"><p><b style="color:#ffd890">GLOOMSPIRE</b></p><p>A tower of stacked stone. Every floor is locked, every lift goes up, and every death drops you down the shaft.</p><p>Built in the browser with three.js. Music and sound are made live in Web Audio.</p><p>Thank you for climbing.</p></div>');
 if(row&&!row.children.length)row.remove();
 const nav=$('mmnav'),items=()=>[...nav.querySelectorAll('button')].filter(b=>!b.hidden);
 let selI=0;const tick=()=>{try{tone(660,720,.03,'square',.02);}catch(e){}};
 const sel=(i,sound)=>{const L0=items();if(!L0.length)return;selI=(i+L0.length)%L0.length;L0.forEach((b,k)=>b.classList.toggle('sel',k===selI));if(sound)tick();};
 const replay=()=>{items().forEach((b,k)=>{b.style.animation='none';void b.offsetWidth;b.style.animation='';b.style.animationDelay=(k*.06)+'s';});};
 const go=p=>{TI.dataset.pg=p;TI.querySelectorAll('.mmpage').forEach(e=>e.classList.toggle('on',e.id==='mmp-'+p));TI.scrollTop=0;const pg=$('mmp-'+p);if(pg)pg.scrollTop=0;try{document.querySelectorAll('.gpf').forEach(e=>e.classList.remove('gpf'));}catch(e){}if(p==='main'){replay();sel(selI);}};
 TI.classList.add('mm');
 nav.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{go(b.dataset.p);try{sfx('key');}catch(e){}}));
 nav.querySelectorAll('button').forEach(b=>b.addEventListener('pointerenter',()=>{const k=items().indexOf(b);if(k>=0&&k!==selI)sel(k,true);}));
 TI.querySelectorAll('.mmback').forEach(b=>b.addEventListener('click',()=>{go('main');try{sfx('key');}catch(e){}}));
 $('mmcont').addEventListener('click',()=>{const c=$('cont');if(c&&!c.hidden)c.click();});
 $('mmlogo').addEventListener('click',()=>{try{$('gtitle').click();}catch(e){}});
 addEventListener('keydown',e=>{if(state!=='title'||TI.hidden)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
   if(TI.dataset.pg!=='main'){if(e.code==='Escape'||e.code==='Backspace'){e.preventDefault();go('main');}return;}
   if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();sel(selI+1,true);}else if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();sel(selI-1,true);}
   else if(e.code==='Enter'||e.code==='Space'){e.preventDefault();const b=items()[selI];if(b)b.click();}});
 /* keep the menu in step: Continue appears when a climb is saved and says where you left off; the stats and record follow the save */
 const sync=()=>{if(state!=='title'){if(TI.dataset.pg!=='main')go('main');return;}if(TI.hidden)return;const c=$('cont'),mc=$('mmcont'),was=mc.hidden;mc.hidden=!c||c.hidden;
   if(!mc.hidden){const R=meta.run||{},ch=(CHARS.find(q=>q.id===R.char)||{}).n||'';mc.querySelector('small').textContent=(ch?ch+' · ':'')+'floor '+(R.floor||1)+' · level '+(R.lvl||1);}if(was!==mc.hidden)sel(mc.hidden?0:0);
   const ng=$('nogl');$('mmrec').textContent=ng&&!ng.hidden?ng.textContent:'';
   const chn=(CHARS.find(q=>q.id===meta.char)||{}).n||'',dn=(DIFF[meta.diff==null?1:meta.diff]||{}).n||'';
   const sh=[chn&&('Climber · '+chn),dn&&('Difficulty · '+dn),'Best floor · '+(meta.best||0),'Falls · '+(meta.deaths||0)].filter(Boolean).map(t=>'<span>'+t+'</span>').join('');if($('mmstats').innerHTML!==sh)$('mmstats').innerHTML=sh;
   const mp=nav.querySelector('[data-p="climb"]');if(mp){const pv=typeof MP!=='undefined'&&MP.on&&MP.mode==='pvp';const lab=pv?'ENTER THE ARENA':'NEW CLIMB';if(mp.firstChild.nodeValue!==lab)mp.firstChild.nodeValue=lab;}
   document.body.classList.toggle('touchy',!!isTouch);};
 go('main');sel(0);setInterval(sync,400);sync();
 window.__mmGo=go;}

/* ---------- touch SCOPE button (not on by default: add it in Customize) ---------- */
const TSC={on:false};
{const t=$('touch');if(t&&!$('tscope')){const b=document.createElement('button');b.type='button';b.id='tscope';b.hidden=true;b.textContent='SCOPE';t.appendChild(b);
  const st=document.createElement('style');st.textContent='#tscope{position:absolute;width:62px;height:62px;border-radius:50%;font-size:10px;border-color:#7fd6ff;color:#bfe8ff}#tscope.on{background:rgba(80,160,255,.35)}';document.head.appendChild(st);
  const dn=e=>{if(gameEl.classList.contains('ctledit'))return;e.preventDefault();e.stopPropagation();TSC.on=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}};
  const up=e=>{TSC.on=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);}}

/* ---------- controller button binding ---------- */
const PBD={fire:7,scope:-1,cast:6,next:5,prev:4,swap:15,jump:2,slide:0,skill:1,loadout:3,talk:11,run:10,s1:12,s2:13,s3:14,book:8,pause:9};
const PBN={fire:'Fire',scope:'Scope (hold)',cast:'Cast spell',next:'Next spell',prev:'Previous spell',swap:'Swap weapon',jump:'Jump',slide:'Slide',skill:'Character skill',loadout:'Loadout / talk',talk:'Talk',run:'Sprint toggle',s1:'Spell slot 1',s2:'Spell slot 2',s3:'Spell slot 3',book:'Book',pause:'Pause'};
const PB=a=>{const v=meta.padBind&&meta.padBind[a];return v==null?PBD[a]:v;};
const PBb=(b,a)=>{const i=PB(a);return i>=0&&!!b(i);};
const PBh=(hit,a)=>{const i=PB(a);return i>=0&&!!hit(i);};
function padBtnName(i){if(i<0)return '—';const ps=typeof pad!=='undefined'&&pad.type==='playstation';
  const X=['A','B','X','Y','LB','RB','LT','RT','View','Menu','L3','R3','D-pad up','D-pad down','D-pad left','D-pad right'],S=['Cross','Circle','Square','Triangle','L1','R1','L2','R2','Share','Options','L3','R3','D-pad up','D-pad down','D-pad left','D-pad right'];return (ps?S:X)[i]||('Button '+i);}
let PBW=null;
function openPadBind(){
  let S=$('padbind');
  if(!S){S=document.createElement('section');S.id='padbind';S.className='screen';S.hidden=true;
    S.innerHTML='<h2>CONTROLLER BUTTONS</h2><p class="dim" id="pbnote">Pick an action, then press the button you want for it. Works for Xbox, PlayStation and other controllers.</p><div id="pblist"></div><div class="row" style="flex-wrap:wrap;justify-content:center;gap:8px"><button type="button" id="pbtype"></button><button type="button" id="pbreset">Reset to default</button><button type="button" id="pbdone" class="go">Done</button></div>';
    gameEl.appendChild(S);const st=document.createElement('style');st.textContent='#padbind{z-index:6;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px}#padbind[hidden]{display:none!important}#pblist{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px;width:min(94vw,760px)}#pblist button{display:flex;justify-content:space-between;gap:8px;text-align:left}#pblist button b{color:#ffd890}#pblist button.wait{border-color:#ffd24a;animation:pbw .6s infinite alternate}@keyframes pbw{to{box-shadow:0 0 12px #ffd24a}}';document.head.appendChild(st);
    $('pbdone').addEventListener('click',closePadBind);$('pbreset').addEventListener('click',()=>{meta.padBind={};save();PBW=null;pbRender();});
    $('pbtype').addEventListener('click',()=>{const o=['auto','ps','axtrig','gen','xbox'];meta.padmap=o[(o.indexOf(meta.padmap||'auto')+1)%o.length];try{pad.lay=null;pad.prev=[];}catch(e){}save();pbRender();});}
  S.dataset.prev=state;S.hidden=false;for(const id of['pause','title'])if($(id)&&!$(id).hidden){S.dataset.under=id;$(id).hidden=true;}pbRender();
}
function pbRender(){const box=$('pblist');if(!box)return;box.textContent='';
  for(const a in PBD){const b=document.createElement('button');b.type='button';b.innerHTML='<span>'+PBN[a]+'</span><b>'+(PBW&&PBW.a===a?'press a button…':padBtnName(PB(a)))+'</b>';if(PBW&&PBW.a===a)b.classList.add('wait');
    b.addEventListener('click',()=>{PBW={a,t:performance.now()};$('pbnote').textContent='Press a button on your controller for '+PBN[a]+'. Press the same action again to clear it.';pbRender();});box.appendChild(b);}
  const PML2={auto:'Auto',ps:'PlayStation raw',axtrig:'Axis triggers',gen:'Generic',xbox:'Xbox raw'};$('pbtype').textContent='Controller type: '+PML2[meta.padmap||'auto'];
  try{if(!(typeof pad!=='undefined'&&pad.on))$('pbnote').textContent='Connect a controller and press any button on it, then pick an action to change it.';}catch(e){}}
/* called from the controller loop with the first newly pressed button while an action is waiting */
function pbTake(i){if(!PBW)return false;if(performance.now()-PBW.t<180)return true;const a=PBW.a;meta.padBind=meta.padBind||{};
  for(const k in PBD)if(k!==a&&PB(k)===i)meta.padBind[k]=PB(a);/* swap with whatever had that button */
  meta.padBind[a]=PB(a)===i&&a==='scope'?-1:i;PBW=null;save();try{sfx('key');}catch(e){}$('pbnote').textContent=PBN[a]+' is now '+padBtnName(meta.padBind[a])+'.';pbRender();return true;}
function closePadBind(){const S=$('padbind');if(!S)return;PBW=null;S.hidden=true;const u=S.dataset.under;if(u&&$(u)){$(u).hidden=false;}S.dataset.under='';try{padMapUi();}catch(e){}}
if(!meta.tapMig){meta.tapLv=0;meta.tapMig=1;try{save();}catch(e){}}
