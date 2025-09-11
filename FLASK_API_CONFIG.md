# Disease Prediction Flask API Configuration
# 
# This document shows the required environment variable for the disease prediction endpoint
# Add this to your .env file:

# Flask API URL for disease prediction
FLASK_API_URL=http://localhost:5000

# Example for production:
# FLASK_API_URL=https://your-flask-api-domain.com

# Note: The Flask API should have the following endpoints:
# - POST /predict-disease - accepts multipart/form-data with 'file' field
# - GET /health - health check endpoint (optional but recommended)
