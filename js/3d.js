// ================================================================
// 3D FARM VIEW — three.js add-on (Phase 1)
// ================================================================
let three3D=null;          // three.js runtime state
let three3DReady=false;    // lazy init on first visit
let three3DCamTween=null;  // camera fly-to animation
let rideState=null;        // riding a horse: {horseId,keys:{f,b,l,r},joy:{x,y},camDist,camHeight,last}

const W_ICON={sunny:'☀️',cloudy:'⛅',overcast:'☁️',rain:'🌧️',snow:'❄️',storm:'⛈️'};
const SEASON_LABEL={spring:'🌸 Spring',summer:'☀️ Summer',autumn:'🍁 Autumn',winter:'❄️ Winter'};
const TOD_LABEL={dawn:'🌅 Dawn',day:'☀️ Day',sunset:'🌇 Sunset',night:'🌙 Night'};
const TOD3D={ // time-of-day lighting + sky palettes
  dawn:{sky:0xffa060,fog:0xffc890,sun:0xffcc88,int:0.9,amb:.25,hemi:1.0},
  day:{sky:0x87CEEB,fog:0xaad4ee,sun:0xfff2d0,int:1.1,amb:.2,hemi:.9},
  sunset:{sky:0xff9a5a,fog:0xffc088,sun:0xffa060,int:.85,amb:.22,hemi:.9},
  night:{sky:0x0a1a3a,fog:0x16264a,sun:0x7a8ac8,int:.18,amb:.1,hemi:.35},
};
const WX3D={ // weather: how gray the sky goes + sun multiplier
  sunny:{gray:0,mul:1},
  cloudy:{gray:.16,mul:.9},
  overcast:{gray:.35,mul:.7},
  rain:{gray:.42,mul:.55},
  snow:{gray:.32,mul:.75},
  storm:{gray:.52,mul:.4},
};
const SEASON3D={
  spring:{ground:0x4aaa2a,foliage:0x2f8a2a},
  summer:{ground:0x3a9a1a,foliage:0x2a7a1a},
  autumn:{ground:0xa06020,foliage:0xc87820},
  winter:{ground:0xe0edf5,foliage:0xc0d2e2},
};

function init3DView(){
  if(three3DReady){
    set3DRunning(true);
    sync3DEnv();
    sync3DHorses();
    return;
  }
  const canvas=document.getElementById('view3d-canvas');
  if(!canvas||typeof THREE==='undefined'){ showToast('⚠️ 3D view is not available on this device',true); return; }
  try{
    three3DReady=true;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;

    const scene=new THREE.Scene();
    scene.fog=new THREE.Fog(0x87CEEB,60,170);

    const camera=new THREE.PerspectiveCamera(50,1,0.1,500);
    camera.position.set(0,26,44);

    const controls=new THREE.OrbitControls(camera,canvas);
    controls.target.set(0,2,0);
    controls.enableDamping=true;
    controls.dampingFactor=.08;
    controls.maxPolarAngle=Math.PI/2-.05;
    controls.minDistance=6;
    controls.maxDistance=140;

    const hemi=new THREE.HemisphereLight(0xbfd9ff,0x5a9a2a,.85);
    const sun=new THREE.DirectionalLight(0xfff2d0,1.1);
    sun.position.set(30,45,25);
    sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);
    sun.shadow.camera.left=-45;sun.shadow.camera.right=45;
    sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;
    sun.shadow.camera.far=120;
    const ambient=new THREE.AmbientLight(0xffffff,.2);
    scene.add(hemi,sun,ambient);

    three3D={renderer,scene,camera,controls,hemi,sun,ambient,
      horses:{},horseMeshes:[],meadowMat:null,treeMats:[],lastEnv:'',lastLegend:'',raf:0,running:false};

    // Tap a 3D horse to select it (drag still rotates the camera)
    const raycaster=new THREE.Raycaster();
    const pointer=new THREE.Vector2();
    let dragStart=null;
    canvas.addEventListener('pointerdown',e=>{dragStart=[e.clientX,e.clientY];});
    canvas.addEventListener('pointerup',e=>{
      if(rideState) return;
      if(!dragStart) return;
      const moved=Math.hypot(e.clientX-dragStart[0],e.clientY-dragStart[1]);
      dragStart=null;
      if(moved>8) return;
      const rect=canvas.getBoundingClientRect();
      pointer.x=((e.clientX-rect.left)/rect.width)*2-1;
      pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(pointer,camera);
      const hits=raycaster.intersectObjects(three3D.horseMeshes,false);
      if(hits.length){
        let o=hits[0].object;
        while(o&&o.userData.horseId===undefined)o=o.parent;
        if(o&&o.userData.horseId!=null){ selectHorse(o.userData.horseId); focus3DSelected(); }
      }
    });

    build3DWorld();
    sync3DEnv();
    sync3DHorses();
    initRideJoystick();
    resize3D();
    window.addEventListener('resize',resize3D);
    set3DRunning(true);
    showToast('🎥 Welcome to the 3D farm!');
  }catch(err){
    three3DReady=false;
    console.warn('[3D] init failed:',err);
    showToast('⚠️ Could not start 3D view',true);
  }
}

function set3DRunning(on){
  if(!three3D) return;
  if(!on&&rideState) stopRide();
  if(on&&!three3D.running){ three3D.running=true; loop3D(); }
  else if(!on&&three3D.running){ three3D.running=false; cancelAnimationFrame(three3D.raf); }
}

function resize3D(){
  if(!three3D) return;
  const canvas=document.getElementById('view3d-canvas');
  const wrap=canvas.closest('.view3d-stage');
  const w=wrap.clientWidth||canvas.clientWidth;
  const h=canvas.clientHeight;
  three3D.camera.aspect=w/h;
  three3D.camera.updateProjectionMatrix();
  three3D.renderer.setSize(w,h,false);
}

function loop3D(){
  if(!three3D||!three3D.running) return;
  three3D.raf=requestAnimationFrame(loop3D);
  const t=performance.now();
  if(rideState){
    updateRide(t);
  } else {
    if(three3DCamTween){
      const k=Math.min(1,(t-three3DCamTween.t0)/three3DCamTween.dur);
      const e=1-Math.pow(1-k,3);
      three3D.camera.position.lerpVectors(three3DCamTween.fromP,three3DCamTween.toP,e);
      three3D.controls.target.lerpVectors(three3DCamTween.fromT,three3DCamTween.toT,e);
      three3D.controls.update();
      if(k>=1) three3DCamTween=null;
    }
    three3D.controls.update();
  }
  sync3DHorses();
  three3D.renderer.render(three3D.scene,three3D.camera);
}

// ---------------------------------------------------------------
// WORLD BUILDING
// ---------------------------------------------------------------
function build3DWorld(){
  const S=three3D.scene;
  const meadowMat=new THREE.MeshStandardMaterial({color:0x4aaa2a});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),meadowMat);
  ground.rotation.x=-Math.PI/2;
  ground.receiveShadow=true;
  three3D.meadowMat=meadowMat;
  S.add(ground);

  // Fence around the pasture (matches the 2D meadow bounds)
  const postMat=new THREE.MeshStandardMaterial({color:0x8B6030});
  const railMat=new THREE.MeshStandardMaterial({color:0xc4a060});
  const fence=new THREE.Group();
  const hw=33,hz=18;
  const post=(x,z)=>{
    const p=new THREE.Mesh(new THREE.BoxGeometry(.25,2.2,.25),postMat);
    p.position.set(x,1.1,z);p.castShadow=true;fence.add(p);
  };
  for(let x=-hw;x<=hw;x+=3.2)post(x,-hz);
  for(let x=-hw;x<=hw;x+=3.2)post(x,hz);
  for(let z=-hz;z<=hz;z+=3.2)post(-hw,z);
  for(let z=-hz;z<=hz;z+=3.2)post(hw,z);
  const rail=(len,x,z,y,alongX)=>{
    const r=new THREE.Mesh(new THREE.BoxGeometry(alongX?len:.12,.14,alongX?.12:len),railMat);
    r.position.set(x,y,z);r.castShadow=true;fence.add(r);
  };
  for(const y of [.55,1.15]){
    rail(hw*2,0,-hz,y,true);rail(hw*2,0,hz,y,true);
    rail(hz*2,-hw,0,y,false);rail(hz*2,hw,0,y,false);
  }
  S.add(fence);

  // Stable / barn at the far side of the field
  const barn=buildBarn();
  barn.position.set(-27,0,-15);
  S.add(barn);

  // Trees scattered around the outside of the field
  let seed=42;
  const rnd=()=>{seed=(seed*1664525+1013904223)&0x7fffffff;return seed/0x7fffffff;};
  for(let i=0;i<30;i++){
    let x,z;
    if(i%2===0){ x=rnd()*160-80; z=(rnd()<.5)?(rnd()*22+21):(rnd()*22-43); }
    else { z=rnd()*160-80; x=(rnd()<.5)?(rnd()*22+35):(rnd()*22-58); }
    if(Math.abs(x)<hw+3&&Math.abs(z)<hz+3) continue;
    const tree=buildTree();
    tree.position.set(x,0,z);
    tree.scale.setScalar(.7+rnd()*1.1);
    S.add(tree);
  }
}

function buildBarn(){
  const g=new THREE.Group();
  const wall=new THREE.MeshStandardMaterial({color:0x8B4513});
  const roofM=new THREE.MeshStandardMaterial({color:0xa03020});
  const trim=new THREE.MeshStandardMaterial({color:0xf5e8cc});
  const body=new THREE.Mesh(new THREE.BoxGeometry(7,3.4,5),wall);
  body.position.y=1.7;body.castShadow=true;
  const roofA=new THREE.Mesh(new THREE.BoxGeometry(3.8,.35,5.7),roofM);
  roofA.position.set(-1.65,3.75,0);roofA.rotation.z=.62;roofA.castShadow=true;
  const roofB=roofA.clone();roofB.position.x=1.65;roofB.rotation.z=-.62;
  const door=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.2,.15),trim);
  door.position.set(0,1.1,2.61);
  g.add(body,roofA,roofB,door);
  return g;
}

function buildTree(){
  const trunkM=new THREE.MeshStandardMaterial({color:0x6b4423});
  const folM=new THREE.MeshStandardMaterial({color:0x2f8a2a});
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,2.2,6),trunkM);
  trunk.position.y=1.1;trunk.castShadow=true;
  const fol=new THREE.Mesh(new THREE.SphereGeometry(1.3+Math.random()*.5,8,7),folM);
  fol.position.y=3.1;fol.castShadow=true;
  const g=new THREE.Group();
  g.add(trunk,fol);
  three3D.treeMats.push(folM);
  return g;
}

function roundRectPath(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}

function makeLabel3D(text){
  const c=document.createElement('canvas');
  c.width=256;c.height=64;
  const ctx=c.getContext('2d');
  ctx.fillStyle='rgba(42,16,0,.75)';
  roundRectPath(ctx,8,10,240,44,20);ctx.fill();
  ctx.font='800 30px Nunito, sans-serif';
  ctx.fillStyle='#FDF6E3';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,128,32);
  const tex=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.scale.set(4.6,1.15,1);
  return sp;
}

function svgToShape(d){
  // Tiny SVG path parser (M/L/Q/Z only) -> THREE.Shape
  const shape=new THREE.Shape();
  const tokens=d.match(/[MLQZ]|[-\d.e]+/g);
  let i=0;
  const px=()=>parseFloat(tokens[i++]);
  let x=0,y=0;
  while(i<tokens.length){
    const cmd=tokens[i++];
    if(cmd==='M'){ x=px();y=px(); shape.moveTo(x,y); }
    else if(cmd==='L'){ x=px();y=px(); shape.lineTo(x,y); }
    else if(cmd==='Q'){ const cx=px(),cy=px(); x=px();y=px(); shape.quadraticCurveTo(cx,cy,x,y); }
    else if(cmd==='Z'){ shape.closePath(); }
  }
  return shape;
}

function makeGradTex(stops,vertical){
  // Vertical/horizontal gradient canvas texture (mirrors the SVG gradients)
  const c=document.createElement('canvas');c.width=256;c.height=256;
  const ctx=c.getContext('2d');
  const g=vertical?ctx.createLinearGradient(0,0,0,256):ctx.createLinearGradient(0,0,256,0);
  for(const s of stops)g.addColorStop(s[0],s[1]);
  ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
  const tex=new THREE.CanvasTexture(c);
  tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
  return tex;
}

const HORSE_SVG=3.6/361; // world units per SVG unit — silhouette ~3.6 tall
const HORSE_CX=280,HORSE_GR=367;

function horseSilhouette(d,depth,z,mat){
  // Extrude an SVG profile path into a 3D slice, UVs normalized over its bbox
  const shape=svgToShape(d);
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});
  const uv=geo.attributes.uv,pos=geo.attributes.position;
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i);
    if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
  }
  for(let i=0;i<uv.count;i++)uv.setXY(i,(maxX>minX?(pos.getX(i)-minX)/(maxX-minX):0),(maxY>minY?(pos.getY(i)-minY)/(maxY-minY):0));
  uv.needsUpdate=true;
  for(let i=0;i<pos.count;i++){
    // mirror X so the head (SVG left) faces +X, ground the hooves at y=0
    pos.setXYZ(i,-(pos.getX(i)-HORSE_CX)*HORSE_SVG,(HORSE_GR-pos.getY(i))*HORSE_SVG,pos.getZ(i)*HORSE_SVG);
  }
  pos.needsUpdate=true;
  geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,mat);
  // ExtrudeGeometry goes z:0->depth, so center the slice on `z`
  m.position.z=z-(depth/2)*HORSE_SVG;
  m.castShadow=true;
  return m;
}

function buildHorse3D(body,mane,name){
  // Layers reproduce the 2D SVG art: body, hinged head+neck, near/far legs,
  // mane + forelock + tail in the mane gradient, ears and muzzle.
  const coatStops=[[0,shadeColor(body,25)],[.35,body],[.75,shadeColor(body,-25)],[1,shadeColor(body,-40)]];
  const coatM=new THREE.MeshStandardMaterial({map:makeGradTex(coatStops,true)});
  const legM=new THREE.MeshStandardMaterial({map:makeGradTex([[0,shadeColor(body,-10)],[.5,shadeColor(body,-25)],[1,shadeColor(body,-40)]],true)});
  const hoofM=new THREE.MeshStandardMaterial({map:makeGradTex([[0,'#3a2a1a'],[1,'#1a0f05']],true)});
  const maneM=new THREE.MeshStandardMaterial({map:makeGradTex([[0,shadeColor(mane,-30)],[.5,mane],[1,shadeColor(mane,-30)]],false)});
  const earM=new THREE.MeshStandardMaterial({color:new THREE.Color(shadeColor(body,-25))});
  const muzzleM=new THREE.MeshStandardMaterial({color:new THREE.Color(shadeColor(body,10))});

  const BODY='M 175 195 Q 168 168 188 152 Q 215 138 260 134 Q 320 130 380 138 Q 415 144 432 165 Q 442 188 438 218 Q 432 245 408 254 Q 360 263 300 263 Q 235 263 200 252 Q 178 240 173 218 Q 170 205 175 195 Z';
  const HEADNECK='M 188 152 Q 165 145 145 130 Q 122 110 118 88 Q 116 72 124 65 Q 110 52 102 38 Q 98 25 105 18 Q 116 12 132 18 Q 152 26 168 42 Q 178 55 175 70 Q 170 82 158 85 Q 145 88 135 82 Q 128 75 124 65 Q 135 60 148 70 Q 168 90 188 115 Q 205 138 210 155 Z';
  const MUZZLE='M 102 38 Q 92 38 86 45 Q 82 53 88 60 Q 92 65 100 65 Q 110 64 113 56 Q 115 48 110 42 Q 106 38 102 38 Z';
  const NF_THIGH='M 200 215 Q 198 232 200 248 Q 202 258 206 262 L 218 262 Q 222 258 224 248 Q 226 232 224 215 Z';
  const NF_LOW='M 202 274 Q 203 295 204 318 L 207 332 Q 208 336 212 336 L 218 336 Q 222 336 222 332 L 222 318 Q 222 295 222 274 Z';
  const NF_HOOF='M 204 348 L 224 348 L 226 358 Q 226 362 222 363 L 207 363 Q 203 362 203 358 Z';
  const NH_THIGH='M 380 215 Q 376 240 372 265 Q 369 275 374 280 L 388 280 Q 393 275 392 265 Q 396 240 398 215 Z';
  const NH_LOW='M 374 295 Q 374 312 374 328 L 376 338 Q 376 342 380 342 L 388 342 Q 392 342 392 338 L 392 328 Q 392 312 392 295 Z';
  const NH_HOOF='M 374 352 L 393 352 L 395 362 Q 395 366 391 367 L 377 367 Q 373 366 373 362 Z';
  const FF_LEG='M 215 230 Q 213 252 211 275 Q 209 298 207 320 L 205 340 Q 205 346 210 347 L 221 347 Q 226 346 226 340 L 226 320 Q 227 295 228 270 Q 229 250 228 230 Z';
  const FF_HOOF='M 205 340 L 226 340 L 227 350 Q 227 354 223 355 L 209 355 Q 205 354 205 350 Z';
  const FH_LEG='M 425 235 Q 428 255 425 275 Q 422 295 419 315 L 416 340 Q 416 346 421 347 L 432 347 Q 437 346 437 340 L 435 315 Q 433 290 432 268 Q 431 248 432 235 Z';
  const FH_HOOF='M 416 340 L 437 340 L 438 350 Q 438 354 434 355 L 419 355 Q 415 354 415 350 Z';
  const MANE='M 138 30 Q 134 45 138 60 Q 128 70 124 85 Q 122 100 130 112 Q 145 122 158 110 Q 150 95 148 80 Q 162 92 175 110 Q 188 130 200 150 Q 210 160 206 168 Q 195 162 182 148 Q 165 128 150 108 Q 140 92 136 75 Q 134 55 138 30 Z';
  const TAIL='M 438 172 Q 460 178 472 200 Q 482 230 478 262 Q 472 295 460 322 Q 452 338 444 342 Q 440 340 442 335 Q 455 312 462 285 Q 468 258 466 232 Q 462 208 450 192 Q 440 182 434 178 Z';
  const FORELOCK='M 152 14 Q 145 22 140 32 Q 138 38 142 40 Q 145 35 148 30 Q 154 22 156 16 Z';
  const EAR_NEAR='M 144 22 Q 146 6 156 8 Q 162 16 158 30 Q 152 32 146 28 Z';
  const EAR_FAR='M 158 22 Q 162 8 170 8 Q 175 14 172 28 Q 168 32 162 30 Z';

  const g=new THREE.Group();
  const parts={};

  g.add(horseSilhouette(BODY,80,0,coatM));

  // near legs
  g.add(horseSilhouette(NF_THIGH,22,.44,coatM));
  g.add(horseSilhouette(NF_LOW,22,.44,legM));
  g.add(horseSilhouette(NF_HOOF,22,.44,hoofM));
  g.add(horseSilhouette(NH_THIGH,22,.44,coatM));
  g.add(horseSilhouette(NH_LOW,22,.44,legM));
  g.add(horseSilhouette(NH_HOOF,22,.44,hoofM));
  // far legs
  g.add(horseSilhouette(FF_LEG,22,-.44,legM));
  g.add(horseSilhouette(FF_HOOF,22,-.44,hoofM));
  g.add(horseSilhouette(FH_LEG,22,-.44,legM));
  g.add(horseSilhouette(FH_HOOF,22,-.44,hoofM));
  // tail — near side over the rump, like the SVG art
  g.add(horseSilhouette(TAIL,24,.46,maneM));

  // head + neck hinged at the neck base so grazing can lower the head
  const hx=-(200-HORSE_CX)*HORSE_SVG, hy=(HORSE_GR-153)*HORSE_SVG;
  const hn=new THREE.Group();
  hn.position.set(hx,hy,0);
  const off=m=>{ m.position.set(m.position.x-hx,m.position.y-hy,m.position.z); return m; };
  hn.add(off(horseSilhouette(HEADNECK,55,0,coatM)));
  hn.add(off(horseSilhouette(MUZZLE,14,.36,muzzleM)));
  hn.add(off(horseSilhouette(FORELOCK,14,.36,maneM)));
  hn.add(off(horseSilhouette(EAR_NEAR,18,.34,coatM)));
  hn.add(off(horseSilhouette(EAR_FAR,18,.34,earM)));
  // mane follows the neck so it stays attached while grazing
  hn.add(off(horseSilhouette(MANE,24,.46,maneM)));
  g.add(hn);
  parts.headNeck=hn;

  const label=makeLabel3D(name);
  label.position.set(0,4.05,0);
  g.add(label);
  return{group:g,parts};
}

// ---------------------------------------------------------------
// SYNC — keep 3D in lockstep with the 2D game state
// ---------------------------------------------------------------
function sync3DHorses(){
  if(!three3D) return;
  const t=performance.now()/1000;
  horses.forEach(h=>{
    let h3=three3D.horses[h.id];
    if(!h3){
      const col=HORSE_COLORS[h.id]||HORSE_COLORS[1];
      const built=buildHorse3D(col.body,col.mane,h.name);
      built.group.userData.horseId=h.id;
      h3={id:h.id,group:built.group,parts:built.parts,facing:Math.PI/2};
      three3D.horses[h.id]=h3;
      three3D.scene.add(h3.group);
      built.group.traverse(o=>{ if(o.isMesh) three3D.horseMeshes.push(o); });
    }
    const g=h3.group;
    let tx,tz;
    if(h.pos.location==='pasture'){
      tx=(h.pos.x-50)*0.62;
      tz=(50-h.pos.depth)*0.62;
      const dx3=tx-g.position.x,dz3=tz-g.position.z;
      if(!rideState&&Math.hypot(dx3,dz3)>.02) h3.facing=Math.atan2(-dz3,dx3);
      const grazing=h.pos.grazing;
      const targetNeck=grazing?-0.62:h.exercising?0.15:0;
      h3.parts.headNeck.rotation.z+=(targetNeck-h3.parts.headNeck.rotation.z)*.2;
      g.position.x+=(tx-g.position.x)*.15;
      g.position.z+=(tz-g.position.z)*.15;
    } else {
      tx=-25.5+(h.id-1)*1.7;
      tz=-10.5;
      h3.facing=-Math.PI/2;
      h3.parts.headNeck.rotation.z+=(0-h3.parts.headNeck.rotation.z)*.2;
      g.position.x+=(tx-g.position.x)*.15;
      g.position.z+=(tz-g.position.z)*.15;
    }
    let dy=h3.facing-g.rotation.y;
    while(dy>Math.PI)dy-=Math.PI*2;
    while(dy<-Math.PI)dy+=Math.PI*2;
    g.rotation.y+=dy*.15;
    g.position.y=Math.abs(Math.sin(t*1.5+h.id))*.06;
  });
  render3DLegend();
}

function render3DLegend(){
  if(!three3D) return;
  const html=horses.map(h=>{
    const col=HORSE_COLORS[h.id]||HORSE_COLORS[1];
    const loc=h.pos.location==='pasture'?(h.pos.grazing?'🌿':'🌍'):'🏠';
    return `<span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${col.body};margin-right:4px;vertical-align:middle;"></span>${h.name} ${loc}</span>`;
  }).join('');
  if(html!==three3D.lastLegend){
    three3D.lastLegend=html;
    const el=document.getElementById('view3d-legend');
    if(el) el.innerHTML=html;
  }
  const st=document.getElementById('view3d-status');
  if(st) st.textContent=W_ICON[getWeather()]+' '+SEASON_LABEL[getSeason()]+' · '+getWeather()+' · '+TOD_LABEL[getTimeOfDay()];
}

function sync3DEnv(){
  if(!three3D) return;
  const season=getSeason(),weather=getWeather(),tod=getTimeOfDay();
  const key=season+weather+tod;
  if(key===three3D.lastEnv) return;
  three3D.lastEnv=key;

  const base=TOD3D[tod]||TOD3D.day;
  const wx=WX3D[weather]||WX3D.sunny;
  const se=SEASON3D[season]||SEASON3D.spring;

  const sky=new THREE.Color(base.sky).lerp(new THREE.Color(0x8a97a8),wx.gray);
  const fog=new THREE.Color(base.fog).lerp(new THREE.Color(0x9aa6b4),wx.gray);
  const sunC=new THREE.Color(base.sun).lerp(new THREE.Color(0xcccccc),wx.gray);

  three3D.scene.background=sky;
  three3D.scene.fog.color.copy(fog);
  three3D.sun.color.copy(sunC);
  three3D.sun.intensity=base.int*wx.mul;
  three3D.hemi.intensity=base.hemi;
  three3D.ambient.intensity=base.amb;
  if(three3D.meadowMat) three3D.meadowMat.color.set(se.ground);
  three3D.treeMats.forEach(m=>m.color.set(se.foliage));
}

// ---------------------------------------------------------------
// CAMERA PRESETS
// ---------------------------------------------------------------
function set3DCamera(mode){
  if(!three3D) return;
  const targets={
    overview:{pos:[0,30,48],tgt:[0,2,0]},
    herd:{pos:[0,9,25],tgt:[0,1.5,0]},
    top:{pos:[0,62,.5],tgt:[0,0,0]},
  };
  const t=targets[mode];
  if(!t) return;
  three3DCamTween={
    fromP:three3D.camera.position.clone(),
    fromT:three3D.controls.target.clone(),
    toP:new THREE.Vector3(...t.pos),
    toT:new THREE.Vector3(...t.tgt),
    t0:performance.now(),dur:900
  };
}

function focus3DSelected(){
  if(!three3D) return;
  if(selectedHorse==null){ showToast('Tap a horse in the meadow or 3D view first',true); return; }
  const h=horses.find(x=>x.id===selectedHorse);
  if(!h) return;
  const tx=(h.pos.x-50)*0.62, tz=(50-h.pos.depth)*0.62;
  three3DCamTween={
    fromP:three3D.camera.position.clone(),
    fromT:three3D.controls.target.clone(),
    toP:new THREE.Vector3(tx+6,5,tz+9),
    toT:new THREE.Vector3(tx,2.2,tz),
    t0:performance.now(),dur:900
  };
}

// ---------------------------------------------------------------
// RIDE MODE (Phase 2)
// ---------------------------------------------------------------
function toggleRide(){
  if(!three3D){ showToast('Open the 3D Farm view first',true); return; }
  if(rideState){ stopRide(); return; }
  if(selectedHorse==null){ showToast('Tap a horse to select it, then ride 🐎',true); return; }
  const h=horses.find(x=>x.id===selectedHorse);
  if(!h) return;
  if(h.pos.location!=='pasture'){ showToast(h.name+' is in the stable — move them to pasture first',true); return; }
  startRide(h);
}

function startRide(h){
  const hud=document.getElementById('view3d-hud');
  const bar=document.getElementById('ride-bar');
  const nameEl=document.getElementById('ride-name');
  const btn=document.getElementById('ride-btn');
  if(hud) hud.classList.add('riding');
  if(bar) bar.style.display='flex';
  if(nameEl) nameEl.textContent='🏇 Riding '+h.name;
  if(btn) btn.textContent='⏹ Stop';
  h.pos.grazing=false;
  three3DCamTween=null;
  three3D.controls.enabled=false;
  rideState={horseId:h.id,keys:{f:0,b:0,l:0,r:0},joy:{x:0,y:0},camDist:12,camHeight:6,last:performance.now()};
  showToast('Riding '+h.name+'! 🕹 Joystick or W/A/S/D');
}

function stopRide(){
  if(!rideState) return;
  const h3=three3D&&three3D.horses[rideState.horseId];
  rideState=null;
  const hud=document.getElementById('view3d-hud');
  const bar=document.getElementById('ride-bar');
  const btn=document.getElementById('ride-btn');
  if(hud) hud.classList.remove('riding');
  if(bar) bar.style.display='none';
  if(btn) btn.textContent='🏇 Ride';
  if(three3D){
    three3D.controls.enabled=true;
    if(h3){ three3D.controls.target.set(h3.group.position.x,2,h3.group.position.z); }
  }
  showToast('Riding ended — 🎯 hop off anytime');
}

function updateRide(t){
  const dt=Math.min(.05,((t-(rideState.last||t))/1000)||0);
  rideState.last=t;
  const h=horses.find(x=>x.id===rideState.horseId);
  const h3=three3D.horses[rideState.horseId];
  if(!h||!h3||h.pos.location!=='pasture'){ stopRide(); return; }

  let f=0,turn=0;
  if(rideState.keys.f)f+=1;
  if(rideState.keys.b)f-=1;
  if(rideState.keys.r)turn+=1;
  if(rideState.keys.l)turn-=1;
  f+=rideState.joy.y;
  turn+=rideState.joy.x;
  f=Math.max(-1,Math.min(1,f));
  turn=Math.max(-1,Math.min(1,turn));

  const SPEED=11,TURNSPEED=2.4;
  if(turn) h3.facing+=turn*TURNSPEED*dt;

  h.pos.grazing=false;
  if(f!==0){
    const fx=Math.cos(h3.facing),fz=-Math.sin(h3.facing);
    const wdx=fx*f*SPEED*dt, wdz=fz*f*SPEED*dt;
    h.pos.x=Math.max(4,Math.min(88,parseFloat(h.pos.x)+wdx/0.62));
    h.pos.depth=Math.max(25,Math.min(78,parseFloat(h.pos.depth)-wdz/0.62));
  }

  const g=h3.group;
  const behindX=g.position.x-Math.cos(h3.facing)*rideState.camDist;
  const behindZ=g.position.z+Math.sin(h3.facing)*rideState.camDist;
  three3D.camera.position.lerp(new THREE.Vector3(behindX,rideState.camHeight,behindZ),.18);
  three3D.camera.lookAt(g.position.x,2.6,g.position.z);
}

function initRideJoystick(){
  const joy=document.getElementById('ride-joy');
  const knob=document.getElementById('ride-joy-knob');
  if(!joy||!knob) return;
  const R=44;
  const place=(dx,dy)=>{
    const d=Math.hypot(dx,dy);
    if(d>R){dx*=R/d;dy*=R/d;}
    knob.style.transform='translate('+dx+'px,'+dy+'px)';
  };
  const update=e=>{
    const r=joy.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    let dx=e.clientX-cx, dy=e.clientY-cy;
    const d=Math.hypot(dx,dy);
    if(d>R){dx*=R/d;dy*=R/d;}
    place(dx,dy);
    if(rideState) rideState.joy={x:dx/R,y:-dy/R};
  };
  const release=()=>{
    place(0,0);
    if(rideState) rideState.joy={x:0,y:0};
  };
  joy.addEventListener('pointerdown',e=>{ joy.setPointerCapture(e.pointerId); update(e); });
  joy.addEventListener('pointermove',e=>{ if(joy.hasPointerCapture(e.pointerId)) update(e); });
  joy.addEventListener('pointerup',release);
  joy.addEventListener('pointercancel',release);
}

window.addEventListener('keydown',e=>{
  if(!rideState) return;
  if(e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='ArrowLeft'||e.key==='ArrowRight') e.preventDefault();
  const k=rideState.keys;
  if(e.key==='w'||e.key==='W'||e.key==='ArrowUp')k.f=1;
  else if(e.key==='s'||e.key==='S'||e.key==='ArrowDown')k.b=1;
  if(e.key==='a'||e.key==='A'||e.key==='ArrowLeft')k.l=1;
  else if(e.key==='d'||e.key==='D'||e.key==='ArrowRight')k.r=1;
});
window.addEventListener('keyup',e=>{
  if(!rideState) return;
  const k=rideState.keys;
  if(e.key==='w'||e.key==='W'||e.key==='ArrowUp')k.f=0;
  else if(e.key==='s'||e.key==='S'||e.key==='ArrowDown')k.b=0;
  if(e.key==='a'||e.key==='A'||e.key==='ArrowLeft')k.l=0;
  else if(e.key==='d'||e.key==='D'||e.key==='ArrowRight')k.r=0;
});
