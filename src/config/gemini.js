const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get Gemini model
const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Generate content with Gemini
const generateContent = async (prompt, options = {}) => {
  try {
    const model = getGeminiModel(options.model);
    
    const generationConfig = {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxOutputTokens || 1024,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();
    
    return {
      text,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      }
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

// Generate content with streaming
const generateContentStream = async (prompt, options = {}) => {
  try {
    const model = getGeminiModel(options.model);
    
    const generationConfig = {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxOutputTokens || 1024,
    };

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    return result.stream;
  } catch (error) {
    console.error('Gemini Stream API Error:', error);
    throw error;
  }
};

module.exports = {
  getGeminiModel,
  generateContent,
  generateContentStream
};
