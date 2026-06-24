import { Router } from 'express';
import { OperasionalController } from '../controllers/operasional.controller.js';

const router = Router();

router.get('/', OperasionalController.getWorkOrder);
router.post('/', OperasionalController.saveWorkOrder);

export default router;
