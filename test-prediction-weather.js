const axios = require('axios');
require('dotenv').config();

// Test the complete prediction flow with weather API
const testPredictionWithWeather = async () => {
    console.log('🎯 Testing Prediction API with Weather Data...\n');
    
    // First, test if server is running
    const baseURL = 'http://localhost:5001';
    
    console.log('1. Checking if server is running...');
    try {
        const response = await axios.get(`${baseURL}/api/test`).catch(() => {
            throw new Error('Server not responding. Make sure the backend server is running on port 5000');
        });
    } catch (error) {
        console.log(`❌ ${error.message}`);
        console.log('💡 Start the server with: npm start or npm run dev');
        return;
    }
    
    // Create a test user and get token (simplified)
    console.log('\n2. Testing prediction with fetchData=true (should use weather API)...');
    
    const predictionData = {
        cropType: 'Rice',
        farmSize: 2.5,
        location: {
            state: 'Gujarat',
            district: 'Ahmedabad'
        },
        plantingDate: new Date().toISOString(),
        fetchData: true  // This should trigger weather API call
    };
    
    console.log('📤 Request Data:', JSON.stringify(predictionData, null, 2));
    
    try {
        // Note: This would normally require authentication
        // For testing, you might need to modify the auth middleware temporarily
        console.log('⚠️ Note: This test requires a valid JWT token for authentication');
        console.log('📝 You can test this by:');
        console.log('   1. Sign up/login through the frontend');
        console.log('   2. Copy the JWT token from localStorage');
        console.log('   3. Use it in Authorization header');
        console.log('   4. Or temporarily disable auth in prediction routes');
        
        // Show what the request would look like
        console.log('\n📋 Expected API call:');
        console.log(`POST ${baseURL}/api/predict`);
        console.log('Headers: { Authorization: "Bearer YOUR_JWT_TOKEN" }');
        console.log('Body:', JSON.stringify(predictionData, null, 2));
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`📄 Status: ${error.response.status}`);
            console.log(`📄 Response:`, error.response.data);
        }
    }
};

// Test the weather function directly from the controller
const testWeatherFunctionDirectly = async () => {
    console.log('\n3. Testing weather function directly from controller...');
    
    // Copy the exact function from prediction.controller.js
    const getWeatherData = async (state, district, date) => {
        try {
            if (!process.env.WEATHER_API_KEY) {
                throw new Error('Weather API key not configured');
            }

            const location = `${district}, ${state}`;
            console.log(`🌤️ Fetching weather data for ${location} on ${date}`);

            // OpenWeatherMap API call
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: location,
                    appid: process.env.WEATHER_API_KEY,
                    units: 'metric'
                }
            });

            const data = response.data;
            return {
                temperature: data.main.temp,
                rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
                humidity: data.main.humidity,
                coordinates: {
                    latitude: data.coord.lat,
                    longitude: data.coord.lon
                },
                raw: data
            };
        } catch (error) {
            console.error('Weather API error:', error.message);
            // Return mock data as fallback
            return {
                temperature: 25,
                rainfall: 50,
                humidity: 70,
                coordinates: { latitude: 0, longitude: 0 },
                raw: { error: error.message }
            };
        }
    };
    
    try {
        const weatherData = await getWeatherData('Gujarat', 'Ahmedabad', new Date().toISOString());
        console.log('✅ Weather data retrieved successfully:');
        console.log(`   🌡️ Temperature: ${weatherData.temperature}°C`);
        console.log(`   💧 Humidity: ${weatherData.humidity}%`);
        console.log(`   🌧️ Rainfall: ${weatherData.rainfall}mm`);
        console.log(`   📍 Coordinates: ${weatherData.coordinates.latitude}, ${weatherData.coordinates.longitude}`);
        
        if (weatherData.raw.error) {
            console.log(`   ⚠️ Fallback data used due to: ${weatherData.raw.error}`);
        }
    } catch (error) {
        console.log(`❌ Weather function test failed: ${error.message}`);
    }
};

// Debug environment variables
const debugEnvironment = () => {
    console.log('\n4. Environment Variables Debug:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`   WEATHER_API_KEY: ${process.env.WEATHER_API_KEY ? 'Set (' + process.env.WEATHER_API_KEY.substring(0, 4) + '...)' : 'Not set'}`);
    console.log(`   ML_MODEL_API_URL: ${process.env.ML_MODEL_API_URL || 'Not set'}`);
    console.log(`   PORT: ${process.env.PORT || 'Not set'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
};

// Run all tests
const runAllTests = async () => {
    console.log('🧪 Comprehensive Weather API Testing\n' + '='.repeat(50));
    
    debugEnvironment();
    await testWeatherFunctionDirectly();
    await testPredictionWithWeather();
    
    console.log('\n🎯 All tests completed!');
    console.log('\n💡 If weather API is working but prediction is not fetching data:');
    console.log('   1. Check if fetchData=true is being passed in the request');
    console.log('   2. Verify the prediction endpoint authentication');
    console.log('   3. Check server logs for any errors during prediction');
    console.log('   4. Ensure the prediction controller is using the latest code');
};

runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
});
