// ================================================================
// HORSE SVG COLORS — realistic breed colors as SVG silhouettes
// ================================================================
function horseSVG(color, maneColor, size=1){
  const w=150*size, h=100*size;
  const c = color;
  const m = maneColor;
  const cLight = shadeColor(c, 25);
  const cDark  = shadeColor(c, -25);
  const cMid   = shadeColor(c, -10);
  const hoof   = '#1a0f05';

  return `<svg width="${w}" height="${h}" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coat${c.replace('#','')}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cLight}"/>
      <stop offset="35%" stop-color="${c}"/>
      <stop offset="75%" stop-color="${cDark}"/>
      <stop offset="100%" stop-color="${shadeColor(c,-40)}"/>
    </linearGradient>
    <linearGradient id="coatL${c.replace('#','')}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cLight}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${cLight}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="legG${c.replace('#','')}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cMid}"/>
      <stop offset="50%" stop-color="${cDark}"/>
      <stop offset="100%" stop-color="${shadeColor(c,-40)}"/>
    </linearGradient>
    <linearGradient id="maneG${m.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${shadeColor(m,-30)}"/>
      <stop offset="50%" stop-color="${m}"/>
      <stop offset="100%" stop-color="${shadeColor(m,-30)}"/>
    </linearGradient>
    <linearGradient id="hoofG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3a2a1a"/>
      <stop offset="100%" stop-color="#1a0f05"/>
    </linearGradient>
    <radialGradient id="musHL${c.replace('#','')}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${cLight}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${cLight}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eyeG" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#5a3a1a"/>
      <stop offset="60%" stop-color="#1a0a02"/>
      <stop offset="100%" stop-color="#000"/>
    </radialGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="320" cy="352" rx="195" ry="6" fill="#000" opacity="0.18"/>
  <ellipse cx="320" cy="352" rx="160" ry="3" fill="#000" opacity="0.25"/>

  <!-- Far hind leg -->
  <path d="M 425 235 Q 428 255 425 275 Q 422 295 419 315 L 416 340 Q 416 346 421 347 L 432 347 Q 437 346 437 340 L 435 315 Q 433 290 432 268 Q 431 248 432 235 Z" fill="url(#legG${c.replace('#','')})"/>
  <path d="M 416 340 L 437 340 L 438 350 Q 438 354 434 355 L 419 355 Q 415 354 415 350 Z" fill="url(#hoofG)"/>

  <!-- Far front leg -->
  <path d="M 215 230 Q 213 252 211 275 Q 209 298 207 320 L 205 340 Q 205 346 210 347 L 221 347 Q 226 346 226 340 L 226 320 Q 227 295 228 270 Q 229 250 228 230 Z" fill="url(#legG${c.replace('#','')})"/>
  <path d="M 205 340 L 226 340 L 227 350 Q 227 354 223 355 L 209 355 Q 205 354 205 350 Z" fill="url(#hoofG)"/>

  <!-- Main body -->
  <path d="M 175 195 Q 168 168 188 152 Q 215 138 260 134 Q 320 130 380 138 Q 415 144 432 165 Q 442 188 438 218 Q 432 245 408 254 Q 360 263 300 263 Q 235 263 200 252 Q 178 240 173 218 Q 170 205 175 195 Z" fill="url(#coat${c.replace('#','')})"/>

  <!-- Body top highlight -->
  <path d="M 195 152 Q 240 138 300 134 Q 365 134 415 148 Q 425 158 418 168 Q 360 152 300 152 Q 240 152 200 168 Q 188 162 195 152 Z" fill="url(#coatL${c.replace('#','')})"/>

  <!-- Shoulder muscle -->
  <ellipse cx="208" cy="200" rx="32" ry="48" fill="url(#musHL${c.replace('#','')})"/>
  <!-- Hindquarter muscle -->
  <ellipse cx="402" cy="190" rx="38" ry="55" fill="url(#musHL${c.replace('#','')})"/>

  <!-- Neck -->
  <path d="M 188 152 Q 165 145 145 130 Q 122 110 118 88 Q 116 72 124 65 Q 135 60 148 70 Q 168 90 188 115 Q 205 138 210 155 Z" fill="url(#coat${c.replace('#','')})"/>
  <path d="M 188 152 Q 168 148 152 138 Q 138 128 132 115 Q 130 130 145 145 Q 165 158 188 158 Z" fill="${cDark}" opacity="0.5"/>

  <!-- Head -->
  <path d="M 124 65 Q 110 52 102 38 Q 98 25 105 18 Q 116 12 132 18 Q 152 26 168 42 Q 178 55 175 70 Q 170 82 158 85 Q 145 88 135 82 Q 128 75 124 65 Z" fill="url(#coat${c.replace('#','')})"/>
  <path d="M 130 28 Q 145 22 162 32 Q 168 42 162 48 Q 148 38 132 38 Q 124 32 130 28 Z" fill="url(#coatL${c.replace('#','')})"/>

  <!-- Muzzle -->
  <path d="M 102 38 Q 92 38 86 45 Q 82 53 88 60 Q 92 65 100 65 Q 110 64 113 56 Q 115 48 110 42 Q 106 38 102 38 Z" fill="${shadeColor(c,10)}"/>
  <path d="M 90 45 Q 95 42 102 43 Q 108 45 110 50 Q 105 48 98 49 Q 92 50 90 45 Z" fill="${cLight}" opacity="0.5"/>

  <!-- Mouth -->
  <path d="M 90 53 Q 98 56 108 54" stroke="${cDark}" stroke-width="1" fill="none" stroke-linecap="round"/>

  <!-- Nostril -->
  <ellipse cx="93" cy="46" rx="3.5" ry="4.5" fill="${cDark}"/>
  <ellipse cx="93.5" cy="44.5" rx="1" ry="1.2" fill="${c}" opacity="0.7"/>

  <!-- Eye -->
  <ellipse cx="148" cy="40" rx="7" ry="5" fill="${cDark}" opacity="0.6"/>
  <ellipse cx="148" cy="40" rx="4.5" ry="3.2" fill="url(#eyeG)"/>
  <ellipse cx="149.5" cy="38.5" rx="1.4" ry="1" fill="#fff" opacity="0.85"/>
  <path d="M 142 35 Q 148 33 156 36" stroke="${shadeColor(c,-50)}" stroke-width="1.3" fill="none" stroke-linecap="round"/>

  <!-- Ears -->
  <path d="M 158 22 Q 162 8 170 8 Q 175 14 172 28 Q 168 32 162 30 Z" fill="${cDark}"/>
  <path d="M 144 22 Q 146 6 156 8 Q 162 16 158 30 Q 152 32 146 28 Z" fill="url(#coat${c.replace('#','')})"/>

  <!-- Forelock -->
  <path d="M 152 14 Q 145 22 140 32 Q 138 38 142 40 Q 145 35 148 30 Q 154 22 156 16 Z" fill="url(#maneG${m.replace('#','')})"/>

  <!-- Mane -->
  <path d="M 138 30 Q 134 45 138 60 Q 128 70 124 85 Q 122 100 130 112 Q 145 122 158 110 Q 150 95 148 80 Q 162 92 175 110 Q 188 130 200 150 Q 210 160 206 168 Q 195 162 182 148 Q 165 128 150 108 Q 140 92 136 75 Q 134 55 138 30 Z" fill="url(#maneG${m.replace('#','')})"/>
  <path d="M 158 75 Q 168 95 178 115" stroke="${shadeColor(m,-20)}" stroke-width="1.2" fill="none" opacity="0.7"/>
  <path d="M 168 85 Q 178 105 190 125" stroke="${shadeColor(m,-20)}" stroke-width="1" fill="none" opacity="0.6"/>

  <!-- Near front leg -->
  <path d="M 200 215 Q 198 232 200 248 Q 202 258 206 262 L 218 262 Q 222 258 224 248 Q 226 232 224 215 Z" fill="url(#coat${c.replace('#','')})"/>
  <path d="M 199 258 Q 211 263 224 258 Q 226 268 224 274 Q 211 277 200 274 Z" fill="${cDark}"/>
  <path d="M 202 274 Q 203 295 204 318 L 207 332 Q 208 336 212 336 L 218 336 Q 222 336 222 332 L 222 318 Q 222 295 222 274 Z" fill="url(#legG${c.replace('#','')})"/>
  <path d="M 204 348 L 224 348 L 226 358 Q 226 362 222 363 L 207 363 Q 203 362 203 358 Z" fill="url(#hoofG)"/>

  <!-- Near hind leg -->
  <path d="M 380 215 Q 376 240 372 265 Q 369 275 374 280 L 388 280 Q 393 275 392 265 Q 396 240 398 215 Z" fill="url(#coat${c.replace('#','')})"/>
  <path d="M 372 275 Q 382 282 393 275 Q 397 285 393 295 Q 382 298 372 295 Z" fill="${cDark}"/>
  <path d="M 374 295 Q 374 312 374 328 L 376 338 Q 376 342 380 342 L 388 342 Q 392 342 392 338 L 392 328 Q 392 312 392 295 Z" fill="url(#legG${c.replace('#','')})"/>
  <path d="M 374 352 L 393 352 L 395 362 Q 395 366 391 367 L 377 367 Q 373 366 373 362 Z" fill="url(#hoofG)"/>

  <!-- Tail -->
  <path d="M 438 172 Q 460 178 472 200 Q 482 230 478 262 Q 472 295 460 322 Q 452 338 444 342 Q 440 340 442 335 Q 455 312 462 285 Q 468 258 466 232 Q 462 208 450 192 Q 440 182 434 178 Z" fill="url(#maneG${m.replace('#','')})"/>
  <path d="M 442 180 Q 460 200 468 230 Q 472 258 466 285 Q 458 312 448 332" stroke="${shadeColor(m,-20)}" stroke-width="0.8" fill="none" opacity="0.65"/>
  <path d="M 446 185 Q 466 210 472 240 Q 474 268 466 295 Q 456 320 448 338" stroke="${shadeColor(m,-20)}" stroke-width="0.7" fill="none" opacity="0.7"/>
  </svg>`;
}

function shadeColor(hex, pct){
  // Lighten or darken a hex color by percentage
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (num>>16) + pct));
  const g = Math.min(255, Math.max(0, ((num>>8)&0xFF) + pct));
  const b = Math.min(255, Math.max(0, (num&0xFF) + pct));
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}

// Breed-accurate colors — body=coat color, mane=mane/marking color
const HORSE_COLORS = {
  1: {body:'#8B4513', mane:'#F5DEB3', name:'Chestnut'}, // Haflinger — chestnut, flaxen mane
  2: {body:'#111111', mane:'#111111', name:'Black'},     // Friesian — jet black throughout
  3: {body:'#C47A3A', mane:'#FFFFFF', name:'Skewbald'},  // Irish Cob — brown with white
  4: {body:'#C8A050', mane:'#4a3010', name:'Dun'},       // Quarter Horse — sandy dun, dark
  5: {body:'#A0A0A0', mane:'#888888', name:'Grey'},      // Arabian — dapple grey
};

// ================================================================
// TEAM
// ================================================================
const TEAM=[
  {name:"Temima", role:"Farm Owner",   avatar:"👩‍🦰", owner:true},
  {name:"Bea",    role:"Head Groom",   avatar:"👩‍🦱", owner:false},
  {name:"Sam",    role:"Trainer",      avatar:"🧑‍🌾", owner:false},
  {name:"Lily",   role:"Vet Helper",   avatar:"👩‍⚕️", owner:false},
  {name:"Jake",   role:"Stable Hand",  avatar:"👨‍🌾", owner:false},
];

// ================================================================
// ILLNESS TYPES
// ================================================================
const ILLNESS_TYPES = [
  {id:'colic',       msg:'has colic',                   noFood:true,  noGrazing:true,  icon:'🤢'},
  {id:'fever',       msg:'has a fever',                 noFood:false, noGrazing:false, icon:'🌡️'},
  {id:'respiratory', msg:'has a breathing infection',   noFood:false, noGrazing:false, icon:'😤'},
  {id:'lame',        msg:'is lame (sore leg)',           noFood:false, noGrazing:true,  icon:'🦶'},
  {id:'eye',         msg:'has an eye infection',         noFood:false, noGrazing:false, icon:'👁️'},
  {id:'skin',        msg:'has a skin condition',         noFood:false, noGrazing:false, icon:'🩹'},
  {id:'exhaustion',  msg:'is exhausted',                noFood:false, noGrazing:true,  icon:'😮‍💨'},
  {id:'choke',       msg:'is choking on food',          noFood:true,  noGrazing:true,  icon:'😰'},
  {id:'diarrhea',    msg:'has a stomach upset',         noFood:true,  noGrazing:true,  icon:'🤒'},
];

// ================================================================
// HORSES
// ================================================================
const BASE_HORSES=[
  {id:1, name:"Biscuit",  breed:"Haflinger",     age:6,  colorDesc:"Chestnut with flaxen mane",       personality:"Gentle & sweet",             fav:false, funFact:"Haflingers are always chestnut — never any other color!"},
  {id:2, name:"Midnight", breed:"Friesian",      age:9,  colorDesc:"Jet black, no white markings",    personality:"Gentle, affectionate & eager",fav:true,  funFact:"Friesians are almost always pure black!"},
  {id:3, name:"Clover",   breed:"Irish Cob",     age:4,  colorDesc:"Skewbald (brown & white patches)",personality:"Playful & curious",           fav:false, funFact:"Irish Cobs often have thick feathering on their feet!"},
  {id:4, name:"Dusty",    breed:"Quarter Horse", age:11, colorDesc:"Dun (sandy with dorsal stripe)",  personality:"Calm & dependable",           fav:false, funFact:"Quarter Horses are named for winning quarter-mile races!"},
  {id:5, name:"Sparrow",  breed:"Arabian",       age:3,  colorDesc:"Dapple grey",                     personality:"Spirited & intelligent",      fav:false, funFact:"Arabians are one of the world's oldest breeds!"},
];

function defaultStats(){return{hunger:85,thirst:80,grooming:75,exercise:60,rest:90,health:100};}
function defaultPos(i){
  // Spread horses across the field at varying depths
  return{x:10+(i*16), depth:35+(i%3)*15, grazing:false, location:'pasture'};
}

let horses=BASE_HORSES.map((h,i)=>({
  ...h,
  stats:{...defaultStats()},
  pos:{...defaultPos(i)},
  sick:false, sickDays:0, illnessType:'', recoveryDaysLeft:0,
  exercising:false, exerciseStart:null, exerciseDuration:0, exerciseType:'',
  resting:false, restStart:null, restDuration:0,
  brooding:false, // Midnight acting mysterious
  inLove:false,   // after matchmaking
}));

// ================================================================
// ROMANCE / FOAL STORYLINE
// ================================================================
// Stages: 'none' → 'midnight_brooding' → 'matchmaking' → 'courting' → 'married' → 'pregnant' → 'foal_born'
let romanceStage = 'midnight_brooding'; // starts right away — Midnight is already acting weird!
let romanceProgress = 0; // days courting
let foal = null; // {name, body, mane, born} once born

// Move Midnight to a corner, alone, head down
function initMidnightBrooding(){
  const midnight = horses.find(h=>h.id===2);
  if(!midnight) return;
  midnight.brooding = true;
  midnight.pos.x = 5;
  midnight.pos.depth = 70;
  midnight.pos.grazing = false;
  midnight.pos.location = 'pasture';
}


let farmLog=[];
let supplies=[
  {id:'hay',   name:"Hay",          icon:"🌾", stock:20, max:30},
  {id:'grain', name:"Grain",        icon:"🌽", stock:15, max:25},
  {id:'treats',name:"Treats",       icon:"🍎", stock:10, max:20},
  {id:'water', name:"Water",        icon:"💧", stock:18, max:30},
  {id:'brush', name:"Grooming Kit", icon:"🪥", stock:8,  max:15},
  {id:'meds',  name:"Vet Supplies", icon:"💊", stock:5,  max:10},
  {id:'shampoo',name:"Horse Shampoo",icon:"🧴",stock:3,  max:10},
  {id:'shoes', name:"Horseshoes",   icon:"🪄", stock:2,  max:8},
];

// Helpers — all 5 including Temima
let helpers=[
  {idx:0,taskCurrent:null,taskStart:null,taskDuration:0,taskId:null,taskQueue:[],sessions:[{time:'07:00',tasks:[]}],wx:15,wy:55,lastDailyRun:{}},
  {idx:1,taskCurrent:null,taskStart:null,taskDuration:0,taskId:null,taskQueue:[],sessions:[{time:'09:00',tasks:[]}],wx:25,wy:60,lastDailyRun:{}},
  {idx:2,taskCurrent:null,taskStart:null,taskDuration:0,taskId:null,taskQueue:[],sessions:[{time:'11:00',tasks:[]}],wx:35,wy:50,lastDailyRun:{}},
  {idx:3,taskCurrent:null,taskStart:null,taskDuration:0,taskId:null,taskQueue:[],sessions:[{time:'13:00',tasks:[]}],wx:45,wy:65,lastDailyRun:{}},
  {idx:4,taskCurrent:null,taskStart:null,taskDuration:0,taskId:null,taskQueue:[],sessions:[{time:'17:00',tasks:[]}],wx:55,wy:55,lastDailyRun:{}},
];

let selectedHorse=null;
let activeHelperIdx=null;
let lastScheduleCheck='';
let coins=50;
let meadowMowed=false;
let loanBalance=0;
const LOAN_REPAY_PER_TICK=5;
let meadowMowedTicks=0; // counts up after mowing; grows back after 1440 ticks (1 day)

const SHOP_ITEMS=[
  {id:'hay',   name:'Hay Bale',     icon:'🌾', desc:'Feeds one horse fully',  cost:8,  supplyId:'hay',   amt:5},
  {id:'grain', name:'Grain Bag',    icon:'🌽', desc:'Extra nutrition',         cost:10, supplyId:'grain', amt:5},
  {id:'treats',name:'Apple Treats', icon:'🍎', desc:'Horses love these!',      cost:6,  supplyId:'treats',amt:5},
  {id:'water', name:'Water Tank',   icon:'💧', desc:'Fresh water supply',      cost:7,  supplyId:'water', amt:8},
  {id:'brush', name:'Grooming Kit', icon:'🪥', desc:'Keep them shiny',         cost:9,  supplyId:'brush', amt:4},
  {id:'meds',  name:'Vet Supplies', icon:'💊', desc:'For health checks',       cost:15, supplyId:'meds',  amt:3},
  {id:'shampoo',name:'Horse Shampoo',icon:'🧴',desc:'For bathing tasks',       cost:12, supplyId:'shampoo',amt:3},
  {id:'shoes', name:'Horseshoes',   icon:'🪄', desc:'For hoof trimming',       cost:18, supplyId:'shoes', amt:2},
];

// ================================================================
// SUPPLY HELPERS
// ================================================================
function useSupply(id,amt=1){
  const s=supplies.find(x=>x.id===id);
  if(!s||s.stock<amt) return false;
  s.stock=Math.max(0,s.stock-amt); return true;
}
function supplyStock(id){return (supplies.find(x=>x.id===id)||{stock:0}).stock;}

