const express = require('express');
const router = express.Router();
const { updateProfile, updateFarmDetails } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

// Update profile: PUT /api/user/profile
router.put('/profile', protect, updateProfile);

// Update farm details: PUT /api/user/farm-details
router.put('/farm-details', protect, updateFarmDetails);

module.exports = router;
