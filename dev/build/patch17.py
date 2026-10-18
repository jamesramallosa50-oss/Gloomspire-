import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
# stutter: keep compiled shader programs alive instead of deleting and recompiling them every time the last effect using one ends
rep("releaseProgram:function(t){if(0==--t.usedTimes){const e=a.indexOf(t);a[e]=a[a.length-1],a.pop(),t.destroy()}}","releaseProgram:function(t){t.usedTimes>0&&--t.usedTimes}")
# torches: the iron bracket and wooden handle are merged into chunked meshes (4 fewer draw calls per torch); flames and halo stay live
rep("  torchSpots.sort(()=>Math.random()-.5).forEach(s=>{","  const TPARTS=[];\n  torchSpots.sort(()=>Math.random()-.5).forEach(s=>{")
rep("""    add(geo(.1,.2,.05),ironMat,0,-.16,.03);add(geo(.05,.05,.1),ironMat,0,-.2,.08);
    add(cyl(.025,.035,.42,6),woodMat,0,-.06,.14).rotation.x=.5;add(cyl(.075,.045,.09,8),ironMat,0,.12,.24);""",
"""    {grp.updateMatrix();const st=(g_,hex,x,y,z,rx)=>{const q=new T.Object3D();q.position.set(x,y,z);if(rx)q.rotation.x=rx;q.updateMatrix();TPARTS.push([g_,hex,new T.Matrix4().multiplyMatrices(grp.matrix,q.matrix)]);};
     st(geo(.1,.2,.05),0x5a5a64,0,-.16,.03);st(geo(.05,.05,.1),0x5a5a64,0,-.2,.08);st(cyl(.025,.035,.42,6),0x6a4526,0,-.06,.14,.5);st(cyl(.075,.045,.09,8),0x5a5a64,0,.12,.24);}""")
rep("  try{secretSetup();}catch(e){console.warn('secret2',e);}","  try{if(TPARTS.length)addChunked(TPARTS,PROPMAT);}catch(e){}\n  try{secretSetup();}catch(e){console.warn('secret2',e);}")
# brighter: torches throw more light further, the ambient is lifted and warmed, the fog starts later
rep("PointLight(0xff8a30,0,21,1.6)","PointLight(0xff8a3a,0,21,1.6)")
rep("l.intensity=(1.12+Math.sin(time*11+t.ph)*.12+Math.random()*.14)","l.intensity=(1.1+Math.sin(time*11+t.ph)*.12+Math.random()*.14)*(t.big?.5:1)")
rep("amb.intensity=PVP.on?2.3:1.9;scene.fog.near=PVP.on?8:6;scene.fog.far=PVP.on?84:54;","amb.intensity=PVP.on?2.3:1.6;scene.fog.near=PVP.on?8:5;scene.fog.far=PVP.on?84:50;")
rep("amb.color.setHex(th.amb);","amb.color.setHex(th.amb);")
rep("try{amb.intensity=2.3*(.65+.35*k);}catch(er){}","try{amb.intensity=1.9*(.65+.35*k);}catch(er){}")
rep("setTorchLights(m==='low'?3:m==='med'||(m==='auto'&&isTouch)?4:6);","setTorchLights(m==='low'?4:m==='med'||(m==='auto'&&isTouch)?5:6);")
open(p,'w',encoding='utf-8').write(s);print('p17 ok')
