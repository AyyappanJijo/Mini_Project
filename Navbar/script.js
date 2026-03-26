/* ============================================================
   script.js — Info Tech Full Site
   ============================================================ */

/* ── ELEMENT REFERENCES ─────────────────────────────────── */
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const themeBtn    = document.getElementById('themeBtn');
const loginBtn    = document.getElementById('loginBtn');
const mobileLogin = document.getElementById('mobileLoginBtn');
const toast       = document.getElementById('toast');
const toastMsg    = document.getElementById('toastMsg');
const allNavLinks = document.querySelectorAll('.nav-link');
const canvas      = document.getElementById('bgCanvas');
const ctx         = canvas.getContext('2d');


/* ══════════════════════════════════════════════════════════
   1. ANIMATED BACKGROUND — floating particles + connections
══════════════════════════════════════════════════════════ */
let particles = [];
let animFrame;
const PARTICLE_COUNT = 70;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x   = Math.random() * canvas.width;
    this.y   = Math.random() * canvas.height;
    this.r   = Math.random() * 1.8 + 0.4;
    this.vx  = (Math.random() - 0.5) * 0.35;
    this.vy  = (Math.random() - 0.5) * 0.35;
    this.hue = Math.random() > 0.5 ? 262 : 192; // purple or cyan
    this.alpha = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}

function drawConnections() {
  const maxDist = 130;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const opacity = (1 - dist / maxDist) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = document.body.classList.contains('light')
          ? `rgba(100, 60, 200, ${opacity})`
          : `rgba(150, 100, 255, ${opacity})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
}

function animateBg() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ambient glows
  if (!document.body.classList.contains('light')) {
    const g1 = ctx.createRadialGradient(
      canvas.width * 0.2, canvas.height * 0.3, 0,
      canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.35
    );
    g1.addColorStop(0, 'rgba(124,58,237,0.07)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const g2 = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.6, 0,
      canvas.width * 0.8, canvas.height * 0.6, canvas.width * 0.3
    );
    g2.addColorStop(0, 'rgba(6,182,212,0.06)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  animFrame = requestAnimationFrame(animateBg);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

resizeCanvas();
initParticles();
animateBg();


/* ══════════════════════════════════════════════════════════
   2. SCROLL — shrink header
══════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
});


/* ══════════════════════════════════════════════════════════
   3. INTERSECTION OBSERVER — active nav link on scroll
══════════════════════════════════════════════════════════ */
const sectionIDs = ['home', 'about', 'product', 'category', 'price'];
const sections   = sectionIDs.map(id => document.getElementById(id)).filter(Boolean);

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      allNavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));


/* ══════════════════════════════════════════════════════════
   4. HAMBURGER — mobile menu open/close
══════════════════════════════════════════════════════════ */
function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('click', e => {
  if (!header.contains(e.target) && !mobileMenu.contains(e.target)) closeMobileMenu();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});


/* ══════════════════════════════════════════════════════════
   5. THEME TOGGLE — light / dark with localStorage
══════════════════════════════════════════════════════════ */
let isDark = true;

function applyTheme(dark) {
  isDark = dark;
  document.body.classList.toggle('light', !dark);
  themeBtn.textContent = dark ? '🌙' : '☀️';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

// Restore saved preference
const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme ? savedTheme === 'dark' : true);

themeBtn.addEventListener('click', () => {
  applyTheme(!isDark);
  showToast(isDark ? '🌙 Dark mode on' : '☀️ Light mode on');
});


/* ══════════════════════════════════════════════════════════
   6. TOAST NOTIFICATION
══════════════════════════════════════════════════════════ */
let toastTimer;

function showToast(msg, duration = 2800) {
  clearTimeout(toastTimer);
  toastMsg.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}


/* ══════════════════════════════════════════════════════════
   7. LOGIN TOGGLE — simulated auth state
══════════════════════════════════════════════════════════ */
let loggedIn = false;

function handleLogin() {
  loggedIn = !loggedIn;
  const label = loggedIn ? 'Logout' : 'Login';
  loginBtn.querySelector('span').textContent = label;
  mobileLogin.textContent = loggedIn ? 'Logout ↩' : 'Login to Info Tech →';
  showToast(loggedIn ? '✅ Logged in! Welcome back.' : '👋 Logged out.');
  if (loggedIn) closeMobileMenu();
}

loginBtn.addEventListener('click', handleLogin);
mobileLogin.addEventListener('click', handleLogin);


/* ══════════════════════════════════════════════════════════
   8. BILLING TOGGLE — monthly / yearly pricing
══════════════════════════════════════════════════════════ */
const billingSwitch  = document.getElementById('billingSwitch');
const toggleMonthly  = document.getElementById('toggleMonthly');
const toggleYearly   = document.getElementById('toggleYearly');

function updatePrices(yearly) {
  document.querySelectorAll('.amount').forEach(el => {
    const target = parseInt(yearly ? el.dataset.yearly : el.dataset.monthly, 10);
    animateNumber(el, parseInt(el.textContent.replace(/,/g, ''), 10) || 0, target);
  });
  toggleMonthly.classList.toggle('active', !yearly);
  toggleYearly.classList.toggle('active',  yearly);
}

function animateNumber(el, from, to) {
  const duration = 400;
  const start    = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

billingSwitch.addEventListener('change', () => updatePrices(billingSwitch.checked));
toggleMonthly.addEventListener('click', () => { billingSwitch.checked = false; updatePrices(false); });
toggleYearly.addEventListener('click',  () => { billingSwitch.checked = true;  updatePrices(true); });


/* ══════════════════════════════════════════════════════════
   9. KEYBOARD — focus trap inside mobile menu
══════════════════════════════════════════════════════════ */
mobileMenu.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = mobileMenu.querySelectorAll('a, button');
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});