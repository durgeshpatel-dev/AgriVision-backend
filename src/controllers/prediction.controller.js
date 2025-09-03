const axios = require('axios');
const Prediction = require('../models/prediction.model');
const stateDistrictSoil = require('../data/state_district_soil.json');
const soilProperties = require('../data/soil_properties.json');

// External API functions for fetching weather and soil data
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

const getSoilData = async (state, district, coordinates = null) => {
    try {
        console.log(`🌱 Fetching soil data for ${district}, ${state}`);

        const normalizedState = state.trim();
        const normalizedDistrict = district.trim();

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
            const stateDefaults = {
                'Gujarat': 'Sandy', 'Maharashtra': 'Loamy', 'Madhya Pradesh': 'Black', 'Uttar Pradesh': 'Alluvial',
                'West Bengal': 'Alluvial', 'Bihar': 'Alluvial', 'Jharkhand': 'Red', 'Orissa': 'Red',
                'Chhattisgarh': 'Red-Yellow', 'Karnataka': 'Loamy', 'Tamil Nadu': 'Loamy', 'Andhra Pradesh': 'Loamy',
                'Telangana': 'Loamy', 'Kerala': 'Loamy', 'Punjab': 'Loamy', 'Haryana': 'Loamy', 'Rajasthan': 'Loamy',
                'Himachal Pradesh': 'Loamy', 'Uttarakhand': 'Loamy', 'Assam': 'Loamy'
            };
            soilType = stateDefaults[normalizedState] || 'Loamy';
            console.log(`📍 Using state default for ${normalizedState}: ${soilType}`);
        }

        const soilData = soilProperties.soilProperties[soilType] || soilProperties.soilProperties['Loamy'];
        const comprehensiveSoilData = {
            soilType: soilType,
            detailedSoilType: soilType,
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

        console.log(`🌱 Soil Analysis Complete: Type: ${soilType}, Source: ${comprehensiveSoilData.dataSource}`);
        return comprehensiveSoilData;

    } catch (error) {
        console.error('Local soil data lookup error:', error.message);
        const fallbackSoilType = 'Loamy';
        const fallbackData = soilProperties.soilProperties[fallbackSoilType];
        return {
            soilType: fallbackSoilType, detailedSoilType: fallbackSoilType, composition: fallbackData.composition,
            properties: fallbackData.properties, analysis: fallbackData.analysis,
            recommendations: ['Unable to fetch soil data from local database', ...fallbackData.recommendations],
            suitableCrops: fallbackData.crops.suitable, coordinates: coordinates || { latitude: null, longitude: null },
            dataSource: 'fallback', location: `${district}, ${state}`, raw: { error: error.message }
        };
    }
};

// @desc     Create a new prediction
// @route    POST /api/predict
// @access   Private
const createPrediction = async (req, res) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    console.log(`\n🎯 [${requestId}] NEW PREDICTION REQUEST STARTED`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    const {
        cropType,
        farmSize,
        location,
        plantingDate: rawPlantingDate,
        fetchData: fetchDataFromClient,
        fetchedFromAPIs,
        soilType,
        rainfall,
        temperature,
        humidity
    } = req.body;

    // Prefer explicit `fetchedFromAPIs` from frontend; fall back to legacy `fetchData` if provided
    const fetchData = (typeof fetchedFromAPIs !== 'undefined')
        ? fetchedFromAPIs
        : (typeof fetchDataFromClient !== 'undefined' ? fetchDataFromClient : false);

    const landArea = farmSize; // Map farmSize to landArea
    const plantingDate = rawPlantingDate || new Date().toISOString(); // Default to today if not provided
    
    // userId is declared here to be available in the final catch block
    const userId = req.user._id;

    try {
        console.log(`\n🔍 [${requestId}] ==================== PHASE 1: INPUT VALIDATION ====================`);
        const validationErrors = [];
        if (!cropType) validationErrors.push('cropType is required');
        if (landArea === undefined) validationErrors.push('farmSize is required');
        if (!location || !location.state || !location.district) validationErrors.push('location with state and district is required');
        
        if (validationErrors.length > 0) {
            console.log(`❌ VALIDATION ERRORS FOUND:`, validationErrors);
            return res.status(400).json({
                success: false,
                error: 'Input validation failed',
                validation_errors: validationErrors,
                request_id: requestId
            });
        }
        console.log(`✅ All required fields present`);
        console.log("all fields : ", { cropType, landArea, location, plantingDate,fetchData, soilType, rainfall, temperature, humidity });
        console.log(`\n🌾 [${requestId}] ==================== PHASE 2: DATA PROCESSING ====================`);
        let finalWeatherData = null;
        let finalSoilData = null;
        let coordinates = location.coordinates || { latitude: 0, longitude: 0 };
      console.log("Autofetch status:", fetchData ? "Enabled" : "Disabled");
        if (fetchData) {
            console.log(`\n📡 [${requestId}] FETCHING EXTERNAL DATA...`);
            const weatherApiData = await getWeatherData(location.state, location.district, plantingDate);
            coordinates = weatherApiData.coordinates;
            finalWeatherData = {
                temperature: weatherApiData.temperature,
                rainfall: weatherApiData.rainfall,
                humidity: weatherApiData.humidity,
                dataSource: 'api'
            };

            const soilApiData = await getSoilData(location.state, location.district, coordinates);
            finalSoilData = {
                type: soilApiData.soilType,
                detailedType: soilApiData.detailedSoilType,
                composition: soilApiData.composition,
                properties: soilApiData.properties,
                analysis: soilApiData.analysis,
                recommendations: soilApiData.recommendations,
                suitableCrops: soilApiData.suitableCrops,
                dataSource: 'local_database'
            };
        } else {
            console.log(`\n👤 [${requestId}] USING USER-PROVIDED DATA`);
            finalWeatherData = { 
                temperature: temperature !== undefined ? temperature : null, 
                rainfall: rainfall !== undefined ? rainfall : null, 
                humidity: humidity !== undefined ? humidity : null, 
                dataSource: 'user' 
            };
            finalSoilData = { type: soilType || 'Unknown', detailedType: soilType || 'Unknown', dataSource: soilType ? 'user' : 'default' };
        }

        console.log(`\n🤖 [${requestId}] ==================== PHASE 3: ML DATA VALIDATION & FORMATTING ====================`);
        const validStates = ['Chhattisgarh', 'Madhya Pradesh', 'West Bengal', 'Bihar', 'Jharkhand', 'Orissa', 'Gujarat','Punjab'];
        const validCrops = ['RICE', 'GROUNDNUT', 'WHEAT', 'MAIZE', 'SUGARCANE'];
        const validSoilTypes = ['Sandy', 'Alluvial', 'Black', 'Red-Yellow', 'Red', 'Loamy'];
        
        const cropMapping = {
            'Rice': 'RICE', 'rice': 'RICE', 'Groundnut': 'GROUNDNUT', 'groundnut': 'GROUNDNUT', 'Wheat': 'WHEAT', 'wheat': 'WHEAT',
            'Maize': 'MAIZE', 'maize': 'MAIZE', 'Corn': 'MAIZE', 'corn': 'MAIZE', 'Sugarcane': 'SUGARCANE', 'sugarcane': 'SUGARCANE'
        };
        
        const normalizedCrop = cropMapping[cropType] || cropType.toUpperCase();
        const normalizedState = location.state;
        const normalizedSoilType = finalSoilData.type;

        let finalState = validStates.includes(normalizedState) ? normalizedState : 'Gujarat';
        let finalCrop = validCrops.includes(normalizedCrop) ? normalizedCrop : 'RICE';
        let finalSoilType = validSoilTypes.includes(normalizedSoilType) ? normalizedSoilType : 'Sandy';
        
        const mlInput = {
            Year: new Date(plantingDate).getFullYear().toString(),
            State: finalState,
            District: location.district.toLowerCase(),
            Area_1000_ha: landArea.toString(),
            Crop: finalCrop,
            Avg_Rainfall_mm: Math.round(finalWeatherData?.rainfall || 50).toString(),
            Avg_Temp_C: Math.round(finalWeatherData?.temperature || 25).toString(),
            Soil_Type: finalSoilType
        };
        console.log(`\n🤖 [${requestId}] Final ML Input Payload:`, mlInput);
        
        let mlResponse = null;
        let predictedYield = 0;
        let confidence = 0;
        let mlModelUsed = false;
        let errorDetails = null;

        console.log(`\n🚀 [${requestId}] ==================== PHASE 4: ML API CALL ====================`);
        const mlStartTime = Date.now();
        try {
            if (!process.env.ML_MODEL_API_URL) throw new Error('ML_MODEL_API_URL not configured');

            mlResponse = await axios.post(process.env.ML_MODEL_API_URL, mlInput, {
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                timeout: 15000
            });
            
            const mlDuration = Date.now() - mlStartTime;
            console.log(`✅ [${requestId}] ML API call completed in: ${mlDuration}ms`);
            
            const mlData = mlResponse.data;
            if (mlData.yield_kg_ha !== null && mlData.yield_kg_ha !== undefined) {
                const yieldKgPerHa = mlData.yield_kg_ha;
                predictedYield = parseFloat((yieldKgPerHa * landArea).toFixed(2)); // Total yield in KG
                
                if (mlData.confidence_interval_95 && Array.isArray(mlData.confidence_interval_95)) {
                    const [lower, upper] = mlData.confidence_interval_95;
                    const range = upper - lower;
                    const mean = (upper + lower) / 2;
                    if (mean > 0) {
                        confidence = Math.max(0.5, Math.min(0.95, 1 - (range / mean / 2)));
                    } else {
                        confidence = 0.85; // Default confidence if mean is zero
                    }
                } else {
                    confidence = 0.85;
                }
                mlModelUsed = true;
                console.log(`🎯 [${requestId}] ML PREDICTION SUCCESS: ${predictedYield} kg`);
            } else {
                throw new Error(`ML model does not support this crop or returned an invalid response.`);
            }
        } catch (mlError) {
            console.error(`❌ [${requestId}] ML API call failed:`, mlError.message);
            errorDetails = { error_message: mlError.message, api_url: process.env.ML_MODEL_API_URL };
            if (mlError.response) errorDetails.api_response = mlError.response.data;
            
            console.warn(`⚠️ [${requestId}] Using fallback prediction calculation...`);
            const cropYieldData = { // Base yield in tons per hectare
                'RICE': { base: 3.8 }, 'WHEAT': { base: 3.2 }, 'MAIZE': { base: 4.5 },
                'SUGARCANE': { base: 75.0 }, 'GROUNDNUT': { base: 1.8 }
            };
            const cropData = cropYieldData[normalizedCrop] || { base: 3.0 };
            
            let yieldPerHaInTons = cropData.base;
            // Simplified fallback adjustments
            if(finalWeatherData?.temperature) yieldPerHaInTons *= Math.max(0.7, 1 - (Math.abs(finalWeatherData.temperature - 25) * 0.02));
            if(finalWeatherData?.rainfall) yieldPerHaInTons *= Math.max(0.6, 1 - (Math.abs(finalWeatherData.rainfall - 80) * 0.003));
            
            const soilFactors = { 'Alluvial': 1.15, 'Black': 1.1, 'Red': 0.95, 'Sandy': 0.85, 'Loamy': 1.0, 'Red-Yellow': 0.98 };
            yieldPerHaInTons *= (soilFactors[normalizedSoilType] || 1.0);
            
            predictedYield = parseFloat((yieldPerHaInTons * landArea * 1000).toFixed(2)); // Total yield in KG
            confidence = 0.65;
            mlModelUsed = false;
            console.log(`🔄 [${requestId}] FALLBACK CALCULATION COMPLETE: ${predictedYield} kg`);
        }

        console.log(`\n💾 [${requestId}] ==================== PHASE 5: SAVING TO DATABASE ====================`);
        
        // Prepare enhanced data for database storage
        const enhancedExternalData = {
            mlInput: mlInput,
            mlResponse: mlResponse?.data || null,
            errorDetails: errorDetails,
            // Save raw weather API response if available
            weatherData: finalWeatherData.dataSource === 'api' ? 
                (await getWeatherData(location.state, location.district, plantingDate)).raw : null,
            // Save complete soil analysis
            soilData: finalSoilData.dataSource === 'local_database' ? {
                searchQuery: { state: location.state, district: location.district },
                foundInDatabase: finalSoilData.raw?.foundInDatabase || false,
                soilTypeSource: finalSoilData.raw?.soilTypeSource || 'unknown',
                rawLookupData: finalSoilData.raw || null
            } : null,
            processingMetadata: {
                requestId: requestId,
                startTime: new Date(startTime),
                mlApiCallDuration: mlResponse ? (Date.now() - mlStartTime) : null,
                dataValidations: {
                    originalCrop: cropType,
                    normalizedCrop: normalizedCrop,
                    originalState: location.state,
                    normalizedState: finalState,
                    originalSoilType: soilType || 'not_provided',
                    normalizedSoilType: finalSoilType
                }
            }
        };

        // Enhanced soil data structure with all available information
        const enhancedSoilData = {
            ...finalSoilData,
            // Add additional metadata for better tracking
            searchMetadata: {
                requestedLocation: `${location.district}, ${location.state}`,
                actualSoilType: finalSoilData.type,
                dataAccuracy: finalSoilData.dataSource === 'local_database' ? 'high' : 'medium',
                timestamp: new Date()
            }
        };

        // Enhanced weather data with more context
        const enhancedWeatherData = {
            ...finalWeatherData,
            // Add metadata about the weather data
            metadata: {
                requestedLocation: `${location.district}, ${location.state}`,
                requestedDate: plantingDate,
                dataTimestamp: new Date(),
                apiCallSuccess: finalWeatherData.dataSource === 'api'
            }
        };

        // Calculate yield per hectare for consistent storage
        const yieldKgPerHa = mlModelUsed ? mlResponse.data.yield_kg_ha : (predictedYield / landArea);

        const prediction = new Prediction({
            userId, 
            cropType, 
            soilType: normalizedSoilType, 
            soilData: enhancedSoilData, 
            landArea,
            location: { 
                state: location.state, 
                district: location.district, 
                coordinates 
            },
            plantingDate, 
            weather: enhancedWeatherData,
            externalData: enhancedExternalData,
            predictedYield: predictedYield, // STANDARDIZED: Total yield in KG
            yieldPerHectare: parseFloat(yieldKgPerHa.toFixed(2)), // STANDARDIZED: Yield per hectare in KG/HA
            confidence: confidence,
            fetchedFromAPIs: fetchData,
            mlModelUsed: mlModelUsed
        });
        
        const savedPrediction = await prediction.save();
        console.log(`✅ [${requestId}] Prediction saved successfully with ID: ${savedPrediction._id}`);
        console.log(`📊 [${requestId}] Saved Data Summary:`);
        console.log(`   - ML Response: ${mlResponse ? 'YES' : 'NO'}`);
        console.log(`   - Soil Type: ${enhancedSoilData.type} (Source: ${enhancedSoilData.dataSource})`);
        console.log(`   - Weather Data: ${enhancedWeatherData.dataSource}`);
        console.log(`   - Predicted Yield: ${predictedYield} kg`);
        console.log(`   - Yield per Hectare: ${yieldKgPerHa} kg/ha`);
        console.log(`   - ML Model Used: ${mlModelUsed ? 'YES' : 'NO (Fallback used)'}`);
        console.log(`   - Confidence: ${(confidence * 100).toFixed(1)}%`);

        const responseData = {
            predictionId: savedPrediction._id,
            success: true,
            input: { 
                cropType, 
                landArea, 
                location, 
                plantingDate, 
                soilType: normalizedSoilType, 
                soilData: enhancedSoilData, 
                weather: enhancedWeatherData, 
                fetchedFromAPIs: fetchData 
            },
            prediction: {
                yield_kg: predictedYield,
                yield_kg_per_hectare: parseFloat(yieldKgPerHa.toFixed(2)),
                confidence_score: Math.round(confidence * 100),
                confidence_level: confidence > 0.8 ? 'High' : confidence > 0.6 ? 'Medium' : 'Low'
            },
            savedData: {
                mlResponse: {
                    saved: mlResponse?.data ? true : false,
                    modelVersion: mlResponse?.data?.model_version || null,
                    yieldFromModel: mlResponse?.data?.yield_kg_ha || null,
                    confidenceInterval: mlResponse?.data?.confidence_interval_95 || null
                },
                soilData: {
                    saved: true,
                    type: enhancedSoilData.type,
                    source: enhancedSoilData.dataSource,
                    detailedAnalysis: enhancedSoilData.analysis ? true : false,
                    recommendations: enhancedSoilData.recommendations?.length || 0
                },
                weatherData: {
                    saved: true,
                    source: enhancedWeatherData.dataSource,
                    temperature: enhancedWeatherData.temperature,
                    rainfall: enhancedWeatherData.rainfall,
                    humidity: enhancedWeatherData.humidity
                }
            },
            technical: {
                ml_model_used: mlModelUsed,
                data_source: fetchData ? 'External APIs + Local DB' : 'User Input',
                model_version: mlResponse?.data?.model_version || 'fallback_v1.0',
                request_id: requestId,
                processing_time_ms: Date.now() - startTime,
                database_save_successful: true
            },
            insights: mlResponse?.data?.recommendations || [
                `Expected yield: ${predictedYield.toFixed(2)} kg`,
                `Yield per hectare: ${parseFloat(yieldKgPerHa.toFixed(2))} kg/ha`,
                `Soil analysis: ${enhancedSoilData.type} soil with ${enhancedSoilData.properties?.fertility || 'unknown'} fertility`,
                `Weather conditions: ${enhancedWeatherData.temperature || 'N/A'}°C, ${enhancedWeatherData.rainfall || 'N/A'}mm rainfall`
            ],
            createdAt: savedPrediction.createdAt
        };

        console.log(`\n🎉 [${requestId}] PREDICTION COMPLETED SUCCESSFULLY! Total time: ${Date.now() - startTime}ms`);
        res.status(201).json(responseData);

    } catch (error) {
        console.error(`\n❌ [${requestId}] A CRITICAL ERROR OCCURRED:`, error);
        res.status(500).json({
            success: false,
            error: 'Prediction processing failed due to an internal server error.',
            message: error.message,
            requestId: requestId,
            debug: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
        });
    }
};

// @desc     Get all predictions for a user
// @route    GET /api/predictions/:userId
// @access   Private
const getUserPredictions = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.userId) {
            return res.status(403).json({ message: 'User not authorized' });
        }
        const predictions = await Prediction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: predictions.length,
            data: predictions,
        });
    } catch (error) {
        console.error('Error fetching user predictions:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single prediction by id
// @route   GET /api/prediction/:id
// @access  Private (user must own the prediction)
const getPredictionById = async (req, res) => {
    try {
        const predictionId = req.params.id;
        if (!predictionId) return res.status(400).json({ success: false, message: 'Prediction id is required' });

        const prediction = await Prediction.findById(predictionId);
        if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });

        // Authorization: only owner may fetch
        if (!req.user || req.user._id.toString() !== prediction.userId.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to view this prediction' });
        }

        // Return plain object to avoid client-side prototype issues
        const responsePrediction = prediction && prediction.toObject ? prediction.toObject() : prediction;
        return res.status(200).json({ success: true, data: responsePrediction });
    } catch (error) {
        console.error('Error fetching prediction by id:', error.message);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    createPrediction,
    getUserPredictions,
    getPredictionById
};

// Public endpoint handler: return soil data for a given state/district (or coordinates)
const getSoilDataByPlace = async (req, res) => {
    try {
        const { state, district, coordinates = null } = req.body || {};
        if (!state || !district) {
            return res.status(400).json({ success: false, message: 'state and district are required in request body' });
        }

        const soil = await getSoilData(state, district, coordinates);
        return res.status(200).json({ success: true, data: soil });
    } catch (error) {
        console.error('Error in /soil-data endpoint:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

// Export the new handler
module.exports.getSoilDataByPlace = getSoilDataByPlace;

// @desc    Generate and stream a PDF report for a prediction
// @route   GET /api/prediction/:id/report
// @access  Private (owner only)
const PDFDocument = require('pdfkit');
const downloadPredictionReport = async (req, res) => {
    try {
        const predictionId = req.params.id;
        if (!predictionId) return res.status(400).json({ success: false, message: 'Prediction id is required' });

        const prediction = await Prediction.findById(predictionId);
        if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });

        if (!req.user || req.user._id.toString() !== prediction.userId.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to download this report' });
        }

        // Convert to plain object
        const p = prediction.toObject ? prediction.toObject() : prediction;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=prediction_${predictionId}.pdf`);

        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);

        // Define colors
        const primaryColor = '#0b6e4f';
        const secondaryColor = '#f2f7f4';
        const accentColor = '#fffaf0';
        const textColor = '#333333';
        const lightTextColor = '#666666';

        // Header with colored background
        const headerHeight = 60;
        doc.rect(0, 0, doc.page.width, headerHeight).fill(primaryColor);
        doc.fillColor('white').fontSize(20).text('Crop Yield Prediction Report', 40, 20, { align: 'left' });
        
        // Small meta info
        doc.fontSize(9).fillColor('white').opacity(0.8);
        doc.text(`Prediction ID: ${predictionId}`, 40, 45);
        doc.text(`Created: ${p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}`, doc.page.width - 200, 45, { width: 160, align: 'right' });
        
        // Reset position and color for content
        doc.y = headerHeight + 20;
        doc.fillColor(textColor);

        // Location & Crop box
        const sectionTitleY = doc.y;
        doc.rect(40, sectionTitleY, doc.page.width - 80, 110).fill(secondaryColor);
        doc.fillColor(primaryColor).fontSize(14).text('Location & Crop', 48, sectionTitleY + 15);
        
        doc.fillColor(textColor).fontSize(11);
        let contentY = sectionTitleY + 40;
        doc.text(`State: ${p.location?.state || 'N/A'}`, 48, contentY);
        doc.text(`District: ${p.location?.district || 'N/A'}`, 48, contentY + 15);
        doc.text(`Coordinates: ${p.location?.coordinates?.latitude || ''}, ${p.location?.coordinates?.longitude || ''}`, 48, contentY + 30);
        doc.text(`Crop: ${p.cropType || 'N/A'}`, 48, contentY + 45);
        doc.text(`Planting Date: ${p.plantingDate ? new Date(p.plantingDate).toLocaleDateString() : 'N/A'}`, 48, contentY + 60);
        
        doc.y = sectionTitleY + 110 + 20;

        // Prediction Summary box
        const summaryY = doc.y;
        doc.rect(40, summaryY, doc.page.width - 80, 140).fill(accentColor);
        doc.fillColor('#b35600').fontSize(14).text('Prediction Summary', 48, summaryY + 15);
        
        doc.fillColor(textColor).fontSize(11);
        contentY = summaryY + 40;
        doc.text(`Predicted Yield (kg): ${p.predictedYield || 'N/A'}`, 48, contentY);
        doc.text(`Yield per hectare (kg/ha): ${p.yieldPerHectare || 'N/A'}`, 48, contentY + 15);
        doc.text(`ML Model Used: ${p.mlModelUsed ? 'Yes' : 'No'}`, 48, contentY + 30);
        
        // Confidence bar
        const confPct = p.confidence ? Math.round((p.confidence) * 100) : null;
        const barX = 48;
        const barY = contentY + 50;
        const barWidth = 300;
        const barHeight = 14;
        
        doc.text('Confidence Level:', barX, barY - 18);
        doc.rect(barX, barY, barWidth, barHeight).fill('#e6e6e6');
        
        if (confPct !== null) {
            const fillWidth = Math.max(2, Math.min(barWidth, Math.round(barWidth * (confPct / 100))));
            // color gradient approximation
            let fillColor = '#d9534f';
            if (confPct >= 75) fillColor = '#4caf50';
            else if (confPct >= 50) fillColor = '#ffc107';
            doc.rect(barX, barY, fillWidth, barHeight).fill(fillColor);
            doc.fillColor('black').fontSize(10).text(`${confPct}%`, barX + barWidth + 8, barY - 2);
        } else {
            doc.fillColor('black').fontSize(10).text('N/A', barX + barWidth + 8, barY - 2);
        }
        
        doc.y = summaryY + 140 + 20;

        // Soil Analysis
        doc.fontSize(14).fillColor(primaryColor).text('Soil Analysis', { underline: true });
        doc.moveDown(0.5);
        
        doc.fillColor(textColor).fontSize(11);
        doc.text(`Soil Type: ${p.soilData?.type || p.soilType || 'N/A'}`);
        
        if (p.soilData?.properties) {
            const props = p.soilData.properties;
            doc.text(`pH: ${props.pH || 'N/A'}, Nitrogen: ${props.nitrogen || 'N/A'}, Organic Carbon: ${props.organicCarbon || 'N/A'}`);
        }
        doc.moveDown(0.5);

        const comp = p.soilData?.composition || p.soilData?.composition || { sand: 0, silt: 0, clay: 0 };
        const compBaseX = 40;
        const compBaseY = doc.y;
        const compBarW = doc.page.width - 120;
        const total = (comp.sand || 0) + (comp.silt || 0) + (comp.clay || 0) || 100;
        const sandW = Math.round(compBarW * ((comp.sand || 0) / total));
        const siltW = Math.round(compBarW * ((comp.silt || 0) / total));
        const clayW = compBarW - sandW - siltW;

        // Draw composition bars
        doc.rect(compBaseX, compBaseY, sandW, 14).fill('#f4c542');
        doc.rect(compBaseX + sandW, compBaseY, siltW, 14).fill('#9ad3bc');
        doc.rect(compBaseX + sandW + siltW, compBaseY, clayW, 14).fill('#b39ddb');
        
        doc.fillColor(textColor).fontSize(10);
        doc.text(`Sand: ${comp.sand || 0}%`, compBaseX, compBaseY + 20);
        doc.text(`Silt: ${comp.silt || 0}%`, compBaseX + sandW + 5, compBaseY + 20);
        doc.text(`Clay: ${comp.clay || 0}%`, compBaseX + sandW + siltW + 5, compBaseY + 20);
        
        doc.y = compBaseY + 40;

        // Weather summary
        doc.fontSize(14).fillColor(primaryColor).text('Weather Summary', { underline: true });
        doc.moveDown(0.5);
        
        doc.fillColor(textColor).fontSize(11);
        doc.text(`Temperature: ${p.weather?.temperature || 'N/A'} °C`);
        doc.text(`Rainfall: ${p.weather?.rainfall || 'N/A'} mm`);
        doc.text(`Humidity: ${p.weather?.humidity || 'N/A'}%`);
        doc.moveDown();

        // ML details and recommendations
        doc.fontSize(14).fillColor(primaryColor).text('ML Details & Recommendations', { underline: true });
        doc.moveDown(0.5);
        
        doc.fillColor(textColor).fontSize(11);
        const ml = p.externalData?.mlResponse || p.externalData?.mlResponse || null;
        
        if (ml) {
            doc.text(`Model Version: ${ml.model_version || 'N/A'}`);
            doc.moveDown(0.3);
            
            if (ml.recommendations && Array.isArray(ml.recommendations) && ml.recommendations.length > 0) {
                ml.recommendations.forEach((r, i) => {
                    doc.text(`${i + 1}. ${r}`, { indent: 10 });
                    doc.moveDown(0.3);
                });
            } else {
                doc.text('No recommendations available.');
            }
        } else {
            const insights = p.insights || (p.externalData && p.externalData.mlResponse && p.externalData.mlResponse.recommendations) || [];
            if (insights.length > 0) {
                insights.forEach((item, idx) => {
                    doc.text(`${idx + 1}. ${item}`, { indent: 10 });
                    doc.moveDown(0.3);
                });
            } else {
                doc.text('No recommendations available.');
            }
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(9).fillColor(lightTextColor).text('Generated by Crop Yield Prediction Platform', { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
};

module.exports.downloadPredictionReport = downloadPredictionReport;