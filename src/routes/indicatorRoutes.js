import { Router } from 'express';
import { body, param } from 'express-validator';
import * as indicatorController from '../controllers/indicatorController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/', indicatorController.list);
router.get('/ids-with-data', indicatorController.idsWithData);
router.post(
  '/',
  [
    body('code').isInt({ min: 1, max: 999 }).withMessage('Codice deve essere tra 1 e 999'),
    body('name').trim().notEmpty().withMessage('Nome indicatore obbligatorio'),
    body('categoryId').isMongoId().withMessage('categoryId non valido'),
    body('unit').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('invertScale').optional().isBoolean(),
    body('rangeMode').optional().isIn(['equalCount', 'equalInterval', 'manual']),
  ],
  validate,
  indicatorController.create
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  indicatorController.getOne
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID non valido'),
    body('code').optional().isInt({ min: 1, max: 999 }),
    body('name').optional().trim().notEmpty(),
    body('categoryId').optional().isMongoId(),
    body('unit').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('invertScale').optional().isBoolean(),
    body('rangeMode').optional().isIn(['equalCount', 'equalInterval', 'manual']),
    body('ranges').optional().isArray(),
  ],
  validate,
  indicatorController.update
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  indicatorController.remove
);

router.patch(
  '/:id/range-mode',
  [
    param('id').isMongoId().withMessage('ID non valido'),
    body('rangeMode').isIn(['equalCount', 'equalInterval', 'manual']).withMessage('rangeMode non valido'),
  ],
  validate,
  indicatorController.patchRangeMode
);

router.patch(
  '/:id/invert',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  indicatorController.patchInvert
);

router.post(
  '/:id/recalculate',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  indicatorController.recalculate
);

export default router;
