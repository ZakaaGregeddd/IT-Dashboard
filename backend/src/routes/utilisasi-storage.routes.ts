import { Router } from 'express';
import { UtilisasiStorageController } from '../controllers/utilisasi-storage.controller.js';

const router = Router();

router.get('/', UtilisasiStorageController.getUtilisasi);
router.post('/', UtilisasiStorageController.saveUtilisasi);
router.delete('/', UtilisasiStorageController.deleteUtilisasi);

export default router;

