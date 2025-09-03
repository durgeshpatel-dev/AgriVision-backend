# API Configuration Guide

## 1. Weather API Setup (OpenWeatherMap)

### Steps to get Weather API key:
1. Go to: https://openweathermap.org/api
2. Click "Sign Up" (free account)
3. Verify your email
4. Go to API Keys section in your dashboard
5. Copy your API key
6. Update .env file: WEATHER_API_KEY=your_actual_api_key

### Free tier limits:
- 1,000 calls/day
- Current weather data
- 5 day forecast

## 2. Soil API (SoilGrids)
- No API key required
- Free to use
- Public API by ISRIC

## 3. Testing without API keys

If you want to test without setting up APIs, the system will use fallback data:

### Weather fallback:
- Temperature: 25°C
- Rainfall: 50mm
- Humidity: 70%

### Soil fallback:
- Soil type: "Loamy"

## 4. Current Configuration Status

Check your .env file:
```
WEATHER_API_KEY=your_openweathermap_api_key_here  # ❌ Need to configure
ML_MODEL_API_URL=http://127.0.0.1:5000/predict   # ✅ Configured
```

## 5. Test Commands

### Test APIs individually:
```bash
node test-api-fetching.js
```

### Test complete prediction flow:
```bash
node test-complete-verification.js
```

### Test ML API format:
```bash
node test-ml-correct-format.js
```

## 6. Quick Start (with fallback data)

You can test the system immediately even without weather API:
1. The system will use fallback weather data
2. Soil API should work without authentication
3. Your ML API is already working on port 5000

The prediction will still work and provide results!
