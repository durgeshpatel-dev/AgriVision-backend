require('dotenv').config();
const axios = require('axios');

// Test the exact format your ML API expects
async function testCorrectFormat() {
  console.log('🎯 === TESTING CORRECT ML API FORMAT ===\n');
  
  const ML_URL = 'http://127.0.0.1:5000/predict';
  
  // Test with the exact format you provided
  const correctFormat = {
    Year: "2025",
    State: "Gujarat", 
    District: "baroda",
    Area_1000_ha: "1",
    Crop: "RICE",
    Avg_Rainfall_mm: "939",
    Avg_Temp_C: "29",
    Soil_Type: "Sandy"
  };
  
  console.log('📤 Testing with your exact format:');
  console.log(JSON.stringify(correctFormat, null, 2));
  
  try {
    const response = await axios.post(ML_URL, correctFormat, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ SUCCESS! ML API responded:');
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test with different values
    console.log('\n🧪 Testing with different crop and location:');
    const testFormat2 = {
      Year: "2024",
      State: "West Bengal",
      District: "kolkata", 
      Area_1000_ha: "2.5",
      Crop: "WHEAT",
      Avg_Rainfall_mm: "120",
      Avg_Temp_C: "25",
      Soil_Type: "Alluvial"
    };
    
    console.log('📤 Second test:');
    console.log(JSON.stringify(testFormat2, null, 2));
    
    const response2 = await axios.post(ML_URL, testFormat2, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ Second test successful:');
    console.log(`Status: ${response2.status}`);
    console.log('Response:', JSON.stringify(response2.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ ML API call failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

// Test the AgriVision backend prediction endpoint
async function testPredictionEndpoint() {
  console.log('\n🌾 === TESTING AGRIVISION PREDICTION ENDPOINT ===\n');
  
  // This simulates what the frontend would send
  const predictionData = {
    cropType: 'Rice',
    landArea: 1000, // 1000 hectares = 1 thousand hectares
    location: {
      state: 'Gujarat',
      district: 'Baroda'
    },
    plantingDate: '2025-06-15',
    fetchData: false,
    soilType: 'Sandy',
    weather: {
      temperature: 29,
      rainfall: 939,
      humidity: 70
    }
  };
  
  console.log('📤 Frontend prediction request:');
  console.log(JSON.stringify(predictionData, null, 2));
  
  console.log('\n🔄 This should transform to ML API format:');
  const expectedMLFormat = {
    Year: "2025",
    State: "Gujarat",
    District: "baroda", // lowercase
    Area_1000_ha: "1.000", // 1000/1000 = 1
    Crop: "RICE",
    Avg_Rainfall_mm: "939",
    Avg_Temp_C: "29", 
    Soil_Type: "Sandy"
  };
  console.log(JSON.stringify(expectedMLFormat, null, 2));
  
  console.log('\n💡 To test this:');
  console.log('1. Start the server: node src/server.js');
  console.log('2. Create a verified user and get JWT token');
  console.log('3. POST to /api/predict with above data');
}

// Run tests
async function runTests() {
  await testCorrectFormat();
  await testPredictionEndpoint();
  
  console.log('\n🎉 If the ML API tests passed, the integration is ready!');
}

runTests();
