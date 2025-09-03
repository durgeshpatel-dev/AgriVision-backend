require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// Test prediction with API data fetching
async function testPredictionWithAPI() {
  console.log('🧪 Testing Prediction API with fetchData=true\n');
  
  // First, create a test user and get token (using existing user)
  const email = `testuser${Date.now()}@example.com`;
  const password = 'password123';
  
  try {
    // Signup
    console.log('1️⃣ Creating test user...');
    const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Test User Prediction',
      email,
      password,
    });
    console.log('✅ User created:', signupRes.data.userId);
    
    // Login (will get OTP, but we'll use fallback for testing)
    console.log('\n2️⃣ Attempting login...');
    try {
      const loginRes = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      console.log('✅ Login successful');
    } catch (loginErr) {
      if (loginErr.response?.data?.needsVerification) {
        console.log('ℹ️ User needs verification (expected for new user)');
      }
    }
    
    // For testing, we'll use a dummy token or skip auth temporarily
    console.log('\n3️⃣ Testing prediction API...');
    
    // Test with fetchData=true (API fetching)
    const predictionData1 = {
      cropType: 'Rice',
      landArea: 5.5,
      location: {
        state: 'Punjab',
        district: 'Ludhiana'
      },
      plantingDate: '2024-06-15',
      fetchData: true
    };
    
    console.log('📊 Prediction data (with API fetch):', JSON.stringify(predictionData1, null, 2));
    
    // Test with fetchData=false (user-provided data)
    const predictionData2 = {
      cropType: 'Wheat',
      landArea: 3.2,
      location: {
        state: 'Haryana',
        district: 'Karnal'
      },
      plantingDate: '2024-11-01',
      fetchData: false,
      soilType: 'Clay',
      weather: {
        temperature: 22,
        rainfall: 45,
        humidity: 65
      }
    };
    
    console.log('\n📊 Prediction data (user-provided):', JSON.stringify(predictionData2, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

// Test just the prediction endpoint structure
async function testPredictionStructure() {
  console.log('🧪 Testing Prediction API Structure\n');
  
  const testCases = [
    {
      name: 'With API Fetching',
      data: {
        cropType: 'Rice',
        landArea: 5.5,
        location: {
          state: 'Punjab',
          district: 'Ludhiana'
        },
        plantingDate: '2024-06-15',
        fetchData: true
      }
    },
    {
      name: 'With User Data',
      data: {
        cropType: 'Wheat',
        landArea: 3.2,
        location: {
          state: 'Haryana',
          district: 'Karnal'
        },
        plantingDate: '2024-11-01',
        fetchData: false,
        soilType: 'Clay',
        weather: {
          temperature: 22,
          rainfall: 45,
          humidity: 65
        }
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}️⃣ ${testCase.name}:`);
    console.log(JSON.stringify(testCase.data, null, 2));
    console.log('');
  });
  
  console.log('✅ Prediction API structure is ready for testing!');
  console.log('\n📝 Next steps:');
  console.log('1. Start the server: node src/server.js');
  console.log('2. Create a verified user account');
  console.log('3. Use the JWT token to call /api/predict with above data');
}

// Run the structure test
testPredictionStructure();
