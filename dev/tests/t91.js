// facility: collision fuzz (A) and a bot playthrough for pacing (B)
const {serve,launch}=require('./serve.js');
const dir=process.argv[2]||'/home/claude/exp/d',mode=process.argv[3]||'AB',seed=+(process.argv[4]||1);
(async()=>{const srv=await serve(dir),port=srv.address().port,bro=await launch();
const pg=await bro.newPage({viewport:{width:640,height:360}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text());});
await pg.goto('http://localhost:'+port+'/index.html');await pg.waitForTimeout(2000);
const start=async()=>{await pg.evaluate(()=>{window.__hzRH=120;window.__facHideDm=true;__g.horStart('fac');});
  const t0=Date.now();while(Date.now()-t0<120000){const ok=await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading&&H.fac&&H.fac.pl&&H.fac.post);});if(ok)break;await pg.waitForTimeout(300);}
  await pg.evaluate(()=>{window.__facManual=true;window.__facStep=false;});};
await start();
await pg.evaluate(s=>{let x=s*9301+49297;Math.random=()=>{x=(x*9301+49297)%233280;return x/233280;};},seed);
if(mode.includes('A')){
  const r=await pg.evaluate(()=>{const g=__g,F=g.HZ.fac,f=g.fac,pl=F.pl,N=F.nav,K=g.keys,dm=F.dm;dm.on=false;dm.st='away';dm.g.visible=false;F.dir.awayT=1e9;F.dir.ambT=1e9;F.dir.alertAt=-1;
    const bad=[],R=Math.random;let ticks=0,maxPen=0,doorX=0,fall=0,stuck=0;const dt=1/60;window.__facStep=true;
    const clear=(x,y,z,h)=>f.facPush(F,{x,y,z},.3-.012,h,.46);
    for(let trial=0;trial<70;trial++){const n=(R()*N.N)|0,p=f.facNP(F,n);pl.x=p[0];pl.y=p[1];pl.z=p[2];pl.vx=pl.vz=pl.vy=0;pl.ground=true;pl.crouch=false;g.P.yaw=R()*6.28;g.P.pitch=0;F.camY=pl.y+1.62;
      if(clear(pl.x,pl.y,pl.z,1.74)>.003){continue;}
      let inp=null;for(let s=0;s<240;s++){if(s%30===0){for(const k of['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])K[k]=false;K.KeyW=R()<.75;K.KeyA=R()<.25;K.KeyD=!K.KeyA&&R()<.25;K.KeyS=!K.KeyW&&R()<.3;K.ShiftLeft=R()<.5;pl.crouch=R()<.12;inp=(R()-.5)*3;}
        g.P.yaw+=inp*dt;const ox=pl.x,oz=pl.z,oy=pl.y;const sides=F.doors.map(d=>Math.abs(d.th)<.05?f.facDoorSide(d,pl.x,pl.z):0);
        g.horTick(dt);ticks++;
        const h=pl.crouch?1.12:1.74,pen=clear(pl.x,pl.y,pl.z,h);if(pen>maxPen)maxPen=pen;if(pen>.004&&bad.length<12)bad.push(['pen',pen.toFixed(3),pl.x.toFixed(2),pl.y.toFixed(2),pl.z.toFixed(2)]);
        F.doors.forEach((d,i)=>{if(!sides[i]||Math.abs(d.th)>=.05)return;const sd=f.facDoorSide(d,pl.x,pl.z);if(sd!==sides[i]&&Math.abs(pl.y-d.y)<1&&pl.x>d.x0-.3&&pl.x<d.x1+.3&&pl.z>d.z0-.3&&pl.z<d.z1+.3){doorX++;if(bad.length<12)bad.push(['door',i,pl.x.toFixed(2),pl.z.toFixed(2)]);}});
        if(pl.y<-0.5){fall++;break;}
        if(pl.ground){const gy=f.facGround(F,pl.x,pl.z,pl.y+.05,.1);if(Math.abs(gy-pl.y)>.06&&bad.length<12)bad.push(['ground',pl.x.toFixed(2),pl.y.toFixed(2),pl.z.toFixed(2),gy.toFixed(2)]);}
      }}
    for(const k of['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])K[k]=false;window.__facStep=false;
    return {ticks,maxPen:+maxPen.toFixed(4),doorX,fall,bad};});
  console.log('COLLISION',JSON.stringify(r));
}
if(mode.includes('B')){
  // fresh run with the director on
  await pg.evaluate(()=>{__g.hzQuit(true);});await pg.waitForTimeout(500);
  const t0=Date.now();while(Date.now()-t0<60000){const ok=await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading&&H.fac&&H.fac.pl&&H.fac.post);});if(ok)break;await pg.waitForTimeout(300);}
  if(process.env.FLEE)await pg.evaluate(()=>{window.__FLEE=1;});
  if(process.env.DBG)await pg.evaluate(d=>{window.__DBG=d.split(',').map(Number);},process.env.DBG);
  if(process.env.INVINCIBLE){const ok=await pg.evaluate(()=>{window.__catches=[];window.__facNoDie=function(F){window.__catches.push(+F.t.toFixed(1));const dm=F.dm;dm.on=false;dm.g.visible=false;dm.st='away';dm.stT=0;F.dir.awayT=12;};return 'ok';});console.log('invincible',ok);}
  await pg.evaluate(()=>{window.__facManual=true;window.__facStep=false;window.__bot={log:[],last:'',wp:null,path:null,pi:0,repl:0,goal:null,chases:0,sights:0,cross:0,stuckT:0,lx:0,lz:0};});
  const NCH=+(process.env.NCH||40);for(let chunk=0;chunk<NCH;chunk++){
    const r=await pg.evaluate(()=>{const g=__g,H=g.HZ;if(!H||!H.fac)return {end:'gone'};const F=H.fac,f=g.fac,pl=F.pl,dm=F.dm,K=g.keys,B=window.__bot,dt=1/30;window.__facStep=true;
      const goalOf=()=>{const fz=F.fz.filter(z=>!z.got);if(fz.length){fz.sort((a,b)=>Math.hypot(a.x-pl.x,(a.y-pl.y)*3,a.z-pl.z)-Math.hypot(b.x-pl.x,(b.y-pl.y)*3,b.z-pl.z));return {t:'fuse',o:fz[0],x:fz[0].x,y:fz[0].y-0.8,z:fz[0].z};}
        if(F.held>0||F.stage==='find')return {t:'brk',x:F.brk.x,y:F.brk.y-1.7,z:F.brk.z+.6};if(F.stage==='wait')return {t:'wait',x:F.brk.x,y:0,z:F.brk.z+1.2};return {t:'lift',x:36,y:0,z:25};};
      for(let s=0;s<300;s++){if(H.dead||H.won)break;
        let G=goalOf();const hunted0=dm.on&&(dm.st==='chase'||dm.st==='reveal'||dm.st==='stare'||dm.st==='drop')&&(F.dmDist||99)<17;
        if(window.__FLEE&&hunted0){/* run away: a spot far from it, by a route that does not pass it */
          if(!B.flee||B.fleeT<=0){B.fleeT=1;let best=null,bs=-1e9;const N=F.nav;for(let k=0;k<40;k++){const n=(Math.random()*N.N)|0,q=f.facNP(F,n),dp=Math.hypot(q[0]-pl.x,q[2]-pl.z);if(dp<10||dp>32)continue;const dd=Math.hypot(q[0]-dm.x,(q[1]-dm.y)*2,q[2]-dm.z);const sc=dd-dp*.6;if(sc>bs){const a=f.facNodeNear(F,pl.x,pl.y,pl.z),pth=f.facPath(F,a,n,20000,1);if(!pth)continue;let ok=true;for(let i=0;i<Math.min(pth.length,40);i+=2){const r=f.facNP(F,pth[i]);if(Math.hypot(r[0]-dm.x,r[2]-dm.z)<3.2&&Math.abs(r[1]-dm.y)<1.5){ok=false;break;}}if(!ok)continue;bs=sc;best={n,q,pth};}}
            if(best){B.flee=best;B.path=best.pth;B.pi=0;B.goal={t:'flee',x:best.q[0],y:best.q[1],z:best.q[2]};}}
          B.fleeT-=dt;if(B.flee)G=B.goal;}
        else{B.flee=null;}
        if(window.__FLEE&&!hunted0&&dm.on&&(dm.st==='search'||dm.st==='inv')&&(F.dmDist||99)<14){/* hide: crouch, light off, stay still */pl.crouch=true;pl.light=false;B.hid=(B.hid||0)+dt;for(const k of['KeyW','ShiftLeft'])K[k]=false;g.horTick(dt);continue;}
        else if(window.__FLEE&&pl.crouch&&!hunted0){pl.crouch=false;pl.light=true;}
        if(!B.flee&&(!B.goal||B.goal.t!==G.t||B.goal.o!==G.o||B.repl<=0)){B.goal=G;const a=f.facNodeNear(F,pl.x,pl.y,pl.z),b=f.facNodeNear(F,G.x,G.y,G.z);B.path=f.facPath(F,a,b,60000,1);B.pi=0;B.repl=3;}
        B.repl-=dt;
        const d=Math.hypot(G.x-pl.x,G.z-pl.z);
        if(G.t==='fuse'&&d<1.3&&Math.abs(G.y-pl.y)<1){F.aim={t:'fuse',f:G.o};f.facUse(F);B.log.push([F.t.toFixed(1),'fuse',F.fuses]);B.goal=null;}
        if(G.t==='brk'&&d<1.4&&Math.abs(pl.y-0)<.5){F.aim={t:'brk'};f.facUse(F);if(F.held===0)B.log.push([F.t.toFixed(1),'breaker',F.brk.n]);B.goal=null;}
        let mvx=0,mvz=0;if(B.path&&B.path.length){while(B.pi<B.path.length-1){const p=f.facNP(F,B.path[B.pi]);if(Math.hypot(p[0]-pl.x,p[2]-pl.z)<.5)B.pi++;else break;}
          const p=f.facNP(F,B.path[Math.min(B.pi+1,B.path.length-1)]);mvx=p[0]-pl.x;mvz=p[2]-pl.z;}
        const L=Math.hypot(mvx,mvz);for(const k of['KeyW','ShiftLeft'])K[k]=false;
        if(L>.15&&!(G.t==='wait'&&d<1.5)){const want=Math.atan2(-mvx,-mvz);let dy=want-g.P.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));g.P.yaw+=dy*Math.min(1,dt*10);K.KeyW=true;
          const hunted=dm.on&&(dm.st==='chase'||dm.st==='reveal')&&(F.dmDist||99)<14;K.ShiftLeft=hunted&&!pl.tired;}
        if(Math.hypot(pl.x-B.lx,pl.z-B.lz)<.01&&K.KeyW){B.stuckT+=dt;if(B.stuckT>1.5){B.repl=0;B.stuckT=0;g.P.yaw+=1.2;}}else B.stuckT=0;B.lx=pl.x;B.lz=pl.z;
        if(dm.on&&B.dmx!=null&&B.dmOn){const mv=Math.hypot(dm.x-B.dmx,dm.z-B.dmz);if(mv>.8&&dm.st!=='cross'&&!dm.leap&&B.dmSt===dm.st&&B.jumps<8){B.jumps=(B.jumps||0)+1;B.log.push([F.t.toFixed(1),'JUMP',mv.toFixed(1),dm.st]);}}B.dmx=dm.x;B.dmz=dm.z;B.dmOn=dm.on;B.dmSt=dm.st;
        if(dm.on&&dm.st==='chase'&&Math.floor(F.t)!==B.lastSec){B.lastSec=Math.floor(F.t);B.log.push([F.t.toFixed(1),'d',(F.dmDist||0).toFixed(1),pl.tired?'T':'',K.ShiftLeft?'S':'']);}
        if(window.__DBG&&F.t>=window.__DBG[0]&&F.t<=window.__DBG[1])B.log.push([F.t.toFixed(2),'dbg',dm.st,dm.x.toFixed(2),dm.y.toFixed(2),dm.z.toFixed(2),'pl',pl.x.toFixed(2),pl.y.toFixed(2),pl.z.toFixed(2),(F.dmDist||0).toFixed(1),dm.leap?'LEAP':'',dm.bash?'BASH':'']);
        const st=dm.on?dm.st:'off';if(st!==B.last){if(B.last==='chase')B.log.push([F.t.toFixed(1),'chase-end',(F.dmDist||0).toFixed(1)]);B.log.push([F.t.toFixed(1),st,(F.dmDist||0).toFixed(1)]);if(st==='chase')B.chases++;if(st==='cross')B.cross++;B.last=st;}
        g.horTick(dt);}
      window.__facStep=false;for(const k of['KeyW','ShiftLeft'])K[k]=false;
      return {t:F.t,dead:!!H.dead,won:!!H.won,fuses:F.fuses,stage:F.stage,pos:[pl.x.toFixed(1),pl.y.toFixed(1),pl.z.toFixed(1)]};});
    if(r.end||r.dead||r.won||chunk===NCH-1){console.log('END',JSON.stringify(r));break;}
  }
  const log=await pg.evaluate(()=>window.__bot);console.log('chases',log.chases,'cross',log.cross,'catches',JSON.stringify(await pg.evaluate(()=>window.__catches||[])));console.log(log.log.map(e=>e.join(' ')).join(' | '));
}
console.log('errors',errs.slice(0,8));await bro.close();srv.close();})();
