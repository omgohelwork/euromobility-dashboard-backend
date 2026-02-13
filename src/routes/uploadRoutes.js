import { Router } from 'express';
import multer from 'multer';
import { upload } from '../controllers/uploadController.js';

const router = Router();

const storage = multer.memoryStorage();
const uploadMw = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', uploadMw.array('files', 50), upload);

export default router;
