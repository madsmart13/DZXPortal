
const captchaCanvas = document.getElementById('captchaCanvas');
const captchaInput = document.getElementById('captchaInput');
const captchaReload = document.getElementById('captchaReload');
const captchaMsg = document.getElementById('captchaMsg');

let currentCaptcha = '';

function randomText(len=5){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s='';
  for(let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

function drawCaptcha(text){
  const ctx = captchaCanvas.getContext('2d');
  const w = captchaCanvas.width, h = captchaCanvas.height;
  ctx.clearRect(0,0,w,h);
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'rgba(10,10,20,0.6)');
  g.addColorStop(1,'rgba(18,4,30,0.8)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);
  for(let i=0;i<8;i++){
    ctx.beginPath();
    ctx.moveTo(Math.random()*w, Math.random()*h);
    ctx.lineTo(Math.random()*w, Math.random()*h);
    ctx.strokeStyle = `rgba(${Math.floor(100+Math.random()*155)},${Math.floor(0+Math.random()*120)},${Math.floor(160+Math.random()*95)},${0.12+Math.random()*0.12})`;
    ctx.lineWidth = 1 + Math.random()*1.5;
    ctx.stroke();
  }
  const fonts = ['24px Georgia','28px "Segoe UI"','30px Arial','26px "Helvetica"'];
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    const font = fonts[Math.floor(Math.random()*fonts.length)];
    ctx.font = font;
    ctx.save();
    const x = 20 + i*(w-40)/text.length + (Math.random()*8-4);
    const y = h/2 + (Math.random()*14-7);
    const angle = (Math.random()*30-15) * Math.PI/180;
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.fillStyle = `rgba(${200+Math.floor(Math.random()*55)},${200+Math.floor(Math.random()*55)},${200+Math.floor(Math.random()*55)},0.95)`;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }
  for(let i=0;i<60;i++){
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.08})`;
    ctx.beginPath();
    ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.6,0,Math.PI*2);
    ctx.fill();
  }
}

function regenCaptcha(){
  currentCaptcha = randomText(5);
  drawCaptcha(currentCaptcha);
  captchaInput.value = '';
  captchaMsg.textContent = 'برای ادامه کپچا را وارد کنید.';
}
captchaReload.addEventListener('click', regenCaptcha);
regenCaptcha();

function validateCaptcha(){
  const v = (captchaInput.value || '').trim().toUpperCase();
  return v === currentCaptcha;
}

const servers = document.querySelectorAll('.server');
let selectedServerId = null;

servers.forEach(server => {
  const id = server.dataset.id;
  const selectBtn = server.querySelector('.select-btn');
  const connectBtn = server.querySelector('.connect-btn');

  selectBtn.addEventListener('click', () => {
    if(!validateCaptcha()){
      captchaMsg.textContent = 'کپچا اشتباه است. لطفاً مجدداً تلاش کنید.';
      return;
    }
    selectedServerId = id;
    document.querySelectorAll('.server').forEach(s => s.classList.remove('selected'));
    server.classList.add('selected');
    document.querySelectorAll('.connect-btn').forEach(btn=>{
      btn.disabled = true;
    });
    connectBtn.disabled = false;
  });

  connectBtn.addEventListener('click', () => {
    if(!selectedServerId || selectedServerId !== id) return;
    showLoader().then(()=>{
      showErrorModal();
    });
  });
});


const loaderOverlay = document.getElementById('loaderOverlay');
const loaderCanvas = document.getElementById('loaderCanvas');
const loaderCtx = loaderCanvas.getContext('2d');
let loaderRAF = null;

function drawLoaderFrame(t){
  const ctx = loaderCtx;
  const w = loaderCanvas.width;
  const h = loaderCanvas.height;
  ctx.clearRect(0,0,w,h);
  const g = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, Math.max(w,h));
  g.addColorStop(0, 'rgba(138,43,226,0.18)');
  g.addColorStop(0.5, 'rgba(0,212,255,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  const cx = w/2, cy = h/2;
  const time = t/1000;
  for(let i=0;i<4;i++){
    const radius = 40 + i*26;
    ctx.beginPath();
    ctx.lineWidth = 6 - i;
    ctx.strokeStyle = `rgba(180,180,255,${0.12 + i*0.06})`;
    const start = time* (1 + i*0.3);
    for(let a=0;a<Math.PI*2;a+=0.02){
      const angle = a + start;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if(a===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 8 - i;
    const arcStart = time*(1+i*0.7) % (Math.PI*2);
    ctx.strokeStyle = `rgba(${(30+i*50)}, ${(100+i*40)}, ${(200-i*30)}, 0.95)`;
    ctx.arc(cx,cy,radius, arcStart, arcStart + Math.PI*0.9);
    ctx.stroke();
  }

  ctx.beginPath();
  const coreR = 22 + Math.sin(time*3)*4;
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.arc(cx,cy,coreR,0,Math.PI*2);
  ctx.fill();

  for(let p=0;p<6;p++){
    const angle = time*1.8 + p*(Math.PI*2/6);
    const rad = 90 + Math.sin(time*1.3 + p)*12;
    const x = cx + Math.cos(angle)*rad;
    const y = cy + Math.sin(angle)*rad;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${120 + p*20}, ${200 - p*12}, 255, 0.9)`;
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fill();
  }
}

function startLoaderAnimation(){
  loaderOverlay.classList.remove('hidden');
  function loop(t){
    drawLoaderFrame(t);
    loaderRAF = requestAnimationFrame(loop);
  }
  loaderRAF = requestAnimationFrame(loop);
}

function stopLoaderAnimation(){
  if(loaderRAF) cancelAnimationFrame(loaderRAF);
  loaderOverlay.classList.add('hidden');
}

function showLoader(){
  return new Promise(resolve=>{
    startLoaderAnimation();
    setTimeout(()=>{
      stopLoaderAnimation();
      resolve();
    }, 4000);
  });
}

// --- Error modal ---
const errorModal = document.getElementById('errorModal');
const modalClose = document.getElementById('modalClose');
function showErrorModal(){
  errorModal.classList.remove('hidden');
}
modalClose.addEventListener('click', ()=> errorModal.classList.add('hidden'));

// --- Background animated canvas ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
function resizeBg(){
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBg);
resizeBg();

const particles = [];
for(let i=0;i<60;i++){
  particles.push({
    x: Math.random()*bgCanvas.width,
    y: Math.random()*bgCanvas.height,
    r: 1+Math.random()*3,
    vx: (Math.random()*2-1)*0.1,
    vy: (Math.random()*2-1)*0.1,
    hue: 220 + Math.random()*60
  });
}

function bgFrame(){
  bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
  const g = bgCtx.createLinearGradient(0,0,bgCanvas.width,bgCanvas.height);
  g.addColorStop(0, 'rgba(8,6,12,0.7)');
  g.addColorStop(1, 'rgba(4,4,10,0.7)');
  bgCtx.fillStyle = g;
  bgCtx.fillRect(0,0,bgCanvas.width,bgCanvas.height);

  for(let p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.x < 0) p.x = bgCanvas.width;
    if(p.x > bgCanvas.width) p.x = 0;
    if(p.y < 0) p.y = bgCanvas.height;
    if(p.y > bgCanvas.height) p.y = 0;

    bgCtx.beginPath();
    bgCtx.fillStyle = `rgba(100,150,255,0.07)`;
    bgCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    bgCtx.fill();
  }

  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx+dy*dy);
      if(d < 120){
        bgCtx.beginPath();
        bgCtx.strokeStyle = `rgba(70,120,255,${0.02 + (120-d)/120 * 0.06})`;
        bgCtx.lineWidth = 1;
        bgCtx.moveTo(a.x,a.y);
        bgCtx.lineTo(b.x,b.y);
        bgCtx.stroke();
      }
    }
  }

  requestAnimationFrame(bgFrame);
}
bgFrame();


document.addEventListener('DOMContentLoaded', ()=>{
  captchaInput.addEventListener('input', ()=>{
    if(captchaInput.value.trim().length === currentCaptcha.length){
      if(validateCaptcha()){
        captchaMsg.textContent = 'کپچا صحیح است. حالا یکی از سرورها را انتخاب کنید.';
      } else {
        captchaMsg.textContent = 'کپچا هنوز صحیح نیست.';
      }
    } else {
      captchaMsg.textContent = 'برای ادامه کپچا را وارد کنید.';
    }
  });
});
