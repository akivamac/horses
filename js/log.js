// HORSE PERSONALITIES
// ================================================================
const PERSONALITIES={
  1:{ // Biscuit - gentle & sweet
    greetings:['*nuzzles you gently* 🥰','*blinks slowly and calmly*','Hello friend! 🌾','*lets out a soft whinny*'],
    hungry:['*nudges your pocket hopefully* 🌾','Please may I have some hay? 🥺','*paws at the ground softly*'],
    happy:['*sighs contentedly* 😊','I feel so loved! 🌸','*swishes tail happily*'],
    sick:['*stands quietly, head low* 😔','I don\'t feel well... 🤒','*breathes slowly*'],
  },
  2:{ // Midnight - affectionate & brooding (Friesian)
    greetings:['*gazes at you with deep dark eyes* 💜','You came... 🌙','*steps forward slowly*','*rests chin on your shoulder*'],
    hungry:['*stamps hoof once, quietly*','I hunger... 🌑','*watches you with intent eyes*'],
    happy:['*shakes mane dramatically* 💜','My heart is full 🌙','*canters in a circle majestically*'],
    sick:['*stands apart from the others* 😔','Leave me be... 🌑','*doesn\'t move when you approach*'],
  },
  3:{ // Clover - playful & curious
    greetings:['*bounces over excitedly!* 🍀','OH HELLO!!!! 🎉','*sniffs everything curiously*','Whatcha doing?? 👀'],
    hungry:['FOOD FOOD FOOD! 🌽','*circles impatiently*','Is it dinner time yet?! 🍎'],
    happy:['BEST DAY EVER! 🎊','*bucks playfully*','Wheeeee! 🍀'],
    sick:['*flops ears sadly* 😢','I don\'t want to play... 🤒','*stands very still, which is unusual*'],
  },
  4:{ // Dusty - calm & dependable
    greetings:['*nods steadily* 👋','Good to see ya. 🤠','*stands solid as a rock*','Howdy. 🌵'],
    hungry:['Ready for feed whenever you are. 🌾','No rush... but I am a bit peckish. 🌽','*waits patiently*'],
    happy:['*lets out a long slow breath* 😌','All good here. ✅','*shifts weight contentedly*'],
    sick:['Not feeling my best today. 😐','*moves slower than usual*','Just need some rest.'],
  },
  5:{ // Sparrow - spirited & intelligent
    greetings:['*arches neck proudly* ✨','I was JUST thinking about you! 🧠','*spins around quickly*','Analyse THIS! 🌪️'],
    hungry:['My caloric intake is insufficient! 🌾','Feed me, and I\'ll think faster! 🧠','*taps hoof rapidly*'],
    happy:['OPTIMAL CONDITIONS ACHIEVED! ⭐','*gallops in a perfect circle*','I am functioning at peak capacity! 💨'],
    sick:['System... compromised... 🤒','*stands still, eyes tracking everything*','I require intervention.'],
  },
};

function getPersonalityQuote(h){
  const p=PERSONALITIES[h.id];
  if(!p) return '';
  if(h.sick) return p.sick[Math.floor(Date.now()/10000)%p.sick.length];
  const avg=(h.stats.hunger+h.stats.thirst+h.stats.grooming+h.stats.exercise+h.stats.rest)/5;
  if(h.stats.hunger<30||h.stats.thirst<30) return p.hungry[Math.floor(Date.now()/10000)%p.hungry.length];
  if(avg>75) return p.happy[Math.floor(Date.now()/12000)%p.happy.length];
  return p.greetings[Math.floor(Date.now()/15000)%p.greetings.length];
}

function takeLoan(amount){
  const interest=Math.round(amount*0.2); // 20% interest
  const total=amount+interest;
  coins+=amount;
  loanBalance+=total;
  addLog('🏦 Took loan of '+amount+' 🪙 (repay '+total+' at '+LOAN_REPAY_PER_TICK+'/min)','system');
  showToast('🏦 Loan of '+amount+' 🪙 received! Repaying '+total+' over time.');
  renderSupplies();
  renderShop();
}

function renderSupplies(){
  const el=document.getElementById('supply-grid');
  if(!el) return;

  // Loan panel at top
  const loanPanel=`
    <div style="grid-column:1/-1;background:${loanBalance>0?'#fff3cd':'#eafaea'};
      border:2px solid ${loanBalance>0?'#c8960a':'var(--grass)'};
      border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <span style="font-size:1.5rem;">🏦</span>
      <div style="flex:1;">
        <div style="font-weight:800;color:var(--bark);font-size:.88rem;">
          ${loanBalance>0?'Loan balance: '+loanBalance+' 🪙 (repaying '+LOAN_REPAY_PER_TICK+'/min)':'No loans — you\'re in the clear! ✅'}
        </div>
        <div style="font-size:.72rem;color:#888;margin-top:2px;">
          🪙 Current coins: <strong>${coins}</strong>
          ${loanBalance>0?' · Coins: '+coins:''}
        </div>
      </div>
      ${loanBalance===0?`
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-wood" style="font-size:.78rem;padding:6px 10px;" onclick="takeLoan(20)">Borrow 20 🪙<br><span style="font-size:.65rem;opacity:.7;">repay 24</span></button>
          <button class="btn btn-wood" style="font-size:.78rem;padding:6px 10px;" onclick="takeLoan(50)">Borrow 50 🪙<br><span style="font-size:.65rem;opacity:.7;">repay 60</span></button>
          <button class="btn btn-wood" style="font-size:.78rem;padding:6px 10px;" onclick="takeLoan(100)">Borrow 100 🪙<br><span style="font-size:.65rem;opacity:.7;">repay 120</span></button>
        </div>
      `:`<div style="font-size:.8rem;color:#c8960a;font-weight:800;">Repaying automatically ⏳</div>`}
    </div>`;

  el.innerHTML=loanPanel+supplies.map(s=>{
    const pct=Math.round(s.stock/s.max*100);
    const low=pct<30;
    const cost=getCostForSupply(s.id);
    const canAfford=coins>=cost;
    return `<div class="supply-card ${low?'low-stock':''}" data-tip="${low?'Running low!':'Good stock'}">
      <div class="supply-icon">${s.icon}</div>
      <div class="supply-name">${s.name}</div>
      <div class="supply-stock" style="${low?'color:var(--sick);':''}">${s.stock} / ${s.max}${low?' ⚠️':''}</div>
      <div class="supply-bar-bg"><div class="supply-bar ${low?'low':''}" style="width:${pct}%"></div></div>
      <div style="font-weight:800;color:#c8960a;font-size:.75rem;margin-bottom:5px;">🪙 ${cost} coins × 5</div>
      <button class="supply-btn" style="${canAfford?'':'background:#ccc;cursor:not-allowed;'}"
        onclick="adjustSupply('${s.id}',5,${cost})" ${canAfford?'':'disabled'}>
        ${canAfford?'➕ Restock ×5':'Not enough 🪙'}
      </button>
    </div>`;
  }).join('');
}

function getCostForSupply(id){
  const costs={hay:8,grain:10,treats:6,water:7,brush:9,meds:15,shampoo:12,shoes:18};
  return costs[id]||8;
}

function adjustSupply(id,amt,cost=0){
  const s=supplies.find(x=>x.id===id); if(!s) return;
  if(cost>0&&coins<cost){showToast('⚠️ Not enough coins!',true);return;}
  if(cost>0) coins-=cost;
  s.stock=Math.min(s.max,Math.max(0,s.stock+amt));
  addLog('📦 Restocked '+s.name+' (-'+cost+' 🪙)','supply');
  renderSupplies();
  renderShop();
  showToast('📦 Restocked '+s.name+'! (-'+cost+' 🪙)');
}

// ================================================================
// LOG
// ================================================================
function addLog(msg,type){
  const icons={feed:'🌾',water:'💧',groom:'✂️',exercise:'🏃',rest:'😴',move:'📍',graze:'🌿',system:'📋',supply:'📦',health:'🩺',sick:'🤒'};
  const now=new Date();
  farmLog.unshift({msg,icon:icons[type]||'📋',time:now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),type});
  if(farmLog.length>80) farmLog.pop();
  renderLog();
}
function renderLog(){
  const el=document.getElementById('log-list');
  if(!el) return;
  if(farmLog.length===0){el.innerHTML='<div style="color:#bbb;font-style:italic;padding:18px;text-align:center;">No events yet.</div>';return;}
  el.innerHTML=farmLog.map(e=>`
    <div class="log-entry ${e.type==='sick'||e.type==='health'?'log-'+e.type:''}">
      <span>${e.icon}</span><span style="flex:1">${e.msg}</span>
      <span class="log-time">${e.time}</span>
    </div>`).join('');
}

// ================================================================
// MODAL — HELPER
// ================================================================
let helperModalTab='task';
function openHelperModal(idx){
  activeHelperIdx=idx;
  const p=TEAM[idx];
  document.getElementById('helper-modal-title').textContent=p.avatar+' '+p.name+(p.owner?' 👑':'');
  switchHelperTab('task');
  document.getElementById('helper-overlay').classList.add('open');
}
function switchHelperTab(tab){
  helperModalTab=tab;
  document.getElementById('hm-task-panel').style.display=tab==='task'?'block':'none';
  document.getElementById('hm-sched-panel').style.display=tab==='sched'?'block':'none';
  document.getElementById('hm-tab-task').className='modal-tab'+(tab==='task'?' active':'');
  document.getElementById('hm-tab-sched').className='modal-tab'+(tab==='sched'?' active':'');
  if(tab==='task') renderTaskButtons();
  if(tab==='sched') renderSchedSlots();
}
function renderTaskButtons(){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  const busy=h&&h.taskCurrent;
  document.getElementById('task-btn-grid').innerHTML=ALL_TASKS.map(t=>`
    <button class="task-assign-btn" onclick="assignTask(${activeHelperIdx},'${t.id}');closeModal('helper-overlay');" ${busy?'disabled':''}>
      ${t.label}<br><span style="font-size:.6rem;color:#aaa;font-weight:400;">~${t.duration*10}s</span>
    </button>`).join('');
}
function renderSchedSlots(){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  if(!h) return;
  document.getElementById('sched-sessions').innerHTML=h.sessions.map((sess,si)=>`
    <div class="session-block">
      <div class="session-header">
        <strong style="font-size:.8rem;color:var(--bark);">Session ${si+1}</strong>
        <span style="font-size:.75rem;color:#888;">⏰ Time:</span>
        <input type="time" class="session-time" id="sess-time-${si}" value="${sess.time||'07:00'}"/>
        ${h.sessions.length>1?`<button class="session-remove" onclick="removeSession(${si})">✕</button>`:''}
      </div>
      <div id="sess-tasks-${si}">
        ${sess.tasks.map((taskId,ti)=>`
          <div class="session-task-row">
            <select id="sess-task-${si}-${ti}">
              ${ALL_TASKS.map(t=>`<option value="${t.id}" ${taskId===t.id?'selected':''}>${t.label}</option>`).join('')}
            </select>
            <button class="session-task-remove" onclick="removeSessionTask(${si},${ti})">✕</button>
          </div>`).join('')}
      </div>
      <button class="add-task-btn" onclick="addSessionTask(${si})">➕ Add Task</button>
    </div>`).join('');
}
function addSession(){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  if(!h) return;
  h.sessions.push({time:'08:00',tasks:[]});
  renderSchedSlots();
}
function removeSession(si){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  if(!h||h.sessions.length<=1) return;
  h.sessions.splice(si,1); renderSchedSlots();
}
function addSessionTask(si){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  if(!h) return;
  h.sessions[si].tasks.push('hay_all'); renderSchedSlots();
}
function removeSessionTask(si,ti){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  if(!h) return;
  h.sessions[si].tasks.splice(ti,1); renderSchedSlots();
}
function saveSchedule(){
  const h=helpers.find(x=>x.idx===activeHelperIdx);
  if(!h) return;
  h.sessions.forEach((sess,si)=>{
    const te=document.getElementById('sess-time-'+si);
    if(te) sess.time=te.value;
    sess.tasks=[];
    let ti=0;
    while(document.getElementById('sess-task-'+si+'-'+ti)){
      sess.tasks.push(document.getElementById('sess-task-'+si+'-'+ti).value);
      ti++;
    }
  });
  addLog('📅 Updated '+TEAM[activeHelperIdx].name+"'s schedule",'system');
  showToast('📅 Schedule saved!'); closeModal('helper-overlay'); renderHelperGrid();
}

// ================================================================
