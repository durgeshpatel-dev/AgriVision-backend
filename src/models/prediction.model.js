
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cropType: {
    type: String,
    required: true,
  },
  soilType: {
    type: String,
    required: false, // Optional - can be fetched from API or user provided
  },
  // Enhanced soil data structure
  soilData: {
    type: {
      type: String, // ML-compatible soil type
    },
    detailedType: {
      type: String, // Detailed soil classification
    },
    composition: {
      sand: Number, // percentage
      clay: Number, // percentage  
      silt: Number, // percentage
    },
    properties: {
      pH: Number,
      nitrogen: Number, // percentage
      organicCarbon: Number, // percentage
      cationExchangeCapacity: Number, // cmol/kg
      fertility: String, // 'Low', 'Medium', 'High'
    },
    analysis: {
      drainage: String, // 'Poor', 'Moderate', 'Good'
      waterHolding: String, // 'Low', 'Medium', 'High'
      nutrientRetention: String, // 'Low', 'Medium', 'High'
    },
    recommendations: [String], // Array of soil management recommendations
    suitableCrops: [String], // Array of suitable crops for this soil
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    location: String, // Full location string
    searchMetadata: {
      requestedLocation: String,
      actualSoilType: String,
      dataAccuracy: String, // 'high', 'medium', 'low'
      timestamp: Date
    },
    raw: Object, // Raw lookup data and metadata
    dataSource: {
      type: String, // 'local_database', 'api', 'user', 'default', 'fallback'
      default: 'user'
    }
  },
  landArea: { // in hectares
    type: Number,
    required: true,
  },
  location: {
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    }
  },
  plantingDate: {
    type: Date,
    required: true,
  },
  // Weather data - optional (can be fetched or user provided)
  weather: {
    temperature: {
      type: Number, // in Celsius
      required: false,
    },
    rainfall: {
      type: Number, // in mm
      required: false,
    },
    humidity: {
      type: Number, // percentage
      required: false,
    },
    metadata: {
      requestedLocation: String,
      requestedDate: Date,
      dataTimestamp: Date,
      apiCallSuccess: Boolean
    },
    dataSource: {
      type: String, // 'api' or 'user'
      default: 'user'
    }
  },
  // Raw API data storage
  externalData: {
    soilData: {
      type: Object, // Raw data from SoilGrids API or local lookup
    },
    weatherData: {
      type: Object, // Raw data from Weather API
    },
    mlInput: {
      type: Object, // Input data sent to ML API - STANDARDIZED FORMAT
      comment: 'Exact input payload sent to ML API for reproducibility'
    },
    mlResponse: {
      type: Object, // Complete response from ML API including all fields - STANDARDIZED FORMAT
      comment: 'Full ML API response preserved for analysis and debugging'
    },
    errorDetails: {
      type: Object, // Any API errors encountered
    },
    validationWarnings: [String], // Array of validation warnings
    processingMetadata: {
      requestId: String,
      startTime: Date,
      mlApiCallDuration: Number, // in milliseconds
      dataValidations: {
        originalCrop: String,
        normalizedCrop: String,
        originalState: String,
        normalizedState: String,
        originalSoilType: String,
        normalizedSoilType: String
      }
    }
  },
  // ML Model results - STANDARDIZED FORMAT
  predictedYield: {
    type: Number, // Total yield in KILOGRAMS (KG) - CONSISTENT UNIT
    required: true,
    comment: 'Total predicted yield in kilograms for the entire land area'
  },
  yieldPerHectare: {
    type: Number, // Yield per hectare in KILOGRAMS (KG/HA) - CONSISTENT UNIT
    required: false,
    comment: 'Predicted yield per hectare in kilograms'
  },
  confidence: {
    type: Number, // Confidence score from the ML model
  },
  fetchedFromAPIs: {
    type: Boolean,
    default: false,
  },
  mlModelUsed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Prediction = mongoose.model('Prediction', predictionSchema);
module.exports = Prediction;
