// ================================================================
// GRAZING WANDER
// ================================================================
function wanderGrazingHorses(){
  let moved=false;
  horses.forEach(h=>{
    if(h.pos.grazing&&h.pos.location==='pasture'){
      h.pos.x=Math.min(90,Math.max(4,parseFloat(h.pos.x)+(Math.random()-.5)*14));
      h.pos.depth=Math.min(75,Math.max(25,parseFloat(h.pos.depth)+(Math.random()-.5)*8));
      moved=true;
    }
  });
  if(moved) renderMeadow();
}
setInterval(wanderGrazingHorses,20000);

// ================================================================
// SEASON + WEATHER SYSTEM
// ================================================================
function getSeason(){
  const m = new Date().getMonth(); // 0=Jan
  if(m>=2&&m<=4)  return 'spring';
  if(m>=5&&m<=7)  return 'summer';
  if(m>=8&&m<=10) return 'autumn';
  return 'winter';
}

// Deterministic daily weather based on date
function getWeather(){
  const d = new Date();
  const seed = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
  const r = ((seed * 1664525 + 1013904223) & 0x7fffffff) / 0x7fffffff;
  const season = getSeason();
  if(season==='winter'){
    if(r<0.4) return 'snow';
    if(r<0.6) return 'overcast';
    return 'sunny';
  }
  if(season==='spring'){
    if(r<0.3) return 'rain';
    if(r<0.5) return 'cloudy';
    return 'sunny';
  }
  if(season==='summer'){
    if(r<0.1) return 'storm';
    if(r<0.25) return 'cloudy';
    return 'sunny';
  }
  // autumn
  if(r<0.3) return 'rain';
  if(r<0.5) return 'cloudy';
  return 'sunny';
}

const SEASON_DATA = {
  spring:{
    sky1:'#6ec6f0',sky2:'#a8dff8',
    hill1:'#5aba3a',hill2:'#4aaa2a',hill3:'#3a9a1a',
    ground1:'#5aba3a',ground2:'#3a9a1a',
    decorations:`
      <div style="position:absolute;left:12%;bottom:18%;z-index:4;font-size:.8rem;animation:sway 3s ease-in-out infinite alternate;animation-delay:.5s;">🌸</div>
      <div style="position:absolute;left:28%;bottom:12%;z-index:4;font-size:.9rem;animation:sway 3s ease-in-out infinite alternate;animation-delay:1s;">🌼</div>
      <div style="position:absolute;left:48%;bottom:10%;z-index:4;font-size:.8rem;animation:sway 3.5s ease-in-out infinite alternate;animation-delay:.2s;">🌷</div>
      <div style="position:absolute;left:65%;bottom:15%;z-index:4;font-size:.9rem;animation:sway 2.8s ease-in-out infinite alternate;animation-delay:1.5s;">🌸</div>
      <div style="position:absolute;left:82%;bottom:11%;z-index:4;font-size:.8rem;animation:sway 3.2s ease-in-out infinite alternate;">🌼</div>
      <div style="position:absolute;left:8%;bottom:9%;z-index:4;font-size:.7rem;opacity:.7;">🌿</div>
      <div style="position:absolute;left:55%;bottom:8%;z-index:4;font-size:.7rem;opacity:.7;">🌱</div>
    `,
    badge:'🌸 Spring', badgeBg:'rgba(220,100,150,.7)'
  },
  summer:{
    sky1:'#4a9fd5',sky2:'#87CEEB',
    hill1:'#3a9a1a',hill2:'#2a8a0a',hill3:'#1a7a00',
    ground1:'#4aaa2a',ground2:'#2a8a0a',
    decorations:`
      <div style="position:absolute;left:12%;bottom:18%;z-index:4;font-size:.8rem;animation:sway 3s ease-in-out infinite alternate;animation-delay:.5s;">🌼</div>
      <div style="position:absolute;left:35%;bottom:10%;z-index:4;font-size:.9rem;animation:sway 3s ease-in-out infinite alternate;animation-delay:1s;">🌻</div>
      <div style="position:absolute;left:60%;bottom:14%;z-index:4;font-size:.8rem;animation:sway 3.5s ease-in-out infinite alternate;">🌼</div>
      <div style="position:absolute;left:80%;bottom:11%;z-index:4;font-size:.9rem;animation:sway 2.8s ease-in-out infinite alternate;animation-delay:.8s;">🌻</div>
      <div style="position:absolute;left:5%;bottom:8%;z-index:4;font-size:.7rem;opacity:.7;">🌿</div>
      <div style="position:absolute;left:45%;bottom:8%;z-index:4;font-size:.7rem;opacity:.7;">🌾</div>
      <div style="position:absolute;left:90%;bottom:9%;z-index:4;font-size:.7rem;opacity:.7;">🌿</div>
    `,
    badge:'☀️ Summer', badgeBg:'rgba(200,150,0,.7)'
  },
  autumn:{
    sky1:'#c0905a',sky2:'#e8b870',
    hill1:'#c87820',hill2:'#a05a10',hill3:'#804008',
    ground1:'#a06020',ground2:'#7a4010',
    decorations:`
      <div style="position:absolute;left:10%;bottom:16%;z-index:4;font-size:.9rem;animation:sway 4s ease-in-out infinite alternate;">🍂</div>
      <div style="position:absolute;left:30%;bottom:10%;z-index:4;font-size:.8rem;animation:sway 3.5s ease-in-out infinite alternate;animation-delay:.5s;">🍁</div>
      <div style="position:absolute;left:55%;bottom:14%;z-index:4;font-size:.9rem;animation:sway 4.2s ease-in-out infinite alternate;animation-delay:1s;">🍂</div>
      <div style="position:absolute;left:75%;bottom:10%;z-index:4;font-size:.8rem;animation:sway 3.8s ease-in-out infinite alternate;">🍁</div>
      <div style="position:absolute;left:88%;bottom:15%;z-index:4;font-size:.9rem;animation:sway 3.5s ease-in-out infinite alternate;animation-delay:.3s;">🍂</div>
    `,
    badge:'🍁 Autumn', badgeBg:'rgba(160,80,20,.7)'
  },
  winter:{
    sky1:'#8ab0d0',sky2:'#c8dff0',
    hill1:'#e8eef5',hill2:'#d8e8f2',hill3:'#c8dced',
    ground1:'#ddeeff',ground2:'#c8ddf0',
    decorations:`
      <div style="position:absolute;left:15%;bottom:18%;z-index:4;font-size:.9rem;opacity:.8;">⛄</div>
      <div style="position:absolute;left:70%;bottom:14%;z-index:4;font-size:.8rem;opacity:.7;">🌲</div>
      <div style="position:absolute;left:85%;bottom:10%;z-index:4;font-size:.7rem;opacity:.6;">❄️</div>
    `,
    badge:'❄️ Winter', badgeBg:'rgba(80,120,180,.7)'
  }
};

const WEATHER_DATA = {
  sunny:{clouds:[], overlay:'', particles:''},
  cloudy:{
    clouds:['☁️','⛅','☁️'],
    overlay:'<div style="position:absolute;inset:0;background:rgba(180,190,200,.12);pointer-events:none;z-index:1;"></div>',
    particles:''
  },
  overcast:{
    clouds:['☁️','☁️','☁️','☁️'],
    overlay:'<div style="position:absolute;inset:0;background:rgba(120,130,140,.25);pointer-events:none;z-index:1;"></div>',
    particles:''
  },
  rain:{
    clouds:['🌧️','☁️','🌧️'],
    overlay:'<div style="position:absolute;inset:0;background:rgba(80,100,120,.18);pointer-events:none;z-index:1;"></div>',
    particles:'rain'
  },
  snow:{
    clouds:['🌨️','☁️','🌨️'],
    overlay:'',
    particles:'snow'
  },
  storm:{
    clouds:['⛈️','🌩️','⛈️'],
    overlay:'<div class="lightning-flash" style="z-index:2;"></div><div style="position:absolute;inset:0;background:rgba(50,60,80,.3);pointer-events:none;z-index:1;"></div>',
    particles:'rain'
  },
};

function buildWeatherParticles(type){
  if(!type) return '';
  let html='';
  if(type==='snow'){
    const flakes=['❄️','❅','❆','✼','*','·'];
    for(let i=0;i<18;i++){
      const x=Math.random()*100;
      const dur=3+Math.random()*4;
      const delay=-Math.random()*dur;
      const f=flakes[Math.floor(Math.random()*flakes.length)];
      const sz=0.5+Math.random()*0.8;
      html+=`<div class="weather-particle" style="left:${x}%;top:-5%;font-size:${sz}rem;color:white;animation:snowfall ${dur}s linear infinite;animation-delay:${delay}s;opacity:.85;">${f}</div>`;
    }
  }
  if(type==='rain'){
    for(let i=0;i<30;i++){
      const x=Math.random()*100;
      const dur=0.6+Math.random()*0.4;
      const delay=-Math.random()*dur;
      const h=8+Math.random()*8;
      html+=`<div class="weather-particle" style="left:${x}%;top:-5%;width:1.5px;height:${h}px;background:rgba(174,214,241,.65);border-radius:1px;animation:rainfall ${dur}s linear infinite;animation-delay:${delay}s;"></div>`;
    }
  }
  if(type==='leaves'||type==='autumn'){
    const leaves=['🍂','🍁'];
    for(let i=0;i<8;i++){
      const x=Math.random()*100;
      const dur=4+Math.random()*4;
      const delay=-Math.random()*dur;
      const l=leaves[Math.floor(Math.random()*leaves.length)];
      html+=`<div class="weather-particle" style="left:${x}%;top:-5%;font-size:.8rem;animation:leaffall ${dur}s linear infinite;animation-delay:${delay}s;">${l}</div>`;
    }
  }
  return html;
}

// Time of day: dawn 5-7, day 7-18, sunset 18-20, night 20-5
function getTimeOfDay(){
  const now=new Date();
  const h=now.getHours();
  const m=now.getMinutes();
  const hm=h+m/60; // fractional hour for precision
  if(hm>=5  &&hm<7)   return 'dawn';
  if(hm>=7  &&hm<17)  return 'day';
  if(hm>=17 &&hm<20)  return 'sunset';
  return 'night';
}

const TOD_DATA={
  dawn:{
    sky:'linear-gradient(180deg,#ff9a6c 0%,#ffcc88 40%,#ffe0b0 100%)',
    overlay:'',
    groundTint:'rgba(255,200,150,0.15)',
    badge:'🌅 Dawn',
    stars:false, moon:false, sun:true, sunStyle:'left:15%;top:20%;font-size:1.8rem;filter:drop-shadow(0 0 8px #ffa040);'
  },
  day:{
    sky:null, // use season sky
    overlay:'',
    groundTint:'',
    badge:null, // use season badge
    stars:false, moon:false, sun:true, sunStyle:'right:12%;top:12%;font-size:1.4rem;opacity:.9;'
  },
  sunset:{
    sky:'linear-gradient(180deg,#1a0a2e 0%,#8b2252 25%,#e05020 55%,#f0a030 80%,#f5c870 100%)',
    overlay:'<div style="position:absolute;inset:0;background:rgba(180,60,20,.12);z-index:1;pointer-events:none;"></div>',
    groundTint:'rgba(200,80,20,0.2)',
    badge:'🌅 Sunset',
    stars:false, moon:false, sun:true, sunStyle:'right:8%;top:55%;font-size:2rem;filter:drop-shadow(0 0 12px #ff6020);'
  },
  night:{
    sky:'linear-gradient(180deg,#020408 0%,#0a1020 40%,#101828 100%)',
    overlay:'',
    groundTint:'rgba(10,15,40,0.55)',
    badge:'🌙 Night',
    stars:true, moon:true, sun:false
  }
};

function buildStars(){
  let s='';
  for(let i=0;i<40;i++){
    const x=Math.random()*100, y=Math.random()*42;
    const sz=0.3+Math.random()*0.5;
    const dur=1.5+Math.random()*2;
    const delay=Math.random()*3;
    s+=`<div style="position:absolute;left:${x}%;top:${y}%;width:${sz*4}px;height:${sz*4}px;
      background:#fff;border-radius:50%;opacity:${0.4+Math.random()*0.6};
      animation:twinkle ${dur}s ease-in-out infinite alternate;animation-delay:${delay}s;z-index:1;pointer-events:none;"></div>`;
  }
  return s;
}

function renderMeadowBackground(){
  const bg = document.getElementById('meadow-bg');
  if(!bg) return;
  const season = getSeason();
  const weather = getWeather();
  const tod = getTimeOfDay();
  const sd = SEASON_DATA[season];
  const wd = WEATHER_DATA[weather] || WEATHER_DATA.sunny;
  const td = TOD_DATA[tod];

  const extraParticles = season==='autumn' ? buildWeatherParticles('leaves') : '';
  const cloudPositions = ['left:8%;top:15%','left:38%;top:22%','left:65%;top:10%','left:85%;top:18%'];

  // At night/sunset clouds are less visible
  const nightClouds = tod==='night'?[]:tod==='sunset'?['☁️','☁️']:null;
  const cloudSrc = nightClouds || wd.clouds || [];
  const cloudHTML = cloudSrc.map((c,i)=>`
    <div style="position:absolute;${cloudPositions[i]||'left:50%;top:15%'};font-size:1.5rem;
      animation:cloudDrift ${18+i*6}s ease-in-out infinite alternate;animation-delay:${i*4}s;
      z-index:2;pointer-events:none;opacity:${tod==='night'?0.3:0.9};">${c}</div>`).join('');

  // Sky: night/dawn/sunset override season
  const sky = td.sky || `linear-gradient(180deg,${sd.sky1} 0%,${sd.sky2} 100%)`;

  // Hill colors: night makes them very dark
  const hill1 = tod==='night'?'#0a1008':(tod==='sunset'?'#5a2010':sd.hill1);
  const hill2 = tod==='night'?'#080c06':(tod==='sunset'?'#4a1808':sd.hill2);
  const hill3 = tod==='night'?'#060a04':(tod==='sunset'?'#3a1006':sd.hill3);
  const ground1 = tod==='night'?'#0a1008':(tod==='sunset'?shadeColor(sd.ground1,-30):sd.ground1);
  const ground2 = tod==='night'?'#060a04':(tod==='sunset'?shadeColor(sd.ground2,-30):sd.ground2);

  // Barn glow at night
  const barnGlow = tod==='night'?`
    <div style="position:absolute;right:5%;bottom:20%;width:60px;height:40px;
      background:radial-gradient(ellipse,rgba(255,200,60,.35) 0%,transparent 70%);
      z-index:3;pointer-events:none;"></div>
    <div style="position:absolute;right:7%;bottom:30%;font-size:.9rem;opacity:.8;z-index:3;">🏚️</div>
  `:'';

  // Mowed grass indicator
  const mowedOverlay = meadowMowed?`
    <div style="position:absolute;bottom:0;left:0;right:0;height:55%;
      background:repeating-linear-gradient(90deg,
        ${tod==='night'?'#0a1a08':'#2a8a10'} 0px,${tod==='night'?'#0a1a08':'#2a8a10'} 18px,
        ${tod==='night'?'#081408':'#1a7a00'} 18px,${tod==='night'?'#081408':'#1a7a00'} 36px);
      z-index:2;opacity:.85;"></div>`:'';

  bg.innerHTML=`
    <div style="position:absolute;top:0;left:0;right:0;height:45%;background:${sky};z-index:0;"></div>
    ${td.stars?buildStars():''}
    ${td.moon?`<div style="position:absolute;right:15%;top:8%;font-size:1.6rem;z-index:2;filter:drop-shadow(0 0 6px rgba(200,220,255,.6));">🌕</div>`:''}
    ${td.sun?`<div style="position:absolute;${td.sunStyle}z-index:2;">☀️</div>`:''}
    ${tod==='night'?'':(wd.overlay||'')}
    ${cloudHTML}
    <div style="position:absolute;top:28%;left:0;right:0;height:80px;background:${hill1};border-radius:50% 50% 0 0 / 60px 60px 0 0;z-index:1;"></div>
    <div style="position:absolute;top:32%;left:-5%;right:40%;height:70px;background:${hill2};border-radius:50% 50% 0 0 / 50px 50px 0 0;z-index:1;opacity:.85;"></div>
    <div style="position:absolute;top:30%;left:50%;right:-5%;height:75px;background:${hill3};border-radius:50% 50% 0 0 / 55px 55px 0 0;z-index:1;opacity:.85;"></div>
    ${mowedOverlay||`<div style="position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(180deg,${ground1} 0%,${ground2} 100%);z-index:2;"></div>`}
    ${tod!=='night'?sd.decorations:''}
    ${td.groundTint?`<div style="position:absolute;bottom:0;left:0;right:0;height:55%;background:${td.groundTint};z-index:3;pointer-events:none;"></div>`:''}
    ${barnGlow}
    <div style="position:absolute;bottom:22%;left:0;right:0;height:18px;display:flex;z-index:5;">
      ${Array(9).fill(0).map((_,i)=>i<8
        ?`<div style="width:3px;background:${tod==='night'?'#4a3010':'#8B6030'};height:28px;margin-top:-5px;flex-shrink:0;"></div><div style="flex:1;height:4px;background:${tod==='night'?'#6a4010':'#c4a060'};margin-top:3px;"></div>`
        :`<div style="width:3px;background:${tod==='night'?'#4a3010':'#8B6030'};height:28px;margin-top:-5px;flex-shrink:0;"></div>`
      ).join('')}
    </div>
    ${tod==='night'?'':buildWeatherParticles(wd.particles)}
    ${extraParticles}
  `;

  const badge=document.getElementById('season-badge');
  if(badge){
    const timeLabel=td.badge||sd.badge;
    const timeColor=tod==='night'?'rgba(20,30,80,.85)':tod==='sunset'?'rgba(120,40,10,.8)':tod==='dawn'?'rgba(160,80,20,.8)':sd.badgeBg;
    const clockStr=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    badge.textContent=timeLabel+(tod==='day'?' · '+sd.badge.split(' ')[1]:'')+' · '+(weather.charAt(0).toUpperCase()+weather.slice(1))+' · '+clockStr;
    badge.style.background=timeColor;
  }
}
// Refresh meadow every 5 min so time-of-day transitions happen
setInterval(()=>renderMeadowBackground(),5*60*1000);
