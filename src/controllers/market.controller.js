const marketService = require('../services/marketService');
const DataTranslation = require('../utils/dataTranslation');

// Create translator instance outside the class
const translator = new DataTranslation();

class MarketController {
  // Get market prices with optional filters and pagination
  async getMarketPrices(req, res) {
    try {
      console.log('🏪 Market Controller: Getting market prices');
      console.log('📝 Query parameters:', req.query);

      const filters = {
        crop: req.query.crop,
        state: req.query.state,
        district: req.query.district,
        search: req.query.search
      };

      // Remove undefined/empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key] || filters[key].trim() === '') {
          delete filters[key];
        }
      });

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Language parameter for translation
      const language = req.query.language || req.headers['accept-language'] || 'en';
      const targetLang = language.includes('hi') ? 'hi' : 'en';

      console.log('🔍 Applied filters:', filters);
      console.log('📄 Pagination params:', { page, limit, offset });
      console.log('🌐 Language:', targetLang);

      const result = await marketService.getMarketPrices(filters, { page, limit, offset });

      if (!result.success) {
        console.error('❌ Market service failed:', result.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch market prices',
          error: result.error
        });
      }

      // Translate the data if needed
      const translatedData = translator.translateMarketData(result.data, targetLang);

      console.log(`✅ Market data fetched: ${result.data.length} records (Page ${page}/${result.pagination.totalPages})`);
      console.log(`🌐 Data translated to: ${targetLang}`);

      res.json({
        success: true,
        data: translatedData,
        pagination: result.pagination,
        source: result.source,
        timestamp: result.timestamp,
        message: result.message,
        filters: filters
      });

    } catch (error) {
      console.error('❌ Market Controller Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching market prices',
        error: error.message
      });
    }
  }

  // Get market statistics
  async getMarketStats(req, res) {
    try {
      console.log('📊 Market Controller: Getting market statistics');

      const stats = await marketService.getMarketStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Market Stats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch market statistics',
        error: error.message
      });
    }
  }

  // Get available crops
  async getAvailableCrops(req, res) {
    try {
      console.log('🌾 Market Controller: Getting available crops');

      const language = req.query.language || req.headers['accept-language'] || 'en';
      const targetLang = language.includes('hi') ? 'hi' : 'en';

      const crops = [
        'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Onion', 'Potato', 'Tomato', 
        'Soybean', 'Groundnut', 'Mustard', 'Sunflower', 'Jowar', 'Bajra', 'Barley',
        'Chana', 'Tur', 'Moong', 'Urad', 'Masoor', 'Turmeric', 'Coriander', 'Cumin',
        'Chilli', 'Ginger', 'Garlic', 'Cardamom', 'Black Pepper', 'Cloves', 'Nutmeg',
        'Pomegranate', 'Banana', 'Lime'
      ];

      const translatedCrops = targetLang === 'hi' 
        ? translator.getTranslatedCrops('hi')
        : crops.map(crop => ({ value: crop, label: crop }));

      res.json({
        success: true,
        data: translatedCrops,
        total: translatedCrops.length,
        language: targetLang
      });

    } catch (error) {
      console.error('❌ Crops Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available crops',
        error: error.message
      });
    }
  }

  // Get available states
  async getAvailableStates(req, res) {
    try {
      console.log('🗺️ Market Controller: Getting available states');

      const language = req.query.language || req.headers['accept-language'] || 'en';
      const targetLang = language.includes('hi') ? 'hi' : 'en';

      const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
        'Ladakh', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep', 'Puducherry'
      ];

      const translatedStates = targetLang === 'hi' 
        ? translator.getTranslatedStates('hi')
        : states.map(state => ({ value: state, label: state }));

      res.json({
        success: true,
        data: translatedStates,
        total: translatedStates.length,
        language: targetLang
      });

    } catch (error) {
      console.error('❌ States Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available states',
        error: error.message
      });
    }
  }

  // Get available districts by state with translation support
  async getAvailableDistricts(req, res) {
    try {
      const { state } = req.query;
      const language = req.query.language || req.headers['accept-language'] || 'en';
      const targetLang = language.includes('hi') ? 'hi' : 'en';
      
      console.log(`🗺️ Market Controller: Getting available districts for state: ${state} in language: ${targetLang}`);

      if (!state) {
        return res.status(400).json({
          success: false,
          message: 'State parameter is required'
        });
      }

      const districts = await marketService.getAvailableDistricts(state);

      // Translate district names if needed
      const translatedDistricts = targetLang === 'hi' ? 
        districts.map(district => {
          const translatedName = translator.districtTranslations[district];
          const isTranslated = !!translatedName;
          return {
            value: district, // Keep original value for API calls
            label: translatedName || district, // Display translated name or original if no translation
            original: district,
            translated: isTranslated
          };
        }) :
        districts.map(district => ({
          value: district,
          label: district,
          original: district,
          translated: false
        }));

      console.log(`✅ Districts fetched for ${state}: ${districts.length} districts translated to ${targetLang}`);

      res.json({
        success: true,
        data: translatedDistricts,
        state: state,
        language: targetLang,
        count: districts.length
      });

    } catch (error) {
      console.error('❌ Districts Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available districts',
        error: error.message
      });
    }
  }

  // Get price trend for a specific crop
  async getCropTrend(req, res) {
    try {
      const { crop } = req.params;
      console.log(`📈 Market Controller: Getting trend for ${crop}`);

      // This would normally fetch historical data
      // For now, return mock trend data
      const trendData = this.generateMockTrendData(crop);

      res.json({
        success: true,
        data: trendData,
        crop: crop,
        period: '30 days'
      });

    } catch (error) {
      console.error('❌ Trend Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch crop trend',
        error: error.message
      });
    }
  }

  // Helper method to generate mock trend data
  generateMockTrendData(crop) {
    const days = 30;
    const basePrice = this.getBasePriceForCrop(crop);
    const trendData = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price fluctuation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = Math.round(basePrice * (1 + variation));
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        price: price,
        volume: Math.floor(Math.random() * 1000 + 500)
      });
    }

    return trendData;
  }

  // Helper method to get base price for crops
  getBasePriceForCrop(crop) {
    const basePrices = {
      'wheat': 1800,
      'rice': 2200,
      'maize': 1350,
      'cotton': 5900,
      'sugarcane': 360,
      'onion': 1400,
      'potato': 800,
      'tomato': 1200,
      'soybean': 3500,
      'groundnut': 4200
    };

    return basePrices[crop.toLowerCase()] || 1500;
  }
}

module.exports = new MarketController();