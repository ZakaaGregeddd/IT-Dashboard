import { Router } from 'express';
import { KetersediaanScmcController } from '../controllers/ketersediaan-scmc.controller.js';

const router = Router();

router.get('/', KetersediaanScmcController.getKetersediaan);
router.post('/', KetersediaanScmcController.saveKetersediaan);

export default router;
