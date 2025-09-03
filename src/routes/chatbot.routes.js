const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  askQuestion,
  getChatHistory,
  clearChatHistory,
  getSuggestedQuestions
} = require('../controllers/chatbot.controller');

// Rate limiting middleware (optional)
const rateLimit = require('express-rate-limit');

// Rate limit for chat endpoints - 30 requests per minute per user
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: 'Too many chat requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/chatbot/ask
// @desc    Ask a question to the AI chatbot
// @access  Private
router.post('/ask', protect, chatLimiter, askQuestion);

// @route   GET /api/chatbot/history
// @desc    Get chat history for the user
// @access  Private
router.get('/history', protect, getChatHistory);

// @route   DELETE /api/chatbot/history
// @desc    Clear chat history for the user
// @access  Private
router.delete('/history', protect, clearChatHistory);

// @route   GET /api/chatbot/suggestions
// @desc    Get suggested questions based on user profile
// @access  Private
router.get('/suggestions', protect, getSuggestedQuestions);

// @route   GET /api/chatbot/health
// @desc    Health check for chatbot service
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;