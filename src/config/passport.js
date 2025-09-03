const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

// JWT Strategy (existing functionality - keeping intact)
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-passwordHash');
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));
} else {
  console.warn('⚠️ JWT_SECRET not found. JWT strategy not initialized.');
}

// Google OAuth Strategy (new functionality)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Google OAuth callback triggered for:', profile.emails[0].value);
    
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      console.log('✅ Existing Google user found:', user.email);
      return done(null, user);
    }

    // Check if user exists with the same email (for account linking)
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing manual account
      console.log('🔗 Linking Google account to existing user:', user.email);
      user.googleId = profile.id;
      user.authProvider = user.authProvider || 'manual'; // Keep original provider
      user.linkedProviders = user.linkedProviders || [];
      if (!user.linkedProviders.includes('google')) {
        user.linkedProviders.push('google');
      }
      // Auto-verify if not already verified
      if (!user.isVerified) {
        user.isVerified = true;
        console.log('📧 Auto-verified user via Google OAuth');
      }
      await user.save();
      return done(null, user);
    }

    // Create new user with Google OAuth
    console.log('👤 Creating new user via Google OAuth');
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      authProvider: 'google',
      linkedProviders: ['google'],
      isVerified: true, // Google accounts are pre-verified
      avatar: profile.photos[0]?.value,
      // No password required for OAuth users
      passwordHash: Math.random().toString(36) // Placeholder - OAuth users won't use this
    });

    console.log('✅ New Google user created:', user.email);
    return done(null, user);
    
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session (if using sessions in future)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
