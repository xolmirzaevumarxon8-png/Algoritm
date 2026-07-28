import { Router } from 'express';
import { createExam, getTeacherExams, getStudentExams, submitExam, deleteExam } from '../controllers/exams.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Routes for Exams
router.post('/', authenticateToken, createExam);
router.get('/teacher', authenticateToken, getTeacherExams);
router.get('/student/:student_id', authenticateToken, getStudentExams);
router.post('/:id/submit', authenticateToken, submitExam);
router.delete('/:id', authenticateToken, deleteExam);

export default router;
