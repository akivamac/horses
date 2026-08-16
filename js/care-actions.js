// ================================================================
// CARE ACTIONS
// ================================================================
function feedHorse(horseId,foodType){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  if(h.sick&&h.illnessType){
    const ill=ILLNESS_TYPES.find(x=>x.id===h.illnessType);
    if(ill&&ill.noFood){showToast("⚠️ "+h.name+" "+ill.msg+" — can't eat!",true);return;}
  }
  const foods={hay:{supplyId:'hay',gain:20,label:"🌾 Fed hay"},grain:{supplyId:'grain',gain:30,label:"🌽 Fed grain"},treats:{supplyId:'treats',gain:10,label:"🍎 Gave treats"}};
  const f=foods[foodType]; if(!f) return;
  if(!useSupply(f.supplyId)){showToast("⚠️ Out of "+foodType+"!",true);return;}
  h.stats.hunger=Math.min(100,h.stats.hunger+f.gain);
  horseAction(horseId,foodType==='hay'?'🌾':foodType==='grain'?'🌽':'🍎');
  addLog(f.label+" to "+h.name,'feed'); renderAll(); showToast(f.label+" to "+h.name+"!");
}
function giveWater(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  if(!useSupply('water')){showToast("⚠️ No water! Restock.",true);return;}
  h.stats.thirst=Math.min(100,h.stats.thirst+35);
  horseAction(horseId,'💧');
  addLog("💧 Watered "+h.name,'water'); renderAll(); showToast("💧 "+h.name+" had a drink!");
}
function groomHorse(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  if(!useSupply('brush')){showToast("⚠️ No grooming kits!",true);return;}
  h.stats.grooming=Math.min(100,h.stats.grooming+35);
  horseAction(horseId,'✂️');
  addLog("✂️ Groomed "+h.name,'groom'); renderAll(); showToast("✂️ "+h.name+" has been groomed!");
}
function healthCheck(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  if(!useSupply('meds')){showToast("⚠️ No vet supplies!",true);return;}
  const status=h.sick?"🤒 "+h.name+" is SICK!":"✅ "+h.name+" is healthy!";
  addLog("🩺 Health check: "+h.name+" — "+(h.sick?"SICK":"healthy"),'health');
  showToast("🩺 "+status); renderAll();
}
function treatSick(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h||!h.sick) return;
  if(supplyStock('meds')<2){showToast("⚠️ Need 2 vet supplies!",true);return;}
  useSupply('meds',2);
  h.recoveryDaysLeft=72;
  horseAction(horseId,'💊');
  addLog("💊 Treatment started for "+h.name,'health');
  showToast("💊 "+h.name+" is being treated! Keep rested.");
  renderAll();
}

// ================================================================
// DECAY — realistic per 60s tick
// Thirst: ~1.4hrs to empty, Hunger: ~2.8hrs, others slower
// ================================================================
function runDecayTick(silent=false){
  horses.forEach(h=>{
    h.stats.thirst  =Math.max(0,h.stats.thirst  -1.2);
    h.stats.hunger  =Math.max(0,h.stats.hunger  -0.6);
    h.stats.grooming=Math.max(0,h.stats.grooming-0.25);
    if(!h.exercising) h.stats.exercise=Math.max(0,h.stats.exercise-0.3);
    h.stats.rest    =Math.max(0,h.stats.rest    -0.2);
    if(h.pos.grazing&&!h.sick) h.stats.hunger=Math.min(100,h.stats.hunger+0.5);
    if(h.sick){
      if(h.recoveryDaysLeft>0){
        h.recoveryDaysLeft--;
        h.stats.health=Math.min(100,h.stats.health+1.2);
        if(h.recoveryDaysLeft===0){
          h.sick=false; h.sickDays=0;
          addLog("🌟 "+h.name+" has fully recovered!",'health');
          if(!silent) showToast("🌟 "+h.name+" is fully recovered!");
        }
      } else {
        h.stats.health=Math.max(0,h.stats.health-0.5);
        h.sickDays++;
        if(h.stats.health<=5&&!silent) addLog("🚨 "+h.name+"'s health is critical!",'health');
      }
    }
    if(h.stats.hunger<20||h.stats.thirst<20) h.stats.health=Math.max(0,h.stats.health-0.3);
    if(!h.sick&&h.stats.hunger>30&&h.stats.thirst>30&&h.stats.health<100)
      h.stats.health=Math.min(100,h.stats.health+0.1);
  });

  // Random sickness — ~0.014% per tick
  horses.forEach(h=>{
    if(!h.sick&&Math.random()<0.00014){
      const illness=ILLNESS_TYPES[Math.floor(Math.random()*ILLNESS_TYPES.length)];
      h.sick=true; h.illnessType=illness.id;
      if(illness.noGrazing) h.pos.grazing=false;
      h.stats.health=Math.max(10,h.stats.health-30);
      addLog("🤒 "+h.name+" "+illness.msg+"!","sick");
      if(!silent) showToast("🤒 "+h.name+" "+illness.msg+"!",true);
    }
  });

  // Loan repayment — deduct from coins each tick
  if(loanBalance>0){
    const repay=Math.min(loanBalance,LOAN_REPAY_PER_TICK);
    coins=Math.max(0,coins-repay);
    loanBalance=Math.max(0,loanBalance-repay);
    if(!silent){
      if(loanBalance===0) showToast('✅ Loan fully repaid! Well done! 🎉');
      else if(loanBalance%50===0) showToast('🏦 Loan: -'+repay+' 🪙 — '+loanBalance+' left to repay');
    }
  }

  // Grass grows back after ~60 ticks (1 hour)
  if(meadowMowed){
    meadowMowedTicks++;
    if(meadowMowedTicks>=1440){
      meadowMowed=false;
      meadowMowedTicks=0;
      if(!silent) showToast('🌿 The grass has grown back in the meadow!');
      addLog('🌿 Meadow grass has grown back','system');
    }
  }

  renderSickAlert();
  renderAll();
}
setInterval(()=>runDecayTick(false),60000);

