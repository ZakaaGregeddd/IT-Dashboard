import { Router } from 'express';
import { UtilisasiBandwidthController } from '../controllers/utilisasi-bandwidth.controller.js';

const router = Router();

router.get('/', UtilisasiBandwidthController.getUtilisasi);
router.post('/', UtilisasiBandwidthController.saveUtilisasi);
router.delete('/', UtilisasiBandwidthController.deleteUtilisasi);

export default router;

