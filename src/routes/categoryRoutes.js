import { Router } from 'express';
import { body, param } from 'express-validator';
import * as categoryController from '../controllers/categoryController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/', categoryController.list);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome categoria obbligatorio'),
    body('order').optional().isInt({ min: 0 }).withMessage('Ordine deve essere un numero intero'),
  ],
  validate,
  categoryController.create
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  categoryController.getOne
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID non valido'),
    body('name').optional().trim().notEmpty().withMessage('Nome non vuoto'),
    body('order').optional().isInt({ min: 0 }).withMessage('Ordine deve essere un numero intero'),
  ],
  validate,
  categoryController.update
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  categoryController.remove
);

export default router;
