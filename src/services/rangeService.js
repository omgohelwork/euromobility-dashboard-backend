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
 * equalCount: sort descending (year-wise), split 13-13-12-12 (for 50), min/max per group, assign colors.
 */
export function calculateEqualCountRanges(values, invertScale = false) {
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

  const colors = getColors(invertScale);
  return groups.map((g, idx) => ({ ...g, color: colors[idx] }));
}

/**
 * equalInterval: divide (max - min) into 4 equal intervals.
 */
export function calculateEqualIntervalRanges(values, invertScale = false) {
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
  return [
    { min, max: min + step, color: colors[0] },
    { min: min + step, max: min + 2 * step, color: colors[1] },
    { min: min + 2 * step, max: min + 3 * step, color: colors[2] },
    { min: min + 3 * step, max: max, color: colors[3] },
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
