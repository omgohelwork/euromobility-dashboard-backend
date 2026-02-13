import { Router } from 'express';
import { param, body } from 'express-validator';
import * as yearController from '../controllers/yearController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/', yearController.list);

router.patch(
  '/:year',
  [
    param('year').isInt({ min: 1990, max: 2100 }).withMessage('Anno non valido'),
    body('enabled').isBoolean().withMessage('enabled deve essere true o false'),
  ],
  validate,
  yearController.patch
);

router.delete(
  '/:year/data',
  param('year').isInt({ min: 1990, max: 2100 }).withMessage('Anno non valido'),
  validate,
  yearController.deleteYearData
);

export default router;
