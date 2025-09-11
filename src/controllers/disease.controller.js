const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Flask API endpoint for disease prediction
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

const predictDisease = async (req, res) => {
    try {
        console.log('🔬 Disease prediction request received');
        console.log('📋 Request headers:', req.headers);
        console.log('📦 Request body keys:', Object.keys(req.body));
        console.log('📁 Request files:', req.files);
        console.log('📄 Request file:', req.file);
        
        // Check if file was uploaded
        if (!req.file) {
            console.log('❌ No file found in request');
            return res.status(400).json({
                success: false,
                message: 'No image file provided. Please upload an image file.',
                debug: {
                    bodyKeys: Object.keys(req.body),
                    hasFiles: !!req.files,
                    hasFile: !!req.file
                }
            });
        }

        const { file } = req;
        console.log(`📸 Processing image: ${file.originalname} (${file.size} bytes)`);

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            // Clean up uploaded file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid file format. Please upload JPG, JPEG, or PNG images only.'
            });
        }

        // Validate file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            // Clean up uploaded file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'File size too large. Please upload an image smaller than 10MB.'
            });
        }

        try {
            // Prepare form data for Flask API
            const formData = new FormData();
            
            // Read file content and create buffer instead of stream
            const fileBuffer = fs.readFileSync(file.path);
            
            formData.append('image', fileBuffer, {
                filename: file.originalname,
                contentType: file.mimetype
            });

            console.log(`🚀 Sending image to Flask API: ${FLASK_API_URL}/predict-disease`);
            console.log(`📊 File size: ${fileBuffer.length} bytes`);
            console.log(`📁 File name: ${file.originalname}`);
            console.log(`📄 MIME type: ${file.mimetype}`);

            // Send request to Flask API
            const flaskResponse = await axios.post(
                `${FLASK_API_URL}/predict-disease`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders()
                    },
                    timeout: 30000, // 30 seconds timeout
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            console.log('✅ Flask API response received:', flaskResponse.status);

            // Clean up uploaded file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            // Return the Flask API response
            return res.status(200).json({
                success: true,
                message: 'Disease prediction completed successfully',
                data: flaskResponse.data,
                timestamp: new Date().toISOString()
            });

        } catch (flaskError) {
            console.error('❌ Flask API error:', flaskError.message);
            
            // Clean up uploaded file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            // Handle different types of Flask API errors
            if (flaskError.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    success: false,
                    message: 'Disease prediction service is currently unavailable. Please try again later.',
                    error: 'Service unavailable'
                });
            }

            if (flaskError.response) {
                // Flask API returned an error response
                return res.status(flaskError.response.status || 500).json({
                    success: false,
                    message: flaskError.response.data?.error || 'Error from disease prediction service',
                    error: flaskError.response.data
                });
            }

            if (flaskError.code === 'ETIMEDOUT') {
                return res.status(408).json({
                    success: false,
                    message: 'Disease prediction request timed out. Please try again with a smaller image.',
                    error: 'Request timeout'
                });
            }

            // Generic error
            return res.status(500).json({
                success: false,
                message: 'Failed to process disease prediction',
                error: flaskError.message
            });
        }

    } catch (error) {
        console.error('❌ Disease prediction controller error:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error occurred during disease prediction',
            error: error.message
        });
    }
};

// Health check endpoint for Flask API
const checkFlaskHealth = async (req, res) => {
    try {
        console.log('🏥 Checking Flask API health');
        
        const healthResponse = await axios.get(`${FLASK_API_URL}/health`, {
            timeout: 5000
        });

        return res.status(200).json({
            success: true,
            message: 'Flask API is healthy',
            flaskStatus: healthResponse.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Flask API health check failed:', error.message);
        
        return res.status(503).json({
            success: false,
            message: 'Flask API health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Simple test endpoint to check if multipart form data is working
const testUpload = async (req, res) => {
    try {
        console.log('🧪 Test upload endpoint hit');
        console.log('📋 Headers:', req.headers);
        console.log('📦 Body:', req.body);
        console.log('📁 Files:', req.files);
        console.log('📄 File:', req.file);
        
        return res.status(200).json({
            success: true,
            message: 'Test endpoint working',
            debug: {
                headers: req.headers,
                bodyKeys: Object.keys(req.body),
                hasFiles: !!req.files,
                hasFile: !!req.file,
                file: req.file ? {
                    fieldname: req.file.fieldname,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                } : null
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Test endpoint error',
            error: error.message
        });
    }
};

module.exports = {
    predictDisease,
    checkFlaskHealth,
    testUpload
};
