import Indicator from '../models/Indicator.js';
import City from '../models/City.js';
import YearControl from '../models/YearControl.js';
import { parseCodeFromFilename } from '../utils/parseCsvFilename.js';
import { processOneCsv, recalculateRangesForIndicator, normalizeCityName } from '../services/uploadService.js';
import { success, error } from '../utils/ApiResponse.js';

/**
 * POST /api/upload
 * Multer puts files in req.files (array). Each file: { originalname, buffer }.
 * Validate: each filename = "001 - Name.csv", indicator with that code exists.
 * Process each file: overwrite data for that indicator, then recalculate ranges.
 */
export async function upload(req, res, next) {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return error(res, 'Nessun file caricato', 400);
    }

    const cityList = await City.find().lean();
    const cityMap = new Map();
    for (const c of cityList) {
      cityMap.set(c.name, c);
      const normalized = normalizeCityName(c.name);
      if (!cityMap.has(normalized)) cityMap.set(normalized, c);
    }

    if (cityMap.size === 0) {
      return error(res, 'Caricare prima le città (POST /api/cities/bulk)', 400);
    }

    const results = [];
    const indicatorsUpdated = new Set();

    for (const file of files) {
      const code = parseCodeFromFilename(file.originalname);
      if (code === null) {
        return error(
          res,
          `Nome file non valido: "${file.originalname}". Formato atteso: 001 - NomeFile.csv o .xlsx`,
          400
        );
      }

      const indicator = await Indicator.findOne({ code }).lean();
      if (!indicator) {
        return error(
          res,
          `Nessun indicatore trovato con codice ${String(code).padStart(3, '0')}. Creare l'indicatore prima di caricare i dati.`,
          400
        );
      }

      const result = await processOneCsv(file, indicator, cityMap);
      if (!result.ok) {
        return error(res, result.error, 400);
      }
      results.push({ file: file.originalname, rowsProcessed: result.rowsProcessed, years: result.years || [] });
      indicatorsUpdated.add(indicator._id.toString());
    }

    // Reset years: only years that appear in this upload exist, all enabled
    const uploadYears = [...new Set(results.flatMap((r) => r.years || []))]
      .filter((y) => /^\d{4}$/.test(String(y)))
      .map((y) => Number(y))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (uploadYears.length > 0) {
      await YearControl.deleteMany({});
      await YearControl.insertMany(uploadYears.map((year) => ({ year, enabled: true })));
    }

    // Recalculate ranges for each affected indicator
    for (const id of indicatorsUpdated) {
      const ind = await Indicator.findById(id);
      if (ind) {
        const ranges = await recalculateRangesForIndicator(ind);
        ind.ranges = ranges;
        await ind.save();
      }
    }

    return success(res, {
      message: `Caricati ${files.length} file`,
      files: results,
      indicatorsRecalculated: indicatorsUpdated.size,
    }, 201);
  } catch (e) {
    next(e);
  }
}
