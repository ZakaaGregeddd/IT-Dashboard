import { Router } from 'express';
import { RestoreController } from '../controllers/restore.controller.js';

const router = Router();

router.get('/', RestoreController.getWorkOrder);
router.post('/', RestoreController.saveWorkOrder);

export default router;
