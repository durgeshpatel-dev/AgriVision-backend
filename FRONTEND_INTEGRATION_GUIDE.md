# AgriVision Backend - Complete API Reference for Frontend Integration

## Base URL
```
http://localhost:5001
```

## Headers Required for Protected Routes
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

---

## 🔐 Authentication APIs

### 1. User Registration
- **Endpoint**: `POST /api/auth/signup`
- **Access**: Public
- **Purpose**: Register new user and send OTP for email verification

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "farmDetails": {
    "farmName": "Green Valley Farm",
    "location": "Mumbai, Maharashtra",
    "totalArea": 25.5
  }
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully. Please check your email for OTP verification.",
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2"
}
```

**Error Responses:**
- **400**: User already exists / Missing required fields
- **500**: Server error

---

### 2. Email Verification (OTP)
- **Endpoint**: `POST /api/auth/verify-otp`
- **Access**: Public
- **Purpose**: Verify email address with OTP

**Request Body:**
```json
{
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "_id": "64f8b9c1e4b0c7d8e9f0a1b2",
    "name": "John Doe",
    "email": "john@example.com",
    "farmDetails": {
      "farmName": "Green Valley Farm",
      "location": "Mumbai, Maharashtra",
      "totalArea": 25.5
    },
    "isVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- **400**: Invalid OTP / OTP expired / User already verified
- **404**: User not found
- **500**: Server error

---

### 3. Resend OTP
- **Endpoint**: `POST /api/auth/resend-otp`
- **Access**: Public
- **Purpose**: Resend OTP if expired or not received

**Request Body:**
```json
{
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent successfully"
}
```

**Error Responses:**
- **400**: User already verified
- **404**: User not found
- **500**: Failed to send OTP email

---

### 4. User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Purpose**: Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "_id": "64f8b9c1e4b0c7d8e9f0a1b2",
  "name": "John Doe",
  "email": "john@example.com",
  "farmDetails": {
    "farmName": "Green Valley Farm",
    "location": "Mumbai, Maharashtra",
    "totalArea": 25.5
  },
  "isVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- **401**: Invalid credentials / Email not verified
- **500**: Server error

**Special Response for Unverified Users (401):**
```json
{
  "message": "Please verify your email address before logging in.",
  "needsVerification": true,
  "userId": "64f8b9c1e4b0c7d8e9f0a1b2"
}
```

---

### 5. Get User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Access**: Private (Requires JWT)
- **Purpose**: Get current user's profile

**Headers:**
```javascript
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Success Response (200):**
```json
{
  "_id": "64f8b9c1e4b0c7d8e9f0a1b2",
  "name": "John Doe",
  "email": "john@example.com",
  "farmDetails": {
    "farmName": "Green Valley Farm",
    "location": "Mumbai, Maharashtra",
    "totalArea": 25.5
  },
  "isVerified": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 6. Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Access**: Public
- **Purpose**: Request password reset link

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset link sent to your email",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

**Error Responses:**
- **404**: User not found
- **500**: Failed to send reset email

---

### 7. Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Access**: Public
- **Purpose**: Reset password using reset token

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully",
  "user": {
    "_id": "64f8b9c1e4b0c7d8e9f0a1b2",
    "name": "John Doe",
    "email": "john@example.com",
    "farmDetails": {
      "farmName": "Green Valley Farm",
      "location": "Mumbai, Maharashtra",
      "totalArea": 25.5
    },
    "isVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🌾 Prediction APIs

### 8. Create Crop Yield Prediction
- **Endpoint**: `POST /api/predict`
- **Access**: Private (Requires JWT + Email Verification)
- **Purpose**: Create new crop yield prediction

**Headers:**
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "cropType": "Rice",
  "area": 10.5,
  "location": "Pune, Maharashtra",
  "plantingDate": "2024-06-15"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8c1d2e4b0c7d8e9f0a1b3",
    "userId": "64f8b9c1e4b0c7d8e9f0a1b2",
    "cropType": "Rice",
    "area": 10.5,
    "location": "Pune, Maharashtra",
    "plantingDate": "2024-06-15T00:00:00.000Z",
    "soilData": {
      "soil_type": "Sandy",
      "raw": {}
    },
    "weatherData": {
      "avg_rainfall_mm": 969,
      "avg_temp_c": 29,
      "raw": {}
    },
    "predictedYield": 8.5,
    "confidence": 0.85,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **401**: Not authorized / Token invalid
- **403**: Email verification required
- **500**: Prediction creation failed

---

### 9. Get User Predictions
- **Endpoint**: `GET /api/predictions/:userId`
- **Access**: Private (Requires JWT)
- **Purpose**: Get all predictions for a specific user

**Headers:**
```javascript
{
  "Authorization": "Bearer <jwt_token>"
}
```

**URL Parameters:**
- `userId`: The user's ID (must match the authenticated user)

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f8c1d2e4b0c7d8e9f0a1b3",
      "userId": "64f8b9c1e4b0c7d8e9f0a1b2",
      "cropType": "Rice",
      "area": 10.5,
      "location": "Pune, Maharashtra",
      "plantingDate": "2024-06-15T00:00:00.000Z",
      "predictedYield": 8.5,
      "confidence": 0.85,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "64f8c1d2e4b0c7d8e9f0a1b4",
      "userId": "64f8b9c1e4b0c7d8e9f0a1b2",
      "cropType": "Wheat",
      "area": 15.0,
      "location": "Delhi",
      "plantingDate": "2024-11-01T00:00:00.000Z",
      "predictedYield": 12.3,
      "confidence": 0.78,
      "createdAt": "2024-01-20T14:45:00.000Z"
    }
  ]
}
```

---

## 💬 Chat APIs (Future Implementation)

### 10. Chat Routes
- **Endpoint**: `/api/chat/*`
- **Status**: Routes defined but not implemented yet
- **File**: `src/routes/chat.routes.js`

---

## 🛠️ Frontend Integration Guide

### 1. **Environment Setup**
Create a `.env` file in your frontend project:
```env
REACT_APP_API_BASE_URL=http://localhost:5001
REACT_APP_API_TIMEOUT=10000
```

### 2. **Axios Configuration**
```javascript
// api/config.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. **API Service Functions**
```javascript
// api/authService.js
import apiClient from './config';

export const authService = {
  // Register user
  signup: async (userData) => {
    const response = await apiClient.post('/api/auth/signup', userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (userId, otp) => {
    const response = await apiClient.post('/api/auth/verify-otp', { userId, otp });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (userId) => {
    const response = await apiClient.post('/api/auth/resend-otp', { userId });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// api/predictionService.js
export const predictionService = {
  // Create prediction
  createPrediction: async (predictionData) => {
    const response = await apiClient.post('/api/predict', predictionData);
    return response.data;
  },

  // Get user predictions
  getUserPredictions: async (userId) => {
    const response = await apiClient.get(`/api/predictions/${userId}`);
    return response.data;
  },
};
```

### 4. **Authentication Context**
```javascript
// context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          user: JSON.parse(user),
        },
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: response.token,
          user: response,
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. **Error Handling**
```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Internal server error';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};
```

### 6. **Protected Route Component**
```javascript
// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireVerification = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerification && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 🔧 Testing with Postman/Insomnia

### Collection Variables:
- `base_url`: `http://localhost:5001`
- `jwt_token`: `{{token_from_login_response}}`

### Test Sequence:
1. **POST** Signup → Get `userId`
2. **POST** Verify OTP → Get `token`
3. **GET** Profile (with token)
4. **POST** Create Prediction (with token)
5. **GET** User Predictions (with token)

---

## 🚨 Important Notes

1. **JWT Token**: Store securely, expires in 30 days
2. **OTP**: Valid for 10 minutes only
3. **Password Reset**: Token valid for 1 hour
4. **Email Verification**: Required for predictions
5. **CORS**: Enabled for all origins in development
6. **Rate Limiting**: Not implemented yet (consider adding)

This comprehensive guide should help you integrate the frontend seamlessly with your AgriVision backend!
