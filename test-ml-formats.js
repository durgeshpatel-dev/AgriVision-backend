require('dotenv').config();
const axios = require('axios');

// Test different data formats to find what your ML API expects
async function testMLAPIFormats() {
  console.log('🔍 === TESTING ML API DATA FORMATS ===\n');
  
  const ML_URL = 'http://127.0.0.1:5000/predict';
  
  // Test different possible formats
  const testFormats = [
    {
      name: 'Current Format (Capitalized)',
      data: {
        Year: 2024,
        State: 'West Bengal',
        District: 'Kolkata', 
        Area_1000_ha: 2.5,
        Crop: 'RICE',
        Rainfall_mm: 120.0,
        Temp_C: 28.5,
        Soil_Type: 'Alluvial'
      }
    },
    {
      name: 'Lowercase Format',
      data: {
        year: 2024,
        state: 'West Bengal',
        district: 'Kolkata',
        area_1000_ha: 2.5,
        crop: 'RICE',
        rainfall_mm: 120.0,
        temp_c: 28.5,
        soil_type: 'Alluvial'
      }
    },
    {
      name: 'Snake Case Format',
      data: {
        year: 2024,
        state: 'West Bengal',
        district: 'Kolkata',
        area_1000_ha: 2.5,
        crop: 'RICE',
        rainfall_mm: 120.0,
        temp_c: 28.5,
        soil_type: 'Alluvial'
      }
    },
    {
      name: 'Alternative Field Names',
      data: {
        year: 2024,
        state: 'West Bengal',
        district: 'Kolkata',
        area: 2.5,
        crop_type: 'RICE',
        rainfall: 120.0,
        temperature: 28.5,
        soil: 'Alluvial'
      }
    },
    {
      name: 'Simple Format',
      data: {
        crop: 'RICE',
        area: 2.5,
        rainfall: 120,
        temperature: 28.5,
        soil: 'Alluvial',
        state: 'West Bengal',
        year: 2024
      }
    }
  ];
  
  for (const format of testFormats) {
    console.log(`🧪 Testing: ${format.name}`);
    console.log('📤 Data:', JSON.stringify(format.data, null, 2));
    
    try {
      const response = await axios.post(ML_URL, format.data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      console.log('✅ SUCCESS!');
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      console.log(`\n🎯 FOUND WORKING FORMAT: ${format.name}\n`);
      
      return format; // Return the working format
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Failed - Status: ${error.response.status}`);
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log(`❌ Failed - ${error.message}`);
      }
    }
    
    console.log('---\n');
  }
  
  console.log('❌ No working format found. Your ML API might need a different structure.');
  console.log('\n💡 Suggestions:');
  console.log('1. Check your ML API documentation');
  console.log('2. Test manually with curl or Postman');
  console.log('3. Share the exact format your ML API expects');
}

// Test OPTIONS request to see if CORS is configured
async function testCORS() {
  console.log('🌐 === TESTING CORS ===\n');
  
  try {
    const response = await axios.options('http://127.0.0.1:5000/predict');
    console.log('✅ OPTIONS request successful');
    console.log('Headers:', response.headers);
  } catch (error) {
    console.log('❌ OPTIONS request failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testMLAPIFormats();
  await testCORS();
  
  console.log('\n📋 Next Steps:');
  console.log('1. If a format worked, I\'ll update the backend code');
  console.log('2. If none worked, please share your ML API\'s expected format');
  console.log('3. Make sure your ML API is running on http://127.0.0.1:5000');
}

runAllTests();
