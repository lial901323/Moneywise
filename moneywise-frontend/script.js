const API_URL = 'https://moneywise-backend.onrender.com/api/auth';

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

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
          localStorage.setItem('token', data.token);
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
      fetch('https://moneywise-backend.onrender.com/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const totalUsers = document.getElementById('total-users');
          const newCustomers = document.getElementById('new-customers');
          if (totalUsers) totalUsers.innerText = data.totalUsers;
          if (newCustomers) newCustomers.innerText = data.newCustomers;
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

        fetch('https://moneywise-backend.onrender.com/api/deposits/total')
          .then(res => res.json())
          .then(data => {
            const value = data.total || 0;
            document.getElementById('total-deposits-value').innerText = `₪${(value / 1000).toFixed(1)}k`;
          });
      })
      .catch(err => {
        console.error(err);
        window.location.href = 'index.html';
      });
  }




  window.searchUser = async function () {
    const userId = document.getElementById('searchUserId').value;
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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


  





});
