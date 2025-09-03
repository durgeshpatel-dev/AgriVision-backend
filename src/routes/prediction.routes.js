
const express = require('express');
const router = express.Router();
const { createPrediction, getUserPredictions, getSoilDataByPlace, getPredictionById, downloadPredictionReport } = require('../controllers/prediction.controller');
const { protect, requireVerified } = require('../middlewares/auth.middleware');

// @route   POST /api/predict
// @desc    Create a new prediction
// @access  Private (Verified users only)
router.post('/predict', protect, requireVerified, createPrediction);

// Public endpoint to fetch soil data by place
router.post('/soil-data', getSoilDataByPlace);

// @route   GET /api/predictions/:userId
// @desc    Get all predictions for a user
// @access  Private (Verified users only)
router.get('/predictions/:userId', protect, requireVerified, getUserPredictions);

// Get a single prediction by id
router.get('/prediction/:id', protect, requireVerified, getPredictionById);

// Download PDF report for a prediction
router.get('/prediction/:id/report', protect, requireVerified, downloadPredictionReport);

module.exports = router;
