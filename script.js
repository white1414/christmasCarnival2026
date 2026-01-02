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
