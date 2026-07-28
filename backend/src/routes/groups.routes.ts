import { Router } from 'express';
import { getGroups, getGroupById, createGroup, updateGroup, deleteGroup, assignStudent, removeStudentFromGroup, updateGroupStage } from '../controllers/groups.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createGroup);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateGroup);
router.patch('/:id/stage', authorizeRoles('ADMIN', 'MANAGER', 'TEACHER'), updateGroupStage);
router.delete('/:id', authorizeRoles('ADMIN'), deleteGroup);
router.post('/:id/students', authorizeRoles('ADMIN', 'MANAGER'), assignStudent);
router.delete('/:id/students/:studentId', authorizeRoles('ADMIN', 'MANAGER'), removeStudentFromGroup);

export default router;
