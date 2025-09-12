const mongoose = require('mongoose');

const diseaseResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    filename: {
      type: String, // stored filename with timestamp
      required: true,
    }
  },
  // Disease detection results from Flask API
  diseaseData: {
    type: Object, // Complete response from Flask API
    required: true,
  },
  // Extracted key information for easier querying
  detectedDisease: {
    type: String,
    default: null,
  },
  confidence: {
    type: Number, // confidence score if provided by Flask API
    default: null,
  },
  recommendations: {
    type: [String], // treatment recommendations if provided
    default: [],
  },
  // Processing metadata
  processingTime: {
    type: Number, // in milliseconds
    default: null,
  },
  flaskApiResponse: {
    status: Number,
    success: Boolean,
    timestamp: Date,
  },
  // Error handling
  error: {
    type: Object, // error details if Flask API failed
    default: null,
  }
}, { timestamps: true });

// Index for efficient queries
diseaseResultSchema.index({ userId: 1, createdAt: -1 });
diseaseResultSchema.index({ detectedDisease: 1 });

const DiseaseResult = mongoose.model('DiseaseResult', diseaseResultSchema);
module.exports = DiseaseResult;
