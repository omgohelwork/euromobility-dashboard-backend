/**
 * Seed script: loads seedData.js and inserts categories, cities, and indicators.
 * Run from backend folder: npm run seed
 * Uses .env.local for MONGODB_URI.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { categories, indicators, cities } from './seedData.js';
import Category from '../src/models/Category.js';
import City from '../src/models/City.js';
import Indicator from '../src/models/Indicator.js';
import Data from '../src/models/Data.js';
import YearControl from '../src/models/YearControl.js';
import Admin from '../src/models/Admin.js';

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
    // Clear in dependency order so refs don't break
    console.log('Clearing existing Data, YearControl, Indicator, City, Category, Admin...');
    await Data.deleteMany({});
    await YearControl.deleteMany({});
    await Indicator.deleteMany({});
    await City.deleteMany({});
    await Category.deleteMany({});
    await Admin.deleteMany({});

    // 1. Categories
    if (!categories.length) {
      console.warn('No categories in seedData.js. Add at least one category.');
    } else {
      const insertedCategories = await Category.insertMany(categories);
      console.log(`Inserted ${insertedCategories.length} categories.`);
    }

    // 2. Cities
    if (!cities.length) {
      console.warn('No cities in seedData.js. You can upload cities via Admin → Città → CSV/XLSX later.');
    } else {
      await City.insertMany(cities);
      console.log(`Inserted ${cities.length} cities.`);
    }

    // 3. Indicators (need categoryId from category name)
    const categoryList = await Category.find().lean();
    const categoryByName = new Map(categoryList.map((c) => [c.name, c._id]));
    const indicatorsToInsert = [];
    for (const ind of indicators) {
      const categoryId = categoryByName.get(ind.categoryName);
      if (!categoryId) {
        console.error(`Indicator code ${ind.code}: category "${ind.categoryName}" not found. Skipping.`);
        continue;
      }
      indicatorsToInsert.push({
        code: ind.code,
        name: ind.name,
        categoryId,
        unit: ind.unit || '',
        order: ind.order ?? 0,
        invertScale: false,
        rangeMode: 'equalCount',
        ranges: [],
      });
    }
    if (indicatorsToInsert.length) {
      await Indicator.insertMany(indicatorsToInsert);
      console.log(`Inserted ${indicatorsToInsert.length} indicators.`);
    } else {
      console.warn('No valid indicators in seedData.js. Fix categoryName to match your categories.');
    }

    // 4. Single admin (username: admin, password: Admin@123)
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    await Admin.create({
      username: 'admin',
      password: adminPasswordHash,
    });
    console.log('Inserted admin (username: admin, password: Admin@123). Change password after first login if needed.');

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
