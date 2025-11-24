
const captchaCanvas = document.getElementById('captchaCanvas');
const captchaInput = document.getElementById('captchaInput');
const captchaReload = document.getElementById('captchaReload');
const captchaMsg = document.getElementById('captchaMsg');

let currentCaptcha = '';

function randText(len=5){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}

function drawCaptcha(txt){
  const ctx = captchaCanvas.getContext('2d');
  const w = captchaCanvas.width = 780/3; // adjust visual size
  const h = captchaCanvas.height = 270/3;
  ctx.clearRect(0,0,w,h);
  // gradient background
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'rgba(8,6,14,0.9)');
  g.addColorStop(1,'rgba(18,3,30,0.95)');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

  // noise lines
  for(let i=0;i<8;i++){
    ctx.beginPath();
    ctx.moveTo(Math.random()*w, Math.random()*h);
    ctx.lineTo(Math.random()*w, Math.random()*h);
    ctx.strokeStyle = `rgba(${80+Math.random()*160},${40+Math.random()*120},${150+Math.random()*100},${0.08+Math.random()*0.12})`;
    ctx.lineWidth = 1 + Math.random()*1.7;
    ctx.stroke();
  }

  // text with rotation
  const fonts = ['24px system-ui','28px "Segoe UI"','30px Georgia'];
  for(let i=0;i<txt.length;i++){
    const ch = txt[i];
    ctx.save();
    const font = fonts[Math.floor(Math.random()*fonts.length)];
    ctx.font = font;
    const x = 20 + i*(w-40)/txt.length + (Math.random()*12-6);
    const y = h/2 + (Math.random()*18-8);
    const ang = (Math.random()*30-15)*Math.PI/180;
    ctx.translate(x,y); ctx.rotate(ang);
    ctx.fillStyle = `rgba(${210+Math.random()*40},${210+Math.random()*40},${210+Math.random()*40},0.98)`;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }

  // dots
  for(let i=0;i<60;i++){
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.06})`;
    ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.6, 0, Math.PI*2); ctx.fill();
  }
}

function regenCaptcha(){
  currentCaptcha = randText(5);
  drawCaptcha(currentCaptcha);
  captchaInput.value = '';
  captchaMsg.innerText = 'برای ادامه کپچا را وارد کنید.';
}
captchaReload && captchaReload.addEventListener('click', regenCaptcha);
regenCaptcha();

function validateCaptcha(){ return (captchaInput.value||'').trim().toUpperCase() === currentCaptcha; }

// ---------- Server selection + connect logic ----------
const servers = document.querySelectorAll('.server');
let selectedServerId = null;

servers.forEach(s => {
  const id = s.dataset.id;
  const selBtn = s.querySelector('.select-btn');
  const conBtn = s.querySelector('.connect-btn');

  selBtn.addEventListener('click', () => {
    if(!validateCaptcha()){
      captchaMsg.innerText = 'کپچا اشتباه است — مجدداً تلاش کنید.';
      // small shake
      gsap.fromTo(captchaCanvas, {x:-6}, {x:0, duration:0.5, ease:"elastic.out(1,0.6)"});
      return;
    }
    selectedServerId = id;
    document.querySelectorAll('.server').forEach(x=>x.classList.remove('selected'));
    s.classList.add('selected');
    document.querySelectorAll('.connect-btn').forEach(b=>b.disabled=true);
    conBtn.disabled = false;
  });

  conBtn.addEventListener('click', () => {
    if(!selectedServerId || selectedServerId !== id) return;
    beginConnectSequence();
  });
});

// ---------- Loader sequence (GSAP timeline, exact 4s) ----------
const loaderOverlay = document.getElementById('loaderOverlay');
const errorModal = document.getElementById('errorModal');
const modalClose = document.getElementById('modalClose');

function beginConnectSequence(){
  loaderOverlay.classList.remove('hidden');

  // animate cinematic ring (rotate) using GSAP and keep for exactly 4s
  const tl = gsap.timeline();
  tl.to("#cinematicRing", {rotation: 360, transformOrigin: "50% 50%", duration: 1, repeat: 3, ease: "power2.inOut"});
  tl.to(loaderOverlay, {autoAlpha:1, duration:0.2}, 0);

  // ensure 4 seconds total
  setTimeout(()=> {
    gsap.to(loaderOverlay, {autoAlpha:0, duration:0.5, onComplete: ()=> { loaderOverlay.classList.add('hidden'); showError(); }});
  }, 4000);
}

function showError(){
  errorModal.classList.remove('hidden');
}
modalClose && modalClose.addEventListener('click', ()=> errorModal.classList.add('hidden'));

// ---------- Three.js background: particle field + subtle motion ----------
(function(){
  const container = document.getElementById('webgl-root');
  if(!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // particles geometry
  const count = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for(let i=0;i<count;i++){
    const i3 = i*3;
    positions[i3] = (Math.random() * 200 - 100);
    positions[i3+1] = (Math.random() * 120 - 60);
    positions[i3+2] = (Math.random() * 300 - 180);

    const c = new THREE.Color(0x88aaff);
    c.lerp(new THREE.Color(0x8a2be2), Math.random());
    colors[i3] = c.r; colors[i3+1] = c.g; colors[i3+2] = c.b;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({size: 1.6, vertexColors: true, transparent:true, opacity:0.85});
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // subtle camera movement by mouse
  const mouse = {x:0,y:0};
  window.addEventListener('mousemove', (e)=>{
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
  // resize
  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // animate
  let t = 0;
  function animate(){
    t += 0.0025;
    points.rotation.y = t * 0.9 + mouse.x * 0.3;
    points.rotation.x = Math.sin(t/3) * 0.08 + mouse.y * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
