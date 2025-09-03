require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// Test the complete prediction flow: signup -> verify -> login -> predict
async function testCompletePredictionFlow() {
  console.log('🚀 Testing Complete Prediction Flow\n');
  
  const email = `testpred${Date.now()}@example.com`;
  const password = 'testpass123';
  let authToken = '';
  
  try {
    // Step 1: Signup
    console.log('1️⃣ Creating test user...');
    const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Test Prediction User',
      email,
      password,
      farmDetails: {
        farmName: 'Test Farm',
        location: 'Test District, Test State',
        totalArea: 10
      }
    });
    
    console.log('✅ Signup successful:', {
      userId: signupRes.data.userId,
      emailQueued: signupRes.data.emailQueued
    });
    
    const userId = signupRes.data.userId;
    const devOTP = signupRes.data.devNote?.match(/OTP: (\d+)/)?.[1];
    
    if (devOTP) {
      console.log(`🔢 Dev OTP found: ${devOTP}`);
      
      // Step 2: Verify OTP
      console.log('\n2️⃣ Verifying OTP...');
      const verifyRes = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
        userId,
        otp: devOTP
      });
      
      console.log('✅ OTP verification successful');
      authToken = verifyRes.data.user.token;
      
      // Step 3: Test prediction with API fetching
      console.log('\n3️⃣ Testing prediction with API data fetching...');
      
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
      
      console.log('📤 Sending prediction request (with API fetch)...');
      const predRes1 = await axios.post(`${API_BASE}/api/predict`, predictionData1, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Prediction with API fetch successful!');
      console.log('📊 Prediction result:', {
        predictionId: predRes1.data.predictionId,
        yield: predRes1.data.prediction.yield_tons,
        confidence: predRes1.data.prediction.confidence_score,
        mlModelUsed: predRes1.data.technical.ml_model_used
      });
      
      // Step 4: Test prediction with user-provided data
      console.log('\n4️⃣ Testing prediction with user-provided data...');
      
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
      
      console.log('📤 Sending prediction request (user data)...');
      const predRes2 = await axios.post(`${API_BASE}/api/predict`, predictionData2, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Prediction with user data successful!');
      console.log('📊 Prediction result:', {
        predictionId: predRes2.data.predictionId,
        yield: predRes2.data.prediction.yield_tons,
        confidence: predRes2.data.prediction.confidence_score,
        mlModelUsed: predRes2.data.technical.ml_model_used
      });
      
      // Step 5: Get user predictions
      console.log('\n5️⃣ Testing get user predictions...');
      const getUserPredRes = await axios.get(`${API_BASE}/api/predictions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('✅ Get predictions successful!');
      console.log('📈 User has', getUserPredRes.data.count, 'predictions');
      
      console.log('\n🎉 ALL TESTS PASSED! Complete prediction flow working correctly.');
      
    } else {
      console.log('⚠️ No dev OTP found, cannot complete verification flow');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Test just the prediction API structure (without auth)
async function testPredictionStructure() {
  console.log('📋 Prediction API Data Structure Test\n');
  
  const testCases = [
    {
      name: 'Rice with API Fetching',
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
      name: 'Wheat with User Data',
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
    },
    {
      name: 'Corn with Coordinates',
      data: {
        cropType: 'Corn',
        landArea: 4.0,
        location: {
          state: 'Maharashtra',
          district: 'Pune',
          coordinates: {
            latitude: 18.5204,
            longitude: 73.8567
          }
        },
        plantingDate: '2024-07-01',
        fetchData: true
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}️⃣ ${testCase.name}:`);
    console.log(JSON.stringify(testCase.data, null, 2));
    console.log('');
  });
  
  console.log('✅ Data structures ready for prediction API testing!');
}

// Run the tests
console.log('Choose test to run:');
console.log('1. Complete Flow Test (requires server running)');
console.log('2. Structure Test (just shows data format)');

// Run complete flow test
testCompletePredictionFlow();
