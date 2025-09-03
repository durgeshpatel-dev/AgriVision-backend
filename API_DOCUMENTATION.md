# AgriVision Backend API Documentation

## Authentication Endpoints

### 1. User Registration
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "farmDetails": {
      "farmName": "Green Farm",
      "location": "District, State",
      "totalArea": 10.5
    }
  }
  ```
- **Response:** Success message with userId for OTP verification

### 2. OTP Verification
- **POST** `/api/auth/verify-otp`
- **Body:**
  ```json
  {
    "userId": "user_id_here",
    "otp": "123456"
  }
  ```
- **Response:** User data with JWT token

### 3. Resend OTP
- **POST** `/api/auth/resend-otp`
- **Body:**
  ```json
  {
    "userId": "user_id_here"
  }
  ```
- **Response:** Success message

### 4. User Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User data with JWT token (only for verified users)

### 5. Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response:** Success message (reset link sent to email)

### 6. Reset Password
- **POST** `/api/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset_token_from_email",
    "newPassword": "newpassword123"
  }
  ```
- **Response:** User data with JWT token

### 7. Get User Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User profile data

## Prediction Endpoints

### 1. Create Prediction
- **POST** `/api/predict`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "cropType": "Rice",
    "landArea": 5.2,
    "location": {
      "state": "West Bengal",
      "district": "Kolkata",
      "coordinates": {
        "latitude": 22.5726,
        "longitude": 88.3639
      }
    },
    "plantingDate": "2024-06-15",
    "fetchData": true,
    "soilType": "Alluvial",
    "weather": {
      "temperature": 28.5,
      "rainfall": 120,
      "humidity": 75
    }
  }
  ```
- **Field Descriptions:**
  - `cropType` (required): Must be one of: "Rice", "Wheat", "Maize", "Sugarcane", "Groundnut"
  - `landArea` (required): Land area in hectares
  - `location` (required): Location object with state and district
    - `state`: Must be one of: "Chhattisgarh", "Madhya Pradesh", "West Bengal", "Bihar", "Jharkhand", "Orissa", "Gujarat"
    - `district`: District name within the state
    - `coordinates`: Optional latitude/longitude
  - `plantingDate` (required): Date when crop will be/was planted
  - `fetchData` (optional, default: false): If true, fetches weather and soil data from APIs
  - `soilType` (optional): Must be one of: "Sandy", "Alluvial", "Black", "Red-Yellow", "Red", "Loamy"
  - `weather` (optional): Weather data object
    - `temperature`: Temperature in Celsius
    - `rainfall`: Rainfall in mm
    - `humidity`: Humidity percentage

### 2. ML API Integration
The backend sends data to ML API in this format:
```json
{
  "Year": 2024,
  "State": "West Bengal",
  "District": "Kolkata",
  "Area_1000_ha": 0.0052,
  "Crop": "RICE",
  "Rainfall_mm": 120.0,
  "Temp_C": 28.5,
  "Soil_Type": "Alluvial"
}
```

### 3. Response Format
```json
{
  "success": true,
  "message": "Prediction created successfully",
  "data": {
    "predictionId": "prediction_id_here",
    "cropType": "Rice",
    "landArea": 5.2,
    "location": {
      "state": "West Bengal",
      "district": "Kolkata",
      "coordinates": {
        "latitude": 22.5726,
        "longitude": 88.3639
      }
    },
    "plantingDate": "2024-06-15T00:00:00.000Z",
    "soilType": "Alluvial",
    "weather": {
      "temperature": 28.5,
      "rainfall": 120,
      "humidity": 75,
      "dataSource": "api"
    },
    "predictedYield": 19.76,
    "confidence": 0.85,
    "fetchedFromAPIs": true,
    "createdAt": "2025-09-01T12:45:00.000Z"
  }
}
```

### 2. Get User Predictions
- **GET** `/api/predictions/:userId`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of user's predictions

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agrivision

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex

# External API Keys
WEATHER_API_KEY=your_openweathermap_api_key_here
ML_MODEL_API_URL=http://localhost:8000/predict

# Email Configuration (for OTP and password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@agrivision.com

# OTP Configuration
OTP_EXPIRY_MINUTES=10

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

## Installation and Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create and configure your `.env` file with the required environment variables.

3. Start the server:
   ```bash
   npm run dev  # for development
   npm start    # for production
   ```

## Notes

- All prediction endpoints require email verification
- OTP expires in 10 minutes (configurable)
- Password reset tokens expire in 1 hour
- JWT tokens expire in 30 days
- Email service uses Gmail SMTP (configure your app password)
