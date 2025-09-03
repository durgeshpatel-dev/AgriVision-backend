const axios = require('axios');
require('dotenv').config();

// Test the weather API functionality directly
const testWeatherAPI = async () => {
    console.log('🌤️ Testing Weather API...\n');
    
    // Check if API key is configured
    console.log('1. Checking Environment Variables:');
    console.log(`   WEATHER_API_KEY: ${process.env.WEATHER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   API Key Length: ${process.env.WEATHER_API_KEY ? process.env.WEATHER_API_KEY.length : 0} characters`);
    
    if (!process.env.WEATHER_API_KEY) {
        console.log('\n❌ WEATHER_API_KEY is not configured in environment variables.');
        console.log('💡 Solution: Add WEATHER_API_KEY=your_openweather_api_key to .env file');
        return;
    }
    
    // Test the weather API function from the controller
    const getWeatherData = async (state, district, date) => {
        try {
            const location = `${district}, ${state}`;
            console.log(`\n2. Testing Weather API for: ${location}`);
            
            // OpenWeatherMap API call
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: location,
                    appid: process.env.WEATHER_API_KEY,
                    units: 'metric'
                },
                timeout: 10000
            });
            
            console.log(`   ✅ API Response Status: ${response.status}`);
            console.log(`   📍 Location Found: ${response.data.name}, ${response.data.sys.country}`);
            console.log(`   🌡️ Temperature: ${response.data.main.temp}°C`);
            console.log(`   💧 Humidity: ${response.data.main.humidity}%`);
            console.log(`   🌧️ Rainfall: ${response.data.rain ? (response.data.rain['1h'] || response.data.rain['3h'] || 0) : 0}mm`);
            console.log(`   📍 Coordinates: ${response.data.coord.lat}, ${response.data.coord.lon}`);
            
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
            console.log(`   ❌ Weather API Error: ${error.message}`);
            if (error.response) {
                console.log(`   📄 HTTP Status: ${error.response.status}`);
                console.log(`   📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
            }
            throw error;
        }
    };
    
    // Test with different locations
    const testLocations = [
        { state: 'Gujarat', district: 'Ahmedabad' },
        { state: 'Maharashtra', district: 'Mumbai' },
        { state: 'West Bengal', district: 'Kolkata' },
        { state: 'Bihar', district: 'Patna' }
    ];
    
    console.log('\n3. Testing Multiple Locations:');
    for (const location of testLocations) {
        try {
            const weatherData = await getWeatherData(location.state, location.district, new Date().toISOString());
            console.log(`   ✅ ${location.district}, ${location.state}: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity`);
        } catch (error) {
            console.log(`   ❌ ${location.district}, ${location.state}: Failed - ${error.message}`);
        }
    }
    
    // Test invalid location
    console.log('\n4. Testing Invalid Location:');
    try {
        await getWeatherData('InvalidState', 'InvalidDistrict', new Date().toISOString());
    } catch (error) {
        console.log(`   ✅ Expected error for invalid location: ${error.message}`);
    }
    
    console.log('\n🎯 Weather API Test Complete!');
};

// Run the test
testWeatherAPI().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
