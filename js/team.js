// TEAM / HELPERS
// ================================================================
function renderTeam(){
  const el=document.getElementById('team-row');
  if(!el) return;
  el.innerHTML=TEAM.map((p,i)=>{
    const h=helpers.find(x=>x.idx===i);
    const busy=h&&h.taskCurrent;
    const prog=busy&&h.taskStart?Math.round(Math.min(1,(Date.now()-h.taskStart)/h.taskDuration)*100):0;
    return `<div class="person-card ${p.owner?'owner':''} ${busy?'busy':''}" onclick="openHelperModal(${i})" data-tip="Tap to assign task">
      <div class="person-avatar">${p.avatar}</div>
      <div class="person-name">${p.name}${p.owner?' 👑':''}</div>
      <div class="person-role">${p.role}</div>
      <span class="person-status ${busy?'status-busy':'status-idle'}">${busy?'Working':'Free'}</span>
      ${busy?`<div class="person-task-bar-bg"><div class="person-task-bar" style="width:${prog}%"></div></div>
              <div style="font-size:.64rem;color:#3a8c2a;font-weight:800;">${h.taskCurrent.substring(0,20)}</div>`:''}
    </div>`;
  }).join('');
}

function renderHelperGrid(){
  const el=document.getElementById('helper-grid');
  if(!el) return;
  el.innerHTML=TEAM.map((p,i)=>{
    const h=helpers.find(x=>x.idx===i);
    if(!h) return '';
    const prog=h.taskStart?Math.round(Math.min(1,(Date.now()-h.taskStart)/h.taskDuration)*100):0;
    const schedPreview=h.sessions.map(s=>{
      if(!s.tasks.length) return null;
      return '⏰ '+s.time+': '+s.tasks.map(tid=>{const t=ALL_TASKS.find(x=>x.id===tid);return t?t.icon:'';}).join(' ');
    }).filter(Boolean).join('<br>');
    return `
    <div class="helper-card ${h.taskCurrent?'busy':''}" onclick="openHelperModal(${i})">
      <div class="helper-avatar">${p.avatar}</div>
      <div class="helper-name">${p.name}${p.owner?' 👑':''}</div>
      <div class="helper-role">${p.role}</div>
      <span class="person-status ${h.taskCurrent?'status-busy':'status-idle'}">${h.taskCurrent?'Working':'Free'}</span>
      ${h.taskCurrent?`
        <div class="helper-task-bar-bg"><div class="helper-task-bar" style="width:${prog}%"></div></div>
        <div class="helper-task-label">${h.taskCurrent} — ${prog}%</div>
      `:''}
      ${schedPreview?`<div class="helper-sched-preview">📅 ${schedPreview}</div>`:'<div class="helper-sched-preview" style="color:#ccc;">No schedule</div>'}
    </div>`;
  }).join('');
}

function renderHelperProgressOnly(){
  TEAM.forEach((p,i)=>{
    const h=helpers.find(x=>x.idx===i);
    if(!h||!h.taskCurrent) return;
    const prog=Math.round(Math.min(1,(Date.now()-h.taskStart)/h.taskDuration)*100);
    const card=document.querySelector('#helper-grid .helper-card:nth-child('+(i+1)+')');
    if(card){
      const bar=card.querySelector('.helper-task-bar');
      const lbl=card.querySelector('.helper-task-label');
      if(bar) bar.style.width=prog+'%';
      if(lbl) lbl.textContent=h.taskCurrent+' — '+prog+'%';
    }
    // Update meadow worker bubble
    const bub=document.querySelector('#mworker-'+h.idx+' .action-bubble');
    if(bub) bub.textContent=(TASK_TOOLS[h.taskId]||'🔧')+' '+prog+'%';
    // Update farm page person card
    const pbar=document.querySelector('#team-row .person-card:nth-child('+(i+1)+') .person-task-bar');
    if(pbar) pbar.style.width=prog+'%';
  });
}

// ================================================================
// TASKS
// ================================================================
const ALL_TASKS=[
  {id:'hay_all',      label:'🌾 Feed hay to all',      icon:'🌾',duration:8, partial:true},
  {id:'grain_all',    label:'🌽 Feed grain to all',     icon:'🌽',duration:8, partial:true},
  {id:'treats_all',   label:'🍎 Give treats to all',    icon:'🍎',duration:5, partial:true},
  {id:'water_all',    label:'💧 Water all horses',      icon:'💧',duration:6, partial:true},
  {id:'groom_all',    label:'✂️ Groom all horses',      icon:'✂️',duration:12,partial:true},
  {id:'muck_out',     label:'💩 Muck out stables',      icon:'💩',duration:15,partial:true},
  {id:'health_all',   label:'🩺 Check all health',      icon:'🩺',duration:10,partial:true},
  {id:'to_pasture',   label:'🌿 Move all to pasture',   icon:'🌿',duration:5, partial:false},
  {id:'to_stable',    label:'🏠 Move all to stables',   icon:'🏠',duration:5, partial:false},
  {id:'exercise_walk',label:'🚶 Walk all horses',       icon:'🚶',duration:20,partial:true},
  {id:'exercise_trot',label:'🏇 Trot all horses',       icon:'🏇',duration:25,partial:true},
  {id:'restock',      label:'📦 Restock supplies',      icon:'📦',duration:10,partial:false},
  {id:'graze_all',    label:'🌱 Set all grazing',       icon:'🌱',duration:4, partial:false},
  {id:'morning',      label:'🌅 Full morning routine',  icon:'🌅',duration:30,partial:false},
  {id:'evening',      label:'🌙 Full evening routine',  icon:'🌙',duration:30,partial:false},
];

function executeTask(taskId,fraction=1.0){
  const count=Math.ceil(horses.length*fraction);
  const targets=horses.slice(0,count);
  switch(taskId){
    case 'hay_all':     targets.forEach(h=>{if(useSupply('hay'))  h.stats.hunger=Math.min(100,h.stats.hunger+20);}); earnCoins(3*count); addLog('🌾 Fed hay to '+count+' horses','feed');break;
    case 'grain_all':   targets.forEach(h=>{if(useSupply('grain'))h.stats.hunger=Math.min(100,h.stats.hunger+30);}); earnCoins(3*count); addLog('🌽 Fed grain to '+count+' horses','feed');break;
    case 'treats_all':  targets.forEach(h=>{if(useSupply('treats'))h.stats.hunger=Math.min(100,h.stats.hunger+10);}); earnCoins(2*count); addLog('🍎 Gave treats to '+count+' horses','feed');break;
    case 'water_all':   targets.forEach(h=>{if(useSupply('water'))h.stats.thirst=Math.min(100,h.stats.thirst+35);}); earnCoins(3*count); addLog('💧 Watered '+count+' horses','water');break;
    case 'groom_all':   targets.forEach(h=>{if(useSupply('brush'))h.stats.grooming=Math.min(100,h.stats.grooming+35);}); earnCoins(4*count); addLog('✂️ Groomed '+count+' horses','groom');break;
    case 'muck_out':    horses.filter(h=>h.pos.location==='stable').forEach(h=>{h.stats.rest=Math.min(100,h.stats.rest+5);}); earnCoins(8); addLog('💩 Mucked out stables','system');break;
    case 'health_all':  targets.forEach(h=>{if(useSupply('meds'))addLog('🩺 '+h.name+': '+(h.sick?'SICK':'healthy'),'health');}); earnCoins(5*count); break;
    case 'to_pasture':  horses.filter(h=>h.pos.location==='stable').forEach(h=>{h.pos.location='pasture';h.pos.x=15+Math.random()*50;h.pos.depth=35+Math.random()*30;}); earnCoins(3); addLog('🌿 Moved all to pasture','move');break;
    case 'to_stable':   horses.filter(h=>h.pos.location==='pasture').forEach(h=>{h.pos.location='stable';h.pos.grazing=false;}); earnCoins(3); addLog('🏠 Moved all to stables','move');break;
    case 'exercise_walk':targets.filter(h=>!h.exercising&&!h.sick).forEach(h=>startExercise(h.id,'walk')); earnCoins(5*count); addLog('🚶 Started walks for '+count+' horses','exercise');break;
    case 'exercise_trot':targets.filter(h=>!h.exercising&&!h.sick).forEach(h=>startExercise(h.id,'trot')); earnCoins(7*count); addLog('🏇 Started trots for '+count+' horses','exercise');break;
    case 'restock':     supplies.forEach(s=>{s.stock=Math.min(s.max,s.stock+8);}); addLog('📦 Restocked all supplies','supply');break;
    case 'graze_all':   horses.filter(h=>h.pos.location==='pasture').forEach(h=>{h.pos.grazing=true;}); earnCoins(2); addLog('🌱 Set all pasture horses grazing','graze');break;
    case 'morning':
      horses.forEach(h=>{if(useSupply('hay'))h.stats.hunger=Math.min(100,h.stats.hunger+20);});
      horses.forEach(h=>{if(useSupply('water'))h.stats.thirst=Math.min(100,h.stats.thirst+35);});
      horses.forEach(h=>{if(useSupply('brush'))h.stats.grooming=Math.min(100,h.stats.grooming+25);});
      horses.filter(h=>h.pos.location==='stable').forEach(h=>{h.pos.location='pasture';h.pos.x=15+Math.random()*50;h.pos.depth=35+Math.random()*30;});
      earnCoins(25); addLog('🌅 Morning routine complete','system');break;
    case 'evening':
      horses.forEach(h=>{if(useSupply('grain'))h.stats.hunger=Math.min(100,h.stats.hunger+30);});
      horses.forEach(h=>{if(useSupply('water'))h.stats.thirst=Math.min(100,h.stats.thirst+20);});
      horses.filter(h=>h.pos.location==='pasture').forEach(h=>{h.pos.location='stable';h.pos.grazing=false;});
      horses.forEach(h=>{h.stats.rest=Math.min(100,h.stats.rest+15);});
      earnCoins(25); addLog('🌙 Evening routine complete','system');break;
  }
  renderAll();
}

function assignTask(helperIdx,taskId,fromSchedule=false){
  const h=helpers.find(x=>x.idx===helperIdx);
  const t=ALL_TASKS.find(x=>x.id===taskId);
  if(!h||!t) return;
  if(h.taskCurrent){
    if(!fromSchedule) showToast("⚠️ "+TEAM[helperIdx].name+" is already working!",true);
    return;
  }
  h.taskId=taskId; h.taskCurrent=t.label;
  h.taskStart=Date.now(); h.taskDuration=t.duration*10*1000;
  addLog('👷 '+TEAM[helperIdx].name+' started: '+t.label,'system');
  if(!fromSchedule) showToast('👷 '+TEAM[helperIdx].name+': '+t.label+'!');
  if(taskId==='to_stable')  animateBringToStable(helperIdx);
  if(taskId==='to_pasture') animateBringToPasture(helperIdx);
  renderAll();
}

// Check task completion every 5s
setInterval(()=>{
  let changed=false;
  helpers.forEach(h=>{
    if(h.taskCurrent&&h.taskStart){
      if((Date.now()-h.taskStart)/h.taskDuration>=1){
        const done=h.taskId;
        executeTask(h.taskId,1.0);
        showToast('✅ '+TEAM[h.idx].name+' finished: '+h.taskCurrent+'!');
        h.taskCurrent=null;h.taskStart=null;h.taskDuration=0;h.taskId=null;
        if(h.taskQueue&&h.taskQueue.length>0){
          const next=h.taskQueue.shift();
          setTimeout(()=>assignTask(h.idx,next,true),500);
        }
        changed=true;
      }
    }
  });
  if(changed) renderAll(); else renderHelperProgressOnly();
},5000);

// ================================================================
// SCHEDULE — time-based, repeats every day, skips if already done
// ================================================================
function forceRunSchedule(helperIdx){
  const h=helpers.find(x=>x.idx===helperIdx);
  if(!h){showToast('No helper found',true);return;}
  if(h.taskCurrent){showToast('⚠️ '+TEAM[helperIdx].name+' is already working!',true);return;}
  const allTasks=h.sessions.flatMap(s=>s.tasks).filter(t=>t);
  if(!allTasks.length){showToast('⚠️ '+TEAM[helperIdx].name+' has no tasks scheduled!',true);return;}
  h.taskQueue=[...allTasks.slice(1)];
  assignTask(helperIdx,allTasks[0],true);
  showToast('▶ '+TEAM[helperIdx].name+' is now working!');
  renderAll();
}

function runHelperScheduleTick(){
  const now=new Date();
  const cur=now.getHours()*60+now.getMinutes(); // minutes since midnight
  const today=now.toDateString();

  helpers.forEach(h=>{
    h.sessions.forEach((sess,si)=>{
      if(!sess.tasks.length||h.taskCurrent) return;
      // Parse session time to minutes
      const [hh,mm]=(sess.time||'07:00').split(':').map(Number);
      const sessMin=hh*60+mm;
      // Fire if we're within 30 mins PAST the scheduled time (catches missed triggers)
      if(cur>=sessMin && cur<sessMin+30){
        const key=h.idx+'-'+si+'-'+today;
        const needsWork=horses.some(horse=>
          horse.stats.hunger<70||horse.stats.thirst<70||horse.stats.grooming<60
        );
        if(h.lastDailyRun[key]&&!needsWork) return;
        h.lastDailyRun[key]=true;
        h.taskQueue=[...sess.tasks.slice(1)];
        assignTask(h.idx,sess.tasks[0],true);
        const timeStr=sess.time;
        addLog('⏰ '+TEAM[h.idx].name+"'s schedule started ("+timeStr+')','system');
        showToast('⏰ '+TEAM[h.idx].name+' started their scheduled tasks!');
      }
    });
  });
}
setInterval(runHelperScheduleTick,30000);
// Also run immediately on load so missed schedules fire right away
setTimeout(runHelperScheduleTick,2000);

// ================================================================
// SCHEDULE PAGE
// ================================================================
function renderSchedule(){
  const slots=[
    {time:"7:00 AM", tasks:["Hay & grain feed","Refill water buckets"],color:"#e8c97a"},
    {time:"9:00 AM", tasks:["Morning grooming","Muck out stables"],   color:"#aad4e8"},
    {time:"11:00 AM",tasks:["Exercise sessions","Paddock time"],       color:"#9eda9e"},
    {time:"1:00 PM", tasks:["Midday hay & water","Health checks"],    color:"#e8c97a"},
    {time:"3:00 PM", tasks:["Afternoon groom","Hoof care"],           color:"#aad4e8"},
    {time:"5:00 PM", tasks:["Evening grain feed","Settle & rest"],    color:"#d4a8e8"},
  ];
  const el=document.getElementById('schedule-grid');
  if(el) el.innerHTML=slots.map(s=>`
    <div class="schedule-card">
      <h4>⏰ ${s.time}</h4>
      ${s.tasks.map(t=>`<div class="schedule-item"><div class="schedule-dot" style="background:${s.color}"></div>${t}</div>`).join('')}
    </div>`).join('');
}

// ================================================================
