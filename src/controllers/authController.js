import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { success, error } from '../utils/ApiResponse.js';
import { JWT_SECRET } from '../middlewares/authMiddleware.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { success, data: { token, admin: { id, username } } }
 */
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: String(username).trim().toLowerCase() }).select('+password').lean();
    if (!admin) {
      return error(res, 'Username o password non validi', 401);
    }
    const match = await bcrypt.compare(String(password), admin.password);
    if (!match) {
      return error(res, 'Username o password non validi', 401);
    }
    const token = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return success(res, {
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/auth/change-password
 * Requires Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 * Returns: { success, data: { message } }
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return error(res, 'Utente non trovato', 401);
    }
    const match = await admin.comparePassword(String(currentPassword));
    if (!match) {
      return error(res, 'Password attuale non corretta', 400);
    }
    const hashed = await bcrypt.hash(String(newPassword), 10);
    admin.password = hashed;
    await admin.save();
    return success(res, { message: 'Password aggiornata' });
  } catch (e) {
    next(e);
  }
}
