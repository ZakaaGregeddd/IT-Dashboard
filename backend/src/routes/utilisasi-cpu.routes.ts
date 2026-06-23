import { Router } from 'express';
import { UtilisasiCpuController } from '../controllers/utilisasi-cpu.controller.js';

const router = Router();

router.get('/', UtilisasiCpuController.getUtilisasi);
router.post('/', UtilisasiCpuController.saveUtilisasi);

export default router;
