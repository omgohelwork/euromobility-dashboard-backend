import { Router } from 'express';
import { param } from 'express-validator';
import { getByIndicator } from '../controllers/dataController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get(
  '/:indicatorId',
  param('indicatorId').isMongoId().withMessage('indicatorId non valido'),
  validate,
  getByIndicator
);

export default router;
