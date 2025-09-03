// Test API Signup to simulate frontend integration
require('dotenv').config();
const axios = require('axios');

async function testSignupAPI() {
  console.log('🧪 === TESTING SIGNUP API (Frontend Simulation) ===\n');
  
  const API_BASE_URL = 'http://localhost:5001';
  
  const testUser = {
    name: 'Frontend Test User',
    email: `test${Date.now()}@example.com`, // Unique email each time
    password: 'testpassword123',
    farmDetails: {
      farmSize: '10 acres',
      location: 'Test Farm Location',
      cropTypes: ['wheat', 'corn']
    }
  };

  console.log('📋 Test User Data:');
  console.log(JSON.stringify(testUser, null, 2));
  console.log('\n🚀 Making API call to signup endpoint...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('\n✅ API Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ API Call Failed:');
    console.error('Full error object:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
    } else {
      console.error('Error:', error.message);
      console.error('Error stack:', error.stack);
    }
  }

  console.log('\n🏁 === API TEST COMPLETED ===');
}

// Run the test
testSignupAPI().catch(error => {
  console.error('💥 Test script failed:', error);
});
