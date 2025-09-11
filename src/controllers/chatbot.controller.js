const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Prediction = require('../models/prediction.model');
const { generateContent } = require('../config/gemini');

// Get user's latest prediction data
const getLatestPrediction = async (userId) => {
  try {
    const prediction = await Prediction.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();
    return prediction;
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return null;
  }
};

// Simple language detection function
const detectLanguage = (text) => {
  if (!text) return 'en';

  // Check for Devanagari script (Hindi, Marathi, etc.)
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    // Further distinguish between Hindi, Marathi, etc. based on common words
    if (/\b(क्या|है|हैं|करें|कैसे|कब|कहाँ|क्यों|कौन|कितना|कितने|कितनी)\b/i.test(text)) return 'hi';
    if (/\b(काय|आहे|आहोत|करा|कसे|कधी|कुठे|का|कोण|किती)\b/i.test(text)) return 'mr';
    if (/\b(શું|છે|છીએ|કરો|કેવી|ક્યારે|ક્યાં|કેમ|કોણ|કેટલું|કેટલા|કેટલી)\b/i.test(text)) return 'gu';
    if (/\b(ఏమి|ఉంది|ఉన్నారు|చేయండి|ఎలా|ఎప్పుడు|ఎక్కడ|ఎందుకు|ఎవరు|ఎంత|ఎంతమంది)\b/i.test(text)) return 'te';
    if (/\b(என்ன|இருக்கிறது|இருக்கிறோம்|செய்யுங்கள்|எப்படி|எப்போது|எங்கே|ஏன்|யார்|எவ்வளவு)\b/i.test(text)) return 'ta';
    if (/\b(ಏನು|ಇದೆ|ಇದ್ದೇವೆ|ಮಾಡಿ|ಹೇಗೆ|ಯಾವಾಗ|ಎಲ್ಲಿ|ಏಕೆ|ಯಾರು|ಎಷ್ಟು)\b/i.test(text)) return 'kn';
    if (/\b(എന്ത്|ഉണ്ട്|ഉണ്ട്|ചെയ്യുക|എങ്ങനെ|എപ്പോൾ|എവിടെ|എന്തുകൊണ്ട്|ആരാണ്|എത്ര)\b/i.test(text)) return 'ml';
    if (/\b(কি|আছে|আছি|করুন|কীভাবে|কখন|কোথায়|কেন|কে|কত|কতজন)\b/i.test(text)) return 'bn';
    if (/\b(ਕੀ|ਹੈ|ਹਾਂ|ਕਰੋ|ਕਿਵੇਂ|ਕਦੋਂ|ਕਿੱਥੇ|ਕਿਉਂ|ਕੌਣ|ਕਿੰਨਾ|ਕਿੰਨੇ|ਕਿੰਨੀ)\b/i.test(text)) return 'pa';
    return 'hi'; // Default to Hindi if Devanagari but no specific match
  }

  // Check for other scripts or default to English
  return 'en';
};
const buildPersonalizedContext = async (user, language = 'en') => {
  try {
    const latestPrediction = await getLatestPrediction(user._id);
    
    // User profile context
    const farmDetails = user.farmDetails || {};
    const profileContext = `
User Profile:
- Name: ${user.name || 'Unknown'}
- Location: ${farmDetails.location || farmDetails.region || 'Not specified'}
- Farm Size: ${farmDetails.farmSize || 'Not specified'}
- Primary Crops: ${farmDetails.crops ? farmDetails.crops.join(', ') : 'Not specified'}
- Soil Type: ${farmDetails.soilType || 'Not specified'}
- Irrigation Method: ${farmDetails.irrigation || 'Not specified'}
- Experience Level: ${farmDetails.experience || 'Not specified'}
- Climate Zone: ${farmDetails.climate || 'Not specified'}
`;

    // Latest prediction context
    let predictionContext = '';
    if (latestPrediction) {
      predictionContext = `
Latest Prediction/Analysis:
- Type: ${latestPrediction.type || 'Not available'}
- Result: ${latestPrediction.result || latestPrediction.prediction || 'Not available'}
- Confidence: ${latestPrediction.confidence || latestPrediction.probability || 'Not available'}
- Date: ${latestPrediction.createdAt ? new Date(latestPrediction.createdAt).toLocaleDateString() : 'Not available'}
- Crop: ${latestPrediction.crop || 'Not specified'}
- Analysis: ${latestPrediction.analysis || 'Not available'}
`;
    } else {
      predictionContext = '\nLatest Prediction/Analysis: No recent predictions available.';
    }

    return {
      profileContext,
      predictionContext,
      hasProfile: !!user.farmDetails,
      hasPrediction: !!latestPrediction
    };
  } catch (error) {
    console.error('Error building context:', error);
    return {
      profileContext: '',
      predictionContext: '',
      hasProfile: false,
      hasPrediction: false
    };
  }
};

// Build system prompt based on language and context
const buildSystemPrompt = (context, language = 'en') => {
  const languageInstructions = {
    'en': 'Respond in clear, simple English.',
    'hi': 'हिंदी में जवाब दें। सरल और किसान-अनुकूल भाषा का उपयोग करें।',
    'mr': 'मराठीत उत्तर द्या. सोप्या आणि शेतकरी-अनुकूल भाषेचा वापर करा।',
    'gu': 'ગુજરાતીમાં જવાબ આપો. સરળ અને ખેડૂત-અનુકૂળ ભાષાનો ઉપયોગ કરો।',
    'te': 'తెలుగులో సమాధానం ఇవ్వండి. సరళమైన మరియు రైతు-అనుకూల భాషను ఉపయోగించండి।',
    'ta': 'தமிழில் பதிலளிக்கவும். எளிமையான மற்றும் விவசாயி-நட்பு மொழியைப் பயன்படுத்தவும்।',
    'kn': 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ಸರಳ ಮತ್ತು ರೈತ-ಸ್ನೇಹಿ ಭಾಷೆಯನ್ನು ಬಳಸಿ।',
    'ml': 'മലയാളത്തിൽ ഉത്തരം നൽകുക. ലളിതവും കർഷക-സൗഹൃദവുമായ ഭാഷ ഉപയോഗിക്കുക।',
    'bn': 'বাংলায় উত্তর দিন। সরল এবং কৃষক-বান্ধব ভাষা ব্যবহার করুন।',
    'pa': 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਾਦੀ ਅਤੇ ਕਿਸਾਨ-ਅਨੁਕੂਲ ਭਾਸ਼ਾ ਦੀ ਵਰਤੋਂ ਕਰੋ।'
  };

  const systemPrompt = `You are AgriVision AI, an intelligent agricultural assistant designed to help farmers with personalized advice.

LANGUAGE INSTRUCTION: ${languageInstructions[language] || languageInstructions['en']}

CONTEXT:
${context.profileContext}
${context.predictionContext}

GUIDELINES:
1. Provide practical, actionable agricultural advice
2. Consider the user's specific farming context, location, and crops
3. Reference their latest predictions/analysis when relevant
4. Suggest sustainable and cost-effective farming practices
5. Include seasonal considerations and local climate factors
6. Be conversational but informative
7. If uncertain about specific local conditions, recommend consulting local agricultural experts
8. Provide step-by-step instructions when possible
9. Consider crop rotation, pest management, soil health, and water management
10. Always prioritize food safety and environmental sustainability

RESPONSE FORMAT:
- Give a direct answer to the user's question
- Provide 2-3 actionable recommendations
- Include any relevant warnings or precautions
- Suggest follow-up actions if needed

Remember: You are helping real farmers make important decisions about their livelihood. Be accurate, helpful, and considerate of their resources and constraints.`;

  return systemPrompt;
};

// Main chat function
const askQuestion = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question, language = 'en', sessionId } = req.body;
    console.log('Received question:', question);
    const userId = req.user._id;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Detect language from the question
    const detectedLanguage = detectLanguage(question);
    console.log('Detected language:', detectedLanguage);
    
    // Use detected language if no explicit language is provided
    const responseLanguage = language !== 'en' ? language : detectedLanguage;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build personalized context
    const context = await buildPersonalizedContext(user, responseLanguage);
    
    // Get recent chat history for context
    const userChat = await Chat.findOne({ userId });
    let conversationHistory = '';
    
    if (userChat && userChat.messages.length > 0) {
      const recentMessages = userChat.messages.slice(-6); // Last 6 messages for context
      conversationHistory = recentMessages.map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
    }

    // Build the complete prompt
    const systemPrompt = buildSystemPrompt(context, responseLanguage);
    const fullPrompt = `${systemPrompt}

RECENT CONVERSATION:
${conversationHistory}

USER QUESTION: ${question}

RESPONSE:`;

    // Generate response using Gemini
    const geminiResponse = await generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 1024
    });

    const responseTime = Date.now() - startTime;

    // Save the conversation
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // Add user message
    chat.messages.push({
      sender: 'user',
      content: question,
      timestamp: new Date()
    });

    // Add bot response
    chat.messages.push({
      sender: 'bot',
      content: geminiResponse.text,
      timestamp: new Date()
    });

    // Keep only last 50 messages to prevent memory bloat
    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    await chat.save();

    res.json({
      success: true,
      data: {
        response: geminiResponse.text,
        language: responseLanguage,
        detectedLanguage: detectedLanguage,
        contextUsed: {
          userProfile: context.hasProfile,
          prediction: context.hasPrediction,
          conversationHistory: conversationHistory.length > 0
        },
        metadata: {
          responseTime,
          tokens: geminiResponse.usage,
          sessionId: sessionId || 'default'
        }
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your question. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20 } = req.query;

    const chat = await Chat.findOne({ userId });
    
    if (!chat || !chat.messages.length) {
      return res.json({
        success: true,
        data: {
          messages: [],
          total: 0
        }
      });
    }

    // Get last N messages
    const messages = chat.messages.slice(-parseInt(limit));

    res.json({
      success: true,
      data: {
        messages: messages.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        total: chat.messages.length
      }
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// Clear chat history
const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Chat.findOneAndUpdate(
      { userId },
      { $set: { messages: [] } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
};

// Get suggested questions based on user profile
const getSuggestedQuestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { language = 'en' } = req.query;
    
    const user = await User.findById(userId);
    const context = await buildPersonalizedContext(user, language);
    
    let suggestions = [];
    
    // Default suggestions in different languages
    const defaultSuggestions = {
      'en': [
        "What's the best time to plant crops in my region?",
        "How can I improve my soil health?",
        "What are the common pests in my area and how to control them?",
        "Best irrigation practices for my crops",
        "Weather-based farming tips for this season"
      ],
      'hi': [
        "मेरे क्षेत्र में फसल लगाने का सबसे अच्छा समय कब है?",
        "मैं अपनी मिट्टी का स्वास्थ्य कैसे सुधार सकता हूं?",
        "मेरे क्षेत्र में आम कीट कौन से हैं और उन्हें कैसे नियंत्रित करें?",
        "मेरी फसलों के लिए सबसे अच्छी सिंचाई विधि",
        "इस मौसम के लिए मौसम आधारित खेती के सुझाव"
      ]
    };

    // Use user-specific suggestions if available, otherwise use defaults
    if (user.farmDetails && user.farmDetails.crops && user.farmDetails.crops.length > 0) {
      const primaryCrop = user.farmDetails.crops[0];
      const location = user.farmDetails.location || user.farmDetails.region || 'my area';
      
      if (language === 'hi') {
        suggestions = [
          `${primaryCrop} के लिए सबसे अच्छा उर्वरक क्या है?`,
          `${location} में ${primaryCrop} कब लगाना चाहिए?`,
          `${primaryCrop} में कीटों से कैसे बचें?`,
          `${primaryCrop} की फसल की देखभाल कैसे करें?`,
          `${primaryCrop} की उत्पादकता कैसे बढ़ाएं?`
        ];
      } else {
        suggestions = [
          `What's the best fertilizer for ${primaryCrop}?`,
          `When should I plant ${primaryCrop} in ${location}?`,
          `How to prevent pests in ${primaryCrop} cultivation?`,
          `Best practices for ${primaryCrop} farming`,
          `How to increase ${primaryCrop} yield?`
        ];
      }
    } else {
      suggestions = defaultSuggestions[language] || defaultSuggestions['en'];
    }

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 5),
        hasProfile: context.hasProfile,
        hasPrediction: context.hasPrediction
      }
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

module.exports = {
  askQuestion,
  getChatHistory,
  clearChatHistory,
  getSuggestedQuestions
};
