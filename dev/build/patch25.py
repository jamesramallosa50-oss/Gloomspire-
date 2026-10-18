import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
# 3.15: The Facility (Horror): plan and builder, textures and shaders, systems, gameplay
mod=''.join(open('/home/claude/tools/'+f,encoding='utf-8').read()+'\n' for f in ['m22.js','m23.js','m24.js','m25.js'])
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# the facility draws its own picture: smooth upscaling and no extra colour filter on the canvas
rep("#view{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;display:block;image-rendering:pixelated;image-rendering:crisp-edges}",
    "#view{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;display:block;image-rendering:pixelated;image-rendering:crisp-edges}#view.hzfac{image-rendering:auto!important;filter:none!important}")
open(p,'w',encoding='utf-8').write(s);print('p25 ok')
