import Indicator from '../models/Indicator.js';
import Data from '../models/Data.js';
import { success, notFound, error } from '../utils/ApiResponse.js';
import { recalculateRangesForIndicator, recalculateRangesForIndicatorByValue } from '../services/uploadService.js';

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

    const orderNum = Number(order) ?? 0;
    const orderConflict = await Indicator.findOne({ categoryId, order: orderNum });
    if (orderConflict) return error(res, "L'ordine deve essere univoco nella stessa categoria: un altro indicatore ha già questo ordine.", 409);

    const doc = await Indicator.create({
      code: codeNum,
      name: String(name).trim(),
      categoryId,
      unit: String(unit || '').trim(),
      order: orderNum,
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

/** GET /api/indicators/:id/upload-hint – id, code, name and filename format for admin "view indicator id/prefix" (read-only). */
export async function getUploadHint(req, res, next) {
  try {
    const ind = await Indicator.findById(req.params.id).select('_id code name').lean();
    if (!ind) return notFound(res, 'Indicatore');
    const codePadded = String(ind.code).padStart(3, '0');
    return success(res, {
      id: ind._id,
      code: ind.code,
      name: ind.name,
      filenameHint: `${codePadded} - NomeFile.csv`,
      filenameExample: `${codePadded} - ${(ind.name || 'Nome').replace(/[<>:"/\\|?*]/g, '').slice(0, 30)}.csv`,
    });
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
    if (body.order !== undefined) {
      const orderNum = Number(body.order);
      const categoryIdForOrder = body.categoryId != null ? body.categoryId : (await Indicator.findById(req.params.id).select('categoryId').lean())?.categoryId;
      if (categoryIdForOrder) {
        const orderConflict = await Indicator.findOne({
          categoryId: categoryIdForOrder,
          order: orderNum,
          _id: { $ne: req.params.id },
        });
        if (orderConflict) return error(res, "L'ordine deve essere univoco nella stessa categoria: un altro indicatore ha già questo ordine.", 409);
      }
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

/** POST /api/indicators/:id/recalculate-by-value – recalc ranges using value-based quartile logic (max-min)/4. */
export async function recalculateByValue(req, res, next) {
  try {
    const ind = await Indicator.findById(req.params.id);
    if (!ind) return notFound(res, 'Indicatore');
    const ranges = await recalculateRangesForIndicatorByValue(ind);
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

/** POST /api/indicators/recalculate-all – recalc ranges for all indicators that have data. */
export async function recalculateAll(req, res, next) {
  try {
    const indicatorIds = await Data.distinct('indicatorId');
    if (indicatorIds.length === 0) {
      return success(res, { updated: 0, message: 'Nessun indicatore con dati da ricalcolare' });
    }
    let updated = 0;
    for (const id of indicatorIds) {
      const ind = await Indicator.findById(id);
      if (!ind) continue;
      const ranges = await recalculateRangesForIndicator(ind);
      ind.ranges = ranges;
      await ind.save();
      updated++;
    }
    return success(res, { updated, message: `Ranges ricalcolati per ${updated} indicatori` });
  } catch (e) {
    next(e);
  }
}

/** POST /api/indicators/recalculate-by-value-all – recalc ranges by value (quartile logic) for all indicators that have data. */
export async function recalculateByValueAll(req, res, next) {
  try {
    const indicatorIds = await Data.distinct('indicatorId');
    if (indicatorIds.length === 0) {
      return success(res, { updated: 0, message: 'Nessun indicatore con dati da ricalcolare' });
    }
    let updated = 0;
    for (const id of indicatorIds) {
      const ind = await Indicator.findById(id);
      if (!ind) continue;
      const ranges = await recalculateRangesForIndicatorByValue(ind);
      ind.ranges = ranges;
      await ind.save();
      updated++;
    }
    return success(res, { updated, message: `Ranges (per valore) ricalcolati per ${updated} indicatori` });
  } catch (e) {
    next(e);
  }
}
