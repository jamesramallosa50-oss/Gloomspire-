import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m13.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
rep("  try{addChandeliers();}catch(e){}","  try{addChandeliers();}catch(e){}\n  try{dungeonDressing();}catch(e){console.warn('dressing',e);}")
rep("const cut=torches.length>tLN?torches[tLN].d:99;","const TLs=torches.some(q=>q.dim)?torches.filter(q=>!q.dim):torches,cut=TLs.length>tLN?TLs[tLN].d:99;")
rep("for(let i=0;i<6;i++){const l=tLights[i],t=torches[i];","for(let i=0;i<6;i++){const l=tLights[i],t=TLs[i];")
open(p,'w',encoding='utf-8').write(s);print('p14 ok')
