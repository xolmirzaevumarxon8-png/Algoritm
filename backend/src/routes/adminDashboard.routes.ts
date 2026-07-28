import { Router } from 'express';
import { getAdminDashboardStats } from '../controllers/adminDashboard.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), getAdminDashboardStats);

export default router;
