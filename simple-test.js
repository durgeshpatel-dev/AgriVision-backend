// Simple test to show user email usage
const axios = require('axios');

async function simpleTest() {
  console.log('🧪 Testing user email functionality...\n');
  
  try {
    const response = await axios.post('http://localhost:5001/api/auth/signup', {
      name: 'Test User',
      email: 'testuser123@example.com',  // This is where the email will be sent
      password: 'password123',
      farmDetails: {
        farmName: 'Test Farm',
        location: 'Test Location', 
        totalArea: 10
      }
    });
    
    console.log('✅ Response:', response.data);
    
  } catch (error) {
    console.log('Response:', error.response?.data || error.message);
  }
}

simpleTest();
