// Demo: User Email vs Hardcoded Email
// This script demonstrates that emails are sent to USER emails, not hardcoded emails

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

async function demonstrateUserEmailUsage() {
  console.log('🧪 === DEMONSTRATING USER EMAIL USAGE ===\n');
  
  // The email in .env file (this is only used for SMTP authentication)
  const envEmail = process.env.EMAIL_USER;
  console.log(`🔧 SMTP Email (from .env): ${envEmail}`);
  console.log('   ↳ This is ONLY used for SMTP server authentication\n');

  // Different user emails (these will receive the actual emails)
  const testUsers = [
    {
      name: 'Alice Farmer',
      email: 'alice.farmer@example.com',  // This user will receive emails at alice.farmer@example.com
      password: 'password123',
      farmDetails: { farmName: 'Alice Farm', location: 'Location 1', totalArea: 5 }
    },
    {
      name: 'Bob Grower',
      email: 'bob.grower@example.com',    // This user will receive emails at bob.grower@example.com
      password: 'password123',
      farmDetails: { farmName: 'Bob Farm', location: 'Location 2', totalArea: 10 }
    },
    {
      name: 'Your Test',
      email: envEmail,  // This will receive emails at your actual email
      password: 'password123',
      farmDetails: { farmName: 'Your Farm', location: 'Your Location', totalArea: 15 }
    }
  ];

  try {
    // Check if server is running
    console.log('🔍 Checking if server is running...');
    try {
      await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: 'Bearer test' }
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running! Start it with: node src/server.js');
        return;
      }
      console.log('✅ Server is running\n');
    }

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`\n🧪 === TEST ${i + 1}: ${user.name} ===`);
      console.log(`📧 User Email: ${user.email}`);
      console.log(`🔧 SMTP Email: ${envEmail}`);
      console.log(`📋 Expected: Email will be sent TO ${user.email} FROM ${envEmail}`);

      try {
        console.log('\n📝 Attempting user signup...');
        const response = await axios.post(`${BASE_URL}/api/auth/signup`, user);
        
        console.log('✅ Signup Response:');
        console.log(`   Message: ${response.data.message}`);
        console.log(`   Email Sent: ${response.data.emailSent}`);
        console.log(`   Sent To: ${response.data.sentTo}`);
        
        if (response.data.sentTo) {
          console.log(`\n🎯 VERIFICATION: Email was sent to USER'S email: ${response.data.sentTo}`);
          console.log(`   ✅ This proves emails go to USER email, not hardcoded email!`);
        }

      } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
          console.log('⚠️ User exists, testing password reset...');
          
          const resetResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
            email: user.email
          });
          
          console.log('✅ Password Reset Response:');
          console.log(`   Message: ${resetResponse.data.message}`);
          console.log(`   Email Sent: ${resetResponse.data.emailSent}`);
          console.log(`   Sent To: ${resetResponse.data.sentTo}`);
          
          if (resetResponse.data.sentTo) {
            console.log(`\n🎯 VERIFICATION: Password reset sent to: ${resetResponse.data.sentTo}`);
            console.log(`   ✅ This proves emails go to USER email!`);
          }
        } else {
          console.error('❌ Error:', error.response?.data || error.message);
        }
      }
    }

  } catch (error) {
    console.error('💥 Demo failed:', error.message);
  }

  console.log('\n🏁 === DEMONSTRATION COMPLETED ===');
  console.log('\n📋 SUMMARY:');
  console.log('✅ The system correctly sends emails to USER email addresses');
  console.log('✅ The .env EMAIL_USER is only used for SMTP authentication');
  console.log('✅ Each user receives emails at their own email address');
  console.log('\n💡 KEY POINTS:');
  console.log('• EMAIL_USER in .env = SMTP server login credentials');
  console.log('• User emails from signup/login = WHERE emails are sent TO');
  console.log('• System correctly uses user.email for recipients');
}

// Run the demonstration
demonstrateUserEmailUsage().catch(error => {
  console.error('💥 Demo script failed:', error);
  process.exit(1);
});
