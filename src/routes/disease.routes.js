const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { predictDisease, checkFlaskHealth, testUpload } = require('../controllers/disease.controller');
const { protect, requireVerified } = require('../middlewares/auth.middleware');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `disease-${uniqueSuffix}${ext}`);
    }
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only one file at a time
    },
    fileFilter: fileFilter
});

// @route   POST /api/disease/predict
// @desc    Predict crop disease from uploaded image
// @access  Private (Verified users only)
router.post('/predict', protect, requireVerified, upload.single('image'), predictDisease);

// @route   POST /api/disease/test
// @desc    Test file upload functionality
// @access  Private (Verified users only)
router.post('/test', protect, requireVerified, upload.single('image'), testUpload);

// @route   GET /api/disease/health
// @desc    Check Flask API health status
// @access  Private (Verified users only)
router.get('/health', protect, requireVerified, checkFlaskHealth);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size allowed is 10MB.',
                error: 'File size limit exceeded'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Please upload only one image at a time.',
                error: 'File count limit exceeded'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name. Please use "image" as the field name.',
                error: 'Unexpected field'
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            error: 'Invalid file type'
        });
    }

    // Generic error
    return res.status(500).json({
        success: false,
        message: 'File upload error occurred',
        error: error.message
    });
});

module.exports = router;
