const axios = require('axios');

async function checkUser() {
  const email = 'adityanautiyal.23011374@gehu.ac.in';
  const password = 'password123'; // Assuming this is what the user might have used

  console.log(`--- Checking login for: ${email} ---`);

  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email, password
    });
    console.log("Login result:", loginRes.data);
  } catch (err) {
    console.error("Login failed message:", err.response?.data?.error || err.message);
  }
}

checkUser();
