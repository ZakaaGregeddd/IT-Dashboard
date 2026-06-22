import { Router } from 'express';
import { RKAPController } from '../controllers/rkap.controller.js';

const router = Router();

router.get('/', RKAPController.getRKAP);
router.post('/', RKAPController.saveRKAP);

export default router;
