import { Router } from 'express';
import { UtilisasiMemoryController } from '../controllers/utilisasi-memory.controller.js';

const router = Router();

router.get('/', UtilisasiMemoryController.getUtilisasi);
router.post('/', UtilisasiMemoryController.saveUtilisasi);
router.delete('/', UtilisasiMemoryController.deleteUtilisasi);

export default router;

