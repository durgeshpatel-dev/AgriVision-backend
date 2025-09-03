const express = require('express');
const passport = require('passport');
const router = express.Router();
const { 
  googleAuth,
  googleCallback,
  getOAuthProfile,
  linkGoogleAccount,
  unlinkGoogleAccount
} = require('../controllers/oauth.controller');
const { protect } = require('../middlewares/auth.middleware');

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
    session: false // We use JWT, not sessions
  }),
  googleCallback
);

// @desc    Link Google account to existing account
// @route   POST /api/auth/link-google
// @access  Private
router.post('/link-google', protect, linkGoogleAccount);

// @desc    Unlink Google account
// @route   DELETE /api/auth/unlink-google
// @access  Private
router.delete('/unlink-google', protect, unlinkGoogleAccount);

module.exports = router;
