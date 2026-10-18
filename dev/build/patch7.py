import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]);s=s.replace(a,b)
# a forced target lets one single-target ultimate be cast on each enemy in turn
rep("const fzTgt=(X,r)=>aimTarget(X.a,r)||fzSight(Math.min(r,20))[0]||null;",
    "let FZF=null;const fzTgt=(X,r)=>(FZF&&!FZF.dead?FZF:null)||aimTarget(X.a,r)||fzSight(Math.min(r,20))[0]||null;")
RW=r'''/* ---- the 30 single-target ultimates now take the whole room ----
   multi: the ultimate's own effect is cast on every enemy in the room (up to 6 at once, the rest get its echo).
   swarm: the effect is cast three times, fanned out around you, so it hunts the whole room.
   echo:  ultimates that carry you along (riding, swinging, wearing a body) play once; every other enemy in the room is struck by its echo. */
const RWK={"Marionette Wire":'multi',"Winter Chrysalis":'multi',"Compound Debt":'multi',"Pariah's Mark":'multi',"Cold Guillotine":'multi',"Clumsy Colossus":'multi',
  "Abyssal Clutch":'multi',"Crowned Carrier":'multi',"Overripe":'multi',"Frozen Recoil":'multi',"Ticking Seedpod":'multi',"Iron Embrace":'multi',"Glacier Harpoon":'multi',
  "Butcher Bird":'swarm',"Gobbling Coffer":'swarm',"Bubble Dance":'swarm',
  "Falling Lotus":'echo',"Umbral Tether":'echo',"Heart in a Box":'echo',"Bloodline Theft":'echo',"Rimebound Duel":'echo',"Body Thief":'echo',"Unwelcome Guest":'echo',
  "Canopy Swing":'echo',"Breakback Ride":'echo',"Frozen Hostage":'echo',"Pain Given Shape":'echo',"Pierced Before Thrown":'echo',"Patient Headsman":'echo',"Grudge Lantern":'echo',"Red Wake":'echo'};
function ultTargets(n){const room=L&&L.roomOf?L.roomOf[cellIdx(P.x,P.z)]:-1,R=n>=3?32:20;
  return enemies.filter(e=>{if(e.dead||e.pv)return false;const d=Math.hypot(e.x-P.x,e.z-P.z);return (room>=0&&(e.room===room||L.roomOf[cellIdx(e.x,e.z)]===room)&&d<60)||(d<R&&los(P.x,P.z,e.x,e.z))||(n>=3&&d<12);})
    .sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));}
const aimAt=e=>{const m=emid(e),v=new T.Vector3(m.x-P.x,m.y-EY,m.z-P.z);return v.lengthSq()>1e-6?v.normalize():new T.Vector3().copy(aimDir());};
function ultEcho(list,X,src){
  const hex=X.hex||0xffffff,hex2=X.hex2||hex,c=hex2c(hex),c2=hex2c(hex2);
  list.forEach((e,i)=>after(.25+i*.06,()=>{if(state!=='play'||e.dead)return;const m=emid(e),o=src&&!src.dead?emid(src):{x:P.x,y:EY,z:P.z};
    zapLine(o,m,i%2?hex2:hex);fzGlow(m.x,m.y,m.z,1.2,hex,.45,{s1:3,star:1});ringFx(e.x,e.z,.2,2.2,hex2,.4);burst(m.x,m.y,m.z,fxLow()?6:12,i%2?c:c2,3,.5,.3);
    try{fzHit(e,X.D*2.5,X);fzStn(e,2.5);}catch(_){}}));}
function ultRoom(X,Zr,kind){
  const tg=ultTargets(3);X.finDelay=kind==='echo'?1.4:2.4;
  if(kind==='multi'){const list=tg.slice(0,6);if(!list.length){try{Zr[2](X);}catch(_){}return;}
    list.forEach((e,i)=>{const go=()=>{if(state!=='play'||(e.dead&&i>0))return;const X2=Object.assign({},X,{a:aimAt(e)});FZF=e;try{Zr[2](X2);}catch(_){}FZF=null;};if(i===0)go();else after(i*.16,go);});
    ultEcho(tg.slice(6),X,list[0]);
    if(tg.length>1)after(.3,()=>{if(state==='play')banner(X.name.toUpperCase(),'Cast on '+Math.min(6,tg.length)+(tg.length>6?' and echoed to '+(tg.length-6)+' more':''),1300);});}
  else if(kind==='swarm'){const a0=new T.Vector3().copy(X.a);
    [0,2.094,-2.094].forEach((r,i)=>{const go=()=>{if(state!=='play')return;const ca=Math.cos(r),sa=Math.sin(r),X2=Object.assign({},X,{a:new T.Vector3(a0.x*ca-a0.z*sa,a0.y,a0.x*sa+a0.z*ca)});try{Zr[2](X2);}catch(_){}};if(i===0)go();else after(i*.2,go);});}
  else{const first=tg.length?(aimTarget(X.a,20)||tg[0]):null;try{Zr[2](X);}catch(_){}ultEcho(tg.filter(e=>e!==first),X,first);}
}
'''
rep("function castFusion(ids){",RW+"function castFusion(ids){")
rep("  try{Zr[2](X);}catch(e){}\n  try{ultFinish(X);}catch(e){}","  if(n===3&&RWK[name])ultRoom(X,Zr,RWK[name]);else try{Zr[2](X);}catch(e){}\n  try{ultFinish(X);}catch(e){}")
# reworked ones let their own effect land before the room-clearing beams
rep("  tg.forEach((e,i)=>{const at=.45+Math.min(1.2,i*.07);","  const D0=X.finDelay||0;tg.forEach((e,i)=>{const at=D0+.45+Math.min(1.2,i*.07);")
open(p,'w',encoding='utf-8').write(s);print('p7 ok')
