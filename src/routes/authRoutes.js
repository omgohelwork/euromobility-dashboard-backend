import { Router } from 'express';
import { body } from 'express-validator';
import { login, changePassword } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username obbligatorio'),
    body('password').notEmpty().withMessage('Password obbligatoria'),
  ],
  validate,
  login
);

router.patch(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Password attuale obbligatoria'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nuova password deve avere almeno 8 caratteri')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La nuova password deve contenere maiuscola, minuscola, numero e carattere speciale (@$!%*?&)'),
  ],
  validate,
  changePassword
);

export default router;
