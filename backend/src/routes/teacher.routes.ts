import { Router } from 'express';
import { saveAttendance, assignHomework } from '../controllers/teacher.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/attendance', authorizeRoles('TEACHER', 'SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), saveAttendance);
router.post('/homework', authorizeRoles('TEACHER', 'SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), assignHomework);

export default router;
