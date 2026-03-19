// ── Constants ──────────────────────────────────────────────────────────
const GRID      = 20;       // grid cell size in px
const COLS      = 20;       // canvas width  / GRID
const ROWS      = 20;       // canvas height / GRID
const BASE_SPEED = 150;     // ms per tick (lower = faster)
const SPEED_STEP = 8;       // ms reduction per level
const POINTS_PER_LEVEL = 5; // score needed to level up

// ── Canvas setup ───────────────────────────────────────────────────────
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');

// ── DOM refs ───────────────────────────────────────────────────────────
const scoreEl      = document.getElementById('score');
const highScoreEl  = document.getElementById('highScore');
const levelEl      = document.getElementById('level');
const lengthEl     = document.getElementById('lengthVal');
const speedBarEl   = document.getElementById('speedBar');
const speedValEl   = document.getElementById('speedVal');
const statusDotEl  = document.getElementById('statusDot');
const statusTxtEl  = document.getElementById('statusTxt');
const finalScoreEl = document.getElementById('finalScore');
const newBestMsg   = document.getElementById('newBestMsg');

const startOverlay   = document.getElementById('startOverlay');
const pauseOverlay   = document.getElementById('pauseOverlay');
const gameOverOverlay= document.getElementById('gameOverOverlay');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', startGame);

// ── Game state ─────────────────────────────────────────────────────────
let snake, dir, nextDir, food, score, level, highScore;
let gameLoop, running, paused, gameStarted;

highScore = parseInt(localStorage.getItem('snek_best')) || 0;
highScoreEl.textContent = highScore;

// ── Audio (Web Audio API — no files needed) ───────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type, duration, gainVal = 0.2) {
  try {
    const ac  = getAudio();
    const osc = ac.createOscillator();
    const gain= ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(gainVal, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch(e) {}
}

function sfxEat()   { playTone(520, 'square', 0.08, 0.15); setTimeout(()=>playTone(780,'square',0.08,0.1), 60); }
function sfxDie()   { playTone(180, 'sawtooth', 0.4, 0.3); setTimeout(()=>playTone(100,'sawtooth',0.5,0.3),200); }
function sfxLevel() { [600,700,900].forEach((f,i)=>setTimeout(()=>playTone(f,'square',0.12,0.15),i*80)); }
function sfxPause() { playTone(300, 'sine', 0.15, 0.1); }

// ── Init / Reset ───────────────────────────────────────────────────────
function initGame() {
  snake    = [{ x: 10, y: 10 }];
  dir      = { x: 1, y: 0 };
  nextDir  = { x: 1, y: 0 };
  score    = 0;
  level    = 1;
  running  = false;
  paused   = false;
  placeFood();
  updateUI();
  drawFrame();
}

// ── Food placement ─────────────────────────────────────────────────────
function placeFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

// ── Game tick ──────────────────────────────────────────────────────────
function tick() {
  dir = { ...nextDir };

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return endGame();
  }
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  // Ate food?
  if (head.x === food.x && head.y === food.y) {
    score++;
    sfxEat();
    placeFood();

    // Level up every POINTS_PER_LEVEL
    const newLevel = Math.floor(score / POINTS_PER_LEVEL) + 1;
    if (newLevel > level) {
      level = newLevel;
      sfxLevel();
      restartLoop();
    }
  } else {
    snake.pop();
  }

  updateUI();
  drawFrame();
}

// ── Speed control ──────────────────────────────────────────────────────
function getSpeed() {
  return Math.max(60, BASE_SPEED - (level - 1) * SPEED_STEP);
}

function restartLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, getSpeed());
}

// ── Start / End / Pause ────────────────────────────────────────────────
function startGame() {
  clearInterval(gameLoop);
  hideAllOverlays();
  initGame();
  running     = true;
  gameStarted = true;
  gameLoop    = setInterval(tick, getSpeed());
  setStatus('PLAYING', false);
}

function endGame() {
  clearInterval(gameLoop);
  running = false;
  sfxDie();

  finalScoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snek_best', highScore);
    highScoreEl.textContent = highScore;
    newBestMsg.style.display = 'block';
  } else {
    newBestMsg.style.display = 'none';
  }

  setStatus('DEAD', true);
  gameOverOverlay.classList.remove('hidden');
  drawFrame(); // flash red
}

function togglePause() {
  if (!running && !paused) return;
  if (paused) {
    paused = false;
    gameLoop = setInterval(tick, getSpeed());
    pauseOverlay.classList.add('hidden');
    setStatus('PLAYING', false);
    sfxPause();
  } else {
    paused = true;
    clearInterval(gameLoop);
    pauseOverlay.classList.remove('hidden');
    setStatus('PAUSED', false);
    sfxPause();
  }
}

function hideAllOverlays() {
  startOverlay.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
}

// ── UI updates ─────────────────────────────────────────────────────────
function updateUI() {
  scoreEl.textContent  = score;
  levelEl.textContent  = level;
  lengthEl.textContent = snake.length;

  const maxLevel  = 10;
  const pct       = Math.min(((level - 1) / (maxLevel - 1)) * 100, 100);
  speedBarEl.style.height = (10 + pct * 0.9) + '%';
  speedValEl.textContent  = level + 'x';
}

function setStatus(txt, danger) {
  statusTxtEl.textContent = txt;
  statusDotEl.className   = 'status-dot' + (danger ? ' danger' : '');
}

// ── Drawing ────────────────────────────────────────────────────────────
function drawFrame() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#04080f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid dots
  ctx.fillStyle = 'rgba(240,192,64,0.05)';
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      ctx.fillRect(x * GRID + GRID/2 - 1, y * GRID + GRID/2 - 1, 2, 2);
    }
  }

  // Food
  drawFood();

  // Snake
  snake.forEach((seg, i) => drawSegment(seg, i));
}

function drawFood() {
  const x = food.x * GRID;
  const y = food.y * GRID;
  const cx = x + GRID/2;
  const cy = y + GRID/2;

  // Glow
  const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, GRID);
  grd.addColorStop(0, 'rgba(240,192,64,0.55)');
  grd.addColorStop(1, 'rgba(240,192,64,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, GRID, 0, Math.PI * 2);
  ctx.fill();

  // Food body
  ctx.fillStyle = '#f0c040';
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#f0c040';
  ctx.beginPath();
  ctx.arc(cx, cy, GRID/2 - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSegment(seg, index) {
  const x  = seg.x * GRID + 1;
  const y  = seg.y * GRID + 1;
  const sz = GRID - 2;
  const isHead = index === 0;

  // Gradient: head = gold, tail fades to deep blue
  const t = index / Math.max(snake.length - 1, 1);
  const r = Math.round(240 + t * (42  - 240));
  const g = Math.round(192 + t * (95  - 192));
  const b = Math.round(64  + t * (196 - 64));
  const color = `rgb(${r},${g},${b})`;

  // Glow for head
  if (isHead) {
    ctx.shadowBlur  = 22;
    ctx.shadowColor = '#f0c040';
  }

  // Rounded rectangle
  const radius = isHead ? 6 : 4;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, sz, sz, radius);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Head eyes
  if (isHead) {
    const eyeColor = '#04080f';
    const ex1 = x + (dir.x === 0 ? sz * 0.25 : (dir.x > 0 ? sz * 0.6 : sz * 0.2));
    const ex2 = x + (dir.x === 0 ? sz * 0.75 : (dir.x > 0 ? sz * 0.6 : sz * 0.2));
    const ey1 = y + (dir.y === 0 ? sz * 0.3  : (dir.y > 0 ? sz * 0.6 : sz * 0.2));
    const ey2 = y + (dir.y === 0 ? sz * 0.3  : (dir.y > 0 ? sz * 0.6 : sz * 0.2));

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(ex1, ey1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (dir.x === 0) {
      ctx.beginPath();
      ctx.arc(ex2, ey2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Segment border
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, sz, sz, radius);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Controls ───────────────────────────────────────────────────────────
const DIRS = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x:  1, y: 0 }, d: { x:  1, y: 0 },
};

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();

  // Space = start or resume
  if (e.key === ' ') {
    e.preventDefault();
    if (!gameStarted) return startGame();
    if (!running)     return;
  }

  // Pause
  if (key === 'p') { e.preventDefault(); if (gameStarted) togglePause(); return; }

  // Restart
  if (key === 'r') { e.preventDefault(); if (gameStarted) startGame(); return; }

  // Direction
  const newDir = DIRS[e.key] || DIRS[key];
  if (!newDir || !running || paused) return;
  e.preventDefault();

  // Prevent reversing
  if (newDir.x === -dir.x && newDir.y === -dir.y) return;
  nextDir = newDir;
});

// ── Touch / Swipe support ──────────────────────────────────────────────
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (!gameStarted) startGame();
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (!touchStart || !running || paused) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    const nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    if (!(nd.x === -dir.x)) nextDir = nd;
  } else {
    const nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    if (!(nd.y === -dir.y)) nextDir = nd;
  }
  touchStart = null;
}, { passive: true });

// ── Boot ───────────────────────────────────────────────────────────────
initGame();