const axios = require('axios');

// Test to verify that ML prediction data and soil data are being saved correctly
async function testPredictionDataSaving() {
    const BASE_URL = 'http://localhost:5000/api';
    
    console.log('🔍 Testing Prediction Data Saving to Database...\n');

    try {
        // Step 1: Login to get authentication token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'Test123'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed. Creating test user first...');
            
            // Register a test user if login fails
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test123',
                phoneNumber: '1234567890'
            });
            
            if (!registerResponse.data.success) {
                throw new Error('Failed to create test user');
            }
            
            console.log('✅ Test user created successfully');
            
            // Try login again
            const retryLogin = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'Test123'
            });
            
            if (!retryLogin.data.success) {
                throw new Error('Login failed after user creation');
            }
            
            token = retryLogin.data.token;
        } else {
            token = loginResponse.data.token;
        }
        
        console.log('✅ Login successful\n');

        // Step 2: Make prediction request with fetchData=true to test complete data saving
        console.log('2. Making prediction request with external data fetching...');
        const predictionData = {
            cropType: 'Rice',
            farmSize: 2.5,
            location: {
                state: 'Gujarat',
                district: 'Ahmedabad'
            },
            plantingDate: '2024-06-15',
            fetchData: true  // This will fetch weather and soil data from APIs
        };

        const predictionResponse = await axios.post(`${BASE_URL}/predict`, predictionData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (predictionResponse.data.success) {
            console.log('✅ Prediction request successful');
            console.log('\n📊 RESPONSE DATA ANALYSIS:');
            
            const response = predictionResponse.data;
            
            // Check ML API data saving
            console.log('\n🤖 ML API Data Saving:');
            console.log(`   - ML Model Used: ${response.technical.ml_model_used}`);
            console.log(`   - Model Version: ${response.technical.model_version}`);
            if (response.savedData?.mlResponse) {
                console.log(`   - ML Response Saved: ${response.savedData.mlResponse.saved}`);
                console.log(`   - Yield from Model: ${response.savedData.mlResponse.yieldFromModel} kg/ha`);
                console.log(`   - Confidence Interval: ${JSON.stringify(response.savedData.mlResponse.confidenceInterval)}`);
            }
            
            // Check Soil Data saving
            console.log('\n🌱 Soil Data Saving:');
            if (response.savedData?.soilData) {
                console.log(`   - Soil Data Saved: ${response.savedData.soilData.saved}`);
                console.log(`   - Soil Type: ${response.savedData.soilData.type}`);
                console.log(`   - Data Source: ${response.savedData.soilData.source}`);
                console.log(`   - Detailed Analysis: ${response.savedData.soilData.detailedAnalysis}`);
                console.log(`   - Recommendations Count: ${response.savedData.soilData.recommendations}`);
            }
            
            // Check Weather Data saving
            console.log('\n🌤️ Weather Data Saving:');
            if (response.savedData?.weatherData) {
                console.log(`   - Weather Data Saved: ${response.savedData.weatherData.saved}`);
                console.log(`   - Data Source: ${response.savedData.weatherData.source}`);
                console.log(`   - Temperature: ${response.savedData.weatherData.temperature}°C`);
                console.log(`   - Rainfall: ${response.savedData.weatherData.rainfall}mm`);
                console.log(`   - Humidity: ${response.savedData.weatherData.humidity}%`);
            }
            
            // Check Database Information
            console.log('\n💾 Database Information:');
            console.log(`   - Prediction ID: ${response.predictionId}`);
            console.log(`   - Database Save Successful: ${response.technical.database_save_successful}`);
            console.log(`   - Request ID: ${response.technical.request_id}`);
            console.log(`   - Processing Time: ${response.technical.processing_time_ms}ms`);
            
            // Display prediction results
            console.log('\n📈 Prediction Results:');
            console.log(`   - Predicted Yield: ${response.prediction.yield_kg} kg`);
            console.log(`   - Yield per Hectare: ${response.prediction.yield_kg_per_hectare} kg/ha`);
            console.log(`   - Confidence Score: ${response.prediction.confidence_score}%`);
            console.log(`   - Confidence Level: ${response.prediction.confidence_level}`);
            
            console.log('\n💡 Insights:');
            response.insights?.forEach((insight, index) => {
                console.log(`   ${index + 1}. ${insight}`);
            });
            
        } else {
            console.log('❌ Prediction request failed');
            console.log('Error:', predictionResponse.data.error);
        }

        // Step 3: Test with user-provided data
        console.log('\n3. Making prediction request with user-provided data...');
        const userDataPrediction = {
            cropType: 'Wheat',
            farmSize: 1.8,
            location: {
                state: 'Punjab',
                district: 'Amritsar'
            },
            plantingDate: '2024-11-01',
            fetchData: false,  // Use user-provided data
            soilType: 'Loamy',
            temperature: 22,
            rainfall: 45,
            humidity: 65
        };

        const userDataResponse = await axios.post(`${BASE_URL}/predict`, userDataPrediction, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (userDataResponse.data.success) {
            console.log('✅ User data prediction successful');
            console.log(`   - Soil Type Used: ${userDataResponse.data.savedData?.soilData?.type}`);
            console.log(`   - Weather Source: ${userDataResponse.data.savedData?.weatherData?.source}`);
            console.log(`   - ML Model Used: ${userDataResponse.data.technical.ml_model_used}`);
        }

        console.log('\n🎉 All prediction data saving tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed with error:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Response:`, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testPredictionDataSaving();
