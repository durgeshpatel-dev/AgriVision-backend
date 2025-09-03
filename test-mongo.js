const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MONGODB_URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB connected successfully!');
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n📋 Troubleshooting steps:');
            console.log('1. Make sure MongoDB is installed and running');
            console.log('2. Check if MongoDB service is started');
            console.log('3. Verify port 27017 is not blocked');
            console.log('4. Try: net start MongoDB (as admin)');
        }
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
        process.exit(0);
    }
}

testConnection();
