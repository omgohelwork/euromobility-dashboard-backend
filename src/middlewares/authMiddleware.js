import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { error } from '../utils/ApiResponse.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'dashboard-admin-secret-change-in-production';

/**
 * Verify JWT and attach req.admin. Use for protected routes (e.g. change-password).
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token mancante o non valido', 401);
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('_id username').lean();
    if (!admin) {
      return error(res, 'Utente non trovato', 401);
    }
    req.admin = admin;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return error(res, 'Token non valido o scaduto', 401);
    }
    next(e);
  }
}

export { JWT_SECRET };
