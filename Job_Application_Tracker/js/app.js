// app.js - Upgraded JobTracker Application Logic
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let editingIndex = -1;
let currentUser = localStorage.getItem('currentUser') || '';

// Utility Functions
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    ${message}
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function updateSidebarUser() {
  const userEl = document.getElementById('sidebar-user');
  if (userEl) userEl.textContent = currentUser || 'Guest';
}

// Login
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  
  if (username && password === 'password123') {
    localStorage.setItem('currentUser', username);
    currentUser = username;
    window.location.href = 'dashboard.html';
  } else {
    showToast('Invalid credentials. Demo: any username + password123', 'error');
  }
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  currentUser = '';
  window.location.href = 'index.html';
}

// Add Job (new or edit)
function addJob() {
  const company = document.getElementById('company').value.trim();
  const role = document.getElementById('role').value.trim();
  const location = document.getElementById('location').value.trim();
  const status = document.getElementById('status').value;
  const notes = document.getElementById('notes').value.trim();
  const followup = document.getElementById('followup').value;

  if (!company || !role) {
    showToast('Company and Role are required', 'error');
    return;
  }

  const job = { company, role, location, status, notes, followup };

  if (editingIndex >= 0) {
    jobs[editingIndex] = job;
    editingIndex = -1;
    showToast('Job updated successfully');
  } else {
    jobs.push(job);
    showToast('Job added successfully');
  }

  localStorage.setItem('jobs', JSON.stringify(jobs));
  
  // Reset form
  document.getElementById('company').value = '';
  document.getElementById('role').value = '';
  document.getElementById('location').value = '';
  document.getElementById('status').value = 'Applied';
  document.getElementById('notes').value = '';
  document.getElementById('followup').value = '';

  // Redirect to dashboard after short delay
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 800);
}

// Edit Job (populate form from dashboard)
function editJob(index) {
  const job = jobs[index];
  editingIndex = index;
  
  document.getElementById('company').value = job.company;
  document.getElementById('role').value = job.role;
  document.getElementById('location').value = job.location;
  document.getElementById('status').value = job.status;
  document.getElementById('notes').value = job.notes;
  document.getElementById('followup').value = job.followup || '';
  
  window.location.href = 'add-job.html';
}

// Save Edit (from modal)
function saveEdit() {
  const index = editingIndex;
  if (index < 0) return;
  
  const company = document.getElementById('edit-company').value.trim();
  const role = document.getElementById('edit-role').value.trim();
  const location = document.getElementById('edit-location').value.trim();
  const status = document.getElementById('edit-status').value;
  const notes = document.getElementById('edit-notes').value.trim();
  const followup = document.getElementById('edit-followup').value;

  jobs[index] = { company, role, location, status, notes, followup };
  localStorage.setItem('jobs', JSON.stringify(jobs));
  
  closeEditModal();
  renderJobs();
  showToast('Job updated');
}

// Delete Job
function deleteJob(index) {
  if (confirm('Delete this job application?')) {
    jobs.splice(index, 1);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    renderJobs();
    showToast('Job deleted');
  }
}

// Close Edit Modal
function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
  editingIndex = -1;
}

// Export CSV
function exportCSV() {
  if (jobs.length === 0) {
    showToast('No jobs to export', 'info');
    return;
  }

  const headers = ['Company', 'Role', 'Location', 'Status', 'Notes', 'Follow-up'];
  const csv = [
    headers.join(','),
    ...jobs.map(job => [
      `"${job.company}"`,
      `"${job.role}"`,
      `"${job.location}"`,
      job.status,
      `"${job.notes.replace(/"/g, '""')}"`,
      job.followup || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jobtracker-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('CSV exported successfully');
}

// Render Jobs Table
function renderJobs() {
  const table = document.querySelector('#jobTable tbody');
  const tableCount = document.getElementById('tableCount');
  if (!table) return;

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  
  let filteredJobs = jobs.filter(job => {
    const search = (searchInput?.value || '').toLowerCase();
    const status = statusFilter?.value || 'All';
    
    const matchesSearch = !search || 
      job.company.toLowerCase().includes(search) ||
      job.role.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search);
    
    const matchesStatus = status === 'All' || job.status === status;
    
    return matchesSearch && matchesStatus;
  });

  table.innerHTML = '';
  
  filteredJobs.forEach((job, index) => {
    const globalIndex = jobs.indexOf(job);
    const avatarClass = `av-${globalIndex % 6}`;
    const badgeClass = `badge badge-${job.status.toLowerCase()}`;
    const followup = job.followup ? new Date(job.followup).toLocaleDateString() : '—';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="td-company">
        <div class="company-avatar ${avatarClass}">${job.company[0].toUpperCase()}</div>
        ${job.company}
      </td>
      <td class="td-role">${job.role}</td>
      <td class="td-location">${job.location || '—'}</td>
      <td><span class="${badgeClass}">${job.status}</span></td>
      <td class="td-note" title="${job.notes}">${job.notes || '—'}</td>
      <td class="td-date">${followup}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="editJob(${globalIndex})" title="Edit">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteJob(${globalIndex})" title="Delete">🗑️</button>
      </td>
    `;
    table.appendChild(row);
  });

  tableCount.textContent = filteredJobs.length;
  updateStats();
  updateChart();
}

// Update Stats Cards
function updateStats() {
  const totalEl = document.getElementById('totalJobs');
  const interviewEl = document.getElementById('interviewJobs');
  const offerEl = document.getElementById('offerJobs');
  const rejectedEl = document.getElementById('rejectedJobs');

  if (!totalEl) return;

  totalEl.textContent = jobs.length;
  interviewEl.textContent = jobs.filter(j => j.status === 'Interview').length;
  offerEl.textContent = jobs.filter(j => j.status === 'Offer').length;
  rejectedEl.textContent = jobs.filter(j => j.status === 'Rejected').length;
}

// Update Chart
let chartInstance = null;
function updateChart() {
  const canvas = document.getElementById('jobChart');
  if (!canvas) return;

  const counts = {
    Applied: jobs.filter(j => j.status === 'Applied').length,
    Interview: jobs.filter(j => j.status === 'Interview').length,
    Offer: jobs.filter(j => j.status === 'Offer').length,
    Rejected: jobs.filter(j => j.status === 'Rejected').length
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
      datasets: [{
        data: [counts.Applied, counts.Interview, counts.Offer, counts.Rejected],
        backgroundColor: [
          'rgba(124, 92, 252, 0.8)',
          'rgba(34, 211, 238, 0.8)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(251, 113, 133, 0.8)'
        ],
        borderWidth: 0,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

// Search & Filter
function initSearchFilter() {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', renderJobs);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', renderJobs);
  }
}

// Modal Controls
// Enhanced modal functions
function openEditModal(index) {
  const job = jobs[index];
  editingIndex = index;
  
  // Populate form
  document.getElementById('edit-company').value = job.company || '';
  document.getElementById('edit-role').value = job.role || '';
  document.getElementById('edit-location').value = job.location || '';
  document.getElementById('edit-status').value = job.status || 'Applied';
  document.getElementById('edit-notes').value = job.notes || '';
  document.getElementById('edit-followup').value = job.followup || '';
  
  // Show modal with smooth animation
  const modal = document.getElementById('editModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';  // ✅ Prevent body scroll
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';  // ✅ Restore body scroll
  editingIndex = -1;
}


// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  updateSidebarUser();
  
  const page = document.body.dataset.page;
  if (page === 'dashboard') {
    initSearchFilter();
    renderJobs();
  }
  
  // Global Enter key for login
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('password')?.matches(':focus')) {
      login();
    }
  });
});

// Load initial data from jobs.json if localStorage empty (for demo)
if (jobs.length === 0) {
  const demoJobs = [
    {company: "Zoho", role: "Software Engineer", location: "Chennai", status: "Applied", notes: "Applied via LinkedIn. HR contact: priya@zoho.com", followup: "2026-04-01"},
    {company: "Freshworks", role: "Frontend Developer", location: "Chennai", status: "Interview", notes: "Technical round on April 5th, prepare system design", followup: "2026-04-05"},
    {company: "TCS", role: "Associate Engineer", location: "Bangalore", status: "Rejected", notes: "Failed the aptitude round", followup: ""}
  ];
  jobs = demoJobs;
  localStorage.setItem('jobs', JSON.stringify(jobs));
}
