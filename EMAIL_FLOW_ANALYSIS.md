# EMAIL FLOW ANALYSIS - User Email vs Hardcoded Email

## CURRENT IMPLEMENTATION ANALYSIS

### 1. SIGNUP PROCESS (`/api/auth/signup`)
```javascript
// Location: src/controllers/auth.controller.js, line ~20
const signup = async (req, res) => {
  const { name, email, password, farmDetails } = req.body;  // ← USER'S EMAIL from request
  
  // ... user creation ...
  
  // EMAIL SENDING - Uses USER'S email, NOT hardcoded
  const emailResult = await sendOTPEmail(email, otp, name);  // ← USER'S EMAIL
  //                                     ^^^^^^
  //                                     This is the user's email from signup form
}
```

### 2. OTP RESEND PROCESS (`/api/auth/resend-otp`)
```javascript
// Location: src/controllers/auth.controller.js, line ~186
const resendOTP = async (req, res) => {
  const user = await User.findById(userId);  // ← Get user from database
  
  // EMAIL SENDING - Uses USER'S email from database
  const emailResult = await sendOTPEmail(user.email, otp, user.name);  // ← USER'S EMAIL
  //                                     ^^^^^^^^^^
  //                                     This is the user's email from database
}
```

### 3. PASSWORD RESET PROCESS (`/api/auth/forgot-password`)
```javascript
// Location: src/controllers/auth.controller.js, line ~240
const forgotPassword = async (req, res) => {
  const { email } = req.body;  // ← USER'S EMAIL from request
  const user = await User.findOne({ email });  // ← Find user by their email
  
  // EMAIL SENDING - Uses USER'S email
  const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);  // ← USER'S EMAIL
  //                                               ^^^^^^^^^^
  //                                               This is the user's email
}
```

### 4. EMAIL SERVICE CONFIGURATION
```javascript
// Location: src/utils/emailService.js
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,        // ← SMTP server settings
    port: process.env.EMAIL_PORT,        // ← SMTP server settings  
    auth: {
      user: process.env.EMAIL_USER,      // ← SMTP LOGIN (not recipient!)
      pass: process.env.EMAIL_PASS,      // ← SMTP PASSWORD (not recipient!)
    }
  });
};

const sendOTPEmail = async (email, otp, name) => {  // ← email parameter is USER'S email
  const mailOptions = {
    from: process.env.EMAIL_FROM,  // ← Sender (your email)
    to: email,                     // ← Recipient (USER'S email)
    //   ^^^^^
    //   This is the user's email passed as parameter
    subject: 'Email Verification - AgriVision',
    html: `...OTP content...`
  };
}
```

## SUMMARY

✅ **CORRECT IMPLEMENTATION**: The system is already properly implemented!

### What each email setting does:
- `EMAIL_USER` in .env = **SMTP server login credentials** (your email for authentication)
- `EMAIL_FROM` in .env = **Sender address** (who the email appears to come from)
- `email` parameter in functions = **Recipient address** (USER'S email where email is sent)

### Email Flow:
1. User signs up with their email (e.g., user@example.com)
2. System uses YOUR email credentials to authenticate with SMTP server
3. System sends OTP email TO user@example.com FROM your email
4. User receives email at user@example.com

### The system correctly:
- ✅ Sends emails TO user's provided email address
- ✅ Uses .env credentials only for SMTP authentication
- ✅ Does NOT hardcode recipient emails
- ✅ Each user gets emails at their own address

## VERIFICATION

To verify this is working:
1. Run: `node demo-user-emails.js`
2. Check the console logs for "Sent To" field
3. Verify it shows the user's email, not the .env email
