const axios = require('axios');

async function testAuth() {
  const email = `test${Date.now()}@gehu.ac.in`;
  const password = 'password123';
  const role = 'student';
  const name = 'Test User';
  const roll_no = 'TEST' + Math.floor(Math.random() * 1000);
  const section = 'A1';

  console.log(`--- Testing with email: ${email} ---`);

  try {
    console.log("Attempting to register...");
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      email, password, role, name, roll_no, section
    });
    console.log("Registration successful:", regRes.data);
  } catch (err) {
    console.error("Registration failed:", err.response?.data || err.message);
    return;
  }

  try {
    console.log("Attempting to login...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email, password
    });
    console.log("Login successful:", loginRes.data);
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
  }
}

testAuth();
