# Data Format Standards - AgriVision Backend

## Overview
This document defines the standardized data formats used throughout the AgriVision backend to ensure consistency across all controllers, models, and API responses.

## Yield Data Standards

### Database Storage (prediction.model.js)
```javascript
{
  predictedYield: Number,      // Total yield in KILOGRAMS (KG) for entire land area
  yieldPerHectare: Number,     // Yield per hectare in KILOGRAMS per HECTARE (KG/HA)
}
```

### API Response Format
```javascript
{
  prediction: {
    yield_kg: Number,                    // Total yield in kilograms
    yield_kg_per_hectare: Number,        // Yield per hectare in kg/ha
    confidence_score: Number,            // Confidence percentage (0-100)
    confidence_level: String             // 'High', 'Medium', 'Low'
  }
}
```

## ML API Integration Standards

### Input Format (to ML API)
```javascript
{
  Crop: String,              // Standardized crop name
  State: String,             // Standardized state name  
  SoilType: String,          // Standardized soil type
  Area: Number,              // Land area in hectares
  // Weather data in standardized units
  // Soil composition in percentages
}
```

### Output Storage (from ML API)
```javascript
{
  externalData: {
    mlInput: Object,         // Exact input sent to ML API
    mlResponse: Object,      // Complete ML API response
    mlInput: {
      // Preserves exact input for reproducibility
    },
    mlResponse: {
      data: {
        yield_kg_ha: Number, // ML model output in kg/ha
        confidence: Number   // Model confidence score
      }
    }
  }
}
```

## Soil Data Standards

### Enhanced Soil Data Structure
```javascript
{
  soilData: {
    type: String,                    // ML-compatible soil type
    detailedType: String,           // Detailed classification
    composition: {
      sand: Number,                 // Percentage (0-100)
      clay: Number,                 // Percentage (0-100)
      silt: Number                  // Percentage (0-100)
    },
    properties: {
      pH: Number,                   // pH value
      nitrogen: Number,             // Percentage
      organicCarbon: Number,        // Percentage
      cationExchangeCapacity: Number, // cmol/kg
      fertility: String             // 'Low', 'Medium', 'High'
    },
    dataSource: String              // 'local_database', 'api', 'user', 'fallback'
  }
}
```

## Weather Data Standards

### Weather Data Structure
```javascript
{
  weather: {
    temperature: Number,            // Celsius
    rainfall: Number,               // Millimeters
    humidity: Number,               // Percentage (0-100)
    metadata: {
      requestedLocation: String,
      apiCallSuccess: Boolean,
      dataTimestamp: Date
    },
    dataSource: String              // 'api' or 'user'
  }
}
```

## Data Consistency Rules

### 1. Unit Consistency
- **Yield**: Always in kilograms (KG)
- **Area**: Always in hectares (HA)
- **Temperature**: Always in Celsius (°C)
- **Rainfall**: Always in millimeters (MM)
- **Humidity**: Always in percentage (0-100)

### 2. Field Naming Convention
- Use `camelCase` for database fields
- Use `snake_case` for API responses
- Always include units in field names where applicable

### 3. Data Validation
- All yield values must be positive numbers
- Confidence scores must be between 0 and 1
- Area must be greater than 0
- Soil composition percentages should sum to ~100

## Migration Notes

### Issues Fixed:
1. **Yield Unit Inconsistency**: 
   - OLD: Mixed usage of tons and kg
   - NEW: Standardized to kilograms everywhere

2. **Response Format Inconsistency**:
   - OLD: Sometimes `yield_tons`, sometimes `yield_kg`
   - NEW: Always `yield_kg` and `yield_kg_per_hectare`

3. **Database Storage**:
   - Added `yieldPerHectare` field for consistency
   - Enhanced comments for clarity

### Backward Compatibility:
- All existing data remains valid
- New fields are optional to maintain compatibility
- API responses include both total and per-hectare values

## Testing Standards

When testing the API, expect:
```javascript
{
  "success": true,
  "predictionId": "objectId",
  "prediction": {
    "yield_kg": 9500.00,              // Total yield in kg
    "yield_kg_per_hectare": 3800.00,  // Yield per hectare
    "confidence_score": 85,           // Percentage
    "confidence_level": "High"
  }
}
```

## File Status

### Active Files (Standardized):
- `src/models/prediction.model.js` ✅
- `src/controllers/prediction.controller.js` ✅

### Backup Files (Legacy - DO NOT USE):
- `src/controllers/prediction.controller.js.backup` ❌
- `src/controllers/prediction.controller.js.working` ❌

---
**Last Updated**: September 2, 2025
**Status**: STANDARDIZED ✅
