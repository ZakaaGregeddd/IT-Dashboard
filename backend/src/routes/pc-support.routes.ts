import { Router } from 'express';
import { PcSupportController } from '../controllers/pc-support.controller.js';

const router = Router();

router.get('/', PcSupportController.getWorkOrder);
router.post('/', PcSupportController.saveWorkOrder);
router.delete('/', PcSupportController.deletePcSupport);

export default router;

