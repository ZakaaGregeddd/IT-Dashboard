import { Router } from 'express';
import { UtilisasiCpuAppController } from '../controllers/utilisasi-cpu-app.controller.js';

const router = Router();

router.get('/', UtilisasiCpuAppController.getUtilisasi);
router.post('/', UtilisasiCpuAppController.saveUtilisasi);
router.delete('/', UtilisasiCpuAppController.deleteUtilisasi);

export default router;

