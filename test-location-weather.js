const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

async function testLocationWeatherEndpoint() {
  try {
    console.log('🌤️ Testing location-based weather endpoint...\n');

    const testData = {
      state: 'Karnataka',
      district: 'Bangalore Urban'
    };

    console.log('📍 Sending request with location data:', testData);

    const response = await axios.post(`${API_BASE_URL}/api/location/weather`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Weather API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Verify the response structure
    const data = response.data;
    const expectedFields = ['summary', 'description', 'tempC', 'temp', 'humidity', 'windSpeed', 'raw'];
    
    console.log('\n🔍 Validating response structure...');
    const missingFields = expectedFields.filter(field => !(field in data));
    
    if (missingFields.length === 0) {
      console.log('✅ All expected fields are present in the response');
    } else {
      console.log('❌ Missing fields:', missingFields);
    }

    // Test with different locations
    console.log('\n🌍 Testing with different location...');
    const testData2 = {
      state: 'Maharashtra',
      district: 'Mumbai'
    };

    const response2 = await axios.post(`${API_BASE_URL}/api/location/weather`, testData2, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Second request successful');
    console.log('Data:', JSON.stringify(response2.data, null, 2));

    // Test with missing data
    console.log('\n🚫 Testing with empty request body...');
    const response3 = await axios.post(`${API_BASE_URL}/api/location/weather`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Empty request handled successfully');
    console.log('Data:', JSON.stringify(response3.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing location weather endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testLocationWeatherEndpoint();
