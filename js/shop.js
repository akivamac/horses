// SUPPLIES
// ================================================================
// ================================================================
// COINS
// ================================================================
function earnCoins(n){
  coins+=n;
  const el=document.getElementById('coin-display');
  if(el) el.textContent=coins;
  // Brief flash
  const badge=document.createElement('div');
  badge.textContent='+'+n+' 🪙';
  badge.style.cssText='position:fixed;bottom:70px;right:20px;background:#c8960a;color:#fff;font-weight:800;font-size:.9rem;padding:6px 14px;border-radius:20px;z-index:999;animation:fadeUp .3s ease both;pointer-events:none;';
  document.body.appendChild(badge);
  setTimeout(()=>badge.remove(),1800);
}

// ================================================================
// SHOP
// ================================================================
function renderShop(){
  const el=document.getElementById('shop-grid');
  const cd=document.getElementById('coin-display');
  if(!el) return;
  if(cd) cd.textContent=coins;

  const loanPanel=`
    <div style="grid-column:1/-1;background:${loanBalance>0?'#fff3cd':'#eafaea'};
      border:2px solid ${loanBalance>0?'#c8960a':'var(--grass)'};
      border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:4px;">
      <span style="font-size:1.5rem;">🏦</span>
      <div style="flex:1;">
        <div style="font-weight:800;color:var(--bark);font-size:.88rem;">
          ${loanBalance>0?'Loan balance: '+loanBalance+' 🪙 (-'+LOAN_REPAY_PER_TICK+'/min)':'No loans — you\'re in the clear! ✅'}
        </div>
        <div style="font-size:.72rem;color:#888;margin-top:2px;">🪙 Coins: <strong>${coins}</strong></div>
      </div>
      ${loanBalance===0?`
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-wood" style="font-size:.78rem;padding:6px 10px;" onclick="takeLoan(20)">Borrow 20 🪙<br><span style="font-size:.65rem;opacity:.7;">repay 24</span></button>
          <button class="btn btn-wood" style="font-size:.78rem;padding:6px 10px;" onclick="takeLoan(50)">Borrow 50 🪙<br><span style="font-size:.65rem;opacity:.7;">repay 60</span></button>
          <button class="btn btn-wood" style="font-size:.78rem;padding:6px 10px;" onclick="takeLoan(100)">Borrow 100 🪙<br><span style="font-size:.65rem;opacity:.7;">repay 120</span></button>
        </div>
      `:`<div style="font-size:.8rem;color:#c8960a;font-weight:800;">Repaying automatically ⏳</div>`}
    </div>`;

  el.innerHTML=loanPanel+SHOP_ITEMS.map(item=>{
    const canAfford=coins>=item.cost;
    const sup=supplies.find(s=>s.id===item.supplyId);
    return `<div class="supply-card ${canAfford?'':'low-stock'}" style="opacity:${canAfford?1:.6};">
      <div class="supply-icon">${item.icon}</div>
      <div class="supply-name">${item.name}</div>
      <div class="supply-stock">${sup?sup.stock+'/'+sup.max+' in stock':''}</div>
      <div style="font-size:.7rem;color:#888;margin-bottom:6px;">${item.desc}</div>
      <div style="font-weight:800;color:#c8960a;margin-bottom:6px;">🪙 ${item.cost} coins</div>
      <button class="supply-btn" style="${canAfford?'':'background:#ccc;cursor:not-allowed;'}"
        onclick="buyItem('${item.id}')" ${canAfford?'':'disabled'}>
        ${canAfford?'🛒 Buy':'Not enough 🪙'}
      </button>
    </div>`;
  }).join('');
}

function buyItem(id){
  const item=SHOP_ITEMS.find(i=>i.id===id);
  if(!item||coins<item.cost) return;
  coins-=item.cost;
  const sup=supplies.find(s=>s.id===item.supplyId);
  if(sup) sup.stock=Math.min(sup.max,sup.stock+item.amt);
  else supplies.push({id:item.supplyId,name:item.name,icon:item.icon,stock:item.amt,max:item.amt*3});
  addLog('🛒 Bought '+item.name+' for '+item.cost+' coins','supply');
  showToast('🛒 Bought '+item.name+'! (+'+item.amt+' '+item.icon+')');
  renderShop();
  renderSupplies();
}

// ================================================================
// MOWING
// ================================================================
function canMow(){
  return horses.every(h=>h.pos.location==='stable');
}

function startMowing(){
  if(!canMow()){showToast('⚠️ All horses must be in the stable first!',true);return;}
  // Step-based mowing task (no horse needed)
  activeTask={defId:'mow',horseId:null,stepIndex:0};
  renderTaskModal();
  document.getElementById('task-overlay').classList.add('open');
}

// Add mow to TASK_DEFS dynamically
TASK_DEFS.mow={name:'🌿 Mow the Meadow',steps:[
  {icon:'🚜',title:'Get the mower',desc:'Wheel out the ride-on mower from the equipment shed.'},
  {icon:'⛽',title:'Fill with fuel',desc:'Check the fuel tank and top it up. Ready to go!'},
  {icon:'🌿',title:'Mow the top section',desc:'Start at the top and work in neat strips. Keep the lines straight!'},
  {icon:'🌾',title:'Mow the middle',desc:'The middle is the thickest — nice slow passes.'},
  {icon:'🌱',title:'Mow the edges',desc:'Trim carefully along the fence. Watch your fingers!'},
  {icon:'🧹',title:'Clear the cuttings',desc:'Rake up the cut grass into a pile. Good exercise!'},
  {icon:'✅',title:'Done!',desc:'The meadow looks beautiful and fresh!',action:'mow_done'},
]};

// ================================================================
