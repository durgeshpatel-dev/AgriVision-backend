const nodemailer = require('nodemailer');

// Create transporter with better error handling
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Additional options for Gmail
    tls: {
      rejectUnauthorized: false
    }
  };

  console.log('Email config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user,
    pass: config.auth.pass ? '***' + config.auth.pass.slice(-4) : 'Not set'
  });

  return nodemailer.createTransport(config);
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  console.log('\n� === EMAIL SENDING PROCESS STARTED ===');
  console.log(`📧 Target Email: ${email}`);
  console.log(`👤 Recipient Name: ${name}`);
  console.log(`🔢 Generated OTP: ${otp}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  // Skip email sending if configured (for development)
  if (process.env.EMAIL_SKIP_SENDING === 'true') {
    console.log('\n⚠️  EMAIL_SKIP_SENDING is enabled - skipping actual email');
    console.log('📋 This is DEVELOPMENT MODE - no real email will be sent');
    console.log(`✅ SUCCESS: Use this OTP for verification: ${otp}`);
    console.log('🔚 === EMAIL PROCESS COMPLETED (SKIPPED) ===\n');
    return { 
      success: true, 
      message: 'Email skipped for development',
      devOTP: otp 
    };
  }

  console.log('\n📤 EMAIL_SKIP_SENDING is disabled - will send actual email');
  console.log('🔧 Creating email transporter...');
  
  const transporter = createTransporter();
  
  // Verify transporter configuration
  console.log('🔍 Verifying email server connection...');
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified successfully');
  } catch (verifyError) {
    console.error('❌ Email server verification failed:', verifyError.message);
    console.error('🔍 Full verification error:', verifyError);
    console.log(`🔍 FALLBACK - Use this OTP: ${otp}`);
    console.log('🔚 === EMAIL PROCESS FAILED (VERIFICATION) ===\n');
    return { 
      success: false, 
      error: verifyError.message,
      devOTP: otp
    };
  }
  
  console.log('\n📝 Preparing email content...');
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Verification - AgriVision',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to AgriVision!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with AgriVision. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #27ae60; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>AgriVision Team</p>
      </div>
    `,
  };

  console.log('📋 Email details:');
  console.log(`   From: ${mailOptions.from}`);
  console.log(`   To: ${mailOptions.to}`);
  console.log(`   Subject: ${mailOptions.subject}`);
  console.log(`   Content type: HTML`);
  console.log('\n📮 Attempting to send email...');

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Email sent to: ${email}`);
    console.log(`🎯 Response: ${JSON.stringify(info.response)}`);
    console.log(`🔍 Accepted recipients: ${JSON.stringify(info.accepted)}`);
    console.log(`❌ Rejected recipients: ${JSON.stringify(info.rejected)}`);
    console.log('🔚 === EMAIL PROCESS COMPLETED SUCCESSFULLY ===\n');
    return { success: true, messageId: info.messageId, recipients: info.accepted };
  } catch (error) {
    console.error('❌ FAILED TO SEND EMAIL!');
    console.error(`🚨 Error message: ${error.message}`);
    console.error(`🔍 Error code: ${error.code || 'No code'}`);
    console.error(`📧 Target email: ${email}`);
    console.error('🔍 Full error details:', error);
    console.log(`🔍 FALLBACK - Use this OTP: ${otp}`);
    console.log('🔚 === EMAIL PROCESS FAILED (SENDING) ===\n');
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code,
      devOTP: otp
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  console.log('\n🚀 === PASSWORD RESET EMAIL PROCESS STARTED ===');
  console.log(`📧 Target Email: ${email}`);
  console.log(`👤 Recipient Name: ${name}`);
  console.log(`🔑 Reset Token: ${resetToken.substring(0, 8)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  console.log('\n🔧 Creating email transporter...');
  const transporter = createTransporter();
  
  // Verify transporter configuration
  console.log('🔍 Verifying email server connection...');
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified successfully');
  } catch (verifyError) {
    console.error('❌ Email server verification failed:', verifyError.message);
    console.error('🔍 Full verification error:', verifyError);
    console.log('🔚 === PASSWORD RESET EMAIL PROCESS FAILED (VERIFICATION) ===\n');
    return { 
      success: false, 
      error: verifyError.message
    };
  }
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  console.log(`🔗 Reset URL: ${resetUrl}`);
  
  console.log('\n📝 Preparing password reset email content...');
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - AgriVision',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You have requested to reset your password for your AgriVision account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #7f8c8d;">${resetUrl}</p>
        <p>This link is valid for 1 hour only.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br>AgriVision Team</p>
      </div>
    `,
  };

  console.log('📋 Password reset email details:');
  console.log(`   From: ${mailOptions.from}`);
  console.log(`   To: ${mailOptions.to}`);
  console.log(`   Subject: ${mailOptions.subject}`);
  console.log(`   Content type: HTML`);
  console.log('\n📮 Attempting to send password reset email...');

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Email sent to: ${email}`);
    console.log(`🎯 Response: ${JSON.stringify(info.response)}`);
    console.log(`🔍 Accepted recipients: ${JSON.stringify(info.accepted)}`);
    console.log(`❌ Rejected recipients: ${JSON.stringify(info.rejected)}`);
    console.log('🔚 === PASSWORD RESET EMAIL PROCESS COMPLETED SUCCESSFULLY ===\n');
    return { success: true, messageId: info.messageId, recipients: info.accepted };
  } catch (error) {
    console.error('❌ FAILED TO SEND PASSWORD RESET EMAIL!');
    console.error(`🚨 Error message: ${error.message}`);
    console.error(`🔍 Error code: ${error.code || 'No code'}`);
    console.error(`📧 Target email: ${email}`);
    console.error('🔍 Full error details:', error);
    console.log('🔚 === PASSWORD RESET EMAIL PROCESS FAILED (SENDING) ===\n');
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code
    };
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};
