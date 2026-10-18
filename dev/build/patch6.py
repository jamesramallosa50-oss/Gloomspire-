import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]);s=s.replace(a,b)

ULT=r'''/* when two or three of the spells share an element there is no exact recipe, so pick (always the same one for the same spells) a recipe that holds every element they have */
function fzResolve(ids){const T=ids.length===2?FZ2:ULT3;let k=fzKey(ids),Zr=T[k];if(Zr||ids.some(i=>!FU[i]))return [k,Zr||null];
  const u=[...new Set(ids.map(i=>FU[i][2]))];let c=Object.keys(T).filter(q=>{const p=q.split('+');return u.every(x=>p.includes(x));});
  if(!c.length)c=Object.keys(T).filter(q=>q.split('+').some(x=>u.includes(x)));if(!c.length)return [k,null];
  c.sort();let h=7;for(const ch of ids.slice().sort().join('|'))h=(h*31+ch.charCodeAt(0))>>>0;k=c[h%c.length];return [k,T[k]];}
const fuName=ids=>{const Zr=fzResolve(ids)[1];'''
rep("const fuName=ids=>{const Zr=(ids.length===2?FZ2:ULT3)[fzKey(ids)];",ULT)
rep("ULT3[fzKey(ids)]","fzResolve(ids)[1]")
rep("FZ2[fzKey(ids)]","fzResolve(ids)[1]")

FIN=r'''const ULTCD3=45,ULTCD2=20;
/* the finisher: every fusion and ultimate ends by sweeping the room. An ultimate kills everything in your room (elites too) and everything
   near you or in plain sight; bosses lose a quarter of their life. A 2-spell fusion kills normal monsters, takes 65% off elites and 10% off bosses. */
function ultFinish(X){
  if(PVP.on||!L||!L.roomOf)return;
  const n=X.n,hex=X.hex||0xffffff,hex2=X.hex2||hex,c=hex2c(hex),c2=hex2c(hex2),R=n>=3?32:20,room=L.roomOf[cellIdx(P.x,P.z)];
  const tg=enemies.filter(e=>{if(e.dead||e.pv)return false;const d=Math.hypot(e.x-P.x,e.z-P.z);return (room>=0&&(e.room===room||L.roomOf[cellIdx(e.x,e.z)]===room)&&d<60)||(d<R&&los(P.x,P.z,e.x,e.z))||(n>=3&&d<12);});
  if(n<3)fzCutIn(X.name||'Fusion',hex);
  HSTOP=Math.max(HSTOP,n>=3?.22:.12);P.tint=Math.max(P.tint||0,.75);$('castfx').style.color='#'+hex.toString(16).padStart(6,'0');
  sfx('roar');shake=Math.max(shake,n>=3?.45:.22);
  sphereFx(P.x,1.2,P.z,.5,3.2,0xffffff,.3,.7);ringFx(P.x,P.z,.5,R*.9,hex,.75);ringFx(P.x,P.z,.3,R*.6,hex2,.6,.12);runeFx(P.x,P.z,2.6,hex,1.4);
  for(let i=0;i<(fxLow()?24:48);i++){const an=i/48*6.283;spark(P.x,rnd(.3,2),P.z,Math.cos(an)*rnd(10,18),rnd(0,2),Math.sin(an)*rnd(10,18),.6,i%2?c:c2,0);}
  if(n>=3){/* the ultimate's opening: the sky cracks open over you, three shockwaves roll out, the screen burns white */
    pillarFx(P.x,P.z,3.2,hex,1.1,.55);pillarFx(P.x,P.z,1.2,0xffffff,.8,.8);sphereFx(P.x,1.4,P.z,1,14,hex,.55,.35);
    for(let w=0;w<3;w++)after(w*.16,()=>{if(state!=='play')return;ringFx(P.x,P.z,1,R*(.5+w*.25),w%2?hex2:0xffffff,.55,.1+w*.04);sfx('boom');});
    try{if(meta.flash!==false){const v=$('view');v.style.transition='none';v.style.filter='brightness(2.2) saturate(1.6)';requestAnimationFrame(()=>requestAnimationFrame(()=>{v.style.transition='filter .45s ease-out';v.style.filter='';}));}}catch(_){}
    for(let i=0;i<(fxLow()?16:34);i++){const an=Math.random()*6.283,rr=rnd(2,R*.7);spark(P.x+Math.cos(an)*rr,rnd(3,6),P.z+Math.sin(an)*rr,0,rnd(-6,-2),0,.7,i%2?c:[1,1,1],.4);}}
  if(!tg.length){after(.5,()=>{if(state==='play')msg('The '+(n>=3?'ultimate':'fusion')+' finds nothing left to break.','lore','ultf');});return;}
  /* the strike: a pillar of light drops on every target, nearest first */
  tg.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
  const total=tg.length;let killed=0;
  tg.forEach((e,i)=>{const at=.45+Math.min(1.2,i*.07);
    after(at-.3,()=>{if(state!=='play'||e.dead)return;tgMark(e.x,e.z,Math.max(1.2,e.r*2.2),.3,0,'',hex);});
    after(at,()=>{if(state!=='play'||e.dead)return;
      pillarFx(e.x,e.z,Math.max(.9,e.r*1.4),hex,.7,.85);pillarFx(e.x,e.z,Math.max(.4,e.r*.6),0xffffff,.45,.9);sphereFx(e.x,e.y+e.h*.5,e.z,.3,Math.max(1.4,e.h*1.2),hex,.3,.6);
      burst(e.x,e.y+e.h*.6,e.z,fxLow()?10:20,i%2?c:c2,5,.6,.4);flash(e.x,1.5,e.z,hex,2.4);
      if(i<8)zapLine({x:P.x,y:EY+.2,z:P.z},{x:e.x,y:e.y+e.h*.6,z:e.z},hex);
      const elite=e.sc>1.2&&!e.boss;let dm;
      if(e.boss)dm=e.maxHp*(n>=3?.25:.1);else if(elite&&n<3)dm=e.maxHp*.65;else dm=e.hp*10+e.maxHp+100;
      hurtEnemy(e,dm,true);if(e.dead)killed++;shake=Math.max(shake,.18);
      if(i===total-1)after(.35,()=>{if(state!=='play')return;sfx('boom');ringFx(P.x,P.z,1,R,0xffffff,.5);if(n>=3){sphereFx(P.x,1,P.z,2,R*.8,hex2,.45,.3);shake=Math.max(shake,.3);}
        if(killed>=2||n>=3)banner((X.name||'ULTIMATE').toUpperCase(),killed?killed+' fell at once':'The room is broken',1600);});});});
}
function castFusion(ids){'''
rep("function castFusion(ids){",FIN)
rep("const k=fzKey(ids),Zr=(n===2?FZ2:ULT3)[k];if(!Zr){msg(n===3?'An ultimate needs three different elements.':'These will not join.','bad');return;}",
    "const [k,Zr]=fzResolve(ids);if(!Zr){msg('These will not join.','bad');return;}")
rep("  Zr[2](X);\n}\nconst R0=","  try{Zr[2](X);}catch(e){}\n  try{ultFinish(X);}catch(e){}\n}\nconst R0=")
# same-element spells may be fused
rep("if(A.ids.length+A.need===3&&FU[id]&&A.ids.some(q=>FU[q]&&FU[q][2]===FU[id][2])){msg('An ultimate needs three different elements. '+S.n+' shares one with '+SK[A.ids.find(q=>FU[q]&&FU[q][2]===FU[id][2])].n+'.','bad','fuse3');sfx('locked');return;}","")
rep("if(F.ids.length+F.need===3&&FU[id]&&F.ids.some(q=>FU[q]&&FU[q][2]===FU[id][2])){sfx('locked');msg('An ultimate needs three different elements.','bad','fuse3');}else{F.ids.push(id);F.need--;sfx('pickup');}",
    "{F.ids.push(id);F.need--;sfx('pickup');}")
rep("ultimate: three spells of three different elements. Every trio of elements calls a different one. 220 to find","ultimate: any three spells. Every trio of elements calls a different one, and spells that share an element still fuse. 220 to find")
rep("Every trio of elements calls its own ultimate. Pick spells of different elements.","Every trio of elements calls its own ultimate. Spells that share an element fuse too.")
# cooldowns: an ultimate locks exactly its three spells, a fusion exactly its two
rep("P.mana-=cost;for(const k of ids)P.cds[k]=spellCd(k);disarm();castFusion(ids);",
    "P.mana-=cost;{const util=ids.includes('raise')||ids.includes('lastgate'),big=util?0:(ids.length>=3?ULTCD3:ULTCD2)*(PVP.on?.6:1)*(1-.06*rk('cdr'));P.cdMax=P.cdMax||{};for(const k of ids){P.cds[k]=Math.max(spellCd(k),big);P.cdMax[k]=P.cds[k];}}disarm();castFusion(ids);")
rep("const cd=P.cds[id]||0;\n    el.lastChild.style.height=(clamp(cd/spellCd(id),0,1)*100)+'%';",
    "const cd=P.cds[id]||0;\n    el.lastChild.style.height=(clamp(cd/Math.max(spellCd(id),(P.cdMax&&P.cdMax[id])||0),0,1)*100)+'%';{let q=el.querySelector('.cdn');if(!q){q=document.createElement('em');q.className='cdn';el.insertBefore(q,el.firstChild);}const tx=cd>1?String(Math.ceil(cd)):'';if(q.textContent!==tx)q.textContent=tx;el.classList.toggle('ulock',!!(P.cdMax&&P.cdMax[id]&&cd>0));if(P.cdMax&&cd<=0)delete P.cdMax[id];}")
rep('#game.glgrade #vgn { display: none !important; }','#game.glgrade #vgn { display: none !important; } [id^="slot-"]{position:relative} [id^="slot-"] .cdn{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-style:normal;font-size:13px;color:#fff;text-shadow:0 0 3px #000,0 1px 0 #000;z-index:3;pointer-events:none} [id^="slot-"].ulock{box-shadow:inset 0 0 0 2px #b07aff}')
open(p,'w',encoding='utf-8').write(s);print('p6 ok')
