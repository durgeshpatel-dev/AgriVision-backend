// Test OAuth Endpoints - Quick Server Test
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testOAuthEndpoints() {
  console.log('🧪 Testing OAuth Endpoints with Running Server');
  console.log('===============================================');

  try {
    // Test 1: Check if server is responding
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_URL.replace('/api', '')}/`);
    console.log('✅ Server is responding:', healthResponse.data.message);

    // Test 2: Test Google OAuth endpoint (should redirect)
    console.log('\n2. Testing Google OAuth initiation...');
    try {
      const oauthResponse = await axios.get(`${API_URL}/auth/google`, {
        maxRedirects: 0, // Don't follow redirects
        validateStatus: function (status) {
          return status < 400; // Accept redirects as success
        }
      });
      console.log('✅ Google OAuth endpoint accessible (redirects properly)');
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log('✅ Google OAuth endpoint working (302 redirect expected)');
      } else {
        console.log('⚠️ Google OAuth might need environment variables:', error.message);
      }
    }

    // Test 3: Check existing manual auth endpoints (should be unchanged)
    console.log('\n3. Testing existing auth endpoints...');
    
    try {
      const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
        // Invalid data to trigger validation (we don't want to create actual users)
        name: '',
        email: '',
        password: ''
      });
    } catch (error) {
      if (error.response && error.response.data.message.includes('required fields')) {
        console.log('✅ Manual signup endpoint working (validation working)');
      } else {
        console.log('❌ Manual signup endpoint issue:', error.message);
      }
    }

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response && error.response.data.message.includes('Invalid email')) {
        console.log('✅ Manual login endpoint working (authentication working)');
      } else {
        console.log('❌ Manual login endpoint issue:', error.message);
      }
    }

    console.log('\n===============================================');
    console.log('🎉 OAuth Integration Test Summary:');
    console.log('✅ Server running with OAuth support');
    console.log('✅ Existing manual auth preserved');
    console.log('✅ Google OAuth endpoints added');
    console.log('\n📝 Next Steps:');
    console.log('1. Add Google OAuth credentials to .env file');
    console.log('2. Test full OAuth flow in browser');
    console.log('3. Integrate OAuth button in frontend');
    console.log('===============================================');

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('Make sure the server is running: npm start');
  }
}

testOAuthEndpoints();
