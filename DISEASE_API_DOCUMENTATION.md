# Disease Prediction API Documentation

## Overview

The Disease Prediction API provides endpoints for crop disease detection by sending images to a Flask-based machine learning service. The API accepts image uploads, validates them, and forwards them to a Flask API for processing.

## Endpoints

### 1. Disease Prediction

**Endpoint:** `POST /api/disease/predict`

**Description:** Upload an image for crop disease prediction

**Authentication:** Required (JWT Bearer token)

**Content-Type:** `multipart/form-data`

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | File | Yes | Image file (JPG, JPEG, or PNG) |

#### Request Example

```bash
curl -X POST \
  http://localhost:5001/api/disease/predict \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/crop-image.jpg"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Disease prediction completed successfully",
  "data": {
    "crop": "tomato",
    "status": "diseased",
    "disease": "early_blight",
    "confidence": 0.95,
    "uploadedImageUrl": "https://cloudinary.com/uploaded-image.jpg",
    "annotatedImageUrl": "https://cloudinary.com/annotated-image.jpg"
  },
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

#### Error Responses

**400 Bad Request - No Image**
```json
{
  "success": false,
  "message": "No image file provided. Please upload an image file."
}
```

**400 Bad Request - Invalid File Type**
```json
{
  "success": false,
  "message": "Invalid file format. Please upload JPG, JPEG, or PNG images only."
}
```

**400 Bad Request - File Too Large**
```json
{
  "success": false,
  "message": "File size too large. Please upload an image smaller than 10MB."
}
```

**503 Service Unavailable - Flask API Down**
```json
{
  "success": false,
  "message": "Disease prediction service is currently unavailable. Please try again later.",
  "error": "Service unavailable"
}
```

**408 Request Timeout**
```json
{
  "success": false,
  "message": "Disease prediction request timed out. Please try again with a smaller image.",
  "error": "Request timeout"
}
```

### 2. Health Check

**Endpoint:** `GET /api/disease/health`

**Description:** Check the status of the Flask API service

**Authentication:** Required (JWT Bearer token)

#### Request Example

```bash
curl -X GET \
  http://localhost:5001/api/disease/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Flask API is healthy",
  "flaskStatus": {
    "status": "healthy",
    "model_loaded": true,
    "version": "1.0.0"
  },
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

#### Error Response (503 Service Unavailable)

```json
{
  "success": false,
  "message": "Flask API health check failed",
  "error": "ECONNREFUSED",
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

## File Upload Specifications

### Supported File Types
- JPEG/JPG
- PNG

### File Size Limits
- Maximum size: 10MB
- Single file per request

### Field Name
- Use `image` as the form field name

## Flask API Requirements

The Node.js backend expects the Flask API to have the following endpoints:

### 1. Disease Prediction Endpoint

**Endpoint:** `POST /predict-disease`

**Expected Request:** Multipart form data with file field named `file`

**Expected Response Format:**
```json
{
  "crop": "tomato",
  "status": "healthy" | "diseased",
  "disease": "disease_name", // if diseased
  "confidence": 0.95,
  "uploadedImageUrl": "url_to_uploaded_image",
  "annotatedImageUrl": "url_to_annotated_image"
}
```

### 2. Health Check Endpoint (Optional)

**Endpoint:** `GET /health`

**Expected Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

## Environment Configuration

Add the following to your `.env` file:

```env
# Flask API URL for disease prediction
FLASK_API_URL=http://localhost:5000

# For production:
# FLASK_API_URL=https://your-flask-api-domain.com
```

## Frontend Integration Examples

### JavaScript/Fetch API

```javascript
const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch('/api/disease/predict', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${yourJwtToken}`
            },
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Prediction:', result.data);
            // Handle successful prediction
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Prediction failed:', error);
        throw error;
    }
};
```

### React with File Input

```jsx
import React, { useState } from 'react';

const DiseasePredictor = () => {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            const result = await uploadImage(file);
            setPrediction(result);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    disabled={loading}
                />
                <button type="submit" disabled={!file || loading}>
                    {loading ? 'Analyzing...' : 'Predict Disease'}
                </button>
            </form>
            
            {prediction && (
                <div>
                    <h3>Prediction Results:</h3>
                    <p>Crop: {prediction.crop}</p>
                    <p>Status: {prediction.status}</p>
                    {prediction.disease && <p>Disease: {prediction.disease}</p>}
                    <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
                    {prediction.annotatedImageUrl && (
                        <img src={prediction.annotatedImageUrl} alt="Annotated result" />
                    )}
                </div>
            )}
        </div>
    );
};
```

## Error Handling Best Practices

1. **Always check the `success` field** in the response
2. **Handle network errors** (connection refused, timeouts)
3. **Validate file types** on the frontend before upload
4. **Show appropriate user messages** for different error types
5. **Implement retry logic** for temporary service unavailability

## Security Considerations

1. **Authentication required** - All endpoints require valid JWT tokens
2. **File type validation** - Only image files are accepted
3. **File size limits** - 10MB maximum to prevent abuse
4. **Temporary file cleanup** - Uploaded files are automatically deleted after processing
5. **CORS configuration** - Ensure proper CORS setup for frontend integration

## Rate Limiting

Consider implementing rate limiting for the prediction endpoint to prevent abuse:
- Recommend: 10 requests per minute per user
- Can be implemented using express-rate-limit middleware

## Monitoring and Logging

The API includes comprehensive logging for:
- Request details (file size, type, user)
- Flask API communication
- Error tracking
- Performance metrics

Monitor these logs for:
- High error rates
- Performance issues
- Flask API availability
- User upload patterns
