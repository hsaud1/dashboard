/* ============================================================
   DataBoard Pro — script.js
   Full interactive dashboard: charts, modals, CRUD, toasts
   ============================================================ */

// ========================
// STATE
// ========================
const state = {
  kpi: { revenue: 84250, expenses: 31800, users: 1247, sessions: 582 },
  barData: [52, 61, 48, 70, 83, 75, 90, 68, 77, 84, 95, 102],
  donutData: [
    { label: 'Organic',  value: 38, color: '#00f5a0' },
    { label: 'Social',   value: 27, color: '#38bdf8' },
    { label: 'Direct',   value: 21, color: '#ffbe3d' },
    { label: 'Referral', value: 14, color: '#ff5f7e' },
  ],
  transactions: [
    { id: 1, item: 'Pro Plan',     date: 'Mar 3',  amount: 299,  status: 'Paid' },
    { id: 2, item: 'Starter Pack', date: 'Mar 2',  amount: 49,   status: 'Paid' },
    { id: 3, item: 'API Credits',  date: 'Mar 1',  amount: 120,  status: 'Pending' },
    { id: 4, item: 'Enterprise',   date: 'Feb 28', amount: 999,  status: 'Paid' },
    { id: 5, item: 'Refund',       date: 'Feb 27', amount: -49,  status: 'Refunded' },
  ],
  goals: [
    { id: 1, name: 'Revenue Target',        pct: 84, color: '#00f5a0' },
    { id: 2, name: 'User Signups',          pct: 62, color: '#38bdf8' },
    { id: 3, name: 'Churn Reduction',       pct: 91, color: '#ffbe3d' },
    { id: 4, name: 'Support Tickets Closed',pct: 47, color: '#ff5f7e' },
  ],
  notifications: [
    { text: 'Revenue milestone reached: $80k!' },
    { text: 'New user signed up just now.' },
    { text: 'API Credits payment pending.' },
  ],
  profile: { name: 'John Doe', initials: 'JD', role: 'Admin' },
  nextId: 10,
  selectedGoalColor: '#00f5a0',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ========================
// UTILITIES
// ========================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function fmt(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1000) return sign + '$' + (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1) + 'k';
  return sign + (Number.isInteger(n) ? n.toLocaleString() : n);
}

function fmtKpi(key, val) {
  if (key === 'revenue' || key === 'expenses') return '$' + val.toLocaleString();
  return val.toLocaleString();
}

function badgeClass(status) {
  if (status === 'Paid')     return 'badge-green';
  if (status === 'Refunded') return 'badge-red';
  return 'badge-yellow';
}

// ========================
// SIDEBAR TOGGLE
// ========================
const sidebar = document.getElementById('sidebar');
const mainEl  = document.getElementById('main');

document.getElementById('menu-btn').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  mainEl.classList.toggle('full');
});

// ========================
// PAGE NAVIGATION
// ========================
const pageTitleEl = document.getElementById('page-title');

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const pageId = item.dataset.page;
    pageTitleEl.textContent = item.querySelector('span:last-child').textContent.trim();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
  });
});

// ========================
// KPI RENDERING
// ========================
const sparkData = {
  revenue:  [40, 55, 45, 60, 72, 68, 80, 74, 84, 90, 88, 95],
  expenses: [28, 32, 29, 35, 30, 38, 33, 36, 31, 34, 32, 31],
  users:    [80, 95, 70, 110, 130, 120, 145, 115, 125, 140, 155, 162],
  sessions: [300, 350, 280, 420, 480, 450, 520, 440, 490, 510, 560, 582],
};
const sparkColors = { revenue: '#00f5a0', expenses: '#ff5f7e', users: '#ffbe3d', sessions: '#38bdf8' };

function renderKpis() {
  const keys = ['revenue', 'expenses', 'users', 'sessions'];
  keys.forEach(key => {
    const el = document.getElementById('kpi-' + key);
    if (el) el.textContent = fmtKpi(key, state.kpi[key]);
    renderSparkline(key);
  });
}

function renderSparkline(key) {
  const container = document.getElementById('spark-' + key);
  if (!container) return;
  container.innerHTML = '';
  const data = sparkData[key];
  const max = Math.max(...data);
  data.forEach(v => {
    const bar = document.createElement('div');
    bar.className = 'spark-bar';
    bar.style.height = Math.max(10, (v / max) * 100) + '%';
    bar.style.background = sparkColors[key];
    container.appendChild(bar);
  });
}

renderKpis();

// ========================
// BAR CHART (Canvas)
// ========================
const barCanvas = document.getElementById('bar-canvas');
const barCtx    = barCanvas.getContext('2d');
let hoveredBar  = -1;

function resizeBarCanvas() {
  barCanvas.width  = barCanvas.parentElement.clientWidth - 48;
  barCanvas.height = 180;
  drawBar();
}

function drawBar() {
  const w = barCanvas.width, h = barCanvas.height;
  barCtx.clearRect(0, 0, w, h);
  const data = state.barData;
  const max  = Math.max(...data);
  const n    = data.length;
  const padL = 8, padR = 8, padT = 16, padB = 24;
  const availW = w - padL - padR;
  const availH = h - padT - padB;
  const barW   = (availW / n) * 0.55;
  const gap    = (availW / n) * 0.45;

  const colors = ['#00f5a0','#38bdf8','#ffbe3d','#ff5f7e','#c084fc','#00f5a0','#38bdf8','#ffbe3d','#ff5f7e','#c084fc','#00f5a0','#38bdf8'];

  data.forEach((v, i) => {
    const x   = padL + i * (barW + gap) + gap / 2;
    const bh  = (v / max) * availH;
    const y   = padT + availH - bh;
    const col = colors[i % colors.length];
    const opa = hoveredBar === -1 ? 0.85 : (hoveredBar === i ? 1 : 0.35);

    barCtx.globalAlpha = opa;
    barCtx.fillStyle   = hoveredBar === i ? col : col + 'cc';

    // Rounded top
    const rad = 5;
    barCtx.beginPath();
    barCtx.moveTo(x + rad, y);
    barCtx.lineTo(x + barW - rad, y);
    barCtx.quadraticCurveTo(x + barW, y, x + barW, y + rad);
    barCtx.lineTo(x + barW, y + bh);
    barCtx.lineTo(x, y + bh);
    barCtx.lineTo(x, y + rad);
    barCtx.quadraticCurveTo(x, y, x + rad, y);
    barCtx.closePath();
    barCtx.fill();

    // Month label
    barCtx.globalAlpha = 0.55;
    barCtx.fillStyle   = '#8899bb';
    barCtx.font        = '10px JetBrains Mono, monospace';
    barCtx.textAlign   = 'center';
    barCtx.fillText(MONTHS[i], x + barW / 2, h - 6);
  });
  barCtx.globalAlpha = 1;
}

window.addEventListener('resize', resizeBarCanvas);
resizeBarCanvas();

// Bar hover + tooltip
barCanvas.addEventListener('mousemove', e => {
  const rect = barCanvas.getBoundingClientRect();
  const mx   = e.clientX - rect.left;
  const data = state.barData;
  const n    = data.length;
  const w    = barCanvas.width;
  const padL = 8, padR = 8;
  const availW = w - padL - padR;
  const barW   = (availW / n) * 0.55;
  const gap    = (availW / n) * 0.45;

  let found = -1;
  data.forEach((_, i) => {
    const x = padL + i * (barW + gap) + gap / 2;
    if (mx >= x && mx <= x + barW) found = i;
  });

  if (found !== hoveredBar) {
    hoveredBar = found;
    drawBar();
  }

  const tooltip = document.getElementById('chart-tooltip');
  if (found !== -1) {
    tooltip.style.opacity = '1';
    tooltip.style.left    = (e.clientX - barCanvas.getBoundingClientRect().left - 40) + 'px';
    tooltip.style.top     = '60px';
    tooltip.textContent   = MONTHS[found] + ': $' + state.barData[found] + 'k';
  } else {
    tooltip.style.opacity = '0';
  }
});

barCanvas.addEventListener('mouseleave', () => {
  hoveredBar = -1;
  drawBar();
  document.getElementById('chart-tooltip').style.opacity = '0';
});

// ========================
// DONUT CHART (Canvas)
// ========================
function drawDonut() {
  const canvas = document.getElementById('donut-canvas');
  const ctx    = canvas.getContext('2d');
  const cx = 90, cy = 90, r = 78, inner = 52;
  const data   = state.donutData;
  const total  = data.reduce((s, d) => s + d.value, 0);
  ctx.clearRect(0, 0, 180, 180);

  let startAngle = -Math.PI / 2;
  data.forEach((slice, i) => {
    const angle = (slice.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#0f1420';
    ctx.globalAlpha = 1;
    ctx.fill();

    startAngle += angle;
  });

  renderDonutLegend();
}

function renderDonutLegend() {
  const legend = document.getElementById('donut-legend');
  const total  = state.donutData.reduce((s, d) => s + d.value, 0);
  legend.innerHTML = '';
  state.donutData.forEach(slice => {
    legend.innerHTML += `
      <div class="legend-item">
        <div class="legend-dot" style="background:${slice.color}"></div>
        <span>${slice.label}</span>
        <span>${Math.round(slice.value / total * 100)}%</span>
      </div>`;
  });
}

drawDonut();

// ========================
// TRANSACTIONS TABLE
// ========================
function renderTransactions(filter = '') {
  const tbody = document.getElementById('txn-body');
  const rows  = state.transactions.filter(t =>
    t.item.toLowerCase().includes(filter.toLowerCase()) ||
    t.status.toLowerCase().includes(filter.toLowerCase())
  );
  tbody.innerHTML = rows.map(t => `
    <tr>
      <td>${t.item}</td>
      <td style="color:var(--muted2)">${t.date}</td>
      <td style="font-family:'JetBrains Mono',monospace;color:${t.amount < 0 ? 'var(--rose)' : 'var(--text)'}">
        ${t.amount < 0 ? '-$' + Math.abs(t.amount) : '$' + t.amount}
      </td>
      <td><span class="badge ${badgeClass(t.status)}">${t.status}</span></td>
      <td><button class="del-btn" data-id="${t.id}">✕ Delete</button></td>
    </tr>`).join('');

  // Delete handlers
  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      state.transactions = state.transactions.filter(t => t.id !== id);
      renderTransactions(document.getElementById('search-input').value);
      addNotification('Transaction deleted.');
      showToast('Transaction deleted.');
    });
  });
}

renderTransactions();

// Search
document.getElementById('search-input').addEventListener('input', e => {
  renderTransactions(e.target.value);
});

// ========================
// GOALS
// ========================
function renderGoals() {
  const list = document.getElementById('goals-list');
  list.innerHTML = '';
  state.goals.forEach(g => {
    const div = document.createElement('div');
    div.className = 'goal-item';
    div.innerHTML = `
      <div class="goal-row">
        <span class="goal-name">${g.name}</span>
        <span class="goal-pct">${g.pct}%</span>
        <button class="goal-del" data-id="${g.id}">✕</button>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:0%;background:${g.color}" data-w="${g.pct}"></div>
      </div>`;
    list.appendChild(div);
    setTimeout(() => {
      div.querySelector('.progress-fill').style.width = g.pct + '%';
    }, 50);
    div.querySelector('.goal-del').addEventListener('click', () => {
      state.goals = state.goals.filter(x => x.id !== g.id);
      renderGoals();
      showToast('Goal removed.');
    });
  });
}

renderGoals();

// ========================
// ANALYTICS AUTO-UPDATE
// ========================
function jitter(base, range) {
  return (base + (Math.random() - 0.5) * range).toFixed(1);
}
setInterval(() => {
  if (!document.getElementById('page-analytics').classList.contains('active')) return;
  document.getElementById('stat-bounce').textContent  = jitter(42, 6)  + '%';
  document.getElementById('stat-conv').textContent    = jitter(6.8, 1) + '%';
  document.getElementById('stat-pages').textContent   = jitter(4.2, 0.8);
}, 5000);

// ========================
// MODALS — close buttons
// ========================
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ========================
// ADD DATA BUTTON
// ========================
document.getElementById('add-btn').addEventListener('click', () => openModal('modal-add'));

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.closest('.modal');
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ========================
// SAVE KPI
// ========================
document.getElementById('save-kpi-btn').addEventListener('click', () => {
  const key = document.getElementById('kpi-select').value;
  const val = parseFloat(document.getElementById('kpi-input').value);
  if (isNaN(val) || val < 0) { showToast('⚠ Enter a valid number.'); return; }
  state.kpi[key] = val;
  renderKpis();
  closeModal('modal-add');
  showToast('✓ KPI updated!');
  addNotification(`KPI "${key}" updated to ${fmtKpi(key, val)}.`);
});

// ========================
// SAVE TRANSACTION
// ========================
document.getElementById('save-txn-btn').addEventListener('click', () => {
  const item   = document.getElementById('txn-item').value.trim();
  const amount = parseFloat(document.getElementById('txn-amount').value);
  const status = document.getElementById('txn-status').value;
  if (!item) { showToast('⚠ Enter an item name.'); return; }
  if (isNaN(amount)) { showToast('⚠ Enter a valid amount.'); return; }

  const now = new Date();
  state.transactions.unshift({
    id: state.nextId++,
    item,
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount,
    status,
  });
  renderTransactions();
  closeModal('modal-add');
  showToast('✓ Transaction added!');
  addNotification(`New transaction: ${item} ($${amount})`);
  document.getElementById('txn-item').value   = '';
  document.getElementById('txn-amount').value = '';
});

// ========================
// SAVE GOAL
// ========================
document.getElementById('save-goal-btn').addEventListener('click', () => {
  const name = document.getElementById('goal-name').value.trim();
  const pct  = parseInt(document.getElementById('goal-progress').value);
  if (!name) { showToast('⚠ Enter a goal name.'); return; }
  if (isNaN(pct) || pct < 0 || pct > 100) { showToast('⚠ Progress must be 0–100.'); return; }

  state.goals.push({ id: state.nextId++, name, pct, color: state.selectedGoalColor });
  renderGoals();
  closeModal('modal-add');
  showToast('✓ Goal added!');
  document.getElementById('goal-name').value     = '';
  document.getElementById('goal-progress').value = '';
});

// Color picker
document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
    state.selectedGoalColor = dot.dataset.color;
  });
});

// ========================
// ADD GOAL / TXN buttons (pages)
// ========================
document.getElementById('add-txn-btn').addEventListener('click', () => {
  openModal('modal-add');
  // Switch to txn tab
  document.querySelectorAll('#modal-add .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#modal-add .tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="tab-txn"]').classList.add('active');
  document.getElementById('tab-txn').classList.add('active');
});

document.getElementById('add-goal-btn').addEventListener('click', () => {
  openModal('modal-add');
  document.querySelectorAll('#modal-add .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#modal-add .tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="tab-goal"]').classList.add('active');
  document.getElementById('tab-goal').classList.add('active');
});

// ========================
// EDIT BAR CHART
// ========================
document.getElementById('edit-chart-btn').addEventListener('click', () => {
  const grid = document.getElementById('chart-edit-grid');
  grid.innerHTML = '';
  state.barData.forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'chart-edit-item';
    div.innerHTML = `<label>${MONTHS[i]}</label><input type="number" value="${v}" min="0" id="cedit-${i}"/>`;
    grid.appendChild(div);
  });
  openModal('modal-chart');
});

document.getElementById('save-chart-btn').addEventListener('click', () => {
  let valid = true;
  state.barData = state.barData.map((_, i) => {
    const val = parseFloat(document.getElementById('cedit-' + i).value);
    if (isNaN(val) || val < 0) { valid = false; return _; }
    return val;
  });
  if (!valid) { showToast('⚠ All values must be positive numbers.'); return; }
  drawBar();
  closeModal('modal-chart');
  showToast('✓ Chart updated!');
});

document.getElementById('year-select').addEventListener('change', e => {
  document.getElementById('chart-year').textContent = e.target.value;
  // Randomise data for fun
  state.barData = state.barData.map(() => Math.floor(30 + Math.random() * 90));
  drawBar();
  showToast('Showing data for ' + e.target.value);
});

// ========================
// EDIT DONUT
// ========================
document.getElementById('edit-donut-btn').addEventListener('click', () => {
  const list = document.getElementById('donut-edit-list');
  list.innerHTML = '';
  state.donutData.forEach((s, i) => {
    list.innerHTML += `
      <div class="donut-edit-item">
        <div class="donut-edit-dot" style="background:${s.color}"></div>
        <span class="donut-edit-label">${s.label}</span>
        <input type="number" id="dedit-${i}" value="${s.value}" min="1" max="100"/>
      </div>`;
  });
  openModal('modal-donut');
});

document.getElementById('save-donut-btn').addEventListener('click', () => {
  let valid = true;
  state.donutData = state.donutData.map((s, i) => {
    const val = parseFloat(document.getElementById('dedit-' + i).value);
    if (isNaN(val) || val <= 0) { valid = false; return s; }
    return { ...s, value: val };
  });
  if (!valid) { showToast('⚠ Values must be positive.'); return; }
  drawDonut();
  closeModal('modal-donut');
  showToast('✓ Traffic sources updated!');
});

// ========================
// NOTIFICATIONS
// ========================
function addNotification(text) {
  state.notifications.unshift({ text });
  updateNotifBadge();
}

function updateNotifBadge() {
  document.getElementById('notif-badge').textContent = state.notifications.length;
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  list.innerHTML = '';
  if (state.notifications.length === 0) {
    list.innerHTML = '<div style="padding:1rem;font-size:0.8rem;color:var(--muted);text-align:center;">All caught up! 🎉</div>';
    return;
  }
  state.notifications.forEach(n => {
    list.innerHTML += `<div class="notif-item"><div class="notif-dot"></div>${n.text}</div>`;
  });
}

document.getElementById('notif-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const panel = document.getElementById('notif-panel');
  renderNotifications();
  panel.classList.toggle('open');
});

document.getElementById('clear-notifs').addEventListener('click', () => {
  state.notifications = [];
  updateNotifBadge();
  renderNotifications();
  document.getElementById('notif-badge').textContent = '0';
});

document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  if (!panel.contains(e.target) && e.target !== document.getElementById('notif-btn')) {
    panel.classList.remove('open');
  }
});

updateNotifBadge();

// ========================
// PROFILE EDIT
// ========================
document.querySelector('.sidebar-user').addEventListener('click', () => {
  document.getElementById('profile-name').value = state.profile.name;
  document.getElementById('profile-role').value = state.profile.role;
  openModal('modal-profile');
});

document.getElementById('save-profile-btn').addEventListener('click', () => {
  const name = document.getElementById('profile-name').value.trim();
  const role = document.getElementById('profile-role').value.trim();
  if (!name) { showToast('⚠ Name cannot be empty.'); return; }
  state.profile.name = name;
  state.profile.role = role;
  state.profile.initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  document.getElementById('user-name-display').textContent = name;
  document.getElementById('user-avatar').textContent = state.profile.initials;
  document.querySelector('.user-role').textContent = role || 'User';
  closeModal('modal-profile');
  showToast('✓ Profile updated!');
});

// ========================
// KPI CARD CLICK — quick edit
// ========================
document.querySelectorAll('.kpi-card').forEach((card, i) => {
  const keys = ['revenue', 'expenses', 'users', 'sessions'];
  card.addEventListener('click', () => {
    openModal('modal-add');
    // Switch to KPI tab
    document.querySelectorAll('#modal-add .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#modal-add .tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="tab-kpi"]').classList.add('active');
    document.getElementById('tab-kpi').classList.add('active');
    document.getElementById('kpi-select').value = keys[i];
    document.getElementById('kpi-input').value  = state.kpi[keys[i]];
    document.getElementById('kpi-input').focus();
  });
});

// ========================
// DATE in topbar title area
// ========================
(function setDate() {
  const d = new Date();
  document.title = 'DataBoard Pro — ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
})();
