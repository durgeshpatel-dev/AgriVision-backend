// Quick Test with Your Email
// This will create a user with your email and send OTP to your actual email

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

async function testWithYourEmail() {
  console.log('🧪 === TESTING WITH YOUR ACTUAL EMAIL ===\n');
  
  // Using your actual email from .env
  const yourEmail = process.env.EMAIL_USER; // chaniyarapbad@gmail.com
  const testUser = {
    name: 'Test User - Your Email',
    email: yourEmail,
    password: 'password123',
    farmDetails: {
      farmName: 'Test Farm',
      location: 'Test Location',
      totalArea: 10.0
    }
  };

  console.log(`👤 Testing with your email: ${yourEmail}`);
  console.log('📧 You should receive actual emails at this address\n');

  try {
    // Check if server is running
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: 'Bearer invalid' }
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running! Please start the server first:');
        console.log('   npm start   or   node src/server.js');
        return;
      }
      console.log('✅ Server is running');
    }

    // Step 1: Try to register user (might fail if already exists)
    console.log('📝 Step 1: Attempting user registration...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
      
      console.log('✅ Signup successful!');
      console.log('📊 Response:', JSON.stringify(signupResponse.data, null, 2));
      
      if (signupResponse.data.emailSent) {
        console.log(`✅ OTP email sent to your email: ${yourEmail}`);
        console.log('📧 Check your inbox for the OTP email!');
      } else {
        console.log(`⚠️ Email sending failed`);
        console.log(`🔍 Error: ${signupResponse.data.emailError || 'Unknown error'}`);
      }

      // Test OTP resend
      console.log('\n📝 Step 2: Testing OTP resend...');
      const resendResponse = await axios.post(`${BASE_URL}/api/auth/resend-otp`, {
        userId: signupResponse.data.userId
      });
      
      console.log('✅ OTP resend completed');
      if (resendResponse.data.emailSent) {
        console.log(`✅ OTP resend email sent to: ${yourEmail}`);
        console.log('📧 Check your inbox for the new OTP email!');
      }

    } catch (signupError) {
      if (signupError.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ User already exists, testing password reset instead...');
        
        // Test password reset if user exists
        console.log('\n📝 Testing password reset email...');
        const resetResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
          email: yourEmail
        });
        
        console.log('✅ Password reset request completed');
        console.log('📊 Response:', JSON.stringify(resetResponse.data, null, 2));
        
        if (resetResponse.data.emailSent) {
          console.log(`✅ Password reset email sent to: ${yourEmail}`);
          console.log('📧 Check your inbox for the password reset email!');
        }
      } else {
        throw signupError;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 === TEST COMPLETED ===');
  console.log(`📧 Check your email inbox: ${yourEmail}`);
  console.log('📋 You should see emails sent to YOUR actual email address');
}

// Run the test
testWithYourEmail().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
