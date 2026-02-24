import Data from '../models/Data.js';
import Indicator from '../models/Indicator.js';
import City from '../models/City.js';
import { success, notFound } from '../utils/ApiResponse.js';
import { roundValue } from '../utils/roundValue.js';

/**
 * GET /api/data/:indicatorId
 * Query: year (optional) – if provided, return only that year's value per city (null when missing; no fallback to other years).
 * Returns data for the indicator: list of { cityId, cityName, latitude, longitude, values }.
 * Values are rounded using the indicator's numero_di_decimali.
 */
export async function getByIndicator(req, res, next) {
  try {
    const { indicatorId } = req.params;
    const yearParam = req.query.year != null ? parseInt(String(req.query.year), 10) : null;
    const filterByYear = Number.isFinite(yearParam) ? yearParam : null;
    const yearKey = filterByYear != null ? String(filterByYear) : null;

    const indicator = await Indicator.findById(indicatorId).select('numero_di_decimali').lean();
    if (!indicator) return notFound(res, 'Indicatore');
    const decimals = indicator.numero_di_decimali != null ? Math.min(2, Math.max(0, Math.floor(Number(indicator.numero_di_decimali)))) : 0;

    const dataDocs = await Data.find({ indicatorId }).populate('cityId', 'name latitude longitude').lean();
    const cities = await City.find().lean();
    const cityById = new Map(cities.map((c) => [c._id.toString(), c]));

    const list = dataDocs.map((d) => {
      const rawValues = d.values || {};
      let values;
      if (yearKey) {
        const v = rawValues[yearKey];
        values = { [yearKey]: v != null && Number.isFinite(Number(v)) ? roundValue(Number(v), decimals) : null };
      } else {
        values = {};
        for (const [k, v] of Object.entries(rawValues)) {
          values[k] = v != null && Number.isFinite(Number(v)) ? roundValue(Number(v), decimals) : null;
        }
      }
      let media = null;
      if (!yearKey && typeof values === 'object' && Object.keys(values).length > 0) {
        const nums = Object.values(values).filter((v) => v != null && Number.isFinite(v));
        if (nums.length > 0) {
          const sum = nums.reduce((a, b) => a + b, 0);
          media = roundValue(sum / nums.length, decimals);
        }
      }
      return {
        cityId: d.cityId?._id || d.cityId,
        cityName: d.cityId?.name || cityById.get(String(d.cityId))?.name || '',
        latitude: d.cityId?.latitude,
        longitude: d.cityId?.longitude,
        values,
        ...(media != null && { media }),
      };
    });

    return success(res, {
      indicator: indicatorId,
      numero_di_decimali: decimals,
      ...(yearKey && { year: filterByYear }),
      data: list,
    });
  } catch (e) {
    next(e);
  }
}
