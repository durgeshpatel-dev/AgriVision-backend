require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

async function run() {
  const unique = Date.now();
  const email = `testuser${unique}@example.com`;
  const password = 'password123';

  console.log('1) Creating user via signup endpoint...');
  try {
    const signup = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Test Signup Login',
      email,
      password,
    });
    console.log('Signup response:', signup.status, signup.data);
  } catch (e) {
    console.error('Signup failed:', e.response ? e.response.data : e.message);
    return;
  }

  console.log('\n2) Attempt login (should trigger OTP email if not verified)');
  try {
    const login = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    console.log('Login response:', login.status, login.data);
  } catch (e) {
    console.error('Login response error:', e.response ? e.response.status : e.message);
    console.error('Body:', e.response ? e.response.data : 'no response body');
  }
}

run();
