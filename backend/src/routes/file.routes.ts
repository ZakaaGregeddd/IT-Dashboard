import { Router } from 'express';
import { FileController } from '../controllers/file.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

// Protect all file routes for Authenticated users (USER and ADMIN)
router.use(requireAuth);

router.get('/', FileController.listAllFiles);
router.post('/', uploadMiddleware.single('file'), FileController.uploadFile);
router.get('/:id', FileController.getFileMetadata);
router.get('/:id/download', FileController.downloadFile);
router.delete('/:id', FileController.deleteFile);

export default router;
