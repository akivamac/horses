// ================================================================
// TASK STEP SYSTEM
// ================================================================
const TASK_DEFS = {
  feed_hay:{name:'🌾 Feed Hay',supply:'hay',steps:[
    {icon:'🪣',title:'Get the hay scoop',desc:'Walk to the feed room and scoop out a measure of hay.'},
    {icon:'🌾',title:'Fill the hay net',desc:'Stuff the hay net full — nice and tight so it lasts!'},
    {icon:'🚶',title:'Carry to the stall',desc:'Carry the hay net to the horse. Mind your step!'},
    {icon:'🎯',title:'Hang the hay net',desc:'Hook it up inside the stall at the right height.'},
    {icon:'😄',title:'Done!',desc:'The horse digs in happily!',action:'feed_hay'},
  ]},
  feed_grain:{name:'🌽 Feed Grain',supply:'grain',steps:[
    {icon:'🪣',title:'Get the feed bucket',desc:'Grab a clean bucket from the feed room.'},
    {icon:'🌽',title:'Scoop the grain',desc:'Measure out the right amount — not too much!'},
    {icon:'🚶',title:'Carry to the horse',desc:'Walk carefully so you don\'t spill it.'},
    {icon:'🍽️',title:'Pour into the trough',desc:'Empty the bucket into the feeding trough.'},
    {icon:'😄',title:'Done!',desc:'Horse munches away!',action:'feed_grain'},
  ]},
  water:{name:'💧 Water',supply:'water',steps:[
    {icon:'🪣',title:'Get the bucket',desc:'Pick up the water bucket from the hook.'},
    {icon:'🚰',title:'Fill at the tap',desc:'Hold it under the tap and fill to the top. Heavy!'},
    {icon:'💪',title:'Carry it over',desc:'Lug the heavy bucket to the horse\'s stall!'},
    {icon:'💧',title:'Pour into the trough',desc:'Tip it in carefully — don\'t splash yourself!'},
    {icon:'😌',title:'Done!',desc:'The horse drinks deeply!',action:'water'},
  ]},
  groom:{name:'✂️ Groom',supply:'brush',steps:[
    {icon:'🎒',title:'Fetch the grooming kit',desc:'Get the kit — dandy brush, body brush, mane comb and hoof pick.'},
    {icon:'🖌️',title:'Brush the body',desc:'Long strokes with the dandy brush to remove dirt and loose hair.'},
    {icon:'✨',title:'Brush mane & tail',desc:'Gently comb through. Work out any tangles slowly.'},
    {icon:'🦶',title:'Pick the hooves',desc:'Lift each hoof and clean with the hoof pick. Check for stones!'},
    {icon:'🌟',title:'Done!',desc:'The horse looks magnificent!',action:'groom'},
  ]},
  exercise_walk:{name:'🚶 Walk Exercise',steps:[
    {icon:'🪢',title:'Get the halter & lead rope',desc:'Grab the halter from the hook outside the stall.'},
    {icon:'🐴',title:'Halter the horse',desc:'Slip the halter gently over the nose and click the buckle.'},
    {icon:'🚪',title:'Lead out of the stall',desc:'Open the door and lead the horse out to the path.'},
    {icon:'🚶',title:'Walk the circuit',desc:'Walk a steady circuit — head up, relaxed pace. One full lap!'},
    {icon:'🏠',title:'Lead back in',desc:'Bring the horse back, remove the halter and give a pat.'},
    {icon:'✅',title:'Done!',desc:'Great session!',action:'exercise_walk'},
  ]},
  exercise_trot:{name:'🏇 Trot Exercise',steps:[
    {icon:'🪢',title:'Get halter & lunge line',desc:'Grab the halter and long lunge line from the tack room.'},
    {icon:'🐴',title:'Halter the horse',desc:'Fit the halter carefully — not too tight.'},
    {icon:'🌿',title:'Lead to the arena',desc:'Walk the horse to the exercise area.'},
    {icon:'⭕',title:'Lunge at trot',desc:'Ask the horse to trot in a circle — encourage with your voice!'},
    {icon:'🔄',title:'Change direction',desc:'Swap sides and trot the other way. Balance both sides!'},
    {icon:'✅',title:'Done!',desc:'Excellent trot session!',action:'exercise_trot'},
  ]},
  muck_out:{name:'💩 Muck Out',steps:[
    {icon:'🚛',title:'Get the wheelbarrow',desc:'Wheel the barrow to the stall. Put on your muck boots!'},
    {icon:'⬆️',title:'Move the horse out',desc:'Lead the horse to the paddock so you can work freely.'},
    {icon:'⛏️',title:'Fork out the droppings',desc:'Use the dung fork to remove all droppings. Get it all!'},
    {icon:'🌾',title:'Remove wet bedding',desc:'Take out damp straw — it causes hoof problems if left.'},
    {icon:'🚛',title:'Wheel to the muck heap',desc:'Push the full barrow to the muck heap and tip it. Phew!'},
    {icon:'🛏️',title:'Put in fresh bedding',desc:'Spread a thick layer of fresh straw. Lovely and clean!'},
    {icon:'✅',title:'Done!',desc:'Spotless stall!',action:'muck_out'},
  ]},
  health_check:{name:'🩺 Health Check',supply:'meds',steps:[
    {icon:'🎒',title:'Get the vet kit',desc:'Fetch the bag — thermometer, stethoscope, torch.'},
    {icon:'👀',title:'Check eyes & nose',desc:'Look for any discharge or cloudiness. Note anything unusual.'},
    {icon:'🌡️',title:'Take temperature',desc:'Check the temperature. Normal for a horse is 37.5°C.'},
    {icon:'💓',title:'Listen to heart & gut',desc:'Use the stethoscope — you should hear gut sounds on both sides.'},
    {icon:'🦶',title:'Check legs & hooves',desc:'Run your hands down each leg feeling for heat or swelling.'},
    {icon:'📋',title:'Record results',desc:'Write everything down in the health log.'},
    {icon:'✅',title:'Done!',desc:'Health check complete!',action:'health_check'},
  ]},
  bathe:{name:'🛁 Bath Time',supply:'shampoo',steps:[
    {icon:'🚿',title:'Fill the wash bay',desc:'Attach the hose and get the water running — not too cold!'},
    {icon:'🧴',title:'Apply shampoo',desc:'Squirt shampoo along the back and neck. Work it in with your hands.'},
    {icon:'🖌️',title:'Scrub the coat',desc:'Use the body brush in circles all over. Get the legs and belly too!'},
    {icon:'🎽',title:'Scrub the mane & tail',desc:'Work shampoo through the mane and tail. Rinse and repeat!'},
    {icon:'🚿',title:'Rinse thoroughly',desc:'Rinse until the water runs completely clear. No soap left!'},
    {icon:'🧤',title:'Scrape off the water',desc:'Use the sweat scraper to remove excess water from the coat.'},
    {icon:'✅',title:'Done!',desc:'Squeaky clean and shiny!',action:'bathe'},
  ]},
  hoof_trim:{name:'🪄 Hoof Trimming',supply:'shoes',steps:[
    {icon:'🪣',title:'Gather the tools',desc:'Get the hoof pick, rasp file, and nippers from the tack room.'},
    {icon:'🐴',title:'Tie up the horse',desc:'Tie the horse safely in the wash bay so it can\'t wander.'},
    {icon:'🦶',title:'Pick the first hoof',desc:'Lift the front leg gently and clean out the hoof with the pick.'},
    {icon:'🔧',title:'Rasp the sole',desc:'Use the rasp to level the bottom of the hoof. Keep it balanced!'},
    {icon:'🔄',title:'Do all four hooves',desc:'Repeat for each hoof. Check each one looks level and healthy.'},
    {icon:'✨',title:'Apply hoof oil',desc:'Paint hoof oil on each hoof. Makes them strong and shiny!'},
    {icon:'✅',title:'Done!',desc:'Perfect hooves! So important for their health.',action:'hoof_trim'},
  ]},
  vet_visit:{name:'🏥 Vet Visit',supply:'meds',steps:[
    {icon:'📞',title:'Call the vet',desc:'Ring Lily the vet helper. She\'ll come right away!'},
    {icon:'🐴',title:'Bring horse to the yard',desc:'Lead the horse to the examination area in the yard.'},
    {icon:'🩺',title:'Full examination',desc:'Lily checks everything — teeth, eyes, legs, breathing.'},
    {icon:'💉',title:'Vaccinations',desc:'Give the annual vaccination. Quick prick — brave horse!'},
    {icon:'💊',title:'Prescribe treatment',desc:'Lily writes up any medicine or special care needed.'},
    {icon:'📋',title:'Update health records',desc:'Fill in the health passport with today\'s results.'},
    {icon:'✅',title:'Done!',desc:'Full bill of health! Lily says well done!',action:'vet_visit'},
  ]},
};

let activeTask=null;

function startTask(defId,horseId){
  const def=TASK_DEFS[defId];
  if(!def) return;
  // Mowing has no horse
  if(horseId!==null){
    const h=horses.find(x=>x.id===horseId);
    if(!h) return;
    if(def.supply&&supplyStock(def.supply)<1){showToast('⚠️ No '+def.supply+' — restock first!',true);return;}
    if((defId==='exercise_walk'||defId==='exercise_trot')&&h.pos.location==='stable'){
      showToast('⚠️ Move '+h.name+' to the pasture first!',true);return;
    }
  }
  activeTask={defId,horseId,stepIndex:0};
  renderTaskModal();
  document.getElementById('task-overlay').classList.add('open');
}

function renderTaskModal(){
  if(!activeTask) return;
  const def=TASK_DEFS[activeTask.defId];
  const h=activeTask.horseId!=null?horses.find(x=>x.id===activeTask.horseId):null;
  const step=def.steps[activeTask.stepIndex];
  const col=h?(HORSE_COLORS[h.id]||HORSE_COLORS[1]):null;
  document.getElementById('task-horse-svg').innerHTML=col?horseSVG(col.body,col.mane,0.5):'<span style="font-size:2.5rem;">🚜</span>';
  document.getElementById('task-horse-name').textContent=h?h.name:'The Meadow';
  document.getElementById('task-name').textContent=def.name;
  document.getElementById('task-step-dots').innerHTML=def.steps.map((s,i)=>`
    <div style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      background:${i<activeTask.stepIndex?'var(--grass)':i===activeTask.stepIndex?'var(--hay)':'#e8dcc8'};
      font-size:.68rem;font-weight:800;color:${i<=activeTask.stepIndex?'#fff':'#aaa'};
      border:2px solid ${i===activeTask.stepIndex?'var(--bark)':'transparent'};">
      ${i<activeTask.stepIndex?'✓':i+1}</div>`).join('');
  document.getElementById('task-step-icon').textContent=step.icon;
  document.getElementById('task-step-title').textContent=step.title;
  document.getElementById('task-step-desc').textContent=step.desc;
  const isLast=activeTask.stepIndex===def.steps.length-1;
  document.getElementById('task-step-btn').textContent=isLast?'🎉 Finish!':'✅ Done — next step →';
  if(activeTask.horseId!=null) horseAction(activeTask.horseId,step.icon);
}

function doCurrentStep(){
  if(!activeTask) return;
  const def=TASK_DEFS[activeTask.defId];
  const h=horses.find(x=>x.id===activeTask.horseId);
  const step=def.steps[activeTask.stepIndex];
  if(step.action) applyTaskAction(step.action,activeTask.horseId);
  activeTask.stepIndex++;
  if(activeTask.stepIndex>=def.steps.length){
    document.getElementById('task-overlay').classList.remove('open');
    showToast('🎉 '+def.name+' done for '+h.name+'!');
    addLog(def.name+' for '+h.name,'system');
    activeTask=null;
    renderAll();
  } else {
    renderTaskModal();
  }
}

function applyTaskAction(action,horseId){
  // mow_done doesn't need a horse
  if(action==='mow_done'){
    meadowMowed=true;
    earnCoins(20);
    showToast('🌿 Meadow is freshly mowed! +20 🪙');
    addLog('🌿 Meadow mowed — looking beautiful!','system');
    renderAll();
    return;
  }
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  if(action==='feed_hay'   &&useSupply('hay'))   {h.stats.hunger  =Math.min(100,h.stats.hunger+20);  earnCoins(3);}
  if(action==='feed_grain' &&useSupply('grain'))  {h.stats.hunger  =Math.min(100,h.stats.hunger+30);  earnCoins(3);}
  if(action==='water'      &&useSupply('water'))  {h.stats.thirst  =Math.min(100,h.stats.thirst+35);  earnCoins(3);}
  if(action==='groom'      &&useSupply('brush'))  {h.stats.grooming=Math.min(100,h.stats.grooming+35);earnCoins(4);}
  if(action==='exercise_walk'&&!h.exercising&&!h.sick) {startExercise(h.id,'walk');earnCoins(5);}
  if(action==='exercise_trot'&&!h.exercising&&!h.sick) {startExercise(h.id,'trot');earnCoins(7);}
  if(action==='muck_out') {h.stats.rest=Math.min(100,h.stats.rest+5);earnCoins(4);}
  if(action==='health_check'&&useSupply('meds')){
    const s=h.sick?'SICK — treat!':'All clear ✅';
    showToast('🩺 '+h.name+': '+s);
    addLog('🩺 '+h.name+': '+s,'health');
    earnCoins(5);
  }
  if(action==='bathe'&&useSupply('shampoo')){
    h.stats.grooming=Math.min(100,h.stats.grooming+50);
    h.stats.health  =Math.min(100,h.stats.health+5);
    earnCoins(8);
    showToast('🛁 '+h.name+' is sparkling clean!');
    addLog('🛁 Bathed '+h.name,'groom');
  }
  if(action==='hoof_trim'&&useSupply('shoes')){
    h.stats.health=Math.min(100,h.stats.health+8);
    earnCoins(10);
    showToast('🪄 '+h.name+'\'s hooves look perfect!');
    addLog('🪄 Trimmed hooves: '+h.name,'health');
  }
  if(action==='vet_visit'&&useSupply('meds')){
    h.stats.health=Math.min(100,h.stats.health+15);
    if(h.sick&&h.recoveryDaysLeft===0) h.recoveryDaysLeft=72;
    earnCoins(15);
    showToast('🏥 Vet visit done for '+h.name+'!');
    addLog('🏥 Vet visit: '+h.name,'health');
  }
}

function cancelTask(){
  document.getElementById('task-overlay').classList.remove('open');
  activeTask=null;
}

// ================================================================
// VISUAL ACTION FEEDBACK — pops emoji on horse in meadow
// ================================================================
function horseAction(horseId, emoji){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;

  // Show pop on meadow if horse is in pasture
  if(h.pos.location==='pasture'){
    const meadow=document.getElementById('meadow-horses');
    if(meadow){
      const depthFrac=(h.pos.depth-25)/50;
      const scale=1.05-depthFrac*0.55;
      const bottomPct=(20+(1-depthFrac)*35);
      const pop=document.createElement('div');
      pop.className='horse-action-pop';
      pop.textContent=emoji;
      pop.style.cssText=`left:calc(${h.pos.x}% + 30px);bottom:calc(${bottomPct}% + 40px);font-size:${1.4*scale+0.6}rem;`;
      meadow.appendChild(pop);
      setTimeout(()=>pop.remove(),1500);

      // Make the horse react (bounce)
      const horseEl=meadow.querySelector(`[data-horseid="${horseId}"]`);
      if(horseEl){
        horseEl.classList.remove('reacting');
        void horseEl.offsetWidth; // force reflow
        horseEl.classList.add('reacting');
        setTimeout(()=>horseEl.classList.remove('reacting'),1300);
      }
    }
  }

  // Also flash the farm list row
  const row=document.getElementById('fhr-'+horseId);
  if(row){
    row.style.transition='background .15s';
    row.style.background='#fffbe6';
    setTimeout(()=>row.style.background='',600);
  }
}
// ================================================================
function renderFarmHorseList(){
  const el=document.getElementById('farm-horse-list');
  if(!el) return;
  el.innerHTML=horses.map(h=>{
    const col=HORSE_COLORS[h.id]||HORSE_COLORS[1];
    const ill=h.sick?ILLNESS_TYPES.find(x=>x.id===h.illnessType):null;
    const noFood=ill&&ill.noFood;
    const isSelected=selectedHorse===h.id;

    // Status summary
    let statusMsg='';
    if(h.sick) statusMsg=`${ill?ill.icon:'🤒'} ${ill?ill.msg:'Sick'}${h.recoveryDaysLeft>0?' — healing':''}`;
    else if(h.exercising) statusMsg=`🏃 Exercising (${Math.round(getExerciseProgress(h)*100)}%)`;
    else if(h.resting) statusMsg=`😴 Resting (${Math.round(getRestProgress(h)*100)}%)`;
    else if(h.pos.grazing) statusMsg='🌿 Grazing';
    else statusMsg=h.pos.location==='stable'?'🏠 In stable':'🌿 In pasture';

    // Lowest stat warning
    const stats=h.stats;
    const lowest=Object.entries({hunger:stats.hunger,thirst:stats.thirst,grooming:stats.grooming,exercise:stats.exercise,rest:stats.rest,health:stats.health})
      .sort((a,b)=>a[1]-b[1])[0];
    const icons={hunger:'🌾',thirst:'💧',grooming:'✂️',exercise:'🏃',rest:'😴',health:'❤️'};

    return `<div class="farm-horse-row ${isSelected?'selected-row':''} ${h.sick?'sick-row':''}" id="fhr-${h.id}">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;cursor:pointer;padding:4px;border-radius:10px;
        background:${isSelected?'rgba(212,168,0,0.12)':'transparent'};transition:background .2s;"
        onclick="selectHorse(${h.id})" title="Tap to select ${h.name}">
        <div class="fhr-svg">
          ${horseSVG(col.body,col.mane,0.6)}
        </div>
        <div class="fhr-info">
          <div class="fhr-name">${h.fav?'⭐ ':''}${h.name}${isSelected?' <span style="font-size:.7rem;background:var(--hay);color:#fff;padding:1px 7px;border-radius:8px;font-family:Nunito,sans-serif;font-weight:800;">Selected</span>':''}</div>
          <div class="fhr-meta">${h.breed} · Age ${h.age} · ${col.name}</div>
          <div class="fhr-status">${statusMsg}${lowest[1]<30?' · ⚠️ '+icons[lowest[0]]+' '+lowest[0]+' low':''}</div>
          <div style="font-size:.68rem;color:#9a6a20;font-style:italic;margin-top:2px;">${getPersonalityQuote(h)}</div>
        </div>
      </div>
      <div class="fhr-bars">
        <div class="fhr-bar-row"><span style="font-size:.65rem;width:14px;">🌾</span><div class="fhr-bar-bg"><div class="fhr-bar" style="width:${Math.round(stats.hunger)}%;background:${stats.hunger<20?'#e85555':'#e8a63a'};"></div></div></div>
        <div class="fhr-bar-row"><span style="font-size:.65rem;width:14px;">💧</span><div class="fhr-bar-bg"><div class="fhr-bar" style="width:${Math.round(stats.thirst)}%;background:${stats.thirst<20?'#e85555':'#5b9bd5'};"></div></div></div>
        <div class="fhr-bar-row"><span style="font-size:.65rem;width:14px;">❤️</span><div class="fhr-bar-bg"><div class="fhr-bar" style="width:${Math.round(stats.health)}%;background:${stats.health<40?'#e85555':'#7bc47b'};"></div></div></div>
      </div>
      <div class="fhr-actions">
        <!-- Move -->
        ${h.pos.location==='pasture'
          ?`<button class="care-btn" style="background:#f5e8cc;color:var(--bark);border:2px solid var(--wood);" onclick="moveHorseDirectly(${h.id},'stable')" data-tip="Move to stable">🏠 Stable</button>`
          :`<button class="care-btn" style="background:#d4f0c4;color:#1a5a1a;border:2px solid #5ab85a;" onclick="moveHorseDirectly(${h.id},'pasture')" data-tip="Move to pasture">🌿 Pasture</button>`}
        ${h.pos.location==='pasture'
          ?`<button class="care-btn ${h.pos.grazing?'active-grazing':''}" style="background:${h.pos.grazing?'#9eda9e':'var(--white)'};border:2px solid #5ab85a;color:${h.pos.grazing?'#1a5a1a':'var(--bark)'};" onclick="selectHorse(${h.id});toggleGraze();" data-tip="${h.pos.grazing?'Stop grazing':'Set grazing'}">${h.pos.grazing?'🌿 Stop':'🌿 Graze'}</button>`
          :''}
        <!-- Step-based tasks -->
        <button class="care-btn feed-hay" onclick="startTask('feed_hay',${h.id})" data-tip="Feed hay step by step" ${noFood?'disabled':''}>🌾 Hay</button>
        <button class="care-btn feed-grain" onclick="startTask('feed_grain',${h.id})" data-tip="Feed grain step by step" ${noFood?'disabled':''}>🌽 Grain</button>
        <button class="care-btn feed-water" onclick="startTask('water',${h.id})" data-tip="Water step by step">💧 Water</button>
        <button class="care-btn groom" onclick="startTask('groom',${h.id})" data-tip="Groom step by step" ${h.exercising||h.resting?'disabled':''}>✂️ Groom</button>
        ${h.exercising
          ?`<button class="care-btn exercise-stop" onclick="stopExercise(${h.id})" data-tip="Stop exercise">⏹ Stop</button>`
          :`<button class="care-btn exercise-start" onclick="startTask('exercise_walk',${h.id})" data-tip="Walk exercise step by step" ${h.sick||h.resting||h.pos.location==='stable'?'disabled':''}>🚶 Walk</button>
            <button class="care-btn exercise-start" onclick="startTask('exercise_trot',${h.id})" data-tip="Trot exercise — needs open space" ${h.sick||h.resting||h.pos.location==='stable'?'disabled':''}>🏇 Trot</button>`}
        <button class="care-btn" style="background:#d4c8f0;color:#3a1a6a;" onclick="startTask('muck_out',${h.id})" data-tip="Muck out stall step by step">💩 Muck</button>
        <button class="care-btn health-check" onclick="startTask('health_check',${h.id})" data-tip="Health check step by step">🩺 Check</button>
        <button class="care-btn" style="background:#b0d8f0;color:#1a3a6a;" onclick="startTask('bathe',${h.id})" data-tip="Bath time!" ${h.exercising||h.resting?'disabled':''}>🛁 Bath</button>
        <button class="care-btn" style="background:#e0d8f0;color:#3a1a6a;" onclick="startTask('hoof_trim',${h.id})" data-tip="Hoof trimming">🪄 Hooves</button>
        <button class="care-btn" style="background:#f0e0d0;color:#6a3a10;" onclick="startTask('vet_visit',${h.id})" data-tip="Full vet visit">🏥 Vet</button>
        ${h.sick&&h.recoveryDaysLeft===0?`<button class="care-btn treat-sick" onclick="treatSick(${h.id})" data-tip="Treat sickness">💊 Treat</button>`:''}
        <!-- Full info -->
        <button class="btn btn-hay" style="padding:5px 10px;font-size:.75rem;"
          onclick="showPage('horses',document.querySelector('.tab:nth-child(2)'));setTimeout(()=>{const el=document.getElementById('hcard-${h.id}');if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='3px solid var(--hay)';setTimeout(()=>el.style.outline='',1800);}},120);"
          data-tip="See full stats">📋 Full Info</button>
      </div>
    </div>`;
  }).join('');
}
// ================================================================
const TASK_TOOLS={
  hay_all:'🌾',grain_all:'🌽',treats_all:'🍎',water_all:'🪣',
  groom_all:'✂️',muck_out:'🧹',health_all:'🩺',to_pasture:'🤠',
  to_stable:'🤠',exercise_walk:'🏇',exercise_trot:'🏇',
  restock:'📦',graze_all:'🌿',morning:'🌅',evening:'🌙',
};

function renderWorkers(){
  const container=document.getElementById('meadow-workers');
  if(!container) return;

  helpers.forEach(h=>{
    const spriteId='mworker-'+h.idx;
    let el=document.getElementById(spriteId);
    const p=TEAM[h.idx];

    if(!h.taskCurrent){
      if(el) el.remove();
      return;
    }

    if(!el){
      el=document.createElement('div');
      el.id=spriteId;
      el.className='field-worker working';
      container.appendChild(el);
    }

    const prog=h.taskStart?Math.round(Math.min(1,(Date.now()-h.taskStart)/h.taskDuration)*100):0;
    const tool=TASK_TOOLS[h.taskId]||'🔧';
    el.style.cssText=`left:${h.wx}%;bottom:${h.wy*0.4+15}%;`;
    el.innerHTML=`
      <div class="action-bubble">${tool} ${prog}%</div>
      <div class="worker-figure">${p.avatar}</div>
      <div class="tool-anim" style="position:absolute;left:60%;top:10%;">${tool}</div>
    `;
  });

  // Remove stale workers
  helpers.forEach(h=>{
    if(!h.taskCurrent){
      const old=document.getElementById('mworker-'+h.idx);
      if(old) old.remove();
    }
  });
}

// Worker movement during tasks
setInterval(()=>{
  helpers.forEach(h=>{
    if(!h.taskCurrent) return;
    if(h.taskId==='to_stable'||h.taskId==='to_pasture') return;
    const targets=horses.filter(x=>x.pos.location==='pasture');
    if(targets.length>0){
      const t=targets[Math.floor(Math.random()*targets.length)];
      h.wx=Math.min(88,Math.max(5,t.pos.x+(Math.random()-.5)*10));
      h.wy=Math.min(90,Math.max(20,t.pos.depth+(Math.random()-.5)*8));
    } else {
      h.wx=Math.min(88,Math.max(5,h.wx+(Math.random()-.5)*12));
      h.wy=Math.min(90,Math.max(20,h.wy+(Math.random()-.5)*10));
    }
  });
  renderWorkers();
},3000);

// Walk worker to position (animated)
function walkWorkerTo(helperIdx,tx,ty,duration=1500){
  return new Promise(resolve=>{
    const h=helpers.find(x=>x.idx===helperIdx);
    if(!h){resolve();return;}
    const sx=h.wx,sy=h.wy,t0=Date.now();
    function step(){
      const f=Math.min(1,(Date.now()-t0)/duration);
      h.wx=sx+(tx-sx)*f; h.wy=sy+(ty-sy)*f;
      renderWorkers();
      if(f<1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}

// Animate bringing horses to stable one by one
async function animateBringToStable(helperIdx){
  const toMove=horses.filter(h=>h.pos.location==='pasture');
  for(const horse of toMove){
    await walkWorkerTo(helperIdx,horse.pos.x,horse.pos.depth,1000);
    showToast("🤠 "+TEAM[helperIdx].name+" roped "+horse.name+"!");
    await new Promise(r=>setTimeout(r,500));
    horse.pos.x=5; horse.pos.depth=50;
    renderMeadow();
    await walkWorkerTo(helperIdx,5,50,800);
    horse.pos.location='stable'; horse.pos.grazing=false;
    addLog("🏠 "+TEAM[helperIdx].name+" brought "+horse.name+" in",'move');
    renderAll(); await new Promise(r=>setTimeout(r,300));
  }
}
async function animateBringToPasture(helperIdx){
  const toMove=horses.filter(h=>h.pos.location==='stable');
  for(let i=0;i<toMove.length;i++){
    const horse=toMove[i];
    await walkWorkerTo(helperIdx,5,40+i*8,700);
    horse.pos.location='pasture';
    horse.pos.x=15+Math.random()*50;
    horse.pos.depth=35+Math.random()*30;
    addLog("🌿 "+TEAM[helperIdx].name+" led "+horse.name+" out",'move');
    renderAll(); await walkWorkerTo(helperIdx,horse.pos.x,horse.pos.depth,900);
    await new Promise(r=>setTimeout(r,300));
  }
}

// ================================================================
