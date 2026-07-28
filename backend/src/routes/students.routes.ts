import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, transferStudent, getStudentHomework, getParentChildren, getStudentAttendance, getStudentDashboardStats, getStudentNotifications, submitHomework, getStudentPayments, getStudentLeaderboard, getStudentWeeklySchedule } from '../controllers/students.controller';
import { exportStudents, importStudents } from '../controllers/importExport.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/homework', authorizeRoles('STUDENT'), getStudentHomework);
router.post('/homework/:id/submit', authorizeRoles('STUDENT'), submitHomework);
router.get('/attendance', authorizeRoles('STUDENT'), getStudentAttendance);
router.get('/dashboard-stats', authorizeRoles('STUDENT'), getStudentDashboardStats);
router.get('/notifications', authorizeRoles('STUDENT'), getStudentNotifications);
router.get('/payments', authorizeRoles('STUDENT'), getStudentPayments);
router.get('/leaderboard', authorizeRoles('STUDENT'), getStudentLeaderboard);
router.get('/schedule', authorizeRoles('STUDENT'), getStudentWeeklySchedule);
router.get('/parent/children', authorizeRoles('PARENT'), getParentChildren);
router.get('/export', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'MANAGER'), exportStudents);
router.post('/import', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'MANAGER'), upload.single('file'), importStudents);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'MANAGER'), createStudent);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'MANAGER'), updateStudent);
router.put('/:id/transfer', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'MANAGER'), transferStudent);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'MANAGER'), deleteStudent);

export default router;
