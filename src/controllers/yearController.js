import YearControl from '../models/YearControl.js';
import Data from '../models/Data.js';
import { success, error } from '../utils/ApiResponse.js';

/**
 * GET /api/years
 */
export async function list(req, res, next) {
  try {
    const years = await YearControl.find().sort({ year: -1 }).lean();
    return success(res, years);
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/years/:year
 * Body: { enabled: boolean }
 */
export async function patch(req, res, next) {
  try {
    const year = parseInt(req.params.year, 10);
    if (!Number.isFinite(year)) {
      return error(res, 'Anno non valido', 400);
    }
    const { enabled } = req.body;
    const doc = await YearControl.findOneAndUpdate(
      { year },
      { $set: { enabled: Boolean(enabled) } },
      { new: true, upsert: true }
    );
    return success(res, doc);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/years/:year/data
 * Remove this year from all Data documents (delete year data entirely).
 */
export async function deleteYearData(req, res, next) {
  try {
    const year = parseInt(req.params.year, 10);
    if (!Number.isFinite(year)) return error(res, 'Anno non valido', 400);
    const yearKey = String(year);
    const result = await Data.updateMany(
      {},
      { $unset: { [`values.${yearKey}`]: 1 } }
    );
    await YearControl.findOneAndUpdate({ year }, { $set: { enabled: false } }, { upsert: true });
    return success(res, { modified: result.modifiedCount });
  } catch (e) {
    next(e);
  }
}
