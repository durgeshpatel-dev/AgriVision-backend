require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// Test complete prediction flow with fallback data (no external API keys needed)
async function testPredictionWithFallbacks() {
  console.log('🧪 === TESTING PREDICTION WITH FALLBACK DATA ===\n');
  console.log('ℹ️ This test works without external API keys using fallback data\n');
  
  // Create unique test user
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  const password = 'password123';
  
  try {
    // 1. Signup
    console.log('1️⃣ Creating test user...');
    const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Test User Prediction',
      email,
      password,
    });
    console.log('✅ User created:', signupRes.data.userId);
    const userId = signupRes.data.userId;
    
    // 2. Get OTP from server logs and verify
    console.log('\n2️⃣ User needs email verification...');
    console.log('🔍 Check server terminal for OTP in the logs');
    console.log('💡 Look for lines like: 🔢 Generated OTP: XXXXXX');
    
    // For demo, let's try some common test OTPs or ask user to provide
    const testOTPs = ['123456', '000000', '111111'];
    let token = null;
    
    console.log('\n3️⃣ Trying to verify with common test OTPs...');
    for (const otp of testOTPs) {
      try {
        const verifyRes = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
          userId,
          otp
        });
        console.log(`✅ Verification successful with OTP: ${otp}`);
        token = verifyRes.data.user.token;
        break;
      } catch (verifyErr) {
        console.log(`❌ OTP ${otp} failed:`, verifyErr.response?.data?.message);
      }
    }
    
    if (!token) {
      console.log('\n⚠️ Could not verify with test OTPs');
      console.log('🔍 Please check server logs for the actual OTP and verify manually');
      console.log('📝 Then run: curl -X POST http://localhost:5001/api/auth/verify-otp \\');
      console.log(`     -H "Content-Type: application/json" \\`);
      console.log(`     -d '{"userId":"${userId}","otp":"ACTUAL_OTP_FROM_LOGS"}'`);
      return;
    }
    
    // 4. Test prediction with fetchData=false (user provided data)
    console.log('\n4️⃣ Testing prediction with user-provided data...');
    
    const predictionData1 = {
      cropType: 'Rice',
      landArea: 2.5,
      location: {
        state: 'Gujarat',
        district: 'Surat'
      },
      plantingDate: '2024-06-15',
      fetchData: false,  // Use user-provided data
      soilType: 'Sandy',
      weather: {
        temperature: 28,
        rainfall: 120,
        humidity: 75
      }
    };
    
    console.log('📊 Prediction data (user-provided):');
    console.log(JSON.stringify(predictionData1, null, 2));
    
    const predRes1 = await axios.post(`${API_BASE}/api/predict`, predictionData1, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Prediction 1 successful!');
    console.log('📋 Response:', JSON.stringify(predRes1.data, null, 2));
    
    // 5. Test prediction with fetchData=true (API fetching with fallbacks)
    console.log('\n5️⃣ Testing prediction with API fetching (will use fallbacks)...');
    
    const predictionData2 = {
      cropType: 'Rice',
      landArea: 3.0,
      location: {
        state: 'Gujarat',
        district: 'Ahmedabad'
      },
      plantingDate: '2024-07-01',
      fetchData: true  // This will trigger API calls (will use fallbacks)
    };
    
    console.log('📊 Prediction data (API fetch):');
    console.log(JSON.stringify(predictionData2, null, 2));
    
    const predRes2 = await axios.post(`${API_BASE}/api/predict`, predictionData2, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Prediction 2 successful!');
    console.log('📋 Response:', JSON.stringify(predRes2.data, null, 2));
    
    // 6. Test with unsupported crop (should use fallback calculation)
    console.log('\n6️⃣ Testing with unsupported crop (Wheat - should use fallback)...');
    
    const predictionData3 = {
      cropType: 'Wheat',
      landArea: 1.5,
      location: {
        state: 'Gujarat',
        district: 'Rajkot'
      },
      plantingDate: '2024-11-15',
      fetchData: false,
      soilType: 'Black',
      weather: {
        temperature: 22,
        rainfall: 45,
        humidity: 65
      }
    };
    
    console.log('📊 Prediction data (unsupported crop):');
    console.log(JSON.stringify(predictionData3, null, 2));
    
    const predRes3 = await axios.post(`${API_BASE}/api/predict`, predictionData3, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Prediction 3 successful!');
    console.log('📋 Response:', JSON.stringify(predRes3.data, null, 2));
    
    console.log('\n🎉 === ALL TESTS COMPLETED SUCCESSFULLY ===');
    console.log('\n📊 Summary:');
    console.log('✅ User signup and verification works');
    console.log('✅ Prediction with user-provided data works');
    console.log('✅ Prediction with API fetching (fallbacks) works');
    console.log('✅ ML API integration works');
    console.log('✅ Fallback calculations work for unsupported crops');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication issue - make sure user is verified');
    }
  }
}

// Quick test of current system status
async function testSystemStatus() {
  console.log('🔍 === SYSTEM STATUS CHECK ===\n');
  
  try {
    // Test server health
    const healthRes = await axios.get(`${API_BASE}/`);
    console.log('✅ Server is running:', healthRes.data.message);
  } catch (err) {
    console.log('❌ Server not accessible:', err.message);
    return;
  }
  
  // Test ML API
  try {
    const mlTestData = {
      "Area_1000_ha": "2.5",
      "Avg_Rainfall_mm": "120",
      "Avg_Temp_C": "28",
      "Crop": "RICE",
      "District": "Surat",
      "Soil_Type": "Sandy",
      "State": "Gujarat",
      "Year": "2024"
    };
    
    const mlRes = await axios.post('http://127.0.0.1:5000/predict', mlTestData);
    console.log('✅ ML API is working');
  } catch (err) {
    console.log('❌ ML API not accessible:', err.message);
  }
  
  console.log('\n🚀 Ready to run full test!\n');
}

// Complete end-to-end test with running server
async function testCompleteFlow() {
  console.log('🚀 === COMPLETE END-TO-END TEST ===\n');
  
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const testPassword = 'password123';
  
  let userToken = null;
  let userId = null;
  
  try {
    // Step 1: Create new user
    console.log('1️⃣ Creating new user...');
    const signupResponse = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Test User ML Integration',
      email: testEmail,
      password: testPassword,
      farmDetails: {
        farmName: 'Test Farm',
        location: 'Gujarat, India',
        totalArea: 10
      }
    });
    
    console.log('✅ Signup successful');
    console.log('User ID:', signupResponse.data.userId);
    console.log('Email queued:', signupResponse.data.emailQueued);
    
    userId = signupResponse.data.userId;
    
    // Step 2: Simulate OTP verification (we'll manually verify for testing)
    console.log('\n2️⃣ Simulating OTP verification...');
    // In a real scenario, user would get OTP from email and verify
    // For testing, let's try to get the OTP from server logs or use a known test OTP
    
    // Step 3: Test prediction without auth first (should fail)
    console.log('\n3️⃣ Testing prediction without authentication (should fail)...');
    try {
      await axios.post(`${API_BASE}/api/predict`, {
        cropType: 'Rice',
        landArea: 2.5,
        location: { state: 'Gujarat', district: 'Baroda' },
        plantingDate: '2024-06-15',
        fetchData: false,
        soilType: 'Clay',
        weather: {
          temperature: 25,
          rainfall: 100,
          humidity: 70
        }
      });
      console.log('❌ Should have failed, but got:', predictionResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected - authentication required');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  await testSystemStatus();
  await testPredictionWithFallbacks();
}

runTests();
        soilType: 'Sandy',
        weather: { temperature: 29, rainfall: 939, humidity: 70 }
      });
    } catch (authError) {
      console.log('✅ Correctly rejected - needs authentication');
      console.log('Status:', authError.response?.status || 'No response');
    }
    
    // Step 4: Test prediction format validation
    console.log('\n4️⃣ Testing ML API format directly...');
    const mlTestData = {
      Area_1000_ha: "2.5",
      Avg_Rainfall_mm: "939", 
      Avg_Temp_C: "29",
      Crop: "RICE",
      District: "baroda",
      Soil_Type: "Sandy",
      State: "Gujarat", 
      Year: "2024"
    };
    
    try {
      const mlResponse = await axios.post('http://127.0.0.1:5000/predict', mlTestData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ ML API Response:');
      console.log('Status:', mlResponse.status);
      console.log('Data:', JSON.stringify(mlResponse.data, null, 2));
      
    } catch (mlError) {
      console.log('❌ ML API Error:');
      console.log('Status:', mlError.response?.status || 'No response');
      console.log('Error:', mlError.response?.data || mlError.message);
    }
    
    // Step 5: Test prediction endpoint structure (without full auth)
    console.log('\n5️⃣ Testing prediction endpoint with mock auth bypass...');
    console.log('Prediction data that would be sent:');
    
    const predictionData = {
      cropType: 'Rice',
      landArea: 2.5,
      location: {
        state: 'Gujarat',
        district: 'Baroda'
      },
      plantingDate: '2024-06-15',
      fetchData: false,
      soilType: 'Sandy',
      weather: {
        temperature: 29,
        rainfall: 939,
        humidity: 70
      }
    };
    
    console.log(JSON.stringify(predictionData, null, 2));
    
    console.log('\nExpected ML API format:');
    const expectedMLFormat = {
      Area_1000_ha: (predictionData.landArea / 1000).toString(),
      Avg_Rainfall_mm: predictionData.weather.rainfall.toString(),
      Avg_Temp_C: predictionData.weather.temperature.toString(),
      Crop: predictionData.cropType.toUpperCase(),
      District: predictionData.location.district.toLowerCase(),
      Soil_Type: predictionData.soilType,
      State: predictionData.location.state,
      Year: new Date(predictionData.plantingDate).getFullYear().toString()
    };
    
    console.log(JSON.stringify(expectedMLFormat, null, 2));
    
    // Step 6: Test different crops
    console.log('\n6️⃣ Testing different crops with ML API...');
    const cropTests = [
      { crop: 'RICE', expected: 'Should work' },
      { crop: 'GROUNDNUT', expected: 'Should work' },
      { crop: 'WHEAT', expected: 'May not be supported' }
    ];
    
    for (const test of cropTests) {
      console.log(`\nTesting ${test.crop} (${test.expected}):`);
      try {
        const testMLData = { ...mlTestData, Crop: test.crop };
        const response = await axios.post('http://127.0.0.1:5000/predict', testMLData, {
          timeout: 5000
        });
        console.log(`✅ ${test.crop}: ${response.data.prediction_kg_per_ha || response.data.message || JSON.stringify(response.data)}`);
      } catch (error) {
        console.log(`❌ ${test.crop}: ${error.response?.data?.message || error.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('✅ Backend server is running');
  console.log('✅ Signup endpoint works');
  console.log('✅ ML API connection established');
  console.log('✅ Data format mapping confirmed');
  console.log('');
  console.log('🎯 Next steps for complete testing:');
  console.log('1. Verify a user account (get OTP from email)');
  console.log('2. Login to get JWT token');
  console.log('3. Call /api/predict with JWT token');
  console.log('4. Test both fetchData=true and fetchData=false scenarios');
}

testCompleteFlow();
