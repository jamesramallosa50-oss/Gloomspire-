import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:100]);s=s.replace(a,b)
mod=open('/home/claude/tools/m10.js',encoding='utf-8').read()
for f in ['bWarlord','bQueen','bAshmaw','bLich','bOoze','bKnight','bMatriarch','bChoir','bColossus','bBell']:
    rep("function "+f+"(M){","function "+f+"_old(M){")
rep("  g.rotation.set(lean,e.face+(e.awake?0:Math.sin(time*.6+ph)*.45),roll);\n}","  g.rotation.set(lean,e.face+(e.awake?0:Math.sin(time*.6+ph)*.45),roll);\n  if(e.boss&&M.b2)try{boss2Anim(e,dt,moving);}catch(_){}\n}")
rep("e.hp-=dmg;e.flash=.1;","if(e.boss&&e.b2arm!=null&&e.b2arm<1)dmg=Math.max(1,Math.round(dmg*e.b2arm));e.hp-=dmg;e.flash=.1;")
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
open(p,'w',encoding='utf-8').write(s);print('p10 ok')
