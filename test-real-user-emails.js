// Comprehensive Email Test with Real User Signup
// This demonstrates emails being sent to actual user emails during signup/login

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

async function testRealUserEmailFlow() {
  console.log('🧪 === TESTING REAL USER EMAIL FLOW ===\n');
  console.log('This test will create real users and send emails to their provided addresses\n');

  // Test user data - you can change these emails to test with different addresses
  const testUsers = [
    {
      name: 'John Farmer',
      email: 'test.user1@example.com', // Change this to a real email you want to test
      password: 'password123',
      farmDetails: {
        farmName: 'Green Valley Farm',
        location: 'Punjab, India',
        totalArea: 15.5
      }
    },
    {
      name: 'Sarah Agriculture',
      email: 'test.user2@example.com', // Change this to another real email
      password: 'password123',
      farmDetails: {
        farmName: 'Organic Fields',
        location: 'Haryana, India',
        totalArea: 25.0
      }
    }
  ];

  try {
    console.log('🚀 Starting server check...');
    
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

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`\n🧪 === TEST ${i + 1}: USER SIGNUP & EMAIL ===`);
      console.log(`👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🏠 Farm: ${user.farmDetails.farmName}`);

      try {
        // Step 1: Register the user
        console.log('\n📝 Step 1: Registering user...');
        const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, user);
        
        console.log('✅ Signup successful!');
        console.log('📊 Response:', JSON.stringify(signupResponse.data, null, 2));
        
        if (signupResponse.data.emailSent) {
          console.log(`✅ OTP email sent successfully to: ${user.email}`);
        } else {
          console.log(`⚠️ Email sending failed for: ${user.email}`);
          console.log(`🔍 Error: ${signupResponse.data.emailError || 'Unknown error'}`);
        }

        // Step 2: Test OTP resend
        console.log('\n📝 Step 2: Testing OTP resend...');
        const resendResponse = await axios.post(`${BASE_URL}/api/auth/resend-otp`, {
          userId: signupResponse.data.userId
        });
        
        console.log('✅ OTP resend request completed');
        console.log('📊 Response:', JSON.stringify(resendResponse.data, null, 2));
        
        if (resendResponse.data.emailSent) {
          console.log(`✅ OTP resend email sent successfully to: ${user.email}`);
        } else {
          console.log(`⚠️ OTP resend email failed for: ${user.email}`);
          console.log(`🔍 Error: ${resendResponse.data.emailError || 'Unknown error'}`);
        }

      } catch (error) {
        console.error(`❌ Error testing user ${user.name}:`, error.response?.data || error.message);
      }

      console.log(`\n🔚 === END TEST ${i + 1} ===`);
    }

    // Test password reset email
    console.log(`\n🧪 === PASSWORD RESET EMAIL TEST ===`);
    console.log(`📧 Testing password reset for: ${testUsers[0].email}`);
    
    try {
      const resetResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        email: testUsers[0].email
      });
      
      console.log('✅ Password reset request completed');
      console.log('📊 Response:', JSON.stringify(resetResponse.data, null, 2));
      
      if (resetResponse.data.emailSent) {
        console.log(`✅ Password reset email sent successfully to: ${testUsers[0].email}`);
      } else {
        console.log(`⚠️ Password reset email failed for: ${testUsers[0].email}`);
      }
      
    } catch (error) {
      console.error('❌ Password reset test failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }

  console.log('\n🏁 === EMAIL FLOW TEST COMPLETED ===');
  console.log('\n📋 Summary:');
  console.log('- Check the console logs above for detailed email sending information');
  console.log('- Check your email inbox for received OTP and password reset emails');
  console.log('- All emails should be sent to the user emails specified in the test data');
  console.log('\n💡 To test with your own email:');
  console.log('- Edit the testUsers array in this script');
  console.log('- Replace test.user1@example.com with your actual email address');
  console.log('- Run the script again');
}

// Run the test
testRealUserEmailFlow().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
