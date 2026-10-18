import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:100]);s=s.replace(a,b)
mod=open('/home/claude/tools/m8.js',encoding='utf-8').read()
rep("function fx2Tick(dt){",mod+"\nfunction fx2Tick(dt){")

# ---- cover blocks get dungeon props instead of plain stone ----
rep("  if(L.plats)for(const p of L.plats){","  if(L.plats)for(const p of L.plats){if(p.kind&&p.kind!=='dais'&&p.kind!=='step')continue;")
rep("const lm=new T.Mesh(lg,levelMat);lm.userData.own=1;lvl.add(lm);","const lm=new T.Mesh(lg,levelMat);lm.userData.own=1;lvl.add(lm);try{buildCoverProps();}catch(e){}")

# ---- default touch layout (from the player's own layout) + addable SCOPE button ----
rep('''  tpause:{x:.029,y:.370,s:1},
  tbag:{x:.077,y:.370,s:1},
  troll:{x:.204,y:.423,s:1.9},
  stick:{x:.115,y:.665,s:1},
  tloadout:{x:.395,y:.70,s:.9},
  tspells:{x:.545,y:.70,s:1},
  tswap:{x:.838,y:.488,s:1.15},
  tskill:{x:.900,y:.325,s:1.15},
  tfire:{x:.885,y:.655,s:1.4},
  ttalk:{x:.499,y:.730,s:.9},
  tchat:{x:.90,y:.22,s:1.7}
};''','''  tpause:{x:.029,y:.369,s:1},
  tbag:{x:.084,y:.365,s:1},
  troll:{x:.204,y:.422,s:1.9},
  stick:{x:.114,y:.665,s:1},
  tloadout:{x:.4585,y:.771,s:.7},
  tspells:{x:.5925,y:.771,s:1},
  tswap:{x:.826,y:.534,s:1.25},
  tskill:{x:.935,y:.525,s:1.25},
  tjump:{x:.7625,y:.693,s:1.4},
  tfire:{x:.8825,y:.734,s:1.25},
  ttalk:{x:.491,y:.598,s:1},
  tchat:{x:.75,y:.404,s:1.7}
};''')
rep("if(meta.touchLayoutVersion===10){meta.ctl=meta.ctl||{};for(const k of['stick','tloadout','tspells','tfire'])meta.ctl[k]=JSON.parse(JSON.stringify(DEFAULT_TOUCH_LAYOUT[k]));meta.touchLayoutVersion=11;}",
    "if((meta.touchLayoutVersion||0)<12){meta.ctl=meta.ctl||{};for(const k in DEFAULT_TOUCH_LAYOUT)meta.ctl[k]=JSON.parse(JSON.stringify(DEFAULT_TOUCH_LAYOUT[k]));meta.touchLayoutVersion=12;}")
rep("tfire2:'FIRE 2',tjump2:'JUMP 2',troll2:'SLIDE 2',tswap2:'SWAP 2',tskill2:'SKILL 2'};","tfire2:'FIRE 2',tjump2:'JUMP 2',troll2:'SLIDE 2',tswap2:'SWAP 2',tskill2:'SKILL 2',tscope:'SCOPE'};")
rep("const XTRA={tfire2:{x:.78,y:.64,s:1.3},","const XTRA={tscope:{x:.70,y:.48,s:1.2},tfire2:{x:.78,y:.64,s:1.3},")
# the scope button (and a controller Scope bind) scope while held; you still fire with FIRE
rep("pa=padAds&&state==='play'&&P.hand==='gun'&&!!P.gun;","pa=(padAds||TSC.on)&&state==='play'&&P.hand==='gun'&&!!P.gun;")
rep("if((snp?fH:(P.ads>.4||fH))&&P.fireCd<=0&&P.roll<=0)fireWeapon();","if(((snp||TSC.on)?fH:(P.ads>.4||fH))&&P.fireCd<=0&&P.roll<=0)fireWeapon();")

# ---- controller binds ----
rep("const hit=i=>b(i)&&!pad.prev[i],dz=v=>Math.abs(v)<.16?0:(v-Math.sign(v)*.16)/.84;",
    "const hit=i=>b(i)&&!pad.prev[i],dz=v=>Math.abs(v)<.16?0:(v-Math.sign(v)*.16)/.84;\n  if(PBW){for(let i=0;i<16;i++)if(hit(i)&&pbTake(i))break;pad.prev=Array.from({length:17},(x,i)=>b(i));return;}")
rep("padFire=b(7);padAds=false;if(hit(6)&&P.sel)cast(P.sel);if(hit(15))cycleWeapon();if(Math.hypot(lx,ly)<.3)padRun=false;else if(hit(10))padRun=!padRun;",
    "padFire=PBb(b,'fire');padAds=PBb(b,'scope');if(PBh(hit,'cast')&&P.sel)cast(P.sel);if(PBh(hit,'swap'))cycleWeapon();if(Math.hypot(lx,ly)<.3)padRun=false;else if(PBh(hit,'run'))padRun=!padRun;")
rep("if(hit(4))cycleSpell(-1);if(hit(5))cycleSpell(1);if(hit(11)&&talkTo)openShop(talkTo);if(ARM.prac&&hit(11))pracGo();",
    "if(PBh(hit,'prev'))cycleSpell(-1);if(PBh(hit,'next'))cycleSpell(1);if(PBh(hit,'talk')&&talkTo)openShop(talkTo);if(ARM.prac&&PBh(hit,'talk'))pracGo();")
rep("if(hit(0))tryRoll();if(hit(2))tryJump();if(hit(1)){activateCharSkill();}if(hit(3)){if(talkTo)openShop(talkTo);else cycleLoadout();}",
    "if(PBh(hit,'slide'))tryRoll();if(PBh(hit,'jump'))tryJump();if(PBh(hit,'skill')){activateCharSkill();}if(PBh(hit,'loadout')){if(talkTo)openShop(talkTo);else cycleLoadout();}")
rep("for(let k=0;k<3;k++)if(hit(12+k)&&meta.bar[k]){P.sel=meta.bar[k];cast(P.sel);}","for(let k=0;k<3;k++)if(PBh(hit,'s'+(k+1))&&meta.bar[k]){P.sel=meta.bar[k];cast(P.sel);}")
rep("if(hit(9))pause();else if(hit(8))openInv();","if(PBh(hit,'pause'))pause();else if(PBh(hit,'book'))openInv();")
rep("$('padmapb').addEventListener('click',()=>{meta.padmap=PMO[(PMO.indexOf(meta.padmap||'auto')+1)%PMO.length];pad.lay=null;pad.prev=[];save();",
    "$('padmapb').addEventListener('click',()=>{openPadBind();});(()=>{")
rep("function padMapUi(){const e=$('padmapb');if(e)e.textContent='Controller layout: '+PML[meta.padmap||'auto'];}","function padMapUi(){const e=$('padmapb');if(e){e.textContent='Controller buttons';e.hidden=false;}}")
rep("$('padmapb').hidden=true;","")

# ---- a new climb starts fresh: level 1 and the climber's own spells. PvP has its own spells. ----
rep("CH=CHARS.find(c=>c.id===meta.char)||CHARS[0];if(CH.id==='king')applyKingDefaultLoadout();fixBar();",
    "CH=CHARS.find(c=>c.id===meta.char)||CHARS[0];if(meta.climbBar){meta.bar=meta.climbBar;if(meta.climbLo&&meta.climbLo.length)meta.loadouts=meta.climbLo;meta.climbBar=null;meta.climbLo=null;}if(!R){meta.sk={};meta.bar=Array(9).fill(null);meta.loadouts=[0,1,2].map(()=>Array(9).fill(null));meta.loadout=0;}if(CH.id==='king')applyKingDefaultLoadout();fixBar();")
rep("P.floor=1;P.lvl=meta.tapLv||1;meta.lv10=meta.lv20=null;","P.floor=1;P.lvl=meta.tapLv||1;if(!R&&meta.tapLv){meta.tapLv=0;save();}meta.lv10=meta.lv20=null;")
rep("CH=pvBalance(CHARS.find(c=>c.id===meta.char)||CHARS[0]);fixBar();",
    "CH=pvBalance(CHARS.find(c=>c.id===meta.char)||CHARS[0]);if(!meta.climbBar){meta.climbBar=meta.bar.slice();meta.climbLo=JSON.parse(JSON.stringify(meta.loadouts||[]));}meta.bar=Array(9).fill(null);fixBar();")
rep("(pvSp().includes(id)?2:meta.sk[id]?1:0)","(pvSp().includes(id)?2:0)")
rep("try{pvBotsClear();}catch(er){}PVP.on=false;","try{pvBotsClear();}catch(er){}PVP.on=false;if(meta.climbBar){meta.bar=meta.climbBar;if(meta.climbLo&&meta.climbLo.length)meta.loadouts=meta.climbLo;meta.climbBar=null;meta.climbLo=null;save();}")
rep("Skills you learn on the lifts are yours forever. Levels are not.","Every climb starts fresh: level 1 and your climber\\'s own spells.")

# ---- aim assist: short range from the hip, long range while scoped; scoped shots fly farther ----
rep("if(hd>26||hd<.9)continue;","if(hd>((P.ads||0)>.5||P.scoped?34:11)||hd<.9)continue;")
rep("life:pel?.45:1.6,","life:(pel?.45:1.6)*((P.ads||0)>.5||P.scopeFire?1.9:1),")

# ---- ultimates: no more one-shot sweep of the room; cooldown by how strong each one is ----
rep("  try{ultFinish(X);}catch(e){}","  if(n===3)try{ultOpen(X);}catch(e){}")
rep("function ultFinish(X){","""/* the ultimate's opening: a flash, three shockwaves and a beam over you. Looks only: the ultimate's own effect does the work. */
function ultOpen(X){const hex=X.hex||0xffffff,hex2=X.hex2||hex,c=hex2c(hex),R=24;
  HSTOP=Math.max(HSTOP,.18);shake=Math.max(shake,.3);pillarFx(P.x,P.z,2.6,hex,.9,.5);pillarFx(P.x,P.z,1,0xffffff,.6,.75);sphereFx(P.x,1.4,P.z,1,9,hex,.45,.3);
  for(let w=0;w<3;w++)after(w*.14,()=>{if(state!=='play')return;ringFx(P.x,P.z,1,R*(.35+w*.2),w%2?hex2:0xffffff,.5,.1+w*.04);});
  for(let i=0;i<(fxLow()?14:28);i++){const an=Math.random()*6.283,rr=rnd(2,R*.5);spark(P.x+Math.cos(an)*rr,rnd(3,6),P.z+Math.sin(an)*rr,0,rnd(-6,-2),0,.6,i%2?c:[1,1,1],.4);}}
/* how long an ultimate or fusion locks its spells: stronger and wider ones wait longer, never 45 s */
function ultCdFor(ids){try{const Zr=fzResolve(ids)[1];if(!Zr)return 0;const n=ids.length,name=Zr[0],d=Zr[1]||'';
  const wide=/every enemy|everything you can see|everything in sight|all you can see|whole room|the room|everything near|every foe/i.test(d),
    self=/^(for [a-z ]+ seconds )?(you|your|every wound|every blow you|nothing that strikes|a (rank|shield|golden chalice))/i.test(d)&&!wide,
    kind=n===3&&typeof RWK!=='undefined'?RWK[name]:null;
  if(n===3)return kind==='multi'?30:wide?28:kind==='swarm'?24:kind==='echo'?22:self?14:20;
  return wide?15:self?8:11;}catch(e){return ids.length===3?20:11;}}
function ultFinish(X){""")
rep("big=util?0:(ids.length>=3?ULTCD3:ULTCD2)*(PVP.on?.6:1)*(1-.06*rk('cdr'));","big=util?0:ultCdFor(ids)*(PVP.on?.7:1)*(1-.06*rk('cdr'));")
open(p,'w',encoding='utf-8').write(s);print('p8 ok')
s=open(p,encoding='utf-8').read()
rep("'Highest floor cleared: '+meta.best+' · skill ranks kept: '+n+' · falls: '+meta.deaths","'Highest floor cleared: '+meta.best+' · falls: '+meta.deaths")
open(p,'w',encoding='utf-8').write(s);print('p8b ok')
