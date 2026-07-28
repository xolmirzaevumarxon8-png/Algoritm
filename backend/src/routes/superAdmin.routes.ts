import { Router } from 'express';
import { getSuperAdminStats, getDatabaseBackup, getSystemSettings, updateSystemSettings } from '../controllers/superAdmin.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Protect all Super Admin endpoints
router.use(authenticateToken, authorizeRoles('SUPER_ADMIN'));

router.get('/dashboard-stats', getSuperAdminStats);
router.get('/backup', getDatabaseBackup);
router.get('/settings', getSystemSettings);
router.post('/settings', updateSystemSettings);

export default router;
