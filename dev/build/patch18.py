import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m16.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# the walls, floors and ceilings of a whole floor were one mesh drawn every frame; split into chunks the frustum and the wall culler can drop
rep("  const lm=new T.Mesh(lg,levelMat);lm.userData.own=1;lvl.add(lm);","  try{splitGeomChunks(lg,levelMat,9);}catch(e){const lm=new T.Mesh(lg,levelMat);lm.userData.own=1;lvl.add(lm);}")
rep("  try{secretTick(dt);dimTick(dt);}catch(e){}","  try{secretTick(dt);dimTick(dt);warmTick();}catch(e){}")
open(p,'w',encoding='utf-8').write(s);print('p18 ok')
