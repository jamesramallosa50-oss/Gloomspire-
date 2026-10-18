import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:120]);s=s.replace(a,b)
# 3.13: the climb's own controls drive the horror modes too (mouse look, touch stick and look, the custom touch layout,
# phone gyro, controller with its button bindings and flick stick). hzLook() is true while a horror mode is being played.
rep("  if(state!=='play'||isTouch||!(locked||lockFail))return;\n  if(Math.abs(e.movementX)>400","  if((state!=='play'&&!hzLook())||isTouch||!(locked||lockFail))return;\n  if(Math.abs(e.movementX)>400")
rep("function gyroApply(yawDeg,pitchDeg,dt){\n  if(state!=='play')return;","function gyroApply(yawDeg,pitchDeg,dt){\n  if(state!=='play'&&!hzLook())return;")
rep("  if(state!=='play'&&state!=='ending')return;\n  let ui=false;","  if(state!=='play'&&state!=='ending'&&!hzLook())return;\n  let ui=false;")
rep("  if(state==='play'&&mvId===null){const sb=ctlBox('stick');","  if((state==='play'||hzLook())&&mvId===null){const sb=ctlBox('stick');")
rep("  if(state==='play'||state==='ending')e.preventDefault();\n},{passive:false});","  if(state==='play'||state==='ending'||state==='horror')e.preventDefault();\n},{passive:false});")
rep("  const rx=dz(ax[SA[2]]||0),ry=dz(ax[SA[3]]||0);\n  if(state==='play'){","  const rx=dz(ax[SA[2]]||0),ry=dz(ax[SA[3]]||0);\n  if(state==='horror'&&HZ&&HZ.paused&&!HZ.loading&&!HZ.dead&&(hit(0)||hit(9))){hzPause(false);pad.prev=Array.from({length:17},(x,i)=>b(i));return;}\n  if(state==='play'||hzLook()){")
rep("    padFire=PBb(b,'fire');padAds=PBb(b,'scope');if(PBh(hit,'cast')&&P.sel)cast(P.sel);","    if(state==='horror'){hzPad(b,hit,lx,ly);pad.prev=Array.from({length:17},(x,i)=>b(i));return;}\n    padFire=PBb(b,'fire');padAds=PBb(b,'scope');if(PBh(hit,'cast')&&P.sel)cast(P.sel);")
# 3.14: pausing a horror mode opens the climb's own pause screen with all its settings
rep("function resume(){quitArm=false;","function resume(){if(HZ&&HZ.paused){hzPause(false);return;}quitArm=false;")
rep("function quitToMenu(){\n  if(state!=='pause')return;","function quitToMenu(){\n  if(HZ){hzQuit(false);return;}\n  if(state!=='pause')return;")
open(p,'w',encoding='utf-8').write(s);print('p24 ok')
