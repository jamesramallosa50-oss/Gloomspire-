import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
shim=open('/home/claude/tools/domshim.js',encoding='utf-8').read()
i=s.index('<script')
s=s[:i]+'<script>/* low-end pass: writing the same text, class, attribute or style again no longer makes the browser re-layout and re-paint the HUD */\n'+shim+'</script>\n'+s[i:]
open(p,'w',encoding='utf-8').write(s);print('p19 ok')
