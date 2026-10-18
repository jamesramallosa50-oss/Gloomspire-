// shared: static server + browser launcher
const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.glb':'model/gltf-binary','.webmanifest':'application/manifest+json'};
function serve(dir){return new Promise(res=>{const s=http.createServer((q,r)=>{let p=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream'});r.end(d);});}).listen(0,()=>res(s));});}
async function launch(){const {chromium}=require('playwright');return chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--ignore-gpu-blocklist']});}
module.exports={serve,launch};
