const axios = require('axios');

// Test the enhanced getSoilData function
const getSoilData = async (latitude, longitude) => {
  try {
    console.log(`🌱 Fetching soil data for coordinates: ${latitude}, ${longitude}`);
    
    // Enhanced SoilGrids API call with more soil properties
    const response = await axios.get(`https://rest.soilgrids.org/soilgrids/v2.0/properties/query`, {
      params: {
        lon: longitude,
        lat: latitude,
        property: 'sand,clay,silt,phh2o,nitrogen,ocd,cec', // Added pH, nitrogen, organic carbon, cation exchange capacity
        depth: '0-5cm',
        value: 'mean'
      }
    });
    
    const data = response.data;
    const properties = data.properties;
    
    // Extract soil composition (g/kg converted to percentages)
    const sand = Math.round(properties.sand?.layers[0]?.mean / 10) || 40; // Convert g/kg to %
    const clay = Math.round(properties.clay?.layers[0]?.mean / 10) || 30;
    const silt = Math.round(properties.silt?.layers[0]?.mean / 10) || 30;
    
    // Extract other soil properties
    const pH = properties.phh2o?.layers[0]?.mean ? (properties.phh2o.layers[0].mean / 10).toFixed(1) : 6.5;
    const nitrogen = properties.nitrogen?.layers[0]?.mean ? Math.round(properties.nitrogen.layers[0].mean / 100) : 15; // Convert cg/kg to %
    const organicCarbon = properties.ocd?.layers[0]?.mean ? Math.round(properties.ocd.layers[0].mean / 10) : 20; // Convert g/kg to %
    const cec = properties.cec?.layers[0]?.mean ? Math.round(properties.cec.layers[0].mean / 10) : 15; // Convert mmol/kg to cmol/kg
    
    // Enhanced soil type determination using USDA soil triangle
    let soilType = 'Loamy';
    if (sand >= 85) {
      soilType = 'Sandy';
    } else if (clay >= 40) {
      soilType = 'Clay';
    } else if (silt >= 80) {
      soilType = 'Silty';
    } else if (sand >= 52 && clay < 20) {
      soilType = 'Sandy Loam';
    } else if (clay >= 27 && clay <= 40 && sand <= 20) {
      soilType = 'Clay Loam';
    } else if (clay >= 27 && clay <= 40 && sand > 20 && sand <= 45) {
      soilType = 'Clay Loam';
    } else if (silt >= 50 && clay >= 12 && clay < 27) {
      soilType = 'Silt Loam';
    } else {
      soilType = 'Loamy';
    }
    
    // Map to ML model compatible soil types
    const mlSoilTypeMapping = {
      'Sandy': 'Sandy',
      'Sandy Loam': 'Sandy',
      'Loamy': 'Loamy',
      'Clay': 'Black', // Clay soils are often Black soils in Indian context
      'Clay Loam': 'Alluvial',
      'Silty': 'Alluvial',
      'Silt Loam': 'Alluvial'
    };
    
    const mlCompatibleSoilType = mlSoilTypeMapping[soilType] || 'Loamy';
    
    // Determine soil fertility based on properties
    let fertility = 'Medium';
    if (organicCarbon > 25 && pH >= 6.0 && pH <= 7.5 && nitrogen > 20) {
      fertility = 'High';
    } else if (organicCarbon < 10 || pH < 5.5 || pH > 8.5 || nitrogen < 10) {
      fertility = 'Low';
    }
    
    console.log(`🌱 Soil Analysis Complete:`);
    console.log(`   Type: ${soilType} (ML: ${mlCompatibleSoilType})`);
    console.log(`   Composition: Sand ${sand}%, Clay ${clay}%, Silt ${silt}%`);
    console.log(`   pH: ${pH}, Fertility: ${fertility}`);
    
    return {
      soilType: mlCompatibleSoilType, // Use ML-compatible type for predictions
      detailedSoilType: soilType, // Keep detailed type for display
      composition: { sand, clay, silt },
      properties: {
        pH: parseFloat(pH),
        nitrogen: nitrogen,
        organicCarbon: organicCarbon,
        cationExchangeCapacity: cec,
        fertility: fertility
      },
      analysis: {
        drainage: sand > 60 ? 'Good' : sand < 30 ? 'Poor' : 'Moderate',
        waterHolding: clay > 35 ? 'High' : clay < 15 ? 'Low' : 'Medium',
        nutrientRetention: cec > 20 ? 'High' : cec < 10 ? 'Low' : 'Medium'
      },
      recommendations: generateSoilRecommendations(soilType, pH, fertility),
      coordinates: { latitude, longitude },
      raw: data
    };
  } catch (error) {
    console.error('Soil API error:', error.message);
    
    // Enhanced fallback with basic soil analysis
    const fallbackSoilType = 'Loamy';
    return {
      soilType: fallbackSoilType,
      detailedSoilType: fallbackSoilType,
      composition: { sand: 40, clay: 30, silt: 30 },
      properties: {
        pH: 6.5,
        nitrogen: 15,
        organicCarbon: 20,
        cationExchangeCapacity: 15,
        fertility: 'Medium'
      },
      analysis: {
        drainage: 'Moderate',
        waterHolding: 'Medium',
        nutrientRetention: 'Medium'
      },
      recommendations: ['Unable to fetch detailed soil data', 'Using default recommendations'],
      coordinates: { latitude, longitude },
      raw: { error: error.message }
    };
  }
};

// Helper function to generate soil-specific recommendations
const generateSoilRecommendations = (soilType, pH, fertility) => {
  const recommendations = [];
  
  // pH-based recommendations
  if (pH < 6.0) {
    recommendations.push('Consider lime application to increase soil pH');
  } else if (pH > 8.0) {
    recommendations.push('Consider sulfur or organic matter to reduce soil pH');
  }
  
  // Soil type specific recommendations
  switch (soilType) {
    case 'Sandy':
      recommendations.push('Add organic matter to improve water retention');
      recommendations.push('Apply frequent, light fertilizer applications');
      break;
    case 'Clay':
      recommendations.push('Improve drainage with organic matter');
      recommendations.push('Avoid working soil when wet');
      break;
    case 'Silty':
      recommendations.push('Prevent soil compaction');
      recommendations.push('Add organic matter for structure');
      break;
    default:
      recommendations.push('Maintain current soil management practices');
  }
  
  // Fertility-based recommendations
  if (fertility === 'Low') {
    recommendations.push('Increase organic matter and balanced fertilization');
  } else if (fertility === 'High') {
    recommendations.push('Focus on maintaining current fertility levels');
  }
  
  return recommendations;
};

// Test the function
const testSoilData = async () => {
  console.log('🧪 Testing Enhanced Soil Data Function');
  console.log('=' .repeat(50));
  
  // Test coordinates for Gujarat, India
  const testCoordinates = [
    { lat: 23.0225, lon: 72.5714, location: 'Ahmedabad, Gujarat' },
    { lat: 28.6139, lon: 77.2090, location: 'Delhi' },
    { lat: 19.0760, lon: 72.8777, location: 'Mumbai' }
  ];
  
  for (const coord of testCoordinates) {
    console.log(`\n📍 Testing: ${coord.location}`);
    console.log(`   Coordinates: ${coord.lat}, ${coord.lon}`);
    
    const soilData = await getSoilData(coord.lat, coord.lon);
    
    console.log(`✅ Results for ${coord.location}:`);
    console.log(`   🌱 Soil Type: ${soilData.detailedSoilType} (ML: ${soilData.soilType})`);
    console.log(`   📊 Composition: Sand ${soilData.composition.sand}%, Clay ${soilData.composition.clay}%, Silt ${soilData.composition.silt}%`);
    console.log(`   🧪 Properties: pH ${soilData.properties.pH}, Fertility: ${soilData.properties.fertility}`);
    console.log(`   💧 Analysis: Drainage ${soilData.analysis.drainage}, Water Holding: ${soilData.analysis.waterHolding}`);
    console.log(`   📝 Recommendations: ${soilData.recommendations.slice(0, 2).join(', ')}`);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// Run the test
testSoilData().catch(console.error);
