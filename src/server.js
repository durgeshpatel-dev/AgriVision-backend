const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set these environment variables in Railway dashboard or .env file');
} else {
  console.log('✅ All required environment variables are set');
}

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
    'https://agrivision-frontend.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Access-Control-Allow-Origin']
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
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStates[dbStatus] || 'unknown',
      required: false
    },
    services: {
      api: 'active',
      auth: (process.env.JWT_SECRET || 'fallback') ? 'active' : 'disabled',
      database: dbStatus === 1 ? 'active' : 'disabled'
    }
  });
});

// Test endpoint for frontend connectivity
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgriVision Backend API is working!',
    timestamp: new Date().toISOString(),
    cors: req.headers.origin,
    endpoints: {
      health: '/health',
      test: '/api/test',
      login: '/api/auth/login'
    },
    testCredentials: {
      email: 'demo@agrivision.com',
      password: 'demo123'
    }
  });
});

// Soil data endpoint for backward compatibility
app.post('/api/soil-data', async (req, res) => {
  try {
    const { state, district, latitude, longitude } = req.body || {};
    
    console.log('🌱 Soil Data API Request:');
    console.log(`📍 Location: ${district || 'N/A'}, ${state || 'N/A'}`);
    console.log(`🌐 Coordinates: Lat ${latitude || 'N/A'}, Lon ${longitude || 'N/A'}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`📦 Request Body:`, JSON.stringify(req.body, null, 2));

    let soilData = null;
    let coordinates = { latitude: latitude || null, longitude: longitude || null };
    let dataSource = 'enhanced_regional_mapping';

    // If coordinates are provided, try to get real soil data from APIs
    if (latitude && longitude && process.env.WEATHER_API_KEY) {
      try {
        console.log('🔍 Attempting to fetch real soil data using coordinates...');
        
        // Use OpenWeatherMap Agro API for soil data (if available)
        const soilApiUrl = `http://api.openweathermap.org/data/2.5/soil?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}`;
        
        try {
          console.log('🌍 Calling soil API...');
          const soilResponse = await axios.get(soilApiUrl);
          
          if (soilResponse.data) {
            console.log('✅ Real soil data retrieved from API');
            dataSource = 'openweathermap_soil_api';
            
            // Process real soil data
            const apiSoilData = soilResponse.data;
            soilData = {
              soilType: 'Real Data',
              detailedSoilType: 'API Retrieved',
              composition: { 
                sand: apiSoilData.sand || 40, 
                silt: apiSoilData.silt || 40, 
                clay: apiSoilData.clay || 20 
              },
              properties: { 
                ph: apiSoilData.ph || '6.5',
                nitrogen: apiSoilData.nitrogen || 'Medium',
                phosphorus: apiSoilData.phosphorus || 'Medium',
                potassium: apiSoilData.potassium || 'Medium',
                organicMatter: apiSoilData.organic_matter || '2-3%',
                moisture: apiSoilData.moisture || 'Medium',
                temperature: apiSoilData.temperature || null
              },
              analysis: 'Real soil data retrieved from satellite and ground sensors.',
              recommendations: ['Monitor based on real-time data', 'Regular testing recommended'],
              suitableCrops: ['Wheat', 'Rice', 'Maize', 'Vegetables'],
              coordinates: coordinates,
              location: `${district || 'Unknown'}, ${state || 'Unknown'}`,
              raw: apiSoilData
            };
          }
        } catch (apiError) {
          console.log('⚠️ Soil API unavailable or returned error:', apiError.message);
          // Continue to enhanced regional mapping
        }
      } catch (error) {
        console.log('⚠️ Error fetching real soil data, falling back to regional data:', error.message);
      }
    }

    // If no real data available, use enhanced regional mapping with coordinates
    if (!soilData) {
      console.log('🗺️ Using enhanced regional soil mapping...');
      
      // Enhanced soil properties data with more details
      const soilProperties = {
        soilProperties: {
          Loamy: {
            composition: { sand: 40, silt: 40, clay: 20 },
            properties: { 
              ph: '6.0-7.0', 
              nitrogen: 'Medium', 
              phosphorus: 'High', 
              potassium: 'Medium', 
              organicMatter: '2-3%',
              drainage: 'Good',
              waterHolding: 'High'
            },
            analysis: 'Excellent for most crops with good water retention and drainage. Well-balanced soil composition.',
            recommendations: [
              'Add compost annually to maintain organic matter',
              'Monitor pH levels regularly',
              'Rotate legume crops for nitrogen fixation',
              'Apply balanced NPK fertilizer as needed'
            ],
            crops: { 
              suitable: ['Wheat', 'Rice', 'Maize', 'Vegetables', 'Fruits', 'Pulses'], 
              avoid: ['Salt-sensitive crops in high-salt areas'] 
            },
            seasonalAdvice: {
              summer: 'Maintain adequate moisture, mulch to prevent water loss',
              monsoon: 'Ensure proper drainage to prevent waterlogging',
              winter: 'Add organic matter before winter crops'
            }
          },
          Clay: {
            composition: { sand: 10, silt: 25, clay: 65 },
            properties: { 
              ph: '6.5-8.0', 
              nitrogen: 'High', 
              phosphorus: 'Medium', 
              potassium: 'High', 
              organicMatter: '3-4%',
              drainage: 'Poor',
              waterHolding: 'Very High'
            },
            analysis: 'High nutrient retention but may have drainage issues. Rich in minerals but requires careful water management.',
            recommendations: [
              'Improve drainage with sand/organic matter',
              'Avoid overwatering to prevent waterlogging',
              'Add coarse organic matter for aeration',
              'Consider raised beds for better drainage'
            ],
            crops: { 
              suitable: ['Rice', 'Cotton', 'Sugarcane', 'Jowar', 'Bajra'], 
              avoid: ['Root vegetables in pure clay', 'Crops requiring good drainage'] 
            },
            seasonalAdvice: {
              summer: 'Clay retains water well, monitor for cracking',
              monsoon: 'Critical drainage management needed',
              winter: 'Prepare beds early, add organic matter'
            }
          },
          Sandy: {
            composition: { sand: 85, silt: 10, clay: 5 },
            properties: { 
              ph: '6.0-7.5', 
              nitrogen: 'Low', 
              phosphorus: 'Low', 
              potassium: 'Low', 
              organicMatter: '1-2%',
              drainage: 'Excellent',
              waterHolding: 'Low'
            },
            analysis: 'Excellent drainage but low nutrient and water retention. Requires frequent irrigation and fertilization.',
            recommendations: [
              'Frequent, light irrigation required',
              'Regular application of organic fertilizers',
              'Add organic matter to improve retention',
              'Use drip irrigation for water efficiency'
            ],
            crops: { 
              suitable: ['Groundnut', 'Millets', 'Watermelon', 'Coconut', 'Cashew'], 
              avoid: ['Rice', 'Heavy feeding crops without adequate fertilization'] 
            },
            seasonalAdvice: {
              summer: 'Frequent irrigation essential, use mulch',
              monsoon: 'Good for drainage, monitor nutrients',
              winter: 'Add organic matter, cover crops beneficial'
            }
          },
          Alluvial: {
            composition: { sand: 30, silt: 50, clay: 20 },
            properties: { 
              ph: '6.5-7.5', 
              nitrogen: 'High', 
              phosphorus: 'Medium', 
              potassium: 'High', 
              organicMatter: '2-4%',
              drainage: 'Good',
              waterHolding: 'High'
            },
            analysis: 'Highly fertile alluvial soil, excellent for agriculture. Rich in nutrients with good water retention.',
            recommendations: [
              'Maintain organic matter levels',
              'Regular soil testing for nutrient balance',
              'Proper crop rotation for sustainability',
              'Optimal fertilizer management'
            ],
            crops: { 
              suitable: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Vegetables'], 
              avoid: ['Crops requiring acidic conditions'] 
            },
            seasonalAdvice: {
              summer: 'Maintain moisture, excellent productivity',
              monsoon: 'Perfect conditions for kharif crops',
              winter: 'Ideal for rabi crops'
            }
          },
          'Black Cotton': {
            composition: { sand: 20, silt: 30, clay: 50 },
            properties: { 
              ph: '7.0-8.5', 
              nitrogen: 'Medium', 
              phosphorus: 'Low', 
              potassium: 'High', 
              organicMatter: '2-3%',
              drainage: 'Poor',
              waterHolding: 'Very High'
            },
            analysis: 'Self-plowing black cotton soil, retains moisture well but has drainage challenges. Rich in potash.',
            recommendations: [
              'Improve drainage systems',
              'Add phosphorus-rich fertilizers',
              'Timing of operations is crucial',
              'Use machinery carefully when wet'
            ],
            crops: { 
              suitable: ['Cotton', 'Sugarcane', 'Wheat', 'Jowar', 'Gram'], 
              avoid: ['Crops sensitive to waterlogging'] 
            },
            seasonalAdvice: {
              summer: 'Develops deep cracks, good for aeration',
              monsoon: 'Becomes sticky, avoid heavy machinery',
              winter: 'Ideal working conditions'
            }
          }
        }
      };

      // Enhanced soil type determination based on location and geographic knowledge
      const soilTypeMap = {
        // Northern Plains (Alluvial)
        punjab: 'Alluvial',
        haryana: 'Alluvial',
        'uttar pradesh': 'Alluvial',
        bihar: 'Alluvial',
        'west bengal': 'Alluvial',
        
        // Deccan Plateau (Black Cotton)
        maharashtra: 'Black Cotton',
        gujarat: 'Black Cotton',
        'madhya pradesh': 'Black Cotton',
        telangana: 'Black Cotton',
        'andhra pradesh': 'Black Cotton',
        karnataka: 'Loamy',
        
        // Southern India
        'tamil nadu': 'Clay',
        kerala: 'Loamy',
        
        // Western India
        rajasthan: 'Sandy',
        goa: 'Loamy',
        
        // Eastern India
        odisha: 'Alluvial',
        jharkhand: 'Loamy',
        
        // Northeastern India
        assam: 'Alluvial',
        'arunachal pradesh': 'Loamy',
        manipur: 'Loamy',
        meghalaya: 'Loamy',
        mizoram: 'Loamy',
        nagaland: 'Loamy',
        sikkim: 'Loamy',
        tripura: 'Loamy'
      };

      const stateKey = (state || '').toLowerCase();
      const soilType = soilTypeMap[stateKey] || 'Loamy';
      const soilDetails = soilProperties.soilProperties[soilType];

      console.log('🔍 Enhanced Soil Analysis:');
      console.log(`Mapped State Key: "${stateKey}"`);
      console.log(`Determined Soil Type: ${soilType}`);
      console.log(`Soil Data Found: ${soilDetails ? 'Yes' : 'No'}`);

      if (soilDetails) {
        console.log('📊 Enhanced Soil Properties:');
        console.log(`pH: ${soilDetails.properties.ph}`);
        console.log(`Composition: Sand ${soilDetails.composition.sand}%, Silt ${soilDetails.composition.silt}%, Clay ${soilDetails.composition.clay}%`);
        console.log(`Drainage: ${soilDetails.properties.drainage}`);
        console.log(`Suitable Crops: ${soilDetails.crops.suitable.join(', ')}`);
        
        soilData = {
          soilType,
          detailedSoilType: soilType,
          composition: soilDetails.composition,
          properties: soilDetails.properties,
          analysis: soilDetails.analysis,
          recommendations: soilDetails.recommendations,
          suitableCrops: soilDetails.crops.suitable,
          unsuitableCrops: soilDetails.crops.avoid,
          seasonalAdvice: soilDetails.seasonalAdvice,
          coordinates: coordinates,
          dataSource: dataSource,
          location: `${district || 'Unknown'}, ${state || 'Unknown'}`,
          raw: { state, district, mappedSoilType: soilType }
        };
      } else {
        // Ultimate fallback
        console.log('⚠️ Using ultimate fallback soil data');
        soilData = {
          soilType: 'Loamy',
          detailedSoilType: 'Loamy',
          composition: { sand: 40, silt: 40, clay: 20 },
          properties: { 
            ph: '6.5', 
            nitrogen: 'Medium', 
            phosphorus: 'High', 
            potassium: 'Medium',
            drainage: 'Good',
            waterHolding: 'Medium'
          },
          analysis: 'General purpose soil suitable for most crops.',
          recommendations: ['Regular soil testing', 'Organic matter addition', 'Balanced fertilization'],
          suitableCrops: ['Wheat', 'Rice', 'Maize'],
          coordinates: coordinates,
          dataSource: 'fallback',
          location: `${district || 'Unknown'}, ${state || 'Unknown'}`,
          raw: { provider: 'fallback' }
        };
      }
    }

    console.log(`✅ Enhanced Soil API Response sent successfully (${dataSource})`);
    return res.json({
      success: true,
      ...soilData
    });

  } catch (error) {
    console.error('❌ Soil data error:', error);
    console.error(`❌ Failed to process soil data request for ${req.body?.state || 'N/A'}, ${req.body?.district || 'N/A'}`);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch soil data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Weather endpoint based on location
app.post('/api/location/weather', async (req, res) => {
  try {
    const { state, district } = req.body || {};
    const location = `${district || ''}, ${state || 'India'}`.trim();
    
    console.log('🌤️ Weather API Request:');
    console.log(`📍 Location: ${location}`);
    console.log(`🗺️ State: ${state || 'N/A'}, District: ${district || 'N/A'}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    if (!process.env.WEATHER_API_KEY) {
      console.log('⚠️ Weather API key not found, using mock data');
      const mockWeatherData = {
        location: location || 'Unknown',
        temperature: Math.round(Math.random() * 15 + 20),
        humidity: Math.round(Math.random() * 30 + 50),
        precipitation: Math.round(Math.random() * 10),
        windSpeed: Math.round(Math.random() * 15 + 5),
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        forecast: Array.from({ length: 7 }, (_, i) => ({
          day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
          temperature: Math.round(Math.random() * 15 + 20),
          condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
        }))
      };
      
      return res.json({
        success: true,
        weather: mockWeatherData,
        coordinates: { latitude: null, longitude: null },
        dataSource: 'mock_weather_service'
      });
    }

    // First, get coordinates for the location using OpenWeatherMap Geocoding API
    console.log('🔍 Getting coordinates for location...');
    const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${process.env.WEATHER_API_KEY}`;
    
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.log('❌ Location not found in geocoding service');
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    const { lat, lon, name } = geocodeResponse.data[0];
    console.log(`📍 Coordinates found: Lat: ${lat}, Lon: ${lon}, Name: ${name}`);

    // Get current weather
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    const weatherResponse = await axios.get(weatherUrl);

    // Get 7-day forecast
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    const forecastResponse = await axios.get(forecastUrl);

    // Process current weather data
    const currentWeather = weatherResponse.data;
    const weatherData = {
      location: name || location,
      temperature: Math.round(currentWeather.main.temp),
      feelsLike: Math.round(currentWeather.main.feels_like),
      humidity: currentWeather.main.humidity,
      precipitation: currentWeather.rain ? currentWeather.rain['1h'] || 0 : 0,
      windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: currentWeather.wind.deg,
      pressure: currentWeather.main.pressure,
      visibility: currentWeather.visibility ? currentWeather.visibility / 1000 : null, // Convert to km
      condition: currentWeather.weather[0].main,
      description: currentWeather.weather[0].description,
      icon: currentWeather.weather[0].icon,
      cloudiness: currentWeather.clouds.all,
      sunrise: new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString(),
      forecast: []
    };

    // Process forecast data (get daily forecasts)
    const dailyForecasts = {};
    forecastResponse.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          day: new Date(item.dt * 1000).toLocaleDateString(),
          temperatures: [item.main.temp],
          conditions: [item.weather[0].main],
          descriptions: [item.weather[0].description],
          humidity: [item.main.humidity],
          precipitation: item.rain ? item.rain['3h'] || 0 : 0
        };
      } else {
        dailyForecasts[date].temperatures.push(item.main.temp);
        dailyForecasts[date].conditions.push(item.weather[0].main);
        dailyForecasts[date].descriptions.push(item.weather[0].description);
        dailyForecasts[date].humidity.push(item.main.humidity);
        if (item.rain && item.rain['3h']) {
          dailyForecasts[date].precipitation += item.rain['3h'];
        }
      }
    });

    // Convert to array and calculate averages
    weatherData.forecast = Object.values(dailyForecasts).slice(0, 7).map(day => ({
      day: day.day,
      date: day.date,
      minTemp: Math.round(Math.min(...day.temperatures)),
      maxTemp: Math.round(Math.max(...day.temperatures)),
      avgTemp: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length),
      condition: day.conditions[0], // Most common condition
      description: day.descriptions[0],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      precipitation: Math.round(day.precipitation * 10) / 10
    }));

    console.log('🌡️ Real Weather Data Retrieved:');
    console.log(`Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)`);
    console.log(`Humidity: ${weatherData.humidity}%`);
    console.log(`Condition: ${weatherData.condition} - ${weatherData.description}`);
    console.log(`Wind: ${weatherData.windSpeed} km/h`);
    console.log(`Forecast days: ${weatherData.forecast.length}`);
    console.log(`✅ Real Weather API Response sent successfully`);

    res.json({
      success: true,
      weather: weatherData,
      coordinates: { latitude: lat, longitude: lon },
      dataSource: 'openweathermap_api'
    });

  } catch (error) {
    console.error('❌ Weather data error:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    // Fallback to mock data on API error
    const fallbackWeatherData = {
      location: location || 'Unknown',
      temperature: Math.round(Math.random() * 15 + 20),
      humidity: Math.round(Math.random() * 30 + 50),
      precipitation: Math.round(Math.random() * 10),
      windSpeed: Math.round(Math.random() * 15 + 5),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      forecast: Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        temperature: Math.round(Math.random() * 15 + 20),
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
      }))
    };

    res.json({
      success: true,
      weather: fallbackWeatherData,
      coordinates: { latitude: null, longitude: null },
      dataSource: 'fallback_after_api_error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Weather service temporarily unavailable'
    });
  }
});

// Root welcome route
app.get('/', (req, res) => res.json({ message: 'Welcome to the Crop Yield Prediction Platform API' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/market', marketRoutes);
app.use('/api', predictionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/diseases', diseaseRoutes);

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

// Database connection helper (optional)
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  No MONGODB_URI provided. Running without database connection.');
    console.log('📝 Database-related features will be disabled.');
    return false;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected successfully. Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('⚠️  MongoDB connection failed:', error && error.message ? error.message : error);
    console.log('🚀 Server will continue without database connection.');
    return false;
  }
};

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Try to connect to database (optional)
    const dbConnected = await connectDB();
    
    // Start server regardless of database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Disabled'}`);
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