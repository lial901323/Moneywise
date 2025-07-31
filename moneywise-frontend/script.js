const API_URL = 'https://moneywise-backend.onrender.com/api/auth';

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('admintoken');

  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('remember');
  console.log("Admin Dashboard JS loaded");


  if (savedEmail && savedPassword && loginEmailInput && loginPasswordInput && rememberCheckbox) {
    loginEmailInput.value = savedEmail;
    loginPasswordInput.value = savedPassword;
    rememberCheckbox.checked = true;
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('signup-username').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;

      if (password !== confirm) {
        document.getElementById('signup-msg').innerText = 'Passwords do not match';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          document.getElementById('signup-msg').innerText = 'Account created!';
          window.location.href = 'index.html';
        } else {
          document.getElementById('signup-msg').innerText = data.message || 'Error';
        }
      } catch {
        document.getElementById('signup-msg').innerText = 'Server error';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const remember = rememberCheckbox?.checked;

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.user.role === 'user') {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('role', data.user.role);

          if (remember) {
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedPassword', password);
          } else {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPassword');
          }

          window.location.href = 'user-home.html';
        } else if (res.ok) {
          document.getElementById('login-msg').innerText = 'Admins cannot log in from here.';
        } else {
          document.getElementById('login-msg').innerText = data.message || 'Wrong username or password';
        }
      } catch {
        document.getElementById('login-msg').innerText = 'Server error';
      }
    });
  }

  if (window.location.pathname.includes('admin-dashboard.html')) {
    if (token) {
      fetch('https://moneywise-backend.onrender.com/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const totalUsers = document.getElementById('total-users');
          const newCustomers = document.getElementById('new-customers');
          const totalDeposits = document.getElementById('total-deposits-value');

          if (totalUsers) totalUsers.innerText = data.totalUsers;
          if (newCustomers) newCustomers.innerText = data.newCustomers;
          if (totalDeposits) totalDeposits.innerText = `₪${(data.totalDeposits / 1000).toFixed(1)}k`;
        })
        .catch(err => console.error('Error fetching stats:', err));
    }
  }





  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (window.location.pathname.includes('admin-dashboard')) {
    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    fetch('https://moneywise-backend.onrender.com/api/auth/admin-dashboard', {
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

      })
      .catch(err => {
        console.error(err);
        window.location.href = 'index.html';
      });
  }




  window.searchUser = async function () {
    const userId = document.getElementById('searchUserId').value;
    const token = localStorage.getItem('admintoken');
    const message = document.getElementById('searchMessage');
    const userInfo = document.getElementById('userInfo');

    if (!userId) {
      message.innerText = 'Please enter a User ID';
      userInfo.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`https://moneywise-backend.onrender.com/api/admin/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });


      const data = await response.json();

      if (response.ok) {
        document.getElementById('userName').innerText = data.username || 'N/A';
        document.getElementById('userEmail').innerText = data.email || 'N/A';
        document.getElementById('userBalance').innerText = data.balance || 0;
        message.innerText = '';
        userInfo.style.display = 'block';
        window.currentUserId = userId;
      } else {
        message.innerText = data.message || 'User not found';
        userInfo.style.display = 'none';
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      message.innerText = 'Error fetching user data';
      userInfo.style.display = 'none';
    }
  };





  window.deleteUser = async function () {
    const token = localStorage.getItem('admintoken');
    const message = document.getElementById('searchMessage');

    try {
      const response = await fetch(`https://moneywise-backend.onrender.com/api/admin/users/${window.currentUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        alert('User deleted successfully');
        document.getElementById('userInfo').style.display = 'none';
        message.innerText = '';
      } else {
        message.innerText = data.message || 'Failed to delete user';
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      message.innerText = 'Error deleting user';
    }
  };


  let showingAll = false;
  let expandedRow = null;

  const fetchTopUsers = async (showAll = false) => {
    console.log('Fetching users...');
    const token = localStorage.getItem('admintoken');
    try {
      const endpoint = showAll
        ? 'https://moneywise-backend.onrender.com/api/admin/users'
        : 'https://moneywise-backend.onrender.com/api/admin/top-users';

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch users');

      let data = await res.json();

      if (showAll) {
        data = data.sort((a, b) => (b.balance || 0) - (a.balance || 0));
      }

      const tbody = document.getElementById('topUsersList');
      tbody.innerHTML = '';

      data.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${index + 1}</td>
                <td class="username-cell">${user.username || 'Unknown'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>₪${(user.balance || 0).toFixed(2)}</td>
            `;

        row.addEventListener('click', () => toggleDetails(row, user));
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };




  const toggleDetails = (row, user) => {
    if (expandedRow === row) {
      row.nextSibling?.remove();
      expandedRow = null;
      return;
    }

    if (expandedRow) {
      expandedRow.nextSibling?.remove();
    }

    const detailsRow = document.createElement('tr');
    const detailsCell = document.createElement('td');
    detailsCell.colSpan = 4;
    detailsCell.innerHTML = `
        <div class="user-details">
            <p><strong>User ID:</strong> ${user._id}</p>
            <p><strong>Username:</strong> ${user.username || 'Unknown'}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Balance:</strong> ₪${(user.balance || 0).toFixed(2)}</p>
            <p><strong>Role:</strong> ${user.role || 'N/A'}</p>
        </div>
    `;
    detailsRow.appendChild(detailsCell);

    row.insertAdjacentElement('afterend', detailsRow);
    expandedRow = row;
  };


  document.getElementById('viewAllBtn').addEventListener('click', () => {
    showingAll = !showingAll;
    document.getElementById('viewAllBtn').innerText = showingAll ? 'Show Top 5' : 'View All Users';
    fetchTopUsers(showingAll);
  });











  const ctx = document.getElementById('weeklyChart').getContext('2d');
  const weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{
        label: '₪ Deposits',
        data: [],
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, '#00FF66');
          gradient.addColorStop(1, '#0066FF');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `₪${ctx.raw}` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (val) => `₪${val}` }
        }
      }
    }
  });

  async function fetchWeeklyData() {
    const token = localStorage.getItem('admintoken');
    const res = await fetch('https://moneywise-backend.onrender.com/api/admin/deposits/weekly', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    const deposits = new Array(7).fill(0);
    data.forEach(item => {
      deposits[item._id - 1] = item.total;
    });

    weeklyChart.data.datasets[0].data = deposits;
    weeklyChart.update();
  }









  const fetchTop3UsersStats = async () => {
    const token = localStorage.getItem('admintoken');
    const response = await fetch('https://moneywise-backend.onrender.com/api/admin/top3-users-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    const usernames = data.map(user => user.username);
    const expenses = data.map(user => user.expenses);
    const incomes = data.map(user => user.income);

    const ctx = document.getElementById('top3UsersChart').getContext('2d');

    const gradientIncome = ctx.createLinearGradient(0, 0, 0, 200);
    gradientIncome.addColorStop(0, '#00FF66');
    gradientIncome.addColorStop(1, '#0066FF');

    const gradientExpenses = ctx.createLinearGradient(0, 0, 0, 200);
    gradientExpenses.addColorStop(0, '#FF8A9A');
    gradientExpenses.addColorStop(1, '#FF0000');

    if (window.top3ChartInstance) {
      window.top3ChartInstance.data.labels = usernames;
      window.top3ChartInstance.data.datasets[0].data = expenses;
      window.top3ChartInstance.data.datasets[1].data = incomes;
      window.top3ChartInstance.update();
    } else {
      window.top3ChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: usernames,
          datasets: [
            {
              label: 'Expenses',
              data: expenses,
              backgroundColor: gradientExpenses,
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: 0.4
            },
            {
              label: 'Income',
              data: incomes,
              backgroundColor: gradientIncome,
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: '#fff',
                generateLabels: function (chart) {
                  const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                  labels.forEach(label => {
                    if (label.text === 'Income') {
                      label.fillStyle = '#00c6ff';
                    }
                    if (label.text === 'Expenses') {
                      label.fillStyle = '#FF4B5C';
                    }
                  });
                  return labels;
                }
              },
              position: 'bottom'
            },
            tooltip: { callbacks: { label: (ctx) => `₪${ctx.raw}` } }
          },
          scales: {
            x: {
              ticks: { color: '#fff' },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff', callback: (val) => `₪${val}` },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          animation: { duration: 1000, easing: 'easeOutQuart' }
        }
      });
    }
  };







  const fetchGrowthRate = async () => {
    const token = localStorage.getItem('admintoken');
    try {
      const res = await fetch('https://moneywise-backend.onrender.com/api/admin/growth-rate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      document.getElementById('growth-rate').innerText = `${data.growthRate.toFixed(2)}%`;
    } catch (err) {
      console.error('Error fetching growth rate:', err);
    }
  };













  const fetchRecentTransactions = async () => {
    const token = localStorage.getItem('admintoken');
    try {
      const res = await fetch('https://moneywise-backend.onrender.com/api/admin/recent-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = document.getElementById('recent-transactions');
      list.innerHTML = '';
      data.forEach(tx => {
        const li = document.createElement('li');
        li.textContent = `${tx.type} - ₪${tx.amount} (${new Date(tx.createdAt).toLocaleDateString()})`;
        list.appendChild(li);
      });
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
    }
  };










  const ctxTransactions = document.getElementById('transactionsChart').getContext('2d');
  let transactionsChart = new Chart(ctxTransactions, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Amount (₪)',
        data: [],
        backgroundColor: '#FF8A9A',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  async function fetchTransactionsChart() {
    const token = localStorage.getItem('admintoken');
    const res = await fetch('https://moneywise-backend.onrender.com/api/admin/recent-transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    transactionsChart.data.labels = data.map(tx => new Date(tx.createdAt).toLocaleDateString());
    transactionsChart.data.datasets[0].data = data.map(tx => tx.amount);
    transactionsChart.update();
  }




  async function fetchGrowthChart() {
    const token = localStorage.getItem('admintoken');
    const ctxGrowth = document.getElementById('growthRateChart').getContext('2d');

    try {
      const res = await fetch('https://moneywise-backend.onrender.com/api/admin/growth-rate/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const labels = data.map(item => new Date(item.date).toLocaleDateString());
      const rates = data.map(item => item.rate);

      if (window.growthChart) {
        window.growthChart.data.labels = labels;
        window.growthChart.data.datasets[0].data = rates;
        window.growthChart.update();
      } else {
        window.growthChart = new Chart(ctxGrowth, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Growth Rate %',
              data: rates,
              borderColor: '#00FF66',
              backgroundColor: 'rgba(0, 255, 102, 0.2)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { labels: { color: '#fff' } },
              tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
            },
            scales: {
              x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
              y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
            }
          }
        });
      }
    } catch (err) {
      console.error('Error fetching Growth Chart:', err);
    }
  }







  fetchTopUsers();
  fetchWeeklyData();
  fetchTop3UsersStats();
  fetchGrowthRate();
  fetchRecentTransactions();
  fetchTransactionsChart();
  fetchGrowthChart();

  setInterval(() => {
    fetchWeeklyData();
    fetchTop3UsersStats();
    fetchGrowthRate();
    fetchRecentTransactions();
    fetchTransactionsChart();
    fetchGrowthChart();
  }, 5000);


});


