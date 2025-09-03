// Enhanced Email Test Script with Detailed Logging
require('dotenv').config();
const { sendOTPEmail, sendPasswordResetEmail } = require('./src/utils/emailService');

async function testEmailService() {
  console.log('🧪 === ENHANCED EMAIL SERVICE TEST ===\n');
  
  // Test data
  const testEmail = 'chaniyarapbad@gmail.com'; // Your actual email
  const testOTP = '123456';
  const testName = 'Test User';
  const testResetToken = 'test-reset-token-123456789';

  console.log('📋 Test Configuration:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   OTP: ${testOTP}`);
  console.log(`   Name: ${testName}`);
  console.log(`   EMAIL_SKIP_SENDING: ${process.env.EMAIL_SKIP_SENDING}`);
  console.log('');

  // Test 1: OTP Email
  console.log('🧪 TEST 1: OTP Email');
  console.log('===================');
  try {
    const otpResult = await sendOTPEmail(testEmail, testOTP, testName);
    console.log('📊 OTP Test Result:', JSON.stringify(otpResult, null, 2));
  } catch (error) {
    console.error('❌ OTP Test Failed:', error.message);
    console.error('🔍 Full error:', error);
  }

  console.log('\n');

  // Test 2: Password Reset Email
  console.log('🧪 TEST 2: Password Reset Email');
  console.log('===============================');
  try {
    const resetResult = await sendPasswordResetEmail(testEmail, testResetToken, testName);
    console.log('📊 Password Reset Test Result:', JSON.stringify(resetResult, null, 2));
  } catch (error) {
    console.error('❌ Password Reset Test Failed:', error.message);
    console.error('🔍 Full error:', error);
  }

  console.log('\n🏁 === EMAIL SERVICE TEST COMPLETED ===');
}

// Run the test
testEmailService().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
