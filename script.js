// Theme toggle
const themeToggle = document.getElementById('themeToggle');
function setTheme(t){
  document.body.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
}
themeToggle.addEventListener('click', ()=>{
  const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

// Remove horizontal carousel logic; enable vertical scrolling layout.
// We keep theme toggle and snowfall only.

// (No horizontal carousel; remove leftover keyboard handlers)

// Snowfall effect using canvas (as provided, integrated)
const canvas = document.createElement('canvas');
canvas.className = 'snow';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let width, height;
let snowflakes = [];

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resizeCanvas);
}
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

function createSnowflakes() {
  const x = Math.random() * width;
  const y = -10; // start slightly above for nicer effect
  const radius = Math.random() * 4 + 1;
  const speed = Math.random() * 1 + 0.5;
  const wind = (Math.random() - 0.5) * 0.6;
  snowflakes.push({x, y, radius, speed, wind});
  if(snowflakes.length > 400) snowflakes.shift();
}

function drawSnowflakes() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'white';
  ctx.beginPath();
  for (let flake of snowflakes) {
    ctx.moveTo(flake.x, flake.y);
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
  }
  ctx.fill();
  moveSnowflakes();
}

function moveSnowflakes() {
  for (let flake of snowflakes) {
    flake.y += flake.speed;
    flake.x += flake.wind;
    if (flake.y > height) {
      flake.x = Math.random() * width;
      flake.y = -10;
    }
  }
}

function updateSnowfall() {
  drawSnowflakes();
  requestAnimationFrame(updateSnowfall);
}

setInterval(createSnowflakes, 150);
updateSnowfall();

// Initialize small defaults
setTheme('dark');

// Load schedule from JSON and render activity cards
async function loadSchedule(url = 'schedule.json'){
  const grid = document.querySelector('.grid');
  if(!grid) return;
  try{
    const res = await fetch(url, {cache: 'no-store'});
    if(!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    // store schedule globally for live checks
    window.__scheduleData = data;
    // expect data to be an array of activities
    grid.innerHTML = '';
    for(const act of data){
      const el = document.createElement('div');
      el.className = 'activity';
      el.innerHTML = `
        <div class="act-time">${act.time || ''}</div>
        <div class="act-title">${act.title || ''}</div>
        <div class="act-place">${act.place || ''}</div>
      `;
      grid.appendChild(el);
    }
    // update live status once after loading
    updateLiveStatus();
    // refresh live status periodically
    if (!window.__liveInterval) {
      window.__liveInterval = setInterval(updateLiveStatus, 30_000);
    }
  }catch(err){
    console.error('Failed to load schedule.json:', err);
  }
}

// call loadSchedule when DOM is ready
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=> loadSchedule());
} else {
  loadSchedule();
}

// Live status: shows current activities only on Jan 4, 2026
function parseTimeToDate(timeStr){
  // accepts formats like "4:00 PM" or "04:00 PM" or "4 PM"
  const m = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if(!m) return null;
  let hh = parseInt(m[1],10);
  const mm = m[2] ? parseInt(m[2],10) : 0;
  const ampm = m[3];
  if(ampm){
    const up = ampm.toUpperCase();
    if(up === 'PM' && hh !== 12) hh += 12;
    if(up === 'AM' && hh === 12) hh = 0;
  }
  // Event day: Jan 4, 2026
  return new Date(2026, 0, 4, hh, mm, 0);
}

function renderLiveCard(contentHtml){
  let card = document.getElementById('liveCard');
  if(!card){
    card = document.createElement('div');
    card.id = 'liveCard';
    card.className = 'live-card';
    // insert the card between intro and schedule sections if possible
    const intro = document.getElementById('intro');
    if(intro && intro.parentNode){
      intro.parentNode.insertBefore(card, intro.nextSibling);
    } else {
      document.body.appendChild(card);
    }
  }
  card.innerHTML = contentHtml;
}

function clearLiveCard(){
  const card = document.getElementById('liveCard');
  if(card) card.remove();
}

function updateLiveStatus(){
  const data = window.__scheduleData || [];
  const now = new Date();
  // allow preview/testing via URL param ?live_test=1
  const params = new URLSearchParams(location.search);
  const testMode = params.get('live_test') === '1';

  // check if user closed the card for the day
  const hideUntil = Number(localStorage.getItem('liveCardHiddenUntil') || '0');
  if(hideUntil && now.getTime() < hideUntil) return;
  // Only show detailed live info on Jan 4, 2026 unless test mode is enabled
  const eventDay = new Date(2026,0,4);
  const isEventDay = (now.getFullYear() === 2026 && now.getMonth() === 0 && now.getDate() === 4);
  if(!testMode && !isEventDay){
    // Show a friendly message instead of removing the card
    if(now < eventDay){
      renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Notice</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div style=\"padding:8px 4px\">Carnival hasn't started yet. The event will take place on <strong>Jan 4, 2026</strong>.</div>`);
      attachLiveCardHandlers();
      return;
    } else {
      renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Notice</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div style=\"padding:8px 4px\">Carnival has ended. Thank you for joining us.</div>`);
      attachLiveCardHandlers();
      return;
    }
  }

  // build array of events with start and end (duration minutes, default 60)
  const events = data.map(act => {
    const start = parseTimeToDate(act.time || '');
    const duration = act.duration != null ? Number(act.duration) : 60;
    const end = start ? new Date(start.getTime() + duration * 60000) : null;
    return {raw: act, start, end};
  }).filter(e => e.start);

  if(events.length === 0){
    renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Live Now</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div>No activities scheduled for today.</div>`);
    attachLiveCardHandlers();
    return;
  }

  // find active events (now >= start && now < end)
  const active = events.filter(e => now >= e.start && now < e.end);

  if(active.length > 0){
    // render list of active items with red pulsing dot
    const itemsHtml = active.map(e => {
      const a = e.raw;
      return `
        <div class="live-item">
          <div class="live-dot" aria-hidden="true"></div>
          <div class="live-info">
            <div class="live-title">${a.title || ''}</div>
            <div class="live-time">${a.time || ''} · <span class="live-place">${a.place || ''}</span></div>
          </div>
        </div>`;
    }).join('');
    renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Live Now</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div class="live-list">${itemsHtml}</div>`);
    attachLiveCardHandlers();
    return;
  }

  // no active events: determine first start and last end
  const sorted = events.slice().sort((a,b)=>a.start - b.start);
  const first = sorted[0];
  const last = sorted[sorted.length-1];

  if(now < first.start){
    // show next upcoming
    const next = first.raw;
    const diff = first.start.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const human = minutes >= 60 ? `${Math.floor(minutes/60)}h ${minutes%60}m` : `${minutes}m`;
    renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Upcoming</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div class=\"live-item\"><div class=\"live-dot\" style=\"opacity:0.35;animation:none\"></div><div class=\"live-info\"><div class=\"live-title\">${next.title || ''}</div><div class=\"live-time\">${next.time || ''} · starts in ${human}</div></div></div>`);
    attachLiveCardHandlers();
    return;
  }

  if(now >= last.end){
    renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Live Now</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div>Carnival ended for today.</div>`);
    attachLiveCardHandlers();
    return;
  }

  // between events -> show next upcoming
  const nextEvent = sorted.find(e => now < e.start);
  if(nextEvent){
    const diff2 = nextEvent.start.getTime() - now.getTime();
    const minutes2 = Math.floor(diff2 / 60000);
    const human2 = minutes2 >= 60 ? `${Math.floor(minutes2/60)}h ${minutes2%60}m` : `${minutes2}m`;
    const n = nextEvent.raw;
    renderLiveCard(`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Next</h4><button class=\"live-close\" aria-label=\"Close\">✕</button></div><div class=\"live-item\"><div class=\"live-dot\" style=\"opacity:0.25;animation:none\"></div><div class=\"live-info\"><div class=\"live-title\">${n.title || ''}</div><div class=\"live-time\">${n.time || ''} · starts in ${human2}</div></div></div>`);
    attachLiveCardHandlers();
    return;
  }
}

function attachLiveCardHandlers(){
  const card = document.getElementById('liveCard');
  if(!card) return;
  const btn = card.querySelector('.live-close');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    // hide until end of today (local)
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59,999).getTime();
    localStorage.setItem('liveCardHiddenUntil', String(endOfDay));
    clearLiveCard();
  });
}
