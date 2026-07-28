import { Router } from 'express';
import { getAdmins, createAdmin } from '../controllers/admins.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authorizeRoles('SUPER_ADMIN', 'DIRECTOR'), getAdmins);
router.post('/', authorizeRoles('SUPER_ADMIN'), createAdmin);

export default router;
