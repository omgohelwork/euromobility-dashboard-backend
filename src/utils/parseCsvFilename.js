/**
 * Extract indicator code from filename.
 * Expected: "001 - Population.csv" → 1, "002 - PM10.xlsx" → 2
 * Accepts .csv and .xlsx. Returns null if format invalid.
 */
const FILENAME_REGEX = /^(\d{1,3})\s*-\s*.+\.(csv|xlsx)$/i;

export function parseCodeFromFilename(filename) {
  const match = String(filename).trim().match(FILENAME_REGEX);
  if (!match) return null;
  const code = parseInt(match[1], 10);
  return Number.isNaN(code) ? null : code;
}

export function isValidUploadFilename(filename) {
  return parseCodeFromFilename(filename) !== null;
}

/** @deprecated Use isValidUploadFilename */
export function isValidCsvFilename(filename) {
  return isValidUploadFilename(filename);
}
