import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,a;s=s.replace(a,b)
# big files in assets/ (the Horror demon) are kept in their own cache that survives game updates, and served from it first
rep("caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE)","caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&!x.startsWith('gloomspire-assets'))")
rep("  e.respondWith(fetch(r)","  if(new URL(r.url).pathname.includes('/assets/')){e.respondWith(caches.open('gloomspire-assets-v1').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}))));return;}\n  e.respondWith(fetch(r)")
open(p,'w').write(s);print('sw ok')
