const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to reliably resolve MongoDB Atlas SRV records
// (some ISPs/routers block SRV lookups on port 53)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-create default admin if none exists
    const User = require('../models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'RKD Admin',
        email: 'admin@rkdschool.com',
        password: 'admin123',
        role: 'admin',
        phone: '03001234567'
      });
      console.log('👑 Default Admin Account Initialized: admin@rkdschool.com / admin123');
    } else {
      console.log(`👑 Admin Account Ready: ${adminExists.email}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
