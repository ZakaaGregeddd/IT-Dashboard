import { Router } from 'express';
import { UtilisasiStorageDbController } from '../controllers/utilisasi-storage-db.controller.js';

const router = Router();

router.get('/', UtilisasiStorageDbController.getUtilisasi);
router.post('/', UtilisasiStorageDbController.saveUtilisasi);
router.delete('/', UtilisasiStorageDbController.deleteUtilisasi);

export default router;

