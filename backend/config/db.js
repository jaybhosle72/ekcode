const mongoose = require('mongoose');
const dns = require('dns');

// Resolve MongoDB SRV records reliably on Windows and cloud environments
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekcode';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Running without MongoDB connection. Some operations may fail.');
    }
  }
};

module.exports = connectDB;
