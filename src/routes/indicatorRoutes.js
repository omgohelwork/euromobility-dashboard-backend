import { Router } from 'express';
import { body, param } from 'express-validator';
import * as indicatorController from '../controllers/indicatorController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/', indicatorController.list);
router.get('/ids-with-data', indicatorController.idsWithData);
router.post(
  '/recalculate-bulk',
  [body('indicatorIds').isArray().withMessage('indicatorIds deve essere un array'), body('indicatorIds.*').isMongoId().withMessage('ID indicatore non valido')],
  validate,
  indicatorController.recalculateBulk
);
router.post('/recalculate-all', indicatorController.recalculateAll);
router.post('/recalculate-by-value-all', indicatorController.recalculateByValueAll);
router.post(
  '/',
  [
    body('code').isInt({ min: 1, max: 999 }).withMessage('Codice deve essere tra 1 e 999'),
    body('name').trim().notEmpty().withMessage('Nome indicatore obbligatorio'),
    body('categoryId').isMongoId().withMessage('categoryId non valido'),
    body('unit').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('numero_di_decimali').optional().isInt({ min: 0, max: 2 }).withMessage('numero_di_decimali deve essere 0, 1 o 2'),
    body('invertScale').optional().isBoolean(),
    body('rangeMode').optional().isIn(['equalCount', 'equalInterval', 'manual']),
  ],
  validate,
  indicatorController.create
);

router.get(
  '/:id/upload-hint',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  indicatorController.getUploadHint
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
    body('numero_di_decimali').optional().isInt({ min: 0, max: 2 }).withMessage('numero_di_decimali deve essere 0, 1 o 2'),
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
router.post(
  '/:id/recalculate-by-value',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  indicatorController.recalculateByValue
);

export default router;
