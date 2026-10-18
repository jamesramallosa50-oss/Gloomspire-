import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m14.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
rep("  try{dungeonDressing();}catch(e){console.warn('dressing',e);}","  try{dungeonDressing();}catch(e){console.warn('dressing',e);}\n  try{dungeonDressing2();}catch(e){console.warn('dressing2',e);}")
open(p,'w',encoding='utf-8').write(s);print('p15 ok')
