
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

// 🧪 TEST USER FOR DEMO (Remove when MongoDB is properly set up)
const TEST_USER = {
  _id: 'test-user-123',
  name: 'Demo User',
  email: 'demo@agrivision.com',
  password: 'demo123',
  isVerified: true,
  farmDetails: {
    farmName: 'Demo Farm',
    location: 'Demo Location',
    farmSize: '10 acres',
    soilType: 'Loamy'
  }
};

// Generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'agrivision-railway-super-secret-jwt-key-2024';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { name, email, password, farmDetails } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    // 🧪 TEST USER HANDLING - Check if trying to register the test user
    if (email === TEST_USER.email) {
      return res.status(400).json({ message: 'Demo user already exists. Use demo@agrivision.com with password: demo123' });
    }

    // For any other email, check database (will work when MongoDB is connected)
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
    } catch (dbError) {
      console.log('🧪 Database not available, using test mode for signup');
      // If database not available, allow signup but return test user instructions
      return res.status(200).json({ 
        message: 'Database temporarily unavailable. Use demo user for testing',
        testUser: {
          email: TEST_USER.email,
          password: 'demo123',
          instructions: 'Use the demo credentials to test authentication'
        }
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Hashing is handled by pre-save hook in model
      farmDetails,
      otp,
      otpExpiry,
      isVerified: false,
    });

  if (user) {
      console.log(`\n👤 User created successfully: ${user._id}`);
      console.log(`📧 User email: ${email}`);
      console.log(`👤 User name: ${name}`);
      
      // Send OTP email asynchronously (do not block response)
      console.log('🚀 Queueing OTP email (non-blocking)...');
      sendOTPEmail(email, otp, name)
        .then(result => console.log('📨 Async email sending result:', result))
        .catch(err => console.error('❌ Async email send failed:', err));

      // Return success immediately so frontend can redirect quickly
      return res.status(201).json({
        message: 'User registered successfully. Please check your email for OTP verification.',
        userId: user._id,
        emailQueued: true,
        sentTo: email,
        devNote: process.env.NODE_ENV === 'development' ? `OTP: ${otp}` : undefined
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🧪 TEST USER AUTHENTICATION
    if (email === TEST_USER.email && password === TEST_USER.password) {
      console.log('🧪 Test user login successful');
      return res.json({
        _id: TEST_USER._id,
        name: TEST_USER.name,
        email: TEST_USER.email,
        isVerified: TEST_USER.isVerified,
        farmDetails: TEST_USER.farmDetails,
        token: generateToken(TEST_USER._id),
      });
    }

    // Try database authentication (will work when MongoDB is connected)
    let user = null;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.log('🧪 Database not available, checking test user only');
      return res.status(401).json({ 
        message: 'Invalid email or password. Try demo user: demo@agrivision.com / demo123' 
      });
    }

    if (user && (await user.comparePassword(password))) {
      // Check if user is verified
        if (!user.isVerified) {
          // Generate a fresh OTP and send email so frontend can redirect to verification page
          try {
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();

            console.log(`\n🔒 Login attempt for unverified user ${user._id} - generating OTP and sending email`);
            console.log(`📧 Email: ${user.email}`);
            console.log(`🔢 OTP: ${otp}`);

            // Send OTP asynchronously so login response is fast
            sendOTPEmail(user.email, otp, user.name)
              .then(result => console.log('📨 Async login-triggered OTP email result:', result))
              .catch(err => console.error('❌ Async login OTP send failed:', err));

            return res.status(401).json({
              message: 'Please verify your email address before logging in.',
              needsVerification: true,
              userId: user._id,
              emailQueued: true,
              devNote: process.env.NODE_ENV === 'development' ? `OTP: ${otp}` : 'Check server logs for OTP'
            });
          } catch (err) {
            console.error('Error while sending OTP for login verification:', err);
            return res.status(500).json({ message: 'Failed to send verification OTP', error: err.message });
          }
        }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        farmDetails: user.farmDetails,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json(req.user);
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: 'User ID and OTP are required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Update user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        farmDetails: user.farmDetails,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log(`\n🔄 Resending OTP for user: ${user._id}`);
    console.log(`📧 User email: ${user.email}`);
    console.log(`👤 User name: ${user.name}`);
    console.log(`🔢 New OTP: ${otp}`);

    // Send OTP email asynchronously
    console.log('🚀 Queueing OTP resend (non-blocking)...');
    sendOTPEmail(user.email, otp, user.name)
      .then(result => console.log('📨 Async OTP resend result:', result))
      .catch(err => console.error('❌ Async OTP resend failed:', err));

    return res.status(200).json({ 
      message: 'OTP generated and queued for sending',
      emailQueued: true,
      sentTo: user.email,
      devNote: process.env.NODE_ENV === 'development' ? `OTP: ${otp}` : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    console.log(`\n🔑 Password reset requested for user: ${user._id}`);
    console.log(`📧 User email: ${user.email}`);
    console.log(`👤 User name: ${user.name}`);
    console.log(`🔑 Reset token: ${resetToken.substring(0, 8)}...`);

    // Send password reset email asynchronously
    console.log('🚀 Queueing password reset email (non-blocking)...');
    sendPasswordResetEmail(user.email, resetToken, user.name)
      .then(result => console.log('📨 Async password reset email result:', result))
      .catch(err => console.error('❌ Async password reset send failed:', err));

    return res.status(200).json({ 
      message: 'Password reset link generated and queued for sending',
      emailQueued: true,
      sentTo: user.email,
      resetToken // Include token in response for testing (remove in production)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Password reset successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        farmDetails: user.farmDetails,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};

// @desc    Update user profile (name, email)
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email , phone } = req.body || {};
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
console.log("Updating profile with:", { name, email, phone });
    await user.save();

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user farm details
// @route   PUT /api/user/farm-details
// @access  Private
const updateFarmDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { farmDetails } = req.body || {};
    if (!farmDetails || typeof farmDetails !== 'object') {
      return res.status(400).json({ message: 'farmDetails object is required' });
    }

    // Merge allowed farm fields only
    user.farmDetails = user.farmDetails || {};
    if (typeof farmDetails.farmName !== 'undefined') user.farmDetails.farmName = farmDetails.farmName;
    if (typeof farmDetails.location !== 'undefined') user.farmDetails.location = farmDetails.location;
    if (typeof farmDetails.totalArea !== 'undefined') user.farmDetails.totalArea = farmDetails.totalArea;

    await user.save();

    return res.status(200).json({ message: 'Farm details updated successfully', farmDetails: user.farmDetails });
  } catch (error) {
    console.error('Error updating farm details:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.updateProfile = updateProfile;
module.exports.updateFarmDetails = updateFarmDetails;
