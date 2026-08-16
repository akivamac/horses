// HORSE MOVEMENT
// ================================================================
function selectHorse(id){
  selectedHorse=(selectedHorse===id)?null:id;
  renderMeadow();
  renderFarmHorseList();
  // Scroll to the selected horse row
  if(selectedHorse){
    const row=document.getElementById('fhr-'+selectedHorse);
    if(row) row.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

function renderMoveControls(){
  const el=document.getElementById('move-controls');
  if(!el) return;
  if(!selectedHorse){
    el.innerHTML='<span style="font-size:.76rem;color:#aaa;">Tap a horse in the meadow to control it</span>';return;
  }
  const h=horses.find(x=>x.id===selectedHorse);
  if(!h){el.innerHTML='';return;}
  const inPasture=h.pos.location==='pasture';
  el.innerHTML=`
    <strong style="font-size:.8rem;color:var(--bark);">${h.name} selected</strong>
    ${inPasture?`
      <button class="move-btn" onclick="moveHorse('left')" data-tip="Move left">⬅ Left</button>
      <button class="move-btn" onclick="moveHorse('right')" data-tip="Move right">Right ➡</button>
      <button class="move-btn" onclick="moveHorse('closer')" data-tip="Move closer">⬇ Closer</button>
      <button class="move-btn" onclick="moveHorse('farther')" data-tip="Move farther">⬆ Farther</button>
      <button class="move-btn ${h.pos.grazing?'active-grazing':''}" onclick="toggleGraze()" data-tip="${h.pos.grazing?'Stop grazing':'Set horse to graze'}">
        ${h.pos.grazing?'🌿 Stop Grazing':'🌿 Graze'}
      </button>
      <button class="move-btn" onclick="moveHorseDirectly(${h.id},'stable')" style="background:#f5e8cc;border-color:var(--wood);" data-tip="Move to stable">🏠 To Stable</button>
    `:`
      <button class="move-btn" onclick="moveHorseDirectly(${h.id},'pasture')" style="background:#d4f0c4;border-color:#5ab85a;" data-tip="Move to pasture">🌿 To Pasture</button>
    `}
    <button class="move-btn" style="border-color:#ddd;color:#aaa;" onclick="selectedHorse=null;renderMeadow();">✕ Done</button>
  `;
}

function moveHorse(dir){
  const h=horses.find(x=>x.id===selectedHorse);
  if(!h||h.pos.location!=='pasture') return;
  if(dir==='left')   h.pos.x=Math.max(4,parseFloat(h.pos.x)-10);
  if(dir==='right')  h.pos.x=Math.min(88,parseFloat(h.pos.x)+10);
  if(dir==='closer') h.pos.depth=Math.max(25,parseFloat(h.pos.depth)-10);
  if(dir==='farther')h.pos.depth=Math.min(78,parseFloat(h.pos.depth)+10);
  renderMeadow();
}
function toggleGraze(){
  const h=horses.find(x=>x.id===selectedHorse);
  if(!h) return;
  if(h.exercising){showToast("⚠️ Finish exercise first!",true);return;}
  h.pos.grazing=!h.pos.grazing;
  if(h.pos.grazing) setTimeout(wanderGrazingHorses,100);
  addLog((h.pos.grazing?"🌿 Grazing: ":"🌿 Stopped: ")+h.name,'graze');
  showToast(h.pos.grazing?"🌿 "+h.name+" is grazing!":"🌿 "+h.name+" stopped grazing.");
  renderMeadow();
}
function moveHorseDirectly(horseId,location){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  h.pos.location=location;
  if(location==='stable'){h.pos.grazing=false;}
  else {h.pos.x=15+Math.random()*50;h.pos.depth=35+Math.random()*30;}
  addLog((location==='pasture'?'🌿':'🏠')+' Moved '+h.name+(location==='pasture'?' to pasture':' to stable'),'move');
  showToast((location==='pasture'?'🌿 ':'🏠 ')+h.name+(location==='pasture'?' is in the pasture!':' is in the stable!'));
  renderAll();
}
function moveToStable(){if(selectedHorse)moveHorseDirectly(selectedHorse,'stable');}
function moveToPasture(){if(selectedHorse)moveHorseDirectly(selectedHorse,'pasture');}

// ================================================================
// SICK ALERT
// ================================================================
function renderSickAlert(){
  const sick=horses.filter(h=>h.sick);
  const el=document.getElementById('sick-alert');
  if(sick.length===0){el.classList.remove('visible');return;}
  el.classList.add('visible');
  document.getElementById('sick-alert-title').textContent=
    sick.length===1?sick[0].name+" needs help!":sick.length+" horses need help!";
  document.getElementById('sick-alert-body').textContent=
    sick.map(h=>{const ill=ILLNESS_TYPES.find(x=>x.id===h.illnessType);return h.name+(ill?' ('+ill.msg+')':'');}).join(', ')+
    " — go to the 🐴 Horses tab to treat them.";
}

// ================================================================
