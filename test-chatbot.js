// Test file for Gemini AI Chatbot API
// Run this after starting the server to test the chatbot functionality

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test credentials - replace with actual JWT token
const TEST_TOKEN = 'your_jwt_token_here';

const testChatbot = async () => {
  try {
    console.log('🤖 Testing AgriVision AI Chatbot...\n');

    // Test 1: Health Check
    console.log('1. Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/chatbot/health`);
    console.log('✅ Health:', healthResponse.data);
    console.log('');

    // Test 2: Get Suggested Questions
    console.log('2. Getting suggested questions...');
    const suggestionsResponse = await axios.get(`${BASE_URL}/api/chatbot/suggestions?language=en`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Suggestions:', suggestionsResponse.data.data.suggestions);
    console.log('');

    // Test 3: Ask a Question in English
    console.log('3. Asking a question in English...');
    const questionResponse = await axios.post(`${BASE_URL}/api/chatbot/ask`, {
      question: "What's the best time to plant tomatoes?",
      language: 'en'
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ AI Response:', questionResponse.data.data.response);
    console.log('📊 Metadata:', questionResponse.data.data.metadata);
    console.log('');

    // Test 4: Ask a Question in Hindi
    console.log('4. Asking a question in Hindi...');
    const hindiResponse = await axios.post(`${BASE_URL}/api/chatbot/ask`, {
      question: "गेहूं की फसल के लिए सबसे अच्छा समय कब है?",
      language: 'hi'
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Hindi Response:', hindiResponse.data.data.response);
    console.log('');

    // Test 5: Get Chat History
    console.log('5. Getting chat history...');
    const historyResponse = await axios.get(`${BASE_URL}/api/chatbot/history?limit=10`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Chat History:', historyResponse.data.data.messages.length, 'messages');
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Sample cURL commands for testing
const curlCommands = `
📋 Sample cURL Commands for Testing:

1. Health Check:
curl -X GET "${BASE_URL}/api/chatbot/health"

2. Get Suggestions:
curl -X GET "${BASE_URL}/api/chatbot/suggestions?language=en" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

3. Ask Question (English):
curl -X POST "${BASE_URL}/api/chatbot/ask" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"question": "How to prevent pests in my crops?", "language": "en"}'

4. Ask Question (Hindi):
curl -X POST "${BASE_URL}/api/chatbot/ask" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"question": "मेरी फसल में कीट कैसे रोकें?", "language": "hi"}'

5. Get Chat History:
curl -X GET "${BASE_URL}/api/chatbot/history?limit=10" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

6. Clear Chat History:
curl -X DELETE "${BASE_URL}/api/chatbot/history" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`;

console.log(curlCommands);

// Uncomment the line below to run the tests
// testChatbot();
