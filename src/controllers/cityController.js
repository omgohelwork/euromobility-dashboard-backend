import City from '../models/City.js';
import { parseCitiesFile } from '../services/uploadService.js';
import { success, error, notFound } from '../utils/ApiResponse.js';

/**
 * GET /api/cities
 */
export async function list(req, res, next) {
  try {
    const cities = await City.find().sort({ name: 1 }).lean();
    return success(res, cities);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/cities/bulk
 * Body: { cities: [{ name, latitude, longitude }, ...] }
 * Overwrites all existing cities.
 */
export async function bulkUpload(req, res, next) {
  try {
    const { cities: list } = req.body;
    if (!Array.isArray(list) || list.length === 0) {
      return error(res, 'Inviare un array "cities" con almeno un elemento', 400);
    }

    const toInsert = [];
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const { name, latitude, longitude } = list[i];
      const n = String(name || '').trim();
      if (!n) {
        return error(res, `Città alla posizione ${i + 1}: nome obbligatorio`, 400);
      }
      if (seen.has(n)) {
        return error(res, `Città duplicata: ${n}`, 400);
      }
      seen.add(n);
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return error(res, `Città "${n}": latitudine e longitudine devono essere numeri`, 400);
      }
      toInsert.push({ name: n, latitude: lat, longitude: lng });
    }

    await City.deleteMany({});
    const inserted = await City.insertMany(toInsert);
    return success(res, { count: inserted.length, cities: inserted }, 201);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/cities/upload
 * Multipart: single file (CSV or XLSX) with columns name, latitude, longitude.
 * Overwrites all existing cities.
 */
export async function uploadFile(req, res, next) {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return error(res, 'Nessun file caricato', 400);
    }
    const result = parseCitiesFile(file.buffer, file.originalname);
    if (result.error) {
      return error(res, result.error, 400);
    }
    const list = result.cities;
    const toInsert = [];
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const { name, latitude, longitude } = list[i];
      const n = String(name || '').trim();
      if (!n) {
        return error(res, `Città alla posizione ${i + 1}: nome obbligatorio`, 400);
      }
      if (seen.has(n)) {
        return error(res, `Città duplicata: ${n}`, 400);
      }
      seen.add(n);
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return error(res, `Città "${n}": latitudine e longitudine devono essere numeri`, 400);
      }
      toInsert.push({ name: n, latitude: lat, longitude: lng });
    }
    await City.deleteMany({});
    const inserted = await City.insertMany(toInsert);
    return success(res, { count: inserted.length, cities: inserted }, 201);
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/cities/:id
 */
export async function updateOne(req, res, next) {
  try {
    const { name, latitude, longitude } = req.body;
    const doc = await City.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
      },
      { new: true, runValidators: true }
    );
    if (!doc) return notFound(res, 'Città');
    return success(res, doc);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/cities/:id
 */
export async function deleteOne(req, res, next) {
  try {
    const doc = await City.findByIdAndDelete(req.params.id);
    if (!doc) return notFound(res, 'Città');
    return success(res, { deleted: true });
  } catch (e) {
    next(e);
  }
}
