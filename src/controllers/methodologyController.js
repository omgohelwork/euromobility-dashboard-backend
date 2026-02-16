import Methodology from '../models/Methodology.js';
import { success, error } from '../utils/ApiResponse.js';

/**
 * GET /api/methodology – contenuto per il popup (pubblico).
 */
export async function get(req, res, next) {
  try {
    let doc = await Methodology.findOne().lean();
    if (!doc) {
      doc = await Methodology.create({ content: '' });
      doc = doc.toObject();
    }
    return success(res, { content: doc.content || '' });
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/methodology – aggiorna contenuto (admin, con token).
 * Body: { content: "<p>...</p>" }
 */
export async function update(req, res, next) {
  try {
    const { content } = req.body;
    const html = typeof content === 'string' ? content : '';
    let doc = await Methodology.findOne();
    if (!doc) {
      doc = await Methodology.create({ content: html });
    } else {
      doc.content = html;
      await doc.save();
    }
    return success(res, { content: doc.content });
  } catch (e) {
    next(e);
  }
}
