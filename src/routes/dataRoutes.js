import { Router } from 'express';
import { param, query } from 'express-validator';
import { getByIndicator } from '../controllers/dataController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get(
  '/:indicatorId',
  param('indicatorId').isMongoId().withMessage('indicatorId non valido'),
  query('year').optional().isInt({ min: 1990, max: 2100 }).withMessage('year non valido'),
  validate,
  getByIndicator
);

export default router;
