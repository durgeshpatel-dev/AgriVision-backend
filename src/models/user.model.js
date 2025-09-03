
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      // Password only required for manual registration (not OAuth)
      return !this.googleId;
    },
  },
  // OAuth Fields (New - maintaining backward compatibility)
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values
  },
  authProvider: {
    type: String,
    enum: ['manual', 'google'],
    default: 'manual',
  },
  linkedProviders: [{
    type: String,
    enum: ['manual', 'google'],
  }],
  avatar: {
    type: String, // Store profile picture URL
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiry: {
    type: Date,
  },
  farmDetails: {
    farmName: { type: String, trim: true },
    location: { type: String, trim: true }, // e.g., "City, State, Country"
    totalArea: { type: Number }, // in acres or hectares
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
