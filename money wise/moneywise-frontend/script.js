const API_URL = 'http://localhost:5000/api/auth';

window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');
  if (savedEmail && savedPassword) {
    document.getElementById('login-email').value = savedEmail;
    document.getElementById('login-password').value = savedPassword;
    document.getElementById('remember').checked = true;
  }
});

// Handle Sign Up
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        console.log('Login successful');
  console.log('User role:', data.user.role);
        document.getElementById('signup-msg').innerText = 'Account created!';
        window.location.href = 'index.html';
      } else {
        document.getElementById('signup-msg').innerText = data.message || 'Error';
      }
    } catch (err) {
      document.getElementById('signup-msg').innerText = 'Server error';
    }
  });
}

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember')?.checked;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role === 'user') {
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
        } else {
          document.getElementById('login-msg').innerText = 'Admins cannot log in from here.';
        }
      } else {
        document.getElementById('login-msg').innerText = data.message || 'Invalid credentials';
      }
    } catch (err) {
      document.getElementById('login-msg').innerText = 'Server error';
    }
  });
}
