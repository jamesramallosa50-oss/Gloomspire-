/* ===== BUILD 2.9: low-end pass ===== */
/* compile every shader the game is about to need while the floor loads, so the first fireball, hit spark or glow does not freeze the frame */
let WARMED=false;
function shaderWarm(){try{const g=new T.Group(),S=SPHG,ms=[FXADD(0xffffff,.5),new T.MeshBasicMaterial({color:0xffffff}),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false}),
    new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}),new T.MeshBasicMaterial({color:0xffffff,fog:false}),phong(0xffffff),phong(0xffffff,{op:.5}),flameMat,torchHalo,PROPMAT,WEBMAT,DECMAT.water,levelMat];
    for(const k in PK)if(PK[k].mat)ms.push(PK[k].mat);
    for(const m of ms){const q=new T.Mesh(S,m);q.position.set(cam.position.x,cam.position.y-50,cam.position.z);g.add(q);}
    scene.add(g);g.updateMatrixWorld(true);renderer.compile(scene,cam);scene.remove(g);}catch(e){}}
function warmTick(){if(!L||L._warm)return;L._warm=1;setTimeout(()=>{try{culShow();renderer.compile(scene,cam);if(!WARMED){WARMED=true;shaderWarm();}}catch(e){}},50);}
