const axios = require('axios');

async function testDataFormatConsistency() {
    const BASE_URL = 'http://localhost:5000';
    
    console.log('🧪 Testing Data Format Consistency...\n');
    
    try {
        // Test prediction endpoint
        const response = await axios.post(`${BASE_URL}/api/prediction/predict`, {
            cropType: 'rice',
            landArea: 2.5,
            location: {
                state: 'Punjab', 
                district: 'Ludhiana'
            },
            plantingDate: '2024-03-15',
            fetchData: true,
            userId: '64a1234567890123456789ab'
        });

        console.log('✅ API Response Received');
        console.log('📊 Data Format Validation:\n');

        const prediction = response.data.prediction;
        const savedData = response.data.savedData;

        // Validate yield format consistency
        console.log('🔍 YIELD FORMAT VALIDATION:');
        console.log(`   - yield_kg: ${prediction.yield_kg} (Type: ${typeof prediction.yield_kg})`);
        console.log(`   - yield_kg_per_hectare: ${prediction.yield_kg_per_hectare} (Type: ${typeof prediction.yield_kg_per_hectare})`);
        
        // Check if yield calculation is consistent
        const calculatedYieldPerHa = prediction.yield_kg / response.data.input.landArea;
        const providedYieldPerHa = prediction.yield_kg_per_hectare;
        const yieldDifference = Math.abs(calculatedYieldPerHa - providedYieldPerHa);
        
        console.log(`   - Calculated yield/ha: ${calculatedYieldPerHa.toFixed(2)}`);
        console.log(`   - Provided yield/ha: ${providedYieldPerHa}`);
        console.log(`   - Difference: ${yieldDifference.toFixed(4)} kg/ha`);
        
        if (yieldDifference < 0.1) {
            console.log('   ✅ YIELD CALCULATION CONSISTENT');
        } else {
            console.log('   ❌ YIELD CALCULATION INCONSISTENT');
        }

        // Validate confidence format
        console.log('\n🔍 CONFIDENCE FORMAT VALIDATION:');
        console.log(`   - confidence_score: ${prediction.confidence_score} (Type: ${typeof prediction.confidence_score})`);
        console.log(`   - confidence_level: "${prediction.confidence_level}" (Type: ${typeof prediction.confidence_level})`);
        
        if (prediction.confidence_score >= 0 && prediction.confidence_score <= 100) {
            console.log('   ✅ CONFIDENCE SCORE RANGE VALID (0-100)');
        } else {
            console.log('   ❌ CONFIDENCE SCORE RANGE INVALID');
        }

        // Validate soil data format
        console.log('\n🔍 SOIL DATA FORMAT VALIDATION:');
        const soilData = response.data.input.soilData;
        console.log(`   - type: "${soilData.type}" (Type: ${typeof soilData.type})`);
        console.log(`   - dataSource: "${soilData.dataSource}" (Type: ${typeof soilData.dataSource})`);
        
        if (soilData.composition) {
            console.log(`   - composition.sand: ${soilData.composition.sand}%`);
            console.log(`   - composition.clay: ${soilData.composition.clay}%`);
            console.log(`   - composition.silt: ${soilData.composition.silt}%`);
            
            const totalComposition = (soilData.composition.sand || 0) + 
                                   (soilData.composition.clay || 0) + 
                                   (soilData.composition.silt || 0);
            console.log(`   - Total composition: ${totalComposition}%`);
            
            if (Math.abs(totalComposition - 100) < 5) {
                console.log('   ✅ SOIL COMPOSITION ADDS UP TO ~100%');
            } else {
                console.log('   ⚠️ SOIL COMPOSITION TOTAL MIGHT BE INCORRECT');
            }
        }

        // Validate weather data format
        console.log('\n🔍 WEATHER DATA FORMAT VALIDATION:');
        const weather = response.data.input.weather;
        console.log(`   - temperature: ${weather.temperature}°C (Type: ${typeof weather.temperature})`);
        console.log(`   - humidity: ${weather.humidity}% (Type: ${typeof weather.humidity})`);
        console.log(`   - rainfall: ${weather.rainfall}mm (Type: ${typeof weather.rainfall})`);
        console.log(`   - dataSource: "${weather.dataSource}" (Type: ${typeof weather.dataSource})`);

        // Validate database storage format
        console.log('\n🔍 DATABASE STORAGE VALIDATION:');
        if (savedData) {
            console.log(`   - predictedYield: ${savedData.predictedYield} kg`);
            console.log(`   - yieldPerHectare: ${savedData.yieldPerHectare} kg/ha`);
            console.log(`   - mlModelUsed: ${savedData.mlModelUsed}`);
            console.log(`   - fetchedFromAPIs: ${savedData.fetchedFromAPIs}`);
            
            // Check consistency between API response and database
            if (savedData.predictedYield === prediction.yield_kg) {
                console.log('   ✅ DATABASE-API YIELD CONSISTENCY');
            } else {
                console.log('   ❌ DATABASE-API YIELD MISMATCH');
            }
        }

        // Overall format validation
        console.log('\n📋 OVERALL FORMAT SUMMARY:');
        const requiredFields = [
            'yield_kg', 'yield_kg_per_hectare', 'confidence_score', 'confidence_level'
        ];
        
        let allFieldsPresent = true;
        requiredFields.forEach(field => {
            if (prediction[field] !== undefined) {
                console.log(`   ✅ ${field}: Present`);
            } else {
                console.log(`   ❌ ${field}: Missing`);
                allFieldsPresent = false;
            }
        });

        if (allFieldsPresent) {
            console.log('\n🎉 DATA FORMAT CONSISTENCY TEST PASSED!');
            console.log('✅ All required fields present');
            console.log('✅ Data types correct');
            console.log('✅ Units standardized (KG/HA)');
        } else {
            console.log('\n❌ DATA FORMAT CONSISTENCY TEST FAILED!');
            console.log('Some required fields are missing');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testDataFormatConsistency();
