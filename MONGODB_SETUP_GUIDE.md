# MongoDB Setup Guide for AgriVision Backend

## 🍃 MongoDB Community Server + Compass Installation

### Step 1: Download MongoDB Community Server
1. Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Select:
   - **Version**: 7.0 or latest
   - **Platform**: Windows
   - **Package**: MSI
3. Download the installer (approximately 100MB)

### Step 2: Install MongoDB Community Server
1. Run the downloaded `.msi` file as administrator
2. Choose **Complete** installation
3. **Important**: During installation:
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Run service as Network Service user"
   - ✅ Check "Install MongoDB Compass" (GUI tool)
4. Complete the installation

### Step 3: Verify MongoDB Installation
Open PowerShell as Administrator and run:
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Start MongoDB service if not running
Start-Service -Name MongoDB

# Check MongoDB version
mongod --version
```

### Step 4: Configure MongoDB Compass
1. Open **MongoDB Compass** (should be installed automatically)
2. Use connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. Create database: `agrivision`

### Step 5: Test Your AgriVision Backend
```bash
cd f:\dow\AgriVision-backend-main\AgriVision-backend-main
node src/server.js
```

## 🚀 Quick Setup Alternative

If you prefer a faster setup, you can use MongoDB in a Docker container:

### Docker MongoDB Setup
```bash
# Pull MongoDB image
docker pull mongo:7.0

# Run MongoDB container
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:7.0

# Verify container is running
docker ps
```

## 🔧 Troubleshooting

### Issue: MongoDB Service Won't Start
```powershell
# Stop and restart MongoDB service
Stop-Service -Name MongoDB
Start-Service -Name MongoDB

# Check service status
Get-Service -Name MongoDB
```

### Issue: Port 27017 Already in Use
```powershell
# Check what's using port 27017
netstat -ano | findstr :27017

# Kill process if needed (replace PID with actual process ID)
taskkill /PID <process_id> /F
```

### Issue: MongoDB Path Not Found
Add MongoDB to your system PATH:
1. Find MongoDB installation directory (usually `C:\Program Files\MongoDB\Server\7.0\bin`)
2. Add to System Environment Variables PATH
3. Restart PowerShell/Command Prompt

## 📊 MongoDB Compass Features for Development

### 1. Database Management
- View and create databases
- Browse collections
- Import/export data
- Performance monitoring

### 2. Query Testing
```javascript
// Test queries in Compass
db.users.find({ email: "test@example.com" })
db.predictions.find().sort({ createdAt: -1 }).limit(10)
```

### 3. Index Management
Create indexes for better performance:
```javascript
// In Compass, go to Indexes tab and create:
db.users.createIndex({ email: 1 })
db.predictions.createIndex({ userId: 1, createdAt: -1 })
```

## 🌾 AgriVision Database Structure

Your application will create these collections:
- **users** - User accounts and authentication
- **predictions** - Crop yield predictions
- **chats** - Chat/conversation data

### Sample Data Verification
After starting your server, check in Compass:
1. Connect to `mongodb://localhost:27017`
2. Select `agrivision` database
3. View collections as they're created

## 🔒 Security Configuration (Optional)

For production, enable authentication:
```javascript
// Create admin user in MongoDB shell
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: ["userAdminAnyDatabase"]
})
```

Then update your `.env`:
```env
MONGODB_URI=mongodb://admin:your_secure_password@localhost:27017/agrivision?authSource=admin
```

## 📝 Environment Configuration

Your current `.env` is configured for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/agrivision
```

This will work once MongoDB is installed and running.

## ✅ Final Verification Steps

1. **MongoDB Service Running**: 
   ```powershell
   Get-Service -Name MongoDB
   ```

2. **Compass Connected**: 
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Should see connection successful

3. **Backend Server**: 
   ```bash
   node src/server.js
   ```
   Should start without database connection errors

4. **Test API**: 
   ```bash
   curl http://localhost:5001/api/auth/login
   ```
   Should respond (even if login fails, no database error)

## 🎯 Benefits of Local MongoDB + Compass

- **Visual Interface**: Easy database browsing and management
- **Performance Monitoring**: Real-time performance metrics
- **Query Builder**: Visual query construction
- **Data Import/Export**: Easy data management
- **Development Friendly**: Perfect for testing and debugging
- **No Internet Required**: Works completely offline

Once MongoDB is installed and running, your AgriVision backend will connect successfully and you can use Compass to visually manage your agricultural data!
