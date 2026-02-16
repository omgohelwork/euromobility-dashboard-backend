import ComplexIndicator from '../models/ComplexIndicator.js';
import Data from '../models/Data.js';
import City from '../models/City.js';
import YearControl from '../models/YearControl.js';
import { success, notFound, error } from '../utils/ApiResponse.js';

/** Default segment colors for stack chart (used if indicator has no ranges). */
const STACK_COLORS = ['#3b82f6', '#ef4444', '#f97316', '#22c55e', '#06b6d4', '#8b5cf6'];

export async function list(req, res, next) {
  try {
    const list = await ComplexIndicator.find()
      .populate('stackedIndicators.indicatorId', 'name code unit categoryId')
      .sort({ order: 1, name: 1 })
      .lean();
    return success(res, list);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const { name, order, stackedIndicators } = req.body;
    const doc = await ComplexIndicator.create({
      name: String(name).trim(),
      order: order != null && Number.isFinite(Number(order)) && Number(order) >= 1 ? Number(order) : 1,
      stackedIndicators: Array.isArray(stackedIndicators)
        ? stackedIndicators.map((s, i) => ({
            indicatorId: s.indicatorId,
            order: Number(s.order) ?? i,
          }))
        : [],
    });
    return success(res, doc, 201);
  } catch (e) {
    if (e.name === 'ValidationError') return error(res, e.message, 400);
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const doc = await ComplexIndicator.findById(req.params.id)
      .populate('stackedIndicators.indicatorId', 'name code unit categoryId')
      .lean();
    if (!doc) return notFound(res, 'Indicatore complesso');
    return success(res, doc);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const { name, order, stackedIndicators } = req.body;
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (order !== undefined) {
      const n = Number(order);
      update.order = n >= 1 && Number.isFinite(n) ? n : 1;
    }
    if (stackedIndicators !== undefined) {
      update.stackedIndicators = Array.isArray(stackedIndicators)
        ? stackedIndicators.map((s, i) => ({
            indicatorId: s.indicatorId,
            order: Number(s.order) ?? i,
          }))
        : [];
    }
    const doc = await ComplexIndicator.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!doc) return notFound(res, 'Indicatore complesso');
    return success(res, doc);
  } catch (e) {
    if (e.name === 'ValidationError') return error(res, e.message, 400);
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await ComplexIndicator.findByIdAndDelete(req.params.id);
    if (!doc) return notFound(res, 'Indicatore complesso');
    return success(res, { deleted: true });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/complex-indicators/:id/stack-data?year=2023
 * Returns data for a stack chart: one bar per city, segments = stacked indicators (by order).
 * year: optional; if omitted, uses latest enabled year from YearControl.
 */
export async function getStackData(req, res, next) {
  try {
    const complexId = req.params.id;
    const yearParam = req.query.year ? parseInt(req.query.year, 10) : null;

    const complex = await ComplexIndicator.findById(complexId)
      .populate('stackedIndicators.indicatorId', 'name code unit ranges')
      .lean();
    if (!complex) return notFound(res, 'Indicatore complesso');

    const stacked = (complex.stackedIndicators || [])
      .filter((s) => s.indicatorId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (stacked.length === 0) {
      return success(res, {
        complexIndicator: { id: complex._id, name: complex.name },
        year: null,
        labels: [],
        series: [],
        message: 'Nessun indicatore nello stack',
      });
    }

    const indicatorIds = stacked.map((s) => s.indicatorId._id ?? s.indicatorId);

    let year = yearParam;
    if (year == null || !Number.isFinite(year)) {
      const latest = await YearControl.findOne({ enabled: true }).sort({ year: -1 }).lean();
      year = latest ? latest.year : null;
    }
    const yearKey = year != null ? String(year) : null;

    const cities = await City.find().sort({ name: 1 }).select('_id name latitude longitude').lean();
    if (cities.length === 0) {
      return success(res, {
        complexIndicator: { id: complex._id, name: complex.name },
        year,
        labels: [],
        series: [],
      });
    }

    const dataDocs = await Data.find({ indicatorId: { $in: indicatorIds } }).lean();
    const valueMap = new Map();
    for (const d of dataDocs) {
      const y = yearKey && d.values && typeof d.values === 'object' ? d.values[yearKey] : undefined;
      const val = y != null && Number.isFinite(Number(y)) ? Number(y) : null;
      valueMap.set(`${String(d.indicatorId)}-${String(d.cityId)}`, val);
    }

    const labels = cities.map((c) => c.name);
    const series = stacked.map((s, idx) => {
      const ind = s.indicatorId;
      const id = ind._id ?? ind;
      const values = cities.map((c) => valueMap.get(`${String(id)}-${String(c._id)}`) ?? null);
      const color = ind.ranges && ind.ranges[0] && ind.ranges[0].color
        ? ind.ranges[0].color
        : STACK_COLORS[idx % STACK_COLORS.length];
      return {
        indicatorId: id,
        name: ind.name,
        code: ind.code,
        unit: ind.unit || '',
        order: s.order ?? idx,
        color,
        values,
      };
    });

    return success(res, {
      complexIndicator: { id: complex._id, name: complex.name },
      year,
      labels,
      series,
      cities: cities.map((c) => ({ cityId: c._id, name: c.name, latitude: c.latitude, longitude: c.longitude })),
    });
  } catch (e) {
    next(e);
  }
}
