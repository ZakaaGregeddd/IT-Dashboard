import { Router } from 'express';
import { UtilisasiWanBackupController } from '../controllers/utilisasi-wan-backup.controller.js';

const router = Router();

router.get('/', UtilisasiWanBackupController.getUtilisasi);
router.post('/', UtilisasiWanBackupController.saveUtilisasi);
router.delete('/', UtilisasiWanBackupController.deleteUtilisasi);

export default router;

