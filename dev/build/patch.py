import sys
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a)
    assert n==cnt,(n,a[:80])
    s=s.replace(a,b)

# ---------- CSS ----------
# colour grade moves into WebGL (cheap, at game resolution); CSS filter only kept as a fallback
rep('#game.gfx #view{filter:saturate(1.16) contrast(1.07)}','#game.gfx:not(.glgrade) #view{filter:saturate(1.16) contrast(1.07)}')
rep('#game.gfx #view { filter: contrast(1.12) saturate(1.22) brightness(1.04); }',
    '#game.gfx:not(.glgrade) #view { filter: contrast(1.12) saturate(1.22) brightness(1.04); } #game.glgrade #vgn { display: none !important; } #view.gsfx { filter: var(--gsvf, none); } .gsoff { visibility: hidden !important; }')
# full-screen blur behind menus: the panel is ~90% opaque anyway
rep('backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);','')
rep('opacity:0;will-change:opacity;background:radial-gradient(ellipse at 50% 50%,transparent 50%','opacity:0;background:radial-gradient(ellipse at 50% 50%,transparent 50%')

# ---------- renderer: grade pass + occlusion culling ----------
PERF=r'''
/* ===== PERF PACK =====
   1) Colour grade + vignette are drawn in WebGL at the game's own low resolution, instead of a CSS filter
      and a gradient layer applied at full screen resolution (that was the single most expensive thing on phones).
   2) Level props, torches and monsters behind solid walls or past the fog are not drawn (line of sight on the map grid). */
let GG={on:true,tex:null,w:0,h:0,fail:0};
const gradeMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{map:{value:null},gr:{value:1}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:'uniform sampler2D map;uniform float gr;varying vec2 vUv;void main(){vec3 c=texture2D(map,vUv).rgb;'+
 'vec3 g=clamp((c-.5)*1.12+.5,0.,1.);float l=dot(g,vec3(.2126,.7152,.0722));g=clamp(mix(vec3(l),g,1.22),0.,1.);g=clamp(g*1.04,0.,1.);c=mix(c,g,gr);'+
 'vec2 d=vec2((vUv.x-.5)/.5,((1.-vUv.y)-.45)/.45);float t=length(d)/1.579;'+
 'float a=t<.48?0.:t<.78?.35*(t-.48)/.30:mix(.35,.78,clamp((t-.78)/.22,0.,1.));'+
 'gl_FragColor=vec4(mix(c,vec3(.014,.018,.024),a),1.);}'});
const gradeScene=new T.Scene(),gradeCam=new T.OrthographicCamera(-1,1,1,-1,0,1);
{const gm=new T.Mesh(new T.PlaneGeometry(2,2),gradeMat);gm.frustumCulled=false;gradeScene.add(gm);}
const _gv=new T.Vector2(),_gsz=new T.Vector2();
function gradePass(){
  if(!GG.on)return;
  try{
    renderer.getDrawingBufferSize(_gsz);const w=_gsz.x|0,h=_gsz.y|0;if(w<2||h<2)return;
    if(!GG.tex||GG.w!==w||GG.h!==h){if(GG.tex)GG.tex.dispose();
      const t=new T.DataTexture(new Uint8Array(w*h*3),w,h,T.RGBFormat);t.unpackAlignment=1;t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;GG.tex=t;GG.w=w;GG.h=h;}
    renderer.setRenderTarget(null);renderer.copyFramebufferToTexture(_gv,GG.tex);
    gradeMat.uniforms.map.value=GG.tex;gradeMat.uniforms.gr.value=gameEl.classList.contains('gfx')?1:0;
    renderer.render(gradeScene,gradeCam);
  }catch(e){if(++GG.fail>2){GG.on=false;try{gameEl.classList.remove('glgrade');}catch(_){}}}
}
const CULC=new WeakMap(),CULH=[],_cv=new T.Vector3(),_cs=new T.Sphere(),_cm=new T.Matrix4(),_cb=new T.Box3(),_cq=new T.Vector3();
function culInfo(o){
  let c=CULC.get(o);if(c&&c.n===o.children.length)return c;
  c={n:o.children.length,no:false,x:0,y:0,z:0,r:0};CULC.set(o,c);
  o.updateMatrixWorld(true);_cb.makeEmpty();let mesh=0;
  o.traverse(m=>{if(c.no)return;if(m.isLight||m.isCamera){c.no=true;return;}
    if(!m.geometry||!(m.isMesh||m.isPoints||m.isLine||m.isSprite))return;
    if(m.isInstancedMesh||m.isSkinnedMesh){c.no=true;return;}
    const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingSphere||!isFinite(g.boundingSphere.radius)){c.no=true;return;}
    _cs.copy(g.boundingSphere).applyMatrix4(m.matrixWorld);mesh++;
    _cb.expandByPoint(_cq.set(_cs.center.x-_cs.radius,_cs.center.y-_cs.radius,_cs.center.z-_cs.radius));
    _cb.expandByPoint(_cq.set(_cs.center.x+_cs.radius,_cs.center.y+_cs.radius,_cs.center.z+_cs.radius));});
  if(!mesh||c.no){c.no=true;return c;}
  _cb.getCenter(_cv);c.r=_cb.getSize(_cq).length()/2;
  if(c.r>CELL*2.6){c.no=true;return c;}
  _cm.copy(o.matrixWorld).invert();_cv.applyMatrix4(_cm);c.x=_cv.x;c.y=_cv.y;c.z=_cv.z;
  return c;
}
/* grid ray: true when no solid wall cell lies between the two points */
function culRay(x0,z0,x1,z1){
  const g=L.grid,W=L.W,H=L.H;let cx=Math.floor(x0/CELL),cz=Math.floor(z0/CELL);const tx=Math.floor(x1/CELL),tz=Math.floor(z1/CELL);
  const dx=x1-x0,dz=z1-z0,sx=dx>0?1:-1,sz=dz>0?1:-1,adx=Math.abs(dx),adz=Math.abs(dz);
  const tdx=adx>1e-9?CELL/adx:1e9,tdz=adz>1e-9?CELL/adz:1e9;
  let tmx=adx>1e-9?(sx>0?(cx+1)*CELL-x0:x0-cx*CELL)/adx:1e9,tmz=adz>1e-9?(sz>0?(cz+1)*CELL-z0:z0-cz*CELL)/adz:1e9;
  for(let n=0;n<160;n++){
    if(cx===tx&&cz===tz)return true;
    if(tmx<tmz){tmx+=tdx;cx+=sx;}else{tmz+=tdz;cz+=sz;}
    if(cx===tx&&cz===tz)return true;
    if(cx<0||cz<0||cx>=W||cz>=H)return true;
    if(g[cz*W+cx]===0)return false;
  }
  return true;
}
function culSee(cx,cz,ox,oz,ux,uz,r){
  const q=Math.min(r,CELL)+.35,px=-uz*q,pz=ux*q;
  return culRay(cx,cz,ox,oz)||culRay(cx,cz,ox+px,oz+pz)||culRay(cx,cz,ox-px,oz-pz)||culRay(cx,cz,ox-ux*q,oz-uz*q);
}
/* objects that are not drawn this frame also skip their matrix update (nothing in the game reads world matrices) */
const CULN=[];{const _umw=T.Object3D.prototype.updateMatrixWorld;T.Object3D.prototype.updateMatrixWorld=function(f){if(this._gsNoUpd===true)return;return _umw.call(this,f);};}
function culNm(o){if(o._gsNoUpd!==true){o._gsNoUpd=true;CULN.push(o);}}
function culShow(){for(let i=0;i<CULH.length;i++)CULH[i].visible=true;CULH.length=0;for(let i=0;i<CULN.length;i++)CULN[i]._gsNoUpd=false;CULN.length=0;}
function culHide(){
  culShow();
  try{
    if(window.__gsNoCull||!lvl||!L||!L.grid||OPEN||!lvl.visible||!lvl.parent)return;
    const cx=cam.position.x,cz=cam.position.z,cy=cam.position.y,W=L.W,H=L.H;
    const ccx=Math.floor(cx/CELL),ccz=Math.floor(cz/CELL);
    const los=ccx>=0&&ccz>=0&&ccx<W&&ccz<H&&L.grid[ccz*W+ccx]!==0&&cy<WALLH-.15;
    const far=scene.fog&&scene.fog.far<500?scene.fog.far+1.5:1e9;
    const ch=lvl.children;
    for(let i=0;i<ch.length;i++){const o=ch[i];if(!o.visible){culNm(o);continue;}const c=culInfo(o);if(c.no)continue;
      _cv.set(c.x,c.y,c.z).multiply(o.scale).applyQuaternion(o.quaternion).add(o.position);
      const dx=_cv.x-cx,dz=_cv.z-cz,d=Math.hypot(dx,dz),r=c.r+.4;
      if(d<r+CELL*1.25)continue;
      let hide=d-r>far;
      if(!hide&&los)hide=!culSee(cx,cz,_cv.x,_cv.z,dx/d,dz/d,r);
      if(hide){o.visible=false;CULH.push(o);culNm(o);}
    }
  }catch(e){culShow();}
}
'''
rep('const amb=new T.AmbientLight(0x2a3328,1);scene.add(amb);',PERF+'const amb=new T.AmbientLight(0x2a3328,1);scene.add(amb);')

# torch lights: fewer on weak settings (each light costs every pixel)
rep("const tLights=[];for(let i=0;i<6;i++){const l=new T.PointLight(0xff8a30,0,21,1.6);scene.add(l);tLights.push(l);}",
    "const tLights=[];for(let i=0;i<6;i++){const l=new T.PointLight(0xff8a30,0,21,1.6);scene.add(l);tLights.push(l);}\nlet tLN=6;function setTorchLights(n){n=Math.max(2,Math.min(6,n|0));if(n===tLN)return;tLN=n;for(let i=0;i<6;i++){if(i<n){if(!tLights[i].parent)scene.add(tLights[i]);}else if(tLights[i].parent)scene.remove(tLights[i]);}}")
rep('const cut=torches.length>6?torches[6].d:99;','const cut=torches.length>tLN?torches[tLN].d:99;')

# minimap: redraw at ~30 fps instead of every frame
rep('if(!OPEN)drawMap();','if(!OPEN&&((window.__mapFr=(window.__mapFr||0)+1)&1||mapBig))drawMap();')

# main render: cull hidden props; grade at the end of the frame
rep("    renderer.render(scene,cam);\n    if(state==='play'||state==='dying'","    culHide();renderer.render(scene,cam);\n    if(state==='play'||state==='dying'")
rep("drawLens(raw>26&&(window.__lf&1)===1);}\n  }\n}","drawLens(raw>26&&(window.__lf&1)===1);}\n    culShow();\n  }\n  ovlSleep(dt);gradePass();\n}")

# quality: fewer torch lights on Low / Medium / touch Auto; grade toggles with the setting
rep("function qualUi(){try{gameEl.classList.toggle('gfx',qMode()!=='low');}catch(e){}",
    "function qualUi(){try{gameEl.classList.toggle('gfx',qMode()!=='low');gameEl.classList.toggle('glgrade',GG.on);const m=qMode();setTorchLights(m==='low'?3:m==='med'||(m==='auto'&&isTouch)?4:6);}catch(e){}")
# auto quality reacts faster, and phones start a step lower
rep("if(perfEma>25){qGood=0;if(++perfHold>50&&qScale>.5)","if(perfEma>24){qGood=0;if(++perfHold>28&&qScale>.5)")
rep("let RW=320,RH=240,qScale=1,","let RW=320,RH=240,qScale=isTouch?.8:1,")
# overlay layers at opacity 0 are hidden so the browser stops compositing them every frame
OVL=r'''
const OVL=['speedfx','castfx','wardfx','vig'].map(id=>({el:document.getElementById(id),t:0,off:false}));
function ovlSleep(dt){for(const o of OVL){if(!o.el)continue;const v=parseFloat(o.el.style.opacity);const z=!(v>.004);
  if(z){o.t+=dt;if(!o.off&&o.t>.4){o.off=true;o.el.classList.add('gsoff');}}else{o.t=0;if(o.off){o.off=false;o.el.classList.remove('gsoff');}}}}
'''
rep("let last=performance.now(),hudAcc=0;\nfunction frame(now){",OVL+"let last=performance.now(),hudAcc=0;\nfunction frame(now){")
open(dst,'w',encoding='utf-8').write(s)
print('ok')

# ---------- hit-effects script ----------
s=open(dst,encoding='utf-8').read()
# cache each monster's bounding box instead of re-measuring every vertex of every nearby monster on every hit
rep('''        var info = gsRootInfo(g);
        if (!info) continue;
        var c = new THREE.Vector3();
        info.box.getCenter(c);''','''        var info = gsRootCache.get(g);
        if (info === undefined || (info && info.n !== g.children.length)) {
          var fresh = gsRootInfo(g);
          if (fresh) { var fc = new THREE.Vector3(); fresh.box.getCenter(fc); fresh.off = fc.sub(g.position); fresh.n = g.children.length; }
          info = fresh || null; gsRootCache.set(g, info);
        }
        if (!info) continue;
        var c = g.position.clone().add(info.off);''')
# pooled spark meshes: no new materials per hit (disposing the last one also threw away the compiled shader, so the next hit recompiled it = hitch)
rep('''      var count = isKill ? 26 : (isCrit ? 16 : 11);
      for (var i = 0; i < count; i++) {
        var isPuff = isKill && i >= 10;
        var col = isPuff ? (i % 2 === 0 ? 0xa87be0 : 0xede0ff) : (isCrit ? (i % 2 === 0 ? 0xffe866 : 0xffffff) : (i % 3 === 0 ? 0xffffff : 0xffaa33));
        var mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1, fog: false });
        var mesh = new THREE.Mesh(isPuff ? puffGeo : sparkGeo, mat);
        mesh.userData._isPunchFX = true;''','''      var lowFx = gameEl && !gameEl.classList.contains("gfx");
      var count = isKill ? (lowFx ? 12 : 18) : (isCrit ? (lowFx ? 6 : 10) : (lowFx ? 4 : 7));
      var room = gsMaxFx - particles3D.length;
      if (room <= 0) return;
      if (count > room) count = room;
      for (var i = 0; i < count; i++) {
        var isPuff = isKill && i >= count * 0.4;
        var col = isPuff ? (i % 2 === 0 ? 0xa87be0 : 0xede0ff) : (isCrit ? (i % 2 === 0 ? 0xffe866 : 0xffffff) : (i % 3 === 0 ? 0xffffff : 0xffaa33));
        var mesh = gsFxPool.pop();
        if (!mesh) { mesh = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1, fog: false })); mesh.userData._isPunchFX = true; mesh.userData._gsPool = true; }
        mesh.geometry = isPuff ? puffGeo : sparkGeo;
        mesh.material.color.setHex(col); mesh.material.opacity = 1;
        mesh.rotation.set(0, 0, 0); mesh.scale.setScalar(1);''')
rep('''    var sparkGeo = null;
    var puffGeo = null;''','''    var sparkGeo = null;
    var puffGeo = null;
    var gsFxPool = [], gsMaxFx = 48;''')
rep('''            if (pt.life >= pt.maxLife) {
              if (pt.mesh.parent) pt.mesh.parent.remove(pt.mesh);
              if (pt.mesh.material) pt.mesh.material.dispose();
              particles3D.splice(p, 1);''','''            if (pt.life >= pt.maxLife) {
              if (pt.mesh.parent) pt.mesh.parent.remove(pt.mesh);
              if (pt.mesh.userData._gsPool && gsFxPool.length < 64) gsFxPool.push(pt.mesh);
              else if (pt.mesh.material) pt.mesh.material.dispose();
              particles3D.splice(p, 1);''')
# the sweep must not dispose pooled materials
rep('''          sc.remove(c);
          if (c.material && c.material.dispose) c.material.dispose();''','''          sc.remove(c);
          if (c.userData._gsPool) { if (gsFxPool.length < 64) gsFxPool.push(c); }
          else if (c.material && c.material.dispose) c.material.dispose();''')
# ambience overlay: draw at ~30 fps, motes only on menus or High/Ultra, and leave the canvas alone when there is nothing to draw
rep('''    function loopAmbience(now) {
      var t = now * 0.001;''','''    var ambLast = 0, ambDirty = true;
    function loopAmbience(now) {
      requestAnimationFrame(loopAmbience);
      if (now - ambLast < 31 && !(shakeMag > 0.15 || recoilBack > 0.005)) return;
      var adt = Math.min(0.1, (now - ambLast) / 1000); ambLast = now;
      var t = now * 0.001;''')
rep('''      ctx.clearRect(0, 0, w, h);
      for (var s = sparks2D.length - 1; s >= 0; s--) {
        var sp = sparks2D[s];
        sp.life += 0.016;''','''      var onMenu0 = titleEl && !titleEl.hidden;
      var wantMotes = onMenu0 || (gameEl.classList.contains("gfx") && /High|Ultra/.test(((document.getElementById("qualb") || {}).textContent) || ""));
      if (!wantMotes && !sparks2D.length) { if (ambDirty) { ctx.clearRect(0, 0, w, h); ambDirty = false; ambCanvas.style.display = "none"; } return; }
      if (!ambDirty) { ambDirty = true; ambCanvas.style.display = ""; }
      ctx.clearRect(0, 0, w, h);
      var stepK = adt / 0.016;
      for (var s = sparks2D.length - 1; s >= 0; s--) {
        var sp = sparks2D[s];
        sp.life += adt;''')
rep('''        sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.18;''','''        sp.x += sp.vx * stepK; sp.y += sp.vy * stepK; sp.vy += 0.18 * stepK;''')
rep('''      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];''','''      for (var i = 0; wantMotes && i < motes.length; i++) {
        var m = motes[i];''')
rep('''        m.x += m.vx + Math.sin(t * 1.5 + m.phase) * 0.0002;
        m.y += m.vy;''','''        m.x += (m.vx + Math.sin(t * 1.5 + m.phase) * 0.0002) * stepK;
        m.y += m.vy * stepK;''')
rep('''        ctx.fillRect(Math.floor(m.x * w), Math.floor(m.y * h), Math.max(1, Math.round(m.r)), Math.max(1, Math.round(m.r)));
      }
      requestAnimationFrame(loopAmbience);
    }''','''        ctx.fillRect(Math.floor(m.x * w), Math.floor(m.y * h), Math.max(1, Math.round(m.r)), Math.max(1, Math.round(m.r)));
      }
    }''')
open(dst,'w',encoding='utf-8').write(s)
print('ok2')
