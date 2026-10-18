/* ===== BUILD 3.6: sound. Music stops when you leave the game, new music, more sound effects ===== */
/* 1. Sleep and wake. When the tab is hidden, the phone goes home, the app is switched or the window loses focus,
      every audio context is suspended, so nothing plays in the background. It wakes when you come back. */
function audioWatch(){
  if(window.__awOn)return;window.__awOn=1;
  const all=()=>{const a=(window.__ACS||[]).slice();if(AC&&a.indexOf(AC)<0)a.push(AC);return a;};
  const sleep=()=>{for(const c of all())try{if(c.state==='running')c.suspend();}catch(_){}};
  const wake=()=>{if(document.hidden)return;for(const c of all())try{if(c.state==='suspended')c.resume();}catch(_){}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)sleep();else wake();});
  addEventListener('pagehide',sleep);addEventListener('blur',sleep);
  document.addEventListener('freeze',sleep);document.addEventListener('resume',wake);
  addEventListener('focus',wake);addEventListener('pageshow',wake);
  addEventListener('pointerdown',wake,{passive:true});addEventListener('keydown',wake);
  if(document.hidden)sleep();
}
/* 2. The old engine had a constant 55 Hz hum under everything. It is now a soft, slowly breathing cave air. */
function mzAir(){
  if(!nbuf){nbuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain();
  s.buffer=nbuf;s.loop=true;f.type='lowpass';f.frequency.value=260;f.Q.value=.7;g.gain.value=.022;
  lfo.frequency.value=.07;lg.gain.value=120;lfo.connect(lg);lg.connect(f.frequency);
  s.connect(f);f.connect(g);g.connect(master);s.start();lfo.start();MUS.air=g;
}
/* an echo bus, so notes ring out like they would in a stone hall */
function mzInit(){
  if(MUS.wet||!AC)return;
  const inp=AC.createGain(),d1=AC.createDelay(1.5),d2=AC.createDelay(1.5),fb=AC.createGain(),lp=AC.createBiquadFilter();
  inp.gain.value=.3;d1.delayTime.value=.43;d2.delayTime.value=.61;fb.gain.value=.4;lp.type='lowpass';lp.frequency.value=1500;
  inp.connect(d1);inp.connect(d2);d1.connect(lp);d2.connect(lp);lp.connect(fb);fb.connect(d1);lp.connect(MUS.gain);MUS.wet=inp;
  sfxMore();
}
/* 3. New music. Instead of four fixed bars on repeat, each track is a set of chord progressions, rhythms and
      melody shapes. Every few bars it picks a new progression and writes a new melody, so it never loops the same way. */
function mzTracks(){
  if(MUS.T2)return MUS.T2;
  const m=0,M=1;
  MUS.T2={
    title:{gen:1,bpm:56,root:38,sc:[0,2,3,5,7,8,10],mel:74,
      progs:[[[0,m],[8,M],[3,M],[10,M]],[[0,m],[5,m],[8,M],[7,m]],[[0,m],[1,M],[0,m],[10,M]],[[8,M],[10,M],[0,m],[0,m]]],
      padW:'triangle',pad:.026,padCut:760,bass:.12,bellP:.45,choir:.3,melP:.4,lw:'sine',lv:.05,la:.09,ld:3.2},
    explore:{gen:1,bpm:66,root:38,sc:[0,2,3,5,7,8,10],mel:62,
      progs:[[[0,m],[8,M],[5,m],[7,m]],[[0,m],[10,M],[8,M],[7,M]],[[0,m],[5,m],[8,M],[10,M]],[[0,m],[1,M],[0,m],[7,m]],[[5,m],[8,M],[0,m],[7,M]],[[0,m],[3,M],[10,M],[5,m]]],
      padW:'sawtooth',pad:.017,padCut:520,bass:.14,bellP:.2,choir:.22,melP:.5,lw:'triangle',lv:.05,la:.03,ld:2.4,
      arpP:.45,arpW:'triangle',arpV:.03,drip:.018,beat:{p:.3,pat:['k.....k.........','k...............']}},
    camp:{gen:1,bpm:78,root:41,sc:[0,2,4,5,7,9,11],mel:72,
      progs:[[[0,M],[7,M],[9,m],[5,M]],[[0,M],[5,M],[2,m],[7,M]],[[9,m],[5,M],[0,M],[7,M]],[[0,M],[4,m],[5,M],[7,M]]],
      padW:'triangle',pad:.014,padCut:900,bass:.11,bellP:.12,choir:.1,melP:.55,lw:'triangle',lv:.045,la:.03,ld:1.8,
      arpP:1,arpW:'triangle',arpV:.045},
    meadow:{gen:1,bpm:84,root:38,sc:[0,2,4,6,7,9,11],mel:74,
      progs:[[[0,M],[7,M],[9,m],[5,M]],[[5,M],[7,M],[4,m],[9,m]],[[0,M],[2,M],[7,M],[0,M]],[[9,m],[7,M],[5,M],[7,M]]],
      padW:'triangle',pad:.016,padCut:1200,bass:.1,bellP:.3,choir:.15,melP:.6,lw:'sine',lv:.055,la:.04,ld:1.6,
      arpP:1,arpW:'triangle',arpV:.04},
    combat:{gen:1,bpm:128,root:38,sc:[0,2,3,5,7,8,10],mel:62,
      progs:[[[0,m],[1,M],[0,m],[7,M]],[[0,m],[8,M],[10,M],[7,M]],[[5,m],[1,M],[0,m],[7,M]],[[0,m],[3,M],[1,M],[0,m]]],
      padW:'sawtooth',pad:.012,padCut:700,bass:0,bellP:.1,choir:.35,melP:.55,lw:'sawtooth',lv:.035,la:.02,ld:1.4,lcut:1700,
      ost:['x.x.x.x.x.x.x.x.','x.xx.x.xx.x.x.xx','x..x..x.x..x..x.','x.x.xx.xx.x.x.x.'],ostV:.08,
      drums:['k...s..kk...s...','k..k..s.k.k.s..h','b...s...b.k.s..t','k.h.s.h.k.k.s.hh'],fill:'k.k.s.s.ttt.ssss'},
    boss:{gen:1,bpm:146,root:38,sc:[0,1,3,5,6,8,10],mel:62,
      progs:[[[0,m],[1,M],[6,M],[0,m]],[[0,m],[8,M],[1,M],[7,M]],[[0,m],[3,M],[6,M],[7,M]],[[0,m],[1,M],[0,m],[1,M]]],
      padW:'sawtooth',pad:.014,padCut:800,bass:0,bellP:1,choir:.6,melP:.6,lw:'sawtooth',lv:.04,la:.02,ld:1.2,lcut:1900,
      ost:['xxx.xx.xxxx.x.xx','x.xxx.xxx.xxx.xx','xx.xx.xx.xx.x.x.'],ostV:.075,
      drums:['b..ks.kbk.bks.ss','b.k.s.kkb.k.s.tt','bk.ks.kbbk.ks.st'],fill:'bbs.bbs.ttttssss'}
  };
  return MUS.T2;
}
function mzTrk(k){const T2=mzTracks();return T2[k]||T2.explore;}
function mzV(w,f,t,a,d,v,cut,wet,det){
  const o=AC.createOscillator(),g=AC.createGain(),fl=AC.createBiquadFilter();o.type=w;o.frequency.value=f;if(det)o.detune.value=det;
  fl.type='lowpass';fl.frequency.value=cut;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(a+.02,d));
  o.connect(fl);fl.connect(g);g.connect(MUS.gain);if(wet&&MUS.wet)g.connect(MUS.wet);o.start(t);o.stop(t+d+.05);
}
function mzDrum(k,t){
  if(k==='k'||k==='s'||k==='h'){mDrum(k,t);return;}
  const o=AC.createOscillator(),g=AC.createGain(),big=k==='b';
  o.frequency.setValueAtTime(big?72:190,t);o.frequency.exponentialRampToValueAtTime(big?38:88,t+(big?.45:.24));
  g.gain.setValueAtTime(big?.36:.2,t);g.gain.exponentialRampToValueAtTime(.001,t+(big?.55:.28));o.connect(g);g.connect(MUS.gain);if(MUS.wet&&big)g.connect(MUS.wet);o.start(t);o.stop(t+.6);
  if(big){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),q=AC.createGain();s.buffer=nbuf;f.type='lowpass';f.frequency.value=260;q.gain.setValueAtTime(.12,t);q.gain.exponentialRampToValueAtTime(.001,t+.3);s.connect(f);f.connect(q);q.connect(MUS.gain);s.start(t,Math.random()*.5);s.stop(t+.35);}
}
function mzNote(T_,deg){const s=T_.sc,o=Math.floor(deg/7),i=((deg%7)+7)%7;return T_.mel+12*o+s[i];}
function mzStep(T_,st,t){
  if(!T_.gen){musStep(T_,st,t);return;}
  if(!MUS.wet)mzInit();
  const G=MUS.g||(MUS.g={}),i=st&15,sl=60/T_.bpm/4,bd=sl*16;
  if(G.k!==MUS.trk){G.k=MUS.trk;G.prog=null;G.ph=[];G.rest=0;G.n=0;G.ch=null;}
  if(i===0){
    if(!G.prog||G.pi>=G.prog.length){let p,tries=0;do{p=pick(T_.progs);}while(p===G.last&&tries++<6);G.last=p;G.prog=p;G.pi=0;G.arp=ri(0,3);G.ost=T_.ost?pick(T_.ost):null;}
    G.ch=G.prog[G.pi++];G.n++;const last=G.pi===G.prog.length;
    const r=T_.root+G.ch[0],tri=G.ch[1]?[0,4,7]:[0,3,7];G.tri=tri;G.r=r;
    /* pad: a slow swell, voiced close and detuned for width */
    if(T_.pad)for(let k=0;k<3;k++){let n=r+12+tri[k];if(n>T_.root+22)n-=12;mzV(T_.padW,mtof(n),t,bd*.32,bd*1.12,T_.pad,T_.padCut,1,-6);mzV(T_.padW,mtof(n),t,bd*.32,bd*1.12,T_.pad*.8,T_.padCut,0,7);}
    if(T_.bass)mzV('sine',mtof(r),t,.03,bd*.95,T_.bass,320);
    if(T_.choir&&Math.random()<T_.choir){for(const k of[1,2])mzV('sine',mtof(r+24+tri[k]),t+sl*2,bd*.4,bd*1.1,.02,3000,1,k*4);}
    if(T_.bellP&&Math.random()<T_.bellP){const n=r+36+pick(tri);for(const [mm,v] of[[1,.07],[2.76,.022],[5.4,.01]])mzV('sine',mtof(n)*mm,t+sl*ri(0,8),.005,3.2,v,6000,1);}
    /* a melody: a short phrase that wanders the scale from a chord tone, then rests */
    G.ph=[];
    if(G.rest>0)G.rest--;
    else if(Math.random()<T_.melP){
      const sc=T_.sc,root=((G.ch[0]%12)+12)%12;let d=0;for(let q=0;q<7;q++)if(sc[q]===root){d=q;break;}d+=pick([0,2,4]);if(Math.random()<.5)d-=7;
      const len=ri(3,7),slots=[];const grid=T_.bpm>110?2:pick([2,2,4,3]);for(let s=ri(0,2)*2;s<16&&slots.length<len;s+=grid*(Math.random()<.25?2:1))slots.push(s);
      for(let q=0;q<slots.length;q++){G.ph.push({s:slots[q],n:mzNote(T_,d),d:(slots[q+1]!=null?slots[q+1]-slots[q]:4)});d+=pick([-2,-1,-1,1,1,2,0,3,-3]);if(d>9)d-=3;if(d<-6)d+=3;}
      if(Math.random()<.4)G.rest=ri(1,2);
    }
    /* drums: a pattern per bar, a fill at the end of the progression */
    G.dr=null;
    if(T_.drums)G.dr=last&&T_.fill&&Math.random()<.7?T_.fill:pick(T_.drums);
    else if(T_.beat&&Math.random()<T_.beat.p)G.dr=pick(T_.beat.pat);
  }
  if(!G.ch)return;
  const r=G.r,tri=G.tri;
  if(T_.arpP&&(G.n&1||Math.random()<T_.arpP)){
    const A=[[0,-1,1,-1,2,-1,1,-1,3,-1,2,-1,1,-1,2,-1],[0,-1,-1,1,-1,-1,2,-1,3,-1,-1,2,-1,-1,1,-1],[0,1,2,-1,3,-1,2,-1,0,1,2,-1,3,-1,1,-1],[0,-1,2,-1,1,-1,3,-1,0,-1,2,-1,1,-1,2,-1]][G.arp||0];
    const a=A[i];if(a>=0){const n=r+12+(a===3?12:tri[a]);mzV(T_.arpW,mtof(n),t,.004,sl*3.2,T_.arpV,2400,1);}
  }
  if(G.ost&&G.ost[i]==='x'){const up=(i===14&&Math.random()<.4)?12:0;mzV('sawtooth',mtof(r-12+up),t,.004,sl*1.6,T_.ostV,640+Math.random()*200,0);}
  for(const q of G.ph)if(q.s===i)mzV(T_.lw,mtof(q.n),t,T_.la,Math.min(T_.ld,sl*q.d*1.6),T_.lv,T_.lcut||2600,1);
  if(G.dr&&G.dr[i]!=='.')mzDrum(G.dr[i],t);
  if(T_.drip&&Math.random()<T_.drip)mzV('sine',mtof(pick([86,89,91,93,98])),t,.002,.5,.03,8000,1);
}

/* 4. More sound effects */
function sfxPan(fn,pan){/* play a sound through a stereo panner (for ambience) */
  if(!AC||muted||!AC.createStereoPanner){fn(master);return;}
  const p=AC.createStereoPanner();p.pan.value=pan;p.connect(master);fn(p);setTimeout(()=>{try{p.disconnect();}catch(_){}},6000);
}
function sfxT(out,f0,f1,dur,type,vol,delay){const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.03);}
function sfxN(out,dur,vol,fq,type,delay,q){const t=AC.currentTime+(delay||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=nbuf;s.loop=true;f.type=type||'lowpass';f.frequency.value=fq;if(q)f.Q.value=q;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+dur+.03);}
function sfxMore(){
  if(SFX.step)return;
  if(!nbuf){nbuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  Object.assign(SFX,{
    step(){if(!AC||muted)return;const g=OPEN;sfxN(master,.07,g?.05:.07,g?1800:520+Math.random()*260,g?'bandpass':'lowpass');sfxT(master,g?140:95+Math.random()*25,50,.07,'sine',g?.03:.07);},
    land(){if(!AC||muted)return;sfxN(master,.16,.16,300);sfxT(master,110,40,.16,'sine',.2);},
    jump(){if(!AC||muted)return;sfxN(master,.18,.06,1400,'bandpass',0,.8);},
    coin(){if(!AC||muted)return;sfxT(master,1800,1800,.09,'square',.035);sfxT(master,2400,2400,.16,'square',.03,.06);},
    heart(){if(!AC||muted)return;sfxT(master,70,45,.12,'sine',.22);sfxT(master,64,40,.14,'sine',.16,.18);},
    ui(){if(!AC||muted)return;sfxT(master,520,380,.05,'triangle',.05);},
    chest(){if(!AC||muted)return;sfxN(master,.5,.08,600,'bandpass',0,4);sfxT(master,180,240,.45,'sawtooth',.03);sfxT(master,1500,1500,.08,'square',.03,.4);sfxT(master,2000,2000,.12,'square',.03,.48);},
    portal(){if(!AC||muted)return;sfxT(master,110,880,3,'sine',.12);sfxT(master,165,1320,3,'triangle',.06,.2);sfxN(master,3,.06,2400,'bandpass',0,2);},
    drip(p){sfxPan(o=>{const f=900+Math.random()*900;sfxT(o,f,f*1.9,.06,'sine',.06);sfxT(o,f*.5,f*.9,.12,'sine',.02,.05);},p||0);},
    chain(p){sfxPan(o=>{for(let i=0;i<4;i++){sfxN(o,.05,.05,3500+Math.random()*1500,'bandpass',i*.07+Math.random()*.03,6);sfxT(o,1900+Math.random()*600,1500,.05,'square',.008,i*.07);}},p||0);},
    wind(p){sfxPan(o=>{sfxN(o,3.2,.05,420,'bandpass',0,1.5);},p||0);},
    moan(p){sfxPan(o=>{const f=110+Math.random()*60;sfxT(o,f,f*.7,2.4,'sawtooth',.012);sfxT(o,f*1.5,f*1.02,2.4,'sine',.02);},p||0);},
    creak(p){sfxPan(o=>{const f=180+Math.random()*120;sfxT(o,f,f*1.6,.5,'sawtooth',.012);sfxT(o,f*1.6,f*1.2,.4,'sawtooth',.01,.5);},p||0);},
    rumble(p){sfxPan(o=>{sfxN(o,2.2,.09,90);},p||0);},
    bird(p){sfxPan(o=>{const f=2600+Math.random()*1400,n=ri(2,5);for(let i=0;i<n;i++){sfxT(o,f,f*(1.2+Math.random()*.4),.07,'sine',.03,i*.12);sfxT(o,f*1.3,f,.06,'sine',.02,i*.12+.06);}},p||0);},
    breeze(p){sfxPan(o=>{sfxN(o,4,.03,900,'bandpass',0,.6);},p||0);}
  });
}
/* a small per-frame watcher: jump and landing sounds, coin sounds, a heartbeat when low on health, and a living dungeon around you */
function sndTick(dt){
  if(!AC||muted||state!=='play')return;
  const S=sndTick.s||(sndTick.s={air:false,vy:0,gold:P.gold,ct:0,hb:0,amb:3});
  const air=P.y>.12;
  if(!S.air&&air&&P.vy>2)sfx('jump');
  if(S.air&&!air&&S.vy<-7)sfx('land');
  S.air=air;S.vy=P.vy;
  S.ct-=dt;if(P.gold>S.gold&&S.ct<=0){sfx('coin');S.ct=.12;}S.gold=P.gold;
  if(P.hp>0&&P.hp<P.maxHp*.25&&!OPEN){S.hb-=dt;if(S.hb<=0){S.hb=P.hp<P.maxHp*.12?.62:.9;sfx('heart');}}
  S.amb-=dt;
  if(S.amb<=0){
    const pan=Math.random()*1.6-.8;
    if(OPEN){S.amb=1.5+Math.random()*3;try{SFX[Math.random()<.75?'bird':'breeze'](pan);}catch(_){}}
    else{S.amb=4+Math.random()*6;const k=pick(['drip','drip','drip','chain','wind','creak','moan','rumble']);try{SFX[k](pan);}catch(_){}}
  }
}
function uiClickSnd(){document.addEventListener('click',e=>{try{if(e.target&&e.target.closest&&e.target.closest('button,.mmb,.card'))sfx('ui');}catch(_){}},true);}
