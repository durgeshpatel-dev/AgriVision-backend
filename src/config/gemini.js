const { GoogleGenerativeAI } = require('@google/generative-ai');
const util = require('util');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Preferred model fallbacks (initial suggestions). We'll use these predefined models.
const PREFERRED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-turbo',
  'gemini-1.5',
];

// Helper: sleep ms
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Get supported models from the API and filter those that support generateContent
const listSupportedModels = async () => {
  try {
    // Since the Google Generative AI library doesn't have listModels method,
    // return the predefined preferred models
    return PREFERRED_MODELS;
  } catch (err) {
    console.warn('Failed to list Gemini models:', err?.message || err);
    return [];
  }
};

// Find the best model to use: prefer options.model, then PREFERRED_MODELS that are available, then first available from API
const selectModel = async (preferred) => {
  const apiModels = await listSupportedModels();
  if (preferred && apiModels.includes(preferred)) return preferred;

  for (const m of PREFERRED_MODELS) {
    if (apiModels.includes(m)) return m;
  }

  // Fallback to first model returned by API
  if (apiModels.length > 0) return apiModels[0];

  // Last resort: return the preferred or the first of PREFERRED_MODELS
  return preferred || PREFERRED_MODELS[0];
};

// Core generation with retries and model fallback
const generateContent = async (prompt, options = {}) => {
  const maxAttempts = options.maxAttempts || 3;
  let attempt = 0;
  let lastErr = null;
  // If user passed a model, try it first, otherwise we'll select one dynamically
  let modelToTry = options.model;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      // On first attempt, pick modelToTry (if provided) or select dynamically
      if (!modelToTry) {
        modelToTry = await selectModel(options.model);
      }

      const model = await genAI.getGenerativeModel({ model: modelToTry });

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
        model: modelToTry,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      lastErr = error;
      const msg = (error && error.message) || String(error);
      console.warn(`Gemini attempt ${attempt} failed for model=${modelToTry}:`, msg);

      // If error suggests model not supported or 404 for that model, clear modelToTry so we select another on next loop
      if (/not found|is not found|not supported|404/i.test(msg)) {
        modelToTry = null; // force re-selection from API
      }

      // If 503 or transient, exponential backoff and retry
      if (/503|unavailable|timed out|timeout|rate limit/i.test(msg) && attempt < maxAttempts) {
        const backoff = Math.pow(2, attempt) * 500;
        await sleep(backoff);
        continue;
      }

      // For other errors, try to select another model once, otherwise break
      if (attempt < maxAttempts) {
        modelToTry = null; // try selecting another model
        const backoff = Math.pow(2, attempt) * 300;
        await sleep(backoff);
        continue;
      }

      // Exhausted attempts
      break;
    }
  }

  // If we reach here, all attempts failed
  const err = lastErr || new Error('Unknown Gemini error');
  console.error('generateContent: all attempts failed:', util.inspect(err, { depth: 2 }));
  throw err;
};

module.exports = {
  generateContent,
  PREFERRED_MODELS,
  listSupportedModels,
};
