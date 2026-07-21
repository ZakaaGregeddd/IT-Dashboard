import { Router } from 'express';
import { OperasionalController } from '../controllers/operasional.controller.js';

const router = Router();

router.get('/', OperasionalController.getWorkOrder);
router.post('/', OperasionalController.saveWorkOrder);
router.delete('/', OperasionalController.deleteOperasional);

export default router;

