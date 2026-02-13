import Indicator from '../models/Indicator.js';
import Data from '../models/Data.js';
import { success, notFound, error } from '../utils/ApiResponse.js';
import { recalculateRangesForIndicator } from '../services/uploadService.js';

export async function list(req, res, next) {
  try {
    const indicators = await Indicator.find()
      .populate('categoryId', 'name order')
      .sort({ order: 1, code: 1 })
      .lean();
    return success(res, indicators);
  } catch (e) {
    next(e);
  }
}

/** GET /api/indicators/ids-with-data - indicator IDs that have at least one Data document */
export async function idsWithData(req, res, next) {
  try {
    const ids = await Data.distinct('indicatorId');
    return success(res, { indicatorIds: ids.map((id) => id.toString()) });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const { code, name, categoryId, unit, order, numeroCifre, invertScale, rangeMode, ranges } = req.body;
    const codeNum = Number(code);
    if (!Number.isFinite(codeNum) || codeNum < 1 || codeNum > 999) {
      return error(res, 'Codice indicatore deve essere un numero tra 1 e 999', 400);
    }
    const existing = await Indicator.findOne({ code: codeNum });
    if (existing) return error(res, 'Codice indicatore già esistente', 409);

    const doc = await Indicator.create({
      code: codeNum,
      name: String(name).trim(),
      categoryId,
      unit: String(unit || '').trim(),
      order: Number(order) || 0,
      numeroCifre: String(numeroCifre ?? '0').trim(),
      invertScale: Boolean(invertScale),
      rangeMode: rangeMode || 'equalCount',
      ranges: Array.isArray(ranges) ? ranges : [],
    });
    return success(res, doc, 201);
  } catch (e) {
    if (e.name === 'ValidationError') return error(res, e.message, 400);
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const ind = await Indicator.findById(req.params.id).populate('categoryId', 'name order').lean();
    if (!ind) return notFound(res, 'Indicatore');
    return success(res, ind);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const body = { ...req.body };
    if (body.nomeItaliano !== undefined) body.name = body.nomeItaliano;
    if (body.unita !== undefined) body.unit = body.unita;
    if (body.numeroCifre !== undefined) body.numeroCifre = String(body.numeroCifre);
    if (body.code !== undefined) {
      const codeNum = Number(body.code);
      if (!Number.isFinite(codeNum) || codeNum < 1 || codeNum > 999) {
        return error(res, 'Codice indicatore deve essere un numero tra 1 e 999', 400);
      }
      const existing = await Indicator.findOne({ code: codeNum, _id: { $ne: req.params.id } });
      if (existing) return error(res, 'Codice indicatore già usato da un altro indicatore', 409);
      body.code = codeNum;
    }
    const ind = await Indicator.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!ind) return notFound(res, 'Indicatore');
    return success(res, ind);
  } catch (e) {
    if (e.name === 'ValidationError') return error(res, e.message, 400);
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const ind = await Indicator.findByIdAndDelete(req.params.id);
    if (!ind) return notFound(res, 'Indicatore');
    await Data.deleteMany({ indicatorId: ind._id });
    return success(res, { deleted: true });
  } catch (e) {
    next(e);
  }
}

export async function patchRangeMode(req, res, next) {
  try {
    const { rangeMode } = req.body;
    if (!['equalCount', 'equalInterval', 'manual'].includes(rangeMode)) {
      return error(res, 'rangeMode deve essere equalCount, equalInterval o manual', 400);
    }
    const ind = await Indicator.findByIdAndUpdate(
      req.params.id,
      { rangeMode },
      { new: true }
    );
    if (!ind) return notFound(res, 'Indicatore');
    return success(res, ind);
  } catch (e) {
    next(e);
  }
}

export async function patchInvert(req, res, next) {
  try {
    const ind = await Indicator.findById(req.params.id);
    if (!ind) return notFound(res, 'Indicatore');
    ind.invertScale = !ind.invertScale;
    await ind.save();
    return success(res, ind);
  } catch (e) {
    next(e);
  }
}

export async function recalculate(req, res, next) {
  try {
    const ind = await Indicator.findById(req.params.id);
    if (!ind) return notFound(res, 'Indicatore');
    const ranges = await recalculateRangesForIndicator(ind);
    ind.ranges = ranges;
    await ind.save();
    return success(res, ind);
  } catch (e) {
    next(e);
  }
}

/** POST /api/indicators/recalculate-bulk – recalc ranges for many indicators (e.g. after upload). */
export async function recalculateBulk(req, res, next) {
  try {
    const indicatorIds = req.body.indicatorIds || [];
    if (!Array.isArray(indicatorIds) || indicatorIds.length === 0) {
      return success(res, { updated: 0, message: 'Nessun indicatore da ricalcolare' });
    }
    const promises = indicatorIds.map(async (id) => {
      const ind = await Indicator.findById(id);
      if (!ind) return null;
      const ranges = await recalculateRangesForIndicator(ind);
      ind.ranges = ranges;
      await ind.save();
      return id;
    });
    const updated = (await Promise.all(promises)).filter(Boolean);
    return success(res, { updated: updated.length, indicatorIds: updated });
  } catch (e) {
    next(e);
  }
}
