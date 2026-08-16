// SAVE / RESTORE
// ================================================================
function generateCode(){
  const data={
    horses:horses.map(h=>({id:h.id,stats:{...h.stats},pos:{...h.pos},sick:h.sick,sickDays:h.sickDays,
      illnessType:h.illnessType,recoveryDaysLeft:h.recoveryDaysLeft||0,
      exercising:h.exercising,exerciseStart:h.exerciseStart,exerciseDuration:h.exerciseDuration,exerciseType:h.exerciseType,
      resting:h.resting,restStart:h.restStart,restDuration:h.restDuration})),
    helpers:helpers.map(h=>({idx:h.idx,sessions:h.sessions,wx:h.wx,wy:h.wy})),
    supplies:supplies.map(s=>({id:s.id,stock:s.stock})),
    log:farmLog.slice(0,20),
    savedAt:new Date().toISOString(),
    romanceStage, romanceProgress, foal,
    coins, meadowMowed, loanBalance, meadowMowedTicks, courtingTickCount
  };
  const str=JSON.stringify(data);
  const bytes=new TextEncoder().encode(str);
  let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));
  return btoa(bin);
}
function openLogout(){document.getElementById('save-code').textContent=generateCode();document.getElementById('logout-overlay').classList.add('open');}
function openRestore(){document.getElementById('restore-input').value='';document.getElementById('restore-error').style.display='none';document.getElementById('restore-overlay').classList.add('open');}
function doRestore(){
  const errorEl=document.getElementById('restore-error');
  errorEl.style.display='none';
  const raw=document.getElementById('restore-input').value.trim();
  if(!raw){
    errorEl.textContent='❌ Please paste a restore code first!';
    errorEl.style.display='block';
    return;
  }

  let data=null;
  let lastErr='';

  // Method 1: TextDecoder (new saves)
  try{
    const bin=atob(raw);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    const str=new TextDecoder('utf-8').decode(bytes);
    data=JSON.parse(str);
  }catch(e){lastErr='M1:'+e.message;}

  // Method 2: plain UTF-8 atob (some old saves)
  if(!data||!data.horses){
    try{
      const str=atob(raw);
      data=JSON.parse(str);
    }catch(e){lastErr+=' M2:'+e.message;}
  }

  // Method 3: percent-encoded (oldest saves)
  if(!data||!data.horses){
    try{
      const str=decodeURIComponent(atob(raw).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      data=JSON.parse(str);
    }catch(e){lastErr+=' M3:'+e.message;}
  }

  if(!data||!data.horses){
    errorEl.textContent='❌ Could not read code. Error: '+lastErr;
    errorEl.style.display='block';
    return;
  }

  // Apply horses
  data.horses.forEach(s=>{
    const h=horses.find(x=>x.id===s.id);
    if(h) Object.assign(h,{
      stats:{...s.stats},
      pos:{...s.pos},
      sick:s.sick||false,
      sickDays:s.sickDays||0,
      illnessType:s.illnessType||'',
      recoveryDaysLeft:s.recoveryDaysLeft||0,
      exercising:false, // don't restore mid-exercise
      exerciseStart:null,
      exerciseDuration:0,
      exerciseType:'',
      resting:false, // don't restore mid-rest
      restStart:null,
      restDuration:0
    });
  });

  if(data.helpers) data.helpers.forEach(s=>{
    const h=helpers.find(x=>x.idx===s.idx);
    if(h){h.sessions=s.sessions||h.sessions;h.wx=s.wx||h.wx;h.wy=s.wy||h.wy;}
  });

  if(data.supplies) data.supplies.forEach(s=>{
    const sup=supplies.find(x=>x.id===s.id);
    if(sup) sup.stock=s.stock;
  });

  if(data.log) farmLog=[...data.log].slice(0,80);
  if(data.romanceStage) romanceStage=data.romanceStage;
  if(data.romanceProgress) romanceProgress=data.romanceProgress;
  if(data.foal) foal=data.foal;
  if(data.coins!=null) coins=data.coins;
  if(data.meadowMowed!=null) meadowMowed=data.meadowMowed;
  if(data.loanBalance!=null) loanBalance=data.loanBalance;
  if(data.meadowMowedTicks!=null) meadowMowedTicks=data.meadowMowedTicks;
  if(data.courtingTickCount!=null) courtingTickCount=data.courtingTickCount;

  autoSave();
  addLog('🔑 Farm restored from save code','system');
  closeModal('restore-overlay');
  renderAll();
  showToast('✅ Farm restored! Thirst: '+Math.round(horses[0].stats.thirst)+'%');
}
function copyCode(){
  navigator.clipboard.writeText(document.getElementById('save-code').textContent)
    .then(()=>showToast("📋 Copied!")).catch(()=>showToast("Select the code and copy manually!"));
}

// ================================================================
// UI
// ================================================================
function showPage(name,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  if(btn) btn.classList.add('active');
  if(name==='view3d'){ init3DView(); set3DRunning(true); resize3D(); }
  else if(three3D){ set3DRunning(false); }
}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.overlay').forEach(o=>{
  o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');});
});
let toastTimer;
function showToast(msg,warn=false){
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const t=document.createElement('div');
  t.className='toast'+(warn?' warn':'');t.textContent=msg;
  document.body.appendChild(t);
  toastTimer=setTimeout(()=>t.remove(),3000);
}

// ================================================================
// RENDER ALL
// ================================================================
function renderMowSection(){
  const el=document.getElementById('mow-section');
  if(!el) return;
  const allIn=canMow();
  el.innerHTML=`<div style="background:${allIn?'#eafaea':'#f9f4e8'};border:2px solid ${allIn?'var(--grass)':'#ddd'};border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
    <span style="font-size:1.6rem;">🚜</span>
    <div style="flex:1;">
      <div style="font-weight:800;color:var(--bark);font-size:.88rem;">Mow the Meadow</div>
      <div style="font-size:.75rem;color:#888;">${allIn?'All horses are in! Ready to mow 🌿':'Move all horses to the stable first'}</div>
    </div>
    ${meadowMowed?'<span style="font-size:.8rem;color:var(--grass);font-weight:800;">✅ Freshly mowed!</span>':''}
    <button class="btn ${allIn?'btn-grass':'btn-wood'}" style="padding:7px 14px;font-size:.82rem;" 
      onclick="startMowing()" ${allIn?'':'disabled'}>🚜 ${meadowMowed?'Mow Again':'Mow Now'}</button>
  </div>`;
}

function renderAll(){
  renderTeam();
  renderMeadow();
  renderStables();
  renderGrid();
  renderFarmHorseList();
  renderMowSection();
  renderRomanceBanner();
  renderSchedule();
  renderSupplies();
  renderShop();
  renderSickAlert();
  renderHelperGrid();
  renderLog();
  sync3DEnv();
  sync3DHorses();
  autoSave();
}

// ================================================================
// AUTO-SAVE / AUTO-LOAD (localStorage — single device)
// ================================================================
const LS_KEY = 'cloverhill_farm_save';
const IDB_DB = 'CloverHillFarm';
const IDB_STORE = 'saves';

// ================================================================
// SERVICE WORKER — register for offline caching only
// ================================================================
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./horse-farm-sw.js', {scope:'./'})
    .then(reg => console.log('[Farm] SW registered:', reg.scope))
    .catch(err => console.warn('[Farm] SW failed:', err));
}

// ================================================================
// INDEXEDDB — persistent save storage
// Far more reliable than localStorage on Android
// ================================================================
function openDB(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(IDB_STORE, {keyPath:'key'});
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e);
  });
}

async function idbSave(key, value){
  try{
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({key, value});
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject();
    });
  }catch(e){ return false; }
}

async function idbLoad(key){
  try{
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = e => resolve(e.target.result?.value || null);
      req.onerror = () => resolve(null);
    });
  }catch(e){ return null; }
}

// Save — localStorage is SYNCHRONOUS (guaranteed before page closes)
// IndexedDB is async bonus for extra persistence
function autoSave(){
  const code = generateCode();
  // Three layers of storage
  try{ localStorage.setItem(LS_KEY, code); }catch(e){}
  try{ sessionStorage.setItem(LS_KEY, code); }catch(e){}
  idbSave(LS_KEY, code).catch(()=>{});
  const el=document.getElementById('save-indicator');
  if(el) el.textContent='💾 '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}

async function autoLoad(){
  // 1. Try IndexedDB (most persistent)
  const idbData = await idbLoad(LS_KEY);
  if(idbData && applyLoadData(idbData)){
    console.log('[Farm] Loaded from IndexedDB ✅');
    return true;
  }
  // 2. Try localStorage
  try{
    const lsData = localStorage.getItem(LS_KEY);
    if(lsData && applyLoadData(lsData)){
      console.log('[Farm] Loaded from localStorage ✅');
      idbSave(LS_KEY, lsData).catch(()=>{});
      return true;
    }
  }catch(e){}
  // 3. Try sessionStorage
  try{
    const ssData = sessionStorage.getItem(LS_KEY);
    if(ssData && applyLoadData(ssData)){
      console.log('[Farm] Loaded from sessionStorage ✅');
      autoSave();
      return true;
    }
  }catch(e){}
  return false;
}

function applyLoadData(saved){
  try{
    const bin=atob(saved);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const data=JSON.parse(new TextDecoder().decode(bytes));
    if(!data.horses) return false;
    data.horses.forEach(s=>{
      const h=horses.find(x=>x.id===s.id);
      if(h) Object.assign(h,{stats:{...s.stats},pos:{...s.pos},sick:s.sick||false,sickDays:s.sickDays||0,
        illnessType:s.illnessType||'',recoveryDaysLeft:s.recoveryDaysLeft||0,
        exercising:false,exerciseStart:null,exerciseDuration:0,exerciseType:'',
        resting:false,restStart:null,restDuration:0});
    });
    if(data.helpers) data.helpers.forEach(s=>{const h=helpers.find(x=>x.idx===s.idx);if(h){h.sessions=s.sessions||h.sessions;h.wx=s.wx||h.wx;h.wy=s.wy||h.wy;}});
    if(data.supplies) data.supplies.forEach(s=>{const sup=supplies.find(x=>x.id===s.id);if(sup)sup.stock=s.stock;});
    if(data.log) farmLog=[...data.log];
    if(data.romanceStage) romanceStage=data.romanceStage;
    if(data.romanceProgress) romanceProgress=data.romanceProgress;
    if(data.foal) foal=data.foal;
    if(data.coins!=null) coins=data.coins;
    if(data.meadowMowed!=null) meadowMowed=data.meadowMowed;
    if(data.loanBalance!=null) loanBalance=data.loanBalance;
    if(data.meadowMowedTicks!=null) meadowMowedTicks=data.meadowMowedTicks;
    if(data.courtingTickCount!=null) courtingTickCount=data.courtingTickCount;
    return true;
  }catch(e){ return false; }
}
