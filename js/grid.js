// HORSES GRID
// ================================================================
function statBar(val,cls,icon,label){
  const pct=Math.round(val);
  const low=pct<20;
  return `<div class="stat-row">
    <div class="stat-icon" title="${label}">${icon}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-bar-bg">
      <div class="stat-bar ${cls}${low?' low':''}" style="width:${pct}%"></div>
    </div>
    <div class="stat-val" style="${low?'color:#e85555;font-weight:800':''}">${pct}%</div>
  </div>`;
}

function renderGrid(){
  const el=document.getElementById('horses-grid');
  if(!el) return;
  el.innerHTML=horses.map((h,i)=>{
    const col=HORSE_COLORS[h.id]||HORSE_COLORS[1];
    const ill=h.sick?ILLNESS_TYPES.find(x=>x.id===h.illnessType):null;
    const noFood=ill&&ill.noFood;
    const cardBg=h.fav?'linear-gradient(135deg,#f9e0e0,#f5d0d0)':h.sick?'linear-gradient(135deg,#fff3cd,#ffe8a0)':'linear-gradient(135deg,#f5e8cc,#ecdbb8)';
    return `
    <div class="horse-card${h.fav?' fav':''}${h.sick?' sick':''}" id="hcard-${h.id}" style="animation-delay:${i*.06}s;cursor:pointer;" onclick="showPage('horses',document.querySelector('.tab:nth-child(2)'));setTimeout(()=>{const el=document.getElementById('hcard-'+${h.id});if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='3px solid var(--hay)';setTimeout(()=>el.style.outline='',1500);}},100);">
      <div class="horse-card-top" style="background:${cardBg}">
        ${horseSVG(col.body,col.mane,0.75)}
        <div>
          <div class="badge-row">
            ${h.fav?'<span class="badge badge-fav" data-tip="Favourite horse">⭐ Fav</span>':''}
            ${h.sick&&h.recoveryDaysLeft>0?`<span class="badge badge-recover" data-tip="Being treated">💊 Healing</span>`:h.sick?`<span class="badge badge-sick" data-tip="${ill?ill.msg:'Sick'}">🤒 Sick</span>`:''}
            ${h.exercising?'<span class="badge badge-exercise" data-tip="Currently exercising">🏃 Running</span>':''}
            ${h.resting?'<span class="badge badge-rest" data-tip="Resting">😴 Resting</span>':''}
            <span class="badge badge-loc" data-tip="${h.pos.location==='pasture'?'Out in the field':'Inside the stable'}">${h.pos.location==='pasture'?(h.pos.grazing?'🌿 Grazing':'🌿 Pasture'):'🏠 Stable'}</span>
          </div>
          <div class="horse-name">${h.name}</div>
          <div class="horse-breed">${h.breed} · Age ${h.age}</div>
          <div style="font-size:.68rem;color:var(--wood);font-style:italic;">${col.name} coat</div>
        </div>
      </div>
      <div class="horse-card-body">
        ${h.exercising?`
          <div class="progress-label" style="color:#4a9e4a;">🏃 ${EX_TYPES[h.exerciseType].label} — ${Math.round(getExerciseProgress(h)*100)}%</div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.round(getExerciseProgress(h)*100)}%;background:linear-gradient(90deg,#7bc47b,#4a9e4a);"></div></div>
        `:''}
        ${h.resting?`
          <div class="progress-label" style="color:#9a5ab5;">😴 Resting — ${Math.round(getRestProgress(h)*100)}%</div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.round(getRestProgress(h)*100)}%;background:linear-gradient(90deg,#c48bd4,#9a5ab5);"></div></div>
        `:''}
        ${statBar(h.stats.hunger,'hunger','🌾','Hunger')}
        ${statBar(h.stats.thirst,'thirst','💧','Thirst')}
        ${statBar(h.stats.grooming,'grooming','✂️','Grooming')}
        ${statBar(h.stats.exercise,'exercise','🏃','Fitness')}
        ${statBar(h.stats.rest,'rest','😴','Rest')}
        ${statBar(h.stats.health,'health','❤️','Health')}

        <div class="horse-actions">
          <div class="action-group">
            <div class="action-group-label">🍽️ Feed & Water</div>
            <div class="action-btns">
              <button class="care-btn feed-hay"   onclick="feedHorse(${h.id},'hay')"    data-tip="Feed hay (${supplyStock('hay')} left)"   ${noFood?'disabled title="Cannot eat while sick"':''}>🌾 Hay (${supplyStock('hay')})</button>
              <button class="care-btn feed-grain" onclick="feedHorse(${h.id},'grain')"  data-tip="Feed grain (${supplyStock('grain')} left)" ${noFood?'disabled':''}>🌽 Grain (${supplyStock('grain')})</button>
              <button class="care-btn feed-treats"onclick="feedHorse(${h.id},'treats')" data-tip="Give treats"                              ${noFood?'disabled':''}>🍎 Treats (${supplyStock('treats')})</button>
              <button class="care-btn feed-water" onclick="giveWater(${h.id})"          data-tip="Give water (${supplyStock('water')} left)">💧 Water (${supplyStock('water')})</button>
            </div>
          </div>
          <div class="action-group">
            <div class="action-group-label">🏃 Exercise</div>
            <div class="action-btns">
              ${h.exercising?`<button class="care-btn exercise-stop" onclick="stopExercise(${h.id})" data-tip="Stop exercise early">⏹ Stop</button>`:`
                <button class="care-btn exercise-start" onclick="startExercise(${h.id},'walk')"   data-tip="15 min walk" ${h.sick||h.resting?'disabled':''}>🚶 Walk</button>
                <button class="care-btn exercise-start" onclick="startExercise(${h.id},'trot')"   data-tip="20 min trot" ${h.sick||h.resting?'disabled':''}>🏇 Trot</button>
                <button class="care-btn exercise-start" onclick="startExercise(${h.id},'canter')" data-tip="30 min canter" ${h.sick||h.resting?'disabled':''}>💨 Canter</button>
              `}
            </div>
          </div>
          <div class="action-group">
            <div class="action-group-label">🛁 Care</div>
            <div class="action-btns">
              <button class="care-btn groom"        onclick="groomHorse(${h.id})"  data-tip="Groom (${supplyStock('brush')} kits left)" ${h.exercising||h.resting?'disabled':''}>✂️ Groom (${supplyStock('brush')})</button>
              ${h.resting
                ?`<button class="care-btn exercise-stop" onclick="stopRest(${h.id})" data-tip="Stop resting early">⏹ Stop Rest</button>`
                :`<button class="care-btn rest-btn" onclick="restHorse(${h.id})" data-tip="30 min rest session" ${h.exercising?'disabled':''}>😴 Rest (30m)</button>`}
              <button class="care-btn health-check" onclick="healthCheck(${h.id})" data-tip="Check health (${supplyStock('meds')} supplies left)">🩺 Check (${supplyStock('meds')})</button>
              ${h.sick&&h.recoveryDaysLeft===0?`<button class="care-btn treat-sick" onclick="treatSick(${h.id})" data-tip="Treat sickness (needs 2 vet supplies)">💊 Treat</button>`:''}
              ${h.sick&&h.recoveryDaysLeft>0?`<span style="font-size:.7rem;color:#4a9e4a;font-weight:800;">💊 Healing... (~${Math.round(h.recoveryDaysLeft)} min left)</span>`:''}
            </div>
          </div>
        </div>
        <div class="horse-mood">${getMood(h)}</div>
        <div style="font-size:.78rem;color:#7a4a00;font-style:italic;margin-top:4px;padding:5px 8px;background:#fff8ee;border-radius:7px;border-left:3px solid var(--hay);">${getPersonalityQuote(h)}</div>
        ${getMoodQuickHint(h)}
        <div class="horse-funfact">💡 ${h.funFact}</div>
      </div>
    </div>`;
  }).join('');
}

function getMood(h){
  if(h.sick){
    const ill=ILLNESS_TYPES.find(x=>x.id===h.illnessType)||ILLNESS_TYPES[0];
    const r=[];
    if(ill.noFood) r.push("cannot eat");
    if(ill.noGrazing) r.push("must not graze");
    const rs=r.length?' — '+r.join(', '):'';
    if(h.recoveryDaysLeft>0) return ill.icon+' '+h.name+' '+ill.msg+rs+'. Healing, keep rested.';
    return ill.icon+' '+h.name+' '+ill.msg+rs+'. Run 🩺 check then 💊 treat.';
  }
  const issues=[];
  if(h.stats.thirst<20)   issues.push("💧 desperately needs water");
  if(h.stats.hunger<20)   issues.push("🌾 desperately needs food");
  if(h.stats.thirst<40&&h.stats.thirst>=20) issues.push("💧 getting thirsty");
  if(h.stats.hunger<40&&h.stats.hunger>=20) issues.push("🌾 getting hungry");
  if(h.stats.grooming<30) issues.push("✂️ needs grooming");
  if(h.stats.exercise<30) issues.push("🏃 needs exercise");
  if(h.stats.rest<30)     issues.push("😴 needs rest");
  if(h.stats.health<60)   issues.push("🩺 health dropping");
  const avg=(h.stats.hunger+h.stats.thirst+h.stats.grooming+h.stats.exercise+h.stats.rest)/5;
  if(issues.length>0) return "😐 Needs: "+issues.slice(0,2).join(", ");
  if(avg>=80) return "😄 Happy and thriving!";
  if(avg>=60) return "🙂 Doing well.";
  return "😊 Comfortable.";
}
function getMoodQuickHint(h){
  if(h.sick) return '';
  const hints=[];
  if(h.stats.thirst<40)   hints.push(`<button class="care-btn feed-water" onclick="giveWater(${h.id})" style="font-size:.7rem;padding:4px 8px;">💧 Water</button>`);
  if(h.stats.hunger<40)   hints.push(`<button class="care-btn feed-hay"   onclick="feedHorse(${h.id},'hay')" style="font-size:.7rem;padding:4px 8px;">🌾 Hay</button>`);
  if(h.stats.grooming<35) hints.push(`<button class="care-btn groom"       onclick="groomHorse(${h.id})" style="font-size:.7rem;padding:4px 8px;">✂️ Groom</button>`);
  if(h.stats.exercise<35&&!h.exercising&&!h.sick) hints.push(`<button class="care-btn exercise-start" onclick="startExercise(${h.id},'walk')" style="font-size:.7rem;padding:4px 8px;">🚶 Walk</button>`);
  if(h.stats.rest<35&&!h.resting&&!h.exercising) hints.push(`<button class="care-btn rest-btn" onclick="restHorse(${h.id})" style="font-size:.7rem;padding:4px 8px;">😴 Rest</button>`);
  if(hints.length===0) return '';
  return `<div class="quick-hints">${hints.join('')}</div>`;
}

// ================================================================
