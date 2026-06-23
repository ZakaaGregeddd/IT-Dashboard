import { Router } from 'express';
import { SDMController } from '../controllers/sdm.controller.js';

const router = Router();

router.get('/', SDMController.getSDM);
router.post('/', SDMController.saveSDM);

export default router;
