(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d');
const WORLD={w:1000,h:640};
const rooms=[
 {name:'REACTOR',x:26,y:241,w:137,h:160,color:'#2c303b'},
 {name:'UPPER ENGINE',x:170,y:39,w:169,h:184,color:'#363d46'},
 {name:'LOWER ENGINE',x:170,y:430,w:169,h:176,color:'#373f46'},
 {name:'SECURITY',x:180,y:277,w:141,h:118,color:'#314352'},
 {name:'MEDBAY',x:349,y:131,w:159,h:135,color:'#394755'},
 {name:'CAFETERIA',x:524,y:25,w:266,h:205,color:'#424e5c'},
 {name:'WEAPONS',x:804,y:48,w:163,h:157,color:'#46525f'},
 {name:'NAVIGATION',x:844,y:239,w:137,h:161,color:'#31495d'},
 {name:'O2',x:699,y:252,w:120,h:128,color:'#3b535c'},
 {name:'SHIELDS',x:811,y:433,w:172,h:177,color:'#394c5b'},
 {name:'COMMUNICATIONS',x:650,y:507,w:151,h:109,color:'#3c4452'},
 {name:'STORAGE',x:472,y:455,w:172,h:164,color:'#454d58'},
 {name:'ELECTRICAL',x:348,y:409,w:114,h:190,color:'#454448'},
 {name:'ADMIN',x:512,y:274,w:169,h:151,color:'#444e5a'}
];
const halls=[
 {x:150,y:312,w:50,h:38},{x:310,y:310,w:240,h:42},{x:310,y:207,w:51,h:290},
 {x:328,y:164,w:235,h:36},{x:461,y:220,w:50,h:270},{x:664,y:195,w:59,h:85},
 {x:774,y:185,w:57,h:356},{x:789,y:304,w:74,h:43},{x:633,y:390,w:184,h:46},
 {x:323,y:407,w:210,h:56},{x:635,y:507,w:30,h:46},{x:336,y:476,w:35,h:64},
 {x:156,y:217,w:35,h:231},{x:630,y:423,w:51,h:101}
];
const palette=[
 {name:'Red',hex:'#C51111'},{name:'Blue',hex:'#132ED1'},{name:'Green',hex:'#117F2D'},
 {name:'Pink',hex:'#ED54BA'},{name:'Orange',hex:'#EF7D0D'},{name:'Yellow',hex:'#F5F557'},
 {name:'Black',hex:'#3F474E'},{name:'White',hex:'#D6E0F0'},{name:'Purple',hex:'#6B2FBC'},
 {name:'Brown',hex:'#71491E'},{name:'Cyan',hex:'#38FEDC'},{name:'Lime',hex:'#50EF39'},
 {name:'Maroon',hex:'#6E0F2D'},{name:'Rose',hex:'#ECC0D3'},{name:'Banana',hex:'#F4F4AB'},
 {name:'Gray',hex:'#8395A7'},{name:'Tan',hex:'#918877'},{name:'Coral',hex:'#EC7578'}
];
const hats=['None','Cap','Beanie','Crown','Top Hat','Plant','Egg','Halo','Cowboy','Party Hat','Chef','Flower'];
const skins=['Classic','Suit','Lab Coat','Overalls','Coat','Tuxedo','Utility'];
const taskTemplate=[
 {id:'wires',name:'Fix Wiring',room:'ELECTRICAL',x:397,y:511,kind:'wires'},
 {id:'swipe',name:'Swipe Card',room:'ADMIN',x:581,y:349,kind:'swipe'},
 {id:'scan',name:'Submit Scan',room:'MEDBAY',x:413,y:218,kind:'hold'},
 {id:'reactor',name:'Start Reactor',room:'REACTOR',x:91,y:315,kind:'reactor'},
 {id:'manifolds',name:'Unlock Manifolds',room:'REACTOR',x:119,y:361,kind:'numbers'},
 {id:'asteroids',name:'Clear Asteroids',room:'WEAPONS',x:893,y:116,kind:'asteroids'},
 {id:'course',name:'Chart Course',room:'NAVIGATION',x:931,y:312,kind:'course'},
 {id:'fuel',name:'Fuel Engines',room:'STORAGE',x:557,y:559,kind:'hold'},
 {id:'shields',name:'Prime Shields',room:'SHIELDS',x:891,y:540,kind:'shields'},
 {id:'filter',name:'Clean O2 Filter',room:'O2',x:754,y:325,kind:'filter'},
 {id:'upload',name:'Upload Data',room:'COMMUNICATIONS',x:720,y:557,kind:'hold'},
 {id:'upper',name:'Align Engine Output',room:'UPPER ENGINE',x:243,y:139,kind:'align'},
 {id:'lower',name:'Align Engine Output',room:'LOWER ENGINE',x:242,y:540,kind:'align'},
 {id:'calibrate',name:'Calibrate Distributor',room:'ELECTRICAL',x:441,y:543,kind:'calibrate'},
 {id:'empty',name:'Empty Garbage',room:'CAFETERIA',x:748,y:158,kind:'empty'},
 {id:'steering',name:'Stabilize Steering',room:'NAVIGATION',x:892,y:357,kind:'align'},
 {id:'divert',name:'Divert Power',room:'ELECTRICAL',x:398,y:456,kind:'align'},
 {id:'download',name:'Download Data',room:'CAFETERIA',x:574,y:173,kind:'hold'}
];
const vents=[
 {id:0,room:'UPPER ENGINE',x:212,y:185,g:0},{id:1,room:'REACTOR',x:73,y:262,g:0},
 {id:2,room:'REACTOR',x:70,y:379,g:0},{id:3,room:'LOWER ENGINE',x:215,y:580,g:0},
 {id:4,room:'MEDBAY',x:365,y:155,g:1},{id:5,room:'SECURITY',x:305,y:292,g:1},{id:6,room:'ELECTRICAL',x:367,y:429,g:1},
 {id:7,room:'CAFETERIA',x:556,y:87,g:2},{id:8,room:'ADMIN',x:644,y:390,g:2},{id:9,room:'CAFETERIA',x:757,y:199,g:2},
 {id:10,room:'WEAPONS',x:944,y:172,g:3},{id:11,room:'NAVIGATION',x:956,y:261,g:3},
 {id:12,room:'NAVIGATION',x:963,y:369,g:3},{id:13,room:'SHIELDS',x:943,y:580,g:3}
];
const repairPanels={Lights:[{id:'electrical',x:390,y:474}],O2:[{id:'oxygen',x:750,y:325},{id:'admin',x:581,y:349}],Reactor:[{id:'top',x:79,y:291},{id:'bottom',x:128,y:363}],Comms:[{id:'radio',x:725,y:556}],Doors:[]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rand=(a,b)=>a+Math.random()*(b-a),shuffle=a=>[...a].sort(()=>Math.random()-.5);
const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=s=>html(String(s??''));
let game={player:{name:'Cyan',x:654,y:128,color:'#38FEDC',imp:false,role:'Crewmate'},bodies:[],tasks:[],sab:null};
let state=null,session=null,stream=null,chosenColor='Cyan',chosenHat='None',chosenSkin='Classic',name='Player',camera={x:0,y:0,w:1000,h:640};
let mini=null,modalType='landing',meetingKey='',lobbyKey='',messageKey='',lastRenderedTasks='',autoTarget=null,keys={},last=0,lastMoveSent=0,movePending=false,serverError='',pingAt=0;
let audioCtx;
function chirp(freq=550,duration=.075){try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.035,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration)}catch(e){}}
function show(content,type='dialog',wide=false){modalType=type;$('overlay').classList.add('show');$('modal').classList.toggle('wide',!!wide);$('modal').innerHTML=content}
function hide(){modalType='none';$('overlay').classList.remove('show');$('modal').innerHTML='';mini=null}
function tip(text){$('hint').textContent=text}
function self(){return state?.players.find(p=>p.id===state.me.id)}
function local(){return game.player}
function currentPhase(){return state?.phase||'landing'}
function taskList(){return state?.me.tasks.map(id=>taskTemplate.find(t=>t.id===id)).filter(Boolean)||[]}
function nearest(items,p=local()){return items.slice().sort((a,b)=>d(a,p)-d(b,p))[0]||null}
function availableTasks(){return taskList().filter(t=>!state.me.done.includes(t.id))}
function nearBody(){return state?.bodies.find(b=>d(b,local())<86)}
function nearVent(){return vents.find(v=>d(v,local())<59)}
function nearKill(){return state?.players.filter(p=>p.id!==state.me.id&&p.alive&&!p.impostorFriend&&p.vent===null&&d(local(),p)<72).sort((a,b)=>d(a,local())-d(b,local()))[0]}
function nearPanel(){const s=state?.sab;if(!s)return null;return repairPanels[s.name]?.find(p=>!s.repaired.includes(p.id)&&d(local(),p)<90)||null}
function nearTask(){return nearest(availableTasks())}
function roomAt(p){return rooms.find(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h)?.name||'HALLWAY'}
function canMove(){return state?.phase==='playing'&&state.me.vent===null&&modalType==='none'}
const lockedDoors={'Cafeteria':[[638,207,25,45]],'MedBay':[[502,214,28,42]],'Security':[[321,292,28,40]],'Electrical':[[458,437,27,48]],'Admin':[[638,390,25,44]],'Storage':[[633,480,27,44]],'Lower Engine':[[320,449,30,43]]};
function walkable(p){if(!(p.x>25&&p.x<975&&p.y>25&&p.y<615&&[...rooms,...halls].some(r=>p.x>=r.x-10&&p.x<=r.x+r.w+10&&p.y>=r.y-10&&p.y<=r.y+r.h+10)))return false;
 if(state?.sab?.name==='Doors'&&state.me.alive){const doors=lockedDoors[state.sab.zone]||lockedDoors.Cafeteria;if(doors.some(([x,y,w,h])=>p.x>=x-4&&p.x<=x+w+4&&p.y>=y-4&&p.y<=y+h+4))return false}return true}
async function api(endpoint,body){let r;try{r=await fetch('/api/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch(e){throw new Error('Server unreachable. Start the Node server or check your internet.')}const b=await r.json();if(!r.ok)throw new Error(b.error||'Request failed');return b}
function send(type,data={}){if(!session)return Promise.resolve();return api('action',{...session,type,...data}).catch(err=>{if(type!=='move')tip('Network issue: '+err.message)})}
function updateConnection(ok){$('connection').classList.toggle('on',!!ok);$('connection').innerHTML='<span class="status-dot"></span> '+(ok?'ONLINE':'RECONNECTING');}
function getName(){return ($('playerName')?.value||name).trim().slice(0,17)||'Crewmate'}
function loadPrefs(){try{const p=JSON.parse(localStorage.getItem('starship-sus-prefs')||'{}');chosenColor=p.color||'Cyan';chosenHat=p.hat||'None';chosenSkin=p.skin||'Classic';name=p.name||'Player'}catch(e){}}
function savePrefs(){localStorage.setItem('starship-sus-prefs',JSON.stringify({color:chosenColor,hat:chosenHat,skin:chosenSkin,name}))}
function saveSession(s){session=s;localStorage.setItem('starship-sus-session',JSON.stringify(s))}
function clearSession(){session=null;if(stream){stream.close();stream=null}state=null;localStorage.removeItem('starship-sus-session');updateConnection(false)}
function connect(s){saveSession(s);if(stream)stream.close();
 const q=new URLSearchParams(s);stream=new EventSource('/api/events?'+q);
 stream.addEventListener('state',ev=>{const data=JSON.parse(ev.data);updateConnection(true);onState(data)});
 stream.onerror=()=>updateConnection(false);
 $('codePill').hidden=false;$('roomCode').textContent=s.code;
 history.replaceState(null,'',location.pathname+'?room='+encodeURIComponent(s.code));
}
function copyInvite(){if(!state)return;const link=location.origin+location.pathname+'?room='+state.code;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(link).then(()=>tip('Invite link copied!')).catch(()=>prompt('Copy invite link:',link));else prompt('Copy invite link:',link)}
async function create(join){name=getName();savePrefs();const code=(join?$('joinCode')?.value:'')?.trim().toUpperCase();
 if(join&&!code){$('landError').textContent='Enter a room code.';return}
 try{const s=await api(join?'join':'create',{name,color:chosenColor,hat:chosenHat,skin:chosenSkin,code});connect(s);chirp(670,.15)}
 catch(e){$('landError').textContent=e.message}}
function renderLanding(err=''){
 const code=new URLSearchParams(location.search).get('room')||'';
 const swatches=palette.map(c=>`<button type="button" class="colorpick ${c.name===chosenColor?'selected':''}" data-color="${c.name}"><span class="mini-crewmate" style="--suit:${c.hex}"></span>${c.name}</button>`).join('');
 show(`<div class="micro">ONLINE CREWMATES · FAN GAME</div><h2>There's an <span style="color:#fc7073">impostor</span> aboard.</h2><p>Create a private lobby, share a link and play with real people on their own phones or computers. No bots are added to online matches.</p><div class="flexrow"><label class="field">YOUR NAME<input id="playerName" maxlength="17" value="${val(name)}" autocomplete="nickname"></label></div>
 <div class="color-header"><span>CHOOSE YOUR COLOUR</span><span>ALL 18 AVAILABLE</span></div><div class="color-grid">${swatches}</div>
 <div class="flexrow" style="margin-top:13px"><label class="field">HAT<select id="hatSelect">${hats.map(n=>`<option ${n===chosenHat?'selected':''}>${n}</option>`).join('')}</select></label><label class="field">SKIN<select id="skinSelect">${skins.map(n=>`<option ${n===chosenSkin?'selected':''}>${n}</option>`).join('')}</select></label></div>
 <div class="divider"></div><div class="flexrow"><button id="createRoom" class="primary">＋ CREATE ONLINE ROOM</button><label class="field" style="max-width:180px">ROOM CODE<input id="joinCode" maxlength="6" placeholder="e.g. 45A0CF" value="${val(code)}" autocapitalize="characters"></label><button id="joinRoom" class="secondary">JOIN FRIENDS →</button></div><div class="error" id="landError">${val(err)}</div><div class="banner">3–15 real players to start. The host controls when a round begins. Free typing is enabled in the lobby, during rounds and meetings; ghosts have a separate chat.</div><p>Real internet play requires this game to be hosted on an online Node.js server. A room code only works when all players use the same hosted URL.</p>`,'landing',true);
 document.querySelectorAll('.colorpick').forEach(b=>b.onclick=()=>{chosenColor=b.dataset.color;document.querySelectorAll('.colorpick').forEach(x=>x.classList.toggle('selected',x===b));chirp()});
 $('hatSelect').onchange=e=>chosenHat=e.target.value;$('skinSelect').onchange=e=>chosenSkin=e.target.value;
 $('createRoom').onclick=()=>create(false);$('joinRoom').onclick=()=>create(true);
 $('joinCode').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();create(true)}};
}
function playerMarkup(p){return `<div class="userrow"><span class="statusname"><i style="background:${p.color}"></i><strong>${val(p.name)}</strong>${p.host?' 👑':''}</span><span class="muted">${p.connected?'● Connected':'○ Reconnecting'}</span></div>`}
function renderLobby(){if(!state)return;const hash=JSON.stringify(state.players.map(p=>[p.id,p.name,p.color,p.hat,p.skin,p.connected,p.host]))+'|'+state.me.host;if(modalType==='lobby'&&lobbyKey===hash){renderLobbyMessages();return;}
 lobbyKey=hash;
 show(`<div class="micro">WAITING ROOM · THE SKELD</div><h2>Room <span style="color:#f9db81">${val(state.code)}</span></h2><p>Share the code or invite link. Choose your colour and costume; each colour can only be used once.</p><div class="flexrow"><button class="primary" id="invite">⧉ COPY INVITE LINK</button><button class="secondary" id="leaveRoom">LEAVE</button></div>
 <div class="divider"></div><div class="micro">CREW · ${state.players.length} / 15</div><div style="max-height:220px;overflow:auto;margin:10px 0">${state.players.map(playerMarkup).join('')}</div>
 <div class="color-header"><span>COLOUR</span><span>18 COLOURS</span></div><div class="color-grid">${palette.map(c=>{const used=state.players.some(p=>p.colorName===c.name&&p.id!==state.me.id);return `<button class="colorpick ${c.name===state.me.colorName?'selected':''}" data-color="${c.name}" ${used?'disabled':''}><span class="mini-crewmate" style="--suit:${c.hex}"></span>${c.name}</button>`}).join('')}</div>
 <div class="flexrow" style="margin-top:10px"><label class="field">HAT<select id="lobbyHat">${hats.map(n=>`<option ${state.me.hat===n?'selected':''}>${n}</option>`).join('')}</select></label><label class="field">SKIN<select id="lobbySkin">${skins.map(n=>`<option ${state.me.skin===n?'selected':''}>${n}</option>`).join('')}</select></label></div>
 <div class="banner">${state.me.host?'You are the host. Start with 3 or more players.':'Waiting for the host to start. Talk to players in the chat panel.'}</div>
 ${state.me.host?`<button id="startGame" class="primary" ${state.players.length<3?'disabled':''}>▶ START MATCH (${state.players.length} / 15)</button>`:''}
 <p>Roles are secretly randomised at the start. There is 1 impostor for 3–7 players and 2 impostors for 8–15 players.</p><div class="micro" style="margin-top:12px">LOBBY CHAT</div><div class="meeting-scroll" id="lobbyMessages"></div><form id="lobbyChat" class="meeting-input"><input id="lobbyInput" maxlength="240" placeholder="Write your own message…" aria-label="Lobby chat"><button type="submit">SEND</button></form>`,'lobby',true);
 $('invite').onclick=copyInvite;$('leaveRoom').onclick=leave;
 document.querySelectorAll('.colorpick').forEach(b=>b.onclick=()=>send('look',{color:b.dataset.color,hat:$('lobbyHat').value,skin:$('lobbySkin').value}));
 $('lobbyHat').onchange=e=>send('look',{color:state.me.colorName,hat:e.target.value,skin:$('lobbySkin').value});
 $('lobbySkin').onchange=e=>send('look',{color:state.me.colorName,hat:$('lobbyHat').value,skin:e.target.value});
 if(state.me.host)$('startGame').onclick=()=>send('start');
 $('lobbyChat').onsubmit=e=>{e.preventDefault();const input=$('lobbyInput'),text=input.value.trim();if(text){send('chat',{text});input.value=''}};
 renderLobbyMessages();
}
async function leave(){if(session)await send('leave');clearSession();history.replaceState(null,'',location.pathname);renderLanding()}
function onState(next){const previous=state;state=next;
 if(!previous||previous.me.id!==next.me.id){const me=self();game.player={x:me?.x??654,y:me?.y??128,walk:0,face:1,moving:false,color:next.me.color,name:next.me.name,hat:next.me.hat,skin:next.me.skin,imp:next.me.imp,role:next.me.role};}
 const me=self();if(me){game.player.name=me.name;game.player.color=me.color;game.player.hat=me.hat;game.player.skin=me.skin;game.player.imp=next.me.imp;game.player.role=next.me.role;game.player.ghost=!next.me.alive;game.player.shield=me.shield;game.player.disguise=me.disguise;game.player.vanish=me.vanish;
  if(next.phase!=='playing'||next.me.vent!==null||d(game.player,me)>95){game.player.x=me.x;game.player.y=me.y;game.player.walk=me.walk;game.player.face=me.face}}
 game.bodies=next.bodies;game.tasks=taskList().map(t=>({...t,done:next.me.done.includes(t.id)}));game.sab=next.sab?.name||null;
 chosenColor=next.me.colorName;chosenHat=next.me.hat;chosenSkin=next.me.skin;
 $('roomCode').textContent=next.code;$('codePill').hidden=false;
 refreshHUD();
 if(next.phase==='lobby'){renderLobby();return}
 if(next.phase==='playing'){
  if(['landing','lobby','meeting','ended'].includes(modalType))hide();
  if(previous?.phase==='lobby'||!previous)chirp(next.me.imp?215:860,.25);
  if(previous?.phase==='meeting'&&modalType==='meeting')hide();
 }
 if(next.phase==='meeting'){renderMeeting();return}
 if(next.phase==='ended'){renderEnd();return}
}
function refreshHUD(){if(!state)return;
 const completed=state.progressDone,total=state.progressTotal,percentage=total?Math.round(completed/total*100):0;
 $('taskStat').textContent=completed+' / '+total;$('crewStat').textContent=state.players.length+' / 15';
 $('pct').textContent=percentage+'%';$('progress').style.width=percentage+'%';
 $('roleLabel').textContent=state.phase==='lobby'?'LOBBY':state.me.role.toUpperCase();$('roleLabel').style.color=state.me.imp?'#fb858e':'#b7f57d';
 $('taskLine').textContent=state.me.imp?'Fake tasks — eliminate crew':state.me.alive?'Complete ship tasks':'Ghosts can finish tasks';
 const tk=state.me.tasks.join('|')+'#'+state.me.done.join('|')+'#'+state.me.imp;
 if(tk!==lastRenderedTasks){lastRenderedTasks=tk;$('tasks').innerHTML=state.me.imp?'<div class="banner">Use vents, sabotage and deception. Fake a task to blend in.</div>':taskList().map(t=>`<div class="taskline ${state.me.done.includes(t.id)?'done':''}"><span class="tick">${state.me.done.includes(t.id)?'✓':''}</span><span>${val(t.room)} · ${val(t.name)}</span></div>`).join('')||'<p class="muted">Assigned after the start.</p>'}
 const inGame=state.phase!=='lobby';
 $('playersList').innerHTML='<div class="crewlist">'+state.players.map(p=>`<div class="crewrow"><span class="crewname"><i class="dot" style="background:${p.color}"></i><strong>${val(p.name)}${p.id===state.me.id?' (YOU)':''}</strong></span><span class="rolechip ${!p.alive?'dead':''}">${!inGame?(p.host?'HOST':'READY'):p.id===state.me.id?state.me.role.toUpperCase():p.impostorFriend?'IMPOSTOR':!state.me.alive&&!p.alive?'GHOST':'CREW'}</span></div>`).join('')+'</div>';
 $('aliveStat').textContent=state.phase==='lobby'?'WAITING':state.players.filter(p=>p.alive).length+' ALIVE';
 $('roomLabel').textContent='● '+roomAt(game.player)+' · '+(state.me.alive?'ALIVE':'GHOST');
 const sab=$('sabotageBanner');sab.hidden=!state.sab;if(state.sab)sab.textContent=`⚠ ${state.sab.name.toUpperCase()} · ${state.sab.seconds}s`;
 updateChat();updateActions();
}
function updateChat(){if(!state)return;
 const alive=state.me.alive,phase=state.phase,allowed=['lobby','playing','meeting'].includes(phase);
 $('chatInput').disabled=!allowed;$('chatForm').querySelector('button').disabled=!allowed;
 $('chatInput').placeholder=!alive?'Ghost-only chat…':phase==='lobby'?'Type freely in the lobby…':phase==='meeting'?'Discuss and vote…':'Type a live message to players…';
 $('chatMode').textContent=phase==='lobby'?'LOBBY':!alive?'GHOST CHAT':phase==='meeting'?'MEETING':'LIVE CHAT';
 $('chatNote').textContent=!alive?'Only other ghosts can read your messages.':'Free-text chat. Press Enter to send; living players see live messages.';
 const msgs=state.messages||[];const key=msgs.map(m=>m.id).join('/');if(key===messageKey)return;
 messageKey=key;const box=$('chatlog');box.innerHTML=msgs.map(m=>`<div class="chatitem ${m.kind==='system'?'system':''}"><span class="who" style="color:${val(m.color)}">${val(m.by)}:</span> ${val(m.text)}</div>`).join('');box.scrollTop=box.scrollHeight;
 if(modalType==='meeting')renderMeetingMessages();if(modalType==='lobby')renderLobbyMessages();
}
function renderLobbyMessages(){const place=$('lobbyMessages');if(!place||!state)return;place.innerHTML=(state.messages||[]).slice(-30).map(m=>`<div class="meeting-msg"><strong style="color:${val(m.color)}">${val(m.by)}:</strong> ${val(m.text)}</div>`).join('');place.scrollTop=place.scrollHeight}
function renderMeetingMessages(){const place=$('meetingMessages');if(!place)return;place.innerHTML=(state.messages||[]).filter(m=>m.kind==='meeting'||m.kind==='dead'||m.kind==='system').slice(-30).map(m=>`<div class="meeting-msg"><strong style="color:${val(m.color)}">${val(m.by)}:</strong> ${val(m.text)}</div>`).join('');place.scrollTop=place.scrollHeight}
function renderMeeting(){const m=state?.meeting;if(!m)return;const key=m.phase+'|'+m.voted+'|'+(m.result?.text||'');
 if(key===meetingKey&&modalType==='meeting'){const time=$('meetingCountdown');if(time)time.textContent=m.seconds+'s';const count=$('votesCast');if(count)count.textContent=m.votesCast+' / '+m.eligible+' voted';return}
 meetingKey=key;mini=null;autoTarget=null;
 const header=`<div class="micro" style="color:#ffb9b9">⚑ EMERGENCY MEETING · ${m.phase.toUpperCase()}</div><h2>${val(m.reason)}</h2><p>Voting follows the classic rules: every living person gets one vote, Skip is allowed, and ties eject nobody.</p><div class="flexrow" style="justify-content:space-between"><strong id="votesCast">${m.votesCast} / ${m.eligible} voted</strong><span class="meetingTimer" id="meetingCountdown">${m.seconds}s</span></div>`;
 let box='';
 if(m.phase==='discussion')box='<div class="banner">DISCUSSION · Talk now. Voting starts automatically after 25 seconds.</div>';
 else if(m.phase==='voting'){
  box=state.me.alive&&!m.voted?`<div class="micro" style="margin-top:12px">CHOOSE WHO TO EJECT</div>${state.players.filter(p=>p.alive).map(p=>`<button class="choice" data-vote="${val(p.id)}"><i style="background:${val(p.color)}"></i>${val(p.name)}${p.id===state.me.id?' (YOU)':''}</button>`).join('')}<button class="choice" data-vote="skip"><i style="background:#cbd1d8"></i>SKIP VOTE</button>`:
  '<div class="banner">'+(state.me.alive?'Vote submitted. Waiting for other players…':'You are a ghost and cannot vote.')+'</div>';
 }else if(m.phase==='results')box=`<div class="results"><h2>${val(m.result?.text||'Meeting complete')}</h2><p>${m.result?.ejected?'The ejected player becomes a ghost.':'The crew returns to the ship.'}</p>${(m.tally||[]).map(t=>`<div class="between"><span>${val(t.name)}</span><b>${t.votes} vote${t.votes===1?'':'s'}</b></div>`).join('')}</div>`;
 show(header+box+`<div class="micro" style="margin-top:13px">DISCUSSION CHAT ${state.me.alive?'':'· GHOSTS ONLY'}</div><div class="meeting-scroll" id="meetingMessages"></div><form id="meetingChat" class="meeting-input"><input id="meetingInput" maxlength="240" aria-label="Chat in meeting" placeholder="${state.me.alive?'Type your argument…':'Talk with other ghosts…'}"><button type="submit">SEND</button></form>`, 'meeting',true);
 document.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>{chirp(590,.11);send('vote',{target:b.dataset.vote})});
 $('meetingChat').onsubmit=e=>{e.preventDefault();const inp=$('meetingInput');const text=inp.value.trim();if(text){send('chat',{text});inp.value=''}};
 renderMeetingMessages();
}
function renderEnd(){if(modalType==='ended')return;const r=state?.result;if(!r)return;const won=(r.winner==='Impostors')===state.me.imp;
 show(`<div class="micro">${won?'✦ VICTORY':'✕ DEFEAT'}</div><h2 style="color:${won?'#b8fd98':'#ff9da1'}">${val(r.winner).toUpperCase()} WIN</h2><p>${val(r.reason)}</p><div class="banner">Your role: <strong>${val(state.me.role)}</strong> · Crewmates' tasks: <strong>${state.progressDone} / ${state.progressTotal}</strong></div><div class="micro">THE CREW</div>${state.players.map(p=>`<div class="userrow"><span class="statusname"><i style="background:${p.color}"></i>${val(p.name)}</span><span>${p.impostorFriend||p.id===state.me.id&&state.me.imp?'IMPOSTOR':'CREW'}</span></div>`).join('')}${state.me.host?'<button class="primary" id="playAgain">↻ RETURN TO LOBBY</button>':'<div class="banner">Waiting for the host to start the next match.</div>'}<button class="secondary" id="endLeave">LEAVE ROOM</button>`,'ended',true);
 if(state.me.host)$('playAgain').onclick=()=>send('restart');$('endLeave').onclick=leave;chirp(won?970:190,.24)
}
function updateActions(){const playing=state?.phase==='playing',me=state?.me;if(!me){document.querySelectorAll('.act').forEach(b=>b.disabled=true);return}
 const active=playing&&!['task','repair','vent','role','sabotage','map'].includes(modalType);
 const t=nearTask(),panel=nearPanel(),vent=nearVent(),body=nearBody(),kill=nearKill();
 $('useBtn').disabled=!active||me.imp||me.vent!==null||!(panel||t&&d(t,local())<90);
 $('ventBtn').style.display=me.imp||me.role==='Engineer'?'inline-block':'none';$('ventBtn').disabled=!active||!me.alive||me.vent===null&&!vent;
 $('ventBtn').innerHTML=me.vent===null?'▤ VENT <small>V</small>':'↗ EXIT / MOVE <small>V</small>';
 $('killBtn').style.display=me.imp?'inline-block':'none';$('killBtn').disabled=!active||!me.imp||!me.alive||me.killCd>0||!kill||me.vent!==null||self()?.vanish;
 $('roleBtn').style.display=['Scientist','Tracker','Detective','Shapeshifter','Phantom','Guardian Angel'].includes(me.role)?'inline-block':'none';
 $('roleBtn').disabled=!active||me.abilityCd>0||me.role==='Guardian Angel'&&me.alive||me.role!=='Guardian Angel'&&!me.alive||me.imp&&me.vent!==null||state.sab?.name==='Comms'&&['Scientist','Tracker','Detective'].includes(me.role);
 $('sabBtn').style.display=me.imp?'inline-block':'none';$('sabBtn').disabled=!active||!me.imp||!me.alive||me.sabCd>0||!!state.sab;
 $('reportBtn').disabled=!active||!me.alive||me.vent!==null||!body;
 $('meetingBtn').disabled=!active||!me.alive||me.vent!==null||me.meetings<=0||!!state.sab||d(local(),{x:657,y:136})>=95;
 $('mapBtn').disabled=!active;
 if(!playing){tip(state?.phase==='lobby'?'Share the room code and wait for the host.':'Discussion and voting in progress.');return}
 if(me.vent!==null)tip('Hidden in a vent · press V to travel or exit');
 else if(state.sab&&!me.imp)tip('⚠ '+state.sab.name+' sabotage! Move to flashing repair panels.');
 else if(body)tip('⚑ A body is nearby — press REPORT');
 else if(panel)tip('⚠ Emergency system panel — press USE');
 else if(t&&!me.imp&&d(t,local())<90)tip('⚡ '+t.name+' — press USE');
 else if(vent&&(me.imp||me.role==='Engineer'))tip('▤ Vent nearby — press V');
 else if(kill&&me.imp)tip(me.killCd?'Kill cooldown: '+me.killCd+' seconds':'☠ Kill in range — press K');
 else tip((me.alive?'Move with arrows, WASD or touch.':'Ghost: finish tasks or protect crewmates.')+' · '+me.role);
}
function use(){if(state?.phase!=='playing'||modalType!=='none'||state.me.imp)return;const panel=nearPanel();if(panel){openRepair(panel);return}const t=nearTask();if(t&&d(local(),t)<90)openTask(t)}
function report(){if(state?.phase==='playing'&&state.me.alive&&modalType==='none'&&nearBody())send('report')}
function emergency(){if(state?.phase==='playing'&&state.me.alive&&modalType==='none')send('emergency')}
function vent(){if(state?.phase!=='playing'||modalType!=='none'||!(state.me.imp||state.me.role==='Engineer')||!state.me.alive)return;
 const current=state.me.vent===null?nearVent():vents.find(v=>v.id===state.me.vent);if(!current)return;
 if(state.me.vent===null){send('vent',{target:current.id});return}
 const peers=vents.filter(v=>v.g===current.g);
 show(`<div class="micro">▤ VENT SYSTEM</div><h2>${val(current.room)}</h2><p>Hidden from living players. Choose a connected vent to travel, or exit into this room.</p>${peers.map(v=>`<button class="choice" data-vent="${v.id}">▤ ${val(v.room)} ${v.id===current.id?'· CURRENT':''}</button>`).join('')}<button class="secondary" id="exitVent">EXIT VENT HERE</button>`,'vent');
 document.querySelectorAll('[data-vent]').forEach(b=>b.onclick=()=>{send('vent',{target:+b.dataset.vent});hide()});
 $('exitVent').onclick=()=>{send('unvent');hide()};
}
function kill(){if(state?.phase!=='playing'||!state.me.imp||state.me.killCd>0||modalType!=='none')return;const target=nearKill();if(target){chirp(180,.21);send('kill',{target:target.id})}}
const sabotageNodes=[
 {kind:'Reactor',x:91,y:310,emoji:'☢',label:'REACTOR',hint:'Critical timer · two scanners'},
 {kind:'O2',x:752,y:313,emoji:'O₂',label:'OXYGEN',hint:'Critical timer · two keypads'},
 {kind:'Lights',x:406,y:508,emoji:'ϟ',label:'LIGHTS',hint:'Reduce vision'},
 {kind:'Comms',x:729,y:552,emoji:'⌁',label:'COMMS',hint:'Jam communications'}
];
const doorNodes=[
 {x:638,y:229,label:'Cafeteria',door:'Cafeteria'},
 {x:512,y:226,label:'MedBay',door:'MedBay'},
 {x:325,y:292,label:'Security',door:'Security'},
 {x:467,y:464,label:'Electrical',door:'Electrical'},
 {x:645,y:432,label:'Admin',door:'Admin'},
 {x:648,y:500,label:'Storage',door:'Storage'},
 {x:320,y:478,label:'Lower Engine',door:'Lower Engine'}
];
const deckShapes=[
 {name:'REACTOR',d:'M38 243 L131 243 L162 266 L162 371 L127 401 L38 390 L25 359 L25 275 Z',x:96,y:263},
 {name:'UPPER ENGINE',d:'M188 39 H314 L338 65 V200 L312 224 H183 L171 206 V57 Z',x:253,y:65},
 {name:'LOWER ENGINE',d:'M183 429 H314 L338 453 V582 L314 607 H187 L169 590 V453 Z',x:251,y:454},
 {name:'SECURITY',d:'M192 278 H309 L322 293 V384 L310 398 H193 L180 384 V290 Z',x:250,y:299},
 {name:'MEDBAY',d:'M365 133 H494 L508 146 V254 L496 268 H361 L348 254 V148 Z',x:426,y:154},
 {name:'CAFETERIA',d:'M572 25 H742 L790 65 V188 L752 228 H559 L523 188 V77 Z',x:657,y:54},
 {name:'WEAPONS',d:'M826 48 H947 L967 77 V183 L946 206 H820 L804 186 V77 Z',x:882,y:72},
 {name:'NAVIGATION',d:'M857 238 H961 L982 264 V365 L957 400 H853 L844 386 V255 Z',x:914,y:260},
 {name:'O2',d:'M716 252 H809 L820 264 V367 L807 382 H710 L698 365 V271 Z',x:760,y:273},
 {name:'SHIELDS',d:'M830 433 H965 L984 461 V579 L969 609 H827 L811 584 V459 Z',x:900,y:457},
 {name:'COMMUNICATIONS',d:'M667 508 H787 L801 522 V597 L783 617 H664 L649 600 V523 Z',x:723,y:528},
 {name:'STORAGE',d:'M493 455 H625 L645 475 V599 L624 620 H493 L471 599 V479 Z',x:554,y:480},
 {name:'ELECTRICAL',d:'M361 411 H448 L463 433 V579 L451 600 H361 L348 582 V432 Z',x:404,y:435},
 {name:'ADMIN',d:'M531 274 H663 L681 293 V408 L662 428 H529 L512 409 V292 Z',x:597,y:296}
];
const deckProps=`
 <g class="deck-props" stroke="#0b2831" stroke-width="4">
  <g fill="#548d99"><circle cx="601" cy="116" r="28"/><circle cx="700" cy="121" r="28"/><circle cx="650" cy="183" r="30"/><circle cx="650" cy="183" r="10" fill="#253f50"/></g>
  <g fill="#506b7b"><rect x="368" y="180" width="60" height="42" rx="9"/><rect x="435" y="180" width="57" height="42" rx="9"/><rect x="534" y="338" width="120" height="62" rx="14"/></g>
  <g fill="#47758a"><circle cx="245" cy="132" r="49"/><circle cx="245" cy="529" r="49"/><circle cx="902" cy="129" r="46"/><circle cx="898" cy="539" r="44"/></g>
  <g fill="#183447"><rect x="863" y="305" width="44" height="37" rx="5"/><rect x="922" y="305" width="42" height="37" rx="5"/><rect x="196" y="329" width="35" height="31" rx="4"/><rect x="247" y="329" width="35" height="31" rx="4"/></g>
  <g fill="#6aaebb" stroke-width="2"><rect x="362" y="468" width="18" height="48" rx="3"/><rect x="389" y="468" width="18" height="48" rx="3"/><rect x="416" y="468" width="18" height="48" rx="3"/><rect x="720" y="314" width="71" height="38" rx="10"/></g>
  <g fill="#ad9b74"><rect x="492" y="545" width="34" height="48" rx="4"/><rect x="535" y="545" width="34" height="48" rx="4"/><rect x="578" y="545" width="34" height="48" rx="4"/></g>
  <g fill="#38566a"><rect x="51" y="308" width="84" height="45" rx="11"/><rect x="663" y="552" width="114" height="29" rx="7"/></g>
 </g>`;
function shipBlueprint(mode='crew'){
 const sab=mode==='sabotage';
 const icons=sab?sabotageNodes.map(n=>`<g class="system-target" data-sys="${n.kind}" tabindex="0" role="button" aria-label="Sabotage ${n.label}" transform="translate(${n.x},${n.y})"><circle r="29" fill="#3a111c" stroke="#ffb5b0" stroke-width="3"/><circle r="23" fill="#de4d52" opacity=".92"/><text y="8" font-size="23" text-anchor="middle" fill="white" font-weight="900">${n.emoji}</text><title>${n.hint}</title></g>`).join('')+doorNodes.map(n=>`<g class="door-target" data-door="${n.door}" tabindex="0" role="button" aria-label="Lock ${n.label} doors" transform="translate(${n.x},${n.y})"><rect x="-16" y="-16" width="32" height="32" rx="4" stroke="#ffd9bd" stroke-width="2" fill="#ab3446"/><path d="M-8 -6H8M-8 0H8M-8 6H8" stroke="white" stroke-width="3"/><title>Lock doors: ${n.label}</title></g>`).join(''):
 availableTasks().map(t=>`<g class="task-pin" transform="translate(${t.x},${t.y})"><circle r="14" fill="#efcd50" stroke="#fff2a6" stroke-width="3"/><text y="6" text-anchor="middle" font-size="18" fill="#322917" font-weight="1000">!</text><title>${val(t.room)}: ${val(t.name)}</title></g>`).join('')+
 vents.map(v=>`<g transform="translate(${v.x},${v.y})"><rect x="-12" y="-8" width="24" height="16" rx="2" fill="#172a34" stroke="#95c4d1" stroke-width="2"/><path d="M-7 -5V5M-2 -5V5M3 -5V5M8 -5V5" stroke="#87aebb" stroke-width="2"/><title>${v.room} vent</title></g>`).join('')+
 `<g transform="translate(${Math.round(game.player.x)},${Math.round(game.player.y)})"><circle r="12" fill="#67fff2" opacity=".26"/><circle r="6" fill="#adfffd" stroke="#123943" stroke-width="3"/><title>Your location</title></g>`;
 return `<div class="ship-chart ${sab?'sabotage-chart':'task-chart'}" aria-label="Interactive ship overview"><svg viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Skeld systems and room map">
 <defs>
  <pattern id="skeld-tiles" width="27" height="27" patternUnits="userSpaceOnUse"><rect width="27" height="27" fill="#2a4754"/><path d="M27 0H0V27" fill="none" stroke="#8ba7b7" stroke-opacity=".2" stroke-width="1.5"/><circle cx="3" cy="3" r="1" fill="#a8c8d1" opacity=".18"/></pattern>
  <pattern id="skeld-ridge" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 16L16 0" stroke="#8cb8c4" stroke-opacity=".11" stroke-width="2"/></pattern>
  <linearGradient id="skeld-metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5d7988"/><stop offset=".16" stop-color="#2f5061"/><stop offset="1" stop-color="#233743"/></linearGradient>
 </defs>
 <path d="M27 232H166V35H340V127H515V17H793V42H953V224H981V434H991V622H806V618H648V628H458V609H342V620H164V414H27V397H12V253H27Z" stroke="#9fb9c7" stroke-width="8" fill="#142b37" stroke-linejoin="round"/>
 ${halls.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3" fill="url(#skeld-tiles)" stroke="#4a7287" stroke-width="3"/>`).join('')}
 ${deckShapes.map(r=>`<g class="deck-room"><path d="${r.d}" fill="url(#skeld-metal)" stroke="#c3d2d5" stroke-width="5"/><path d="${r.d}" fill="url(#skeld-tiles)" opacity=".65" stroke="none"/><path d="${r.d}" fill="url(#skeld-ridge)" opacity=".32" stroke="none"/></g>`).join('')}
 ${deckProps}
 ${deckShapes.map(r=>`<text x="${r.x}" y="${r.y}" text-anchor="middle" class="ship-room-name">${r.name}</text>`).join('')}
 ${icons}
 </svg></div>`;
}
function sabotage(){if(state?.phase!=='playing'||!state.me.imp||state.me.sabCd>0||state.sab||modalType!=='none')return;
 show(`<button class="xclose" id="closeSab">✕</button><div class="micro" style="color:#ff9ca3">⚠ IMPOSTOR SABOTAGE · THE SKELD</div><h2>Choose a system to sabotage</h2><p>Tap a <b>red circular system</b> for Reactor, O2, Lights or Comms. Tap a <b>square door icon</b> to lock doors in that area. Reactor and O2 are critical.</p>${shipBlueprint('sabotage')}<div class="sabotage-legend"><span>● SYSTEMS</span><span>▤ LOCK DOORS</span><span>⚠ 42s sabotage cooldown</span></div><div class="banner" id="sabotageChosen">Select a system on the map.</div>`,'sabotage',true);
 const activate=el=>{const kind=el.dataset.sys||'Doors',zone=el.dataset.door;send('sabotage',{name:kind,zone});hide()};
 document.querySelectorAll('[data-sys],[data-door]').forEach(b=>{b.addEventListener('click',()=>activate(b));b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(b)}})});
 $('closeSab').onclick=hide;
}

function role(){if(state?.phase!=='playing'||state.me.abilityCd>0||modalType!=='none')return;const r=state.me.role;
 if(r==='Scientist'){
  send('ability');show(`<div class="micro">▤ SCIENTIST · PORTABLE VITALS</div><h2>Vital signs</h2><p>See the living and deceased. Uses your ability cooldown.</p>${state.players.map(p=>`<div class="userrow"><span class="statusname"><i style="background:${p.color}"></i>${val(p.name)}</span><strong style="color:${p.alive?'#9bea92':'#ff828d'}">${p.alive?'ALIVE':'DEAD'}</strong></div>`).join('')}<button class="primary" id="closeRole">CLOSE</button>`,'role');$('closeRole').onclick=hide;return;
 }
 if(r==='Phantom'){send('ability');tip('Phantom vanished for 13 seconds. Cannot kill while invisible.');chirp(330,.16);return}
 const targetable=state.players.filter(p=>p.id!==state.me.id&&(r==='Guardian Angel'?(p.alive&&!p.impostorFriend):p.alive));
 const desc={Shapeshifter:'Copy a living player’s colour, hat and appearance for 22 seconds.',Tracker:'Track another crewmate’s location on your map for 30 seconds.',Detective:'Ask for the player’s most recently visited room.', 'Guardian Angel':'Shield a living crewmate from one kill for 24 seconds.'}[r];
 if(!desc)return;
 show(`<div class="micro">★ ${val(r).toUpperCase()} ABILITY</div><h2>Choose a crewmate</h2><p>${val(desc)}</p>${targetable.map(p=>`<button class="choice" data-target="${val(p.id)}"><i style="background:${p.color}"></i>${val(p.name)}</button>`).join('')}<button class="secondary" id="closeRole">CLOSE</button>`,'role');
 document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{send('ability',{target:b.dataset.target});hide();chirp(650,.2)});$('closeRole').onclick=hide;
}
function map(){if(state?.phase!=='playing'||modalType!=='none')return;
 show(`<button class="xclose" id="mapClose">✕</button><div class="micro">▧ THE SKELD · NAVIGATION MAP</div><h2>${val(roomAt(game.player))}</h2>${shipBlueprint('crew')}<div class="sabotage-legend"><span>● YELLOW: ASSIGNED TASKS</span><span>▤ VENTS</span></div><div class="banner">${state.me.imp?'Your task markers are fake. Use the sabotage button to disable systems.':availableTasks().map(t=>t.room+' · '+t.name).join(' · ')||'All tasks complete'}</div>${state.me.track?`<p style="color:#aaffbf">TRACKER: ${val(state.me.track.name)} — ${val(roomAt(state.me.track))}</p>`:''}${state.me.intel?`<p>DETECTIVE NOTES: ${val(state.me.intel)}</p>`:''}`,'map',true);$('mapClose').onclick=hide;
}

function openRepair(panel){const sabotageName=state.sab?.name;if(!sabotageName)return;mini={kind:'repair',panel,progress:0,holding:false};let contents='';
 if(sabotageName==='Lights')contents=`<p>Restore the lighting circuit by flipping every breaker to ON.</p><div class="mini-grid">${Array.from({length:5},(_,i)=>`<button class="tile" data-switch="${i}">OFF</button>`).join('')}</div><p id="repairHint">0 / 5 switches</p>`;
 else if(sabotageName==='O2'){mini.pin=String(Math.floor(rand(1000,9999)));contents=`<p>Emergency oxygen code: <strong style="color:#ffe39b;font-size:23px">${mini.pin}</strong></p><input type="number" id="oxygenPin" inputmode="numeric" placeholder="Enter 4-digit code" style="width:100%;padding:12px;border-radius:8px;background:#111e2a;color:#fff;border:2px solid #688293"><button class="primary" id="repairSubmit">CONFIRM CODE</button><p id="repairHint">Panel ${val(panel.id)} needs a code.</p>`}
 else if(sabotageName==='Reactor')contents=`<p>Hold the reactor hand scanner for 3 seconds to stabilize ${val(panel.id)} control.</p><div class="transferbar"><div id="repairProgress"></div></div><button class="primary" id="holdRepair">HOLD SCANNER</button><p id="repairHint">0%</p>`;
 else contents=`<p>Tune the communications signal to 73%.</p><input id="radioFreq" type="range" min="0" max="100" value="20" class="slider"><p id="repairHint">20%</p><button id="repairSubmit" class="primary">RESTORE COMMS</button>`;
 show(`<button class="xclose" id="cancelRepair">✕</button><div class="micro">⚠ EMERGENCY REPAIR · ${val(sabotageName).toUpperCase()}</div><h2>Restore ${val(sabotageName)}</h2>${contents}`,'repair');
 $('cancelRepair').onclick=hide;
 const finish=()=>{send('repair',{panel:panel.id});chirp(880,.18);hide()};
 if(sabotageName==='Lights'){
  const flipped=new Set();document.querySelectorAll('[data-switch]').forEach(b=>b.onclick=()=>{flipped.add(b.dataset.switch);b.textContent='ON';b.classList.add('lit');$('repairHint').textContent=flipped.size+' / 5 switches';if(flipped.size===5)finish()})}
 else if(sabotageName==='O2')$('repairSubmit').onclick=()=>{if($('oxygenPin').value===mini.pin)finish();else $('repairHint').textContent='Wrong code — try again.'};
 else if(sabotageName==='Reactor')bindHold($('holdRepair'));
 else{$('radioFreq').oninput=e=>$('repairHint').textContent=e.target.value+'%';$('repairSubmit').onclick=()=>{if(Math.abs(+$('radioFreq').value-73)<=4)finish();else $('repairHint').textContent='Tune closer to 73%'}}
}
function finishMinigame(){if(!mini)return;
 if(mini.kind==='repair'){const panel=mini.panel;send('repair',{panel:panel.id})}
 else if(mini.task)send('task',{task:mini.task.id});
 chirp(940,.2);hide()
}
function bindHold(btn){if(!btn)return;const down=e=>{e.preventDefault();if(mini)mini.holding=true},up=()=>{if(mini)mini.holding=false};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointerleave',up);btn.addEventListener('pointercancel',up)}
function taskMarkup(t){let body='';
 switch(t.kind){
 case 'wires':mini.colors=['#ff455c','#e0c343','#2fbad0','#c443db'];mini.order=shuffle(mini.colors);mini.pending=null;mini.matches=[];body=`<p>Match each cable to the terminal with the same colour.</p><div class="wire-board" id="wireBoard"><svg id="wireTraces" class="wire-traces" aria-hidden="true"></svg><div class="wire-column"><div class="wire-term-label">01 · SOURCE</div>${mini.colors.map((c,i)=>`<button class="wire-end" style="--wire:${c}" data-side="left" data-idx="${i}">●════</button>`).join('')}</div><div class="wire-column"><div class="wire-term-label">02 · DESTINATION</div>${mini.order.map((c,i)=>`<button class="wire-end" style="--wire:${c}" data-side="right" data-idx="${i}">════●</button>`).join('')}</div></div><div class="subtle" id="taskHint">0 / 4 wires connected</div>`;break;
 case 'swipe':mini.started=0;body=`<p>Drag the ID card from left to right at a steady speed.</p><div class="card-reader"><div class="reader-slot">CARD READER <span>▬ ▬ ▬ ▬</span></div><div class="card-track" id="cardTrack"><div class="card-graphic drag-card" id="dragCard" role="slider" tabindex="0" aria-label="Drag card to swipe" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="card-chip">▦</div><div>★ CREW ID · ${val(state.me.name)}</div><small>SKELD ACCESS • 0001</small></div></div></div><label class="subtle" for="cardSlider">Or use the accessibility slider</label><input id="cardSlider" type="range" min="0" max="100" value="0" class="slider"><div class="subtle" id="taskHint">Ready to swipe</div>`;break;
 case 'reactor':mini.pattern=Array.from({length:5},()=>Math.floor(rand(0,9)));mini.pos=0;body=`<p>Repeat the 5-button sequence shown below.</p><div class="sequence">${mini.pattern.map(n=>`<span class="seqstep">${n+1}</span>`).join('')}</div><div class="mini-grid">${Array.from({length:9},(_,i)=>`<button class="tile" data-n="${i}">${i+1}</button>`).join('')}</div><div class="subtle" id="taskHint">0 / 5 buttons pressed</div>`;break;
 case 'numbers':mini.pos=1;body=`<p>Tap the numbered squares in order, 1 to 10.</p><div class="mini-grid">${shuffle(Array.from({length:10},(_,i)=>i+1)).map(n=>`<button class="tile" data-num="${n}">${n}</button>`).join('')}</div><div class="subtle" id="taskHint">Next: 1</div>`;break;
 case 'asteroids':mini.count=0;mini.active=Math.floor(rand(0,9));body=`<p>Blast 8 asteroids, one at a time.</p><div class="asteroid-scanner"><div class="target-reticle">⊕</div><div class="mini-grid">${Array.from({length:9},(_,i)=>`<button class="tile asteroid" data-spot="${i}">${mini.active===i?'☄':'✧'}</button>`).join('')}</div></div><div class="subtle" id="taskHint">0 / 8 asteroids</div>`;break;
 case 'course':mini.pos=0;body=`<p>Chart a safe route by tapping waypoints in order.</p><div class="course-screen"><svg viewBox="0 0 300 115" aria-label="Navigation waypoints"><path d="M20 89 L75 36 L121 81 L171 26 L229 67 L280 23" stroke="#3b687b" stroke-width="6" fill="none" stroke-dasharray="7 10"/><path d="M20 89 L75 36 L121 81 L171 26 L229 67 L280 23" stroke="#9aedf7" stroke-width="2" fill="none"/><circle cx="20" cy="89" r="7" fill="#acefd2"/><circle cx="75" cy="36" r="7" fill="#acefd2"/><circle cx="121" cy="81" r="7" fill="#acefd2"/><circle cx="171" cy="26" r="7" fill="#acefd2"/><circle cx="229" cy="67" r="7" fill="#acefd2"/><circle cx="280" cy="23" r="7" fill="#acefd2"/></svg></div><div class="mini-grid">${Array.from({length:6},(_,i)=>`<button class="tile" data-step="${i}">${i+1}</button>`).join('')}</div><div class="subtle" id="taskHint">Waypoint 1 / 6</div>`;break;
 case 'shields':mini.on=new Set();body=`<p>Activate all shield nodes.</p><div class="mini-grid">${Array.from({length:6},(_,i)=>`<button class="tile shield-tile" data-shield="${i}">◆</button>`).join('')}</div><div class="subtle" id="taskHint">0 / 6 shields</div>`;break;
 case 'filter':mini.hit=new Set();body=`<p>Remove all leaves from the oxygen filter.</p><div class="mini-grid">${Array.from({length:9},(_,i)=>`<button class="tile" data-leaf="${i}">🍃</button>`).join('')}</div><div class="subtle" id="taskHint">0 / 9 leaves removed</div>`;break;
 case 'align':mini.target=Math.round(rand(25,75));body=`<p>Set the slider to the target percentage.</p><div class="freq">TARGET ${mini.target}%</div><input class="slider" type="range" min="0" max="100" value="50" id="alignSlider"><div class="subtle" id="taskHint">Current: 50%</div><button class="primary" id="alignBtn">CONFIRM ALIGNMENT</button>`;break;
 case 'calibrate':mini.count=0;body=`<p>Tap when the rotating dial turns green, three times.</p><div class="cal-dial" id="calDial">◉</div><div class="subtle" id="taskHint">0 / 3 distributors</div><button class="primary" id="calBtn">CALIBRATE</button>`;break;
 case 'empty':body=`<p>Hold down the handle to empty the garbage chute.</p><div class="chute">🗑️<div id="chuteBar"></div></div><button class="primary" id="holdBtn">HOLD TO EMPTY</button><div class="subtle" id="taskHint">0%</div>`;break;
 default:body=`${t.id==='scan'?'<div class="scan-rig"><div class="scan-person">♟</div><div class="scan-ring"></div></div>':t.id==='fuel'?'<div class="fuel-gauge">⛽ FUEL MAIN TANK</div>':'<div class="data-terminal">▣ DATA TRANSFER · SIGNAL OK</div>'}<p>${t.id==='scan'?'Hold still for the MedBay scan.':t.id==='fuel'?'Hold the nozzle to fill the engine tank.':'Hold to transfer the data.'}</p><div class="transferbar"><div id="transFill"></div></div><button class="primary" id="holdBtn">PRESS AND HOLD</button><div class="subtle" id="taskHint">0%</div>`;
 }
 return `<button class="xclose" id="cancelTask">✕</button><div class="micro">▤ ${val(t.room)} · SHIP CONSOLE</div><h2>${val(t.name)}</h2><div class="task-device device-${val(t.kind)}"><div class="device-header"><span>✦ STARSHIP SYSTEMS / CONSOLE 07</span><span class="device-leds">● ● ●</span></div><div class="device-screen">${body}</div><div class="device-footer"><span>MODULE ${val(t.id).toUpperCase()}</span><span>ONLINE · A-27</span></div></div>`;
}
function openTask(t){mini={kind:'task',task:t,pos:0,progress:0,holding:false};show(taskMarkup(t),'task');$('cancelTask').onclick=hide;
 const hint=()=>$('taskHint');
 if(t.kind==='wires')document.querySelectorAll('.wire-end').forEach(btn=>btn.onclick=()=>{if(!mini||btn.disabled)return;const side=btn.dataset.side,i=+btn.dataset.idx,col=side==='left'?mini.colors[i]:mini.order[i];if(!mini.pending){if(side!=='left')return;mini.pending=col;btn.classList.add('active')}else if(side==='right'&&col===mini.pending){document.querySelectorAll('.wire-end').forEach(b=>{const c=b.dataset.side==='left'?mini.colors[+b.dataset.idx]:mini.order[+b.dataset.idx];if(c===col){b.disabled=true;b.classList.add('connected')}});mini.matches.push(col);mini.pending=null;hint().textContent=mini.matches.length+' / 4 wires connected';chirp(750);if(mini.matches.length===4)finishMinigame()}else{mini.pending=null;document.querySelectorAll('.wire-end').forEach(b=>b.classList.remove('active'));chirp(190)}});
 if(t.kind==='wires'){
  mini.lines=[];
  const trace=()=>{const b=$('wireBoard'),svg=$('wireTraces');if(!b||!svg||!mini)return;
   const box=b.getBoundingClientRect(),xy=(node,edge)=>{const r=node.getBoundingClientRect();return [edge==='L'?r.left-box.left:r.right-box.left,r.top-box.top+r.height/2]};
   svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
   svg.innerHTML=mini.matches.map(col=>{const left=[...document.querySelectorAll('[data-side="left"]')].find(n=>mini.colors[+n.dataset.idx]===col),right=[...document.querySelectorAll('[data-side="right"]')].find(n=>mini.order[+n.dataset.idx]===col);if(!left||!right)return '';const [x1,y1]=xy(left,'R'),[x2,y2]=xy(right,'L');const cx=(x1+x2)/2;return `<path d="M${x1} ${y1} C${cx} ${y1},${cx} ${y2},${x2} ${y2}" stroke="${col}" stroke-width="8" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 3px ${col})"/>`}).join('');
  };
  const board=$('wireBoard');board.addEventListener('click',()=>requestAnimationFrame(trace));requestAnimationFrame(trace);
 }
 if(t.kind==='swipe'){
  const card=$('dragCard'),track=$('cardTrack');let startX=0,startT=0,pct=0;
  const at=e=>{const bounds=track.getBoundingClientRect(),available=Math.max(1,bounds.width-card.offsetWidth);return clamp((e.clientX-startX)/available*100,0,100)};
  const move=e=>{if(!mini?.swipeActive)return;pct=at(e);card.style.transform=`translateX(${pct/100*(track.clientWidth-card.offsetWidth)}px) rotate(-3deg)`;card.setAttribute('aria-valuenow',Math.round(pct));$('cardSlider').value=Math.round(pct);hint().textContent='Card: '+Math.round(pct)+'%';};
  card.addEventListener('pointerdown',e=>{if(!mini)return;e.preventDefault();card.setPointerCapture(e.pointerId);startX=e.clientX;startT=performance.now();pct=0;mini.swipeActive=true;card.classList.add('swiping')});
  card.addEventListener('pointermove',move);
  card.addEventListener('pointerup',e=>{if(!mini?.swipeActive)return;move(e);mini.swipeActive=false;card.classList.remove('swiping');const duration=performance.now()-startT;if(pct>88&&duration>250&&duration<4500){finishMinigame();return;}hint().textContent=pct<=88?'Slide the card all the way to the end.':duration<250?'TOO FAST. Try again.':'TOO SLOW. Try again.';card.style.transform='';card.setAttribute('aria-valuenow','0');$('cardSlider').value=0;chirp(190)});
  card.addEventListener('pointercancel',()=>{if(mini)mini.swipeActive=false;card.style.transform=''});
  card.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();$('cardSlider').value=Math.min(100,+$('cardSlider').value+12);$('cardSlider').dispatchEvent(new Event('input'))}});
 }
 if(t.kind==='swipe'){const slide=$('cardSlider');slide.addEventListener('pointerdown',()=>{mini.started=performance.now()});slide.oninput=()=>{if(!mini)return;if(!mini.started)mini.started=performance.now();hint().textContent='Card: '+slide.value+'%';if(+slide.value>=99){const ms=performance.now()-mini.started;if(ms>250&&ms<4500)finishMinigame();else{hint().textContent=ms<250?'TOO FAST. Try again.':'TOO SLOW. Try again.';slide.value=0;mini.started=0;chirp(190)}}}}
 if(t.kind==='reactor')document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{if(+b.dataset.n===mini.pattern[mini.pos]){mini.pos++;hint().textContent=mini.pos+' / 5 buttons';chirp(500+mini.pos*70);if(mini.pos===5)finishMinigame()}else{mini.pos=0;hint().textContent='Wrong! Repeat the displayed sequence.';chirp(150)}});
 if(t.kind==='numbers')document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>{if(+b.dataset.num!==mini.pos)return;b.classList.add('lit');b.disabled=true;mini.pos++;hint().textContent='Next: '+mini.pos;chirp(550);if(mini.pos===11)finishMinigame()});
 if(t.kind==='asteroids'){const tiles=[...document.querySelectorAll('[data-spot]')];tiles.forEach(b=>b.onclick=()=>{if(+b.dataset.spot!==mini.active)return;mini.count++;if(mini.count===8){finishMinigame();return}mini.active=Math.floor(rand(0,9));tiles.forEach(k=>k.textContent=+k.dataset.spot===mini.active?'☄':'✧');hint().textContent=mini.count+' / 8 asteroids';chirp(700)})}
 if(t.kind==='course')document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{if(+b.dataset.step!==mini.pos)return;b.classList.add('lit');b.disabled=true;mini.pos++;hint().textContent='Waypoint '+(mini.pos+1)+' / 6';chirp(600);if(mini.pos===6)finishMinigame()});
 if(t.kind==='shields')document.querySelectorAll('[data-shield]').forEach(b=>b.onclick=()=>{if(b.disabled)return;mini.on.add(+b.dataset.shield);b.disabled=true;b.classList.add('lit');hint().textContent=mini.on.size+' / 6 shields';chirp(700);if(mini.on.size===6)finishMinigame()});
 if(t.kind==='filter')document.querySelectorAll('[data-leaf]').forEach(b=>b.onclick=()=>{if(b.disabled)return;mini.hit.add(+b.dataset.leaf);b.disabled=true;b.textContent='✦';hint().textContent=mini.hit.size+' / 9 leaves';chirp(700);if(mini.hit.size===9)finishMinigame()});
 if(t.kind==='align'){const slide=$('alignSlider');slide.oninput=()=>hint().textContent=slide.value+'%';$('alignBtn').onclick=()=>{if(Math.abs(+slide.value-mini.target)<=4)finishMinigame();else{hint().textContent='Move closer to '+mini.target+'%';chirp(170)}}}
 if(t.kind==='calibrate')$('calBtn').onclick=()=>{const phase=(performance.now()%1800)/1800;if(Math.abs(phase-.5)<.22){mini.count++;hint().textContent=mini.count+' / 3';chirp(810);if(mini.count===3)finishMinigame()}else{chirp(170);hint().textContent='Missed the green zone.'}};
 if(t.kind==='hold'||t.kind==='empty')bindHold($('holdBtn'));
}

/* Hand-rendered spaceship rooms, crewmates, walking and hat animations. */
function rr(x,y,w,h,r,fill,stroke,lineWidth=2){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke()}}
function line(x1,y1,x2,y2,color,w=2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function glow(x,y,r,color){const gr=ctx.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,'#0000');ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2)}
function shade(hex,f){const v=parseInt(hex.slice(1),16),r=v>>16&255,g=v>>8&255,b=v&255;return `rgb(${clamp(Math.round(r*f),0,255)},${clamp(Math.round(g*f),0,255)},${clamp(Math.round(b*f),0,255)})`}
function floorTile(x,y,w,h){rr(x,y,w,h,5,'#465463','#25313b',1);for(let a=x+6;a<x+w;a+=23)line(a,y+6,a,y+h-6,'#d0e4ec09',1);for(let a=y+7;a<y+h;a+=23)line(x+7,a,x+w-7,a,'#d0e4ec09',1)}
function roomArt(r){floorTile(r.x,r.y,r.w,r.h);ctx.fillStyle=r.color+'cc';rr(r.x+4,r.y+4,r.w-8,r.h-8,9,r.color);ctx.save();ctx.beginPath();ctx.rect(r.x+5,r.y+5,r.w-10,r.h-10);ctx.clip();for(let y=r.y+13;y<r.y+r.h;y+=34){line(r.x+9,y,r.x+r.w-9,y,'#b9cbd015',1)}for(let x=r.x+11;x<r.x+r.w;x+=34)line(x,r.y+10,x,r.y+r.h-10,'#00000018',1);ctx.restore();rr(r.x,r.y,r.w,r.h,8,null,'#8394a2aa',4);
 const x=r.x+r.w/2,y=r.y+r.h/2;ctx.textAlign='center';
 switch(r.name){
 case 'CAFETERIA':for(let i=0;i<3;i++){const px=x+(i-1)*79;rr(px-30,y+(i===1?34:-25),64,48,22,'#5c8290','#92afbb',3);for(let j=0;j<4;j++)rr(px-26+j*16,y+(i===1?29:-30),12,7,3,'#384d60')}rr(x-25,y-30,50,45,16,'#657d82','#adc0c6',3);rr(x-14,y-21,28,24,6,'#ad3235','#fb6365');ctx.fillStyle='#fff';ctx.font='bold 8px system-ui';ctx.fillText('EMERGENCY',x,y-7);break;
 case 'UPPER ENGINE':case 'LOWER ENGINE':rr(x-53,y-40,106,87,25,'#304655','#8398a4',4);rr(x-40,y-27,80,60,13,'#2c7690','#71b4c0',3);for(let i=-1;i<=1;i++)line(x-40,y+i*14,x+40,y+i*14,'#b6d7de77',5);glow(x,y,65,'#4dd4ff25');break;
 case 'REACTOR':rr(x-42,y-54,84,110,22,'#4c3a63','#a28ab2',4);rr(x-24,y-45,48,90,10,'#62488f','#c492e5',3);glow(x,y,60,'#b160f358');break;
 case 'MEDBAY':for(let i=0;i<2;i++){rr(x-64+i*70,y-29,58,51,9,'#b0c6c9','#2e5265',3);rr(x-56+i*70,y-20,42,28,7,'#e5f5e8','#aecbd8',2)}rr(x-20,y+21,40,22,6,'#5b8e98','#9cd5cb');break;
 case 'ELECTRICAL':for(let i=0;i<3;i++){rr(x-49+i*36,y-39,32,77,5,'#27313d','#a5a7a7',2);for(let j=0;j<3;j++)rr(x-44+i*36,y-31+j*21,22,12,2,['#7c9bbc','#77b7a4','#e6c373'][j])}break;
 case 'SECURITY':for(let i=0;i<4;i++){rr(x-53+i%2*55,y-32+Math.floor(i/2)*34,48,30,4,'#0c2135','#9cb2ba',2);rr(x-45+i%2*55,y-25+Math.floor(i/2)*34,33,15,3,'#368798')}break;
 case 'ADMIN':rr(x-62,y-25,125,58,13,'#586a70','#9aabb1',3);for(let i=0;i<3;i++)rr(x-47+i*36,y-15,29,28,4,'#2c546c','#9cc3c8',1);break;
 case 'STORAGE':for(let i=0;i<3;i++){rr(x-73+i*49,y-25,44,48,4,'#796d58','#b4a282',2);line(x-66+i*49,y-13,x-37+i*49,y-13,'#dfcca4',2)}break;
 case 'WEAPONS':rr(x-40,y-39,84,79,35,'#5b707c','#a7bbc0',3);rr(x-20,y-20,43,43,15,'#374f63','#9eb4c6',2);line(x-2,y-39,x+18,y-66,'#8cabb7',7);break;
 case 'NAVIGATION':for(let i=0;i<2;i++){rr(x-57+i*62,y-21,53,41,10,'#213954','#90a4bb',2);rr(x-47+i*62,y-12,35,23,5,'#2c7b96')}break;
 case 'O2':rr(x-38,y-30,77,60,12,'#477c79','#a9d0ba',3);for(let i=0;i<3;i++)rr(x-27+i*20,y-19,14,37,7,'#8ec5a8','#d0eed0',1);break;
 case 'SHIELDS':rr(x-50,y-29,102,61,29,'#37616f','#8bb7b5',3);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rr(x+Math.cos(a)*29-8,y+Math.sin(a)*20-7,16,14,4,'#5fd0d8','#a0f8e1')}break;
 case 'COMMUNICATIONS':rr(x-52,y-28,105,56,10,'#2e364b','#7187a4',3);for(let i=0;i<4;i++)rr(x-39+i*22,y-18,19,17,3,'#6ec0e0');break;
 }
 // Original-map-style room labels in the room, above furniture.
 ctx.lineWidth=3;ctx.strokeStyle='#15212b';ctx.fillStyle='#e4ebf0';ctx.font='bold 10px system-ui';ctx.strokeText(r.name,x,r.y+20);ctx.fillText(r.name,x,r.y+20)
}
function drawVent(v,t){ctx.save();rr(v.x-21,v.y-10,43,23,4,'#303f4b','#afbdc4',3);for(let i=-12;i<=12;i+=8)line(v.x+i,v.y-6,v.x+i,v.y+8,'#0d222e',3);if((game.player.imp||game.player.role==='Engineer')&&d(game.player,v)<59){glow(v.x,v.y,28,'#f5e36335');ctx.strokeStyle='#ffe075';ctx.lineWidth=2;ctx.strokeRect(v.x-23,v.y-12,46,26)}ctx.restore()}
function drawOutfit(p){const skin=p.skin||'Classic';if(skin==='Classic')return;if(skin==='Suit'||skin==='Tuxedo'){rr(-15,-1,31,22,6,skin==='Tuxedo'?'#1b2430':'#36394f','#ffffff25',1);line(0,-1,0,21,'#e6ebee',2);rr(-3,1,6,7,1,'#d4e7ec')}else if(skin==='Lab Coat'){rr(-15,-2,31,24,5,'#e4e9ec','#a2b9c0',1);line(0,-2,0,21,'#8ca3b1',2)}else if(skin==='Coat'){rr(-15,-2,31,22,4,'#68755e','#111c25',1);for(let i=0;i<3;i++)rr(-1,i*6+2,3,3,1,'#f2dd8c')}else if(skin==='Overalls'){rr(-15,1,31,20,5,'#255d95','#193954',1);line(-8,-3,-8,14,'#8cb0e4',3);line(8,-3,8,14,'#8cb0e4',3)}else if(skin==='Utility'){rr(-17,3,34,17,5,'#80653b','#e6ce9b',1);for(let i=0;i<3;i++)rr(-11+i*10,8,8,7,2,'#493c2e')}}
function drawHat(p){const h=p.hat||'None';const col=p.color;if(h==='None')return;ctx.save();ctx.lineWidth=2.3;ctx.strokeStyle='#121820';switch(h){
 case 'Cap':rr(-16,-29,30,10,3,'#346cb7','#15283d');rr(5,-23,21,5,3,'#346cb7');break;
 case 'Beanie':rr(-15,-29,30,12,7,'#c84b68');rr(-13,-26,26,4,2,'#f7bcd4');break;
 case 'Crown':ctx.beginPath();ctx.moveTo(-16,-21);ctx.lineTo(-16,-37);ctx.lineTo(-7,-30);ctx.lineTo(0,-40);ctx.lineTo(8,-30);ctx.lineTo(17,-37);ctx.lineTo(15,-20);ctx.closePath();ctx.fillStyle='#f4bc32';ctx.fill();ctx.stroke();break;
 case 'Top Hat':rr(-17,-25,34,7,1,'#151823');rr(-10,-49,21,26,3,'#1c2230');rr(-10,-29,21,5,1,'#bf3345');break;
 case 'Plant':line(0,-21,0,-39,'#60bf45',4);ctx.fillStyle='#6ce254';ctx.beginPath();ctx.ellipse(-6,-35,8,4,.4,0,7);ctx.ellipse(7,-39,8,4,-.6,0,7);ctx.fill();break;
 case 'Egg':ctx.fillStyle='#f8eee1';ctx.beginPath();ctx.ellipse(0,-30,14,11,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#e5bc2a';ctx.beginPath();ctx.arc(0,-30,6,0,7);ctx.fill();break;
 case 'Halo':ctx.beginPath();ctx.ellipse(0,-37,19,5,0,0,7);ctx.strokeStyle='#ffed7b';ctx.lineWidth=5;ctx.stroke();break;
 case 'Cowboy':rr(-23,-29,46,7,4,'#986433');rr(-13,-45,26,19,5,'#8d5a32');break;
 case 'Party Hat':ctx.beginPath();ctx.moveTo(-12,-24);ctx.lineTo(0,-53);ctx.lineTo(12,-24);ctx.closePath();ctx.fillStyle='#c958d3';ctx.fill();ctx.stroke();ctx.fillStyle='#fff47b';ctx.beginPath();ctx.arc(0,-54,4,0,7);ctx.fill();break;
 case 'Chef':rr(-17,-30,35,13,6,'#eef4f5');for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-10+i*10,-37,9,0,7);ctx.fillStyle='#f7faf9';ctx.fill();ctx.stroke()}break;
 case 'Flower':ctx.fillStyle='#ef76a5';for(let i=0;i<5;i++){const a=i*1.257;ctx.beginPath();ctx.arc(Math.cos(a)*8,-28+Math.sin(a)*8,7,0,7);ctx.fill()}ctx.fillStyle='#ffe274';ctx.beginPath();ctx.arc(0,-28,5,0,7);ctx.fill();break;
 }ctx.restore()}
function drawAstronaut(p,t,dead=false){if(p.vanish>0&&p!==game.player)return;const color=p.disguise?.color||p.color;const walk=p.walk||0,step=p.moving?Math.sin(walk):0,bob=p.moving?Math.abs(Math.sin(walk))*.9:Math.sin(t*2+p.x)*.3,ghost=p.ghost&&!dead;
 ctx.save();ctx.translate(p.x,p.y+bob);ctx.globalAlpha=ghost?.50:1;ctx.scale(p.face||1,1);
 if(dead){ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(0,12,25,8,0,0,7);ctx.fill();rr(-18,-7,38,20,10,color,'#0c1520',3);rr(0,-14,16,17,5,'#e8f1e7','#141b22',3);ctx.restore();return}
 ctx.fillStyle='#04090c8a';ctx.beginPath();ctx.ellipse(0,25,20,6,0,0,Math.PI*2);ctx.fill();
 // Walking animation: alternating feet, gentle vertical bounce and moving backpack.
 rr(-18,5+Math.max(0,step)*3,13,21,6,shade(color,.74),'#0c121c',3);
 rr(5,5+Math.max(0,-step)*3,13,21,6,shade(color,.84),'#0c121c',3);
 rr(-25,-9,15,31,7,shade(color,.77),'#111820',3.2);
 rr(-17,-22,36,43,14,shade(color,.72),'#0b101a',3.2);
 rr(-16,-22,34,41,14,color,'#111925',2.7);
 drawOutfit(p);
 // Visor rim and glossy glass reflection.
 rr(-2,-14,30,21,10,'#243a4c','#0d1b29',3);
 const glass=ctx.createLinearGradient(0,-16,19,8);glass.addColorStop(0,'#d9f5fd');glass.addColorStop(.42,'#91cfe4');glass.addColorStop(1,'#3e7c99');rr(1,-13,26,17,8,glass,'#22435a',1.6);
 ctx.fillStyle='#ffffff85';ctx.beginPath();ctx.ellipse(10,-9,8,3,-.36,0,Math.PI*2);ctx.fill();
 drawHat(p);ctx.restore();
 const name=p===game.player?chosenColor:(p.disguise?.name||p.name);ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#08111cee';ctx.fillStyle=p.imp&&game.player.imp?'#ff6b72':'#fff';ctx.font='900 11px system-ui';ctx.strokeText(name,p.x,p.y-34);ctx.fillText(name,p.x,p.y-34);
 if(p.shield>0){ctx.strokeStyle='#6ff0fbaa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,29,0,Math.PI*2);ctx.stroke()}
 if(ghost){ctx.strokeStyle='#c7eaff90';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y-18,22,Math.PI,Math.PI*2);ctx.stroke()}
}

function render(time){const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
 const dpr=Math.min(window.devicePixelRatio||1,2);const px=Math.round(w*dpr),py=Math.round(h*dpr);if(canvas.width!==px||canvas.height!==py){canvas.width=px;canvas.height=py}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const viewW=w>950?1000:w>680?855:w>460?650:505,viewH=viewW*h/w,p=game.player;
 camera={w:viewW,h:viewH,x:clamp(p.x-viewW/2,0,Math.max(0,1000-viewW)),y:clamp(p.y-viewH/2,0,Math.max(0,640-viewH))};
 ctx.save();ctx.scale(w/viewW,w/viewW);ctx.translate(-camera.x,-camera.y);
 ctx.fillStyle='#111721';ctx.fillRect(0,0,1000,640);
 rr(14,13,974,614,24,'#1a252c','#7b929d',6);
 for(const hall of halls){floorTile(hall.x,hall.y,hall.w,hall.h);rr(hall.x,hall.y,hall.w,hall.h,4,null,'#778c9877',2)}
 rooms.forEach(roomArt);
 const t=time/1000;
 vents.forEach(v=>drawVent(v,t));
 if(state){
  const objs=availableTasks();if(!state.me.imp)for(const task of objs){
   glow(task.x,task.y,33,'#eac53a45');ctx.strokeStyle='#ffe96c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(task.x,task.y,17+Math.sin(t*3)*1.5,0,Math.PI*2);ctx.stroke();rr(task.x-9,task.y-12,18,24,5,'#b0a234','#fcef86',2);ctx.fillStyle='#fffbea';ctx.textAlign='center';ctx.font='900 16px system-ui';ctx.fillText('!',task.x,task.y+6);
  }
  if(state.sab)for(const panel of state.sab.panels.filter(v=>!state.sab.repaired.includes(v.id))){glow(panel.x,panel.y,64,'#ff112c85');rr(panel.x-18,panel.y-20,36,38,10,'#8a1729','#ffbdc5',2);ctx.fillStyle='#fff';ctx.font='bold 27px system-ui';ctx.textAlign='center';ctx.fillText('!',panel.x,panel.y+10)}
  if(state.sab?.name==='Doors'){const DZ={'Cafeteria':[[638,207,25,45]],'MedBay':[[502,214,28,42]],'Security':[[321,292,28,40]],'Electrical':[[458,437,27,48]],'Admin':[[638,390,25,44]],'Storage':[[633,480,27,44]],'Lower Engine':[[320,449,30,43]]};for(const [x,y,w,h] of (DZ[state.sab.zone]||DZ.Cafeteria)){glow(x+w/2,y+h/2,40,'#ff2b3288');rr(x,y,w,h,4,'#ad343f','#ff9399',3);for(let j=0;j<4;j++)line(x,y+j*11,x+w,y+j*11,'#f6a1a1',2)}}
  if(state.notice){glow(state.notice.x,state.notice.y,68,'#fa1d4b88');ctx.fillStyle='#fff';ctx.font='950 11px system-ui';ctx.textAlign='center';ctx.fillText('⚠ '+state.notice.text.slice(0,38),state.notice.x,state.notice.y-42)}
  for(const corpse of state.bodies)drawAstronaut(corpse,t,true);
  for(const other of state.players){if(other.id===state.me.id)continue;if(other.vent!==null||other.vanish)continue;if(!other.alive&&state.me.alive)continue;
   drawAstronaut({...other,imp:other.impostorFriend,vanish:other.vanish,ghost:!other.alive},t)
  }
  if(state.me.track){const tr=state.me.track;ctx.save();ctx.setLineDash([5,6]);ctx.strokeStyle='#a5ffbe99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(tr.x,tr.y);ctx.stroke();ctx.setLineDash([]);glow(tr.x,tr.y,32,'#8fffbe79');ctx.restore()}
 }
 if(autoTarget){ctx.save();ctx.setLineDash([5,6]);ctx.strokeStyle='#deffaf77';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(autoTarget.x,autoTarget.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(autoTarget.x,autoTarget.y,8,0,2*Math.PI);ctx.stroke();ctx.restore()}
 if(!state||state.me.vent===null){drawAstronaut(p,t);ctx.strokeStyle=p.imp?'#ff676d':'#cff2d2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,27,0,2*Math.PI);ctx.stroke()}
 else{const v=vents.find(v=>v.id===state.me.vent);if(v){glow(v.x,v.y,32,'#fbe97777');ctx.fillStyle='#fff9b2';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('YOU (HIDDEN)',v.x,v.y-23)}}
 if(state?.sab?.name==='Lights'&&!state.me.imp){const black=ctx.createRadialGradient(p.x,p.y,32,p.x,p.y,207);black.addColorStop(0,'rgba(0,0,0,0)');black.addColorStop(.6,'rgba(0,0,0,.75)');black.addColorStop(1,'rgba(0,0,0,.95)');ctx.fillStyle=black;ctx.fillRect(0,0,1000,640)}
 ctx.restore();
}
function tick(dt,time){if(mini?.holding&&['task','repair'].includes(modalType)){
 mini.progress=Math.min(100,mini.progress+dt*33);
 const fill=$('transFill')||$('chuteBar')||$('repairProgress');if(fill)fill.style.width=mini.progress+'%';
 const hint=$('taskHint')||$('repairHint');if(hint)hint.textContent=Math.round(mini.progress)+'%';
 if(mini.progress>=100)finishMinigame();
 }
 if(mini?.task?.kind==='calibrate'&&$('calDial')){const phase=(time%1800)/1800;$('calDial').style.transform=`rotate(${phase*360}deg)`;$('calDial').style.color=Math.abs(phase-.5)<.22?'#8eff9b':'#b2e5ff'}
 if(canMove() && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
  let dx=Number(!!(keys.right||keys.d))-Number(!!(keys.left||keys.a)),dy=Number(!!(keys.down||keys.s))-Number(!!(keys.up||keys.w));
  if(dx||dy)autoTarget=null;
  if(!dx&&!dy&&autoTarget){const length=d(local(),autoTarget);if(length>8){dx=(autoTarget.x-local().x)/length;dy=(autoTarget.y-local().y)/length}else autoTarget=null}
  const magnitude=Math.hypot(dx,dy),p=local();p.moving=magnitude>.04;
  if(p.moving){const speed=state.me.alive?162:182;const nx=p.x+dx/magnitude*speed*dt,ny=p.y+dy/magnitude*speed*dt;
   if(walkable({x:nx,y:ny})){p.x=nx;p.y=ny}else{if(walkable({x:nx,y:p.y}))p.x=nx;if(walkable({x:p.x,y:ny}))p.y=ny}
   if(Math.abs(dx)>.05)p.face=dx>0?1:-1;p.walk+=dt*12;
  }
  if(time-lastMoveSent>90&&(p.moving||movePending)){lastMoveSent=time;send('move',{x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,face:p.face,walk:p.walk,moving:p.moving});movePending=p.moving}
 }
 if(state&&time-pingAt>600){pingAt=time;updateActions();$('roomLabel').textContent='● '+roomAt(game.player)+(state.me.alive?'':' · GHOST');
  if(state.meeting&&modalType==='meeting'){
   const el=$('meetingCountdown');if(el)el.textContent=state.meeting.seconds+'s';
  }
  if(state.sab){const sab=$('sabotageBanner');sab.textContent=`⚠ ${state.sab.name.toUpperCase()} · ${state.sab.seconds}s`}
 }
}
function loop(time){const dt=Math.min(.05,(time-last)/1000||.016);last=time;tick(dt,time);render(time);requestAnimationFrame(loop)}
window.addEventListener('keydown',ev=>{
 const tag=ev.target?.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||ev.target?.isContentEditable)return;
 const k=ev.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(k))ev.preventDefault();keys[k.replace('arrow','')]=true;
 if(ev.repeat)return;
 if(k==='enter'&&state&&['playing','lobby'].includes(state.phase)){$('chatInput').focus();return}if(k==='e'||k===' ')use();else if(k==='v')vent();else if(k==='k')kill();else if(k==='b')sabotage();else if(k==='f')role();else if(k==='r')report();else if(k==='m')emergency();else if(k==='tab')map();
});
window.addEventListener('keyup',ev=>{keys[ev.key.toLowerCase().replace('arrow','')]=false});window.addEventListener('blur',()=>{keys={};autoTarget=null;document.querySelectorAll('[data-dir]').forEach(b=>b.classList.remove('pressed'))});
document.querySelectorAll('[data-dir]').forEach(btn=>{const dir=btn.dataset.dir;const down=e=>{e.preventDefault();keys[dir]=true;btn.classList.add('pressed');try{btn.setPointerCapture(e.pointerId)}catch(e){}},up=e=>{e.preventDefault();keys[dir]=false;btn.classList.remove('pressed')};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('lostpointercapture',()=>{keys[dir]=false;btn.classList.remove('pressed')})});
canvas.addEventListener('pointerdown',ev=>{if(!canMove())return;ev.preventDefault();const r=canvas.getBoundingClientRect(),x=camera.x+(ev.clientX-r.left)/r.width*camera.w,y=camera.y+(ev.clientY-r.top)/r.height*camera.h;
 const target={x:clamp(x,26,974),y:clamp(y,26,614)};const t=availableTasks().find(t=>d(t,target)<28);if(t&&!state.me.imp){if(d(local(),t)<90){openTask(t);return}target.x=t.x;target.y=t.y+30}
 autoTarget=target;
});
$('useBtn').onclick=use;$('ventBtn').onclick=vent;$('killBtn').onclick=kill;$('roleBtn').onclick=role;$('sabBtn').onclick=sabotage;$('reportBtn').onclick=report;$('meetingBtn').onclick=emergency;$('mapBtn').onclick=map;
$('codePill').onclick=copyInvite;
$('chatForm').onsubmit=e=>{e.preventDefault();const input=$('chatInput'),text=input.value.trim();if(text){send('chat',{text});input.value=''}};
function setup(){loadPrefs();try{const s=JSON.parse(localStorage.getItem('starship-sus-session')||'null');if(s?.code&&s?.token&&s?.id){api('restore',s).then(()=>connect(s)).catch(()=>{clearSession();renderLanding('Your previous session expired. Please join again.')})}else renderLanding()}catch(e){renderLanding()};requestAnimationFrame(loop)}
setup();
})();
