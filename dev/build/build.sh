set -e
cd /home/claude && rm -rf out && mkdir out && cp -r src/Gloomspire--main out/
python3 tools/patch.py src/Gloomspire--main/index.html out/Gloomspire--main/index.html >/dev/null
python3 tools/patch2.py out/Gloomspire--main/index.html >/dev/null
for p in tools/patch3.py tools/patch4.py tools/patch5.py tools/patch6.py tools/patch7.py tools/patch8.py tools/patch9.py tools/patch10.py tools/patch11.py tools/patch12.py tools/patch13.py tools/patch14.py tools/patch15.py tools/patch16.py tools/patch17.py tools/patch18.py tools/patch19.py tools/patch20.py tools/patch21.py; do [ -f $p ] && python3 $p out/Gloomspire--main/index.html; done
sed -i "s/const CACHE='gloomspire-v2';/const CACHE='gloomspire-v18';/" out/Gloomspire--main/sw.js
node -e "const s=require('fs').readFileSync('out/Gloomspire--main/index.html','utf8');const re=/<script[^>]*>([\s\S]*?)<\/script>/g;let m,bad=0;while((m=re.exec(s))){try{new Function(m[1]);}catch(e){bad++;console.log('SYNTAX',e.message);}}console.log('syntax bad:',bad);"
