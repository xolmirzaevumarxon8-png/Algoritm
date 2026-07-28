import { Router } from 'express';
import { getDirectorDashboard } from '../controllers/director.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authorizeRoles('DIRECTOR', 'SUPER_ADMIN'), getDirectorDashboard);

export default router;
