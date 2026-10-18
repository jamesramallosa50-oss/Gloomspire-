/* ===== ROOM PUZZLES, GATE PICKER, VERSION CHECK ===== */
const GSV='3.7';
/* ---------- Last Gate + Haste: pick any floor 1-51 from a scroll list, or jump to a teammate ---------- */
function openGatePick(){
  let S=$('gatepick');
  if(!S){S=document.createElement('section');S.id='gatepick';S.className='screen';S.hidden=true;
    S.innerHTML='<div id="gpcard"><div id="gphead"><h2>THE LAST GATE</h2><p class="dim" id="gpsub">The world holds still while you choose. Nothing is spent until you pick.</p></div><div id="gpallyw"><div class="gpcap">TELEPORT TO A TEAMMATE</div><div id="gpallies"></div></div><div class="gpcap">OPEN A GATE TO A FLOOR</div><div id="gplist"></div><div class="row"><button type="button" id="gpx">Close the gate</button></div></div>';
    gameEl.appendChild(S);const st=document.createElement('style');
    st.textContent='#gatepick{z-index:6;display:flex;align-items:center;justify-content:center;padding:max(8px,env(safe-area-inset-top,0px)) 10px 8px;overflow:hidden;background:rgba(4,4,8,.72)}#gatepick[hidden]{display:none!important}'+
      '#gpcard{width:min(94vw,540px);max-height:100%;display:flex;flex-direction:column;gap:6px;padding:10px 12px;background:linear-gradient(#17120c,#0d0b09);border:2px solid #6a5226;box-shadow:0 0 0 2px #000,0 0 30px rgba(255,190,70,.18)}'+
      '#gphead{text-align:center}#gphead h2{margin:0;color:#ffd890;letter-spacing:4px}#gphead p{margin:2px 0 0;font-size:10px}.gpcap{font-size:9px;letter-spacing:2px;color:#d8b060;margin-top:2px}'+
      '#gplist{flex:1;min-height:90px;overflow-y:auto;display:flex;flex-direction:column;gap:5px;padding:4px;border:2px solid #3a3226;background:rgba(0,0,0,.35);scroll-snap-type:y proximity;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}'+
      '#gplist button,#gpallies button{display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:left;scroll-snap-align:start;min-height:42px;width:100%;box-sizing:border-box}#gplist button i,#gpallies button i{font-style:normal;color:#9a8f7a;font-size:10px}#gplist button b{white-space:nowrap}#gplist button.cur{border-color:#ffd24a;color:#ffd890}#gplist button.boss b{color:#ff8a5a}'+
      '#gpallies{display:flex;flex-direction:column;gap:5px}#gpallies button{border-color:#6fd06a;color:#bff0b8}#gpallies .none{font-size:10px;color:#8a8f86;padding:6px 2px}#gpallyw[hidden]{display:none}'+
      '#gatepick.wait #gpcard{pointer-events:none}#gatepick #gpx{min-height:42px}';
    document.head.appendChild(st);$('gpx').addEventListener('click',()=>closeGatePick(true));}
  const go=fn=>ev=>{if(S.classList.contains('wait'))return;ev.preventDefault();closeGatePick(false);fn();};
  const box=$('gplist');box.textContent='';
  for(let f=1;f<=FINAL_FLOOR;f++){const b=document.createElement('button');b.type='button';const boss=f%5===0||f===FINAL_FLOOR;
    const th=boss?(f===FINAL_FLOOR?'The Throne':((ET[BOSSES[((f/5|0)-1)%BOSSES.length]]||{}).name||'Guardian')):THEMES[((f-1)/3|0)%THEMES.length].name;
    b.innerHTML='<b>FLOOR '+f+(boss?' · BOSS':'')+'</b><i>'+th+(f===P.floor?' · last room here':'')+'</i>';if(f===P.floor)b.classList.add('cur');if(boss)b.classList.add('boss');
    b.addEventListener('click',go(()=>gateTo(f)));box.appendChild(b);}
  const al=$('gpallies'),aw=$('gpallyw');al.textContent='';aw.hidden=!(MP.on&&!PVP.on);
  if(MP.on&&!PVP.on){let n=0;for(const id in MP.others){const g=MP.others[id];if(!g)continue;n++;const b=document.createElement('button');b.type='button';
      b.innerHTML='<b>GO TO '+String(g.n||'teammate').toUpperCase()+'</b><i>'+((g.f|0)===P.floor?'this floor':'floor '+(g.f||'?'))+'</i>';b.addEventListener('click',go(()=>gateToAlly(id)));al.appendChild(b);}
    if(!n)al.innerHTML='<div class="none">No teammates are connected right now.</div>';}
  S._paid=P.fzPaid?{cost:P.fzPaid.cost,ids:P.fzPaid.ids.slice(),cds:P.fzPaid.ids.map(k=>[k,P.cds[k]||0])}:null;P.fzPaid=null;
  /* the fusion already took mana and set cooldowns: put them back until a destination is picked */
  if(S._paid){P.mana=Math.min(P.maxMana,P.mana+S._paid.cost);for(const k of S._paid.ids)P.cds[k]=0;}
  S.dataset.prev=state;state='inv';firing=false;try{resetTouch();unlock();}catch(e){}S.hidden=false;
  S.classList.add('wait');setTimeout(()=>S.classList.remove('wait'),450);/* a finger still on the screen cannot pick a floor by accident */
  setTimeout(()=>{const c=box.querySelector('.cur');if(c)c.scrollIntoView({block:'center'});},30);
}
function closeGatePick(cancel){const S=$('gatepick');if(!S||S.hidden)return;S.hidden=true;
  if(!cancel&&S._paid){P.mana=Math.max(0,P.mana-S._paid.cost);for(const [k,v] of S._paid.cds){P.cds[k]=v;}}
  else if(cancel)msg('The gate closes. Nothing was spent.','lore','gate');
  S._paid=null;if(state==='inv'){state='play';try{lock();}catch(e){}}}
function gateHere(){const a=aimDir(),fl=Math.hypot(a.x,a.z)||1,dx=a.x/fl,dz=a.z/fl;let k=3.2;while(k>1&&blocked(P.x+dx*k,P.z+dz*k,.3))k-=.4;return {x:P.x+dx*k,z:P.z+dz*k};}
function gateTo(f){
  castFx('lastgate');P.castT=1;P.recoil=Math.max(P.recoil,.8);const q=gateHere();
  if(f===P.floor){if(!exitSpot()){msg('The gate has nowhere to open.','bad','gate');return;}chainHud('ROYAL GATE!',true);P.chainShow=2.4;openGate(q.x,q.z,P.yaw,true,'me');return;}
  chainHud('GATE OF ASCENSION · FLOOR '+f,true);P.chainShow=2.4;openGate(q.x,q.z,P.yaw,true,'me',f);}
function gateToAlly(id){const g=MP.others[id];if(!g)return;const tx=g.tx!=null?g.tx:g.x,tz=g.tz!=null?g.tz:g.z;
  castFx('lastgate');sfx('blink');sfx('bell');
  if((g.f|0)===P.floor||!g.f){const spots=[[1.2,0],[-1.2,0],[0,1.2],[0,-1.2]];for(const [ox,oz] of spots)if(!blocked(tx+ox,tz+oz,.3)){burst(P.x,1,P.z,24,[1,.82,.3],2.5,.6,0);P.x=tx+ox;P.z=tz+oz;P.vx=P.vz=0;P.y=0;P.vy=0;P.inv=Math.max(P.inv||0,1);calcFlow();reveal();pillarFx(P.x,P.z,.8,0xffd24a,.6);msg('You step out beside '+(g.n||'your teammate')+'.','gold','ally');return;}
    msg('There is no room beside your teammate right now.','bad','gate');return;}
  MP.meet={f:g.f|0,x:tx,z:tz};warpToFloor(g.f|0);}

/* ---------- room puzzles: levers in order, and crystals that sing a sequence ---------- */
let PZ=[];
const PZM={};
function pzWallSpot(r,used){/* a cell on the room's edge with solid wall behind it */
  for(let n=0;n<60;n++){const side=ri(0,3),x=side<2?ri(r.x0+1,r.x1-1):side===2?r.x0:r.x1,y=side>=2?ri(r.y0+1,r.y1-1):side===0?r.y0:r.y1,k=y*L.W+x;
    const nx=side===2?-1:side===3?1:0,ny=side===0?-1:side===1?1:0;if(L.grid[k]!==1||(L.cover&&L.cover[k])||used.has(k))continue;if(L.grid[(y+ny)*L.W+x+nx]!==0)continue;
    let near=false;for(const o of[1,-1,L.W,-L.W])if([2,3,4].includes(L.grid[k+o]))near=true;if(near)continue;used.add(k);
    return {x:wx(x)+nx*1.38,z:wx(y)+ny*1.38,ry:Math.atan2(-nx,-ny),nx,ny};}return null;}
function pzPick(rooms){
  PZ=[];if(PVP.on||MP.on||!rooms.length)return;const f=P.floor;
  const cols=[0xff4a3a,0x5ad05a,0x5a8aff,0xffd24a],cn=['red','green','blue','gold'];
  if(Math.random()<.55){const r=rooms.splice(ri(0,rooms.length-1),1)[0],used=new Set(),lv=[];
    const order=[0,1,2].sort(()=>Math.random()-.5);
    for(let i=0;i<3;i++){const sp=pzWallSpot(r,used);if(!sp)break;const col=cols[i];
      const M=prop(sp.x,sp.z,sp.ry,MM=>{MM.b(.7,1,.12,0x3a3630,0,1.3,0);MM.b(.5,.08,.16,0x2a2a30,0,1.3,.06);MM.b(.18,.18,.14,col,0,1.72,.04,null,GLOW);});
      const h=new T.Group();h.position.set(sp.x+sp.nx*-.12,1.3,sp.z+sp.ny*-.12);h.rotation.y=sp.ry;const arm=new T.Mesh(geo(.08,.6,.08),new T.MeshPhongMaterial({color:0x6a6a74,flatShading:true}));arm.position.y=.28;h.add(arm);
      const knob=new T.Mesh(geo(.16,.16,.16),new T.MeshBasicMaterial({color:col}));knob.position.y=.58;h.add(knob);h.rotation.x=-.6;lvl.add(h);lv.push({x:sp.x,z:sp.z,h,col,i,on:false,cd:0});}
    if(lv.length===3){/* the tablet in the middle shows the order as coloured stones */
      const c=roomCell(r),tx=wx(c.x),tz=wx(c.y);prop(tx,tz,0,MM=>{MM.b(.9,1,.4,0x4a4640,0,.5,0);MM.b(1,.12,.5,0x3a3630,0,1.04,0);order.forEach((o,k)=>MM.b(.2,.2,.08,cols[o],(k-1)*.3,.65,.22,null,GLOW));});
      PZ.push({type:'levers',r,lv,order,step:0,done:false,tx,tz,shown:false,cn});}}
  if(rooms.length&&Math.random()<.45){const r=rooms.splice(ri(0,rooms.length-1),1)[0],used=new Set(),cr=[];
    for(let i=0;i<4;i++){const c=roomCell(r,used),x=wx(c.x)+rnd(-.5,.5),z=wx(c.y)+rnd(-.5,.5);if(cr.some(q=>Math.hypot(q.x-x,q.z-z)<2.5))continue;const col=cols[i];
      prop(x,z,0,MM=>{MM.b(.7,.3,.7,0x3a3630,0,.15,0);MM.b(.5,.12,.5,0x2a2622,0,.36,0);});
      const m=new T.Mesh(new T.OctahedronGeometry(.32,0),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.55}));m.position.set(x,1.05,z);m.scale.y=1.6;lvl.add(m);cr.push({x,z,m,col,i,cd:0,lit:0});}
    if(cr.length>=3){const n=Math.min(4+((f/6)|0),6),seq=[];for(let k=0;k<n;k++)seq.push(ri(0,cr.length-1));
      PZ.push({type:'crystals',r,cr,seq,step:0,play:-1,pt:0,done:false,shown:false,cx:(wx(r.x0)+wx(r.x1))/2,cz:(wx(r.y0)+wx(r.y1))/2});}}
}
function pzHitAt(x,z,rad){/* did the player touch it, strike it, or shoot it this frame */
  if(Math.hypot(P.x-x,P.z-z)<rad+.35&&PY()<1.2)return true;
  if(P.swing>.85&&Math.hypot(P.x-x,P.z-z)<2.6){const a=aimDir(),l=Math.hypot(a.x,a.z)||1;if(((x-P.x)*a.x+(z-P.z)*a.z)/l/Math.hypot(x-P.x,z-P.z)>.6)return true;}
  for(const p of projs)if(p.from==='p'&&Math.hypot(p.x-x,p.z-z)<rad+.2&&p.y<2.3)return true;return false;}
function pzReward(Z,x,z,txt){Z.done=true;sfx('level');addItem('chest',x,z);items[items.length-1].bonus=true;const g=Math.round(30+P.floor*10);P.gold+=g;floatText(x,2,z,'+'+g+'g','coin');banner(txt,'A chest rises from the stone',1800);pillarFx(x,z,1.2,0xffd24a,1,.7);}
function pzTick(dt){
  let txt='';
  for(const Z of PZ){if(Z.done)continue;
    if(Z.type==='levers'){
      for(const l of Z.lv){l.cd-=dt;l.h.rotation.x+=((l.on?.6:-.6)-l.h.rotation.x)*Math.min(1,dt*12);
        if(!l.on&&l.cd<=0&&pzHitAt(l.x,l.z,.5)){l.cd=.6;const want=Z.order[Z.step];
          if(l.i===want){l.on=true;Z.step++;sfx('key');tone(300+Z.step*160,500+Z.step*160,.15,'square',.06);burst(l.x,1.6,l.z,10,hex2c(l.col),2,.4,.3);
            if(Z.step>=Z.lv.length)pzReward(Z,Z.tx+1.2,Z.tz,'THE LEVERS HOLD');}
          else{sfx('locked');for(const q of Z.lv)q.on=false;Z.step=0;burst(l.x,1.5,l.z,14,[1,.3,.2],3,.4,.3);msg('Wrong lever. They all snap back. The tablet shows the order.','bad','lev');}}}
      const d=Math.hypot(P.x-Z.tx,P.z-Z.tz);if(d<14&&!Z.done){if(!Z.shown){Z.shown=true;msg('Levers on the walls, and a tablet with coloured stones. Pull them in that order: walk into them, strike or shoot them.','lore','lev');}txt='LEVERS <em>'+Z.step+'/'+Z.lv.length+'</em> · follow the tablet';}}
    else if(Z.type==='crystals'){
      const d=Math.hypot(P.x-Z.cx,P.z-Z.cz);
      for(const c of Z.cr){c.cd-=dt;c.lit=Math.max(0,c.lit-dt*2.5);c.m.rotation.y+=dt*(1+c.lit*6);c.m.material.opacity=.35+c.lit*.65;c.m.scale.setScalar(1+c.lit*.35);c.m.scale.y=1.6*(1+c.lit*.35);}
      if(Z.play<0&&d<12&&Z.step===0&&!Z.wait){Z.play=0;Z.pt=.8;if(!Z.shown){Z.shown=true;msg('The crystals sing a pattern. Repeat it: walk into, strike or shoot them in the same order.','lore','cry');}}
      if(Z.play>=0){Z.pt-=dt;if(Z.pt<=0){if(Z.play<Z.seq.length){const c=Z.cr[Z.seq[Z.play]];c.lit=1;tone(400+c.i*140,400+c.i*140,.3,'triangle',.07);Z.play++;Z.pt=.75;}else{Z.play=-1;Z.wait=true;}}txt='WATCH THE CRYSTALS';}
      else if(Z.wait){
        for(const c of Z.cr)if(c.cd<=0&&pzHitAt(c.x,c.z,.45)){c.cd=.5;c.lit=1;
          if(c.i===Z.seq[Z.step]){Z.step++;tone(400+c.i*140,400+c.i*140,.25,'triangle',.08);if(Z.step>=Z.seq.length){pzReward(Z,Z.cx,Z.cz,'THE CRYSTALS ARE STILL');break;}}
          else{sfx('locked');Z.step=0;Z.wait=false;Z.play=0;Z.pt=1.2;msg('Wrong note. Listen again.','bad','cry');break;}}
        if(d<14)txt='CRYSTALS <em>'+Z.step+'/'+Z.seq.length+'</em>';}}}
  return txt;
}
