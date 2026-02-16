import { Router } from 'express';
import { body } from 'express-validator';
import { get, update } from '../controllers/methodologyController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', get);
const methodologyUpdateValidation = [
  body('content').optional().isString().withMessage('content deve essere una stringa'),
];
router.put('/', requireAuth, methodologyUpdateValidation, validate, update);
router.patch('/', requireAuth, methodologyUpdateValidation, validate, update);

export default router;
