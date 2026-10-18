// walk tests: straight runs along corridors, through doorways and up/down stairs; reports progress and any stalls
const {serve,launch}=require('./serve.js');
const dir=process.argv[2]||'/home/claude/exp/g';
(async()=>{const srv=await serve(dir),port=srv.address().port,bro=await launch();
const pg=await bro.newPage({viewport:{width:480,height:270}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+port+'/index.html');await pg.waitForTimeout(2000);
await pg.evaluate(()=>{window.__hzRH=100;window.__facHideDm=true;__g.horStart('fac');});
let t0=Date.now();while(Date.now()-t0<90000){if(await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading&&H.fac&&H.fac.post);}))break;await pg.waitForTimeout(300);}
const r=await pg.evaluate(()=>{const g=__g,F=g.HZ.fac,f=g.fac,pl=F.pl,K=g.keys,dm=F.dm;window.__facManual=true;dm.on=false;dm.st='away';F.dir.awayT=1e9;F.dir.ambT=1e9;F.dir.alertAt=-1;
  for(const d of F.doors){d.th=d.tgt=1.55*(Math.random()<.5?1:-1);d.mesh.rotation.y=-(d.a0+d.th);}/* doors open for the corridor runs */
  const out=[];const dt=1/60;window.__facStep=true;
  const run=(name,x,y,z,yaw,secs,keys,doorsShut)=>{pl.x=x;pl.y=y;pl.z=z;pl.vx=pl.vz=pl.vy=0;pl.ground=true;pl.crouch=false;pl.sta=1;pl.tired=false;g.P.yaw=yaw;g.P.pitch=0;F.camY=y+1.62;
    for(const k in K)K[k]=false;for(const k of keys)K[k]=true;let stall=0,minV=99,path=[];const sx=x,sz=z;
    for(let i=0;i<secs*60;i++){const ox=pl.x,oz=pl.z;g.horTick(dt);const v=Math.hypot(pl.x-ox,pl.z-oz)/dt;if(i>30){minV=Math.min(minV,v);if(v<.3)stall++;}if(i%30===0)path.push([+pl.x.toFixed(2),+pl.y.toFixed(2),+pl.z.toFixed(2)]);}
    for(const k in K)K[k]=false;out.push({name,from:[sx,y,sz],to:[+pl.x.toFixed(2),+pl.y.toFixed(2),+pl.z.toFixed(2)],dist:+Math.hypot(pl.x-sx,pl.z-sz).toFixed(2),stallFrames:stall,minSpeed:+minV.toFixed(2),path:path.slice(0,14)});};
  run('C3 east walk',20,4,27.5,-Math.PI/2,3,['KeyW']);
  run('C3 east sprint',20,4,27.5,-Math.PI/2,3,['KeyW','ShiftLeft']);
  run('C1 west sprint',36,4,3,Math.PI/2,4,['KeyW','ShiftLeft']);
  run('C2 south sprint',37,4,5,Math.PI,4,['KeyW','ShiftLeft']);
  run('wall slide diag',20,4,27.0,-Math.PI/2+0.5,2,['KeyW']);
  run('stairB down',3.25,4,2.6,Math.PI,6,['KeyW']);
  run('atrium stair up',20.75,4,22.6,0,4,['KeyW']);
  run('stair C down',9,4,28.8,Math.PI,6,['KeyW']);
  run('Y1 west sprint',21.5,8,3.25,Math.PI/2,3,['KeyW','ShiftLeft']);
  /* a closed door straight ahead: walking into it must push it open, never pass through it */
  {const d=F.doors.find(d=>d.k===1&&Math.abs(d.cx-11)<.6&&Math.abs(d.cz-4.25)<.4);if(d){d.th=d.tgt=0;d.om=0;d.mesh.rotation.y=-(d.a0);}run('start door push',11,4,6.2,0,3,['KeyW']);if(d)out[out.length-1].doorTh=+d.th.toFixed(2);}
  window.__facStep=false;return out;});
for(const o of r)console.log(JSON.stringify(o));
console.log('errors',errs.slice(0,5));await bro.close();srv.close();})();
