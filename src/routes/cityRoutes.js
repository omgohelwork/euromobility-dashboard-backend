import { Router } from 'express';
import multer from 'multer';
import { body, param } from 'express-validator';
import { list, bulkUpload, uploadFile, updateOne, deleteOne } from '../controllers/cityController.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
const storage = multer.memoryStorage();
const uploadMw = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', list);

router.post('/upload', uploadMw.single('file'), uploadFile);

router.post(
  '/bulk',
  [
    body('cities').isArray().withMessage('cities deve essere un array'),
    body('cities.*.name').trim().notEmpty().withMessage('Nome città obbligatorio'),
    body('cities.*.latitude').isFloat().withMessage('Latitudine non valida'),
    body('cities.*.longitude').isFloat().withMessage('Longitudine non valida'),
  ],
  validate,
  bulkUpload
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID non valido'),
    body('name').optional().trim().notEmpty(),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
  ],
  validate,
  updateOne
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('ID non valido'),
  validate,
  deleteOne
);

export default router;
