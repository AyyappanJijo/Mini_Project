/* =============================================
   ELMS — app.js
   Advanced JavaScript Logic
============================================= */

// ─── AUTH ─────────────────────────────────────
function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const err = document.getElementById('loginError');

  if (u === 'admin' && p === 'admin123') {
    localStorage.setItem('elms_login', 'true');
    localStorage.setItem('elms_user', u);
    showLoginSuccess();
    setTimeout(() => { location.href = 'dashboard.html'; }, 800);
  } else {
    err.classList.remove('hidden');
    const card = document.querySelector('.login-card');
    card.style.animation = 'shake 0.4s ease';
    setTimeout(() => { card.style.animation = ''; }, 400);
  }
}

function showLoginSuccess() {
  const btn = document.querySelector('.login-card .btn-primary');
  btn.innerHTML = '✅ Authenticated…';
  btn.style.background = 'var(--accent-green)';
}

function logout() {
  localStorage.removeItem('elms_login');
  location.href = 'login.html';
}

function togglePw() {
  const pw = document.getElementById('password');
  pw.type = pw.type === 'password' ? 'text' : 'password';
}

// Allow Enter key on login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.querySelector('.login-card')) login();
});

// ─── THEME ────────────────────────────────────
function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('elms_theme', isLight ? 'light' : 'dark');
  document.querySelectorAll('.btn-icon[onclick="toggleTheme()"]').forEach(b => {
    b.textContent = isLight ? '☀️' : '🌙';
  });
}

function applyTheme() {
  const saved = localStorage.getItem('elms_theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    document.querySelectorAll('.btn-icon[onclick="toggleTheme()"]').forEach(b => {
      b.textContent = '☀️';
    });
  }
}

// ─── SIDEBAR MOBILE ───────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// ─── LEAVE DATA ───────────────────────────────
function getLeaves() {
  return JSON.parse(localStorage.getItem('elms_leaves') || '[]');
}

function saveLeaves(leaves) {
  localStorage.setItem('elms_leaves', JSON.stringify(leaves));
}

// ─── APPLY LEAVE ──────────────────────────────
function applyLeave() {
  const name = document.getElementById('empName')?.value.trim();
  const type = document.getElementById('leaveType')?.value;
  const from = document.getElementById('fromDate')?.value;
  const to   = document.getElementById('toDate')?.value;
  const reason = document.getElementById('reason')?.value.trim();
  const priority = document.querySelector('input[name="priority"]:checked')?.value || 'Normal';

  if (!name) { showToast('Please enter employee name', 'error'); return; }
  if (!from || !to) { showToast('Please select both dates', 'error'); return; }
  if (new Date(to) < new Date(from)) { showToast('End date must be after start date', 'error'); return; }

  const days = calcWorkingDays(from, to);
  const leaves = getLeaves();

  leaves.unshift({
    id: Date.now(),
    name,
    type,
    from,
    to,
    days,
    reason: reason || '—',
    priority,
    status: 'Pending',
    createdAt: new Date().toISOString()
  });

  saveLeaves(leaves);
  resetForm();
  loadTable();
  showToast(`✅ Leave request submitted (${days} day${days !== 1 ? 's' : ''})`, 'success');
}

function calcWorkingDays(from, to) {
  let count = 0;
  let cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count || 1;
}

function resetForm() {
  ['empName', 'fromDate', 'toDate', 'reason'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('daysDisplay').style.display = 'none';
}

// ─── DATE CHANGE → DAYS PREVIEW ───────────────
function setupDateListeners() {
  const from = document.getElementById('fromDate');
  const to   = document.getElementById('toDate');
  const display = document.getElementById('daysDisplay');
  const totalEl = document.getElementById('totalDays');

  [from, to].forEach(el => {
    el?.addEventListener('change', () => {
      if (from?.value && to?.value) {
        const days = calcWorkingDays(from.value, to.value);
        if (days > 0 && new Date(to.value) >= new Date(from.value)) {
          totalEl.textContent = days;
          display.style.display = 'block';
        }
      }
    });
  });
}

// ─── TABLE ────────────────────────────────────
let currentFilter = { search: '', status: '' };

function loadTable() {
  const tbody = document.getElementById('leaveTable');
  if (!tbody) return;

  let leaves = getLeaves();

  // Apply filter
  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase();
    leaves = leaves.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q)
    );
  }
  if (currentFilter.status) {
    leaves = leaves.filter(l => l.status === currentFilter.status);
  }

  const empty = document.getElementById('emptyState');

  if (leaves.length === 0) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  tbody.innerHTML = leaves.map((l, i) => `
    <tr style="animation: slideUp 0.3s ease ${i * 0.05}s both;">
      <td style="color:var(--text-muted)">#${i + 1}</td>
      <td style="font-weight:600; color:var(--text-primary)">${l.name}</td>
      <td>${l.type}</td>
      <td>${formatDate(l.from)}</td>
      <td>${formatDate(l.to)}</td>
      <td>${l.days || '—'}</td>
      <td>
        <span style="font-size:0.78rem; color:${l.priority === 'Urgent' ? 'var(--accent-amber)' : 'var(--text-muted)'}">
          ${l.priority === 'Urgent' ? '🔥 Urgent' : 'Normal'}
        </span>
      </td>
      <td><span class="badge-status ${l.status}">${l.status}</span></td>
      <td>
        ${l.status === 'Pending' ? `
          <button class="action-btn approve" onclick="changeStatus(${l.id},'Approved')">✔ Approve</button>
          <button class="action-btn reject"  onclick="changeStatus(${l.id},'Rejected')">✖ Reject</button>
        ` : '<span style="color:var(--text-muted);font-size:0.8rem">—</span>'}
        <button class="action-btn delete" onclick="confirmDelete(${l.id})">🗑</button>
      </td>
    </tr>
  `).join('');
}

function filterLeaves() {
  currentFilter.search = document.getElementById('searchInput')?.value || '';
  currentFilter.status = document.getElementById('filterStatus')?.value || '';
  loadTable();
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── STATUS CHANGE ────────────────────────────
function changeStatus(id, status) {
  const leaves = getLeaves();
  const leave = leaves.find(l => l.id === id);
  if (!leave) return;
  leave.status = status;
  saveLeaves(leaves);
  loadTable();
  const icon = status === 'Approved' ? '✅' : '❌';
  showToast(`${icon} Leave ${status.toLowerCase()} for ${leave.name}`, status === 'Approved' ? 'success' : 'error');
}

// ─── DELETE ───────────────────────────────────
let _deleteId = null;

function confirmDelete(id) {
  _deleteId = id;
  const leaves = getLeaves();
  const leave = leaves.find(l => l.id === id);
  document.getElementById('modalMsg').textContent = `Delete ${leave?.name}'s leave request? This cannot be undone.`;
  document.getElementById('modal')?.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal')?.classList.add('hidden');
  _deleteId = null;
}

document.getElementById && document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('modalConfirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (_deleteId !== null) {
        const leaves = getLeaves().filter(l => l.id !== _deleteId);
        saveLeaves(leaves);
        loadTable();
        showToast('🗑 Leave record deleted', 'info');
        closeModal();
      }
    });
  }
});

// ─── DASHBOARD ────────────────────────────────
let chartInstances = {};

function loadDashboard() {
  const leaves = getLeaves();
  const t = leaves.length;
  const a = leaves.filter(l => l.status === 'Approved').length;
  const p = leaves.filter(l => l.status === 'Pending').length;
  const r = leaves.filter(l => l.status === 'Rejected').length;

  animateCount('total', t);
  animateCount('approved', a);
  animateCount('pending', p);
  animateCount('rejected', r);

  const aRate = document.getElementById('approvalRate');
  const rRate = document.getElementById('rejectionRate');
  if (aRate && t > 0) aRate.textContent = `${Math.round((a / t) * 100)}% approval rate`;
  if (rRate && t > 0) rRate.textContent = `${Math.round((r / t) * 100)}% rejection rate`;

  // Greeting
  const hour = new Date().getHours();
  const greetEl = document.getElementById('greeting');
  if (greetEl) {
    greetEl.textContent = hour < 12 ? '☀️ Good morning!' : hour < 17 ? '🌤 Good afternoon!' : '🌙 Good evening!';
  }

  const dateEl = document.getElementById('dateDisplay');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Charts
  renderDonut(a, p, r);
  renderBar(leaves);

  // Recent list
  const recentEl = document.getElementById('recentLeaves');
  if (recentEl) {
    const recent = leaves.slice(0, 5);
    if (recent.length === 0) {
      recentEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px">No leave requests yet</p>';
    } else {
      recentEl.innerHTML = recent.map(l => `
        <div class="recent-item">
          <span style="font-size:1.2rem">${typeIcon(l.type)}</span>
          <span class="ri-name">${l.name}</span>
          <span class="ri-type">${l.type}</span>
          <span class="badge-status ${l.status}">${l.status}</span>
          <span style="color:var(--text-muted);font-size:0.8rem">${formatDate(l.from)}</span>
        </div>
      `).join('');
    }
  }
}

function typeIcon(type) {
  const map = {
    'Sick Leave': '🤒',
    'Casual Leave': '☀️',
    'Vacation': '✈️',
    'Maternity Leave': '🤱',
    'Paternity Leave': '👨‍👦',
    'Emergency Leave': '🚨'
  };
  return map[type] || '📋';
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 30);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, 30);
}

function renderDonut(a, p, r) {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  if (chartInstances.donut) { chartInstances.donut.destroy(); }

  chartInstances.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [a || 0, p || 0, r || 0],
        backgroundColor: ['rgba(52,211,153,0.8)', 'rgba(251,191,36,0.8)', 'rgba(248,113,113,0.8)'],
        borderColor: ['#34d399', '#fbbf24', '#f87171'],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            padding: 16,
            font: { size: 12, family: 'DM Sans' }
          }
        }
      }
    }
  });
}

function renderBar(leaves) {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;
  if (chartInstances.bar) { chartInstances.bar.destroy(); }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const counts = Array(12).fill(0);

  leaves.forEach(l => {
    if (l.from) {
      const m = new Date(l.from).getMonth();
      counts[m]++;
    }
  });

  chartInstances.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Leave Requests',
        data: counts,
        backgroundColor: 'rgba(129,140,248,0.6)',
        borderColor: 'rgba(129,140,248,1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(129,140,248,0.9)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } },
          grid:  { display: false }
        },
        y: {
          ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, stepSize: 1 },
          grid:  { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });
}

// ─── TOAST ────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
}

// ─── ADD SHAKE KEYFRAMES DYNAMICALLY ──────────
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-10px); }
    40%,80%  { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// ─── INIT ─────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  setupDateListeners();

  // Auth guard (optional: comment out during dev)
  // if (!localStorage.getItem('elms_login') && !location.pathname.includes('login')) {
  //   location.href = 'login.html';
  // }

  loadDashboard();
  loadTable();
});