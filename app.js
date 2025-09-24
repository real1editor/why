// app.js
// Core client behavior: particles, reveal, voice commands, portfolio, forms

// ---------- Utility ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- Particles (lightweight) ----------
(function initParticles(){
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = c.width = innerWidth;
  let h = c.height = innerHeight;
  const N = Math.floor((w*h)/90000);
  const parts = Array.from({length: N}).map(()=> ({
    x: Math.random()*w, y: Math.random()*h,
    vx:(Math.random()-0.5)*0.25, vy:(Math.random()-0.5)*0.25,
    r: 0.5+Math.random()*1.8, a: 0.05+Math.random()*0.6
  }));
  function resize(){ w=c.width=innerWidth; h=c.height=innerHeight; }
  window.addEventListener('resize', resize);
  function tick(){
    ctx.clearRect(0,0,w,h);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if (p.x<0) p.x=w; if (p.x>w) p.x=0;
      if (p.y<0) p.y=h; if (p.y>h) p.y=0;
      ctx.beginPath();
      ctx.fillStyle = `rgba(110,242,255,${p.a})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

// ---------- Reveal behavior (zero text until user interacts) ----------
const welcome = $('#welcome');
const nav = $('#nav');
const sections = $('#sections');
const backTop = $('#backTop');

function revealAll(){
  welcome.classList.add('hidden');
  nav.classList.remove('hidden'); nav.setAttribute('aria-hidden','false');
  sections.classList.remove('hidden'); sections.setAttribute('aria-hidden','false');
  document.querySelectorAll('[data-scroll]').forEach(el=>{
    el.addEventListener('click', (ev)=>{
      ev.preventDefault();
      const target = document.querySelector(el.getAttribute('href'));
      target && target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
  backTop.style.display='block';
}
document.addEventListener('click', function firstInteract(){ revealAll(); document.removeEventListener('click', firstInteract); }, {once:true});

// ---------- Portfolio data & filter ----------
const PORTFOLIO = [
  {id:'p1', title:'Cinematic Ad — Brand X', tag:'commercial'},
  {id:'p2', title:'YouTube Viral Cut', tag:'youtube'},
  {id:'p3', title:'TikTok Short Pack', tag:'tiktok'},
  {id:'p4', title:'Doc Trailer', tag:'commercial'},
  {id:'p5', title:'Music Video Grade', tag:'youtube'},
  {id:'p6', title:'Social Promo', tag:'tiktok'},
];

const grid = $('#portfolioGrid');
function renderPortfolio(filter='all'){
  grid.innerHTML='';
  const items = PORTFOLIO.filter(p=> filter==='all' || p.tag===filter);
  items.forEach(it=>{
    const el = document.createElement('div'); el.className='item';
    el.innerHTML = `<div class="meta"><strong>${escapeHtml(it.title)}</strong></div>`;
    el.addEventListener('click', ()=>{
      // open telegram or reveal modal (here open bot)
      openTelegram();
    });
    grid.appendChild(el);
  });
}
renderPortfolio();

$$('.filters button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.filters button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderPortfolio(btn.getAttribute('data-filter') || 'all');
  });
});

// ---------- Voice control (Web Speech API) ----------
let recognition = null;
const micBtn = $('#micBtn');
function initVoice(){
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Speech) { micBtn.disabled=true; micBtn.title='No speech support'; return; }
  recognition = new Speech();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.onstart = ()=> micBtn.classList.add('listening');
  recognition.onend = ()=> micBtn.classList.remove('listening');
  recognition.onerror = e => console.warn('speech error', e);
  recognition.onresult = e=>{
    const text = e.results[0][0].transcript;
    handleCommand(text);
  };
}
initVoice();
micBtn.addEventListener('click', ()=> {
  if (!recognition) return;
  try { recognition.start(); } catch(e) { console.warn(e) }
});

// ---------- “Neural” simulate ----------
$('#neuroBtn').addEventListener('click', ()=>{
  const actions = ['portfolio','contact','openBot'];
  const pick = actions[Math.floor(Math.random()*actions.length)];
  if (pick==='portfolio') { revealAll(); renderPortfolio(); status('Neural: showing portfolio'); window.scrollTo({top:document.querySelector('#portfolio').offsetTop-40, behavior:'smooth'}); }
  if (pick==='contact') { revealAll(); document.querySelector('#contactForm input[name=name]').focus(); }
  if (pick==='openBot') openTelegram();
});

// ---------- Simple command handler & emotion inference ----------
function inferMood(text){
  const s = text.toLowerCase();
  if (/\b(great|love|amazing|awesome|nice)\b/.test(s)) return 'happy';
  if (/\b(sad|angry|hate|bad|dislike)\b/.test(s)) return 'sad';
  if (/\b(excited|now|urgent|hurry)\b/.test(s)) return 'energetic';
  return 'neutral';
}
function applyMood(mood){
  document.documentElement.style.setProperty('--mood', mood);
  // visual tweaks (simple)
  if (mood==='happy') document.querySelector('.holo-card').style.borderColor='rgba(110,242,255,0.12)';
  else if (mood==='sad') document.querySelector('.holo-card').style.filter='grayscale(.1)';
  else document.querySelector('.holo-card').style.filter='none';
}
function handleCommand(text){
  const t = text.toLowerCase();
  applyMood(inferMood(t));
  if (t.includes('portfolio') || t.includes('show')) { revealAll(); renderPortfolio(); return; }
  if (t.includes('contact') || t.includes('hire') || t.includes('work')) { revealAll(); document.querySelector('#contactForm input[name=name]').focus(); return; }
  if (t.includes('open telegram') || t.includes('bot')) { openTelegram(); return; }
  // fallback: send to AI proxy (optional)
  status('Command not matched — sent to AI assistant');
  aiAssist(text).then(r=> console.log('AI placeholder:', r)).catch(()=>{});
}

// ---------- Contact & feedback handlers (POST to /api/sendMessage) ----------
const apiSend = '/api/sendMessage';
$('#contactForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const payload = { name: f.get('name'), email: f.get('email'), message: f.get('project') };
  status('Sending project...');
  try {
    const res = await fetch(apiSend, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    const json = await res.json();
    if (json.ok) { status('Message sent — will reply on Telegram'); e.target.reset(); }
    else { status('Send error'); console.error(json); }
  } catch(err){ status('Network error'); console.error(err); }
});

$('#feedbackForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const payload = {fb_name: f.get('fb_name'), fb_email: f.get('fb_email'), fb_message: f.get('fb_message')};
  // reuse send endpoint but tag as feedback
  try {
    await fetch(apiSend, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:payload.fb_name||'Anon', email:payload.fb_email||'', message:'[Feedback] '+(payload.fb_message||'')} )});
    status('Thank you for feedback!');
    e.target.reset();
  } catch(e){ status('Feedback send failed'); }
});

$('#newsletterForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const em = new FormData(e.target).get('newsletter_email');
  // local demo: show toast
  status('Subscribed — check your email (demo)');
  e.target.reset();
});

// ---------- Telegram open helper ----------
function openTelegram(){
  // if WebApp available prefer in-app methods
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      const web = window.Telegram.WebApp;
      web.expand();
      // when running inside telegram webapp you can use sendData or open links
      web.sendData(JSON.stringify({action:'open_portfolio'}));
      return web.openTelegram ? web.openTelegram() : window.open('https://t.me/Real1editorBot', '_blank');
    }
  } catch(_) {}
  window.open('https://t.me/Real1editorBot', '_blank');
}
$('#openTelegramBtn').addEventListener('click', openTelegram);
$('#openBot').addEventListener('click', openTelegram);

// ---------- AI Proxy placeholder ----------
async function aiAssist(prompt){
  try {
    const r = await fetch('/api/aiProxy', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt})});
    return r.json();
  } catch(e){ return {error:'ai offline'} }
}

// ---------- small helpers ----------
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function status(msg){ console.log('[status]', msg); /* optionally show UI */ }

// ---------- Skill & testimonials populate ----------
const skills = ['Premiere Pro','After Effects','DaVinci Resolve','Color Grading','Motion Graphics','Sound Design','Short-form Optimization'];
const skillsGrid = $('#skillsGrid');
skills.forEach(s=>{
  const sp = document.createElement('span'); sp.textContent = s; skillsGrid.appendChild(sp);
});

const tests = [
  {a:'Sarah Johnson', text:'The editing transformed our narrative.'},
  {a:'Michael Chen', text:'Seamless workflow, amazing results.'},
  {a:'Jessica Williams', text:'Campaign videos produced record engagement.'}
];
const testGrid = $('#testGrid');
tests.forEach(t=>{
  const d=document.createElement('div'); d.className='test'; d.innerHTML=`<p>"${t.text}"</p><small>- ${t.a}</small>`; testGrid.appendChild(d);
});

// ---------- Back to top ----------
backTop.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

// ---------- minimal accessibility: focus outline for keyboard users ----------
document.addEventListener('keydown', e=>{ if (e.key==='Tab') document.body.classList.add('keyboard-nav'); }, {once:true});
