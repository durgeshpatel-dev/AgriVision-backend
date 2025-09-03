require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// Test the ML API integration with correct data format
async function testMLIntegration() {
  console.log('🧪 === TESTING ML API INTEGRATION ===\n');
  
  // Test data scenarios
  const testScenarios = [
    {
      name: 'Valid Rice Production (API Fetch)',
      data: {
        cropType: 'Rice',
        landArea: 2.5,
        location: {
          state: 'West Bengal',
          district: 'Kolkata'
        },
        plantingDate: '2024-06-15',
        fetchData: true
      }
    },
    {
      name: 'Valid Wheat Production (User Data)',
      data: {
        cropType: 'Wheat',
        landArea: 5.0,
        location: {
          state: 'Madhya Pradesh',
          district: 'Bhopal'
        },
        plantingDate: '2024-11-01',
        fetchData: false,
        soilType: 'Black',
        weather: {
          temperature: 22,
          rainfall: 45,
          humidity: 65
        }
      }
    },
    {
      name: 'Sugarcane with API Fetch',
      data: {
        cropType: 'Sugarcane',
        landArea: 3.2,
        location: {
          state: 'Gujarat',
          district: 'Surat'
        },
        plantingDate: '2024-03-15',
        fetchData: true
      }
    },
    {
      name: 'Invalid State (Should Fallback)',
      data: {
        cropType: 'Maize',
        landArea: 1.8,
        location: {
          state: 'Punjab', // Not in valid states list
          district: 'Ludhiana'
        },
        plantingDate: '2024-07-01',
        fetchData: false,
        soilType: 'Loamy',
        weather: {
          temperature: 28,
          rainfall: 80,
          humidity: 75
        }
      }
    }
  ];
  
  console.log('📋 Test Scenarios:');
  testScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   Expected ML API Input:`);
    
    // Show what the ML API should receive
    const plantingDate = new Date(scenario.data.plantingDate);
    const mlFormat = {
      Year: plantingDate.getFullYear(),
      State: scenario.data.location.state,
      District: scenario.data.location.district,
      Area_1000_ha: (scenario.data.landArea / 1000).toFixed(3),
      Crop: scenario.data.cropType.toUpperCase(),
      Rainfall_mm: scenario.data.weather?.rainfall || 50,
      Temp_C: scenario.data.weather?.temperature || 25,
      Soil_Type: scenario.data.soilType || 'Loamy'
    };
    
    console.log(`   ${JSON.stringify(mlFormat, null, 6)}`);
    console.log('');
  });
  
  console.log('🔧 Setup Instructions:');
  console.log('1. Make sure your ML API server is running');
  console.log('2. Update .env with correct ML_MODEL_API_URL');
  console.log('3. Create a verified user account');
  console.log('4. Use the prediction data above with proper JWT token');
  console.log('');
  
  console.log('📡 ML API Expected Response Format:');
  console.log(JSON.stringify({
    predicted_yield: 12.5,
    confidence: 0.85,
    model_version: "v1.0",
    processing_time: "0.234s",
    factors: ["weather", "soil", "location"],
    recommendations: ["Consider irrigation", "Monitor weather"],
    risk_factors: ["Drought risk: Low", "Pest risk: Medium"]
  }, null, 2));
  
  console.log('');
  console.log('✅ ML API Integration Structure Ready!');
  console.log('🚀 Start server and test with: node src/server.js');
}

// Test ML API directly (mock)
async function testMLAPIDirectly() {
  console.log('\n🎯 === TESTING ML API DIRECT CALL ===\n');
  
  const sampleMLInput = {
    Year: 2024,
    State: 'West Bengal',
    District: 'Kolkata',
    Area_1000_ha: 2.500,
    Crop: 'RICE',
    Rainfall_mm: 120.0,
    Temp_C: 28.5,
    Soil_Type: 'Alluvial'
  };
  
  console.log('📤 Sample ML API Input:');
  console.log(JSON.stringify(sampleMLInput, null, 2));
  
  if (!process.env.ML_MODEL_API_URL) {
    console.log('⚠️ ML_MODEL_API_URL not set in .env file');
    console.log('💡 Add: ML_MODEL_API_URL=http://your-ml-api-url/predict');
    return;
  }
  
  try {
    console.log(`\n🚀 Calling ML API at: ${process.env.ML_MODEL_API_URL}`);
    
    const response = await axios.post(process.env.ML_MODEL_API_URL, sampleMLInput, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ ML API Response:');
    console.log(`Status: ${response.status}`);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ML API Call Failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    } else {
      console.log(`Error: ${error.message}`);
    }
    console.log('');
    console.log('💡 This is expected if ML API is not running');
    console.log('   The backend will use fallback calculations');
  }
}

// Run tests
testMLIntegration();
testMLAPIDirectly();
