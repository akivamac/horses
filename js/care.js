// ================================================================
// EXERCISE
// ================================================================
const EX_TYPES={
  walk:  {label:"🚶 Walk",   duration:15,exerciseGain:20,restCost:5},
  trot:  {label:"🏇 Trot",   duration:20,exerciseGain:35,restCost:12},
  canter:{label:"💨 Canter", duration:30,exerciseGain:55,restCost:22},
};

function startExercise(horseId,type){
  const h=horses.find(x=>x.id===horseId);
  if(!h||h.exercising) return;
  if(h.sick){showToast("⚠️ "+h.name+" is sick — rest first!",true);return;}
  if(h.resting){showToast("⚠️ "+h.name+" is resting!",true);return;}
  if(h.pos.grazing){h.pos.grazing=false;}
  const ex=EX_TYPES[type];
  h.exercising=true; h.exerciseStart=Date.now();
  h.exerciseDuration=ex.duration*60*1000; h.exerciseType=type;
  horseAction(horseId,'🏃');
  addLog("🏃 Started "+ex.label+" with "+h.name,'exercise');
  showToast("🏃 "+h.name+" started "+type+"!");
  renderAll();
}
function stopExercise(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h||!h.exercising) return;
  const ex=EX_TYPES[h.exerciseType];
  const frac=Math.min(1,(Date.now()-h.exerciseStart)/h.exerciseDuration);
  h.stats.exercise=Math.min(100,h.stats.exercise+Math.round(ex.exerciseGain*frac));
  h.stats.rest    =Math.max(0, h.stats.rest    -Math.round(ex.restCost*frac));
  h.stats.thirst  =Math.max(0, h.stats.thirst  -Math.round(15*frac));
  h.exercising=false; h.exerciseStart=null;
  addLog("✅ "+h.name+" finished exercise",'exercise');
  showToast("✅ "+h.name+" done exercising!"); renderAll();
}
function getExerciseProgress(h){
  if(!h.exercising) return 0;
  return Math.min(1,(Date.now()-h.exerciseStart)/h.exerciseDuration);
}

// REST
function restHorse(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h) return;
  if(h.exercising){showToast("⚠️ Stop exercise first!",true);return;}
  if(h.resting){showToast("⚠️ "+h.name+" is already resting!",true);return;}
  if(h.pos.grazing) h.pos.grazing=false;
  h.resting=true; h.restStart=Date.now(); h.restDuration=30*60*1000;
  addLog("😴 "+h.name+" is resting (30 min)",'rest');
  showToast("😴 "+h.name+" is resting!"); renderAll();
}
function stopRest(horseId){
  const h=horses.find(x=>x.id===horseId);
  if(!h||!h.resting) return;
  const frac=Math.min(1,(Date.now()-h.restStart)/h.restDuration);
  h.stats.rest=Math.min(100,h.stats.rest+Math.round(30*frac));
  h.resting=false; h.restStart=null;
  addLog("✅ "+h.name+" finished resting",'rest');
  showToast("✅ "+h.name+" done resting!"); renderAll();
}
function getRestProgress(h){
  if(!h.resting) return 0;
  return Math.min(1,(Date.now()-h.restStart)/h.restDuration);
}

// Auto-complete
setInterval(()=>{
  horses.forEach(h=>{
    if(h.exercising&&getExerciseProgress(h)>=1) stopExercise(h.id);
    if(h.resting&&getRestProgress(h)>=1) stopRest(h.id);
  });
},5000);

