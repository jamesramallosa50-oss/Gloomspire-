import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
# depth precision: a near plane of .05 gave phones (16-bit depth) only ~3 cm of depth resolution at 10 m, so close surfaces flickered through each other
rep("const cam=new T.PerspectiveCamera(74,1,.05,90);","const cam=new T.PerspectiveCamera(74,1,.12,90);")
# camp: crate corner posts were the same size as the edge bars and fought with them
rep("for(const b of[-1,1])Q.b(.06,sz+.02,.06,WD2,a*sz/2,sz/2,b*sz/2,g);","for(const b of[-1,1])Q.b(.075,sz+.035,.075,WD2,a*sz/2,sz/2,b*sz/2,g);")
# camp: rug layers were half a millimetre apart
rep("Q.b(2.5,.015,2.7,0x4a1a1e,-side*.5,.01,0);Q.b(2.2,.016,2.4,0x6a2a22,-side*.5,.014,0);Q.b(1.4,.017,1.6,0x8a3a2a,-side*.5,.018,0);",
    "Q.b(2.5,.02,2.7,0x4a1a1e,-side*.5,.01,0);Q.b(2.2,.02,2.4,0x6a2a22,-side*.5,.03,0);Q.b(1.4,.02,1.6,0x8a3a2a,-side*.5,.05,0);")
# camp: table planks sat flush with the table top
rep("for(let i=-2;i<=2;i++)Q.b(.83,.075,.02,WD2,0,.82,i*.38);","for(let i=-2;i<=2;i++)Q.b(.84,.075,.025,WD2,0,.83,i*.38);")
# camp: the two lanterns hung on short chains in mid air; they now hang from the ceiling
rep("Q.cy(.008,.008,.5,IR,0,2.5,0,null,null,4);Q.cy(.07,.09,.04,IR,0,2.24,0,null,null,6);",
    "Q.cy(.014,.014,WALLH-2.26,IR,0,(WALLH+2.26)/2,0,null,null,4);Q.cy(.07,.09,.04,IR,0,2.24,0,null,null,6);Q.cy(.1,.1,.03,IR,0,WALLH-.02,0,null,null,6);")
rep("Q.cy(.008,.008,.6,IR,-.9,2.6,0,null,null,4);Q.cy(.07,.09,.04,IR,-.9,2.3,0,null,null,6);",
    "Q.cy(.014,.014,WALLH-2.32,IR,-.9,(WALLH+2.32)/2,0,null,null,4);Q.cy(.07,.09,.04,IR,-.9,2.3,0,null,null,6);Q.cy(.1,.1,.03,IR,-.9,WALLH-.02,0,null,null,6);")
# the Crown's bell hung from a short chain with a gap under it; it now hangs on one chain from the ceiling
rep("M=>{const q=M.cy(.3,.5,.5,0x8a6a2a,0,1.5,0,null,null,8);q.rotation.z=.6;M.b(.5,.04,.04,0xffd24a,0,1.2,0,null,GLOW).rotation.z=.6;M.b(.03,.9,.03,0x5c626c,0,WH-.45,0);}",
    "M=>{M.cy(.3,.5,.5,0x8a6a2a,0,1.6,0,null,null,8);M.cy(.52,.52,.05,0xffd24a,0,1.36,0,null,GLOW,8);M.sp(.09,0x5c4a2a,0,1.24,0);M.cy(.12,.12,.1,0x5c4a2a,0,1.9,0,null,null,6);M.b(.04,WH-1.95,.04,0x5c626c,0,(WH+1.95)/2,0);M.cy(.12,.12,.03,0x3a3c42,0,WH-.02,0,null,null,6);}")
# guardian-floor decor: hang from the real ceiling, and never inside a crate, fence, dais or wall
rep("const put=(x,z,fn,sc)=>{if(solidAt(x,z))return;const M=prop(x,z,rnd(6.28),fn);if(sc)M.g.scale.setScalar(sc);};",
    "const put=(x,z,fn,sc)=>{if(solidAt(x,z))return;for(const p of L.plats||[])if(x>p.x0-.7&&x<p.x1+.7&&z>p.z0-.7&&z<p.z1+.7)return;const w0=WH;try{WH=ceilAt(x,z)/(sc||1);}catch(e){}const M=prop(x,z,rnd(6.28),fn);WH=w0;if(sc)M.g.scale.setScalar(sc);};")
open(p,'w',encoding='utf-8').write(s);print('p12 ok')
