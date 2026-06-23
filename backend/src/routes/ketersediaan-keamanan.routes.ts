import { Router } from 'express';
import { KetersediaanKeamananController } from '../controllers/ketersediaan-keamanan.controller.js';

const router = Router();

router.get('/', KetersediaanKeamananController.getKetersediaan);
router.post('/', KetersediaanKeamananController.saveKetersediaan);

export default router;
