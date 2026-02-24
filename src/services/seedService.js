import bcrypt from 'bcrypt';
import { categories, indicators, cities } from '../../seed/seedData.js';
import Category from '../models/Category.js';
import City from '../models/City.js';
import Indicator from '../models/Indicator.js';
import Data from '../models/Data.js';
import YearControl from '../models/YearControl.js';
import Admin from '../models/Admin.js';

/**
 * Returns true only if this app's seed has already been run:
 * admin user "admin" exists and we have at least the expected number of categories.
 */
export async function isSeeded() {
  const [admin, categoryCount] = await Promise.all([
    Admin.findOne({ username: 'admin' }).lean(),
    Category.countDocuments(),
  ]);
  return !!admin && categoryCount >= categories.length;
}

/**
 * Clears seed-related collections and inserts categories, cities, indicators, and admin.
 * Assumes MongoDB is already connected. Does not disconnect.
 */
export async function seedDatabase() {
  await Data.deleteMany({});
  await YearControl.deleteMany({});
  await Indicator.deleteMany({});
  await City.deleteMany({});
  await Category.deleteMany({});
  await Admin.deleteMany({});

  if (categories.length) {
    await Category.insertMany(categories);
  }

  if (cities.length) {
    await City.insertMany(cities);
  }

  const categoryList = await Category.find().lean();
  const categoryByName = new Map(categoryList.map((c) => [c.name, c._id]));
  const indicatorsToInsert = [];
  for (const ind of indicators) {
    const categoryId = categoryByName.get(ind.categoryName);
    if (!categoryId) continue;
    const decimals = ind.numero_di_decimali != null ? Math.min(2, Math.max(0, Math.floor(Number(ind.numero_di_decimali)))) : 0;
    indicatorsToInsert.push({
      code: ind.code,
      name: ind.name,
      categoryId,
      unit: ind.unit || '',
      order: ind.order ?? 0,
      numero_di_decimali: decimals,
      invertScale: false,
      rangeMode: 'equalCount',
      ranges: [],
    });
  }
  if (indicatorsToInsert.length) {
    await Indicator.insertMany(indicatorsToInsert);
  }

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  await Admin.create({
    username: 'admin',
    password: adminPasswordHash,
  });
}
