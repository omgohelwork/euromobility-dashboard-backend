/**
 * Seed script: loads seedService and runs full seed (clear + insert).
 * Run from backend folder: npm run seed
 * Uses .env.local for MONGODB_URI.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { seedDatabase } from '../src/services/seedService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function runSeed() {
  if (NODE_ENV === 'production') {
    console.error('Refusing to run seed in production. Set NODE_ENV=development if you really mean it.');
    process.exit(1);
  }
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  try {
    console.log('Clearing existing Data, YearControl, Indicator, City, Category, Admin...');
    await seedDatabase();
    console.log('Seed completed. You can now use Admin → Carica dati to upload indicator CSV/XLSX files.');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
