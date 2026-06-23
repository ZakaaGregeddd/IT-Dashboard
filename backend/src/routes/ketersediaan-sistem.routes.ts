import { Router } from 'express';
import { KetersediaanSistemController } from '../controllers/ketersediaan-sistem.controller.js';

const router = Router();

router.get('/', KetersediaanSistemController.getKetersediaan);
router.post('/', KetersediaanSistemController.saveKetersediaan);

export default router;
