
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport'); // OAuth configuration

const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes'); // OAuth routes
const predictionRoutes = require('./routes/prediction.routes');
// const communityRoutes = require('./routes/community.routes');
const chatRoutes = require('./routes/chat.routes');
const chatbotRoutes = require('./routes/chatbot.routes'); // AI Chatbot routes
const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',  // Vite default port
    'http://localhost:5174',  // Vite alternative port
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport (OAuth support - non-intrusive)
app.use(passport.initialize());
console.log('🔐 Passport OAuth initialized (existing auth unchanged)');

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.url}`);
  console.log(`📍 Origin: ${req.get('origin') || 'N/A'}`);
  console.log(`🏠 Host: ${req.get('host')}`);
  console.log(`📱 User-Agent: ${req.get('user-agent')?.substring(0, 50) || 'N/A'}...`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body keys: [${Object.keys(req.body).join(', ')}]`);
  }
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`✅ [${new Date().toISOString()}] Response ${res.statusCode} for ${req.method} ${req.url}`);
    if (data && typeof data === 'string' && data.length < 500) {
      console.log(`📤 Response data: ${data}`);
    } else if (data) {
      console.log(`📤 Response size: ${JSON.stringify(data).length} characters`);
    }
    console.log('🔚 ===========================\n');
    return originalSend.call(this, data);
  };
  next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Crop Yield Prediction Platform API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes (additional, non-conflicting)
app.use('/api', predictionRoutes);
app.use('/api/user', userRoutes);
// app.use('/api/community', communityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbot', chatbotRoutes); // AI Chatbot endpoints

// Weather endpoint based on location
app.post('/api/location/weather', async (req, res) => {
  const { state, district } = req.body || {};
  const location = `${district || ''}, ${state || ''}`.trim();
  console.log('Weather request for:', { state, district });

  try {
    if (!process.env.WEATHER_API_KEY) {
      throw new Error('WEATHER_API_KEY not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });

    const d = response.data || {"Null": "Null"};
console.log(d);
    const out = {
      summary: d.weather && d.weather[0] ? d.weather[0].main : 'N/A',
      description: d.weather && d.weather[0] ? d.weather[0].description : 'N/A',
      tempC: d.main?.temp,
      temp: d.main?.temp,
      humidity: d.main?.humidity,
      windSpeed: d.wind?.speed,
      coordinates: { latitude: d.coord?.lat, longitude: d.coord?.lon },
      raw: d,
      provider: 'openweathermap'
    };

    return res.json(out);
  } catch (error) {
    console.error('Weather proxy error:', error.message);
    // fallback to mock response for compatibility
    const data = {
      summary: 'Sunny',
      description: 'Clear skies',
      tempC: 32,
      temp: 32,
      humidity: 45,
      windSpeed: 10,
      raw: { provider: 'mock', error: error.message }
    };
    return res.json(data);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
