
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// 🧪 TEST USER FOR DEMO (same as in auth.controller.js)
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

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🧪 Check if this is the test user
      if (decoded.id === TEST_USER._id) {
        req.user = TEST_USER;
        return next();
      }

      // Get user from the database (will work when MongoDB is connected)
      try {
        req.user = await User.findById(decoded.id).select('-passwordHash');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
      } catch (dbError) {
        console.log('🧪 Database not available, user not found');
        return res.status(401).json({ message: 'Not authorized, database unavailable' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is verified
const requireVerified = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: 'Email verification required',
      needsVerification: true,
      userId: req.user._id 
    });
  }

  next();
};

module.exports = { protect, requireVerified };
