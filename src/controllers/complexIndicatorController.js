import ComplexIndicator from '../models/ComplexIndicator.js';
import { success, notFound, error } from '../utils/ApiResponse.js';

export async function list(req, res, next) {
  try {
    const list = await ComplexIndicator.find()
      .populate('stackedIndicators.indicatorId', 'name code unit categoryId')
      .sort({ name: 1 })
      .lean();
    return success(res, list);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const { name, stackedIndicators } = req.body;
    const doc = await ComplexIndicator.create({
      name: String(name).trim(),
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
    const { name, stackedIndicators } = req.body;
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
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
