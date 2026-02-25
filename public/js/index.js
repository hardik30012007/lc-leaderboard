const API = window.location.origin; // Auto-detect from current domain
let token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check login
if (token && user.username) {
  document.getElementById('userInfo').textContent = `Hi, ${user.username}`;
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

document.getElementById('addBtn').addEventListener('click', addFriend);
document.getElementById('refreshBtn').addEventListener('click', loadLeaderboard);
document.getElementById('logoutBtn').addEventListener('click', logout);

async function logout() {
  await fetch(`${API}/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

async function addFriend() {
  const username = document.getElementById('username').value.trim();
  if (!username) return;

  try {
    await fetch(`${API}/add-friend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username })
    });

    document.getElementById('username').value = '';
    loadLeaderboard();
  } catch (err) {
    setStatus('Error adding friend');
    console.error(err);
  }
}

function createUserNode(user, rank) {
  const li = document.createElement('li');
  const rankStr = rank.toString().padStart(2, '0');
  li.className = `user rank-${rank}`;
  if (rank <= 3) li.classList.add('top-tier');

  const profileUrl = `https://leetcode.com/${encodeURIComponent(user.username)}`;

  li.innerHTML = `
    <div class="left-section">
      <div class="rank-badge">#${rankStr}</div>
      <a class="username-link" href="${profileUrl}" target="_blank">${user.username}</a>
    </div>
    <div class="stats-section">
      <div class="counts">
        <span class="easy">E: <strong>${user.easy}</strong></span>
        <span class="medium">M: <strong>${user.medium}</strong></span>
        <span class="hard">H: <strong>${user.hard}</strong></span>
      </div>
      <div class="total-score">${user.totalSolved} SOLVED</div>
      <button class="remove-btn">X</button>
    </div>
  `;

  li.querySelector('.remove-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm(`Remove ${user.username} from arena?`)) return;
    try {
      await fetch(`${API}/remove-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: user.username })
      });
      loadLeaderboard();
    } catch (err) {
      setStatus('Error removing friend');
      console.error(err);
    }
  });

  return li;
}

async function loadLeaderboard(showStatus = true) {
  try {
    if (showStatus) setStatus('Loading...');
    const res = await fetch(`${API}/leaderboard`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }
      setStatus('Error fetching leaderboard');
      return;
    }

    const data = await res.json();

    const list = document.getElementById('list');
    list.innerHTML = '';

    data.forEach((user, i) => {
      const node = createUserNode(user, i + 1);
      node.style.animationDelay = `${i * 0.1}s`;
      list.appendChild(node);
    });
    if (showStatus) setStatus('Updated');
  } catch (err) {
    setStatus('Error fetching leaderboard');
    console.error(err);
  }
}

// simple status indicator
const statusEl = document.createElement('div');
statusEl.id = 'statusEl';
const panelEl = document.querySelector('.panel');
if (panelEl) {
  panelEl.appendChild(statusEl);
}
function setStatus(msg) { statusEl.textContent = msg }

// auto-refresh every 60 seconds
setInterval(() => loadLeaderboard(false), 60000);

// initial load
loadLeaderboard();
