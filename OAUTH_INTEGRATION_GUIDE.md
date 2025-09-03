# Google OAuth Integration Guide

## 🎯 Overview
Google OAuth has been successfully integrated into your AgriVision backend while **preserving all existing manual login/signup functionality**. Users can now:

- ✅ Continue using manual email/password registration and login (unchanged)
- ✅ Use Google OAuth for quick login/signup
- ✅ Link Google accounts to existing manual accounts
- ✅ Switch between authentication methods seamlessly

## 🔧 Setup Google OAuth Credentials

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen if prompted
6. Set **Application type** to "Web application"
7. Add authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback (for production)
   ```
8. Copy **Client ID** and **Client Secret**

### Step 2: Environment Variables
Your OAuth variables have been **added to your existing `.env` file**. Just replace the placeholder values:

```env
# Google OAuth Configuration (already added to your .env file)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

**Just replace `your_google_client_id_here` and `your_google_client_secret_here` with your actual Google credentials.**

## 🛠 API Endpoints

### Existing Endpoints (Unchanged)
All your existing authentication endpoints work exactly as before:

```
POST /api/auth/signup          - Manual registration
POST /api/auth/login           - Manual login  
POST /api/auth/verify-otp      - OTP verification
POST /api/auth/resend-otp      - Resend OTP
POST /api/auth/forgot-password - Password reset
GET  /api/auth/profile         - Get user profile
PUT  /api/auth/user/profile    - Update profile
```

### New OAuth Endpoints
```
GET    /api/auth/google              - Initiate Google OAuth
GET    /api/auth/google/callback     - OAuth callback (handled automatically)
POST   /api/auth/link-google         - Link Google to existing account
DELETE /api/auth/unlink-google       - Unlink Google account
```

## 🔄 OAuth Flow

### Frontend Integration

#### 1. Google Login Button
```html
<a href="http://localhost:5001/api/auth/google" class="google-login-btn">
  Login with Google
</a>
```

#### 2. Handle OAuth Success
After successful OAuth, users are redirected to:
```
http://localhost:3000/auth/success?token=JWT_TOKEN&user=USER_DATA
```

#### 3. Extract Token and User Data
```javascript
// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const userData = JSON.parse(decodeURIComponent(urlParams.get('user')));

// Store token (same as manual login)
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(userData));

// Redirect to dashboard
window.location.href = '/dashboard';
```

## 👤 User Data Structure

OAuth users have the same structure as manual users, with additional fields:

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@gmail.com",
  "farmDetails": {...},
  "isVerified": true,
  "authProvider": "google",           // New field
  "linkedProviders": ["google"],      // New field  
  "avatar": "profile_picture_url",    // New field
  "token": "jwt_token"
}
```

## 🔗 Account Linking

### Automatic Linking
When a user logs in with Google using an email that already exists in the system:
- The Google account is automatically linked to the existing manual account
- User's `isVerified` status is set to `true`
- User can use both login methods

### Manual Linking (Future Enhancement)
```javascript
// Link Google account to current logged-in user
POST /api/auth/link-google
Headers: Authorization: Bearer JWT_TOKEN
Body: { googleToken: "google_oauth_token" }
```

### Unlinking
```javascript
// Unlink Google account
DELETE /api/auth/unlink-google  
Headers: Authorization: Bearer JWT_TOKEN
```

## 🛡 Security Features

### Password Handling
- OAuth users don't need passwords
- Manual users keep their passwords
- Users must set a password before unlinking Google if it's their only auth method

### Token Security
- Same JWT token system for both auth methods
- 30-day expiration (unchanged)
- Secure token generation and validation

### Account Protection
- Auto-verification for Google users
- Prevents duplicate accounts with same email
- Secure account linking process

## 🧪 Testing

### Test OAuth Integration
```bash
node test-oauth-integration.js
```

### Test Manual Login (Should work unchanged)
```bash
node test-signup-login.js
```

### Test Google OAuth Flow
1. Start server: `npm start`
2. Visit: `http://localhost:5001/api/auth/google`
3. Complete Google OAuth flow
4. Check redirect URL for token and user data

## 📱 Frontend Examples

### React Component Example
```jsx
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <button onClick={handleGoogleLogin} className="google-btn">
      <img src="/google-icon.png" alt="Google" />
      Continue with Google
    </button>
  );
};
```

### Success Page Handler
```jsx
const AuthSuccess = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');

    if (token && user) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', user);
      window.location.href = '/dashboard';
    }
  }, []);

  return <div>Logging you in...</div>;
};
```

## 🔄 Migration Notes

### Existing Users
- All existing manual accounts work unchanged
- No database migration needed
- Existing JWT tokens remain valid
- OTP verification system unchanged

### Database Changes
New optional fields added to User model:
- `googleId` (String, sparse index)
- `authProvider` (String, default: 'manual')  
- `linkedProviders` (Array)
- `avatar` (String)

## 🚀 Deployment

### Environment Variables for Production
```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret  
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourfrontend.com
```

### CORS Update for Production
Update CORS origins in `server.js` to include your production domains.

## 🎉 Summary

✅ **Zero Breaking Changes**: All existing functionality preserved  
✅ **Seamless Integration**: OAuth works alongside manual auth  
✅ **Account Linking**: Users can link Google to existing accounts  
✅ **Same JWT System**: Unified authentication across methods  
✅ **Production Ready**: Full error handling and security measures  

Your AgriVision backend now supports both manual and Google OAuth authentication! 🌾
