import { Router } from 'express';
import { getTeachers, createTeacherProfile, updateTeacherKPI, deleteTeacher } from '../controllers/teachers.controller';
import { exportTeachers, importTeachers } from '../controllers/teachersImportExport.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/export', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), exportTeachers);
router.post('/import', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), upload.single('file'), importTeachers);
router.get('/', getTeachers);
router.post('/', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), createTeacherProfile);
router.put('/:id/kpi', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), updateTeacherKPI);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), deleteTeacher);

export default router;
