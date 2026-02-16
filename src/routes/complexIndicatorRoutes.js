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
    body('order').optional().isInt({ min: 1 }).withMessage('order deve essere intero >= 1'),
    body('stackedIndicators').optional().isArray(),
    body('stackedIndicators.*.indicatorId').optional().isMongoId(),
    body('stackedIndicators.*.order').optional().isInt({ min: 0 }),
  ],
  validate,
  complexIndicatorController.create
);

router.get(
  '/:id/stack-data',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  complexIndicatorController.getStackData
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
    body('order').optional().isInt({ min: 1 }).withMessage('order deve essere intero >= 1'),
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
