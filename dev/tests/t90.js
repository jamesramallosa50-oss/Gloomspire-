// facility screenshots at fixed viewpoints
const {serve,launch}=require('./serve.js');
const dir=process.argv[2]||'/home/claude/exp/d',out=process.argv[3]||'/home/claude/shots',tag=process.argv[4]||'a';
(async()=>{const srv=await serve(dir),port=srv.address().port,bro=await launch();
const pg=await bro.newPage({viewport:{width:960,height:540}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text());});
await pg.goto('http://localhost:'+port+'/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{window.__hzRH=160;window.__facHideDm=true;__g.horStart('fac');});
const t0=Date.now();while(Date.now()-t0<120000){const ok=await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading&&H.fac&&H.fac.pl&&H.fac.post);});if(ok)break;await pg.waitForTimeout(500);}
console.log('loaded in',(Date.now()-t0)/1000,'s');
await pg.evaluate(()=>{const F=__g.HZ.fac;F.dm.on=false;F.dm.st='away';F.dm.g.visible=false;F.dir.awayT=1e9;F.dir.ambT=1e9;window.__facManual=true;});
const V=JSON.parse(process.env.VIEWS||'null')||[['start',11,8.2,1,0,-.05],['c1',34,3,1,Math.PI/2,0],['stairB',3.2,3,1,Math.PI*0.92,-.35],['server',23.4,6.8,0,-Math.PI/2,-.05],['gallery',18.5,14,0,-Math.PI*.72,-.25],['hall',30,20,1,Math.PI*0.62,.05],['y1',21,3.25,0,Math.PI/2,0],['b1',38,3,2,Math.PI/2,0],['lift',23,25,2,-Math.PI/2,0],['break',15,16.5,0,Math.PI/2,-.1],['stairA',39.5,25,1,Math.PI,-.4],['c2',37,27,1,0,0]];
for(const v of V){await pg.evaluate(v=>{const F=__g.HZ.fac,pl=F.pl,[n,x,z,k,yaw,pitch]=v;const y=[8,4,0][k];pl.x=x;pl.z=z;pl.y=y;pl.vx=pl.vz=pl.vy=0;pl.yaw=yaw;pl.pitch=pitch;pl.ground=true;F.camY=y+1.62;__g.P.yaw=yaw;__g.P.pitch=pitch;window.__facStep=true;},v);
  await pg.evaluate(()=>{window.__hzRH=160;});const tA=await pg.evaluate(()=>__g.HZ.fac.t);let w0=Date.now();while(Date.now()-w0<60000){const t=await pg.evaluate(()=>__g.HZ.fac.t);if(t-tA>.6)break;await pg.waitForTimeout(100);}
  await pg.evaluate(()=>{window.__hzRH=405;});const tB=await pg.evaluate(()=>__g.HZ.fac.t);w0=Date.now();while(Date.now()-w0<60000){const t=await pg.evaluate(()=>__g.HZ.fac.t);if(t-tB>.04)break;await pg.waitForTimeout(100);}await pg.evaluate(()=>{window.__facStep=false;});await pg.waitForTimeout(600);
  await pg.screenshot({path:out+'/'+tag+'_'+v[0]+'.png',timeout:90000});console.log('shot',v[0],(await pg.evaluate(()=>{const F=__g.HZ.fac;return [F.pl.x.toFixed(1),F.pl.y.toFixed(2),F.pl.z.toFixed(1),__g.HZ.fpsA.toFixed(1)].join(' ');})));}
const info=await pg.evaluate(()=>{const r=__g.renderer.info;return {calls:r.render.calls,tris:r.render.triangles,geos:r.memory.geometries,tex:r.memory.textures};});
console.log(JSON.stringify(info));console.log('errors',errs.slice(0,8));await bro.close();srv.close();})();
