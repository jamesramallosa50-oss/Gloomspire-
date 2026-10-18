/* ===== BUILD 3.5: sealed doors count the guardians that are really left ===== */
/* The door used a running counter that could drift (an enemy that never registered its death, or one stuck inside a crate,
   a pillar or the dais), so it said "kill more" with nobody left to kill. Now the door counts the living enemies of its room
   directly, opens at once when there are none, and lights up and frees any that are left. */
let GUARDT=0;
function guardList(r){const o=[];for(const e of enemies)if(!e.dead&&!e.ally&&!e.pv&&e.room===r&&e.hp>0)o.push(e);return o;}
function guardFree(e){/* an enemy caught inside a crate, pillar or wall is moved to a free spot in its room */
  let stuck=blocked(e.x,e.z,Math.min(.3,e.r*.6));if(!stuck&&L.plats)for(const p of L.plats)if(p.y1>.6&&e.x>p.x0&&e.x<p.x1&&e.z>p.z0&&e.z<p.z1&&(e.y||0)<p.y1-.2){stuck=true;break;}
  if(!stuck||e.x<-900)return;const r=L.rooms[e.room];if(!r)return;
  for(let i=0;i<30;i++){const c=roomCell(r),x=wx(c.x),z=wx(c.y);if(!blocked(x,z,e.r)){e.x=x;e.z=z;e.y=0;break;}}}
function guardCheck(d){/* true when the door may open */
  const list=guardList(d.req),rm=L.rooms[d.req];if(rm)rm.alive=list.length;
  if(!list.length)return true;
  if(time>GUARDT){GUARDT=time+3;for(const e of list){guardFree(e);e.awake=true;pillarFx(e.x,e.z,.45,0xff3a2a,1.4,.55);}
    if(list.length<=3)msg((list.length===1?'One guardian is':list.length+' guardians are')+' still alive. They are marked with red light.','bad','guardping');}
  return false;}
