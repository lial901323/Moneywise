const API_URL = 'http://localhost:5000/api/auth';

window.addEventListener('DOMContentLoaded', () => {
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

});

// Handle Sign Up
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
      console.log(data);

      if (res.ok) {
        console.log('Signup successful');
        console.log('User role:', data.role);  // أو data.user.role حسب كيف رجّعت من السيرفر
        document.getElementById('signup-msg').innerText = 'Account created!';
        window.location.href = 'user-login.html';
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
