import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import fileRoutes from './file.routes.js';
import programKerjaRoutes from './program-kerja.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);
router.use('/program-kerja', programKerjaRoutes);

export default router;
