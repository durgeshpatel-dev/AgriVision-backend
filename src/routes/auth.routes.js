
const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  getProfile, 
  updateProfile,
  updateFarmDetails,
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/user/profile', protect, updateProfile);
router.put('/user/farm-details', protect, updateFarmDetails);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
