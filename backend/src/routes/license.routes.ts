import { Router } from 'express';
import { LicenseController } from '../controllers/license.controller.js';

const router = Router();

router.get('/', LicenseController.getLicenses);
router.post('/', LicenseController.saveLicenses);
router.delete('/', LicenseController.deleteLicenses);

export default router;

