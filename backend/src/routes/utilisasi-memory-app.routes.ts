import { Router } from 'express';
import { UtilisasiMemoryAppController } from '../controllers/utilisasi-memory-app.controller.js';

const router = Router();

router.get('/', UtilisasiMemoryAppController.getUtilisasi);
router.post('/', UtilisasiMemoryAppController.saveUtilisasi);
router.delete('/', UtilisasiMemoryAppController.deleteUtilisasi);

export default router;

