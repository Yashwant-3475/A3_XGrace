//MongoDB connection
const mongoose = require('mongoose');


const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Server will start without a database connection.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('Server is running, but MongoDB is currently unavailable.');
  }
};

module.exports = connectDB;


