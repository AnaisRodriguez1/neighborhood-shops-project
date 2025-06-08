const fetch = require('node-fetch');

async function getToken() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'presidente@test.com',
        password: 'Password123'
      })
    });

    const data = await response.json();
    console.log('Login Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      return data.token;
    } else {
      console.log('❌ Login failed');
      console.log('Response:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

getToken();
