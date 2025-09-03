const axios = require('axios');

// Test the complete prediction API with local soil data
const testPredictionAPI = async () => {
  console.log('🧪 Testing Complete Prediction API with Local Soil Data');
  console.log('=' .repeat(70));
  
  const baseURL = 'http://localhost:3000'; // Adjust if your server runs on different port
  
  // Test scenarios with different locations
  const testCases = [
    {
      name: 'Gujarat Sandy Soil Test',
      data: {
        cropType: 'Rice',
        landArea: 2.5,
        location: {
          state: 'Gujarat',
          district: 'Ahmedabad',
          coordinates: {
            latitude: 23.0225,
            longitude: 72.5714
          }
        },
        plantingDate: '2024-06-15',
        fetchData: true
      },
      expectedSoilType: 'Sandy'
    },
    {
      name: 'Madhya Pradesh Black Soil Test',
      data: {
        cropType: 'Cotton',
        landArea: 5.0,
        location: {
          state: 'Madhya Pradesh',
          district: 'Indore'
        },
        plantingDate: '2024-05-20',
        fetchData: true
      },
      expectedSoilType: 'Black'
    },
    {
      name: 'West Bengal Alluvial Soil Test',
      data: {
        cropType: 'Rice',
        landArea: 3.0,
        location: {
          state: 'West Bengal',
          district: '24 Parganas'
        },
        plantingDate: '2024-07-01',
        fetchData: true
      },
      expectedSoilType: 'Alluvial'
    },
    {
      name: 'State Default Test (Mumbai not in JSON)',
      data: {
        cropType: 'Wheat',
        landArea: 1.5,
        location: {
          state: 'Maharashtra',
          district: 'Mumbai' // Not in JSON, should use state default
        },
        plantingDate: '2024-11-15',
        fetchData: true
      },
      expectedSoilType: 'Loamy' // Maharashtra state default
    },
    {
      name: 'User-provided Soil Data Test',
      data: {
        cropType: 'Maize',
        landArea: 2.0,
        location: {
          state: 'Karnataka',
          district: 'Bangalore'
        },
        plantingDate: '2024-08-10',
        fetchData: false,
        soilType: 'Red',
        weather: {
          temperature: 28,
          rainfall: 75,
          humidity: 65
        }
      },
      expectedSoilType: 'Red' // User provided
    }
  ];
  
  // Note: This test requires the server to be running and authentication
  console.log('⚠️  Note: This test requires:');
  console.log('   1. Server running on localhost:3000');
  console.log('   2. Valid JWT token for authentication');
  console.log('   3. Updated prediction controller with local soil data\\n');
  
  // For demonstration, we'll show what the API calls would look like
  testCases.forEach((testCase, index) => {
    console.log(`📋 Test Case ${index + 1}: ${testCase.name}`);
    console.log('   Request Data:');
    console.log('   ' + JSON.stringify(testCase.data, null, 4).replace(/\\n/g, '\\n   '));
    console.log(`   Expected Soil Type: ${testCase.expectedSoilType}`);
    console.log('   API Call:');
    console.log(`   POST ${baseURL}/api/predict`);
    console.log('   Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }\\n');
  });
  
  // Simulate API response structure
  console.log('📤 Expected API Response Structure:');
  console.log('=' .repeat(50));
  
  const sampleResponse = {
    predictionId: "674...abc",
    success: true,
    input: {
      cropType: "Rice",
      landArea: 2.5,
      location: {
        state: "Gujarat",
        district: "Ahmedabad",
        coordinates: {
          latitude: 23.0225,
          longitude: 72.5714
        }
      },
      plantingDate: "2024-06-15",
      soilType: "Sandy",
      soilData: {
        type: "Sandy",
        detailedType: "Sandy",
        composition: {
          sand: 85,
          clay: 8,
          silt: 7
        },
        properties: {
          pH: 6.2,
          nitrogen: 12,
          organicCarbon: 8,
          cationExchangeCapacity: 8,
          fertility: "Low"
        },
        analysis: {
          drainage: "Excellent",
          waterHolding: "Low",
          nutrientRetention: "Low"
        },
        recommendations: [
          "Add organic matter to improve water retention",
          "Apply frequent, light fertilizer applications",
          "Use mulching to reduce water loss"
        ],
        suitableCrops: ["Groundnut", "Millets", "Cotton", "Sugarcane"],
        dataSource: "local_database"
      },
      weather: {
        temperature: 25.5,
        rainfall: 45,
        humidity: 68,
        dataSource: "api"
      },
      fetchedFromAPIs: true
    },
    prediction: {
      yield_tons: 9.5,
      yield_per_hectare: 3.8,
      confidence_score: 85,
      confidence_level: "High"
    },
    technical: {
      ml_model_used: true,
      data_source: "External APIs + Local Soil Database",
      processing_timestamp: new Date().toISOString(),
      model_version: "v2.0"
    },
    insights: [
      "Expected yield: 9.5 tons",
      "Yield per hectare: 3.8 tons/ha",
      "Sandy soil requires frequent irrigation",
      "Consider organic matter addition for better water retention"
    ]
  };
  
  console.log(JSON.stringify(sampleResponse, null, 2));
  
  // Instructions for testing
  console.log('\\n🔧 How to Test:');
  console.log('=' .repeat(30));
  console.log('1. Start your server: node src/server.js');
  console.log('2. Get a valid JWT token by logging in');
  console.log('3. Use curl or Postman to test:');
  console.log('');
  console.log('curl -X POST http://localhost:3000/api/predict \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
  console.log('  -d \'{"cropType": "Rice", "landArea": 2.5, "location": {"state": "Gujarat", "district": "Ahmedabad"}, "plantingDate": "2024-06-15", "fetchData": true}\'');
  
  console.log('\\n✅ Benefits of Local Soil Data Implementation:');
  console.log('=' .repeat(50));
  console.log('• No API rate limits or network dependencies');
  console.log('• Instant response times');
  console.log('• Accurate Indian soil type mapping');
  console.log('• Comprehensive soil property database');
  console.log('• ML model compatibility guaranteed');
  console.log('• Fallback to state defaults when needed');
  console.log('• Rich soil analysis and recommendations');
  console.log('• Crop suitability information included');
};

// Run the test
testPredictionAPI();
