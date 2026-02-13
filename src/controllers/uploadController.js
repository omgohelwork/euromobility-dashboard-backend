import Indicator from '../models/Indicator.js';
import City from '../models/City.js';
import YearControl from '../models/YearControl.js';
import Data from '../models/Data.js';
import { parseCodeFromFilename } from '../utils/parseCsvFilename.js';
import { processOneCsvToOps, normalizeCityName } from '../services/uploadService.js';
import { success, error } from '../utils/ApiResponse.js';

/**
 * POST /api/upload
 * Multer puts files in req.files (array). Each file: { originalname, buffer }.
 * Validate: each filename = "001 - Name.csv", indicator with that code exists.
 * Process each file: overwrite data for that indicator.
 * Range recalculation is NOT done here (avoids Vercel timeout). Frontend should call
 * POST /api/indicators/recalculate-bulk with the returned indicatorIds after upload.
 */
export async function upload(req, res, next) {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return error(res, 'Nessun file caricato', 400);
    }

    // Parse all codes and validate filenames first
    const codes = [];
    for (const file of files) {
      const code = parseCodeFromFilename(file.originalname);
      if (code === null) {
        return error(
          res,
          `Nome file non valido: "${file.originalname}". Formato atteso: 001 - NomeFile.csv o .xlsx`,
          400
        );
      }
      codes.push(code);
    }

    // Single query for all indicators (faster on Vercel/serverless)
    const indicators = await Indicator.find({ code: { $in: codes } }).lean();
    const indicatorByCode = new Map(indicators.map((i) => [i.code, i]));

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
    const allBulkOps = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const code = codes[i];
      const indicator = indicatorByCode.get(code);
      if (!indicator) {
        return error(
          res,
          `Nessun indicatore trovato con codice ${String(code).padStart(3, '0')}. Creare l'indicatore prima di caricare i dati.`,
          400
        );
      }

      const result = processOneCsvToOps(file, indicator, cityMap);
      if (!result.ok) {
        return error(res, result.error, 400);
      }
      results.push({ file: file.originalname, rowsProcessed: result.rowsProcessed, years: result.years || [] });
      indicatorsUpdated.add(indicator._id.toString());
      allBulkOps.push(...result.bulkOps);
    }

    // Single bulkWrite for all files (minimizes DB round-trips on Vercel)
    if (allBulkOps.length > 0) {
      await Data.bulkWrite(allBulkOps);
    }

    // One YearControl update for all years
    const uploadYears = [...new Set(results.flatMap((r) => r.years || []))]
      .filter((y) => /^\d{4}$/.test(String(y)))
      .map((y) => Number(y))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (uploadYears.length > 0) {
      await YearControl.deleteMany({});
      await YearControl.insertMany(uploadYears.map((year) => ({ year, enabled: true })));
    }

    const indicatorIds = [...indicatorsUpdated];
    return success(res, {
      message: `Caricati ${files.length} file`,
      files: results,
      indicatorIds,
      hint: 'Chiamare POST /api/indicators/recalculate-bulk con { indicatorIds } per aggiornare i colori (ranges).',
    }, 201);
  } catch (e) {
    next(e);
  }
}
