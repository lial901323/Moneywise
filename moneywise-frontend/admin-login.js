const API_URL = 'https://moneywise-backend.onrender.com/api/auth';

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember').checked;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role === 'admin') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', 'admin');
          if (remember) {
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedPassword', password);
          } else {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPassword');
          }
          window.location.href = 'admin-dashboard.html';
        } else {
          document.getElementById('login-msg').innerText = 'Access denied. Admins only.';
        }
      } else {
        document.getElementById('login-msg').innerText = data.message || 'Login failed';
      }
    } catch (err) {
      document.getElementById('login-msg').innerText = 'Server error';
    }
  });
}
