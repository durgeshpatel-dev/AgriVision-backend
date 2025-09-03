# AgriVision AI Chatbot Documentation

## Overview
The AgriVision AI Chatbot is a personalized agricultural assistant powered by Google's Gemini AI. It provides farmers with intelligent, context-aware advice based on their farming profile, latest predictions, and conversation history.

## Features

### 🌟 Core Features
- **Personalized Responses**: Uses user's farm details, location, crops, and soil type
- **Prediction Context**: Incorporates latest crop predictions and analysis
- **Multi-language Support**: Supports English, Hindi, and 8 other Indian languages
- **Conversation Memory**: Maintains chat history for context-aware responses
- **Smart Suggestions**: Provides relevant questions based on user profile
- **Rate Limiting**: Prevents API abuse with 30 requests per minute

### 🔧 Technical Features
- **Gemini AI Integration**: Uses Google's latest generative AI model
- **MongoDB Storage**: Efficient chat history storage
- **JWT Authentication**: Secure user sessions
- **Error Handling**: Comprehensive error management
- **Response Metadata**: Token usage and performance metrics

## API Endpoints

### 1. Ask Question
**POST** `/api/chatbot/ask`

Ask the AI chatbot a farming-related question with personalized context.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "What's the best fertilizer for my crops?",
  "language": "en",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on your profile growing rice in Punjab, I recommend...",
    "language": "en",
    "contextUsed": {
      "userProfile": true,
      "prediction": true,
      "conversationHistory": false
    },
    "metadata": {
      "responseTime": 1245,
      "tokens": {
        "promptTokens": 156,
        "completionTokens": 89,
        "totalTokens": 245
      },
      "sessionId": "default"
    }
  }
}
```

### 2. Get Chat History
**GET** `/api/chatbot/history?limit=20`

Retrieve the user's chat history with the AI.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "sender": "user",
        "content": "What's the best time to plant rice?",
        "timestamp": "2024-03-15T10:30:00.000Z"
      },
      {
        "sender": "bot",
        "content": "For rice cultivation in your region...",
        "timestamp": "2024-03-15T10:30:05.000Z"
      }
    ],
    "total": 42
  }
}
```

### 3. Get Suggested Questions
**GET** `/api/chatbot/suggestions?language=en`

Get personalized question suggestions based on user profile.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "What's the best fertilizer for rice?",
      "When should I plant rice in Punjab?",
      "How to prevent pests in rice cultivation?",
      "Best practices for rice farming",
      "How to increase rice yield?"
    ],
    "hasProfile": true,
    "hasPrediction": true
  }
}
```

### 4. Clear Chat History
**DELETE** `/api/chatbot/history`

Clear all chat history for the authenticated user.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

### 5. Health Check
**GET** `/api/chatbot/health`

Check if the chatbot service is running.

**Response:**
```json
{
  "success": true,
  "message": "Chatbot service is running",
  "timestamp": "2024-03-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Supported Languages

| Language | Code | Example |
|----------|------|---------|
| English | `en` | "What's the best time to plant crops?" |
| Hindi | `hi` | "फसल लगाने का सबसे अच्छा समय कब है?" |
| Marathi | `mr` | "पीक लावण्याची सर्वोत्तम वेळ कोणती?" |
| Gujarati | `gu` | "પાક વાવવાનો શ્રેષ્ઠ સમય કયો છે?" |
| Telugu | `te` | "పంటలు నాటడానికి ఉత్తమ సమయం ఎప్పుడు?" |
| Tamil | `ta` | "பயிர்களை நடவு செய்வதற்கான சிறந்த நேரம் எது?" |
| Kannada | `kn` | "ಬೆಳೆಗಳನ್ನು ನೆಡುವ ಅತ್ಯುತ್ತಮ ಸಮಯ ಯಾವುದು?" |
| Malayalam | `ml` | "വിളകൾ നടാനുള്ള ഏറ്റവും നല്ല സമയം എപ്പോഴാണ്?" |
| Bengali | `bn` | "ফসল রোপণের সেরা সময় কখন?" |
| Punjabi | `pa` | "ਫਸਲਾਂ ਲਗਾਉਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਕਦੋਂ ਹੈ?" |

## Personalization Features

### User Profile Context
The AI uses the following user data for personalization:
- **Location**: State, district, or specific location
- **Farm Size**: Total cultivated area
- **Primary Crops**: Main crops grown by the farmer
- **Soil Type**: Sandy, clayey, loamy, etc.
- **Irrigation Method**: Drip, sprinkler, flood, etc.
- **Experience Level**: Beginner, intermediate, expert
- **Climate Zone**: Based on location

### Prediction Context
- Latest crop yield predictions
- Disease/pest predictions
- Soil health analysis
- Weather-based recommendations

### Conversation Context
- Recent chat history (last 6 messages)
- User's previous questions and concerns
- Follow-up questions and clarifications

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
CHATBOT_ENABLED=true
```

### Getting Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into your `.env` file

## Rate Limiting
- **Limit**: 30 requests per minute per user
- **Window**: 1 minute sliding window
- **Response**: 429 status code when limit exceeded

## Error Handling

### Common Error Responses

**400 - Bad Request**
```json
{
  "success": false,
  "message": "Question is required"
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**429 - Too Many Requests**
```json
{
  "success": false,
  "message": "Too many chat requests, please try again later."
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "message": "Failed to process your question. Please try again."
}
```

## Frontend Integration Examples

### JavaScript/React
```javascript
const askChatbot = async (question, language = 'en') => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/chatbot/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question, language })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chatbot error:', error);
    throw error;
  }
};

// Usage
askChatbot("What's the best fertilizer for rice?", "en")
  .then(response => {
    console.log(response.data.response);
  });
```

### cURL Examples
```bash
# Ask question in English
curl -X POST "http://localhost:5001/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question": "How to prevent pests in my crops?", "language": "en"}'

# Ask question in Hindi
curl -X POST "http://localhost:5001/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question": "मेरी फसल में कीट कैसे रोकें?", "language": "hi"}'

# Get suggestions
curl -X GET "http://localhost:5001/api/chatbot/suggestions?language=hi" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Best Practices

### For Developers
1. **Always authenticate**: All endpoints except health check require JWT
2. **Handle rate limits**: Implement retry logic for 429 responses
3. **Cache suggestions**: Suggested questions don't change frequently
4. **Language detection**: Auto-detect user's preferred language
5. **Error feedback**: Show meaningful error messages to users

### For Users
1. **Be specific**: Detailed questions get better responses
2. **Provide context**: Mention crop types, location, and specific issues
3. **Follow-up**: Ask clarifying questions based on AI responses
4. **Update profile**: Keep farm details updated for better personalization

## Troubleshooting

### Common Issues

**Issue**: "Gemini API Error"
**Solution**: Check if GEMINI_API_KEY is correctly set in .env file

**Issue**: "Too many requests"
**Solution**: Wait for 1 minute before making more requests

**Issue**: "User not found"
**Solution**: Ensure JWT token is valid and user exists in database

**Issue**: "No response from AI"
**Solution**: Check internet connection and Gemini API status

### Debugging
Enable debug mode by setting `NODE_ENV=development` in your .env file to see detailed error messages.

## Performance

### Response Times
- **Typical**: 1-3 seconds
- **With context**: 2-4 seconds
- **Complex queries**: 3-5 seconds

### Token Usage
- **Average prompt**: 100-300 tokens
- **Average response**: 50-200 tokens
- **Daily limit**: 1M tokens (free tier)

## Support

For technical support or feature requests:
- Check the health endpoint: `/api/chatbot/health`
- Review error logs in server console
- Ensure all environment variables are set
- Verify user authentication and permissions

## Version History

### v1.0.0
- Initial release with Gemini AI integration
- Multi-language support (10 languages)
- Personalized responses based on user profile
- Chat history management
- Rate limiting and error handling
