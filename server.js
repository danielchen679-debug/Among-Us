'use strict';
/* Starship Sus — original fan-made browser game with real-person multiplayer.
   Node 20+; zero packages. Server is authoritative for roles, kills, votes, tasks and timers. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const rooms = new Map();
const COLORS = [
  ['Red','#C51111'],['Blue','#132ED1'],['Green','#117F2D'],['Pink','#ED54BA'],
  ['Orange','#EF7D0D'],['Yellow','#F5F557'],['Black','#3F474E'],['White','#D6E0F0'],
  ['Purple','#6B2FBC'],['Brown','#71491E'],['Cyan','#38FEDC'],['Lime','#50EF39'],
  ['Maroon','#6E0F2D'],['Rose','#ECC0D3'],['Banana','#F4F4AB'],['Gray','#8395A7'],
  ['Tan','#918877'],['Coral','#EC7578']
];
const PALETTE = Object.fromEntries(COLORS);
const HATS=['None','Cap','Beanie','Crown','Top Hat','Plant','Egg','Halo','Cowboy','Party Hat','Chef','Flower'];
const SKINS=['Classic','Suit','Lab Coat','Overalls','Coat','Tuxedo','Utility'];
const IMPOSTOR_ROLES=['Impostor','Shapeshifter','Phantom','Viper'];
const CREW_ROLES=['Crewmate','Engineer','Scientist','Tracker','Noisemaker','Detective'];
const TASKS=[
 ['wires','Fix Wiring','Electrical',397,511,'wires'],
 ['swipe','Swipe Card','Admin',581,349,'swipe'],
 ['scan','Submit Scan','MedBay',413,218,'hold'],
 ['reactor','Start Reactor','Reactor',91,315,'reactor'],
 ['manifolds','Unlock Manifolds','Reactor',119,361,'numbers'],
 ['asteroids','Clear Asteroids','Weapons',893,116,'asteroids'],
 ['course','Chart Course','Navigation',931,312,'course'],
 ['fuel','Fuel Engines','Storage',557,559,'hold'],
 ['shields','Prime Shields','Shields',891,540,'shields'],
 ['filter','Clean O2 Filter','O2',754,325,'filter'],
 ['upload','Upload Data','Communications',720,557,'hold'],
 ['upper','Align Engine Output','Upper Engine',243,139,'align'],
 ['lower','Align Engine Output','Lower Engine',242,540,'align'],
 ['calibrate','Calibrate Distributor','Electrical',441,543,'calibrate'],
 ['empty','Empty Garbage','Cafeteria',748,158,'empty'],
 ['steering','Stabilize Steering','Navigation',892,357,'align'],
 ['divert','Divert Power','Electrical',398,456,'align'],
 ['download','Download Data','Cafeteria',574,173,'hold']
];
const TASK_BY_ID = new Map(TASKS.map(([id,name,room,x,y,kind])=>[id,{id,name,room,x,y,kind}]));
const VENTS=[
 [0,'Upper Engine',212,185,0],[1,'Reactor',73,262,0],[2,'Reactor',70,379,0],[3,'Lower Engine',215,580,0],
 [4,'MedBay',365,155,1],[5,'Security',305,292,1],[6,'Electrical',367,429,1],
 [7,'Cafeteria',556,87,2],[8,'Admin',644,390,2],[9,'Cafeteria',757,199,2],
 [10,'Weapons',944,172,3],[11,'Navigation',956,261,3],[12,'Navigation',963,369,3],[13,'Shields',943,580,3]
].map(([id,room,x,y,group])=>({id,room,x,y,group}));
const REPAIR={Lights:[{id:'electrical',x:390,y:474}],O2:[{id:'oxygen',x:750,y:325},{id:'admin',x:581,y:349}],Reactor:[{id:'top',x:79,y:291},{id:'bottom',x:128,y:363}],Comms:[{id:'radio',x:725,y:556}],Doors:[]};
const REGIONS=[
 [26,241,137,160],[170,39,169,184],[170,430,169,176],[180,277,141,118],
 [349,131,159,135],[524,25,266,205],[804,48,163,157],[844,239,137,161],
 [699,252,120,128],[811,433,172,177],[650,507,151,109],[472,455,172,164],
 [348,409,114,190],[512,274,169,151],
 [150,312,50,38],[310,310,240,42],[310,207,51,290],[328,164,235,36],
 [461,220,50,270],[664,195,59,85],[774,185,57,356],[789,304,74,43],
 [633,390,184,46],[323,407,210,56],[635,507,30,46],[336,476,35,64],
 [156,217,35,231],[630,423,51,101]
];
const now=()=>Date.now(), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const uid=()=>crypto.randomBytes(16).toString('base64url');
const shuffle=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){const j=crypto.randomInt(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
function clean(s,max=100){return String(s??'').replace(/[\x00-\x1f\x7f<>]/g,'').trim().slice(0,max)}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))}
function code(){let v;do{v=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(v));return v}
function inBounds(p){return p.x>=24&&p.x<=976&&p.y>=24&&p.y<=616}
function walkable(p){return inBounds(p)&&REGIONS.some(([x,y,w,h])=>p.x>=x-10&&p.x<=x+w+10&&p.y>=y-10&&p.y<=y+h+10)}
function roomName(p){const names=['Reactor','Upper Engine','Lower Engine','Security','MedBay','Cafeteria','Weapons','Navigation','O2','Shields','Communications','Storage','Electrical','Admin'];for(let i=0;i<14;i++){const [x,y,w,h]=REGIONS[i];if(p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h)return names[i]}return 'Hallway'}
function getRoom(c){return rooms.get(String(c||'').trim().toUpperCase())}
function auth(b){const r=getRoom(b?.code),p=r?.players.find(q=>q.id===b?.id&&q.token===b?.token);return {r,p}}
function newPlayer(info,color){return {id:uid(),token:uid(),name:clean(info.name,17)||'Crewmate',color,hat:HATS.includes(info.hat)?info.hat:'None',skin:SKINS.includes(info.skin)?info.skin:'Classic',x:654,y:128,face:1,walk:0,moving:false,alive:true,imp:false,role:'Crewmate',meetings:1,done:new Set(),taskIds:[],vent:null,killAt:0,sabAt:0,abilityAt:0,trackUntil:0,trackId:null,intel:'',disguise:null,disguiseUntil:0,vanishUntil:0,shieldUntil:0,lastMove:0,lastMessage:0,lastSeen:now(),sse:null,lastRoom:'Cafeteria'}}
function say(r,from,message,kind='system'){
 const row={id:++r.seq,by:from?.name||'SHIP SYSTEM',color:from?PALETTE[from.color]:'#eccc81',text:clean(message,260),kind,time:now()};r.messages.push(row);if(r.messages.length>120)r.messages.shift();return row
}
function stateFor(r,me){
 const m=r.meeting,phase=r.phase,t=now();
 const players=r.players.map(p=>({id:p.id,name:p.name,color:PALETTE[p.color],colorName:p.color,hat:p.hat,skin:p.skin,x:p.x,y:p.y,face:p.face,walk:p.walk,moving:p.moving,alive:p.alive,ghost:!p.alive,vent:p.vent,shield:p.shieldUntil>t,disguise:p.disguiseUntil>t?p.disguise:null,vanish:p.vanishUntil>t,host:p.id===r.host,connected:!!p.sse, voted:!!m?.votes.has(p.id),impostorFriend:(me.imp||!me.alive||phase==='ended')&&p.imp}));
 const msgs=r.messages.filter(a=>a.kind==='system'||a.kind==='lobby'&&phase==='lobby'||a.kind==='meeting'&&phase==='meeting'||a.kind==='game'&&phase==='playing'&&me.alive||a.kind==='dead'&&!me.alive);
 const done=r.players.filter(p=>!p.imp).reduce((total,p)=>total+p.done.size,0),total=r.players.filter(p=>!p.imp).length*6;
 const tracked=r.players.find(p=>p.id===me.trackId&&me.trackUntil>t);
 return {type:'state',code:r.code,phase,roomSize:r.players.length,host:r.host,me:{id:me.id,name:me.name,color:PALETTE[me.color],colorName:me.color,hat:me.hat,skin:me.skin,role:me.role,imp:me.imp,alive:me.alive,host:r.host===me.id,vent:me.vent,meetings:me.meetings,killCd:Math.ceil(Math.max(0,me.killAt-t)/1000),sabCd:Math.ceil(Math.max(0,me.sabAt-t)/1000),abilityCd:Math.ceil(Math.max(0,me.abilityAt-t)/1000),tasks:me.taskIds,done:[...me.done],track:tracked?{id:tracked.id,name:tracked.name,x:tracked.x,y:tracked.y,color:PALETTE[tracked.color]}:null,intel:me.intel},players,progressDone:done,progressTotal:total,bodies:r.bodies,sab:r.sab?{name:r.sab.name,seconds:Math.max(0,Math.ceil((r.sab.until-t)/1000)),repaired:[...r.sab.repaired],panels:REPAIR[r.sab.name],zone:r.sab.zone||null}:null,meeting:m?{phase:m.phase,reason:m.reason,seconds:Math.max(0,Math.ceil((m.ends-t)/1000)),votesCast:m.votes.size,eligible:r.players.filter(p=>p.alive).length,voted:m.votes.has(me.id),tally:m.phase==='results'?m.tally:null,result:m.phase==='results'?m.result:null}:null,messages:msgs.slice(-60),result:r.result,notice:r.notice&&r.notice.until>t?r.notice:null,serverNow:t};
}
function emit(r){for(const p of r.players){if(!p.sse)continue;try{p.sse.write('event: state\ndata: '+JSON.stringify(stateFor(r,p))+'\n\n')}catch(e){p.sse=null}}}
function start(r){
 const roster=shuffle(r.players),nImp=roster.length>=8?2:1;
 const crewClasses=shuffle([...CREW_ROLES.slice(1),'Crewmate','Crewmate']);
 for(let i=0;i<roster.length;i++){
  const p=roster[i];p.imp=i<nImp;p.role=p.imp?IMPOSTOR_ROLES[crypto.randomInt(IMPOSTOR_ROLES.length)]:crewClasses[(i-nImp)%crewClasses.length];
  p.alive=true;p.x=629+(i%6)*22;p.y=112+Math.floor(i/6)*25;p.face=1;p.walk=0;p.moving=false;
  p.done=new Set();p.taskIds=p.imp?[]:shuffle(TASKS.map(t=>t[0])).slice(0,6);
  p.meetings=1;p.vent=null;p.killAt=now()+16000;p.sabAt=now()+17000;p.abilityAt=0;
  p.disguise=null;p.disguiseUntil=0;p.vanishUntil=0;p.shieldUntil=0;p.trackId=null;p.trackUntil=0;p.intel='';p.lastMove=0;
 }
 r.phase='playing';r.result=null;r.bodies=[];r.meeting=null;r.sab=null;r.notice=null;r.messages=[];
 say(r,null,'Match started. Complete your tasks, watch the crew, and report anything suspicious.');emit(r)
}
function winCheck(r){if(!['playing','meeting'].includes(r.phase))return;const living=r.players.filter(p=>p.alive),imp=living.filter(p=>p.imp).length,crew=living.length-imp;
 let winner='',reason='';
 if(imp===0){winner='Crewmates';reason='All impostors have been ejected.'}
 else if(imp>=crew){winner='Impostors';reason='Impostors equal or outnumber the remaining crew.'}
 else if(r.players.filter(p=>!p.imp).every(p=>p.done.size===6)){winner='Crewmates';reason='All crew tasks completed.'}
 if(winner)end(r,winner,reason)
}
function end(r,winner,reason){r.result={winner,reason};r.phase='ended';r.meeting=null;r.sab=null;say(r,null,winner.toUpperCase()+' WIN! '+reason);emit(r)}
function meeting(r,reason){r.phase='meeting';r.meeting={phase:'discussion',reason,ends:now()+25000,votes:new Map(),tally:null,result:null};r.bodies=[];r.sab=null;
 for(const p of r.players)p.vent=null;say(r,null,reason+' Discuss for 25 seconds, then vote.','meeting');emit(r)}
function voting(r){const m=r.meeting;if(!m||m.phase!=='discussion')return;m.phase='voting';m.ends=now()+40000;say(r,null,'Voting is open. Choose a living player or Skip.','meeting');emit(r)}
function finishVote(r){const m=r.meeting;if(!m||m.phase!=='voting')return;
 for(const p of r.players.filter(p=>p.alive))if(!m.votes.has(p.id))m.votes.set(p.id,'skip');
 const tally=new Map();for(const id of m.votes.values())tally.set(id,(tally.get(id)||0)+1);
 const max=Math.max(0,...tally.values()),leaders=[...tally.keys()].filter(k=>tally.get(k)===max);
 const ejected=leaders.length===1&&leaders[0]!=='skip'?r.players.find(p=>p.id===leaders[0]):null;
 if(ejected){ejected.alive=false;ejected.vent=null;if(!ejected.imp)ejected.role='Guardian Angel'}
 const result={text:ejected?`${ejected.name} was ${ejected.imp?'an Impostor':'not an Impostor'}.`:leaders.length>1?'Tie. No one was ejected.':'Skipped. No one was ejected.',ejected:ejected?.id||null,wasImpostor:!!ejected?.imp};
 m.phase='results';m.ends=now()+8000;m.result=result;m.tally=[...tally].map(([id,votes])=>({id,name:id==='skip'?'Skipped':r.players.find(p=>p.id===id)?.name||'Unknown',votes})).sort((a,b)=>b.votes-a.votes);
 say(r,null,result.text,'meeting');emit(r)
}
function leave(r,p){if(p.sse){try{p.sse.end()}catch(e){}}r.players=r.players.filter(q=>q!==p);if(r.players.length===0){rooms.delete(r.code);return}
 if(r.host===p.id)r.host=r.players[0].id;
 say(r,null,`${p.name} left the room.`);
 if(r.phase!=='lobby'&&r.phase!=='ended')winCheck(r);emit(r)
}
function act(r,p,a){
 const type=String(a.type||''),t=now();p.lastSeen=t;
 if(type==='chat'){
  const content=clean(a.text,240);if(!content||t-p.lastMessage<650)return;
  let kind;if(!p.alive&&r.phase!=='lobby')kind='dead';else if(r.phase==='lobby')kind='lobby';else if(r.phase==='meeting'&&p.alive)kind='meeting';else if(r.phase==='playing'&&p.alive)kind='game';else return;
  p.lastMessage=t;say(r,p,content,kind);emit(r);return;
 }
 if(type==='look'&&r.phase==='lobby'){
  if(Object.hasOwn(PALETTE,a.color)&&!r.players.some(q=>q!==p&&q.color===a.color))p.color=a.color;
  if(HATS.includes(a.hat))p.hat=a.hat;
  if(SKINS.includes(a.skin))p.skin=a.skin;emit(r);return;
 }
 if(type==='start'&&r.phase==='lobby'&&r.host===p.id&&r.players.length>=3){start(r);return}
 if(type==='restart'&&r.phase==='ended'&&r.host===p.id){r.phase='lobby';r.result=null;r.messages=[];r.bodies=[];r.sab=null;r.notice=null;
  for(const q of r.players){q.alive=true;q.imp=false;q.role='Crewmate';q.done=new Set();q.taskIds=[];q.vent=null;q.x=654;q.y=128}emit(r);return}
 if(type==='leave'){leave(r,p);return}
 if(type==='vote'&&r.phase==='meeting'&&r.meeting?.phase==='voting'&&p.alive&&!r.meeting.votes.has(p.id)){
  const target=String(a.target||'skip');if(target!=='skip'&&!r.players.some(q=>q.id===target&&q.alive))return;
  r.meeting.votes.set(p.id,target);if(r.meeting.votes.size>=r.players.filter(q=>q.alive).length)finishVote(r);else emit(r);return
 }
 if(r.phase!=='playing')return;
 if(type==='move'&&p.vent===null){
  const x=Number(a.x),y=Number(a.y);if(!Number.isFinite(x)||!Number.isFinite(y))return;
  const to={x:Math.max(26,Math.min(974,x)),y:Math.max(26,Math.min(614,y))};
  const elapsed=p.lastMove?Math.max(.06,Math.min(.7,(t-p.lastMove)/1000)):.25;
  if(p.lastMove&&dist(p,to)>210*elapsed+19)return;
  if(!walkable(to))return;
  // Trace the movement to avoid cutting across a closed bulkhead.
  const n=Math.ceil(dist(p,to)/14);for(let i=1;i<=n;i++)if(!walkable({x:p.x+(to.x-p.x)*i/n,y:p.y+(to.y-p.y)*i/n}))return;
  if(r.sab?.name==='Doors'&&r.sab.until>t){const DOOR_ZONES={'Cafeteria':[[638,207,25,45]],'MedBay':[[502,214,28,42]],'Security':[[321,292,28,40]],'Electrical':[[458,437,27,48]],'Admin':[[638,390,25,44]],'Storage':[[633,480,27,44]],'Lower Engine':[[320,449,30,43]]};const doors=DOOR_ZONES[r.sab.zone]||DOOR_ZONES.Cafeteria;
   for(const [bx,by,bw,bh] of doors){for(let i=1;i<=n;i++){const xx=p.x+(to.x-p.x)*i/n,yy=p.y+(to.y-p.y)*i/n;if(xx>=bx-4&&xx<=bx+bw+4&&yy>=by-4&&yy<=by+bh+4)return}}
  }
  p.lastMove=t;p.x=to.x;p.y=to.y;p.lastRoom=roomName(p);p.face=a.face===-1?-1:1;p.walk=Number(a.walk)||0;p.moving=!!a.moving;if(!r.nextMoveEmit||t>=r.nextMoveEmit){r.nextMoveEmit=t+90;emit(r)}return
 }
 if(type==='task'&&!p.imp&&p.vent===null){const task=TASK_BY_ID.get(String(a.task));if(!task||!p.taskIds.includes(task.id)||p.done.has(task.id)||dist(p,task)>90)return;
  p.done.add(task.id);winCheck(r);emit(r);return
 }
 if(type==='kill'&&p.imp&&p.alive&&p.vent===null&&t>=p.killAt&&t>=p.vanishUntil){
  const q=r.players.find(q=>q.id===a.target&&q.alive&&!q.imp&&q.vent===null&&dist(p,q)<=72);if(!q)return;
  if(q.shieldUntil>t){q.shieldUntil=0;r.notice={text:'A Guardian Angel shield blocked an elimination!',x:q.x,y:q.y,until:t+7000}}
  else{const previous=q.role;q.alive=false;q.role='Guardian Angel';q.vent=null;
   r.bodies.push({id:q.id,name:q.name,x:q.x,y:q.y,color:PALETTE[q.color],acid:p.role==='Viper',expires:p.role==='Viper'?t+30000:null});
   if(previous==='Noisemaker'){r.notice={text:`NOISEMAKER ALARM! ${q.name} was killed in ${roomName(q)}!`,x:q.x,y:q.y,until:t+12000};say(r,null,r.notice.text)}
  }
  p.killAt=t+22000;winCheck(r);emit(r);return
 }
 if(type==='report'&&p.alive&&p.vent===null){const b=r.bodies.find(b=>dist(p,b)<86);if(b)meeting(r,`${p.name} reported ${b.name}'s body!`);return}
 if(type==='emergency'&&p.alive&&p.vent===null&&p.meetings>0&&!r.sab&&dist(p,{x:657,y:136})<95){p.meetings--;meeting(r,`${p.name} called an emergency meeting!`);return}
 if(type==='vent'&&(p.imp||p.role==='Engineer')&&p.alive){const next=VENTS.find(v=>v.id===Number(a.target));if(!next)return;
  if(p.vent===null&&dist(p,next)>59)return;
  if(p.vent!==null&&VENTS.find(v=>v.id===p.vent)?.group!==next.group)return;
  p.vent=next.id;p.x=next.x;p.y=next.y;p.moving=false;emit(r);return
 }
 if(type==='unvent'&&p.vent!==null){p.vent=null;emit(r);return}
 if(type==='sabotage'&&p.imp&&p.alive&&t>=p.sabAt&&!r.sab&&Object.hasOwn(REPAIR,a.name)){
  const duration={Lights:45000,O2:60000,Reactor:60000,Comms:50000,Doors:15000}[a.name];
  r.sab={name:a.name,zone:a.name==='Doors'?clean(a.zone,24):null,until:t+duration,repaired:new Set()};p.sabAt=t+42000;
  say(r,null,`⚠ ${a.name.toUpperCase()} SABOTAGE!`);emit(r);return
 }
 if(type==='repair'&&r.sab&&!p.imp&&p.vent===null){const panel=REPAIR[r.sab.name].find(q=>q.id===a.panel);if(!panel||dist(p,panel)>90)return;
  r.sab.repaired.add(panel.id);if(r.sab.repaired.size>=REPAIR[r.sab.name].length){say(r,null,`${p.name} fixed ${r.sab.name}.`);r.sab=null}emit(r);return;
 }
 if(type==='ability'&&t>=p.abilityAt){
  const target=r.players.find(q=>q.id===a.target);
  if(p.role==='Guardian Angel'&&!p.alive&&target?.alive&&!target.imp){target.shieldUntil=t+24000;p.abilityAt=t+50000;emit(r);return}
  if(p.role==='Shapeshifter'&&p.alive&&p.imp&&target?.alive&&target!==p){p.disguise={name:target.name,color:PALETTE[target.color],hat:target.hat,skin:target.skin};p.disguiseUntil=t+22000;p.abilityAt=t+40000;emit(r);return}
  if(p.role==='Phantom'&&p.alive&&p.imp){p.vanishUntil=t+13000;p.abilityAt=t+37000;emit(r);return}
  if(p.role==='Tracker'&&p.alive&&!r.sab?.name?.includes('Comms')&&target?.alive&&target!==p){p.trackId=target.id;p.trackUntil=t+30000;p.abilityAt=t+42000;emit(r);return}
  if(p.role==='Scientist'&&p.alive&&!r.sab?.name?.includes('Comms')){p.intel='';p.abilityAt=t+15000;emit(r);return}
  if(p.role==='Detective'&&p.alive&&!r.sab?.name?.includes('Comms')&&target&&target!==p){p.intel=`${target.name} was last seen in ${target.lastRoom}.`;p.abilityAt=t+30000;emit(r);return}
 }
}
function advance(){for(const r of rooms.values()){
 const t=now(),m=r.meeting;
 if(m&&t>=m.ends){if(m.phase==='discussion')voting(r);else if(m.phase==='voting')finishVote(r);else if(m.phase==='results'){
  r.meeting=null;r.phase='playing';for(const p of r.players){p.killAt=Math.max(p.killAt,t+12000);p.vent=null}winCheck(r);emit(r)
 }}
 if(r.sab&&t>=r.sab.until){const name=r.sab.name;r.sab=null;
  if(name==='O2'||name==='Reactor')end(r,'Impostors',`${name} system was not restored in time.`);
  else{say(r,null,`${name} sabotage ended.`);emit(r)}
 }
 const oldBodies=r.bodies.length;r.bodies=r.bodies.filter(b=>!b.expires||b.expires>t);
 let changed=oldBodies!==r.bodies.length;
 for(const p of r.players){if(p.disguise&&p.disguiseUntil<=t){p.disguise=null;changed=true}if(p.sse?.writableEnded){p.sse=null;changed=true}}
 if(changed)emit(r);
 if((r.phase==='playing'||r.phase==='meeting')&&r.lastBeat!==Math.floor(t/1000)){r.lastBeat=Math.floor(t/1000);emit(r)}
 // During games do not remove temporarily disconnected players. The host can restart after the round.
 if(r.players.length===0||t-r.created>86400000)rooms.delete(r.code);
 }}
setInterval(advance,250).unref();
function readBody(req,callback){let s='';req.on('data',c=>{s+=c;if(s.length>20000)req.destroy()});req.on('end',()=>{try{callback(JSON.parse(s))}catch(e){callback({})}})}
const publicDir=path.join(__dirname,'public');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');const pathname=url.pathname;
 if(req.method==='GET'&&pathname==='/api/health')return send(res,200,{ok:true,rooms:rooms.size,version:2});
 if(req.method==='POST'&&pathname==='/api/create')return readBody(req,b=>{
  const roomCode=code(),col=PALETTE[b.color]?b.color:'Cyan',p=newPlayer(b,col);
  const r={code:roomCode,phase:'lobby',host:p.id,players:[p],sab:null,bodies:[],meeting:null,result:null,messages:[],notice:null,seq:0,created:now()};rooms.set(roomCode,r);
  say(r,null,'Room created. Share the link or room code with friends.');send(res,200,{ok:true,code:roomCode,id:p.id,token:p.token})
 });
 if(req.method==='POST'&&pathname==='/api/join')return readBody(req,b=>{
  const r=getRoom(b.code);if(!r)return send(res,404,{error:'Room code not found.'});
  if(r.phase!=='lobby')return send(res,409,{error:'Game already in progress.'});
  if(r.players.length>=15)return send(res,409,{error:'Room is full (15 players).'});
  const used=new Set(r.players.map(p=>p.color)),col=PALETTE[b.color]&&!used.has(b.color)?b.color:COLORS.find(([name])=>!used.has(name))?.[0];
  const p=newPlayer(b,col);r.players.push(p);say(r,null,`${p.name} joined the lobby.`);send(res,200,{ok:true,code:r.code,id:p.id,token:p.token});emit(r)
 });
 if(req.method==='POST'&&pathname==='/api/action')return readBody(req,b=>{const {r,p}=auth(b);if(!r||!p)return send(res,401,{error:'Not connected.'});act(r,p,b);send(res,200,{ok:true})});
 if(req.method==='POST'&&pathname==='/api/restore')return readBody(req,b=>{const {r,p}=auth(b);if(!r||!p)return send(res,401,{error:'Session expired.'});p.lastSeen=now();send(res,200,{ok:true,code:r.code,id:p.id,token:p.token})});
 if(req.method==='GET'&&pathname==='/api/events'){
  const {r,p}=auth(Object.fromEntries(url.searchParams));if(!r||!p)return send(res,401,{error:'Invalid connection details.'});
  res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache,no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
  if(p.sse&&p.sse!==res)try{p.sse.end()}catch(e){};
  p.sse=res;p.lastSeen=now();res.write(': connected\n\n');emit(r);
  const ping=setInterval(()=>{try{res.write(': keepalive\n\n')}catch(e){}},20000);
  req.on('close',()=>{clearInterval(ping);if(p.sse===res){p.sse=null;emit(r)}});return;
 }
 if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
 const filename=pathname==='/'?'/index.html':pathname;
 const absolute=path.resolve(publicDir,'.'+path.normalize(filename));
 if(!absolute.startsWith(publicDir+path.sep))return send(res,403,{error:'Access denied'});
 fs.readFile(absolute,(err,data)=>{if(err)return send(res,404,{error:'Not found'});
  const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(absolute)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(data)
 });
});
server.listen(PORT,HOST,()=>console.log(`Starship Sus multiplayer: http://localhost:${PORT}`));
