// Load environment variables
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const app = express();

// Import routes
const authRoutes = require('./routes/auth.routes');
const marketRoutes = require('./routes/market.routes');
const predictionRoutes = require('./routes/prediction.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const chatRoutes = require('./routes/chat.routes');
const oauthRoutes = require('./routes/oauth.routes');
const userRoutes = require('./routes/user.routes');
const diseaseRoutes = require('./routes/disease.routes');

// Initialize passport configuration
require('./config/passport');

// Middleware for detailed request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'N/A'}`);
  console.log(`Host: ${req.headers.host}`);
  console.log(`User-Agent: ${req.headers['user-agent'] || 'N/A'}`);

  // Log response on finish
  const originalSend = res.send;
  res.send = function (data) {
    try {
      const responseSize = Buffer.byteLength(data || '', 'utf8');
      console.log(`[${timestamp}] Response ${res.statusCode} for ${req.method} ${req.url}`);
      if (responseSize < 500) {
        console.log(`Response data: ${String(data)}`);
      } else {
        console.log(`Response size: ${responseSize} characters`);
      }
    } catch (e) {
      // ignore logging errors
    }
    return originalSend.call(this, data);
  };

  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Apply middleware
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize passport
app.use(passport.initialize());
console.log('Passport OAuth initialized');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Soil data endpoint for backward compatibility
app.post('/api/soil-data', async (req, res) => {
  try {
    const { state, district } = req.body || {};

    // Enhanced soil properties data
    const soilProperties = {
      soilProperties: {
        Loamy: {
          composition: { sand: 40, silt: 40, clay: 20 },
          properties: { ph: '6.0-7.0', nitrogen: 'Medium', phosphorus: 'High', potassium: 'Medium', organicMatter: '2-3%' },
          analysis: 'Excellent for most crops with good water retention and drainage.',
          recommendations: ['Add compost annually', 'Monitor pH levels', 'Rotate legume crops'],
          crops: { suitable: ['Wheat', 'Rice', 'Maize', 'Vegetables'], avoid: [] }
        },
        Clay: {
          composition: { sand: 10, silt: 25, clay: 65 },
          properties: { ph: '6.5-8.0', nitrogen: 'High', phosphorus: 'Medium', potassium: 'High', organicMatter: '3-4%' },
          analysis: 'High nutrient retention but may have drainage issues.',
          recommendations: ['Improve drainage', 'Add organic matter', 'Avoid overwatering'],
          crops: { suitable: ['Rice', 'Cotton', 'Sugarcane'], avoid: ['Root vegetables in pure clay'] }
        },
        Sandy: {
          composition: { sand: 85, silt: 10, clay: 5 },
          properties: { ph: '6.0-7.5', nitrogen: 'Low', phosphorus: 'Low', potassium: 'Low', organicMatter: '1-2%' },
          analysis: 'Good drainage but low nutrient retention.',
          recommendations: ['Regular fertilization', 'Add organic matter', 'Frequent irrigation'],
          crops: { suitable: ['Groundnut', 'Millets', 'Watermelon'], avoid: ['Rice', 'Heavy feeding crops'] }
        }
      }
    };

    // Simple soil type determination based on location
    const soilTypeMap = {
      punjab: 'Loamy',
      haryana: 'Loamy',
      gujarat: 'Clay',
      rajasthan: 'Sandy',
      maharashtra: 'Clay',
      karnataka: 'Loamy',
      'tamil nadu': 'Clay',
      'andhra pradesh': 'Clay',
      telangana: 'Clay',
      'west bengal': 'Loamy',
      bihar: 'Loamy',
      'uttar pradesh': 'Loamy'
    };

    const stateKey = (state || '').toLowerCase();
    const soilType = soilTypeMap[stateKey] || 'Loamy';
    const soilData = soilProperties.soilProperties[soilType];

    if (soilData) {
      return res.json({
        soilType,
        detailedSoilType: soilType,
        composition: soilData.composition,
        properties: soilData.properties,
        analysis: soilData.analysis,
        recommendations: soilData.recommendations,
        suitableCrops: soilData.crops.suitable,
        coordinates: { latitude: null, longitude: null },
        dataSource: 'regional_mapping',
        location: `${district || 'Unknown'}, ${state || 'Unknown'}`,
        raw: { state, district, mappedSoilType: soilType }
      });
    }

    // fallback
    return res.json({
      soilType: 'Loamy',
      detailedSoilType: 'Loamy',
      composition: { sand: 40, silt: 40, clay: 20 },
      properties: { ph: '6.5', nitrogen: 'Medium', phosphorus: 'High', potassium: 'Medium' },
      analysis: 'Suitable for most crops with good drainage.',
      recommendations: ['Regular soil testing', 'Organic matter addition'],
      suitableCrops: ['Wheat', 'Rice', 'Maize'],
      coordinates: { latitude: null, longitude: null },
      dataSource: 'fallback',
      location: `${district || 'Unknown'}, ${state || 'Unknown'}`,
      raw: { provider: 'mock' }
    });
  } catch (error) {
    console.error('Soil data error:', error);
    return res.status(500).json({ error: 'Failed to fetch soil data' });
  }
});

// Root welcome route
app.get('/', (req, res) => res.json({ message: 'Welcome to the Crop Yield Prediction Platform API' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api', oauthRoutes);
app.use('/api/disease', diseaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err && err.stack ? err.stack : err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? String(err) : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Database connection helper
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected successfully. Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error && error.message ? error.message : error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = app;