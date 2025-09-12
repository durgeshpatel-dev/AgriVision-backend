# Market API Documentation

## Overview
The Market API provides real-time crop price data from Indian agricultural markets. It integrates with government APIs and provides fallback mock data when external APIs are unavailable.

## Endpoints

### 1. Get Market Prices
**Endpoint:** `GET /api/market/prices`

**Description:** Fetches current market prices for crops across different regions

**Query Parameters:**
- `crop` (string, optional): Filter by crop name (e.g., "Wheat", "Rice")
- `state` (string, optional): Filter by state name (e.g., "Punjab", "Haryana")
- `district` (string, optional): Filter by district name
- `search` (string, optional): Search across crop names, markets, and districts

**Example Request:**
```
GET /api/market/prices?crop=Wheat&state=Punjab
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "crop": "Wheat",
      "variety": "Durum",
      "state": "Punjab",
      "district": "Ludhiana",
      "market": "Ludhiana Mandi",
      "minPrice": 1850,
      "maxPrice": 2100,
      "modalPrice": 1975,
      "trend": "up",
      "change": "+5.2%",
      "lastUpdated": "2 hours ago",
      "volume": "1,250 quintals",
      "unit": "Quintal"
    }
  ],
  "meta": {
    "total": 1,
    "source": "mock",
    "timestamp": "2025-09-10T18:44:57.106Z",
    "filters": {
      "crop": "Wheat",
      "state": "Punjab"
    }
  }
}
```

### 2. Get Market Statistics
**Endpoint:** `GET /api/market/stats`

**Description:** Provides aggregated market statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMarkets": 1247,
    "activeCrops": 156,
    "avgPriceChange": "+2.4%",
    "lastUpdated": "2 min ago"
  },
  "timestamp": "2025-09-10T18:44:57.106Z"
}
```

### 3. Get Available Crops
**Endpoint:** `GET /api/market/crops`

**Description:** Returns list of available crops in the system

**Response:**
```json
{
  "success": true,
  "data": [
    "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", 
    "Onion", "Potato", "Tomato", "Soybean", "Groundnut"
  ],
  "total": 10
}
```

### 4. Get Available States
**Endpoint:** `GET /api/market/states`

**Description:** Returns list of available states

**Response:**
```json
{
  "success": true,
  "data": [
    "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", 
    "Karnataka", "Maharashtra", "Punjab", "Rajasthan"
  ],
  "total": 8
}
```

### 5. Get Crop Price Trend
**Endpoint:** `GET /api/market/trend/:crop`

**Description:** Returns historical price trend for a specific crop (requires authentication)

**Parameters:**
- `crop` (string): Name of the crop

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-09-01",
      "price": 1850,
      "volume": 750
    },
    {
      "date": "2025-09-02", 
      "price": 1875,
      "volume": 820
    }
  ],
  "crop": "wheat",
  "period": "30 days"
}
```

## Data Sources

### Primary Sources (Live Data)
1. **Open Government Data Platform India**
   - URL: https://api.data.gov.in/
   - API Key required: Set in environment variable `OGD_API_KEY`
   - Resource ID: `9ef84268-d588-465a-a308-a864a43d0070`

2. **Government Agricultural Data**
   - API Key: Set in environment variable `GOV_API_KEY`
   - Backup source for market data

### Fallback Data
When external APIs are unavailable, the system provides realistic mock data based on:
- Historical price patterns
- Regional variations
- Seasonal trends
- Market volatility

## Error Handling

The API includes comprehensive error handling:

1. **External API Failures:** Falls back to mock data automatically
2. **Invalid Parameters:** Returns appropriate error messages
3. **Network Issues:** Implements timeout and retry logic
4. **Data Validation:** Ensures data integrity

## Environment Variables

Required environment variables in `.env`:

```env
# Government API Keys
OGD_API_KEY=your_ogd_api_key_here
GOV_API_KEY=your_gov_api_key_here

# Server Configuration
PORT=5001
```

## Frontend Integration

### Using the Market API in React

```javascript
import { marketAPI } from '../utils/api';

// Get market prices
const fetchMarketData = async () => {
  try {
    const response = await marketAPI.getMarketPrices({
      crop: 'Wheat',
      state: 'Punjab'
    });
    setMarketData(response.data);
  } catch (error) {
    console.error('Failed to fetch market data:', error);
  }
};

// Get market statistics
const fetchStats = async () => {
  try {
    const response = await marketAPI.getMarketStats();
    setStats(response.data);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};
```

## Performance Considerations

1. **Caching:** API responses are cached for 5 minutes to reduce external API calls
2. **Rate Limiting:** Implements rate limiting to prevent API abuse
3. **Pagination:** Large datasets are paginated for better performance
4. **Compression:** Responses are compressed to reduce bandwidth

## Security

1. **Input Validation:** All input parameters are validated
2. **API Key Protection:** External API keys are stored securely in environment variables
3. **CORS Configuration:** Proper CORS setup for frontend integration
4. **Authentication:** Some endpoints require user authentication

## Testing

### Testing the API

```bash
# Test basic market prices
curl http://localhost:5001/api/market/prices

# Test with filters
curl "http://localhost:5001/api/market/prices?crop=Wheat&state=Punjab"

# Test statistics
curl http://localhost:5001/api/market/stats

# Test available crops
curl http://localhost:5001/api/market/crops
```

## Future Enhancements

1. **Real-time Updates:** WebSocket integration for live price updates
2. **Price Alerts:** Notification system for price threshold alerts
3. **Advanced Analytics:** Price prediction and trend analysis
4. **Mobile API:** Optimized endpoints for mobile applications
5. **Caching Layer:** Redis integration for better performance