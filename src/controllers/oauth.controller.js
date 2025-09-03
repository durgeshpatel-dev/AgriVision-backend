const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Generate JWT (reusing existing function for consistency)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res, next) => {
  // This will be handled by Passport middleware
  console.log('🚀 Initiating Google OAuth flow');
};

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  try {
    const user = req.user; // Set by Passport after successful authentication
    
    if (!user) {
      console.error('❌ No user found in Google OAuth callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
    }

    console.log('✅ Google OAuth successful for user:', user.email);

    // Generate JWT token (same as manual login)
    const token = generateToken(user._id);

    // Prepare user data (same format as manual login)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      farmDetails: user.farmDetails,
      isVerified: user.isVerified,
      authProvider: user.authProvider,
      linkedProviders: user.linkedProviders,
      avatar: user.avatar,
      token
    };

    // Redirect to frontend with token (you can customize this URL)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectURL = `${frontendURL}/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    
    console.log('🔄 Redirecting to frontend with auth data');
    res.redirect(redirectURL);

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/login?error=oauth_callback_failed`);
  }
};

// @desc    Get OAuth user profile (same endpoint as manual auth)
// @route   GET /api/auth/profile
// @access  Private
const getOAuthProfile = async (req, res) => {
  try {
    // req.user is set by JWT middleware (existing functionality preserved)
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      farmDetails: user.farmDetails,
      isVerified: user.isVerified,
      authProvider: user.authProvider,
      linkedProviders: user.linkedProviders,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('❌ Error fetching OAuth profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Link Google account to existing manual account
// @route   POST /api/auth/link-google
// @access  Private
const linkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user._id; // From JWT middleware
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: 'Google token required' });
    }

    // This would be implemented when user wants to link accounts manually
    // For now, linking happens automatically during OAuth flow
    
    res.status(200).json({ 
      message: 'Account linking not yet implemented. Use Google login to auto-link accounts.' 
    });
  } catch (error) {
    console.error('❌ Error linking Google account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Unlink Google account
// @route   DELETE /api/auth/unlink-google
// @access  Private
const unlinkGoogleAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.googleId) {
      return res.status(400).json({ message: 'Google account not linked' });
    }

    // Ensure user has a password before unlinking (security measure)
    if (user.authProvider === 'google' && !user.passwordHash) {
      return res.status(400).json({ 
        message: 'Please set a password before unlinking Google account' 
      });
    }

    user.googleId = undefined;
    user.linkedProviders = user.linkedProviders.filter(provider => provider !== 'google');
    
    await user.save();

    console.log('🔗 Google account unlinked for user:', user.email);

    res.status(200).json({ 
      message: 'Google account unlinked successfully',
      linkedProviders: user.linkedProviders 
    });
  } catch (error) {
    console.error('❌ Error unlinking Google account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  getOAuthProfile,
  linkGoogleAccount,
  unlinkGoogleAccount
};
