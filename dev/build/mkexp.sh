rm -rf /home/claude/exp/d && cp -r /home/claude/out/Gloomspire--main /home/claude/exp/d
python3 - <<'PY'
p='/home/claude/exp/d/index.html';s=open(p).read()
a="function fx2Tick(dt){"
s=s.replace(a,"window.__g={get P(){return P},get L(){return L},buildLevel,get TR(){return TR},get PL(){return PL},get B2(){return B2},get enemies(){return enemies},openSummon,get state(){return state},set state(v){state=v},calcFlow,get items(){return items},wx,hurtEnemy,get PZ(){return PZ},openGatePick,ultCdFor,cast,get MP(){return MP},get B2(){return B2},get meta(){return meta},buildSlots,castFusion,FU,ULT3,FZ2,fzKey,get HSTOP(){return HSTOP},spawnEnemy,get time(){return time},openGate,get gates(){return gates},kingFusion,kingFuseList,get projs(){return projs},finalCreditsOverlay,kingStopWorld,get KING_TS(){return KING_TS},get torches(){return torches},ceilAt,get TS(){return TS},ULT,get camFov(){return cam.fov},get renderer(){return renderer}};\n"+a,1)
open(p,'w').write(s)
PY
