import sys
from PIL import Image
import numpy as np
for f in sys.argv[1:]:
  a=np.asarray(Image.open(f).convert('RGB')).astype(float)[60:,:]
  l=a.mean(axis=2)
  q=[np.percentile(l,p) for p in (5,25,50,75,95)]
  d=a[l<=np.percentile(l,15)].mean(axis=0); b=a[l>=np.percentile(l,90)].mean(axis=0); m=a.reshape(-1,3).mean(axis=0)
  print(f.split('/')[-1].ljust(16),'lum',[int(x) for x in q],'dark',d.astype(int),'mid',m.astype(int),'bright',b.astype(int))
