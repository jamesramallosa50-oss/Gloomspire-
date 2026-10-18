import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m17.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
rep("""const ATLAS=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  TILES.forEach((fn,i)=>tileCanvas(hiTile(fn,i),64,(i&3)*64,(i>>2)*64,g));
  tileCanvas(PLAT_TOP,64,128,192,g);tileCanvas(PLAT_SIDE,64,192,192,g);return nearest(new T.CanvasTexture(c));})();""","const ATLAS=dtAtlas();")
open(p,'w').write(s);print('p20 ok')
