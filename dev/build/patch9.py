import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:100]);s=s.replace(a,b)
mod=open('/home/claude/tools/m9.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# numbers on the health and mana bars sit above the fill
rep('#game.glgrade #vgn { display: none !important; }','#game.glgrade #vgn { display: none !important; } .vb em,.bar em{z-index:3!important}')
# Last Gate + Haste opens the floor / teammate picker
rep("function openAllyOrFloorGate(){","function openAllyOrFloorGate(){if(!PVP.on){openGatePick();return;}")
# version check so both players build the same floors
rep("const seedMsg=()=>({t:'seed',seed:MP.seed,","const seedMsg=()=>({t:'seed',v:GSV,seed:MP.seed,")
rep("if(o.t==='seed'){","if(o.t==='seed'){if(o.v!==GSV){try{mpStat('The host runs a different version of the game ('+(o.v||'older')+' here vs '+GSV+'). Both of you refresh the page so your floors match.');msg('You and the host have different game versions, so your floors will not match. Both refresh the page.','bad','ver');}catch(e){}}")
# harder: big rooms hold more monsters, and more of them are elite
rep("let budget=(2.7+f*.6+rnd(1.2))*DF().pack;if(r.idx===L.special)budget*=1.5;if(r.idx===L.exit)budget*=1.35;if(r.leaf&&!r.onPath)budget*=1.2;",
    "let budget=(3.2+f*.7+rnd(1.2))*DF().pack;if(r.idx===L.special)budget*=1.5;if(r.idx===L.exit)budget*=1.35;if(r.leaf&&!r.onPath)budget*=1.2;{const ar=(r.x1-r.x0+1)*(r.y1-r.y0+1);budget*=clamp(ar/60,1,2.1);}")
rep("while(budget>.5&&n<7)","while(budget>.5&&n<11)")
rep("elite:Math.random()<(r.idx===L.special?.5:Math.min(.22,.04+.02*f)*DF().elite)","elite:Math.random()<(r.idx===L.special?.5:Math.min(.32,.08+.025*f)*DF().elite)")
# the dais and its steps become dungeon stonework (dark blocks, iron trim, candles) instead of the parkour block look
rep("if(p.kind&&p.kind!=='dais'&&p.kind!=='step')continue;","if(p.kind)continue;")
rep("const ps=L.plats.filter(p=>p.kind==='crate'||p.kind==='barrel'||p.kind==='fence');","const ps=L.plats.filter(p=>p.kind);")
rep("    else if(p.kind==='fence'){","""    else if(p.kind==='dais'){/* a ritual dais: dark stone courses, an iron-trimmed top, corner posts with candles and a few skulls */
      box(cx,y0+h*.3,cz,w,h*.6,d,0x4a4640);box(cx,y0+h*.8,cz,w-.12,h*.4,d-.12,0x5a554c);box(cx,y0+h+.005,cz,w-.3,.03,d-.3,0x6a6458);
      for(const sx of[-1,1]){box(cx+sx*(w/2-.04),y0+h+.02,cz,.1,.07,d-.1,0x3a3a42);}for(const sz of[-1,1]){box(cx,y0+h+.02,cz+sz*(d/2-.04),w-.3,.06,.1,0x3a3a42);}
      for(const sx of[-1,1])for(const sz of[-1,1]){const px=cx+sx*(w/2-.25),pz=cz+sz*(d/2-.25);box(px,y0+h+.3,pz,.3,.6,.3,0x3e3a34);box(px,y0+h+.66,pz,.12,.14,.12,0xe8dcc0);box(px,y0+h+.78,pz,.05,.1,.05,0xffc060);}
      for(let k=0;k<3;k++){const ox=(k-1)*.35,oz=d/2-.5;box(cx+ox,y0+h+.1,cz+oz,.22,.2,.24,0xd8d0b8);box(cx+ox,y0+h+.08,cz+oz+.1,.12,.06,.04,0x2a2622);}}
    else if(p.kind==='step'){box(cx,y0+h/2,cz,w,h,d,0x4e4a44);box(cx,y0+h+.005,cz,w-.08,.03,d-.08,0x625c52);}
    else if(p.kind==='fence'){""")
open(p,'w',encoding='utf-8').write(s);print('p9 ok')
