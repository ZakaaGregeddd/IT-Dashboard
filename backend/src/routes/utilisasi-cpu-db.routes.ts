import { Router } from 'express';
import { UtilisasiCpuDbController } from '../controllers/utilisasi-cpu-db.controller.js';

const router = Router();

router.get('/', UtilisasiCpuDbController.getUtilisasi);
router.post('/', UtilisasiCpuDbController.saveUtilisasi);

export default router;
