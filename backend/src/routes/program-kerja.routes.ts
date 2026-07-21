import { Router } from 'express';
import { ProgramKerjaController } from '../controllers/program-kerja.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes for program kerja (need login)
//router.get('/', requireAuth, ProgramKerjaController.getProgramKerja);
//router.post('/', requireAuth, ProgramKerjaController.saveProgramKerja);

//alt no login
router.get('/', ProgramKerjaController.getProgramKerja);
router.post('/', ProgramKerjaController.saveProgramKerja);
router.delete('/', ProgramKerjaController.deleteProgramKerja);

export default router;

