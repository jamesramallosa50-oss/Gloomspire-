import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m21.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# Horror mode runs inside the main frame loop with its own scene
rep("  }else if(state==='cut'){","  }else if(state==='horror'){try{horTick(dt);}catch(e){console.warn('horror',e);}\n  }else if(state==='cut'){")
rep("  else if(state==='ending'&&endingScene){","  else if(state==='horror'&&HZ&&HZ.scene){renderer.render(HZ.scene,cam);}\n  else if(state==='ending'&&endingScene){")
open(p,'w').write(s);print('p23 ok')
