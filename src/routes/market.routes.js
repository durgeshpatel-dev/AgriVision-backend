const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes (no authentication required for market data)
router.get('/prices', marketController.getMarketPrices);
router.get('/stats', marketController.getMarketStats);
router.get('/crops', marketController.getAvailableCrops);
router.get('/states', marketController.getAvailableStates);
router.get('/districts', marketController.getAvailableDistricts);

// Protected routes (require authentication)
router.get('/trend/:crop', authMiddleware.protect, marketController.getCropTrend);

module.exports = router;