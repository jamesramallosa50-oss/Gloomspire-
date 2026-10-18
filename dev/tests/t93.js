// regression smoke: climb start, Hide & Seek start/quit, Facility pause/resume/retry/quit
const {serve,launch}=require('./serve.js');
const dir=process.argv[2]||'/home/claude/exp/d';
(async()=>{const srv=await serve(dir),port=srv.address().port,bro=await launch();
const pg=await bro.newPage({viewport:{width:900,height:450}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
await pg.goto('http://localhost:'+port+'/index.html');await pg.waitForTimeout(2500);
const W=ms=>pg.waitForTimeout(ms);
console.log('build label',await pg.evaluate(()=>{const e=document.getElementById('mmbuild');return e&&e.textContent;}));
console.log('log top',await pg.evaluate(()=>{try{window.__mmGo('log');}catch(e){}const t=document.body.innerText;const i=t.indexOf('3.16');return i>=0?t.slice(i,i+80).replace(/\n/g,' '):'no 3.16 in log';}));
await pg.evaluate(()=>{try{window.__mmGo('modes')}catch(e){}});await W(400);
console.log('mode cards',await pg.evaluate(()=>[...document.querySelectorAll('#gmgrid *')].filter(e=>e.children.length===0&&e.textContent.trim()).map(e=>e.textContent.trim()).slice(0,12).join(' | ')));
/* facility: pause, resume, retry, quit */
await pg.evaluate(()=>{window.__hzRH=160;window.__facHideDm=true;__g.horStart('fac');});
let t0=Date.now();while(Date.now()-t0<90000){if(await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading&&H.fac&&H.fac.post);}))break;await W(300);}
console.log('fac loaded',(Date.now()-t0)/1000,'s');await W(1500);
await pg.evaluate(()=>__g.hzPause(true));await W(400);
console.log('paused',await pg.evaluate(()=>({pause:!document.getElementById('pause').hidden,state:__g.state,line:(document.querySelector('#pause p.dim')||{}).textContent,retry:!document.getElementById('hzretry').hidden})));
await pg.evaluate(()=>__g.hzPause(false));await W(600);
console.log('resumed',await pg.evaluate(()=>({pause:!document.getElementById('pause').hidden,state:__g.state,t:__g.HZ.fac.t.toFixed(2)})));
t0=Date.now();await pg.evaluate(()=>__g.hzQuit(true));
while(Date.now()-t0<60000){if(await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading&&H.fac&&H.fac.post);}))break;await W(200);}
console.log('retry rebuilt in',(Date.now()-t0)/1000,'s','halo',await pg.evaluate(()=>!!__g.HZ.fac.halo),'zone',await pg.evaluate(()=>__g.HZ.fac.zone));
await W(1000);await pg.evaluate(()=>__g.hzQuit(false));await W(800);
console.log('quit',await pg.evaluate(()=>({state:__g.state,title:!document.getElementById('title').hidden,HZ:!!__g.HZ,FACW:!!__g.FACW})));
/* hide & seek */
await pg.evaluate(()=>{__g.horStart('hide');});t0=Date.now();while(Date.now()-t0<90000){if(await pg.evaluate(()=>{const H=__g.HZ;return !!(H&&!H.loading);}))break;await W(300);}
await W(1500);console.log('hide',await pg.evaluate(()=>({state:__g.state,mode:__g.HZ.mode})));await pg.evaluate(()=>__g.hzQuit(false));await W(800);
/* climb */
await pg.evaluate(()=>{try{window.__mmGo('climb')}catch(e){}});for(const id of['start','begin','begin','rollskip']){await pg.evaluate(id=>{const e=document.getElementById(id);if(e&&e.offsetParent)e.click();},id);await W(1300);}
await W(1500);console.log('climb',await pg.evaluate(()=>({state:__g.state,floor:__g.P.floor})));
console.log('errors',errs.slice(0,10));await bro.close();srv.close();})();
