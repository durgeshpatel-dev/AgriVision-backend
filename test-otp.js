// OTP Verification Test Script
// Run with: node test-otp.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testOTPVerification() {
  console.log('🧪 Testing OTP Verification System...\n');

  try {
    // Step 1: Register a new user
    console.log('1️⃣ Registering new user...');
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      farmDetails: {
        farmName: 'Test Farm',
        location: 'Test City, Test State',
        totalArea: 10.5
      }
    });

    console.log('✅ Signup Response:', signupResponse.data);
    const userId = signupResponse.data.userId;

    if (!userId) {
      throw new Error('User ID not returned from signup');
    }

    // Step 2: Test missing userId (should fail)
    console.log('\n2️⃣ Testing missing userId...');
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        otp: '123456'
      });
    } catch (error) {
      console.log('✅ Expected error for missing userId:', error.response.data.message);
    }

    // Step 3: Test missing OTP (should fail)
    console.log('\n3️⃣ Testing missing OTP...');
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        userId: userId
      });
    } catch (error) {
      console.log('✅ Expected error for missing OTP:', error.response.data.message);
    }

    // Step 4: Test invalid OTP (should fail)
    console.log('\n4️⃣ Testing invalid OTP...');
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        userId: userId,
        otp: '999999'
      });
    } catch (error) {
      console.log('✅ Expected error for invalid OTP:', error.response.data.message);
    }

    // Step 5: Test resend OTP
    console.log('\n5️⃣ Testing resend OTP...');
    try {
      const resendResponse = await axios.post(`${BASE_URL}/api/auth/resend-otp`, {
        userId: userId
      });
      console.log('✅ Resend OTP Response:', resendResponse.data);
    } catch (error) {
      console.log('❌ Resend OTP Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 OTP Verification testing completed!');
    console.log('\n📝 Note: To test successful OTP verification, you would need the actual OTP from email');
    console.log('📧 Check your email for the OTP and use it in the verify-otp endpoint');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testOTPVerification();
