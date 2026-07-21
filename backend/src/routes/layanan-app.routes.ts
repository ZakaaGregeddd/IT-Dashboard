import { Router } from 'express';
import { LayananAppController } from '../controllers/layanan-app.controller.js';

const router = Router();

router.get('/', LayananAppController.getWorkOrder);
router.post('/', LayananAppController.saveWorkOrder);
router.delete('/', LayananAppController.deleteLayananApp);

export default router;

