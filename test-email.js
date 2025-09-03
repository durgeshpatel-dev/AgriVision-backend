// Email Configuration Test
// Run with: node test-email.js

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('📧 Testing Email Configuration...\n');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Verify connection
    console.log('🔗 Verifying connection...');
    await transporter.verify();
    console.log('✅ Email server connection successful!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'AgriVision Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🎉 AgriVision Email Test Successful!</h2>
          <p>Your email configuration is working perfectly.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Host: ${process.env.EMAIL_HOST}</li>
            <li>Port: ${process.env.EMAIL_PORT}</li>
            <li>User: ${process.env.EMAIL_USER}</li>
            <li>From: ${process.env.EMAIL_FROM}</li>
          </ul>
          <p>You can now use OTP verification and password reset features!</p>
          <p>Best regards,<br>AgriVision Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Check your inbox for the test email.');

  } catch (error) {
    console.error('❌ Email configuration failed:');
    console.error('Error:', error.message);

    if (error.code === 'EAUTH') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Enable 2-Factor Authentication on your Gmail account');
      console.log('2. Generate a new App Password');
      console.log('3. Update EMAIL_PASS in your .env file');
      console.log('4. Check GMAIL_SMTP_SETUP.md for detailed instructions');
    }
  }
}

// Run the test
testEmailConfiguration();
