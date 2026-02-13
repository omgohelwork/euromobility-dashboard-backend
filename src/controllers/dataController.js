import Data from '../models/Data.js';
import Indicator from '../models/Indicator.js';
import City from '../models/City.js';
import { success, notFound } from '../utils/ApiResponse.js';

/**
 * GET /api/data/:indicatorId
 * Returns data for the indicator: list of { cityId, cityName, values: { "2014": number|null, ... } }.
 */
export async function getByIndicator(req, res, next) {
  try {
    const { indicatorId } = req.params;
    const indicator = await Indicator.findById(indicatorId).lean();
    if (!indicator) return notFound(res, 'Indicatore');

    const dataDocs = await Data.find({ indicatorId }).populate('cityId', 'name latitude longitude').lean();
    const cities = await City.find().lean();
    const cityById = new Map(cities.map((c) => [c._id.toString(), c]));

    const list = dataDocs.map((d) => ({
      cityId: d.cityId?._id || d.cityId,
      cityName: d.cityId?.name || cityById.get(String(d.cityId))?.name || '',
      latitude: d.cityId?.latitude,
      longitude: d.cityId?.longitude,
      values: d.values || {},
    }));

    return success(res, { indicator: indicatorId, data: list });
  } catch (e) {
    next(e);
  }
}
