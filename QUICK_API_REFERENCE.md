# AgriVision Backend - Quick API Reference

## Base URL: `http://localhost:5001`

## 📋 All Available APIs

### Authentication APIs

| Method | Endpoint | Access | Purpose |
|--------|----------|---------|---------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/verify-otp` | Public | Verify email with OTP |
| POST | `/api/auth/resend-otp` | Public | Resend OTP |
| POST | `/api/auth/login` | Public | User login |
| GET | `/api/auth/profile` | Private | Get user profile |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Reset password |

### Prediction APIs

| Method | Endpoint | Access | Purpose |
|--------|----------|---------|---------|
| POST | `/api/predict` | Private* | Create yield prediction |
| GET | `/api/predictions/:userId` | Private | Get user predictions |

*Requires email verification

---

## 🔐 Authentication Flow

### 1. **Registration Flow**
```
POST /api/auth/signup
  ↓ (returns userId)
POST /api/auth/verify-otp
  ↓ (returns user + token)
Store token → Access protected routes
```

### 2. **Login Flow**
```
POST /api/auth/login
  ↓ (if not verified)
POST /api/auth/verify-otp
  ↓ (returns user + token)
Store token → Access protected routes
```

### 3. **Password Reset Flow**
```
POST /api/auth/forgot-password
  ↓ (email sent with reset token)
POST /api/auth/reset-password
  ↓ (returns user + token)
Store token → Access protected routes
```

---

## 📦 Request/Response Examples

### Registration
```javascript
// Request
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "farmDetails": {
    "farmName": "My Farm",
    "location": "City, State", 
    "totalArea": 10.5
  }
}

// Response
{
  "message": "User registered successfully. Please check your email for OTP verification.",
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2"
}
```

### OTP Verification
```javascript
// Request
POST /api/auth/verify-otp
{
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2",
  "otp": "123456"
}

// Response
{
  "message": "Email verified successfully",
  "user": {
    "_id": "64f8b9c1e4b0c7d8e9f0a1b2",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```javascript
// Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Response (Verified User)
{
  "_id": "64f8b9c1e4b0c7d8e9f0a1b2",
  "name": "John Doe", 
  "email": "john@example.com",
  "isVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (Unverified User)
{
  "message": "Please verify your email address before logging in.",
  "needsVerification": true,
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2"
}
```

### Create Prediction
```javascript
// Request
POST /api/predict
Headers: { "Authorization": "Bearer <token>" }
{
  "cropType": "Rice",
  "area": 10.5,
  "location": "Pune, Maharashtra",
  "plantingDate": "2024-06-15"
}

// Response
{
  "success": true,
  "data": {
    "_id": "64f8c1d2e4b0c7d8e9f0a1b3",
    "cropType": "Rice",
    "area": 10.5,
    "predictedYield": 8.5,
    "confidence": 0.85,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🔑 Frontend Integration Essentials

### 1. **Store JWT Token**
```javascript
// After login/signup success
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### 2. **Add Token to Requests**
```javascript
const token = localStorage.getItem('authToken');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. **Handle Authentication States**
```javascript
// Check if user is authenticated
const isAuthenticated = !!localStorage.getItem('authToken');

// Check if user is verified  
const user = JSON.parse(localStorage.getItem('user'));
const isVerified = user?.isVerified;
```

### 4. **Error Handling**
```javascript
// Handle 401 responses (token expired/invalid)
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Redirect to login
}

// Handle 403 responses (verification required)
if (error.response?.status === 403 && error.response?.data?.needsVerification) {
  // Redirect to OTP verification page
}
```

---

## 🌐 Environment Variables Needed

### Backend (.env)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/agrivision
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@agrivision.com
OTP_EXPIRY_MINUTES=10
WEATHER_API_KEY=your_weather_api_key
ML_MODEL_API_URL=http://localhost:8000/predict
```

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:5001
REACT_APP_API_TIMEOUT=10000
```

---

## 🧪 Testing Endpoints

### Using curl:
```bash
# Registration
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# Get Profile
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📞 Support

- **Server Port**: 5001
- **Database**: MongoDB (Port 27017)  
- **Email Service**: Gmail SMTP
- **Token Expiry**: 30 days
- **OTP Expiry**: 10 minutes
- **Reset Token Expiry**: 1 hour

Ready to integrate! 🚀
