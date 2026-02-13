import { Router } from 'express';
import { body, param } from 'express-validator';
import * as complexIndicatorController from '../controllers/complexIndicatorController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/', complexIndicatorController.list);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome obbligatorio'),
    body('stackedIndicators').optional().isArray(),
    body('stackedIndicators.*.indicatorId').optional().isMongoId(),
    body('stackedIndicators.*.order').optional().isInt({ min: 0 }),
  ],
  validate,
  complexIndicatorController.create
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  complexIndicatorController.getOne
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID non valido'),
    body('name').optional().trim().notEmpty(),
    body('stackedIndicators').optional().isArray(),
  ],
  validate,
  complexIndicatorController.update
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  complexIndicatorController.remove
);

export default router;
