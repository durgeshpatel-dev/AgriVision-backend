const express = require('express');
const cors = require('cors');
const app = express();

// Basic middleware
app.use(cors({
  origin: ['https://agrivision-frontend.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AgriVision Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes for testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'AgriVision API is operational',
    features: ['authentication', 'predictions', 'market-data', 'disease-detection']
  });
});

// Mock auth endpoint
app.get('/api/auth/profile', (req, res) => {
  res.json({
    message: 'Backend connected successfully',
    status: 'authenticated'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 AgriVision Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API status: http://localhost:${PORT}/api/status`);
});

module.exports = app;