require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// Test weather and soil API fetching
async function testAPIDataFetching() {
  console.log('🧪 === TESTING WEATHER & SOIL API FETCHING ===\n');
  
  // Create a test user first
  const email = `testapi${Date.now()}@example.com`;
  const password = 'password123';
  let token = null;
  
  try {
    // 1. Signup
    console.log('1️⃣ Creating test user...');
    const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'API Test User',
      email,
      password,
    });
    console.log('✅ User created:', signupRes.data.userId);
    const userId = signupRes.data.userId;
    
    // 2. Get OTP from server logs (for testing, we'll use a demo OTP)
    console.log('\n2️⃣ Verifying with demo OTP...');
    // In real scenario, get OTP from email/server logs
    
    // For testing, let's try to login and see what happens
    try {
      const loginRes = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      token = loginRes.data.token;
      console.log('✅ Login successful, got token');
    } catch (loginErr) {
      if (loginErr.response?.data?.needsVerification) {
        console.log('ℹ️ User needs verification, will test without token first');
      }
    }
    
    // 3. Test prediction with API data fetching (even without token to test the APIs)
    console.log('\n3️⃣ Testing prediction with fetchData=true...');
    
    const predictionData = {
      cropType: 'Rice',
      landArea: 2.5,
      location: {
        state: 'Gujarat',
        district: 'Surat'
      },
      plantingDate: '2024-06-15',
      fetchData: true // This should trigger weather and soil API calls
    };
    
    console.log('📊 Prediction data:', JSON.stringify(predictionData, null, 2));
    
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const predictionRes = await axios.post(`${API_BASE}/api/predict`, predictionData, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      console.log('✅ Prediction API called successfully');
      console.log('📋 Response data:', JSON.stringify(predictionRes.data, null, 2));
      
    } catch (predErr) {
      if (predErr.response?.status === 401) {
        console.log('⚠️ Authentication required for prediction API');
        console.log('Response:', predErr.response.data);
      } else {
        console.log('❌ Prediction API error:', predErr.response?.data || predErr.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test weather API directly
async function testWeatherAPIDirect() {
  console.log('\n🌤️ === TESTING WEATHER API DIRECTLY ===\n');
  
  if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === 'your_openweathermap_api_key_here') {
    console.log('⚠️ Weather API key not configured in .env');
    console.log('💡 Get an API key from: https://openweathermap.org/api');
    console.log('💡 Add to .env: WEATHER_API_KEY=your_actual_api_key');
    return;
  }
  
  try {
    const location = 'Surat, Gujarat';
    console.log(`🌤️ Testing weather API for: ${location}`);
    
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    console.log('✅ Weather API Success!');
    console.log('📊 Weather Data:');
    console.log(`   Temperature: ${response.data.main.temp}°C`);
    console.log(`   Humidity: ${response.data.main.humidity}%`);
    console.log(`   Coordinates: ${response.data.coord.lat}, ${response.data.coord.lon}`);
    console.log(`   Weather: ${response.data.weather[0].description}`);
    
  } catch (error) {
    console.log('❌ Weather API failed:', error.response?.data || error.message);
  }
}

// Test soil API directly
async function testSoilAPIDirect() {
  console.log('\n🌱 === TESTING SOIL API DIRECTLY ===\n');
  
  try {
    const lat = 21.1702;  // Surat coordinates
    const lon = 72.8311;
    
    console.log(`🌱 Testing soil API for coordinates: ${lat}, ${lon}`);
    
    const response = await axios.get('https://rest.soilgrids.org/soilgrids/v2.0/properties/query', {
      params: {
        lon: lon,
        lat: lat,
        property: 'sand,clay,silt',
        depth: '0-5cm'
      }
    });
    
    console.log('✅ Soil API Success!');
    const data = response.data;
    const sand = data.properties.sand.layers[0].mean;
    const clay = data.properties.clay.layers[0].mean;
    const silt = data.properties.silt.layers[0].mean;
    
    console.log('📊 Soil Composition:');
    console.log(`   Sand: ${sand}%`);
    console.log(`   Clay: ${clay}%`);
    console.log(`   Silt: ${silt}%`);
    
    // Determine soil type
    let soilType = 'Loamy';
    if (sand > 70) soilType = 'Sandy';
    else if (clay > 40) soilType = 'Clay';
    else if (silt > 40) soilType = 'Silty';
    
    console.log(`   Determined Soil Type: ${soilType}`);
    
  } catch (error) {
    console.log('❌ Soil API failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testWeatherAPIDirect();
  await testSoilAPIDirect();
  await testAPIDataFetching();
  
  console.log('\n📋 Summary:');
  console.log('- Weather API: Check if API key is configured and working');
  console.log('- Soil API: Should work without authentication');
  console.log('- Integration: Check server logs for detailed API fetch logs');
  console.log('\n🔍 Check the server terminal for detailed logs of API calls!');
}

runAllTests();
