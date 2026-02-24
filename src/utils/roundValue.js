/**
 * Round a numeric value to the given number of decimal places.
 * Returns null for null/undefined/non-finite; otherwise a number (or string from toFixed for consistency).
 * Backend uses this for chart/table/map responses based on indicator's numero_di_decimali.
 */
export function roundValue(value, decimals = 0) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const d = Math.min(2, Math.max(0, Math.floor(Number(decimals))));
  const n = Number(value);
  if (d === 0) return Math.round(n);
  const factor = 10 ** d;
  return Math.round(n * factor) / factor;
}

/**
 * Format a value to fixed decimal places (string), for display-oriented APIs.
 * Returns null for null/undefined/non-finite.
 */
export function toFixedValue(value, decimals = 0) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const d = Math.min(2, Math.max(0, Math.floor(Number(decimals))));
  return Number(value).toFixed(d);
}
