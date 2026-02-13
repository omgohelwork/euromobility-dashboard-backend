import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import Data from '../models/Data.js';
import City from '../models/City.js';
import Indicator from '../models/Indicator.js';
import YearControl from '../models/YearControl.js';
import { parseCodeFromFilename } from '../utils/parseCsvFilename.js';
import { calculateEqualCountRanges, calculateEqualIntervalRanges, getValuesForYear } from './rangeService.js';

/** Normalize parsed rows into { headers, rows } shape. Shared by CSV and XLSX. */
function normalizeToRows(records) {
  if (!records.length) return { headers: [], rows: [] };
  const headers = records[0].map((h) => String(h ?? '').trim());
  const rows = [];
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    const cityName = row[0] ? String(row[0]).trim() : '';
    if (!cityName) continue;
    const values = {};
    for (let c = 1; c < headers.length; c++) {
      const yearKey = headers[c];
      const raw = row[c];
      if (yearKey && /^\d{4}$/.test(String(yearKey).trim())) {
        const num = raw === '' || raw === null || raw === undefined ? null : parseFloat(String(raw).replace(',', '.'));
        values[String(yearKey).trim()] = Number.isFinite(num) ? num : null;
      }
    }
    rows.push({ cityName, values });
  }
  return { headers, rows };
}

/**
 * Parse CSV buffer: first row = headers (City, 2014, 2015, ...), rest = city name + values.
 * Returns { headers, rows }.
 */
function parseCsvBuffer(buffer) {
  const text = buffer.toString('utf-8');
  const records = parse(text, {
    trim: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  });
  return normalizeToRows(records);
}

/**
 * Parse XLSX buffer: first sheet, first row = headers, rest = city + values.
 * Returns { headers, rows } (same shape as CSV).
 */
function parseXlsxBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { headers: [], rows: [] };
  const sheet = workbook.Sheets[firstSheetName];
  const records = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  return normalizeToRows(records);
}

/** Parse file buffer by extension. Returns { headers, rows }. */
function parseFileBuffer(buffer, filename) {
  const name = String(filename || '').toLowerCase();
  if (name.endsWith('.xlsx')) return parseXlsxBuffer(buffer);
  return parseCsvBuffer(buffer);
}

/**
 * Parse cities file (CSV or XLSX): columns name, latitude, longitude (or lat, lng).
 * Returns { cities: [{ name, latitude, longitude }] } or { error: string }.
 */
export function parseCitiesFile(buffer, filename) {
  const name = String(filename || '').toLowerCase();
  if (!name.endsWith('.csv') && !name.endsWith('.xlsx')) {
    return { error: 'File deve essere .csv o .xlsx' };
  }
  let records;
  if (name.endsWith('.xlsx')) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return { error: 'File XLSX vuoto' };
    records = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1, defval: '' });
  } else {
    const text = buffer.toString('utf-8');
    records = parse(text, { trim: true, skip_empty_lines: true, relax_column_count: true, bom: true });
  }
  if (!records || records.length < 2) return { error: 'File vuoto o senza righe dati' };
  const rawHeaders = (records[0] || []).map((h) => String(h ?? '').trim().toLowerCase().replace(/\s+/g, ''));
  const nameIdx = rawHeaders.findIndex((h) => h === 'name' || h === 'nome');
  const latIdx = rawHeaders.findIndex((h) => h === 'latitude' || h === 'lat');
  const lngIdx = rawHeaders.findIndex((h) => h === 'longitude' || h === 'lng' || h === 'lon');
  if (nameIdx === -1 || latIdx === -1 || lngIdx === -1) {
    return { error: 'Intestazione richiesta: name, latitude, longitude (o lat, lng)' };
  }
  const cities = [];
  for (let i = 1; i < records.length; i++) {
    const row = records[i] || [];
    const n = String(row[nameIdx] ?? '').trim();
    if (!n) continue;
    const lat = parseFloat(String(row[latIdx] ?? '').replace(',', '.'));
    const lng = parseFloat(String(row[lngIdx] ?? '').replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    cities.push({ name: n, latitude: lat, longitude: lng });
  }
  if (cities.length === 0) return { error: 'Nessuna riga valida nel file' };
  return { cities };
}

/**
 * Normalize city name for matching: remove apostrophes, collapse spaces, lowercase.
 * So "L'Aquila" and "LAquila" both become "laquila" and match the same DB city.
 */
export function normalizeCityName(name) {
  return String(name ?? '')
    .trim()
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Process one file and return Data bulkWrite ops + years (no DB writes).
 * Use this when batching multiple files into a single bulkWrite (e.g. Vercel to avoid timeout).
 * City lookup: exact name first, then normalized.
 */
export function processOneCsvToOps(file, indicator, cityMap) {
  const code = parseCodeFromFilename(file.originalname);
  if (code === null) {
    return { ok: false, error: `Nome file non valido: ${file.originalname}. Atteso: 001 - Nome.csv o .xlsx` };
  }
  if (indicator.code !== code) {
    return { ok: false, error: `Indicatore con codice ${code} non corrisponde al file ${file.originalname}` };
  }

  const { headers, rows } = parseFileBuffer(file.buffer, file.originalname);
  const yearHeaders = headers.filter((h) => /^\d{4}$/.test(String(h).trim()));
  const allYears = [...new Set(yearHeaders)];

  const notFoundCities = [];
  const bulkOps = [];

  for (const { cityName, values } of rows) {
    const city = cityMap.get(cityName) || cityMap.get(normalizeCityName(cityName));
    if (!city) {
      notFoundCities.push(cityName);
      continue;
    }
    bulkOps.push({
      updateOne: {
        filter: { indicatorId: indicator._id, cityId: city._id },
        update: { $set: { values } },
        upsert: true,
      },
    });
  }

  if (notFoundCities.length > 0) {
    return {
      ok: false,
      error: `Città non trovate nel database: ${[...new Set(notFoundCities)].slice(0, 10).join(', ')}${notFoundCities.length > 10 ? '...' : ''}`,
    };
  }

  return { ok: true, bulkOps, years: allYears, rowsProcessed: rows.length };
}

/**
 * Process one CSV file: find indicator by code, find cities by name, upsert Data, update YearControl.
 * Overwrites existing data for this indicator.
 * (Used for single-file or when not using batched upload.)
 */
export async function processOneCsv(file, indicator, cityMap) {
  const result = processOneCsvToOps(file, indicator, cityMap);
  if (!result.ok) return result;

  if (result.bulkOps.length > 0) {
    await Data.bulkWrite(result.bulkOps);
  }
  for (const y of result.years) {
    const year = parseInt(y, 10);
    if (Number.isFinite(year)) {
      await YearControl.findOneAndUpdate(
        { year },
        { $setOnInsert: { year, enabled: true } },
        { upsert: true }
      );
    }
  }
  return { ok: true, rowsProcessed: result.rowsProcessed, years: result.years };
}

/**
 * Recalculate ranges for an indicator using its rangeMode and latest year data.
 */
export async function recalculateRangesForIndicator(indicator) {
  if (indicator.rangeMode === 'manual') {
    return indicator.ranges;
  }

  const dataDocs = await Data.find({ indicatorId: indicator._id }).lean();
  const yearKeys = new Set();
  dataDocs.forEach((d) => {
    if (d.values && typeof d.values === 'object') {
      Object.keys(d.values).forEach((k) => yearKeys.add(k));
    }
  });
  const sortedYears = [...yearKeys].filter((y) => /^\d{4}$/.test(y)).map(Number).sort((a, b) => b - a);
  const latestYear = sortedYears[0];
  if (latestYear === undefined) {
    return indicator.ranges || [];
  }

  const yearKey = String(latestYear);
  const values = getValuesForYear(dataDocs, yearKey);

  let ranges;
  if (indicator.rangeMode === 'equalCount') {
    ranges = calculateEqualCountRanges(values, indicator.invertScale);
  } else {
    ranges = calculateEqualIntervalRanges(values, indicator.invertScale);
  }

  return ranges;
}
