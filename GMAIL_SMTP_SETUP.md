# 📧 Gmail SMTP Configuration Guide for AgriVision

## 🚨 **Current Issue:**
You're getting authentication errors because Gmail requires special setup for SMTP access.

## 🔧 **Step-by-Step Gmail SMTP Setup:**

### **Step 1: Enable 2-Factor Authentication (2FA)**
1. Go to your Gmail account
2. Click on your profile picture → **"Manage your Google Account"**
3. Go to **"Security"** tab
4. Under **"Signing in to Google"**, enable **"2-Step Verification"**

### **Step 2: Generate App Password**
1. After enabling 2FA, go back to **"Security"** tab
2. Under **"Signing in to Google"**, click **"App passwords"**
3. You might need to sign in again
4. Select **"Mail"** and **"Other (custom name)"**
5. Enter **"AgriVision"** as the custom name
6. Click **"Generate"**
7. **Copy the 16-character password** (ignore spaces)

### **Step 3: Update .env File**
Replace your current email configuration:

```env
# Email Configuration (for OTP and password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=chaniyarapbad@gmail.com
EMAIL_PASS=YOUR_NEW_16_CHARACTER_APP_PASSWORD
EMAIL_FROM=chaniyarapbad@gmail.com
```

**Important:** Use your real Gmail address as EMAIL_FROM, not noreply@agrivision.com

### **Step 4: Test the Configuration**

After updating the .env file, restart your server and test:

```bash
# Restart server
npm run dev

# Test OTP email sending
node test-otp.js
```

## 🔍 **Troubleshooting:**

### **If Still Getting Errors:**

#### **Error: "Username and Password not accepted"**
- ✅ Ensure 2FA is enabled
- ✅ Use the NEW app password (16 characters, no spaces)
- ✅ Don't use your regular Gmail password

#### **Error: "Application-specific password required"**
- ✅ Generate a new app password
- ✅ Make sure you're using the app password, not your login password

#### **Error: "Less secure app access"**
- ✅ Gmail no longer supports "Less secure apps"
- ✅ You MUST use 2FA + App Password

## 🧪 **Alternative Email Services (If Gmail Doesn't Work):**

### **Option 1: Use Different Gmail Account**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_other_gmail@gmail.com
EMAIL_PASS=new_app_password_here
EMAIL_FROM=your_other_gmail@gmail.com
```

### **Option 2: Use Outlook/Hotmail**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_outlook@outlook.com
EMAIL_PASS=your_outlook_password
EMAIL_FROM=your_outlook@outlook.com
```

### **Option 3: Use SendGrid (Free Tier)**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender@yourdomain.com
```

## 📋 **Quick Verification Steps:**

1. **Check 2FA Status:**
   - Go to: https://myaccount.google.com/security
   - Verify 2-Step Verification is ON

2. **Generate New App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new password for "AgriVision"

3. **Update .env:**
   ```env
   EMAIL_PASS=YOUR_NEW_APP_PASSWORD_HERE
   ```

4. **Test:**
   ```bash
   npm run dev
   node test-otp.js
   ```

## ✅ **Expected Success Output:**

After proper configuration, you should see:
```
✅ Signup Response: {
  message: 'User registered successfully. Please check your email for OTP verification.',
  userId: '...'
}
```

## 🔐 **Security Notes:**

- ✅ App passwords are specific to each application
- ✅ You can revoke app passwords anytime
- ✅ Your main Gmail password remains secure
- ✅ 2FA protects your account even if app password is compromised

## 📞 **Need Help?**

If you're still having issues:

1. **Double-check your app password** (regenerate if needed)
2. **Verify 2FA is enabled** on your Gmail account
3. **Try a different Gmail account** if the current one has restrictions
4. **Consider using Outlook or SendGrid** as alternatives

The email system will work perfectly once properly configured! 🚀
