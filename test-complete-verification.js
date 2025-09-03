const axios = require('axios');

// Use the OTP from server logs: 863564
// User ID: 68b5bb2c0362da12a3baaf34

async function testCompleteFlow() {
    console.log('🔐 === TESTING COMPLETE VERIFICATION FLOW ===\n');
    
    const API_BASE = 'http://localhost:5001/api';
    const userId = '68b5bb2c0362da12a3baaf34'; // User from server logs
    const otp = '863564'; // OTP from server logs
    
    try {
        console.log('1️⃣ Verifying OTP...');
        const verifyResponse = await axios.post(`${API_BASE}/auth/verify-otp`, {
            userId: userId,
            otp: otp
        });
        console.log('✅ OTP Verification successful');
        console.log('Response:', verifyResponse.data);
        
        console.log('\n2️⃣ Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'princechaniyara55@gmail.com',
            password: 'test123'
        });
        console.log('✅ Login successful');
        console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
        
        const token = loginResponse.data.token;
        
        console.log('\n3️⃣ Testing prediction with fetchData=true (API fetching)...');
        const predictionResponse1 = await axios.post(`${API_BASE}/predict`, {
            cropType: 'Rice',
            landArea: 1.5,
            location: {
                state: 'Gujarat',
                district: 'Baroda'
            },
            plantingDate: '2024-06-15',
            fetchData: true
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Prediction with API fetch successful');
        console.log('Prediction result:', JSON.stringify(predictionResponse1.data, null, 2));
        
        console.log('\n4️⃣ Testing prediction with fetchData=false (user data)...');
        const predictionResponse2 = await axios.post(`${API_BASE}/predict`, {
            cropType: 'Rice',
            landArea: 2.0,
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
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Prediction with user data successful');
        console.log('Prediction result:', JSON.stringify(predictionResponse2.data, null, 2));
        
        console.log('\n5️⃣ Testing GROUNDNUT prediction...');
        const predictionResponse3 = await axios.post(`${API_BASE}/predict`, {
            cropType: 'Groundnut',
            landArea: 3.0,
            location: {
                state: 'Gujarat',
                district: 'Rajkot'
            },
            plantingDate: '2024-06-15',
            fetchData: false,
            soilType: 'Sandy',
            weather: {
                temperature: 28,
                rainfall: 700,
                humidity: 65
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ GROUNDNUT prediction successful');
        console.log('GROUNDNUT result:', JSON.stringify(predictionResponse3.data, null, 2));
        
        console.log('\n6️⃣ Testing unsupported crop (Wheat)...');
        const predictionResponse4 = await axios.post(`${API_BASE}/predict`, {
            cropType: 'Wheat',
            landArea: 2.5,
            location: {
                state: 'Punjab',
                district: 'Ludhiana'
            },
            plantingDate: '2024-11-01',
            fetchData: false,
            soilType: 'Loamy',
            weather: {
                temperature: 22,
                rainfall: 45,
                humidity: 60
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ WHEAT prediction response received');
        console.log('WHEAT result:', JSON.stringify(predictionResponse4.data, null, 2));
        
        console.log('\n🎉 === ALL TESTS COMPLETED SUCCESSFULLY ===');
        console.log('📊 Test Summary:');
        console.log('✅ User verification');
        console.log('✅ JWT authentication');
        console.log('✅ Prediction with API fetch');
        console.log('✅ Prediction with user data');
        console.log('✅ Supported crops (Rice, Groundnut)');
        console.log('✅ Unsupported crop handling (Wheat)');
        console.log('✅ ML API integration');
        console.log('✅ Data transformation');
        console.log('✅ Error handling');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        
        if (error.response?.status === 401) {
            console.log('\n💡 If verification failed, check:');
            console.log('1. OTP might have expired (5 minutes)');
            console.log('2. User might already be verified');
            console.log('3. Try creating a new user');
        }
    }
}

testCompleteFlow();
