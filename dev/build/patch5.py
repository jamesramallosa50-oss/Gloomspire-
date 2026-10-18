import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
mod=open('/home/claude/tools/dun2.js',encoding='utf-8').read()
a="function fx2Tick(dt){"
assert s.count(a)==1
s=s.replace(a,mod+"\n"+a)
open(p,'w',encoding='utf-8').write(s);print('p5 ok')
