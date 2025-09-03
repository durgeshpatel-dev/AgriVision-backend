const stateDistrictSoil = require('./src/data/state_district_soil.json');
const soilProperties = require('./src/data/soil_properties.json');

// Test the getSoilData function logic
const getSoilData = async (state, district, coordinates = null) => {
  try {
    console.log(`🌱 Fetching soil data for ${district}, ${state}`);
    
    // Normalize state and district names for lookup
    const normalizedState = state.trim();
    const normalizedDistrict = district.trim();
    
    // Find soil type from local JSON data
    let soilType = null;
    let foundInData = false;
    
    // First, try exact match
    if (stateDistrictSoil[normalizedState] && stateDistrictSoil[normalizedState][normalizedDistrict]) {
      soilType = stateDistrictSoil[normalizedState][normalizedDistrict][0];
      foundInData = true;
      console.log(`✅ Exact match found: ${normalizedDistrict}, ${normalizedState} -> ${soilType}`);
    }
    
    // If not found, try case-insensitive search
    if (!foundInData) {
      const stateKeys = Object.keys(stateDistrictSoil);
      for (const stateKey of stateKeys) {
        if (stateKey.toLowerCase() === normalizedState.toLowerCase()) {
          const districts = stateDistrictSoil[stateKey];
          const districtKeys = Object.keys(districts);
          
          for (const districtKey of districtKeys) {
            if (districtKey.toLowerCase() === normalizedDistrict.toLowerCase() ||
                districtKey.toLowerCase().includes(normalizedDistrict.toLowerCase()) ||
                normalizedDistrict.toLowerCase().includes(districtKey.toLowerCase())) {
              soilType = districts[districtKey][0];
              foundInData = true;
              console.log(`✅ Fuzzy match found: ${districtKey} -> ${soilType}`);
              break;
            }
          }
          if (foundInData) break;
        }
      }
    }
    
    // If still not found, use state-level default
    if (!foundInData) {
      console.log(`⚠️ District ${normalizedDistrict} not found in ${normalizedState}`);
      
      // Get default soil type for the state (most common in that state)
      const stateDefaults = {
        'Gujarat': 'Sandy',
        'Maharashtra': 'Loamy', 
        'Madhya Pradesh': 'Black',
        'Uttar Pradesh': 'Alluvial',
        'West Bengal': 'Alluvial',
        'Bihar': 'Alluvial',
        'Jharkhand': 'Red',
        'Orissa': 'Red',
        'Chhattisgarh': 'Red-Yellow',
        'Karnataka': 'Loamy',
        'Tamil Nadu': 'Loamy',
        'Andhra Pradesh': 'Loamy',
        'Telangana': 'Loamy',
        'Kerala': 'Loamy',
        'Punjab': 'Loamy',
        'Haryana': 'Loamy',
        'Rajasthan': 'Loamy',
        'Himachal Pradesh': 'Loamy',
        'Uttarakhand': 'Loamy',
        'Assam': 'Loamy'
      };
      
      soilType = stateDefaults[normalizedState] || 'Loamy';
      console.log(`📍 Using state default for ${normalizedState}: ${soilType}`);
    }
    
    // Get detailed soil properties from soil_properties.json
    const soilData = soilProperties.soilProperties[soilType] || soilProperties.soilProperties['Loamy'];
    
    // Create comprehensive soil data response
    const comprehensiveSoilData = {
      soilType: soilType, // ML-compatible type
      detailedSoilType: soilType, // Same as soil type for JSON data
      composition: soilData.composition,
      properties: soilData.properties,
      analysis: soilData.analysis,
      recommendations: soilData.recommendations,
      suitableCrops: soilData.crops.suitable,
      coordinates: coordinates || { latitude: null, longitude: null },
      dataSource: foundInData ? 'local_database' : 'state_default',
      location: `${normalizedDistrict}, ${normalizedState}`,
      raw: {
        searchedState: normalizedState,
        searchedDistrict: normalizedDistrict,
        foundInDatabase: foundInData,
        soilTypeSource: foundInData ? 'district_specific' : 'state_default'
      }
    };
    
    console.log(`🌱 Soil Analysis Complete:`);
    console.log(`   Type: ${soilType}`);
    console.log(`   Composition: Sand ${soilData.composition.sand}%, Clay ${soilData.composition.clay}%, Silt ${soilData.composition.silt}%`);
    console.log(`   pH: ${soilData.properties.pH}, Fertility: ${soilData.properties.fertility}`);
    console.log(`   Data Source: ${comprehensiveSoilData.dataSource}`);
    console.log(`   Suitable Crops: ${soilData.crops.suitable.join(', ')}`);
    
    return comprehensiveSoilData;
    
  } catch (error) {
    console.error('Local soil data lookup error:', error.message);
    return null;
  }
};

// Test the function with various locations
const testSoilData = async () => {
  console.log('🧪 Testing Local Soil Data Implementation');
  console.log('=' .repeat(60));
  
  const testLocations = [
    { state: 'Gujarat', district: 'Ahmedabad' },
    { state: 'Maharashtra', district: 'Mumbai' }, // Not in JSON, should use state default
    { state: 'Madhya Pradesh', district: 'Indore' },
    { state: 'West Bengal', district: '24 Parganas' },
    { state: 'Uttar Pradesh', district: 'Lucknow' },
    { state: 'Bihar', district: 'Patna' },
    { state: 'Karnataka', district: 'Bangalore' },
    { state: 'Tamil Nadu', district: 'Chennai' }, // Not in JSON, should use state default
    { state: 'Orissa', district: 'Cuttack' },
    { state: 'Jharkhand', district: 'Ranchi' },
    { state: 'Chhattisgarh', district: 'Raipur' },
    { state: 'Punjab', district: 'Ludhiana' },
    { state: 'Haryana', district: 'Gurgaon' },
    { state: 'Rajasthan', district: 'Jaipur' }
  ];
  
  for (const location of testLocations) {
    console.log(`\n📍 Testing: ${location.district}, ${location.state}`);
    
    const soilData = await getSoilData(location.state, location.district);
    
    if (soilData) {
      console.log(`✅ Results:`);
      console.log(`   🌱 Soil Type: ${soilData.soilType}`);
      console.log(`   📊 Composition: Sand ${soilData.composition.sand}%, Clay ${soilData.composition.clay}%, Silt ${soilData.composition.silt}%`);
      console.log(`   🧪 Properties: pH ${soilData.properties.pH}, Fertility: ${soilData.properties.fertility}`);
      console.log(`   💧 Analysis: Drainage ${soilData.analysis.drainage}, Water Holding: ${soilData.analysis.waterHolding}`);
      console.log(`   🌾 Suitable Crops: ${soilData.suitableCrops.join(', ')}`);
      console.log(`   📋 Data Source: ${soilData.dataSource}`);
      console.log(`   📝 Top Recommendations: ${soilData.recommendations.slice(0, 2).join(', ')}`);
    } else {
      console.log(`❌ Failed to get soil data`);
    }
  }
  
  // Test ML Model compatibility
  console.log(`\n🤖 ML Model Soil Type Compatibility Test:`);
  console.log('=' .repeat(60));
  
  const mlCompatibleTypes = ['Sandy', 'Alluvial', 'Black', 'Red-Yellow', 'Red', 'Loamy'];
  const testResults = {};
  
  for (const location of testLocations) {
    const soilData = await getSoilData(location.state, location.district);
    if (soilData) {
      const isCompatible = mlCompatibleTypes.includes(soilData.soilType);
      testResults[`${location.district}, ${location.state}`] = {
        soilType: soilData.soilType,
        compatible: isCompatible
      };
    }
  }
  
  console.log('\nML Compatibility Results:');
  Object.entries(testResults).forEach(([location, result]) => {
    const status = result.compatible ? '✅' : '❌';
    console.log(`${status} ${location}: ${result.soilType}`);
  });
  
  console.log(`\n📊 Summary:`);
  const totalTests = Object.keys(testResults).length;
  const compatibleCount = Object.values(testResults).filter(r => r.compatible).length;
  console.log(`Total Locations Tested: ${totalTests}`);
  console.log(`ML Compatible: ${compatibleCount}/${totalTests} (${Math.round(compatibleCount/totalTests*100)}%)`);
  
  // Test soil type distribution
  console.log(`\n🌍 Soil Type Distribution:`);
  const soilTypeCount = {};
  Object.values(testResults).forEach(result => {
    soilTypeCount[result.soilType] = (soilTypeCount[result.soilType] || 0) + 1;
  });
  
  Object.entries(soilTypeCount).forEach(([soilType, count]) => {
    console.log(`${soilType}: ${count} locations`);
  });
};

// Run the test
testSoilData().catch(console.error);
