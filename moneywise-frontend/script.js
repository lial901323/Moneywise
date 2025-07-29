const API_URL = 'http://localhost:5000/api/auth';

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'user-login.html';
    return;
  }

  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('remember');

  if (savedEmail && savedPassword && loginEmailInput && loginPasswordInput && rememberCheckbox) {
    loginEmailInput.value = savedEmail;
    loginPasswordInput.value = savedPassword;
    rememberCheckbox.checked = true;
  }

  function loadTopUsers() {
    fetch('http://localhost:5000/api/admin/top-users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(users => {
        const list = document.getElementById('topUsersList');
        if (!list) return;
        list.innerHTML = '';
        users.forEach(user => {
          const li = document.createElement('li');
          li.innerHTML = `
            ${user.email} (${user.totalActivity} actions)
            <button onclick="viewUserDetails('${user._id}')">View</button>
            <button onclick="deleteUser('${user._id}')">Delete</button>
          `;
          list.appendChild(li);
        });
      });
  }

  function loadUserActivityChart() {
    fetch('http://localhost:5000/api/admin/top-users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(users => {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        const chartData = {
          labels: users.map(u => u.email),
          datasets: [{
            label: 'Activity Count',
            data: users.map(u => u.totalActivity),
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        };
        new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: { responsive: true }
        });
      });
  }

  window.viewUserDetails = function (userId) {
    fetch(`http://localhost:5000/api/admin/users/${userId}/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const div = document.getElementById('userDetails');
        if (!div) return;
        div.innerHTML = `
          <h4>User Expenses (${data.expenses.length})</h4>
          <ul>${data.expenses.map(e => `<li>${e.category} - $${e.amount}</li>`).join('')}</ul>
          <h4>User Deposits (${data.deposits.length})</h4>
          <ul>${data.deposits.map(d => `<li>${d.source} - $${d.amount}</li>`).join('')}</ul>
        `;
      });
  };

  window.deleteUser = function (userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        loadTopUsers();
        loadUserActivityChart();
      });
  };

  window.deleteUserFromCard = function () {
    const userId = document.getElementById('deleteUserId')?.value;
    if (!userId) return alert("Please enter a User ID");
    deleteUser(userId);
  };

  const viewAllBtn = document.getElementById('viewAllBtn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(users => {
          const div = document.getElementById('userDetails');
          if (!div) return;
          div.innerHTML = `
            <h4>All Users:</h4>
            <ul>${users.map(u => `<li>${u.email} (${u.role})</li>`).join('')}</ul>
          `;
        });
    });
  }

  loadTopUsers();
  loadUserActivityChart();

  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  fetch('http://localhost:5000/api/auth/admin-dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error('Not authorized');
      return res.json();
    })
    .then(data => {
      const has = (perm) => data.permissions.includes(perm) || data.permissions.includes('all');

      const showOrBlur = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return;

        if (has(selector.replace('.', ''))) {
          el.classList.remove('no-access');
          const msg = el.querySelector('.blur-text');
          if (msg) msg.remove();
        } else {
          el.classList.add('no-access');
          if (!el.querySelector('.blur-text')) {
            const msg = document.createElement('div');
            msg.className = 'blur-text';
            msg.innerText = 'You are not allowed to view this';
            el.appendChild(msg);
          }
        }
      };

      showOrBlur('.card1');
      showOrBlur('.card2');
      showOrBlur('.card3');
      showOrBlur('.card4');
      showOrBlur('.card5');
      showOrBlur('.card6');

      fetch('http://localhost:5000/api/deposits/total', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const value = data.total || 0;
          const totalEl = document.getElementById('total-deposits-value');
          if (totalEl) totalEl.innerText = `$${(value / 1000).toFixed(1)}k`;
        });
    })
    .catch(err => {
      console.error(err);
      window.location.href = 'user-login.html';
    });
});
