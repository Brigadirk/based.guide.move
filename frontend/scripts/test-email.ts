import fetch from 'node-fetch';

async function testEmail() {
  try {
    console.log('Testing email endpoint...');
    const response = await fetch('http://localhost:3000/api/test/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail(); 