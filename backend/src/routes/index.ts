import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import fileRoutes from './file.routes.js';
import programKerjaRoutes from './program-kerja.routes.js';
import rkapRoutes from './rkap.routes.js';
import sdmRoutes from './sdm.routes.js';
import ketersediaanScmcRoutes from './ketersediaan-scmc.routes.js';
import ketersediaanSistemRoutes from './ketersediaan-sistem.routes.js';
import utilisasiCpuRoutes from './utilisasi-cpu.routes.js';
import utilisasiMemoryRoutes from './utilisasi-memory.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);
router.use('/program-kerja', programKerjaRoutes);
router.use('/rkap', rkapRoutes);
router.use('/sdm', sdmRoutes);
router.use('/ketersediaan/scmc', ketersediaanScmcRoutes);
router.use('/ketersediaan/sistem', ketersediaanSistemRoutes);
router.use('/utilisasi/cpu', utilisasiCpuRoutes);
router.use('/utilisasi/memory', utilisasiMemoryRoutes);

export default router;
