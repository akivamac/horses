// ================================================================
// INIT
// ================================================================
// Render immediately so the page isn't blank
if(romanceStage==='midnight_brooding') initMidnightBrooding();
renderAll();
addLog("🌅 Welcome to Clover Hill Farm!","system");

// Then load saved data and re-render
autoLoad().then(loaded => {
  if(loaded){
    if(romanceStage==='midnight_brooding') initMidnightBrooding();
    renderAll();
    addLog("✅ Farm restored from last session","system");
  }
}).catch(e => console.warn('[Farm] Load failed:', e));

// Stick tabs right below header
function fixStickyTabs(){
  const h=document.querySelector('header');
  const t=document.querySelector('.tabs');
  if(h&&t) t.style.top=h.offsetHeight+'px';
}
fixStickyTabs();
window.addEventListener('resize',fixStickyTabs);

// Auto-save every 60 seconds
setInterval(autoSave, 60000);

// Also save when user leaves the page (catches scroll-reload too)
window.addEventListener('beforeunload', autoSave);
window.addEventListener('pagehide', autoSave);
window.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') autoSave(); });
