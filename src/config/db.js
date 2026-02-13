import mongoose from 'mongoose';

/**
 * Connect to MongoDB. Uses MONGODB_URI from .env.local.
 * No seeders - database starts empty.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dashboard_osservatorio';
  const options = {
    // Ensure UTF-8 and proper handling
    family: 4,
  };
  try {
    await mongoose.connect(uri, options);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
