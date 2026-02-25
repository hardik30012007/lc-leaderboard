const API = window.location.origin; // Auto-detect API from current domain

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      showError(data.error || 'Login failed');
      return;
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    window.location.href = 'index.html';
  } catch (err) {
    showError('Error logging in');
    console.error(err);
  }
}

async function signup() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      showError(data.error || 'Signup failed');
      return;
    }

    showSuccess('Account created! Logging in...');
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    }, 1000);
  } catch (err) {
    showError('Error signing up');
    console.error(err);
  }
}

function showMessage(msg, type) {
  const msgEl = document.getElementById('message');
  msgEl.textContent = msg;
  msgEl.className = type === 'error' ? 'error' : 'success';
}
function showError(msg) { showMessage(msg, 'error'); }
function showSuccess(msg) { showMessage(msg, 'success'); }

// If already logged in, redirect to home
if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}
