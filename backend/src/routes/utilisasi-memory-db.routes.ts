import { Router } from 'express';
import { UtilisasiMemoryDbController } from '../controllers/utilisasi-memory-db.controller.js';

const router = Router();

router.get('/', UtilisasiMemoryDbController.getUtilisasi);
router.post('/', UtilisasiMemoryDbController.saveUtilisasi);

export default router;
