// ================================================================
// MEADOW RENDER — realistic horse silhouettes at correct depth
// ================================================================
function renderMeadow(){
  renderMeadowBackground();
  const meadow=document.getElementById('meadow-horses');
  if(!meadow) return;
  meadow.innerHTML='';

  // Sort by depth so closer horses appear in front
  const pastureHorses=[...horses.filter(h=>h.pos.location==='pasture')]
    .sort((a,b)=>a.pos.depth-b.pos.depth);

  pastureHorses.forEach(h=>{
    const col=HORSE_COLORS[h.id]||HORSE_COLORS[1];
    // Scale by depth: far=0.5, close=1.0
    const depthFrac=(h.pos.depth-25)/50; // 0..1 (0=close, 1=far)
    const scale=1.05-depthFrac*0.55; // close=big, far=small
    const bottomPct=(20+(1-depthFrac)*35); // close=low on screen, far=high

    const el=document.createElement('div');
    el.className='field-horse'+(h.pos.grazing?' grazing':h.exercising?' exercising-anim':h.brooding?' brooding':'')+(h.id===selectedHorse?' selected':'');
    el.style.cssText=`left:${h.pos.x}%;bottom:${bottomPct}%;transform:scale(${scale});transform-origin:bottom center;`;
    el.dataset.horseid=h.id;
    const nameExtra = h.sick?' 🤒':h.pos.grazing?' 🌿':h.exercising?' 🏃':h.brooding?' 💜':h.inLove?' 💕':'';
    el.innerHTML=`
      ${horseSVG(col.body,col.mane)}
      <div class="horse-name-tag">${h.name}${nameExtra}</div>
      ${h.id===selectedHorse?`<div style="position:absolute;inset:-3px;border:3px solid #D4A800;border-radius:6px;pointer-events:none;"></div>`:''}
    `;
    el.onclick=()=>selectHorse(h.id);
    meadow.appendChild(el);
  });

  // Stable horses shown as icons at the stable
  // Render foal if born
  if(romanceStage==='foal_born'&&foal){
    const foalEl=document.createElement('div');
    const fDepth=foal.depth||55;
    const fDepthFrac=(fDepth-25)/50;
    const fScale=(0.6-fDepthFrac*0.3)*0.55; // foals are small!
    const fBottom=20+(1-fDepthFrac)*35;
    foalEl.className='field-horse foal-horse';
    foalEl.style.cssText=`left:${foal.x||45}%;bottom:${fBottom}%;transform:scale(${fScale});transform-origin:bottom center;`;
    foalEl.innerHTML=`
      ${horseSVG(foal.body,foal.mane)}
      <div class="horse-name-tag">⭐ ${foal.name}</div>
    `;
    meadow.appendChild(foalEl);
  }

  renderStables();
  renderWorkers();
  renderMoveControls();
}

// ================================================================
// STABLE RENDER — realistic center-aisle stalls
// ================================================================
function renderStables(){}


// ================================================================
// ROMANCE STORYLINE FUNCTIONS
// ================================================================
function openRomanceModal(){
  const el=document.getElementById('romance-modal-content');
  const midnight=horses.find(h=>h.id===2);
  const clover=horses.find(h=>h.id===3);
  if(romanceStage==='midnight_brooding'){
    el.innerHTML=`
      <div style="font-size:3rem;margin-bottom:8px;">🐴💜</div>
      <h2 style="font-family:'Playfair Display',serif;color:#4a1a6a;margin-bottom:10px;">Midnight is acting strange...</h2>
      <p style="font-size:.88rem;color:#555;line-height:1.7;margin-bottom:14px;">
        Midnight has wandered off to the corner of the field all by himself. He's standing very still,
        head slightly down, not eating. Something is on his mind... 🌙
      </p>
      <p style="font-size:.85rem;color:#888;font-style:italic;margin-bottom:16px;">Maybe he just needs a friend?</p>
      <button class="btn btn-rose" style="width:100%;font-size:1rem;padding:12px;justify-content:center;" onclick="doMatchmaking()">💕 Lead Clover to Midnight</button>
      <button onclick="closeModal('romance-overlay')" style="width:100%;margin-top:8px;background:none;border:none;color:#aaa;font-size:.82rem;cursor:pointer;font-family:'Nunito',sans-serif;">Maybe later</button>`;
  } else if(romanceStage==='courting'){
    el.innerHTML=`
      <div style="font-size:3rem;margin-bottom:8px;">💕</div>
      <h2 style="font-family:'Playfair Display',serif;color:#c03070;margin-bottom:10px;">Something is blooming! 🌸</h2>
      <p style="font-size:.88rem;color:#555;line-height:1.7;margin-bottom:14px;">
        Midnight and Clover are spending all their time together now.
        Midnight is no longer brooding — he's happier than ever!
        They walk side by side and nuzzle each other. 🥰
      </p>
      <p style="font-size:.85rem;color:var(--rose);font-weight:800;margin-bottom:16px;">💍 Days courting: ${romanceProgress} / 3</p>
      ${romanceProgress>=3?`<button class="btn btn-rose" style="width:100%;font-size:1rem;padding:12px;justify-content:center;" onclick="doWedding()">💒 Celebrate their bond!</button>`
      :`<p style="color:#aaa;font-size:.82rem;font-style:italic;">Come back tomorrow to see how things develop... 🌹</p>`}`;
  } else if(romanceStage==='married'){
    el.innerHTML=`
      <div style="font-size:3rem;margin-bottom:8px;">💒👑</div>
      <h2 style="font-family:'Playfair Display',serif;color:#c03070;margin-bottom:10px;">Midnight & Clover 💕</h2>
      <p style="font-size:.88rem;color:#555;line-height:1.7;margin-bottom:14px;">
        They are bonded for life! Midnight is so happy and Clover glows with joy.
        They are never far apart... 🌟
      </p>
      <p style="font-size:.85rem;color:#888;font-style:italic;margin-bottom:16px;">Clover seems to be eating a little more than usual lately... 🤔</p>
      <button class="btn btn-hay" style="width:100%;font-size:1rem;padding:12px;justify-content:center;" onclick="checkForFoal()">🐣 Check on Clover</button>`;
  } else if(romanceStage==='pregnant'){
    el.innerHTML=`
      <div style="font-size:3rem;margin-bottom:8px;">🤰🐴</div>
      <h2 style="font-family:'Playfair Display',serif;color:#2a8a2a;margin-bottom:10px;">Clover is expecting! 🌟</h2>
      <p style="font-size:.88rem;color:#555;line-height:1.7;margin-bottom:14px;">
        Lily the vet helper has confirmed it — <strong>Clover is pregnant!</strong>
        Midnight hasn't left her side. The whole farm is buzzing with excitement! 🎉
      </p>
      <button class="btn btn-grass" style="width:100%;font-size:1rem;padding:12px;justify-content:center;" onclick="birthFoal()">👶 Welcome the foal!</button>`;
  } else if(romanceStage==='foal_born'&&foal){
    el.innerHTML=`
      <div style="margin:0 auto 8px;width:fit-content;">${horseSVG(foal.body,foal.mane,0.55)}</div>
      <h2 style="font-family:'Playfair Display',serif;color:#c8960a;margin-bottom:8px;">Meet ${foal.name}! 🌟</h2>
      <p style="font-size:.88rem;color:#555;line-height:1.7;margin-bottom:8px;">
        Born ${foal.born}. Black like Midnight, with a tiny white star on her forehead —
        curious and full of energy already! Midnight is the proudest father. 🥹
      </p>
      <button class="btn btn-hay" style="width:100%;padding:10px;justify-content:center;" onclick="closeModal('romance-overlay')">💕 So precious!</button>`;
  }
  document.getElementById('romance-overlay').classList.add('open');
}

function doMatchmaking(){
  const midnight=horses.find(h=>h.id===2);
  const clover=horses.find(h=>h.id===3);
  clover.pos.x=Math.min(88,midnight.pos.x+12);
  clover.pos.depth=midnight.pos.depth;
  clover.pos.location='pasture';
  clover.pos.grazing=false;
  midnight.brooding=false;
  midnight.inLove=true;
  clover.inLove=true;
  romanceStage='courting';
  romanceProgress=1;
  closeModal('romance-overlay');
  setTimeout(()=>floatHearts(midnight),500);
  setTimeout(()=>floatHearts(clover),900);
  addLog('💕 Clover went to keep Midnight company...','system');
  showToast('💕 Something is happening between Midnight and Clover!');
  renderAll();
}

function doWedding(){
  romanceStage='married';
  closeModal('romance-overlay');
  const midnight=horses.find(h=>h.id===2);
  const clover=horses.find(h=>h.id===3);
  [midnight,clover].forEach(h=>{for(let i=0;i<6;i++)setTimeout(()=>floatHearts(h),i*280);});
  addLog('💒 Midnight and Clover are bonded for life! 🎊','system');
  showToast('💒 Midnight & Clover are bonded forever! 🎊');
  renderAll();
}

function checkForFoal(){
  romanceStage='pregnant';
  closeModal('romance-overlay');
  showToast('🤰 Clover is expecting a foal! 🌟');
  addLog('🤰 Lily confirmed it — Clover is pregnant!','system');
  renderAll();
}

function birthFoal(){
  const now=new Date();
  foal={
    name:'Star',
    body:'#111111',
    mane:'#eeeeee',
    born:now.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),
  };
  romanceStage='foal_born';
  const midnight=horses.find(h=>h.id===2);
  const clover=horses.find(h=>h.id===3);
  // Place Star next to her parents
  if(midnight&&clover){
    foal.x=((midnight.pos.x+clover.pos.x)/2)+5;
    foal.depth=(midnight.pos.depth+clover.pos.depth)/2;
  }
  closeModal('romance-overlay');
  addLog('🐣 A foal has been born! Meet Star! 🌟','system');
  showToast('🐣 Welcome to the world, Star! 🌟');
  [midnight,clover].forEach(h=>{for(let i=0;i<8;i++)setTimeout(()=>floatHearts(h),i*200);});
  renderAll();
  setTimeout(()=>openRomanceModal(),2000);
}

function floatHearts(h){
  if(!h||h.pos.location!=='pasture') return;
  const meadow=document.getElementById('meadow-horses');
  if(!meadow) return;
  const depthFrac=(h.pos.depth-25)/50;
  const bottomPct=20+(1-depthFrac)*35;
  const hearts=['💕','💜','❤️','💗','✨','⭐','🌸'];
  const heart=document.createElement('div');
  heart.className='heart-float';
  heart.textContent=hearts[Math.floor(Math.random()*hearts.length)];
  heart.style.cssText=`left:${h.pos.x+5+Math.random()*12}%;bottom:${bottomPct+10}%;`;
  meadow.appendChild(heart);
  setTimeout(()=>heart.remove(),2000);
}

// Courting ticks once per real day (1440 min = 1 decay tick per min × 1440)
let courtingTickCount=0;
setInterval(()=>{
  if(romanceStage==='courting'){
    courtingTickCount++;
    if(courtingTickCount>=1440){
      courtingTickCount=0;
      romanceProgress=Math.min(3,romanceProgress+1);
      if(romanceProgress>=3) showToast('💕 Tap the banner — Midnight & Clover have something special! 💒');
      renderAll();
    }
  }
},60000); // check every real minute

function renderRomanceBanner(){
  const el=document.getElementById('romance-banner');
  if(!el) return;
  if(romanceStage==='none'){el.style.display='none';return;}
  el.style.display='flex';
  const msgs={
    midnight_brooding:{icon:'🌙',text:"Midnight is acting strange... tap to see what's going on",color:'#4a1a6a'},
    courting:         {icon:'💕',text:`Midnight & Clover are getting close! (${romanceProgress}/3 days)`,color:'#c03070'},
    married:          {icon:'💒',text:'Midnight & Clover are bonded! Clover seems... different? 🤔',color:'#c03070'},
    pregnant:         {icon:'🤰',text:'Clover is expecting! A foal is on the way! 🌟',color:'#2a8a2a'},
    foal_born:        {icon:'🐣',text:'Baby Star is here! Tap to see! 🌟',color:'#c8960a'},
  };
  const m=msgs[romanceStage]||msgs.midnight_brooding;
  el.innerHTML=`<span style="font-size:1.8rem;">${m.icon}</span><div><strong style="color:${m.color};font-size:.88rem;">${m.text}</strong><div style="font-size:.72rem;color:#aaa;margin-top:2px;">Tap to open</div></div>`;
}

