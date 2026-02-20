/**
 * Range calculation for indicators.
 * equalCount: sort values DESC (year-wise, latest year), split into 4 groups 13-13-12-12 (for 50),
 *   then min/max per group. Colors: G1 green, G2 yellow, G3 orange, G4 red (or reversed if invertScale).
 * equalInterval: (max - min) / 4.
 * manual: no auto-calc.
 */
const DEFAULT_COLORS = {
  best: '#22c55e',   // green  – best values (group 1)
  good: '#eab308',   // yellow – group 2
  warn: '#f97316',   // orange – group 3
  worst: '#ef4444',  // red    – worst values (group 4)
};

function getColors(invertScale) {
  const order = invertScale ? ['worst', 'warn', 'good', 'best'] : ['best', 'good', 'warn', 'worst'];
  return order.map((k) => DEFAULT_COLORS[k]);
}

/** Round for range display: 2 decimals to avoid floating-point noise in API. */
function roundRange(value, decimals = 2) {
  if (value == null || !Number.isFinite(value)) return value;
  const p = Math.pow(10, decimals);
  return Math.round(value * p) / p;
}

/** Round and clamp to >= 0 so range boundaries are never negative (e.g. -0.01 becomes 0). */
function roundRangeNonNegative(value, decimals = 2) {
  const r = roundRange(value, decimals);
  return r != null && Number.isFinite(r) ? Math.max(0, r) : 0;
}

/**
 * Group sizes for equal count: 13-13-12-12 for 50 cities; otherwise split as even as possible.
 * Values are sorted DESC (highest first), so group 1 = best, group 4 = worst.
 */
function getEqualCountSizes(n) {
  if (n <= 0) return [0, 0, 0, 0];
  if (n === 50) return [13, 13, 12, 12];
  const q = Math.floor(n / 4);
  const r = n % 4;
  const s1 = q + (r > 0 ? 1 : 0);
  const s2 = q + (r > 1 ? 1 : 0);
  const s3 = q + (r > 2 ? 1 : 0);
  const s4 = n - s1 - s2 - s3;
  return [s1, s2, s3, s4];
}

/**
 * equalCount: sort descending, split 13-13-12-12 (for 50), min/max per group.
 * Set max of lower range = min of next higher range - 0.01. Round to 2 decimals.
 */
export function calculateEqualCountRanges(values, invertScale = false, step = 0.01) {
  const nums = values
    .filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)))
    .map(Number)
    .sort((a, b) => b - a);

  if (nums.length === 0) {
    const colors = getColors(invertScale);
    return [
      { min: 0, max: 0, color: colors[0] },
      { min: 0, max: 0, color: colors[1] },
      { min: 0, max: 0, color: colors[2] },
      { min: 0, max: 0, color: colors[3] },
    ];
  }

  const n = nums.length;
  const sizes = getEqualCountSizes(n);
  let i = 0;
  const groups = [];
  for (const size of sizes) {
    const slice = nums.slice(i, i + size);
    groups.push({
      min: slice.length ? Math.min(...slice) : nums[nums.length - 1],
      max: slice.length ? Math.max(...slice) : nums[0],
    });
    i += size;
  }

  groups[1].max = roundRangeNonNegative(groups[0].min - step);
  groups[2].max = roundRangeNonNegative(groups[1].min - step);
  groups[3].max = roundRangeNonNegative(groups[2].min - step);

  const colors = getColors(invertScale);
  return groups.map((g, idx) => ({
    min: roundRangeNonNegative(g.min),
    max: roundRangeNonNegative(g.max),
    color: colors[idx],
  }));
}

/**
 * equalInterval: divide (max - min) into 4 equal intervals.
 * Set max of lower range = min of next higher - gapStep. Round to 2 decimals.
 */
export function calculateEqualIntervalRanges(values, invertScale = false, gapStep = 0.01) {
  const nums = values
    .filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)))
    .map(Number);

  if (nums.length === 0) {
    const colors = getColors(invertScale);
    return [
      { min: 0, max: 0, color: colors[0] },
      { min: 0, max: 0, color: colors[1] },
      { min: 0, max: 0, color: colors[2] },
      { min: 0, max: 0, color: colors[3] },
    ];
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const step = (max - min) / 4 || 0;
  const colors = getColors(invertScale);
  const r0min = min + 3 * step;
  const r1min = min + 2 * step;
  const r2min = min + step;
  return [
    { min: roundRangeNonNegative(r0min), max: roundRangeNonNegative(max), color: colors[0] },
    { min: roundRangeNonNegative(r1min), max: roundRangeNonNegative(r0min - gapStep), color: colors[1] },
    { min: roundRangeNonNegative(r2min), max: roundRangeNonNegative(r1min - gapStep), color: colors[2] },
    { min: roundRangeNonNegative(min), max: roundRangeNonNegative(r2min - gapStep), color: colors[3] },
  ];
}

/**
 * Value-based: quartile = (max - min) / 4; four ranges with step (0.01) between boundaries.
 * Range 1: [max - quartile, max], Range 2: [max - 2*quartile, max - quartile - step], etc.
 * Min/max from all years. step = 0.01 for both numbers and percent. Round to 2 decimals.
 */
export function calculateValueBasedRanges(values, invertScale = false, step = 0.01) {
  const nums = values
    .filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)))
    .map(Number);

  if (nums.length === 0) {
    const colors = getColors(invertScale);
    return [
      { min: 0, max: 0, color: colors[0] },
      { min: 0, max: 0, color: colors[1] },
      { min: 0, max: 0, color: colors[2] },
      { min: 0, max: 0, color: colors[3] },
    ];
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const quartile = (max - min) / 4 || 0;
  const colors = getColors(invertScale);

  return [
    { min: roundRangeNonNegative(max - quartile), max: roundRangeNonNegative(max), color: colors[0] },
    { min: roundRangeNonNegative(max - 2 * quartile), max: roundRangeNonNegative(max - quartile - step), color: colors[1] },
    { min: roundRangeNonNegative(max - 3 * quartile), max: roundRangeNonNegative(max - 2 * quartile - step), color: colors[2] },
    { min: roundRangeNonNegative(min), max: roundRangeNonNegative(max - 3 * quartile - step), color: colors[3] },
  ];
}

/**
 * Get all values for an indicator (from Data documents) for a given year.
 */
export function getValuesForYear(dataDocs, yearKey) {
  return dataDocs
    .map((d) => d.values && d.values[yearKey])
    .filter((v) => v !== undefined);
}

/**
 * Get all values from all years (for min/max and range calculation across all years).
 */
export function getValuesForAllYears(dataDocs) {
  const values = [];
  for (const d of dataDocs) {
    if (d.values && typeof d.values === 'object') {
      for (const k of Object.keys(d.values)) {
        if (/^\d{4}$/.test(k)) {
          const v = d.values[k];
          if (v !== undefined) values.push(v);
        }
      }
    }
  }
  return values;
}
