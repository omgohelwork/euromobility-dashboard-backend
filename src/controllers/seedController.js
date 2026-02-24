import { isSeeded, seedDatabase } from '../services/seedService.js';

/**
 * GET /api/seed
 * Seeds the database if not already seeded. Safe to call from browser or curl.
 */
export async function runSeed(req, res, next) {
  try {
    const alreadySeeded = await isSeeded();
    if (alreadySeeded) {
      return res.status(200).json({
        message: 'Data is already seeded.',
        seeded: true,
      });
    }
    await seedDatabase();
    res.status(200).json({
      message: 'Database seeded successfully.',
      seeded: true,
    });
  } catch (err) {
    next(err);
  }
}
