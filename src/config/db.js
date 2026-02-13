import mongoose from 'mongoose';

/** Cached connection promise so serverless (e.g. Vercel) reuses one connection per instance. */
let connPromise = null;

/**
 * Connect to MongoDB. Uses MONGODB_URI from env.
 * Safe to call multiple times; reuses existing connection.
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (connPromise) return connPromise;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dashboard_osservatorio';
  const options = { family: 4 };

  connPromise = mongoose.connect(uri, options).then(() => {
    console.log('MongoDB connected');
    return mongoose.connection;
  }).catch((err) => {
    connPromise = null;
    console.error('MongoDB connection error:', err.message);
    throw err;
  });

  return connPromise;
}

mongoose.connection.on('disconnected', () => {
  connPromise = null;
  console.log('MongoDB disconnected');
});
