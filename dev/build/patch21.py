import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
mod=open('/home/claude/tools/m18.js',encoding='utf-8').read()
rep("/* ===== DUNGEON PACK:",mod+"\n/* ===== DUNGEON PACK:")
# sealed and exit doors: count the living guardians directly; open when none are left, otherwise light them up and free any stuck ones
rep("      if(d.type==='secret'){}\n","      if(d.type==='secret'){}\n      else if((d.type==='seal'||d.type==='exit')&&d.req>=0&&!PVP.on&&guardCheck(d)){openDoor(d);sfx('seal');if(d.type==='exit')banner('THE WAY UP IS OPEN','Find the heavy door',2400);else msg('A blood seal breaks. A door grinds open.','gold');}\n")
open(p,'w',encoding='utf-8').write(s);print('p21 ok')
